addModule('RESMenu', function(module, moduleID) {
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
		modules['hover'].dropdownList(moduleID, modules['hover'].HIDDEN_FROM_SETTINGS)
			.options({
				openDelay: 200,
				fadeDelay: 200,
				fadeSpeed: 0.2
			})
			.populateWith(populateDropdown)
			.target(module.RESPrefsLink.querySelector('#RESSettingsButton')) // workaround subreddit stylings where the container ends up super tall
			.begin();
	};
	module.hidePrefsDropdown = function() {
		modules['hover'].dropdownList(moduleID).close(true);
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

	function getMenuButton() {
		return $(module.RESPrefsLink).find('.gearIcon');
	}

	module.setNewNotification = function(callback, isImportant) {
		var gearIcon = getMenuButton();
		gearIcon.addClass('newNotification');
		module.onClickMenuButton(callback, isImportant);
		if (isImportant) {
			gearIcon.addClass('important');
		}
	};

	var onClickMenuButton;
	module.onClickMenuButton = function(callback, isImportant) {
		var menuButton = getMenuButton();
		if (!onClickMenuButton || (isImportant && !onClickMenuButton.isImportant)) {
			onClickMenuButton = $.Callbacks();
			onClickMenuButton.add(module.hidePrefsDropdown.bind(module));

			if (isImportant) {
				onClickMenuButton.isImportant = isImportant;
			}
		}
		if (isImportant || !onClickMenuButton.isImportant) {
			onClickMenuButton.add(callback);
		}

		menuButton.on('click', onClickMenuButton.fire);
	};

	function addLegacyStyling() {
		var gearIcon = module.RESPrefsLink.querySelector('.gearIcon'),
			backgroundImage = window.getComputedStyle(gearIcon).backgroundImage;
		if (modules['styleTweaks'].isSubredditStyleEnabled() && backgroundImage && backgroundImage !== 'none') {
			gearIcon.classList.add('res-gearIcon-legacy');
		}
	}
});
