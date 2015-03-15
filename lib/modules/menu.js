addModule('RESMenu', function(module, moduleID) {
	module.moduleName = 'RES Menu';
	module.category = 'About RES';
	module.description = 'The <span class="gearIcon"></span> dropdown menu to manage RES settings and quick options';
	module.alwaysEnabled = true;
	module.hidden = true;

	module.beforeLoad = function() {
		renderConsoleLink();
		renderConsoleDropdown();
	};

	module.go = function() {
		addConsoleLink();
		addConsoleDropdown();
		addLegacyStyling();
	};

	var RESConsole = module; // alias for now

	function renderConsoleLink() {
		var RESPrefsLink = $('<span id="openRESPrefs"><span id="RESSettingsButton" title="RES Settings" class="gearIcon"></span>')
			.mouseenter(RESConsole.showPrefsDropdown);
		module.RESPrefsLink = RESPrefsLink[0];
	}

	function addConsoleLink() {
		module.userMenu = document.querySelector('#header-bottom-right');
		$(module.userMenu).find('ul').after(module.RESPrefsLink).after('<span class="separator">|</span>');
	}

	function renderConsoleDropdown() {
		module.gearOverlay = RESUtils.createElementWithID('div', 'RESMainGearOverlay');
		module.gearOverlay.setAttribute('class', 'RESGearOverlay');
		module.gearIcon = RESUtils.createElementWithID('div', null, 'gearIcon');
		module.gearOverlay.appendChild(module.gearIcon);

		module.prefsDropdown = RESUtils.createElementWithID('div', 'RESPrefsDropdown', 'RESDropdownList');
		module.prefsDropdownOptions = RESUtils.createElementWithID('ul', 'RESDropdownOptions');
		module.prefsDropdown.appendChild(module.prefsDropdownOptions);

		$(module.prefsDropdown).mouseleave(function() {
			RESConsole.hidePrefsDropdown();
		});
		$(module.prefsDropdown).mouseenter(function() {
			clearTimeout(RESConsole.prefsTimer);
		});
		$(module.gearOverlay).mouseleave(function() {
			RESConsole.prefsTimer = setTimeout(function() {
				RESConsole.hidePrefsDropdown();
			}, 1000);
		});
	}

	function addConsoleDropdown() {
		document.body.appendChild(module.gearOverlay);
		document.body.appendChild(module.prefsDropdown);
	}



	module.showPrefsDropdown = function(e) {
		var thisTop = parseInt($(RESConsole.userMenu).offset().top + 1, 10);
		var thisLeft = parseInt($(RESConsole.RESPrefsLink).offset().left - 6, 10);
		$('#RESMainGearOverlay').css('height', $('#header-bottom-right').outerHeight() + 'px');
		$('#RESMainGearOverlay').css('left', thisLeft + 'px');
		$('#RESMainGearOverlay').css('top', thisTop + 'px');
		RESConsole.prefsDropdown.style.top = parseInt(thisTop + $(RESConsole.userMenu).outerHeight(), 10) + 'px';
		RESConsole.prefsDropdown.style.right = '0px';
		RESConsole.prefsDropdown.style.display = 'block';
		$('#RESMainGearOverlay').show();
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'prefsDropdown');
	};
	module.hidePrefsDropdown = function(e) {
		RESConsole.RESPrefsLink.classList.remove('open');
		$('#RESMainGearOverlay').hide();
		RESConsole.prefsDropdown.style.display = 'none';
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'prefsDropdown');
	};

	module.addMenuItem = function (ele, onClick, prepend) {
		var menuItem = $('<li />').append(ele);
		menuItem.on('click', onClick);

		var container = $(modules['RESMenu'].prefsDropdownOptions);
		if (prepend) {
			container.prepend(menuItem);
		} else {
			container.append(menuItem);
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
		if (backgroundImage && backgroundImage !== 'none') {
			document.body.classList.add('res-gearIcon-legacy');
		}
	}
});
