import { $ } from '../vendor';
import { Options } from '../core';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'userbarHider';
	module.moduleName = 'User Bar Hider';
	module.description = 'Add a toggle button to show or hide the user bar.';
	module.category = ['My account'];

	module.options['userbarState'] = {
		type: 'enum',
		values: [{
			name: 'Visible',
			value: 'visible'
		}, {
			name: 'Hidden',
			value: 'hidden'
		}],
		value: 'visible',
		description: 'User bar'
	};

	module.options['toggleButtonState'] = {
		type: 'enum',
		values: [{
			name: 'Visible',
			value: 'visible'
		}, {
			name: 'Hidden',
			value: 'hidden'
		}],
		value: 'visible',
		description: 'Toggle button',
		advanced: true
	};

	let userbar, $userbarToggle;

	module.go = function() {
		userbarHider();
	};

	function userbarHider() {
		userbar = document.getElementById('header-bottom-right');
		if (userbar) {
			if (module.options['toggleButtonState'].value === 'visible' || module.options['userbarState'].value === 'hidden') {
				addToggleButton();
			}
			if (module.options['userbarState'].value === 'hidden') {
				updateUserBar();
				modules['notifications'].showNotification({
					moduleID: module.moduleID,
					optionKey: 'userbarState',
					cooldown: 24 * 60 * 60 * 1000,
					header: 'User Bar Hidden',
					message: 'Your username, karma, preferences, <span class="gearIcon"></span> RES gear, and so on are hidden. You can show them again by clicking the &laquo; button in the top right corner.'
				});
			}
		}
	}

	function toggleUserBar() {
		const userbarHidden = (module.options['userbarState'].value === 'hidden');
		updateUserbarStateOption(!userbarHidden);
		updateUserBar();
	}

	function updateUserBar() {
		const userbarHidden = (module.options['userbarState'].value === 'hidden');

		updateToggleButton(userbarHidden);
		toggleUserbarElementsDisplay(userbarHidden);
	}

	function addToggleButton() {
		$userbarToggle = $('<div>', {
			id: 'userbarToggle',
			title: 'Toggle Userbar',
			click: () => toggleUserBar()
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
			modules['accountSwitcher'].closeAccountMenu();
			elements.css('display', 'none');
		} else {
			// Unset display.
			elements.css('display', '');
		}
	}

	function updateUserbarStateOption(userbarHidden) {
		Options.set(module.moduleID, 'userbarState', userbarHidden ? 'hidden' : 'visible');
	}
}
