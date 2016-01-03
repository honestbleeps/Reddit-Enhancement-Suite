addModule('userbarHider', (module, moduleID) => {
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
		description: 'User bar',
		bodyClass: true
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
		advanced: true,
		bodyClass: true
	};

	let userbar, userbarToggle;

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			userbarHider();
		}
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
					moduleID,
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
		userbarToggle = RESUtils.createElement('div', 'userbarToggle');
		userbarToggle.setAttribute('title', 'Toggle Userbar');
		document.querySelector('#header-bottom-right').classList.add('res-userbar-toggle');
		userbarToggle.addEventListener('click', () => toggleUserBar(), false);
		userbar.insertBefore(userbarToggle, userbar.firstChild);

		updateToggleButton(false);
	}

	function updateToggleButton(userbarHidden) {
		const $button = $(userbarToggle);

		$button.toggleClass('userbarHide', !userbarHidden);
		$button.toggleClass('userbarShow', userbarHidden);
		$button.html(userbarHidden ? '&laquo;' : '&raquo;');
	}

	function toggleUserbarElementsDisplay(userbarHidden) {
		const elements = $(userbar).children().not(userbarToggle);

		if (userbarHidden) {
			modules['accountSwitcher'].closeAccountMenu();
			elements.css('display', 'none');
		} else {
            // Unset display.
			elements.css('display', '');
		}
	}

	function updateUserbarStateOption(userbarHidden) {
		RESUtils.options.setOption(moduleID, 'userbarState', userbarHidden ? 'hidden' : 'visible');
	}
});
