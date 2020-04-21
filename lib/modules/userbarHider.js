/* @flow */

import { Module } from '../core/module';
import * as Options from '../core/options';
import { i18n } from '../environment';
import { BodyClasses } from '../utils';
import * as Notifications from './notifications';
import $ from 'jquery';

export const module: Module<*> = new Module('userbarHider');

module.moduleName = 'userbarHiderName';
module.description = 'userbarHiderDesc';
module.category = 'myAccountCategory';
module.disabledByDefault = true;

module.options = {
	userbarState: {
		title: 'userbarHiderUserbarStateTitle',
		type: 'enum',
		values: [{
			name: 'Visible',
			value: 'visible',
		}, {
			name: 'Hidden',
			value: 'hidden',
		}],
		value: 'visible',
		description: 'userbarHiderUserbarStateDesc',
	},
	toggleButtonState: {
		title: 'userbarHiderToggleButtonStateTitle',
		type: 'enum',
		values: [{
			name: 'Visible',
			value: 'visible',
		}, {
			name: 'Hidden',
			value: 'hidden',
		}],
		value: 'visible',
		description: 'userbarHiderToggleButtonStateDesc',
		advanced: true,
	},
};

let userbar, $userbarToggle;

module.contentStart = () => {
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
				header: i18n('userbarHiderUserBarHidden'),
				message: i18n('userbarHiderContentHiddenNotification', '«'),
			});
		}
	}
}

function toggleUserBar() {
	module.options.userbarState.value = module.options.userbarState.value === 'hidden' ? 'visible' : 'hidden';
	Options.save(module.options.userbarState);
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
		title: i18n('userbarHiderToggleUserbar'),
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
	BodyClasses.toggle(userbarHidden, 'res-hide-userbar');
}
