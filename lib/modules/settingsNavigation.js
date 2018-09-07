/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { i18n } from '../environment';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Menu from '../modules/menu';
import * as CommandLine from '../modules/commandLine';
import { string } from '../utils';

export const module: Module<*> = new Module('settingsNavigation');

module.moduleName = 'settingsNavName';
module.category = 'coreCategory';
module.description = 'settingsNavDesc';
module.hidden = true;
module.alwaysEnabled = true;
module.options = {
	showAllOptions: {
		title: 'settingsNavigationShowAllOptionsTitle',
		type: 'boolean',
		value: true,
		description: 'settingsNavigationShowAllOptionsDesc',
		noconfig: true,
	},
	showAllOptionsAlert: {
		title: 'settingsNavigationShowAllOptionsAlertTitle',
		type: 'boolean',
		value: true,
		description: 'settingsNavigationShowAllOptionsAlertDesc',
		noconfig: true,
	},
};

export const $menuItem = _.once(() => $('<div>', { id: 'SettingsConsole', text: i18n('RESSettingsConsole') }));

module.beforeLoad = () => {
	Menu.addMenuItem($menuItem(), () => {
		Menu.hidePrefsDropdown();
		loadSettingsPage();
	}, true);
};

module.go = () => {
	function findModules(val) {
		return Modules.all()
			.filter(v => !v.hidden)
			.map(v => v.moduleID)
			.filter(id => id.toLowerCase().match(val.toLowerCase()))
			.sort();
	}

	CommandLine.registerCommand(/^mod(?:ule?)?$/, 'module [name of module] - open module settings',
		(command, val) => {
			const matches = findModules(val);
			return matches.length ? `Open module ${matches[0]}` : 'Could not find any matching module.';
		},
		(command, val) => open(findModules(val)[0])
	);
};

export function makeUrlHashLink(moduleID: string, optionKey?: string, displayText?: string, cssClass?: string): string {
	const mod = Modules.getUnchecked(moduleID);
	if (!displayText) {
		if (mod && optionKey) {
			displayText = i18n(mod.options[optionKey].title);
		} else if (mod) {
			displayText = i18n(mod.moduleName);
		} else {
			displayText = 'Settings';
		}
	}

	let title = ['RES Settings'];
	if (mod) {
		title.push(i18n(mod.moduleName));
	}
	if (optionKey) {
		title.push(optionKey);
	}
	title = title.join(' &gt; ');

	const hash = makeUrlHash(moduleID, optionKey);
	return `<a class="${cssClass || ''}" href="${hash}" title="${title}">${displayText}</a>`;
}

export function makeUrlHash(moduleID?: string, optionKey?: string): string {
	const hashComponents = ['#res:settings'];

	if (moduleID) {
		hashComponents.push(moduleID);
	}

	if (moduleID && optionKey) {
		hashComponents.push(optionKey);
	}

	return hashComponents.join('/');
}

export function setUrlHash(moduleID?: string, optionKey?: string): void {
	const titleComponents = ['RES Settings'];

	if (moduleID) {
		const mod = Modules.getUnchecked(moduleID);
		const moduleName = mod && i18n(mod.moduleName) || moduleID;
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

export function isSettingsUrl(url: string): boolean {
	return url.includes('#!settings') || url.includes('#res:settings');
}

const iframe = document.createElement('iframe');

export function loadSettingsPage(moduleID?: string, optionKey?: string) {
	const hash = makeUrlHash(moduleID, optionKey);
	const url = new URL(hash, chrome.runtime.getURL('options.html'));
	if (location.origin === url.origin) {
		location.href = url.href;
	} else {
		iframe.hidden = false;
		iframe.src = url.href;
		iframe.addEventListener('hashchange', e => console.log(e));
		document.body.append(iframe);
	}
}
