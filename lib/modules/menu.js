addModule('RESMenu', function(module, moduleID) {
	module.moduleName = 'RES Menu';
	module.category = 'About RES';
	module.description = 'The <span class="gearIcon"></span> dropdown menu to manage RES settings and quick options';
	module.alwaysEnabled = true;
	module.hidden = true;

	module.beforeLoad = function() {
		renderConsoleLink();
		renderConsoleDropdown();
	}

	module.go = function() {
		addConsoleLink();
		addConsoleDropdown();
	}

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
		var consoleOption = RESUtils.createElementWithID('li', 'SettingsConsole', null, 'RES settings console');

		module.gearOverlay = RESUtils.createElementWithID('div', 'RESMainGearOverlay');
		module.gearOverlay.setAttribute('class', 'RESGearOverlay');
		module.gearIcon = RESUtils.createElementWithID('div', null, 'gearIcon');
		module.gearOverlay.appendChild(module.gearIcon);

		module.prefsDropdown = RESUtils.createElementWithID('div', 'RESPrefsDropdown', 'RESDropdownList');
		module.prefsDropdownOptions = RESUtils.createElementWithID('ul', 'RESDropdownOptions');

		module.prefsDropdownOptions.appendChild(consoleOption);

		module.prefsDropdown.appendChild(module.prefsDropdownOptions);
		var thisSettingsButton = module.prefsDropdown.querySelector('#SettingsConsole');
		module.settingsButton = thisSettingsButton;
		thisSettingsButton.addEventListener('click', function() {
			RESConsole.hidePrefsDropdown();
			modules['settingsConsole'].open();
		}, true);

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
		// var thisRight = parseInt($(window).width() - $(RESConsole.RESPrefsLink).offset().left, 10);
		// thisRight = 175-thisRight;
		var thisLeft = parseInt($(RESConsole.RESPrefsLink).offset().left - 6, 10);
		// $('#RESMainGearOverlay').css('left',thisRight+'px');
		$('#RESMainGearOverlay').css('height', $('#header-bottom-right').outerHeight() + 'px');
		$('#RESMainGearOverlay').css('left', thisLeft + 'px');
		$('#RESMainGearOverlay').css('top', thisTop + 'px');
		RESConsole.prefsDropdown.style.top = parseInt(thisTop + $(RESConsole.userMenu).outerHeight(), 10) + 'px';
		RESConsole.prefsDropdown.style.right = '0px';
		RESConsole.prefsDropdown.style.display = 'block';
		$('#RESMainGearOverlay').show();
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'prefsDropdown');
	}
	module.hidePrefsDropdown = function(e) {
		RESConsole.RESPrefsLink.classList.remove('open');
		$('#RESMainGearOverlay').hide();
		RESConsole.prefsDropdown.style.display = 'none';
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'prefsDropdown');
	};

	module.addMenuItem = function (ele, onClick) {
		$('<li />').append(ele)
			.on('click', onClick)
			.appendTo(modules['RESMenu'].prefsDropdownOptions);
	};


	module.setNewNotification = function(callback) {
		$('#RESSettingsButton, #RESMainGearOverlay .gearIcon')
			.addClass('newNotification')
			.click(callback);
	};

});
