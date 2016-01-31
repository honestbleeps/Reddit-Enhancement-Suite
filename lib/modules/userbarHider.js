addModule('userbarHider', function(module, moduleID) {
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

	var userbar;
	var userbarToggle;

	module.beforeLoad = async function() {
		// Migrate from previous version
		const userbarState = await RESEnvironment.storage.getRaw('RESmodules.styleTweaks.userbarState');
		if (userbarState) {
			RESUtils.options.setOption(moduleID, 'userbarState', userbarState);

			RESEnvironment.storage.delete('RESmodules.styleTweaks.userbarState');
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
		var userbarHidden = (module.options['userbarState'].value == 'hidden');
		updateUserbarStateOption(!userbarHidden);
		updateUserBar();
	}

	function updateUserBar() {
		var userbarHidden = (module.options['userbarState'].value == 'hidden');

		updateToggleButton(userbarHidden);
		toggleUserbarElementsDisplay(userbarHidden);
	}

	function addToggleButton() {
		userbarToggle = RESUtils.createElement('div', 'userbarToggle');
		userbarToggle.setAttribute('title', 'Toggle Userbar');
		document.querySelector('#header-bottom-right').classList.add('res-userbar-toggle');
		userbarToggle.addEventListener('click', function() {
			toggleUserBar();
		}, false);
		userbar.insertBefore(userbarToggle, userbar.firstChild);

		updateToggleButton(false);
	}

	function updateToggleButton(userbarHidden) {
		var $button = $(userbarToggle);

		$button.toggleClass('userbarHide', !userbarHidden);
		$button.toggleClass('userbarShow', userbarHidden);
		$button.html(userbarHidden ? '&laquo;' : '&raquo;');
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
