/* @flow */

import _ from 'lodash';
import { flow, filter, groupBy, sortBy } from 'lodash/fp';
import consoleContainerTemplate from '../templates/settingsConsole.mustache';
import moduleSelectorTemplate from '../templates/settingsConsoleModuleSelector.mustache';
import * as Metadata from '../core/metadata';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	CreateElement,
	escapeHTML,
	niceKeyCode,
} from '../utils';
import { i18n, Storage } from '../environment';
import * as About from './about';
import * as Menu from './menu';
import * as Search from './search';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('settingsConsole');

module.moduleName = 'settingsConsoleName';
module.category = 'coreCategory';
module.description = 'settingsConsoleDesc';
module.alwaysEnabled = true;
module.hidden = true;

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

let $modalOverlay, $keyCodeModal, RESConsoleContainer, $moduleOptionsScrim, saveButton, moduleToggle,
	captureKey, captureKeyID, currentModule;

export let RESConsoleContent, RESConfigPanelOptions;

export let isOpen = false;

module.beforeLoad = () => {
	Menu.addMenuItem($menuItem(), () => {
		Menu.hidePrefsDropdown();
		open();
	}, true);
};

export const $menuItem = _.once(() => $('<div>', { id: 'SettingsConsole', text: 'RES settings console' }));

function create() {
	// create the console container
	RESConsoleContainer = $(consoleContainerTemplate({
		...Metadata,
		toggleOnText: i18n('toggleOn'),
		toggleOffText: i18n('toggleOff'),
	}))[0];
	// hide it by default...
	// create a modal overlay
	$modalOverlay = $('<div>', { id: 'modalOverlay' });
	$modalOverlay.get(0).addEventListener('click', (e: Event) => {
		e.preventDefault();
		return false;
	}, true);
	$modalOverlay.appendTo(document.body);

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
	$(RESConsoleContainer).find('#RESConfigPanelModulesList').html(renderModulesSelector());

	$(RESConsoleContainer).find('#RESConfigPanelModulesPane')
		.on('click', '.moduleButton', function(e: Event) {
			const id = $(this).data('module');
			if (id) {
				e.preventDefault();
				showConfigOptions(Modules.get(id));
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

	Search.renderSearchForm(RESConsoleContainer);

	// Okay, the console is done. Add it to the document body.
	document.body.appendChild(RESConsoleContainer);

	window.addEventListener('keydown', e => {
		if (captureKey && (e.keyCode !== 16) && (e.keyCode !== 17) && (e.keyCode !== 18)) {
			// capture the key, display something nice for it, and then close the popup...
			e.preventDefault();
			let keyArray;
			if (e.keyCode === 8) { // backspace, we disable the shortcut
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
}

function renderModulesSelector() {
	function compareModules(a, b) {
		let sort = 0;
		if (a.sort === b.sort) {
			sort = i18n(a.moduleName).toLocaleLowerCase().localeCompare(i18n(b.moduleName).toLocaleLowerCase());
		} else {
			sort = (a.sort || 0) - (b.sort || 0);
		}

		return sort;
	}

	const categories = flow(
		() => Modules.all(),
		filter(mod => !mod.hidden),
		groupBy(mod => mod.category),
		obj => _.map(obj, (modules, category: *) => ({
			name: category,
			translatedName: i18n(category),
			modules: modules
				.sort(compareModules)
				.map(mod => {
					const description = $(`<p>${i18n(mod.description)}</p>`).text().replace(/\s+/g, ' ');
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

	return moduleSelectorTemplate({ categories });
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
			if (typeof optionObject.callback === 'string' || optionObject.callback.moduleID) {
				$thisOptionFormEle = $('<a>', { id: optionName });
			} else { // if (typeof optionObject.callback === 'function') {
				$thisOptionFormEle = $('<button>', { id: optionName });
			}
			$thisOptionFormEle.addClass('RESConsoleButton');
			$thisOptionFormEle.attr('moduleID', mod.moduleID);
			if (optionObject.text.tagName || optionObject.text.jquery) {
				$thisOptionFormEle.append(optionObject.text);
			} else if (typeof optionObject.text === 'string') {
				$thisOptionFormEle.text(optionObject.text);
			} else {
				$thisOptionFormEle.append(CreateElement.icon('F141'));
			}
			if (optionObject.callback.moduleID) {
				$thisOptionFormEle.attr('href', SettingsNavigation.makeUrlHash(optionObject.callback.moduleID, optionObject.callback.optionKey));
			} else if (typeof optionObject.callback === 'string') {
				$thisOptionFormEle.attr('href', optionObject.callback);
				$thisOptionFormEle.attr('target', '_blank');
				$thisOptionFormEle.attr('rel', 'noopener noreferer');
			} else if (typeof optionObject.callback === 'function') {
				$thisOptionFormEle.click(() => optionObject.callback(optionName, optionObject));
			}
			break;
		case 'list':
			// list...
			$thisOptionFormEle = $('<input>', {
				id: optionName,
				class: 'RESInputList',
				type: 'text',
				moduleID: mod.moduleID,
			});

			const optionArray = (optionObject.value || '').split(',');
			const prepop = optionArray
				.filter(option => option !== '')
				.map(option => ({
					id: option,
					name: option,
				}));
			const listSpec = Options.listTypes[optionObject.listType] || optionObject;

			setTimeout(() => {
				$thisOptionFormEle.tokenInput(listSpec.source, {
					method: 'POST',
					queryParam: 'query',
					theme: 'facebook',
					allowFreeTagging: true,
					zindex: 999999999,
					onResult: (typeof listSpec.onResult === 'function') ? listSpec.onResult : null,
					onCachedResult: (typeof listSpec.onCachedResult === 'function') ? listSpec.onCachedResult : null,
					prePopulate: prepop,
					hintText: (typeof listSpec.hintText === 'string') ? listSpec.hintText : null,
				});
			}, 100);
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
		default:
			throw new Error(`modules.${mod.moduleID}.options.${optionName} has invalid type: ${optionObject.type}`);
	}
	if (isTable) {
		$thisOptionFormEle.attr('tableOption', 'true');
	}
	return $thisOptionFormEle.get(0);
}

function showConfigOptions(mod) {
	drawConfigOptions(mod);
	updateSelectedModule(mod);

	currentModule = mod;

	RESConsoleContent.scrollTop = 0;

	SettingsNavigation.setUrlHash(mod.moduleID);
}

const drawSettingsConsole = _.once(() => {
	// put in the description, and a button to enable/disable the module, first..
	const thisToggle = RESConsoleContainer.querySelector('.moduleToggle');
	moduleToggle = thisToggle;

	thisToggle.addEventListener('click', function() {
		const moduleID = $(this).data('module');
		const $moduleButton = $(RESConsoleContainer).find('.moduleButton').filter(function() {
			return $(this).data('module') === moduleID;
		});
		const enabled = this.classList.contains('enabled');

		const enable = !enabled;
		$(thisToggle).add($moduleButton).add(this.classList)
			.toggleClass('enabled', enable);
		updateSaveButton();
		if ($moduleOptionsScrim) $moduleOptionsScrim.toggleClass('visible', !enable);

		Modules.setEnabled(moduleID, !enabled);
	}, true);

	function saveModuleOptions(e: Event) {
		e.preventDefault();
		saveCurrentModuleOptions();
	}

	saveButton = RESConsoleContainer.querySelector('#moduleOptionsSave');
	saveButton.addEventListener('click', saveModuleOptions, true);
});

function drawConfigOptions(mod) {
	drawSettingsConsole();

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
	$(thisDescription).html(i18n(mod.description));

	const allOptionsContainer = RESConsoleContainer.querySelector('#allOptionsContainer');
	$(allOptionsContainer).empty();
	// now draw all the options...
	for (const i in thisOptions) {
		if (!thisOptions[i].noconfig) {
			let thisOptionFormEle;
			optCount++;
			const containerID = `optionContainer-${mod.moduleID}-${i}`;
			const $thisOptionContainer = $('<div>', { id: containerID, class: 'optionContainer' });

			if (thisOptions[i].dependsOn && !thisOptions[i].dependsOn(thisOptions)) {
				$thisOptionContainer.css('display', 'none');
			}

			if (thisOptions[i].advanced) {
				$thisOptionContainer.addClass('advanced');
			}

			const optionTitle = i18n(thisOptions[i].title) || _.startCase(thisOptions[i].title || i);
			const optionKey = i;

			const $thisLabel = $('<label>', {
				class: 'optionTitle',
				for: i,
				html: `${optionTitle}<br /><span class="optionKey">${optionKey}</span>`,
			});

			let niceDefaultOption = null;
			switch (thisOptions[i].type) {
				case 'textarea':
				case 'text':
				case 'password':
				case 'list':
					niceDefaultOption = thisOptions[i].default;
					break;
				case 'color':
					niceDefaultOption = thisOptions[i].default;
					if (thisOptions[i].default.startsWith('#')) {
						niceDefaultOption += ` (R:${parseInt(thisOptions[i].default.substr(1, 2), 16)}, G:${parseInt(thisOptions[i].default.substr(3, 2), 16)}, B:${parseInt(thisOptions[i].default.substr(5, 2), 16)})`;
					}
					break;
				case 'boolean':
					niceDefaultOption = thisOptions[i].default ? 'on' : 'off';
					break;
				case 'enum':
					const matchingOption = thisOptions[i].values.find(({ value }) => thisOptions[i].default === value);
					niceDefaultOption = matchingOption && i18n(matchingOption.name);
					break;
				case 'keycode':
					niceDefaultOption = niceKeyCode(thisOptions[i].default);
					break;
				default:
					break;
			}
			if (niceDefaultOption !== null) {
				$thisLabel.attr('title', `Default: ${niceDefaultOption}`);
			}
			const $thisOptionDescription = $('<div>', {
				class: 'optionDescription',
				html: i18n(thisOptions[i].description),
			});
			const $thisOptionSetting = $('<div>', { class: 'optionSetting' });
			$thisOptionContainer.append($thisLabel);
			$thisOptionContainer.append($thisOptionSetting);
			if (thisOptions[i].type === 'table') {
				const isFixed = thisOptions[i].addRowText === false; // set addRowText value to false to disable additing/removing/moving of row
				$thisOptionContainer.addClass('table');
				const thisTbody = document.createElement('tbody');
				// table - has a list of fields (headers of table), users can add/remove rows...
				const thisTable = document.createElement('table');
				thisTable.setAttribute('moduleID', mod.moduleID);
				thisTable.setAttribute('optionName', i);
				thisTable.setAttribute('class', 'optionsTable');
				const thisThead = document.createElement('thead');
				const thisTableHeader = document.createElement('tr');
				let thisTH;
				thisTable.appendChild(thisThead);
				thisOptions[i].fields.forEach(field => {
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
				thisTbody.setAttribute('id', `tbody_${i}`);
				if (thisOptions[i].value) {
					thisOptions[i].value.forEach(function(thisValue, j) {
						const thisTR = document.createElement('tr');
						$(thisTR).data('itemidx-orig', j);
						thisOptions[i].fields.forEach((field, k) => {
							const thisTD = document.createElement('td');
							thisTD.className = 'hasTableOption';
							const thisOpt = {
								...field,
								value: thisValue[k],
							};
							const thisFullOpt = `${i}_${thisOpt.name}`;
							const thisOptInputName = `${thisFullOpt}_${j}`;
							const thisTableEle = drawOptionInput(mod, thisOptInputName, thisOpt, true);
							thisTD.appendChild(thisTableEle);
							thisTR.appendChild(thisTD);
						}, this);
						if (!isFixed) {
							addTableButtons(thisTR);
						}
						thisTbody.appendChild(thisTR);
					}, this);
				}
				thisTable.appendChild(thisTbody);
				thisOptionFormEle = thisTable;

				$thisOptionDescription.insertAfter($thisLabel);
				if (!isFixed) {
					// Create an "add row" button...
					const addRowButton = $('<button class="addRowButton"></button>')
						.text(i18n(thisOptions[i].addRowText || 'settingsConsoleDefaultAddRowText'))
						.get(0);
					addRowButton.setAttribute('optionName', i);
					addRowButton.setAttribute('moduleID', mod.moduleID);
					addRowButton.addEventListener('click', function() {
						const optionName = this.getAttribute('optionName');
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
			} else if (thisOptions[i].type === 'builder') {
				$thisOptionContainer.addClass('specialOptionType');
				$thisOptionDescription.insertAfter($thisLabel);
				thisOptionFormEle = drawOptionBuilder(thisOptions, mod, i);
			} else {
				if ((thisOptions[i].type === 'text') || (thisOptions[i].type === 'password') || (thisOptions[i].type === 'keycode')) $thisOptionDescription.addClass('textInput');
				thisOptionFormEle = drawOptionInput(mod, i, thisOptions[i]);
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
		.find('input, textarea')
		.each((i, e) => {
			const input: HTMLInputElement | HTMLTextAreaElement = (e: any);
			// save values of any inputs onscreen, but skip ones with 'capturefor' - those are display only.
			const notTokenPrefix = input.getAttribute('id') && !input.getAttribute('id').includes('token-input-');
			if ((notTokenPrefix) && (input.getAttribute('type') !== 'button') && (input.getAttribute('displayonly') !== 'true') && (input.getAttribute('tableOption') !== 'true')) {
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
					const inputs: NodeList<HTMLInputElement | HTMLTextAreaElement> = (cell.querySelectorAll('input[tableOption=true], textarea[tableOption=true]'): any);
					let optionValue = null;
					for (const input of inputs) {
						// get the module name out of the input's moduleid attribute
						// const moduleID = input.getAttribute('moduleID');
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
			.filter(optionRow => Array.isArray(optionRow) && (optionRow.length > 0));

		const mod = Modules.get(moduleID);

		if (typeof mod.options[optionName].sort === 'function') {
			optionMulti.sort(mod.options[optionName].sort);
		}

		Options.stage.add(moduleID, optionName, optionMulti);
	}

	$(panelOptionsDiv).find('.optionBuilder').each(function(i, builder) {
		const moduleId = this.dataset.moduleId;
		const optionName = this.dataset.optionName;

		const option = Modules.get(moduleId).options[optionName];
		const config = option.cases;

		const items = [];
		$(builder).find('.builderItem').each(function() {
			items.push(readBuilderItem(this, config));
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

export function open(moduleIdOrCategory?: string) {
	if (!RESConsoleContainer) {
		create();
	}

	const mod = (
		(moduleIdOrCategory && (
			Modules.getUnchecked(moduleIdOrCategory) ||
			Modules.getByCategory(moduleIdOrCategory)[0]
		)) ||
		DEFAULT_MODULE
	);

	// Draw the config panel
	showConfigOptions(mod);

	isOpen = true;
	// hide the ad-frame div in case it's flash, because then it covers up the settings console and makes it impossible to see the save button!
	const adFrame = document.getElementById('ad-frame');
	if ((typeof adFrame !== 'undefined') && (adFrame !== null)) {
		adFrame.style.display = 'none';
	}
	// add a class to body to hide the scrollbar.
	setTimeout(() => {
		// Main reason for timeout: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
		document.querySelector('body').classList.add('res-console-open');
	}, 500);

	$modalOverlay.removeClass('fadeOut');
	$modalOverlay.addClass('fadeIn');

	RESConsoleContainer.classList.remove('slideOut');
	RESConsoleContainer.classList.add('slideIn');

	Storage.set('RESConsole.hasOpenedConsole', true);

	$(document.body).on('keyup', handleEscapeKey);
	$(window)
		.off('beforeunload', handleBeforeUnload)
		.on('beforeunload', handleBeforeUnload);
	$('#SearchRES-input').focus();
	$(RESConsoleContainer)
		.on('keyup', autostageDebounce)
		.on('change', stageCurrentModuleOptions);
}

function handleEscapeKey(event: KeyboardEvent) {
	// don't close if the user is in a token input field (e.g. adding subreddits to a list)
	// because they probably just want to cancel the dropdown list
	if (event.which === 27 && !document.activeElement.id.includes('token-input')) {
		close();
	}
}

function handleBeforeUnload() {
	if (Options.stage.isDirty()) {
		return abandonChangesConfirmation;
	}
}

export function close({ promptIfStagedOptions = true, resetUrl = true }: { promptIfStagedOptions?: boolean, resetUrl?: boolean } = {}) {
	if (promptIfStagedOptions && Options.stage.isDirty()) {
		const abandonChanges = confirm(abandonChangesConfirmation);
		if (!abandonChanges) return;
	}

	Options.stage.reset();

	isOpen = false;
	$(document.body).off('keyup', handleEscapeKey);
	$(window).off('beforeunload', handleBeforeUnload);
	// Let's be nice to reddit and put their ad frame back now...
	const adFrame = document.getElementById('ad-frame');
	if ((typeof adFrame !== 'undefined') && (adFrame !== null)) {
		adFrame.style.display = 'block';
	}

	$modalOverlay.removeClass('fadeIn');
	$modalOverlay.addClass('fadeOut');
	RESConsoleContainer.classList.remove('slideIn');
	RESConsoleContainer.classList.add('slideOut');
	setTimeout(() => {
		// Main reason for timeout: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
		document.body.classList.remove('res-console-open');
	}, 500);
	// just in case the user was in the middle of setting a key and decided to close the dialog, clean that up.
	if ($keyCodeModal) {
		$keyCodeModal.css('display', 'none');
		captureKey = false;
	}

	if (resetUrl) {
		SettingsNavigation.resetUrlHash();
	}
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

export function getOptionValue(moduleID: string, optionKey: string): string {
	const optionInput: ?HTMLInputElement = (document.getElementById(optionKey): any);
	if (optionInput) {
		return optionInput.value;
	} else {
		throw new Error(`Cannot get a value for ${moduleID}.${optionKey} because the HTML element does not exist.`);
	}
}

export function setOptionValue(moduleID: string, optionKey: string, value: string): void {
	const optionInput: ?HTMLInputElement = (document.getElementById(optionKey): any);
	if (optionInput) {
		optionInput.value = value;
	} else {
		throw new Error(`Cannot set a value for ${moduleID}.${optionKey} because the HTML element does not exist.`);
	}
}

function makeOptionTableSortable(tableBody) {
	function cleanupDrag($item) {
		$item.removeData(['oldIndex', 'dragOffset']);
		$(RESConfigPanelOptions).edgescroll('stop');
		$item.find('>td').removeAttr('style');
	}
	$(tableBody).sortable({
		nested: false,
		handle: '.handle',
		placeholderClass: 'RESSortPlaceholder',
		placeholder: '<tr class="RESSortPlaceholder"><td></td></tr>',
		containerSelector: 'tbody',
		itemSelector: 'tr',
		onCancel($item, container, _super, event) {
			_super($item, container, _super, event);
			cleanupDrag($item);
		},
		onDrop($item, container, _super, event) {
			_super($item, container, _super, event);

			cleanupDrag($item);
			$item.trigger('change');
		},
		onDrag($item, position) {
			const dragOffset = $item.data('dragOffset');
			// Reposition the row, remembering to apply the offset
			$item.css({
				top: position.top - dragOffset.top,
				left: position.left - dragOffset.left,
			});
		},
		onDragStart($item, container, _super, event) {
			_super($item, container, _super, event);

			$(RESConfigPanelOptions).edgescroll({ speed: 4 });

			const offset = $item.offset();
			const pointer = container.rootGroup.pointer;

			// force a constant width for the columns since switching the
			// row's positioning method to absolute means that the column
			// width calulation ignores the other rows.
			$item.find('>td').css('width', function() {
				return $(this).width();
			});
			$item.css({
				position: 'absolute',
				height: $item.height(),
				width: $item.width(),
			}).data({
				oldIndex: $item.index(),
				// Store this so we can keep what we are dragging at
				// the same relative cursor position
				dragOffset: {
					left: pointer.left - offset.left,
					top: pointer.top - offset.top,
				},
			});
		},
	});
}

// Builder stuff

function drawOptionBuilder(options, mod, optionName) {
	const option = options[optionName];
	const $addRowButton = $('<button class="addRowButton">');
	const $itemContainer = $('<div class="optionBuilder">');

	$itemContainer.attr({
		'data-module-id': mod.moduleID,
		'data-option-name': optionName,
	});
	$addRowButton
		.text(option.addItemText || '+add item')
		.on('click', function() {
			const $newBody = drawBuilderItem(option.defaultTemplate(), option.cases);
			$(this).siblings('.optionBuilder:first').trigger('change').append($newBody);
			const firstText = $newBody.find('input[type=text], textarea')[0];
			if (firstText) {
				setTimeout(() => firstText.focus(), 200);
			}
		});
	option.value.forEach(item => drawBuilderItem(item, option.cases).appendTo($itemContainer));
	makeBuilderItemsSortable($itemContainer);

	return $('<div>').append($itemContainer, $addRowButton)[0];
}

function drawBuilderItem(data, config) {
	const $body = $('<div class="builderItem">');
	const $header = $('<textarea name="builderNote" rows="2" cols="40" placeholder="Write a description/note for this">').val(data.note);
	const $versionField = $('<input type="hidden" name="version">').val(data.ver);
	const $wrapper = $('<div class="builderBody">');

	const $handle = $('<div>')
		.addClass('res-icon-button res-icon handle')
		.html('&#xF0AA;')
		.attr('title', 'drag and drop to move this filter');

	const $deleteButton = $('<div>')
		.addClass('res-icon-button res-icon deleteButton')
		.html('&#xF056;')
		.attr('title', 'remove this filter')
		.on('click', function() {
			if (confirm('Are you sure you want remove this filter?')) {
				$(this).trigger('change');
				$(this).closest('.builderItem').trigger('change').remove();
			}
		});

	const $editButton = $('<div>')
		.addClass('res-icon-button res-icon')
		.html('&#xF061;')
		.attr('title', 'copy and share, or update your settings with a new version')
		.on('click', function() {
			const data = readBuilderItem($(this).closest('.builderItem'), config);
			const json = prompt(
				'Copy this and share it, or paste a new version and update your settings',
				JSON.stringify(data)
			);
			if (json !== null) {
				const newData = JSON.parse(json);
				$body.trigger('change').replaceWith(drawBuilderItem(newData, config));
			}
		});

	$body.append([
		$('<div class="builderItemControls">').append($handle),
		$('<div class="builderItemControls builderTrailingControls">').append($editButton, $deleteButton),
		$header,
		$versionField,
		$wrapper,
	]);
	$wrapper.append(drawBuilderBlock(data.body, config));
	$wrapper.find('> .builderWrap > .builderControls').remove();
	makeBuilderBlocksSortable($wrapper);
	return $body;
}

function drawBlockControls() {
	const $handle = $('<div>')
		.addClass('res-icon-button res-icon handle')
		.html('&#xF0AA;')
		.attr('title', 'drag and drop to move this condition');

	return $('<div class="builderControls">').append($handle);
}

function drawBlockTrailingControls() {
	const $deleteButton = $('<div>')
		.addClass('res-icon-button res-icon deleteButton')
		.html('&#xF056;')
		.attr('title', 'remove this condition');
	$deleteButton.on('click', function() {
		if (confirm('Are you sure you want to delete this condition?')) {
			$(this).trigger('change');
			$(this).closest('.builderWrap').parent('li').remove();
		}
	});
	return $('<div class="builderControls builderTrailingControls">').append($deleteButton);
}

function drawBuilderBlock(data, config) {
	const $wrapper = $('<div class="builderWrap">');
	const $controls = drawBlockControls();
	const $trailingControls = drawBlockTrailingControls();
	const $block = $('<div class="builderBlock">');
	$wrapper.append($trailingControls, $controls, $block);
	$block.attr('data-type', data.type);

	const blockConfig = config[data.type];

	blockConfig.fields.forEach(field => {
		if (typeof field === 'string') return $block.append(field);

		const fieldModule = builderFields[field.type];
		if (fieldModule === undefined) throw new Error(`Unimplemented field type: ${field.type}`);
		$block.append(fieldModule.draw(data, field, config));
	});
	return $wrapper;
}

function readBuilderItem(item, config) {
	const $firstBlock = $(item).find('> .builderBody > .builderWrap > .builderBlock');
	return {
		note: $(item).find('> textarea[name=builderNote]').val(),
		ver: parseInt($(item).find('> input[name=version]').val(), 10),
		body: readBuilderBlock($firstBlock, config),
	};
}

function readBuilderBlock($element, config) {
	const type = $element.attr('data-type');
	const blockConfig = config[type];
	const data = { type };
	blockConfig.fields.forEach(field => {
		if (typeof field === 'string') return;
		const fieldType = field.type;
		const $fieldElem = $element.find(`> [name=${field.id}]`);
		if (typeof builderFields[fieldType].read === 'function') {
			data[field.id] = builderFields[fieldType].read($fieldElem, field, config);
		} else {
			data[field.id] = $fieldElem.val();
		}
	});
	return data;
}

function makeBuilderItemsSortable($builder) {
	function cleanupDrag($item) {
		$item.removeData('dragOffset');
		$(RESConfigPanelOptions).edgescroll('stop');
	}

	$builder.sortable({
		nested: false,
		handle: '.builderItem > .builderItemControls .handle',
		placeholderClass: 'RESSortPlaceholder',
		placeholder: '<div class="RESSortPlaceholder"></div>',
		containerSelector: '.optionBuilder',
		itemSelector: '.builderItem',
		onCancel($item, container, _super, event) {
			_super($item, container, _super, event);
			cleanupDrag($item);
		},
		onDrop($item, container, _super, event) {
			_super($item, container, _super, event);
			cleanupDrag($item);
			$item.trigger('change');
		},
		onDrag($item, position) {
			const dragOffset = $item.data('dragOffset');
			// Reposition the row, remembering to apply the offset
			$item.css({
				top: position.top - dragOffset.top,
				left: position.left - dragOffset.left,
			});
		},
		onDragStart($item, container, _super, event) {
			_super($item, container, _super, event);

			$(RESConfigPanelOptions).edgescroll({ speed: 4 });

			$item.css({
				position: 'absolute',
				height: $item.height(),
				width: $item.width(),
			});
			// Store this so we can keep what we are dragging at
			// the same relative cursor position
			const offset = $item.offset();
			const pointer = container.rootGroup.pointer;
			$item.data('dragOffset', {
				left: pointer.left - offset.left,
				top: pointer.top - offset.top,
			});
		},
	});
}

function makeBuilderBlocksSortable($builderItem) {
	function cleanupDrag($item) {
		$item.removeData('dragOffset');
		$(RESConfigPanelOptions).edgescroll('stop');
	}

	$builderItem.children('.builderWrap').sortable({
		nested: true,
		handle: '.handle',
		placeholderClass: 'RESSortPlaceholder',
		placeholder: '<li class="RESSortPlaceholder"></li>',
		containerSelector: '.builderWrap',
		itemPath: '> .builderBlock > .builderMulti',
		itemSelector: 'li',
		onCancel($item, container, _super, event) {
			_super($item, container, _super, event);
			cleanupDrag($item);
		},
		onDrop($item, container, _super, event) {
			_super($item, container, _super, event);
			cleanupDrag($item);
			$item.trigger('change');
		},
		onDrag($item, position) {
			const dragOffset = $item.data('dragOffset');
			// Reposition the row, remembering to apply the offset
			$item.css({
				top: position.top - dragOffset.top,
				left: position.left - dragOffset.left,
			});
		},
		onDragStart($item, container, _super, event) {
			_super($item, container, _super, event);

			$(RESConfigPanelOptions).edgescroll({ speed: 4 });

			$item.css({
				position: 'absolute',
				height: $item.height(),
				width: $item.width(),
			});
			// Store this so we can keep what we are dragging at
			// the same relative cursor position
			const offset = $item.offset();
			const pointer = container.rootGroup.pointer;
			$item.data('dragOffset', {
				left: pointer.left - offset.left,
				top: pointer.top - offset.top,
			});
		},
	});
}

const builderFields = {
	multi: {
		draw(data, blockConfig, config) {
			const $rowWrapper = $('<ul class="builderMulti">').attr('name', blockConfig.id);
			const items = data[blockConfig.id];
			items.forEach(itemData => drawBuilderBlock(itemData, config).appendTo($rowWrapper).wrap('<li>'));

			const $addButton = $('<select class="addBuilderBlock">');
			$addButton.append('<option value="">+ add a condition</option>');
			let addableKeys = blockConfig.include;
			if (addableKeys === 'all') addableKeys = Object.keys(config);
			addableKeys.forEach(key => {
				const name = config[key].name || key;
				$('<option>').text(name).val(key).appendTo($addButton);
			});
			$addButton.on('change', function() {
				const type = $(this).val();
				if (type !== '' && type in config) {
					const newRowData = config[type].defaultTemplate();
					const $newRow = drawBuilderBlock(newRowData, config);
					$rowWrapper.append($newRow);
					$newRow.wrap('<li>');
					$(this).val('');

					const firstText = $newRow.find('input[type=text], input[type=number], textarea')[0];
					if (firstText) {
						setTimeout(() => firstText.focus(), 200);
					}
				}
			});

			return $rowWrapper.add($addButton);
		},
		read($elem, fieldConfig, config) {
			return $elem.find('> li > .builderWrap > .builderBlock').map(function() {
				return readBuilderBlock($(this), config);
			}).get();
		},
	},
	number: {
		draw(data, blockConfig) {
			const id = blockConfig.id;
			return $('<input type="number">').attr('name', id).val(data[id]);
		},
	},
	check: {
		draw(data, blockConfig) {
			const id = blockConfig.id;
			return $('<input type="checkbox">').attr('name', id).val(data[id]);
		},
	},
	checkset: {
		uid: 0,
		draw(data, blockConfig) {
			const id = blockConfig.id;
			const prefixId = this.uid++;
			const $wrap = $('<div class="checkset">').attr('name', blockConfig.id);
			blockConfig.items.forEach((e, idx) => {
				const itemId = `checkset-${prefixId}-${idx}X`;
				const $box = $('<input type="checkbox" />')
					.attr('id', itemId)
					.attr('name', e);
				if (id in data && data[id].includes(e)) $box.prop('checked', true);
				const $label = $('<label>')
					.attr('for', itemId)
					.text(e);
				$wrap.append($box, $label);
			});
			return $wrap;
		},
		read($elem, fieldConfig) {
			return fieldConfig.items.filter(e => $elem.children(`[name="${e}"]`).prop('checked'));
		},
	},
	text: {
		draw(data, blockConfig) {
			const id = blockConfig.id;
			const $field = $('<input type="text">')
				.attr('name', id)
				.val(data[id]);
			if ('pattern' in blockConfig) {
				$field.attr('pattern', blockConfig.pattern);
			}
			if ('placeholder' in blockConfig) {
				$field.attr('placeholder', blockConfig.placeholder);
			}
			if ('validator' in blockConfig) {
				$field.on('input', function() {
					try {
						blockConfig.validator(this.value);
						this.setCustomValidity('');
					} catch (ex) {
						this.setCustomValidity('invalid');
					}
				});
			}
			return $field;
		},
	},
	duration: {
		draw(data, blockConfig) {
			// Store as milliseconds like JavaScript Date
			let durr = data[blockConfig.id];
			durr /= 60 * 1000;
			const minutes = durr % 60;
			durr = (durr - minutes) / 60;
			const hours = durr % 24;
			durr = (durr - hours) / 24;
			const days = durr;

			return $('<div class="durationField">')
				.attr('name', blockConfig.id)
				.append([
					$('<input type="number" name="days" />').val(days), ' days ',
					$('<input type="number" name="hours" />').val(hours), 'hours ',
					$('<input type="number" name="minutes" />').val(minutes), ' minutes ',
				]);
		},
		read($elem) {
			const days = parseFloat($elem.children('[name=days]').val()) || 0;
			const hours = parseFloat($elem.children('[name=hours]').val()) || 0;
			const minutes = parseFloat($elem.children('[name=minutes]').val()) || 0;

			// Store as milliseconds like JavaScript Date
			let duration = 0;
			duration += days * 24 * 60 * 60;
			duration += hours * 60 * 60;
			duration += minutes * 60;
			duration *= 1000;

			return duration;
		},
	},
	select: {
		draw(data, blockConfig) {
			const value = data[blockConfig.id];
			let entries = blockConfig.options;

			if (typeof entries === 'string') {
				entries = this.getPredefinedChoices(entries);
			}

			const $dropdown = $('<select>').attr('name', blockConfig.id);
			entries.forEach(row => {
				let label, value;
				if (typeof row === 'string') {
					label = value = row;
				} else {
					label = row[0];
					value = row[1];
				}
				$('<option>').text(label).val(value).appendTo($dropdown);
			});
			$dropdown.val(value);
			return $dropdown;
		},
		getPredefinedChoices(name) {
			if (name === 'COMPARISON') {
				return [
					['exactly', '=='],
					['not', '!='],
					['more than', '>'],
					['less than', '<'],
					['at least', '>='],
					['at most', '<='],
				];
			} else {
				throw new Error(`Option set "${name}" is not defined`);
			}
		},
	},
};
// End Builder Stuff

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
