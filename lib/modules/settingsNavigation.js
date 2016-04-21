import { $ } from '../vendor';
import { Alert } from '../utils';
import { Options } from '../core';

export const module = {};

module.moduleID = 'settingsNavigation';
module.moduleName = 'RES Settings Navigation';
module.category = 'Core';
module.description = 'Helping you get around the RES Settings Console with greater ease';
module.hidden = true;
module.alwaysEnabled = true;
module.options = {
	showAllOptions: {
		type: 'boolean',
		value: true,
		description: 'All options are displayed by default. Uncheck this box if you would like to hide advanced options.',
		noconfig: true
	},
	showAllOptionsAlert: {
		type: 'boolean',
		value: true,
		description: 'If a user clicks on a link to an advanced option while advanced options are hidden, should an alert be shown?',
		noconfig: true
	}
};
module.go = function() {
	window.addEventListener('hashchange', onHashChange);
	window.addEventListener('popstate', onPopState);
	setTimeout(onHashChange, 300); // for initial pageload; wait until after RES has completed loading
};

export function makeUrlHashLink(moduleID, optionKey, displayText, cssClass) {
	if (!displayText) {
		if (optionKey) {
			displayText = optionKey;
		} else if (modules[moduleID]) {
			displayText = modules[moduleID].moduleName;
		} else if (moduleID) {
			displayText = moduleID;
		} else {
			displayText = 'Settings';
		}
	}

	let title = ['RES Settings'];
	if (modules[moduleID]) {
		title.push(modules[moduleID].moduleName);
	}
	if (optionKey) {
		title.push(optionKey);
	}
	title = title.join(' &gt; ');

	const hash = makeUrlHash(moduleID, optionKey);
	return `<a class="${cssClass || ''}" href="${hash}" title="${title}">${displayText}</a>`;
}

export function makeUrlHash(moduleID, optionKey) {
	const hashComponents = ['#!settings'];

	if (moduleID) {
		hashComponents.push(moduleID);
	}

	if (moduleID && optionKey) {
		hashComponents.push(optionKey);
	}

	return hashComponents.join('/');
}

export function setUrlHash(moduleID, optionKey) {
	const titleComponents = ['RES Settings'];

	if (moduleID) {
		const mod = modules[moduleID];
		const moduleName = mod && mod.moduleName || moduleID;
		titleComponents.push(moduleName);

		if (optionKey) {
			titleComponents.push(optionKey);
		}
	}

	const hash = makeUrlHash(moduleID, optionKey);
	const title = titleComponents.join(' - ');

	if (location.hash !== hash) {
		history.pushState(hash, title, hash);
	}
}

export function resetUrlHash() {
	history.pushState('', document.title, location.pathname + location.search);
}

function onHashChange() {
	const hash = location.hash;
	if (hash.substring(0, 10) !== '#!settings') return;

	const params = hash.match(/\/(?:\w|\s|%20)+/g);
	let moduleID;
	if (params && params[0]) {
		moduleID = params[0].substring(1).replace('%20', ' ');
	}
	let optionKey;
	if (params && params[1]) {
		optionKey = params[1].substring(1).replace('%20', ' ');
	}

	loadSettingsPage(moduleID, optionKey);
}

function onPopState(event) {
	const state = typeof event.state === 'string' && event.state.split('/');
	if (!state || state[0] !== '#!settings') {
		if (modules['settingsConsole'].isOpen) {
			// Avoid adding a duplicate page to the browser history
			const resetUrl = false;
			modules['settingsConsole'].close({
				resetUrl
			});
		}
		return;
	}

	const moduleID = state[1];
	const optionKey = state[2];

	loadSettingsPage(moduleID, optionKey);
}

export async function loadSettingsPage(moduleID, optionKey) {
	const mod = moduleID && modules.hasOwnProperty(moduleID) && modules[moduleID];

	await modules['settingsConsole'].open(mod && mod.moduleID);

	if (moduleID === 'search') {
		modules['search'].search(optionKey);
	} else if (mod) {
		if (optionKey && mod.options.hasOwnProperty(optionKey)) {
			const $optionsPanel = $(modules['settingsConsole'].RESConsoleContent);
			const optionElement = $optionsPanel.find(`label[for="${optionKey}"]`);
			const optionParent = optionElement.parent();
			optionParent.addClass('highlight');
			optionParent.show();
			if (optionElement.length) {
				if (optionParent.hasClass('advanced') && !module.options.showAllOptions.value) {
					document.getElementById('RESConsoleContent').classList.remove('advanced-options-disabled');
					if (module.options.showAllOptionsAlert.value) {
						Alert.open('You opened a link to an advanced option, but not all options are shown. These options will be shown until you leave or refresh the page. If you want to see all options in the future, check the <i>Show all options</i> checkbox in the settings console title bar above.<br /><br /><label><input type="checkbox" class="disableAlert" checked="" style="margin:1px 5px 0px 0px;"> Always show this type of notification</label>');
						$('#alert_message .disableAlert').click(function() {
							Options.set(module, 'showAllOptionsAlert', this.checked);
						});
					}
				}
				const $configPanel = $(modules['settingsConsole'].RESConfigPanelOptions);
				const offset = optionElement.offset().top - $configPanel.offset().top - 10;
				$configPanel.scrollTop(offset);
			}
		}
	}
}
