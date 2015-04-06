addModule('RESMenu', function(module, moduleID) {
	module.moduleName = 'RES Menu';
	module.category = 'Core';
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

	var RESConsole = module; // alias for now
	var menuItems = $();

	function renderConsoleLink() {
		var RESPrefsLink = $('<span id="openRESPrefs"><span id="RESSettingsButton" title="RES Settings" class="gearIcon"></span>')
			.mouseenter(module.showPrefsDropdown.bind(module));
		module.RESPrefsLink = RESPrefsLink[0];
	}

	function addConsoleLink() {
		module.userMenu = document.querySelector('#header-bottom-right');
		$(module.userMenu).find('ul').after(module.RESPrefsLink).after('<span class="separator">|</span>');
	}

	module.showPrefsDropdown = function() {
		modules['dropdownList'].begin(module.RESPrefsLink, {}, populateDropdown);
	};
	module.hidePrefsDropdown = function() {
		modules['dropdownList'].close(true);
	};

	function populateDropdown(def, base, context) {
		def.resolve(menuItems);
	}

	module.addMenuItem = function (ele, onClick, prepend) {
		var menuItem = $(ele);
		if (!menuItem.is('li')) {
			menuItem = $('<li />').append(ele);
		}
		menuItem[0].addEventListener('click', onClick);

		if (prepend) {
			menuItems = menuItem.add(menuItems);
		} else {
			menuItems = menuItems.add(menuItem);
		}
	};


	module.setNewNotification = function(callback) {
		$(module.RESPrefsLink).add(module.gearOverlay).find('.gearIcon')
			.addClass('newNotification')
			.click(callback);
	};


	function addLegacyStyling() {
		var gearIcon = module.RESPrefsLink.querySelector('.gearIcon'),
			backgroundImage = window.getComputedStyle(gearIcon).backgroundImage;
		if (modules['styleTweaks'].isSubredditStyleEnabled() && backgroundImage && backgroundImage !== 'none') {
			document.body.classList.add('res-gearIcon-legacy');
		}
	}
});
