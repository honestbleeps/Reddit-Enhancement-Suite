addModule('userbarHider', function(module, moduleID) {
	module.moduleName = 'User Bar Hider';
	module.description = 'Hide the user bar (username, karma, preferences, etc.) in the top right corner. <br> Previously part of Style Tweaks';
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
		description: 'Is the userbar visible?'
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
		description: 'Is the button to toggle the userbar visible? Only applies when the user bar is visible',
		advanced: true
	};

	var userbar;
	var userbarToggle;

	module.beforeLoad = function() {
		// Migrate from previous version
		var userbarState = RESStorage.getItem('RESmodules.styleTweaks.userbarState');
		if (userbarState) {
			RESUtils.options.setOption(moduleID, 'userbarState', userbarState);

			RESStorage.removeItem('RESmodules.styleTweaks.userbarState');
		}
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			userbarHider();
		}
	};

	function userbarHider() {
		userbar = document.getElementById('header-bottom-right');
		if (userbar) {
			if (module.options['toggleButtonState'].value === 'visible' || module.options['userbarState'].value === 'hidden') {
				addToggleButtonCSS();
				addToggleButton();
			}
			if (module.options['userbarState'].value === 'hidden') {
				updateUserBar();
				modules['notifications'].showNotification({
					moduleID: moduleID,
					optionKey: 'userbarState',
					cooldown: 24 * 60 * 60 * 1000,
					header: 'User Bar Hidden',
					message: 'Your username, karma, preferences, <span class="gearIcon"></span> RES gear, and so on are hidden. You can show them again by clicking the &laquo; button in the top right corner.'
				});
			}
		}
	}

	function toggleUserBar() {
		var userbarHidden = (module.options['userbarState'].value == 'hidden');
		updateUserbarStateOption(!userbarHidden);
		updateUserBar();
	}

	function updateUserBar() {
		var userbarHidden = (module.options['userbarState'].value == 'hidden');

		updateToggleButton(userbarHidden);
		toggleUserbarElementsDisplay(userbarHidden);
	}

	function addToggleButtonCSS() {
		RESUtils.addCSS('#userbarToggle { min-height: 22px; position: absolute; top: auto; bottom: 0; left: -5px; width: 16px; padding-right: 3px; height: 100%; font-size: 15px; border-radius: 4px 0; color: #a1bcd6; display: inline-block; background-color: #dfecf9; border-right: 1px solid #cee3f8; cursor: pointer; text-align: right; line-height: 24px; }');
		RESUtils.addCSS('#userbarToggle.userbarShow { min-height: 26px; }');
		RESUtils.addCSS('#header-bottom-right.res-userbar-toggle > .user { margin-left: 16px; }');
		// RESUtils.addCSS('.userbarHide { background-position: 0 -137px; }');
		RESUtils.addCSS('#userbarToggle.userbarShow { left: -12px; }');
		RESUtils.addCSS('.res-navTop #userbarToggle.userbarShow { top: 0; bottom: auto; }');

		// var currHeight = $(userbar).height();
		// $(userbarToggle).css('height', currHeight+'px');
	}

	function addToggleButton() {
		userbarToggle = RESUtils.createElement('div', 'userbarToggle');
		userbarToggle.setAttribute('title', 'Toggle Userbar');
		document.querySelector('#header-bottom-right').classList.add('res-userbar-toggle');
		userbarToggle.addEventListener('click', function(e) {
			toggleUserBar();
		}, false);
		userbar.insertBefore(userbarToggle, userbar.firstChild);

		updateToggleButton(false);
	}

	function updateToggleButton(userbarHidden) {
		var button = $(userbarToggle);

		button.toggleClass('userbarHide', !userbarHidden);
		button.toggleClass('userbarShow', userbarHidden);
		button.html(userbarHidden ? '&laquo;' : '&raquo;');
	}

	function toggleUserbarElementsDisplay(userbarHidden) {
		var elements = $(userbar).children().not(userbarToggle);

		if (userbarHidden) {
			modules['accountSwitcher'].closeAccountMenu();
			elements.css('display', 'none');
		} else {
			var inlineElements = elements.filter(function(ele) {
				return ((/mail/.test(ele.className)) || (ele.id === 'openRESPrefs'));
			});
			inlineElements.css('display', 'inline');
			elements.not(inlineElements).css('display', 'inline-block');
		}
	}

	function updateUserbarStateOption(userbarHidden) {
		RESUtils.options.setOption(moduleID, 'userbarState', userbarHidden ? 'hidden' : 'visible');
	}
});
