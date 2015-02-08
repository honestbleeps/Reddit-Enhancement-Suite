addModule('RESMenu', function(module, moduleID) {
	module.moduleName = 'RES Menu';
	module.category = 'About RES';
	module.description = 'The <span class="gearIcon"></span> dropdown menu to manage RES settings and quick options';
	module.alwaysEnabled = true;
	module.hidden = true;

	module.go = function() {
		module.addConsoleLink();
		module.addConsoleDropdown();
		module.checkForUpdate();
	}

	var RESConsole = module; // alias for now

	module.addConsoleLink = function() {
		this.userMenu = document.querySelector('#header-bottom-right');
		if (this.userMenu) {
			var RESPrefsLink = $('<span id="openRESPrefs"><span id="RESSettingsButton" title="RES Settings" class="gearIcon"></span>')
				.mouseenter(RESConsole.showPrefsDropdown);
			$(this.userMenu).find('ul').after(RESPrefsLink).after('<span class="separator">|</span>');
			this.RESPrefsLink = RESPrefsLink[0];
		}
	}

	module.addConsoleDropdown = function() {
		var consoleOption = RESUtils.createElementWithID('li', 'SettingsConsole', null, 'RES settings console'),
			donateOption = RESUtils.createElementWithID('li', 'RES-donate', null, 'donate to RES');

		this.gearOverlay = RESUtils.createElementWithID('div', 'RESMainGearOverlay');
		this.gearOverlay.setAttribute('class', 'RESGearOverlay');
		this.gearIcon = RESUtils.createElementWithID('div', null, 'gearIcon');
		this.gearOverlay.appendChild(this.gearIcon);

		this.prefsDropdown = RESUtils.createElementWithID('div', 'RESPrefsDropdown', 'RESDropdownList');
		this.prefsDropdownOptions = RESUtils.createElementWithID('ul', 'RESDropdownOptions');

		this.prefsDropdownOptions.appendChild(consoleOption);
		this.prefsDropdownOptions.appendChild(donateOption);

		this.prefsDropdown.appendChild(this.prefsDropdownOptions);
		var thisSettingsButton = this.prefsDropdown.querySelector('#SettingsConsole');
		this.settingsButton = thisSettingsButton;
		thisSettingsButton.addEventListener('click', function() {
			RESConsole.hidePrefsDropdown();
			modules['settingsConsole'].open();
		}, true);
		var thisDonateButton = this.prefsDropdown.querySelector('#RES-donate');
		thisDonateButton.addEventListener('click', function() {
			RESUtils.openLinkInNewTab('http://redditenhancementsuite.com/contribute.html', true);
		}, true);
		$(this.prefsDropdown).mouseleave(function() {
			RESConsole.hidePrefsDropdown();
		});
		$(this.prefsDropdown).mouseenter(function() {
			clearTimeout(RESConsole.prefsTimer);
		});
		$(this.gearOverlay).mouseleave(function() {
			RESConsole.prefsTimer = setTimeout(function() {
				RESConsole.hidePrefsDropdown();
			}, 1000);
		});
		document.body.appendChild(this.gearOverlay);
		document.body.appendChild(this.prefsDropdown);
		if (RESStorage.getItem('RES.newAnnouncement', 'true')) {
			module.setNewNotification();
		}
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
	}


	module.setNewNotification = function() {
		$('#RESSettingsButton, #RESMainGearOverlay .gearIcon').addClass('newNotification').click(function() {
			location.href = '/r/RESAnnouncements';
		});
	};

	// checkForUpdate: function(forceUpdate) {
	module.checkForUpdate = function() {
		if (RESUtils.currentSubreddit('RESAnnouncements')) {
			RESStorage.removeItem('RES.newAnnouncement', 'true');
		}
		var now = Date.now();
		var lastCheck = parseInt(RESStorage.getItem('RESLastUpdateCheck'), 10) || 0;
		// if we haven't checked for an update in 24 hours, check for one now!
		// if (((now - lastCheck) > 86400000) || (RESVersion > RESStorage.getItem('RESlatestVersion')) || ((RESStorage.getItem('RESoutdated') === 'true') && (RESVersion === RESStorage.getItem('RESlatestVersion'))) || forceUpdate) {
		if ((now - lastCheck) > 86400000) {
			// now we're just going to check /r/RESAnnouncements for new posts, we're not checking version numbers...
			var lastID = RESStorage.getItem('RES.lastAnnouncementID');
			$.getJSON('/r/RESAnnouncements/.json?limit=1&app=res', function(data) {
				RESStorage.setItem('RESLastUpdateCheck', now);
				var thisID = data.data.children[0].data.id;
				if (thisID !== lastID) {
					RESStorage.setItem('RES.newAnnouncement', 'true');
					module.setNewNotification();
				}
				RESStorage.setItem('RES.lastAnnouncementID', thisID);
			});
		}
	};
});
