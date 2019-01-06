/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import { i18n } from '../environment';
import { isAppType } from '../utils';
import * as Floater from './floater';
import * as Hover from './hover';
import * as SettingsNavigation from './settingsNavigation';
import * as CommandLine from './commandLine';

export const module: Module<*> = new Module('RESMenu');

module.moduleName = 'menuName';
module.category = 'coreCategory';
module.description = 'The <span class="gearIcon"></span> dropdown menu to manage RES settings and quick options';
module.descriptionRaw = true;
module.alwaysEnabled = true;
module.options = {
	gearIconClickAction: {
		title: 'menuGearIconClickActionTitle',
		type: 'enum',
		values: [{
			name: 'menuGearIconClickActionOpenSettings',
			value: 'openSettings',
		}, {
			name: 'menuGearIconClickActionOpenCommandLine',
			value: 'openCommandLine',
		}, {
			name: 'menuGearIconClickActionToggleMenu',
			value: 'toggleMenu',
		}, {
			name: 'menuGearIconClickActionToggleMenuNoHover',
			value: 'toggleMenuNoHover',
		}],
		value: 'toggleMenuNoHover',
		description: 'menuGearIconClickActionDesc',
		bodyClass: true,
		advanced: true,
	},
};

module.beforeLoad = () => {
	renderConsoleLink();
};

module.go = () => {
	addConsoleLink();
};

module.afterLoad = () => {
	addLegacyStyling();
};

let RESPrefsLink;
let $menuItems = $();

function renderConsoleLink() {
	RESPrefsLink = $(`<span id="openRESPrefs"><span id="RESSettingsButton" title="${i18n('RESSettings')}" class="gearIcon"></span>`)
		.mouseenter(() => {
			if (module.options.gearIconClickAction.value !== 'toggleMenuNoHover') {
				showPrefsDropdown(200);
			}
		})
		.find('.gearIcon').click(() => {
			if (module.options.gearIconClickAction.value === 'openCommandLine' && Modules.isRunning(CommandLine)) {
				CommandLine.toggle();
			} else if (module.options.gearIconClickAction.value === 'openSettings') {
				SettingsNavigation.open();
			} else {
				showPrefsDropdown(0);
			}
		}).end()
		.get(0);
}

function addConsoleLink() {
	$('#header-bottom-right')
		.find('ul')
		.after(RESPrefsLink)
		.after('<span class="separator">|</span>');
	if (isAppType('d2x')) Floater.addElement(RESPrefsLink, { order: 5 });
}

function showPrefsDropdown(openDelay: number) {
	Hover.dropdownList(module.moduleID, Hover.HIDDEN_FROM_SETTINGS)
		.options({
			openDelay,
			fadeDelay: 200,
			fadeSpeed: 0.2,
		})
		.populateWith(() => [$menuItems])
		.target(RESPrefsLink.querySelector('#RESSettingsButton')) // workaround subreddit stylings where the container ends up super tall
		.begin();
}

export function hidePrefsDropdown() {
	Hover.dropdownList(module.moduleID).close(true);
}

export function addMenuItem(ele: JQuery | HTMLElement | string, onClick?: (e: Event) => void, prepend?: boolean = false) {
	let $menuItem = $(ele);
	if (!$menuItem.is('li')) {
		$menuItem = $('<li />').append(ele);
	}

	if (onClick) $menuItem[0].addEventListener('click', onClick);

	if (prepend) {
		$menuItems = $menuItem.add($menuItems);
	} else {
		$menuItems = $menuItems.add($menuItem);
	}
}

function addLegacyStyling() {
	const gearIcon = RESPrefsLink.querySelector('.gearIcon');
	const backgroundImage = window.getComputedStyle(gearIcon).backgroundImage;
	if (backgroundImage && backgroundImage !== 'none') {
		gearIcon.classList.add('res-gearIcon-legacy');
	}
}
