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
let gear;

module.contentStart = () => {
	gear = string.html`<span id="RESSettingsButton" style="cursor: pointer" title="${i18n('RESSettings')}" class="gearIcon"></span>`;

	if (module.options.gearIconClickAction.value !== 'toggleMenuNoHover') {
		gear.addEventListener('mouseenter', () => { showDropdown(200); });
	}

	gear.addEventListener('click', () => {
		if (module.options.gearIconClickAction.value === 'openCommandLine' && Modules.isRunning(CommandLine)) {
			CommandLine.toggle();
			hideDropdown();
		} else if (module.options.gearIconClickAction.value === 'openSettings') {
			SettingsNavigation.open();
			hideDropdown();
		} else {
			showDropdown(0);
		}
	});

	const r2MenuPosition = document.body.querySelector('#header-bottom-right ul');
	if (r2MenuPosition) {
		r2MenuPosition.after(string.html`<span class="separator">|</span>`, gear);
	} else {
		Floater.addElement(gear, { order: 5 });
	}
};

module.afterLoad = () => {
	requestAnimationFrame(addLegacyStyling);
};

function showDropdown(openDelay: number) {
	Hover.dropdownList(module.moduleID)
		.options({
			openDelay,
			fadeDelay: 200,
			fadeSpeed: 0.2,
		}, false)
		.populateWith(() => {
			const f = document.createDocumentFragment();
			f.append(...items.sort(({ order: a }, { order: b }) => a - b).map(buildItem));
			return [f];
		})
		.target(gear) // workaround subreddit stylings where the container ends up super tall
		.begin();
}

function hideDropdown() {
	Hover.dropdownList(module.moduleID).close(true);
}

export function addMenuItem(getElement: () => HTMLElement, onClick: (e: Event) => void = () => {}, order: number = 0) {
	items.push({ getElement, onClick, order });
}

function buildItem({ getElement, onClick }) {
	const li = document.createElement('li');
	li.addEventListener('click', onClick, true);
	// Dropdown will be closed on click unless event propagation is stopped
	li.addEventListener('click', hideDropdown);
	li.append(getElement());
	return li;
}

function addLegacyStyling() {
	const { backgroundImage } = window.getComputedStyle(gear);
	if (backgroundImage && backgroundImage !== 'none') {
		gear.classList.add('res-gearIcon-legacy');
	}
}
