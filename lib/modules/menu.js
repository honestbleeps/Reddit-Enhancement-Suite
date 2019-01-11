/* @flow */

import { Module } from '../core/module';
import * as Modules from '../core/modules';
import { i18n } from '../environment';
import { string } from '../utils';
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

const items = [];
let RESPrefsLink;

module.go = () => {
	RESPrefsLink = string.html`<span id="RESSettingsButton" style="cursor: pointer" title="${i18n('RESSettings')}" class="gearIcon"></span>`;

	if (module.options.gearIconClickAction.value !== 'toggleMenuNoHover') {
		RESPrefsLink.addEventListener('mouseenter', () => { showPrefsDropdown(200); });
	}

	RESPrefsLink.addEventListener('click', () => {
		if (module.options.gearIconClickAction.value === 'openCommandLine' && Modules.isRunning(CommandLine)) {
			CommandLine.toggle();
			hidePrefsDropdown();
		} else if (module.options.gearIconClickAction.value === 'openSettings') {
			SettingsNavigation.open();
			hidePrefsDropdown();
		} else {
			showPrefsDropdown(0);
		}
	});

	const r2MenuPosition = document.body.querySelector('#header-bottom-right ul');
	if (r2MenuPosition) {
		r2MenuPosition.after(string.html`<span class="separator">|</span>`, RESPrefsLink);
	} else {
		Floater.addElement(RESPrefsLink, { order: 5 });
	}
};

module.afterLoad = () => {
	addLegacyStyling();
};

function showPrefsDropdown(openDelay: number) {
	Hover.dropdownList(module.moduleID, Hover.HIDDEN_FROM_SETTINGS)
		.options({
			openDelay,
			fadeDelay: 200,
			fadeSpeed: 0.2,
		})
		.populateWith(() => {
			const f = document.createDocumentFragment();
			f.append(...items.sort(({ order: a }, { order: b }) => a - b).map(buildItem));
			return [f];
		})
		.target(RESPrefsLink) // workaround subreddit stylings where the container ends up super tall
		.begin();
}

function hidePrefsDropdown() {
	Hover.dropdownList(module.moduleID).close(true);
}

export function addMenuItem(getElement: () => HTMLElement, onClick: (e: Event) => void = () => {}, order: number = 0) {
	items.push({ getElement, onClick, order });
}

function buildItem({ getElement, onClick }) {
	const li = document.createElement('li');
	li.addEventListener('click', onClick, true);
	// Dropdown will be closed on click unless event propagation is stopped
	li.addEventListener('click', hidePrefsDropdown);
	li.append(getElement());
	return li;
}

function addLegacyStyling() {
	const { backgroundImage } = window.getComputedStyle(RESPrefsLink);
	if (backgroundImage && backgroundImage !== 'none') {
		RESPrefsLink.classList.add('res-gearIcon-legacy');
	}
}
