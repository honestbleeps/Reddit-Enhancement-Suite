/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Options from '../core/options';
import * as AccountSwitcher from './accountSwitcher';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('userbarHider');

module.moduleName = 'userbarHiderName';
module.description = 'userbarHiderDesc';
module.category = 'myAccountCategory';

module.options = {
	userbarState: {
		type: 'enum',
		values: [{
			name: 'Visible',
			value: 'visible',
		}, {
			name: 'Hidden',
			value: 'hidden',
		}],
		value: 'visible',
		description: 'User bar',
	},
	toggleButtonState: {
		type: 'enum',
		values: [{
			name: 'Visible',
			value: 'visible',
		}, {
			name: 'Hidden',
			value: 'hidden',
		}],
		value: 'visible',
		description: 'Toggle button',
		advanced: true,
	},
};

let userbar, $userbarToggle;

module.go = () => {
	userbarHider();
};

function userbarHider() {
	userbar = document.getElementById('header-bottom-right');
	if (userbar) {
		if (module.options.toggleButtonState.value === 'visible' || module.options.userbarState.value === 'hidden') {
			addToggleButton();
		}
		if (module.options.userbarState.value === 'hidden') {
			updateUserBar();
			Notifications.showNotification({
				moduleID: module.moduleID,
				optionKey: 'userbarState',
				cooldown: 24 * 60 * 60 * 1000,
				header: 'User Bar Hidden',
				message: 'Your username, karma, preferences, <span class="gearIcon"></span> RES gear, and so on are hidden. You can show them again by clicking the &laquo; button in the top right corner.',
			});
		}
	}
}

function toggleUserBar() {
	const userbarHidden = (module.options.userbarState.value === 'hidden');
	updateUserbarStateOption(!userbarHidden);
	updateUserBar();
}

function updateUserBar() {
	const userbarHidden = (module.options.userbarState.value === 'hidden');

	updateToggleButton(userbarHidden);
	toggleUserbarElementsDisplay(userbarHidden);
}

function addToggleButton() {
	$userbarToggle = $('<div>', {
		id: 'userbarToggle',
		title: 'Toggle Userbar',
		click: () => toggleUserBar(),
	}).prependTo(userbar);

	document.querySelector('#header-bottom-right').classList.add('res-userbar-toggle');

	updateToggleButton(false);
}

function updateToggleButton(userbarHidden) {
	$userbarToggle
		.toggleClass('userbarHide', !userbarHidden)
		.toggleClass('userbarShow', userbarHidden)
		.html(userbarHidden ? '&laquo;' : '&raquo;');
}

function toggleUserbarElementsDisplay(userbarHidden) {
	const elements = $(userbar).children().not($userbarToggle);

	if (userbarHidden) {
		AccountSwitcher.closeAccountMenu();
	}

	elements.toggle();
}

function updateUserbarStateOption(userbarHidden) {
	Options.set(module, 'userbarState', userbarHidden ? 'hidden' : 'visible');
}
