/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Hover from './hover';

export const module: Module<*> = new Module('RESMenu');

module.moduleName = 'menuName';
module.category = 'coreCategory';
module.description = 'The <span class="gearIcon"></span> dropdown menu to manage RES settings and quick options';
module.alwaysEnabled = true;
module.hidden = true;

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
	RESPrefsLink = $('<span id="openRESPrefs"><button id="RESSettingsButton" class="gearIcon">RES Settings</button></span>')
		.mouseenter(() => showPrefsDropdown())
		.get(0);
	onClickMenuButton(() => showPrefsDropdown(0));
}

function addConsoleLink() {
	$('#header-bottom-right')
		.find('ul')
		.after(RESPrefsLink)
		.after('<span class="separator">|</span>');
}

function showPrefsDropdown(openDelay = 200) {
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

function getMenuButton() {
	return $(RESPrefsLink).find('.gearIcon');
}

let _onClickMenuButton;
let _isImportant = false;

export function onClickMenuButton(callback: () => void, isImportant?: boolean = false) {
	const menuButton = getMenuButton();
	if (!_onClickMenuButton || (isImportant && !_isImportant)) {
		_onClickMenuButton = $.Callbacks();
		_isImportant = isImportant;
		_onClickMenuButton.add(hidePrefsDropdown);
	}
	if (isImportant || !_onClickMenuButton.isImportant) {
		_onClickMenuButton.add(callback);
	}

	menuButton.on('click', _onClickMenuButton.fire);
}

function addLegacyStyling() {
	const gearIcon = RESPrefsLink.querySelector('.gearIcon');
	const backgroundImage = window.getComputedStyle(gearIcon).backgroundImage;
	if (backgroundImage && backgroundImage !== 'none') {
		gearIcon.classList.add('res-gearIcon-legacy');
	}
}
