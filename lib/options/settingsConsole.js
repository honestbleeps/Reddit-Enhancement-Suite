/* @flow */

import _ from 'lodash';
import { markdown } from 'snudown-js';
import { flow, filter, groupBy, sortBy } from 'lodash/fp';
import * as Metadata from '../core/metadata';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import { $ } from '../vendor';
import {
	Alert,
	CreateElement,
	NAMED_KEYS,
	caseBuilder,
	downcast,
	EdgeScroll,
	escapeHTML,
	frameThrottle,
	niceKeyCode,
	watchForDescendants,
} from '../utils';
import { context, i18n, Permissions } from '../environment';
import * as About from '../modules/about';
import { showNotification } from '../modules/notifications';
import * as SettingsNavigation from '../modules/settingsNavigation';
import * as Search from '../modules/search';
import { consoleContainerTemplate, moduleSelectorTemplate } from './templates';

const DEFAULT_MODULE = About.module;
const CATEGORY_SORT = [
	'aboutCategory',
	'myAccountCategory',
	'usersCategory',
	'commentsCategory',
	'submissionsCategory',
	'subredditsCategory',
	'appearanceCategory',
	'browsingCategory',
	'productivityCategory',
	'coreCategory',
];

let $keyCodeModal, RESConsoleContainer, $moduleOptionsScrim, saveButton, moduleToggle,
	captureKey, captureKeyID, currentModule;

let RESConsoleContent, RESConfigPanelOptions;

export function start() {
	create();

	window.addEventListener('hashchange', loadFromHash);

	window.addEventListener('message', ({ data }) => {
		if (data.close) {
			close();
		} else if (load) {
			const { moduleID, optionKey } = data.load;
			load(moduleID, optionKey);
		}
	});

	loadFromHash();

	// Update all relative links to refer to Reddit
	watchForDescendants(document.body, 'a', e => {
		const a = downcast(e, HTMLAnchorElement);
		if (SettingsNavigation.isSettingsUrl(a.href)) return;
		a.href = new URL(e.getAttribute('href'), context.origin).href;
		// Redirect the top frame if not opening new tab
		if (!a.target.includes('_blank')) a.target += ' _parent';
	});
}

function loadFromHash() {
	const { moduleID, optionKey } = SettingsNavigation.parseHash(location.hash);
	load(moduleID, optionKey);
}

function load(moduleID, optionKey) {
	const mod = (
		(moduleID && (
			Modules.getUnchecked(moduleID) ||
			Modules.getByCategory(moduleID)[0]
		)) ||
		DEFAULT_MODULE
	);

	if (mod !== currentModule) {
		currentModule = mod;
		drawConfigOptions(mod);
		updateSelectedModule(mod);
		RESConsoleContent.scrollTop = 0;
	}

	if (optionKey && mod.options.hasOwnProperty(optionKey)) {
		highlightOption(optionKey);
	}

	if (mod === Search.module) {
		Search.search(optionKey);
		Search.input().focus();
	} else {
		Search.input().blur();
	}

	SettingsNavigation.setHash(SettingsNavigation.makeUrlHash(moduleID, optionKey));
}

function highlightOption(optionKey) {
	const $optionsPanel = $(RESConsoleContent);
	const optionElement = $optionsPanel.find(`label[for="${optionKey}"]`);
	const optionParent = optionElement.parent();
	optionParent.addClass('highlight');
	optionParent.show();
	if (optionElement.length) {
		if (optionParent.hasClass('advanced') && !SettingsNavigation.module.options.showAllOptions.value) {
			document.getElementById('RESConsoleContent').classList.remove('advanced-options-disabled');
			if (SettingsNavigation.module.options.showAllOptionsAlert.value) {
				Alert.open('You opened a link to an advanced option, but not all options are shown. These options will be shown until you leave or refresh the page. If you want to see all options in the future, check the <i>Show all options</i> checkbox in the settings console title bar above.<br /><br /><label><input type="checkbox" class="disableAlert" checked="" style="margin:1px 5px 0px 0px;"> Always show this type of notification</label>');
				$('#alert_message .disableAlert').click(function() {
					Options.set(SettingsNavigation.module, 'showAllOptionsAlert', this.checked);
				});
			}
		}
		const $configPanel = $(RESConfigPanelOptions);
		const offset = optionElement.offset().top - $configPanel.offset().top - 10;
		$configPanel.scrollTop(offset);
	}
}

function create() {
	// create the console container
	RESConsoleContainer = consoleContainerTemplate({
		name: Metadata.name,
		version: Metadata.version,
		gitDescription: Metadata.gitDescription,
	});

	document.body.append(RESConsoleContainer);

	document.querySelector('.res-logo').focus();

	const RESClose = RESConsoleContainer.querySelector('#RESClose');
	RESClose.addEventListener('click', (e: Event) => {
		e.preventDefault();
		close();
	}, true);

	const RESAdvOptionsSpan = RESConsoleContainer.querySelector('#RESAllOptionsSpan');
	RESAdvOptionsSpan.setAttribute('title', i18n(SettingsNavigation.module.options.showAllOptions.description));

	const RESAdvOptions: HTMLInputElement = (RESAdvOptionsSpan.querySelector('input'): any);
	RESAdvOptions.addEventListener('change', function() {
		Options.set(SettingsNavigation, 'showAllOptions', this.checked);
		updateAdvancedOptionsVisibility();
	}, true);

	// create the menu
	RESConsoleContainer.querySelector('#RESConfigPanelModulesList').appendChild(renderModulesSelector());

	$(RESConsoleContainer).find('#RESConfigPanelModulesPane')
		.on('click', '.moduleButton', function(e: Event) {
			const id = $(this).data('module');
			if (id) {
				e.preventDefault();
				load(id);
			}
		})
		.on('click', '.categoryButton', function(e: Event) {
			const id = $(this).data('category');
			if (id) {
				e.preventDefault();
				openCategoryPanel(id);
			}
		});

	RESConsoleContent = RESConsoleContainer.querySelector('#RESConsoleContent');
	if (SettingsNavigation.module.options.showAllOptions.value) {
		RESAdvOptions.checked = true;
	} else {
		RESConsoleContent.classList.add('advanced-options-disabled');
	}
	RESConfigPanelOptions = RESConsoleContainer.querySelector('#RESConfigPanelOptions');

	$(RESConsoleContainer).find('#SearchRES-input-container').append(Search.input());
	const search = () => load(Search.module.moduleID, Search.input().value);
	Search.input().addEventListener('input', frameThrottle(search));
	Search.input().addEventListener('click', search);

	// Okay, the console is done. Add it to the document body.
	document.body.appendChild(RESConsoleContainer);

	window.addEventListener('keydown', e => {
		if (captureKey && ![NAMED_KEYS.Shift, NAMED_KEYS.Control, NAMED_KEYS.Alt].includes(e.key)) {
			// capture the key, display something nice for it, and then close the popup...
			e.preventDefault();
			let keyArray;
			if (e.key === NAMED_KEYS.Backspace) { // we disable the shortcut
				keyArray = [-1, false, false, false, false];
			} else {
				keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
			}
			// not using .getElementById here due to a collision with reddit's elements (i.e. #modmail)
			((RESConfigPanelOptions.querySelector(`[id="${captureKeyID}"]`): any): HTMLInputElement).value = keyArray.join(',');
			((RESConfigPanelOptions.querySelector(`[id="${captureKeyID}-display"]`): any): HTMLInputElement).value = niceKeyCode(keyArray);
			$keyCodeModal.css('display', 'none');
			captureKey = false;
		}
	});

	$(RESConsoleContent).on({
		focus(e) {
			// show dialog box to grab keycode, but display something nice...
			const $target = $(e.target);
			const { top, left } = $target.offset();
			$keyCodeModal.css({
				display: 'block',
				top: top + $target.height(),
				left,
			});
			captureKey = true;
			captureKeyID = $target.attr('capturefor');
		},
		blur() {
			$keyCodeModal.css('display', 'none');
		},
	}, '.keycode + input[type=text][displayonly]');

	$keyCodeModal = $('<div>', {
		id: 'keyCodeModal',
		text: 'Press a key (or combination with shift, alt and/or ctrl) to assign this action.',
	});

	$keyCodeModal.appendTo(document.body);

	drawSettingsConsole();
}

function renderModulesSelector() {
	function compareModules(a, b) {
		if (a.sort === b.sort) {
			return i18n(a.moduleName).toLocaleLowerCase().localeCompare(i18n(b.moduleName).toLocaleLowerCase());
		} else {
			return (a.sort || 0) - (b.sort || 0);
		}
	}

	const categories = flow(
		() => Modules.all(),
		filter(mod => !mod.hidden),
		groupBy(mod => mod.category),
		obj => Object.entries(obj).map(([category, modules]) => ({
			name: category,
			translatedName: i18n(category),
			modules: modules
				.sort(compareModules)
				.map(mod => {
					const description = $(`<p>${mod.descriptionRaw ? mod.description : markdown(i18n(mod.description))}</p>`).text().replace(/\s+/g, ' ');

					return {
						moduleID: mod.moduleID,
						translatedName: i18n(mod.moduleName),
						description,
						shortDescription: description.split(/[!?.]/)[0],
						isEnabled: Modules.isEnabled(mod),
					};
				}),
		})),
		sortBy(({ name }) => CATEGORY_SORT.indexOf(name))
	)();

	return moduleSelectorTemplate(categories);
}

function updateSelectedModule(mod) {
	const items = $(RESConsoleContainer).find('.moduleButton');

	const selected = items.filter(function() {
		return $(this).data('module') === mod.moduleID;
	});

	items.not(selected).removeClass('active');
	selected.addClass('active');

	openCategoryPanel(mod.category);
}

function drawOptionInput(mod, optionName, optionObject, isTable) {
	let $thisOptionFormEle;
	switch (optionObject.type) {
		case 'textarea':
			// textarea...
			$thisOptionFormEle = $('<textarea>', {
				id: optionName,
				type: 'textarea',
				moduleID: mod.moduleID,
				// this is typed user input and therefore safe, we allow HTML for a few settings.
				html: escapeHTML(optionObject.value),
			});
			break;
		case 'list':
		case 'text':
			// text...
			$thisOptionFormEle = $('<input>', {
				id: optionName,
				type: 'text',
				moduleID: mod.moduleID,
			});
			if (typeof optionObject.value !== 'undefined') {
				$thisOptionFormEle.attr('value', optionObject.value);
			}
			break;
		case 'color':
			// color...
			$thisOptionFormEle = $('<input>', {
				id: optionName,
				type: 'color',
				moduleID: mod.moduleID,
			});
			// thisOptionFormEle.setAttribute('value', optionObject.value); // didn't work on chrome, need to work with .value
			if (typeof optionObject.value !== 'undefined') {
				(($thisOptionFormEle.get(0): any): HTMLInputElement).value = optionObject.value;
			}
			break;
		case 'button':
			// button...
			const { values = [], callback, text } = optionObject;
			if (callback && text) values.push({ callback, text });
			const buttonsContainer = $thisOptionFormEle = $('<div>', { id: optionName });
			for (const option of values) {
				let $thisOptionFormEle;
				if (typeof option.callback === 'string' || option.callback.moduleID) {
					$thisOptionFormEle = $('<a>');
				} else { // if (typeof optionObject.callback === 'function') {
					$thisOptionFormEle = $('<button>');
				}
				$thisOptionFormEle.addClass('RESConsoleButton');
				$thisOptionFormEle.attr('moduleID', mod.moduleID);
				if (option.text.tagName || option.text.jquery) {
					$thisOptionFormEle.append(option.text);
				} else if (typeof option.text === 'string') {
					$thisOptionFormEle.text(i18n(option.text));
				} else {
					$thisOptionFormEle.append(CreateElement.icon(0xF141));
				}
				if (option.callback.moduleID) {
					$thisOptionFormEle.attr('href', SettingsNavigation.makeUrlHash(option.callback.moduleID, option.callback.optionKey));
				} else if (typeof option.callback === 'string') {
					$thisOptionFormEle.attr('href', option.callback);
					$thisOptionFormEle.attr('target', '_blank');
					$thisOptionFormEle.attr('rel', 'noopener noreferer');
				} else if (typeof option.callback === 'function') {
					$thisOptionFormEle.click(async function() {
						if (this.classList.contains('csspinner')) return;
						this.classList.add('csspinner');
						try {
							await option.callback(optionName, optionObject);
						} catch (e) {
							if (e.message) Alert.open(e.message);
							console.error(e);
						}
						this.classList.remove('csspinner');
					});
				}
				buttonsContainer.append($thisOptionFormEle);
			}
			break;
		case 'password':
			// password...
			$thisOptionFormEle = $('<input>', {
				id: optionName,
				type: 'password',
				moduleID: mod.moduleID,
			});
			if (typeof optionObject.value !== 'undefined') {
				$thisOptionFormEle.attr('value', optionObject.value);
			}
			break;
		case 'boolean':
			// checkbox
			$thisOptionFormEle = $(CreateElement.toggleButton(
				() => { $(RESConsoleContainer).trigger('change'); },
				optionName,
				optionObject.value,
				undefined,
				undefined,
				isTable
			));
			break;
		case 'enum':
			// radio buttons
			$thisOptionFormEle = $('<div>', {
				id: optionName,
				class: 'enum',
			});

			// Include existing value as option in case it is temporarily unavailable
			if (optionObject.value && !_.find(optionObject.values, _.matchesProperty('value', optionObject.value))) {
				optionObject.values.push({ name: `${optionObject.value} (not available)`, value: optionObject.value });
			}

			optionObject.values.forEach((optionValue, index) => {
				const thisId = `${optionName}-${index}`;
				const $thisOptionFormSubEle = $('<input>', {
					id: thisId,
					type: 'radio',
					name: optionName,
					moduleID: mod.moduleID,
					value: optionValue.value,
				});
				if (isTable) $thisOptionFormSubEle.attr('tableOption', 'true');
				const nullEqualsEmpty = ((optionObject.value === null) && (optionValue.value === ''));
				// we also need to check for null == '' - which are technically equal.
				if ((optionObject.value === optionValue.value) || nullEqualsEmpty) {
					$thisOptionFormSubEle.attr('checked', 'checked');
				}
				const thisLabel = document.createElement('label');
				thisLabel.setAttribute('for', thisId);
				thisLabel.textContent = ` ${i18n(optionValue.name)} `;
				$thisOptionFormEle.append($thisOptionFormSubEle);
				$thisOptionFormEle.append(thisLabel);
				$thisOptionFormEle.append('<br>');
			});
			break;
		case 'keycode':
			// keycode - shows a key value, but stores a keycode and possibly shift/alt/ctrl combo.
			const realOptionFormEle = $('<input>').attr({
				id: optionName,
				type: 'text',
				class: 'keycode',
				moduleID: mod.moduleID,
			}).css({
				border: '1px solid red',
				display: 'none',
			}).val(optionObject.value);
			if (isTable) realOptionFormEle.attr('tableOption', 'true');

			const thisKeyCodeDisplay = $('<input>').attr({
				id: `${optionName}-display`,
				type: 'text',
				capturefor: optionName,
				displayonly: 'true',
			}).val(niceKeyCode(optionObject.value));
			$thisOptionFormEle = $('<div>').append(realOptionFormEle).append(thisKeyCodeDisplay);
			break;
		case 'select':
			$thisOptionFormEle = $('<select>').attr({
				id: optionName,
				class: 'select',
				value: optionObject.value,
			});

			// Include existing value as option in case it is temporarily unavailable
			if (optionObject.value && !_.find(optionObject.values, _.matchesProperty('value', optionObject.value))) {
				optionObject.values.push({ name: `${optionObject.value} (not available)`, value: optionObject.value });
			}

			optionObject.values.forEach((optionValue, index) => {
				const thisId = `${optionName}-${index}`;
				const $thisOptionFormSubEle = $('<option />', {
					id: thisId,
					class: 'select-option',
					value: optionValue.value,
					moduleID: mod.moduleID,
					style: optionValue.style,
				}).text(optionValue.name);
				const nullEqualsEmpty = ((optionObject.value === null) && (optionValue.value === ''));
				// we also need to check for null == '' - which are technically equal.
				if ((optionObject.value === optionValue.value) || nullEqualsEmpty) {
					$thisOptionFormSubEle.attr('selected', 'selected');
				}
				$thisOptionFormEle.append($thisOptionFormSubEle);
			});
			break;
		default:
			throw new Error(`modules.${mod.moduleID}.options.${optionName} has invalid type: ${optionObject.type}`);
	}
	if (isTable) {
		$thisOptionFormEle.attr('tableOption', 'true');
	}
	return $thisOptionFormEle.get(0);
}

function drawSettingsConsole() {
	// put in the description, and a button to enable/disable the module, first..
	const thisToggle = RESConsoleContainer.querySelector('.moduleToggle');
	moduleToggle = thisToggle;

	thisToggle.addEventListener('click', toggleModuleEnabledState, true);

	function saveModuleOptions(e: Event) {
		e.preventDefault();
		saveCurrentModuleOptions();
	}

	async function toggleModuleEnabledState() {
		const moduleID = $(this).data('module');
		const $moduleButton = $(RESConsoleContainer).find('.moduleButton').filter(function() {
			return $(this).data('module') === moduleID;
		});
		const enabled = this.classList.contains('enabled');

		const enable = !enabled;
		if (enable) {
			const { requiredPermissions, message } = Modules.get(moduleID).permissions;
			if (message) {
				showNotification({
					header: 'Permission required',
					moduleID,
					closeDelay: 20000,
					message,
				});
			}
			await Permissions.request(requiredPermissions);
		}

		$(thisToggle).add($moduleButton).add(this.classList)
			.toggleClass('enabled', enable);
		updateSaveButton();
		if ($moduleOptionsScrim) $moduleOptionsScrim.toggleClass('visible', !enable);

		Modules.setEnabled(moduleID, !enabled);
	}

	saveButton = RESConsoleContainer.querySelector('#moduleOptionsSave');
	saveButton.addEventListener('click', saveModuleOptions, true);

	$(document.body).on('keyup', handleEscapeKey);
	$(window)
		.off('beforeunload', handleBeforeUnload)
		.on('beforeunload', handleBeforeUnload);
	$(RESConsoleContainer)
		.on('keyup', autostageDebounce)
		.on('change', stageCurrentModuleOptions);
}

function drawConfigOptions(mod) {
	if (mod.hidden) return;

	const thisOptions = getOptions(mod);
	let optCount = 0;

	const thisModuleName = RESConsoleContainer.querySelector('.moduleName');
	$(thisModuleName).html(`${i18n(mod.moduleName)} <span class="moduleKey">(${mod.moduleID})</span>`);

	$(moduleToggle)
		.toggle(!mod.alwaysEnabled)
		.toggleClass('enabled', Modules.isEnabled(mod))
		.data('module', mod.moduleID);

	updateSaveButton();

	const thisDescription = RESConsoleContainer.querySelector('.moduleDescription');
	$(thisDescription).html(mod.descriptionRaw ? mod.description : markdown(i18n(mod.description)));

	const allOptionsContainer = RESConsoleContainer.querySelector('#allOptionsContainer');
	$(allOptionsContainer).empty();
	// now draw all the options...
	for (const [optionKey, option] of Object.entries(thisOptions)) {
		if (!option.noconfig) {
			let thisOptionFormEle;
			optCount++;
			const containerID = `optionContainer-${mod.moduleID}-${optionKey}`;
			const $thisOptionContainer = $('<div>', { id: containerID, class: 'optionContainer' });

			if (option.dependsOn && !option.dependsOn(thisOptions)) {
				$thisOptionContainer.css('display', 'none');
			}

			if (option.advanced) {
				$thisOptionContainer.addClass('advanced');
			}

			const optionTitle = i18n(option.title);

			const $thisLabel = $('<label>', {
				class: 'optionTitle',
				for: optionKey,
				html: `${optionTitle}<br /><span class="optionKey">${optionKey}</span>`,
			});

			let niceDefaultOption = null;
			switch (option.type) {
				case 'textarea':
				case 'text':
				case 'password':
				case 'list':
					niceDefaultOption = option.default;
					break;
				case 'color':
					niceDefaultOption = option.default;
					if (option.default.startsWith('#')) {
						niceDefaultOption += ` (R:${parseInt(option.default.substr(1, 2), 16)}, G:${parseInt(option.default.substr(3, 2), 16)}, B:${parseInt(option.default.substr(5, 2), 16)})`;
					}
					break;
				case 'boolean':
					niceDefaultOption = option.default ? 'on' : 'off';
					break;
				case 'enum':
				case 'select':
					const matchingOption = option.values.find(({ value }) => option.default === value);
					niceDefaultOption = matchingOption && i18n(matchingOption.name);
					break;
				case 'keycode':
					niceDefaultOption = niceKeyCode(option.default);
					break;
				default:
					break;
			}
			if (niceDefaultOption !== null) {
				$thisLabel.attr('title', `Default: ${niceDefaultOption}`);
			}
			const $thisOptionDescription = $('<div>', {
				class: 'optionDescription',
				html: markdown(i18n(option.description)),
			});
			const $thisOptionSetting = $('<div>', { class: 'optionSetting' });
			$thisOptionContainer.append($thisLabel);
			$thisOptionContainer.append($thisOptionSetting);
			if (option.type === 'table') {
				const isFixed = option.addRowText === false; // set addRowText value to false to disable additing/removing/moving of row
				$thisOptionContainer.addClass('table');
				const thisTbody = document.createElement('tbody');
				// table - has a list of fields (headers of table), users can add/remove rows...
				const thisTable = document.createElement('table');
				thisTable.setAttribute('moduleID', mod.moduleID);
				thisTable.setAttribute('optionName', optionKey);
				thisTable.setAttribute('class', 'optionsTable');
				const thisThead = document.createElement('thead');
				const thisTableHeader = document.createElement('tr');
				let thisTH;
				thisTable.appendChild(thisThead);
				option.fields.forEach(field => {
					thisTH = document.createElement('th');
					$(thisTH).text(i18n(field.name));
					thisTableHeader.appendChild(thisTH);
				});
				if (!isFixed) {
					// add delete column
					thisTH = document.createElement('th');
					thisTableHeader.appendChild(thisTH);
					// add move column
					thisTH = document.createElement('th');
					$(thisTableHeader).prepend(thisTH);
				}
				thisThead.appendChild(thisTableHeader);
				thisTable.appendChild(thisThead);
				thisTbody.setAttribute('id', `tbody_${optionKey}`);
				if (option.value) {
					option.value.forEach((thisValue, j) => {
						const thisTR = document.createElement('tr');
						$(thisTR).data('itemidx-orig', j);
						option.fields.forEach((field, k) => {
							const thisTD = document.createElement('td');
							thisTD.className = 'hasTableOption';
							const thisOpt = {
								...field,
								value: thisValue[k],
							};
							const thisFullOpt = `${optionKey}_${thisOpt.name}`;
							const thisOptInputName = `${thisFullOpt}_${j}`;
							const thisTableEle = drawOptionInput(mod, thisOptInputName, thisOpt, true);
							thisTD.appendChild(thisTableEle);
							thisTR.appendChild(thisTD);
						});
						if (!isFixed) {
							addTableButtons(thisTR);
						}
						thisTbody.appendChild(thisTR);
					});
				}
				thisTable.appendChild(thisTbody);
				thisOptionFormEle = thisTable;

				$thisOptionDescription.insertAfter($thisLabel);
				if (!isFixed) {
					// Create an "add row" button...
					const addRowButton = $('<button class="addRowButton"></button>')
						.text(i18n(option.addRowText || 'settingsConsoleDefaultAddRowText'))
						.get(0);
					addRowButton.setAttribute('optionName', optionKey);
					addRowButton.setAttribute('moduleID', mod.moduleID);
					addRowButton.addEventListener('click', (e: Event) => {
						const optionName = e.target.getAttribute('optionName');
						const thisTbodyName = `tbody_${optionName}`;
						const thisTbody = document.getElementById(thisTbodyName);
						const newRow = document.createElement('tr');
						const rowCount = (thisTbody.querySelectorAll('tr')) ? thisTbody.querySelectorAll('tr').length + 1 : 1;
						mod.options[optionName].fields.forEach(thisOpt => {
							const newCell = document.createElement('td');
							newCell.className = 'hasTableOption';

							const optionNameWithRow = `${optionName}_${thisOpt.name}_${rowCount}`;
							const thisInput = drawOptionInput(mod, optionNameWithRow, thisOpt, true);
							newCell.appendChild(thisInput);
							newRow.appendChild(newCell);
							$(newRow).data('option-index', rowCount - 1);
							const firstText = newRow.querySelector('input[type=text]') || newRow.querySelector('textarea');
							if (firstText) {
								setTimeout(() => firstText.focus(), 200);
							}
						});

						addTableButtons(newRow);

						const thisLen = $(thisTbody).find(' > tr').length;
						$(newRow).data('itemidx-orig', thisLen);

						thisTbody.appendChild(newRow);
						$(thisTbody).trigger('change');
					}, true);

					$(addRowButton).insertAfter($thisOptionSetting);

					makeOptionTableSortable(thisTbody);
				}
			} else if (option.type === 'builder') {
				$thisOptionContainer.addClass('specialOptionType');
				$thisOptionDescription.insertAfter($thisLabel);
				thisOptionFormEle = caseBuilder.drawOptionBuilder(thisOptions, mod, optionKey);
			} else {
				if ((option.type === 'text') || (option.type === 'password') || (option.type === 'keycode')) {
					$thisOptionDescription.addClass('textInput');
				}
				thisOptionFormEle = drawOptionInput(mod, optionKey, option);
				$thisOptionContainer.append($thisOptionDescription);
			}
			$thisOptionSetting.append(thisOptionFormEle);
			$thisOptionContainer.appendTo(allOptionsContainer);
		}
	}

	RESConfigPanelOptions.querySelector('#noOptions').style.display = 'none';
	if (!optCount && mod.alwaysEnabled) {
		// do nothing
	} else if (optCount === 0) {
		RESConfigPanelOptions.querySelector('#noOptions').style.display = 'block';
	} else {
		$moduleOptionsScrim = $('<div>', { id: 'moduleOptionsScrim' })
			.toggleClass('visible', !Modules.isEnabled(mod))
			.appendTo(allOptionsContainer);
	}

	function addTableButtons(thisTR) {
		// add delete button
		let thisTD = document.createElement('td');
		const thisDeleteButton = document.createElement('div');
		$(thisDeleteButton)
			.addClass('res-icon-button res-icon deleteButton')
			.html('&#xF056;')
			.attr('title', 'remove this row');

		thisDeleteButton.addEventListener('click', (e: Event) => {
			if (!confirm('Are you sure you want to delete this row?')) {
				e.preventDefault();
				return;
			}

			deleteOptionRow(e);
		});
		thisTD.appendChild(thisDeleteButton);
		thisTR.appendChild(thisTD);

		// add move handle
		thisTD = document.createElement('td');
		const thisHandle = document.createElement('div');
		$(thisHandle)
			.addClass('res-icon-button res-icon handle')
			.html('&#xF0AA;')
			.attr('title', 'drag and drop to move this row');

		thisTD.appendChild(thisHandle);
		$(thisTR).prepend(thisTD);
	}
}

function showOption(moduleID, fieldID) {
	$(`#optionContainer-${moduleID}-${fieldID}`).slideDown();
}

function hideOption(moduleID, fieldID) {
	$(`#optionContainer-${moduleID}-${fieldID}`).slideUp();
}

function deleteOptionRow(e) {
	const thisRow = (e.target.parentNode: any).parentNode;
	$(thisRow).trigger('change').remove();
}

const autostageDebounce = _.debounce(stageCurrentModuleOptions, 300);

function stageCurrentModuleOptions() {
	// Cancel debounce so we don't needlessly stage twice
	autostageDebounce.cancel();

	const panelOptionsDiv = RESConfigPanelOptions;
	// first, go through inputs that aren't of a specialized type like table or builder
	$(panelOptionsDiv)
		.find('.optionContainer:not(.specialOptionType)')
		.find('input, select, textarea')
		.each((i, e) => {
			const input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement = (e: any);
			// save values of any inputs onscreen, but skip ones with 'capturefor' - those are display only.
			if ((input.getAttribute('type') !== 'button') &&
					(input.getAttribute('displayonly') !== 'true') &&
					(input.getAttribute('tableOption') !== 'true')) {
				// get the option name out of the input field id - unless it's a radio button...
				let optionName;
				if (input.getAttribute('type') === 'radio') {
					optionName = input.getAttribute('name');
				} else {
					optionName = input.getAttribute('id');
				}
				// get the module name out of the input's moduleid attribute
				let optionValue;
				if (/*:: input instanceof HTMLInputElement && */ input.getAttribute('type') === 'checkbox') {
					optionValue = !!input.checked;
				} else if (input.getAttribute('type') === 'radio') {
					if (input.checked) {
						optionValue = input.value;
					}
					// check if it's a keycode, in which case we need to parse it into an array...
				} else if (input.getAttribute('class') && input.getAttribute('class').includes('keycode')) {
					const tempArray = input.value.split(',');
					// convert the internal values of this array into their respective types (int, bool, bool, bool)
					optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true'), (tempArray[4] === 'true')];
				} else {
					optionValue = input.value;
				}
				if (typeof optionValue !== 'undefined') {
					Options.stage.add(currentModule.moduleID, optionName, optionValue);
				}
			}
		});
	// Check if there are any tables of options on this panel...
	const optionsTables = panelOptionsDiv.querySelectorAll('.optionsTable');

	// For each table, we need to go through each row in the tbody, and then go through each option and make a multidimensional array.
	// For example, something like: [['foo','bar','baz'],['pants','warez','cats']]
	for (const table of optionsTables) {
		const moduleID = table.getAttribute('moduleID');
		const optionName = table.getAttribute('optionName');
		const thisTBODY = table.querySelector('tbody');
		const thisRows = thisTBODY.querySelectorAll('tr');
		// go through each row, and get all of the inputs...
		const optionMulti = Array.from(thisRows)
			.map(row => {
				const cells = row.querySelectorAll('td.hasTableOption');
				let notAllBlank = false;
				const optionRow = Array.from(cells).map(cell => {
					const inputs: NodeList<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (cell.querySelectorAll('input[tableOption=true], select[tableOption=true], textarea[tableOption=true]'): any);
					let optionValue = null;
					for (const input of inputs) {
						if (/*:: input instanceof HTMLInputElement && */ input.getAttribute('type') === 'checkbox') {
							optionValue = input.checked;
						} else if (input.getAttribute('type') === 'radio') {
							if (input.checked) {
								optionValue = input.value;
							}
							// check if it's a keycode, in which case we need to parse it into an array...
						} else if (input.getAttribute('class') && input.getAttribute('class').includes('keycode')) {
							const tempArray = input.value.split(',');
							// convert the internal values of this array into their respective types (int, bool, bool, bool)
							optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true')];
						} else {
							optionValue = input.value;
						}
						if ((optionValue !== '') && (input.getAttribute('type') !== 'radio') &&
								// If no keyCode is set, then discard the value
								!(Array.isArray(optionValue) && isNaN(optionValue[0]))) {
							notAllBlank = true;
						}
					}
					return optionValue;
				});

				if (notAllBlank) {
					return optionRow;
				}
			})
			.filter(optionRow => Array.isArray(optionRow) && optionRow.length > 0);

		const mod = Modules.get(moduleID);

		if (typeof mod.options[optionName].sort === 'function') {
			optionMulti.sort(mod.options[optionName].sort);
		}

		Options.stage.add(moduleID, optionName, optionMulti);
	}

	$(panelOptionsDiv).find('.optionBuilder').each(function(i, builder) {
		const moduleId = this.dataset.moduleId;
		const optionName = this.dataset.optionName;

		const { customOptionsFields, cases } = Modules.get(moduleId).options[optionName];

		const items = [];
		$(builder).find('.builderItem').each(function() {
			try {
				items.push(caseBuilder.readBuilderItem(this, customOptionsFields, cases));
			} catch (e) {
				console.error('Ignoring invalid item.', e);
			}
		});
		Options.stage.add(moduleId, optionName, items);
	});

	updateSaveButton();
	updateDependsOn(currentModule);
}

function saveCurrentModuleOptions() {
	stageCurrentModuleOptions();
	Options.stage.commit();
	updateSaveButton();
	notifyOptionsSaved();
}

function updateSaveButton() {
	const unsavedOptions = Options.stage.isDirty();

	$(saveButton).toggleClass('optionsSaved', !unsavedOptions);
}

function updateDependsOn(mod) {
	const thisOptions = getOptions(mod);

	for (const [optionKey, option] of Object.entries(thisOptions)) {
		if (option.dependsOn) {
			if (option.dependsOn(thisOptions)) {
				showOption(mod.moduleID, optionKey);
			} else {
				hideOption(mod.moduleID, optionKey);
			}
		}
	}
}

function handleEscapeKey(event: KeyboardEvent) {
	if (event.key === NAMED_KEYS.Escape) {
		close();
	}
}

function handleBeforeUnload() {
	if (Options.stage.isDirty()) {
		return abandonChangesConfirmation;
	}
}

function close({ promptIfStagedOptions = true }: {| promptIfStagedOptions?: boolean |} = {}) {
	if (promptIfStagedOptions && Options.stage.isDirty()) {
		const abandonChanges = confirm(abandonChangesConfirmation);
		if (!abandonChanges) return;
	}

	SettingsNavigation.close();
}

function openCategoryPanel(categories) {
	const items = $(RESConsoleContainer).find('#RESConfigPanelModulesList .RESConfigPanelCategory');
	let selected = items.filter(function() {
		const thisValue = $(this).data('category');
		return categories.includes(thisValue);
	});
	if (selected.filter('.active').length === 0) { // if a category isn't already open
		selected = selected.filter(function() { // select first category
			const thisValue = $(this).data('category');
			return categories.indexOf(thisValue) === 0;
		});

		items.not(selected).removeClass('active').find('ul').slideUp(300);
		selected.addClass('active').find('ul').slideDown(300);
	}
}

function updateAdvancedOptionsVisibility() {
	if (SettingsNavigation.module.options.showAllOptions.value) {
		document.getElementById('RESConsoleContent').classList.remove('advanced-options-disabled');
	} else {
		document.getElementById('RESConsoleContent').classList.add('advanced-options-disabled');
	}
}

function makeOptionTableSortable(tableBody) {
	const edgeScroll = new EdgeScroll(tableBody);

	$(tableBody).sortable({
		nested: false,
		handle: '.handle',
		placeholderClass: 'RESSortPlaceholder',
		placeholder: '<tr class="RESSortPlaceholder"><td></td></tr>',
		containerSelector: 'tbody',
		itemSelector: 'tr',
		onDrop($item, container, _super, event) {
			_super($item, container, _super, event);
			edgeScroll.stop();
			$item.trigger('change');
		},
		onDragStart($item, container, _super, event) {
			_super($item, container, _super, event);
			edgeScroll.start();
		},
	});
}

function getOptions(mod) {
	const staged = Options.stage.get(mod.moduleID);

	return _.mapValues(mod.options, (stored, key: string) => ({
		...stored,
		...staged && staged[key],
	}));
}

const abandonChangesConfirmation = 'Abandon your changes to RES settings?';

function notifyOptionsSaved() {
	const statusEle = RESConsoleContainer.querySelector('#moduleOptionsSaveStatus');
	if (statusEle) {
		statusEle.setAttribute('style', 'display: block; opacity: 1');
		setTimeout(() => $(statusEle).fadeOut(1000), 500);
	}
}
