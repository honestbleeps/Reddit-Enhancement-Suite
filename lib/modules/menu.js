import { $ } from '../vendor';
import * as Hover from './hover';
import * as StyleTweaks from './styleTweaks';

export const module = {};

module.moduleID = 'RESMenu';
module.moduleName = 'RES Menu';
module.category = ['Core'];
module.description = 'The <span class="gearIcon"></span> dropdown menu to manage RES settings and quick options';
module.alwaysEnabled = true;
module.hidden = true;

module.beforeLoad = function() {
	renderConsoleLink();
};

module.go = function() {
	addConsoleLink();
};


module.afterLoad = function() {
	addLegacyStyling();
};

let RESPrefsLink;
let $menuItems = $();

function renderConsoleLink() {
	RESPrefsLink = $('<span id="openRESPrefs"><span id="RESSettingsButton" title="RES Settings" class="gearIcon"></span>')
		.mouseenter(showPrefsDropdown)
		.get(0);
}

function addConsoleLink() {
	$('#header-bottom-right')
		.find('ul')
		.after(RESPrefsLink)
		.after('<span class="separator">|</span>');
}

function showPrefsDropdown() {
	Hover.dropdownList(module.moduleID, Hover.HIDDEN_FROM_SETTINGS)
		.options({
			openDelay: 200,
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

export function addMenuItem(ele, onClick, prepend) {
	let $menuItem = $(ele);
	if (!$menuItem.is('li')) {
		$menuItem = $('<li />').append(ele);
	}
	$menuItem[0].addEventListener('click', onClick);

	if (prepend) {
		$menuItems = $menuItem.add($menuItems);
	} else {
		$menuItems = $menuItems.add($menuItem);
	}
}

function getMenuButton() {
	return $(RESPrefsLink).find('.gearIcon');
}

export function setNewNotification(callback, isImportant) {
	const gearIcon = getMenuButton();
	gearIcon.addClass('newNotification');
	onClickMenuButton(callback, isImportant);
	if (isImportant) {
		gearIcon.addClass('important');
	}
}

let _onClickMenuButton;
export function onClickMenuButton(callback, isImportant) {
	const menuButton = getMenuButton();
	if (!_onClickMenuButton || (isImportant && !_onClickMenuButton.isImportant)) {
		_onClickMenuButton = $.Callbacks();
		_onClickMenuButton.add(hidePrefsDropdown);

		if (isImportant) {
			_onClickMenuButton.isImportant = isImportant;
		}
	}
	if (isImportant || !_onClickMenuButton.isImportant) {
		_onClickMenuButton.add(callback);
	}

	menuButton.on('click', _onClickMenuButton.fire);
}

function addLegacyStyling() {
	const gearIcon = RESPrefsLink.querySelector('.gearIcon');
	const backgroundImage = window.getComputedStyle(gearIcon).backgroundImage;
	if (StyleTweaks.isSubredditStyleEnabled() && backgroundImage && backgroundImage !== 'none') {
		gearIcon.classList.add('res-gearIcon-legacy');
	}
}
