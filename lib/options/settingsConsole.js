/* @flow */

import $ from 'jquery';
import { mapValues, sortBy, groupBy, once } from 'lodash-es';
import { markdown } from 'snudown-js';
import Sortable from 'sortablejs';
import * as Metadata from '../core/metadata';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import {
	Alert,
	CreateElement,
	NAMED_KEYS,
	caseBuilder,
	downcast,
	escapeHTML,
	frameThrottle,
	frameDebounce,
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

let $moduleOptionsScrim;
let RESConfigPanelOptions;
let RESConsoleContainer;
let RESConsoleContent;
let currentModule;
let moduleToggle;
let saveButton;

export function start() {
	create();

	window.addEventListener('hashchange', loadFromHash);

	window.addEventListener('message', ({ data }) => {
		if (data.close) {
			close();
		} else if (data.load) {
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
		requestAnimationFrame(() => { RESConsoleContent.scrollTop = 0; });
	}

	if (optionKey && mod.options.hasOwnProperty(optionKey)) {
		highlightOption(mod, optionKey);
	}

	if (mod === Search.module) {
		Search.search(optionKey);
		requestAnimationFrame(() => Search.input().focus());
	} else {
		Search.input().blur();
	}

	SettingsNavigation.setHash(SettingsNavigation.makeUrlHash(moduleID, optionKey));
}

function highlightOption(mod, optionKey) {
	const optionElement = RESConfigPanelOptions.querySelector(`#optionContainer-${mod.moduleID}-${optionKey}`);
	if (!optionElement) return;

	requestAnimationFrame(() => {
		optionElement.classList.add('highlight');
		optionElement.style.display = '';

		if (optionElement.classList.contains('advanced') && !SettingsNavigation.module.options.showAllOptions.value) {
			RESConsoleContainer.classList.add('advanced-options-enabled');
			showNotification('You opened a link to an advanced option, but not all options are shown. These options will be shown until you leave or refresh the page. If you want to see all options in the future, check the <i>Show advanced options</i> checkbox in the menu.', Infinity);
		}

		RESConfigPanelOptions.scrollTop = optionElement.offsetTop - 10;
	});
}

function create() {
	// create the console container
	RESConsoleContainer = consoleContainerTemplate({
		name: Metadata.name,
		version: Metadata.version,
		showAllOptions: SettingsNavigation.module.options.showAllOptions.value,
	});

	requestAnimationFrame(() => document.querySelector('.res-logo').focus());

	const RESClose = RESConsoleContainer.querySelector('#RESClose');
	RESClose.addEventListener('click', (e: Event) => {
		e.preventDefault();
		close();
	}, true);

	const RESAdvOptionsSpan = RESConsoleContainer.querySelector('#RESAllOptionsSpan');
	RESAdvOptionsSpan.setAttribute('title', i18n(SettingsNavigation.module.options.showAllOptions.description));

	const RESAdvOptions: HTMLInputElement = (RESAdvOptionsSpan.querySelector('input'): any);
	RESAdvOptions.addEventListener('change', () => {
		SettingsNavigation.module.options.showAllOptions.value = RESAdvOptions.checked;
		Options.save(SettingsNavigation.module.options.showAllOptions);
		RESConsoleContainer.classList.toggle('advanced-options-enabled', RESAdvOptions.checked);
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
			const id = $(this).parent().data('category');
			if (id) {
				e.preventDefault();
				openCategoryPanel(id);
			}
		});

	RESConsoleContent = RESConsoleContainer.querySelector('#RESConsoleContent');

	RESConfigPanelOptions = RESConsoleContainer.querySelector('#RESConfigPanelOptions');

	$(RESConsoleContainer).find('#SearchRES-input-container').append(Search.input());
	const search = () => load(Search.module.moduleID, Search.input().value);
	Search.input().addEventListener('input', frameThrottle(search));
	Search.input().addEventListener('click', search);

	drawSettingsConsole();

	// Okay, the console is done. Add it to the document body.
	document.body.append(RESConsoleContainer);
}

const createKeyCodeModal = once(() => {
	const $keyCodeModal = $('<div>', {
		id: 'keyCodeModal',
		text: 'Press a key (or combination with shift, alt and/or ctrl) to assign this action.',
	}).appendTo(document.body);
	let captureKey, captureKeyID;

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

	return $keyCodeModal;
});

function renderModulesSelector() {
	function compareModules(a, b) {
		if (a.sort === b.sort) {
			return i18n(a.moduleName).toLocaleLowerCase().localeCompare(i18n(b.moduleName).toLocaleLowerCase());
		} else {
			return (a.sort || 0) - (b.sort || 0);
		}
	}

	const showCategories = Object.entries(
		groupBy(Modules.all().filter(mod => !mod.hidden), mod => mod.category),
	)
		.map(([category, modules]) => ({
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
		}));

	return moduleSelectorTemplate(sortBy(showCategories, ({ name }) => CATEGORY_SORT.indexOf(name)));
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
		case 'hidden':
			// text...
			$thisOptionFormEle = $('<input>', {
				id: optionName,
				type: optionObject.type === 'hidden' ? 'hidden' : 'text',
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
				isTable,
			));
			break;
		case 'enum':
			// radio buttons
			$thisOptionFormEle = $('<div>', {
				id: optionName,
				class: 'enum',
			});

			// Include existing value as option in case it is temporarily unavailable
			if (optionObject.value && !optionObject.values.some(({ value }) => value === optionObject.value)) {
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
			createKeyCodeModal();
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
			if (optionObject.value && !optionObject.values.some(({ value }) => value === optionObject.value)) {
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
			const { requiredPermissions: permissions, message } = Modules.get(moduleID).permissions;
			if (permissions.length && !await Permissions.has(permissions)) {
				if (message) {
					showNotification({
						header: 'Permission required',
						moduleID,
						closeDelay: 20000,
						message,
					});
				}
				await Permissions.request(permissions);
			}
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
	$(window).on('beforeunload', handleBeforeUnload);
	$(RESConsoleContainer)
		.on('input change', autostageDebounce);
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
	allOptionsContainer.append(...Object.entries(thisOptions).map(([optionKey, option]) => {
		if (option.noconfig) return;

		let thisOptionFormEle;
		optCount++;
		const containerID = `optionContainer-${mod.moduleID}-${optionKey}`;
		const $thisOptionContainer = $('<div>', { id: containerID, class: 'optionContainer' });

		if (option.dependsOn && !option.dependsOn(thisOptions)) {
			$thisOptionContainer.addClass('dependsOnDisabledOptions');
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
			// Don't allow very long tables to make further option too far down
			if (option.value.length > 67 /* 68 or more rows is the very very definition of a very long table */) $thisOptionSetting.addClass('wholeTableVisible');
			const thisThead = document.createElement('thead');
			const thisTableHeader = document.createElement('tr');
			let thisTH;
			thisTable.appendChild(thisThead);
			option.fields.forEach(field => {
				thisTH = document.createElement('th');
				$(thisTH).text(i18n(field.name));
				thisTableHeader.appendChild(thisTH);
				if (field.type === 'hidden') thisTH.hidden = true;
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
			thisTbody.append(...option.value.map((thisValue, j) => {
				const thisTR = document.createElement('tr');
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
					if (thisOpt.type === 'hidden') thisTD.hidden = true;
					thisTR.appendChild(thisTD);
				});
				if (!isFixed) {
					addTableButtons(thisTR);
				}
				return thisTR;
			}));
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
					const optionName = e.currentTarget.getAttribute('optionName');
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
						if (thisOpt.type === 'hidden') newCell.hidden = true;
						newRow.appendChild(newCell);
						const firstText = newRow.querySelector('input[type=text], textarea');
						if (firstText) setTimeout(() => firstText.focus());
					});

					addTableButtons(newRow);

					thisTbody.appendChild(newRow);
					$(thisTbody).trigger('change');
				}, true);

				$(addRowButton).insertAfter($thisOptionSetting);

				Sortable.create(thisTbody, { handle: '.handle' });
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
		return $thisOptionContainer.get(0);
	}).filter(Boolean));

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
		thisDeleteButton.className = 'res-icon-button res-icon deleteButton';
		thisDeleteButton.textContent = '\uF056';
		thisDeleteButton.title = 'remove this row';

		thisDeleteButton.addEventListener('click', () => {
			const tbody = downcast(thisTR.closest('tbody'), HTMLTableSectionElement);
			$(thisTR).trigger('change').detach();
			CreateElement.undo('Restore deleted row').then(() => { $(thisTR).appendTo(tbody).trigger('change'); });
		});
		thisTD.appendChild(thisDeleteButton);
		thisTR.appendChild(thisTD);

		// add move handle
		thisTD = document.createElement('td');
		const thisHandle = document.createElement('div');
		thisHandle.className = 'res-icon-button res-icon handle';
		thisHandle.textContent = '\uF0AA';
		thisHandle.title = 'drag and drop to move this row';

		thisTD.appendChild(thisHandle);
		thisTR.prepend(thisTD);
	}
}

const autostageDebounce = frameDebounce(stageCurrentModuleOptions);

function stageCurrentModuleOptions() {
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
	const stagedOptions = getOptions(mod);
	for (const [optionKey, { dependsOn }] of Object.entries(stagedOptions)) {
		if (dependsOn) $(`#optionContainer-${mod.moduleID}-${optionKey}`).toggleClass('dependsOnDisabledOptions', !dependsOn(stagedOptions));
	}
}

function handleEscapeKey(event: KeyboardEvent) {
	if (event.key === NAMED_KEYS.Escape) {
		close();
	}
}

const abandonChangesConfirmation = 'Abandon your changes to RES settings?';

function handleBeforeUnload() {
	if (Options.stage.isDirty()) {
		return abandonChangesConfirmation;
	}
}

async function close({ promptIfStagedOptions = true }: {| promptIfStagedOptions?: boolean |} = {}) {
	if (promptIfStagedOptions && Options.stage.isDirty()) {
		await Alert.open(abandonChangesConfirmation, { cancelable: true });
	}

	SettingsNavigation.close();
}

function openCategoryPanel(category) {
	const items = $(RESConsoleContainer).find('#RESConfigPanelModulesList .RESConfigPanelCategory');
	const selected = items.filter(`[data-category=${category}]`);
	items.not(selected).removeClass('active');
	selected.addClass('active');
}

function getOptions(mod) {
	const staged = Options.stage.get(mod.moduleID);

	return mapValues(mod.options, (stored, key: string) => ({
		...stored,
		...staged && staged[key],
	}));
}

function notifyOptionsSaved() {
	const statusEle = RESConsoleContainer.querySelector('#moduleOptionsSaveStatus');
	if (statusEle) {
		statusEle.hidden = false;
		setTimeout(() => { statusEle.hidden = true; }, 1500);
	}
}
