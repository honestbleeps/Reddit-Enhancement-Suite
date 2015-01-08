// define the RESConsole class
var RESConsole = {
	modalOverlay: '',
	RESConsoleContainer: '',
	RESMenuItems: [],
	RESConfigPanelOptions: null,
	// make the modules panel accessible to this class for updating (i.e. when preferences change, so we can redraw it)
	RESConsoleConfigPanel: RESUtils.createElementWithID('div', 'RESConsoleConfigPanel', 'RESPanel'),
	RESConsoleAboutPanel: RESUtils.createElementWithID('div', 'RESConsoleAboutPanel', 'RESPanel'),
	addConsoleLink: function() {
		this.userMenu = document.querySelector('#header-bottom-right');
		if (this.userMenu) {
			var RESPrefsLink = $('<span id="openRESPrefs"><span id="RESSettingsButton" title="RES Settings" class="gearIcon"></span>')
				.mouseenter(RESConsole.showPrefsDropdown);
			$(this.userMenu).find('ul').after(RESPrefsLink).after('<span class="separator">|</span>');
			this.RESPrefsLink = RESPrefsLink[0];
		}
	},
	addConsoleDropdown: function() {
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
			RESConsole.open();
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
			RESUtils.setNewNotification();
		}
	},
	showPrefsDropdown: function(e) {
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
	},
	hidePrefsDropdown: function(e) {
		RESConsole.RESPrefsLink.classList.remove('open');
		$('#RESMainGearOverlay').hide();
		RESConsole.prefsDropdown.style.display = 'none';
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'prefsDropdown');
	},
	resetModulePrefs: function() {
		var prefs = {
			'userTagger': true,
			'betteReddit': true,
			'singleClick': true,
			'subRedditTagger': true,
			'uppersAndDowners': true,
			'keyboardNav': true,
			'commentPreview': true,
			'showImages': true,
			'showKarma': true,
			'usernameHider': false,
			'accountSwitcher': true,
			'styleTweaks': true,
			'filteReddit': true,
			'spamButton': false
		};
		this.setModulePrefs(prefs);
		return prefs;
	},
	getAllModulePrefs: function(force) {
		var storedPrefs;
		// if we've done this before, just return the cached version
		if ((!force) && (typeof this.getAllModulePrefsCached !== 'undefined')) {
			return this.getAllModulePrefsCached;
		}
		// get the stored preferences out first.
		if (RESStorage.getItem('RES.modulePrefs') !== null) {
			storedPrefs = safeJSON.parse(RESStorage.getItem('RES.modulePrefs'), 'RES.modulePrefs');
		} else if (RESStorage.getItem('modulePrefs') !== null) {
			// Clean up old moduleprefs.
			storedPrefs = safeJSON.parse(RESStorage.getItem('modulePrefs'), 'modulePrefs');
			RESStorage.removeItem('modulePrefs');
			this.setModulePrefs(storedPrefs);
		} else {
			// looks like this is the first time RES has been run - set prefs to defaults...
			storedPrefs = this.resetModulePrefs();
		}
		if (storedPrefs === null) {
			storedPrefs = {};
		}
		// create a new JSON object that we'll use to return all preferences. This is just in case we add a module, and there's no pref stored for it.
		var prefs = {};
		// for any stored prefs, drop them in our prefs JSON object.
		for (var module in modules) {
			if (storedPrefs[module]) {
				prefs[module] = storedPrefs[module];
			} else if ((!modules[module].disabledByDefault) &&
					((storedPrefs[module] == null) ||(module.alwaysEnabled))) {
				// looks like a new module, or no preferences. We'll default it to on.
				prefs[module] = true;
			} else {
				prefs[module] = false;
			}
		}
		if ((typeof prefs !== 'undefined') && (prefs !== 'undefined') && (prefs)) {
			this.getAllModulePrefsCached = prefs;
			return prefs;
		}
	},
	getModulePrefs: function(moduleID) {
		if (moduleID) {
			var prefs = this.getAllModulePrefs();
			return prefs[moduleID];
		} else {
			alert('no module name specified for getModulePrefs');
		}
	},
	setModulePrefs: function(prefs) {
		if (prefs !== null) {
			RESStorage.setItem('RES.modulePrefs', JSON.stringify(prefs));
			return prefs;
		} else {
			alert('error - no prefs specified');
		}
	},
	create: function() {
		var logoImg, header1, RESConsoleHeader, RESConsoleTopBar;

		// create the console container
		this.RESConsoleContainer = RESUtils.createElementWithID('div', 'RESConsoleContainer');
		// hide it by default...
		// this.RESConsoleContainer.style.display = 'none';
		// create a modal overlay
		this.modalOverlay = RESUtils.createElementWithID('div', 'modalOverlay');
		this.modalOverlay.addEventListener('click', function(e) {
			e.preventDefault();
			return false;
		}, true);
		document.body.appendChild(this.modalOverlay);
		// create the header
		RESConsoleHeader = RESUtils.createElementWithID('div', 'RESConsoleHeader');
		// create the top bar and place it in the header
		RESConsoleTopBar = RESUtils.createElementWithID('div', 'RESConsoleTopBar');
		this.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAeCAMAAABHRo19AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACxFBMVEXw8/wAAAD+//8EBAQSEhIPDw/w8/v+/v4JCQkHBwcCAgKSk5W8vLz9SADz8/MtLS0iIiIcHBz/VAAYGBmRkZFkZGUkJCQVFhZiYmOZmp2QkpfQ09r9/f3n6vA5OTkvLy//TAAxMTEUFRTl5eVqa2zu8fnt7/fV19ydnqCen6Lt8Pj/TwDk5ORaWlrg4ug1NTUpKSrX19cgICDp6/J6enrFxcW1trpDQ0M7OzwnJyenp6f6TQAXFxj/WACFhojr6+uNjpBHR0cfHx+vr7GSkpJMTEwYGBg+Pj5cXF3CwsJISEj29vYQEBDe3t7+SwBmZmixsbH19fXo6OhQUFAgICJgYWXHyM3q7PTs7vW3uLvb3eKqq650dXbS09js7/aTlJY5OjmUlJeenp7r7vWWl5n8/Px4eHihoqWEhYfO0NTj5euDg4Pa3OGRkpTJy8/g4ODe4Obc3Nzv8vqjo6O1tbW3uLyrq6t1dXX5ya5/f3/5xqxZWVqKiopra2v4uJb99vLCw8fFxsouLS6Oj5Hs7OzY2t+jpKZ4eXv2tY8NDQ35WQny8vJkZGT2lWGQkJB8fHzi5OrLzNFAQUPm6O/3f0W7u7v3oXP4dTb2nXH62MX3pHb87+bn5+dWV1dvb3E0NDT4lWP3jFP4vJn2cS79+vaJioxNTU376d72f0H4Wwf2fT7759z9+fX1lmH4XAv2bSb40bheX2A6Ojr9+vj76t/9+vf76+H5XxVGRkZxcnPQ0te+vr52dnaztLfExMT2tZFYWFhSUlLV1dVwcXL52MS4uLiysrKam5rW1tZPT1CVlZWYmJiUlJRHR0ipqq0qKiqzs7P39/fq6urj4+P89fH09PT6+vo4ODjq7PNsbW4oKCh0dHTv7++3t7fk5u2IiYtFRUU3NzdPT0/Kysru7u6NjY1tbW1gYGBfX19sbGyHh4fh4eEzPXfuAAACPElEQVR4Xq3SQ9fkQBTH4bpVSdru17Zt28bYtm3btm3btm37S8yk0oteTKc7c+a3uf/Nc3JyEvT/48KF69Uhu7dk3AfaZ48PRiHgUwLdpGLdtFbecrkPOxvjuSRcmp2vaIsQt6gdLME4UtlGGs6NFW7+GIw7Qidp2BAq3KaQWg650mwC9LSs6JpRfZG03PTo32reMrmzIW3IlGaSZY/W+aCcoY/xq1SCKXAC5xAaGObkFoSmZoK3uaxqlgzL6vol3UohjIpDLWq6J4jaaNZUnsb4syMCsHU5o10q4015sZAshp2LuuCu4DSZFzJrrh0GURj3Ai8BNHrQ08TdyvZXDsDzYBD+W4OJK5bFh9nGIaRuKKTTxw5fOtJTUCtWjh3H31NQiCdOso2DiVlXSsXGDN+M6XRdnlmtmUNXYrGaLPhD3IFvoQfQrH4KkMdRsjgiK2IZXcurs4zHVvFrdSasQTaeTFu7DtPWa4yaDXSd0xh9N22mMyUVieItWwW8bfuOnbvo2r1n7779mOZ6QByHHsRChw4fsXwsz6OPsdDxE0i0kyQA20rLFIhjzuW0TVxIgpB4Z+AsBRXn1RZTdeEivXFyFbLXJTaJvmkDNJgLrly95iR3juTt9eIbyH6ucJPq2hJGQQiru63lbbriDocc6C7cu1/BgwcPH9U/4cdT9TNQIcd6/oK8fFWbg4Vev0n0I6VvkcO9A38Fq495X5T3wZkhLvAROZ6KYT59Lvvy9VvU9x8/1fW/DEygHfEbNdeCkgdk4HMAAAAASUVORK5CYII=';
		// this string is split because a specific sequence of characters screws up some git clients into thinking this file is binary.
		this.loader = 'data:image/gif;base64,R0lGODlhHQAWANUAAESatESetEyetEyitEyivFSivFSmvFymvFyqvGSqvGSqxGSuxGyuxGyyxHSyxHS2xHS2zHy2zHy6zIS6zIS+zIy+zIzCzIzC1JTG1JzK1JzK3JzO3KTO3KTS3KzS3KzW3LTW3LTW5LTa5Lza5Lze5MTe5MTi5MTi7Mzi7Mzm7NTm7NTq7Nzq7Nzq9Nzu9OTu9OTy9Ozy9Oz29Oz2/PT2/PT6/Pz6/Pz+/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH';
		this.loader += '/C05FVFNDQVBFMi4wAwEAAAAh/h1CdWlsdCB3aXRoIEdJRiBNb3ZpZSBHZWFyIDQuMAAh+QQIBgAAACwAAAAAHQAWAAAG/sCbcEgs3myyEIzjQr2MUGjrgpFMrJIMhxTtei4SbPhKwXCeXaLren00GIuHlSLxzNJDD4NOWST8CwsUgxEjeEIcDYN0ICkjFA4UFYMcRXckIS8XKysTCJKSGCMkHBUXpwwXRC8UGheLpgsMDBKmF6YWF7kODYY3LmawoKcXCxIKFMSnkBIELDczIxODk2SmpoMFbg8XDg4SAAoTNTUY1BcTDQsKCw2nGGAMBAUJDQcCDZ8yNzESya8NFDCAEFAChoO6GGSowEDDggsq0HhIZisVixkwQFDBkIHCARQ1XICosSIGEYe5MFjAsE8IigwcYWa402VEyoNmRozgkEFDbs8MBRS0jJJCwAOcMn1u4MBTA4UHNdLIgIAOg08NGphqZWAggohDHBIEqMCRqZYMEjZMMPBgaJcYcDAcQMBhwgMOGOg9AOHrUIkQ8hJQQKDgQaQFEQ4ZuRABxSwREtqWcKHYiIwaWm6UGBG18o0gACH5BAgGAAAALAAAAAAdABYAAAb';
		this.loader += '+wJtwSCwKXabWBjaS2YxQowqDkUysEg4GFe1+LtgrVkKddYsvCRbSYCwcEgpl4jGfhR3GnLJILP4JchQQJXdCHhCCEiApIxUNFZESGkUzNCsaMBwjMRQFE3IVGCMkHBYXFBcQGEM1NhRUexWqCRAQsxcWuBcXEQgkQjEXGYIUFanIDxENEry5F48SByo3MCWCx1fGzlcHCxKQEggUAgYWrqjGcg0LCguQuVUNBwUJbgIKDBFmMKi4DfnYKCBDhUqDCRgWYFDmAoYQDs2cMcCwYkaMEBYKUjiAAsaMDzFgxCDiocEpDBcwjBSSIkMGDRkwWHDYJUSqghg2jBjB4eVzSwwKINA4Y0JAhIIuYcLkoKFnAwc1zsyYYCFC0pccsmZNcNCDoQ4FCmAQ1TPr2A4JClCIeufFggcUAkDg8ECCBwkF4F4YYYhlCAQFHEwwwECCAwcINDzpK2QGBQ4gFEwAsSDDDA4vGBOxUaMfFw5cNN8IAgAh+QQIBgAAACwAAAAAHQAWAAAG/sCbcEgsClcqlAc2qtWMUCOKc5FYrZyK6xmFhizWiURMxmBm3SIMMp48GoyFQ0Kpc9BpIcchpiz+';
		this.loader += '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';
		RESConsoleTopBar.setAttribute('class', 'RESDialogTopBar');
		logoImg = RESUtils.createElementWithID('img', 'RESLogo');
		logoImg.src = this.logo;

		header1 = RESUtils.createElementWithID('h1', null, null, 'reddit enhancement suite');

		RESConsoleTopBar.appendChild(logoImg);
		RESConsoleTopBar.appendChild(header1);

		RESConsoleHeader.appendChild(RESConsoleTopBar);
		this.RESConsoleVersionDisplay = RESUtils.createElementWithID('div', 'RESConsoleVersionDisplay');
		$(this.RESConsoleVersionDisplay).text('v' + RESVersion);
		RESConsoleTopBar.appendChild(this.RESConsoleVersionDisplay);

		// Create the search bar and place it in the top bar
		var RESSearchContainer = modules['search'].renderSearchForm();
		RESConsoleTopBar.appendChild(RESSearchContainer);

		var RESSubredditLink = RESUtils.createElementWithID('a', 'RESConsoleSubredditLink');
		$(RESSubredditLink).text('/r/Enhancement');
		RESSubredditLink.setAttribute('href', '/r/Enhancement');
		RESSubredditLink.setAttribute('alt', 'The RES Subreddit');
		RESConsoleTopBar.appendChild(RESSubredditLink);
		// create the close button and place it in the header
		var RESClose = RESUtils.createElementWithID('span', 'RESClose', 'RESCloseButton');
		$(RESClose).text('×');
		RESClose.addEventListener('click', function(e) {
			e.preventDefault();
			RESConsole.close();
		}, true);
		RESConsoleTopBar.appendChild(RESClose);
		// create the "show all options" checkbox and place it in the header
		var RESAdvOptionsSpan = RESUtils.createElementWithID('span', 'RESAllOptionsSpan');
		RESAdvOptionsSpan.setAttribute('title', modules['settingsNavigation'].options.showAllOptions.description);
		var RESAdvOptions = RESUtils.createElementWithID('input', 'RESAllOptions');
		RESAdvOptions.setAttribute('type', 'checkbox');
		RESAdvOptions.addEventListener('change', function(e) {
			RESUtils.setOption('settingsNavigation', 'showAllOptions', this.checked);
			RESConsole.updateAdvancedOptionsVisibility();
		}, true);
		RESAdvOptionsSpan.appendChild(RESAdvOptions);
		var RESAdvOptionsLabel = document.createElement('label');
		RESAdvOptionsLabel.setAttribute('for', 'RESAdvOptions');
		$(RESAdvOptionsLabel).text('Show all options');
		RESAdvOptionsSpan.appendChild(RESAdvOptionsLabel);
		RESConsoleTopBar.appendChild(RESAdvOptionsSpan);

		this.categories = [];
		for (var module in modules) {
			if ((typeof modules[module].category !== 'undefined') && (this.categories.indexOf(modules[module].category) === -1)) {
				this.categories.push(modules[module].category);
			}
		}
		this.categories.sort(function(a, b) {
			if (a === 'About RES') return 1;
			if (b === 'About RES') return -1;
			return a.localeCompare(b);
		});
		// create the menu
		var menuItems = this.categories;
		var RESMenu = RESUtils.createElementWithID('ul', 'RESMenu');
		menuItems.forEach(function(menuItem) {
			var thisMenuItem = document.createElement('li');
			$(thisMenuItem).text(menuItem);
			thisMenuItem.setAttribute('id', 'Menu-' + menuItem);
			thisMenuItem.addEventListener('click', function(e) {
				e.preventDefault();
				RESConsole.menuClick(this);
			}, true);
			RESMenu.appendChild(thisMenuItem);
		});
		RESConsoleHeader.appendChild(RESMenu);
		this.RESConsoleContainer.appendChild(RESConsoleHeader);
		// Store the menu items in a global variable for easy access by the menu selector function.
		RESConsole.RESMenuItems = RESMenu.querySelectorAll('li');
		// Create a container for each management panel
		this.RESConsoleContent = RESUtils.createElementWithID('div', 'RESConsoleContent');
		if (modules['settingsNavigation'].options.showAllOptions.value) {
			RESAdvOptions.checked = true;
		} else {
			this.RESConsoleContent.classList.add('advanced-options-disabled');
		}
		this.RESConsoleContainer.appendChild(this.RESConsoleContent);
		// Okay, the console is done. Add it to the document body.
		document.body.appendChild(this.RESConsoleContainer);

		window.addEventListener('keydown', function(e) {
			if ((RESConsole.captureKey) && (e.keyCode !== 16) && (e.keyCode !== 17) && (e.keyCode !== 18)) {
				// capture the key, display something nice for it, and then close the popup...
				e.preventDefault();
				var keyArray;
				if (e.keyCode === 8) { // backspace, we disable the shortcut
					keyArray = [-1, false, false, false, false];
				} else {
					keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
				}
				document.getElementById(RESConsole.captureKeyID).value = keyArray.join(',');
				document.getElementById(RESConsole.captureKeyID + '-display').value = RESUtils.niceKeyCode(keyArray);
				RESConsole.keyCodeModal.style.display = 'none';
				RESConsole.captureKey = false;
			}
		});

		$('#RESConsoleContent').on({
			focus: function(e) {
				// show dialog box to grab keycode, but display something nice...
				$(RESConsole.keyCodeModal).css({
					display: 'block',
					top: RESUtils.mouseY + 'px',
					left: RESUtils.mouseX + 'px'
				});
				// RESConsole.keyCodeModal.style.display = 'block';
				RESConsole.captureKey = true;
				RESConsole.captureKeyID = this.getAttribute('capturefor');
			},
			blur: function(e) {
				$(RESConsole.keyCodeModal).css('display', 'none');
			}
		}, '.keycode + input[type=text][displayonly]');

		this.keyCodeModal = RESUtils.createElementWithID('div', 'keyCodeModal');
		$(this.keyCodeModal).text('Press a key (or combination with shift, alt and/or ctrl) to assign this action.');
		document.body.appendChild(this.keyCodeModal);
	},
	drawConfigPanel: function(category) {
		if (!category) return;

		this.drawConfigPanelCategory(category);
	},
	getModuleIDsByCategory: function(category) {
		var moduleList = Object.getOwnPropertyNames(modules);

		moduleList = moduleList.filter(function(moduleID) {
			return !modules[moduleID].hidden;
		});
		moduleList = moduleList.filter(function(moduleID) {
			return modules[moduleID].category === category;
		});
		moduleList.sort(function(moduleID1, moduleID2) {
			var a = modules[moduleID1];
			var b = modules[moduleID2];

			if (a.sort !== void 0 || b.sort !== void 0) {
				var sortComparison = (a.sort || 0) - (b.sort || 0);
				if (sortComparison !== 0) {
					return sortComparison;
				}
			}

			if (a.moduleName.toLowerCase() > b.moduleName.toLowerCase()) return 1;
			return -1;
		});

		return moduleList;
	},
	drawConfigPanelCategory: function(category, moduleList) {
		var header = RESUtils.createElementWithID('h1', null, null, 'RES Module Configuration'),
			p = document.createTextNode('Select a module from the column at the left to enable or disable it, and configure its various options.');

		$(this.RESConsoleConfigPanel).empty();

		/*
		var moduleTest = RESStorage.getItem('moduleTest');
		if (moduleTest) {
			console.log(moduleTest);
			// TEST loading stored modules...
			var evalTest = eval(moduleTest);
		}
		*/
		moduleList = moduleList || this.getModuleIDsByCategory(category);

		this.RESConfigPanelModulesPane = RESUtils.createElementWithID('div', 'RESConfigPanelModulesPane');

		function showModuleConfig(e) {
			RESConsole.showConfigOptions(e.target.getAttribute('moduleID'));
		}

		moduleList.forEach(function(module) {
			var thisModuleButton = RESUtils.createElementWithID('div', 'module-' + module);
			thisModuleButton.classList.add('moduleButton');
			var thisModule = module;
			$(thisModuleButton).text(modules[thisModule].moduleName);
			if (modules[thisModule].isEnabled()) {
				thisModuleButton.classList.add('enabled');
			}
			thisModuleButton.setAttribute('moduleID', modules[thisModule].moduleID);
			thisModuleButton.addEventListener('click', showModuleConfig, false);
			this.RESConfigPanelModulesPane.appendChild(thisModuleButton);
		}, this);
		this.RESConsoleConfigPanel.appendChild(this.RESConfigPanelModulesPane);

		this.RESConfigPanelOptions = RESUtils.createElementWithID('div', 'RESConfigPanelOptions');

		this.RESConfigPanelOptions.appendChild(header);
		this.RESConfigPanelOptions.appendChild(p);

		this.RESConsoleConfigPanel.appendChild(this.RESConfigPanelOptions);
		if (!this.RESConsoleContainer) {
			RESConsole.create();
		}

		this.RESConsoleContent.appendChild(this.RESConsoleConfigPanel);
	},
	updateSelectedModule: function(moduleID) {
		var moduleButtons = $(RESConsole.RESConsoleConfigPanel).find('.moduleButton');
		moduleButtons.removeClass('active');
		moduleButtons.filter(function() {
			return this.getAttribute('moduleID') === moduleID;
		})
			.addClass('active');
	},
	drawOptionInput: function(moduleID, optionName, optionObject, isTable) {
		var thisOptionFormEle;
		switch (optionObject.type) {
			case 'textarea':
				// textarea...
				thisOptionFormEle = RESUtils.createElementWithID('textarea', optionName);
				thisOptionFormEle.setAttribute('type', 'textarea');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				// this is typed user input and therefore safe, we allow HTML for a few settings.
				$(thisOptionFormEle).html(escapeHTML(optionObject.value));
				break;
			case 'text':
				// text...
				thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('type', 'text');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				thisOptionFormEle.setAttribute('placeHolder', optionObject.placeHolder || '');
				thisOptionFormEle.setAttribute('value', optionObject.value);
				break;
			case 'color':
				// color...
				thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('type', 'color');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				// thisOptionFormEle.setAttribute('value', optionObject.value); // didn't work on chrome, need to work with .value
				thisOptionFormEle.value = optionObject.value;
				break;
			case 'button':
				// button...
				thisOptionFormEle = RESUtils.createElementWithID('button', optionName);
				thisOptionFormEle.classList.add('RESConsoleButton');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				thisOptionFormEle.textContent = optionObject.text;
				thisOptionFormEle.addEventListener('click', optionObject.callback, false);
				break;
			case 'list':
				// list...
				thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('class', 'RESInputList');
				thisOptionFormEle.setAttribute('type', 'text');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				// thisOptionFormEle.setAttribute('value', optionObject.value);
				var existingOptions = optionObject.value;
				if (typeof existingOptions === 'undefined') existingOptions = '';

				var optionArray, prepop, listSpec;
				optionArray = existingOptions.split(',');
				prepop = optionArray.filter(function(option) {
					return option !== '';
				}).map(function(option) {
					return {
						id: option,
						name: option
					};
				});
				listSpec = RESUtils.options.listTypes[optionObject.listType] || optionObject;

				setTimeout(function() {
					$(thisOptionFormEle).tokenInput(listSpec.source, {
						method: 'POST',
						queryParam: 'query',
						theme: 'facebook',
						allowFreeTagging: true,
						zindex: 999999999,
						onResult: (typeof listSpec.onResult === 'function') ? listSpec.onResult : null,
						onCachedResult: (typeof listSpec.onCachedResult === 'function') ? listSpec.onCachedResult : null,
						prePopulate: prepop,
						hintText: (typeof listSpec.hintText === 'string') ? listSpec.hintText : null
					});
				}, 100);
				break;
			case 'password':
				// password...
				thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('type', 'password');
				thisOptionFormEle.setAttribute('moduleID', moduleID);
				thisOptionFormEle.setAttribute('value', optionObject.value);
				break;
			case 'boolean':
				// checkbox
				/*
				var thisOptionFormEle = RESUtils.createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('type','checkbox');
				thisOptionFormEle.setAttribute('moduleID',moduleID);
				thisOptionFormEle.setAttribute('value',optionObject.value);
				if (optionObject.value) {
					thisOptionFormEle.setAttribute('checked',true);
				}
				*/
				thisOptionFormEle = RESUtils.toggleButton(moduleID, optionName, optionObject.value, null, null, isTable);
				break;
			case 'enum':
				// radio buttons
				if (typeof optionObject.values === 'undefined') {
					alert('misconfigured enum option in module: ' + moduleID);
				} else {
					thisOptionFormEle = RESUtils.createElementWithID('div', optionName);
					thisOptionFormEle.setAttribute('class', 'enum');
					optionObject.values.forEach(function(optionValue, index) {
						var thisId = optionName + '-' + index;
						var thisOptionFormSubEle = RESUtils.createElementWithID('input', thisId);
						if (isTable) thisOptionFormSubEle.setAttribute('tableOption', 'true');
						thisOptionFormSubEle.setAttribute('type', 'radio');
						thisOptionFormSubEle.setAttribute('name', optionName);
						thisOptionFormSubEle.setAttribute('moduleID', moduleID);
						thisOptionFormSubEle.setAttribute('value', optionValue.value);
						var nullEqualsEmpty = ((optionObject.value === null) && (optionValue.value === ''));
						// we also need to check for null == '' - which are technically equal.
						if ((optionObject.value === optionValue.value) || nullEqualsEmpty) {
							thisOptionFormSubEle.setAttribute('checked', 'checked');
						}
						var thisLabel = document.createElement('label');
						thisLabel.setAttribute('for', thisId);
						var thisOptionFormSubEleText = document.createTextNode(' ' + optionValue.name + ' ');
						thisLabel.appendChild(thisOptionFormSubEleText);
						thisOptionFormEle.appendChild(thisOptionFormSubEle);
						thisOptionFormEle.appendChild(thisLabel);
						var thisBR = document.createElement('br');
						thisOptionFormEle.appendChild(thisBR);
					});
				}
				break;
			case 'keycode':
				// keycode - shows a key value, but stores a keycode and possibly shift/alt/ctrl combo.
				var realOptionFormEle = $('<input>').attr({
					id: optionName,
					type: 'text',
					class: 'keycode',
					moduleID: moduleID
				}).css({
					border: '1px solid red',
					display: 'none'
				}).val(optionObject.value);
				if (isTable) realOptionFormEle.attr('tableOption', 'true');

				var thisKeyCodeDisplay = $('<input>').attr({
					id: optionName + '-display',
					type: 'text',
					capturefor: optionName,
					displayonly: 'true'
				}).val(RESUtils.niceKeyCode(optionObject.value));
				thisOptionFormEle = $('<div>').append(realOptionFormEle).append(thisKeyCodeDisplay)[0];
				break;
			default:
				console.log('misconfigured option in module: ' + moduleID);
				break;
		}
		if (isTable) {
			thisOptionFormEle.setAttribute('tableOption', 'true');
		}
		return thisOptionFormEle;
	},
	enableModule: function(moduleID, onOrOff) {
		var prefs = this.getAllModulePrefs(true);
		prefs[moduleID] = !! onOrOff;
		this.setModulePrefs(prefs);
		if (typeof modules[moduleID].onToggle === 'function') {
			modules[moduleID].onToggle(onOrOff);
		}
	},
	showConfigOptions: function(moduleID) {
		if (!modules[moduleID]) return;
		RESConsole.drawConfigOptions(moduleID);
		RESConsole.updateSelectedModule(moduleID);
		RESConsole.currentModule = moduleID;

		RESConsole.RESConsoleContent.scrollTop = 0;

		modules['settingsNavigation'].setUrlHash(moduleID);
	},
	drawConfigOptions: function(moduleID) {
		if (modules[moduleID] && modules[moduleID].hidden) return;
		var thisOptions = RESUtils.getOptions(moduleID),
			optCount = 0,
			moduleNameSpan = RESUtils.createElementWithID('span', null, 'moduleName', modules[moduleID].moduleName),
			toggleOn = RESUtils.createElementWithID('span', null, 'toggleOn noCtrlF', 'on'),
			toggleOff = RESUtils.createElementWithID('span', null, 'toggleOff noCtrlF', 'off'),
			thisHeader,
			thisToggle, thisDescription, allOptionsContainer,
			thisOptionContainer, containerID, thisLabel,
			thisSaveButton,
			thisOptionFormEle,
			i, dep;

		this.RESConfigPanelOptions.setAttribute('style', 'display: block;');
		$(this.RESConfigPanelOptions).html('');
		// put in the description, and a button to enable/disable the module, first..
		thisHeader = document.createElement('div');
		thisHeader.classList.add('moduleHeader');
		thisHeader.appendChild(moduleNameSpan);

		thisToggle = document.createElement('div');
		thisToggle.classList.add('moduleToggle');
		if (modules[moduleID].alwaysEnabled) {
			thisToggle.style.display = 'none';
		}

		thisToggle.appendChild(toggleOn);
		thisToggle.appendChild(toggleOff);
		if (modules[moduleID].isEnabled()) {
			thisToggle.classList.add('enabled');
		}
		thisToggle.setAttribute('moduleID', moduleID);

		thisToggle.addEventListener('click', function(e) {
			var activePane = RESConsole.RESConfigPanelModulesPane.querySelector('.active'),
				enabled = this.classList.contains('enabled');

			if (enabled) {
				activePane.classList.remove('enabled');
				this.classList.remove('enabled');
				if (RESConsole.moduleOptionsScrim) {
					RESConsole.moduleOptionsScrim.classList.add('visible');
				}
				$('#moduleOptionsSave').hide();
			} else {
				activePane.classList.add('enabled');
				this.classList.add('enabled');
				if (RESConsole.moduleOptionsScrim) {
					RESConsole.moduleOptionsScrim.classList.remove('visible');
				}
				$('#moduleOptionsSave').fadeIn();
			}
			RESConsole.enableModule(this.getAttribute('moduleID'), !enabled);
		}, true);
		thisHeader.appendChild(thisToggle);

		function saveModuleOptions(e) {
			e.preventDefault();
			RESConsole.saveCurrentModuleOptions();
		}

		thisSaveButton = this.RESConsoleConfigPanel.querySelector('#moduleOptionsSave');
		if (thisSaveButton === null) {
			thisSaveButton = RESUtils.createElementWithID('input', 'moduleOptionsSave');
			thisSaveButton.setAttribute('type', 'button');
			thisSaveButton.setAttribute('value', 'save options');
			thisSaveButton.addEventListener('click', saveModuleOptions, true);
			this.RESConsoleConfigPanel.appendChild(thisSaveButton);
		}
		$(thisSaveButton).toggle(Object.getOwnPropertyNames(thisOptions).length > 0);

		if (thisHeader.querySelector('#moduleOptionsSaveStatus') === null) {
			var thisSaveStatus = RESUtils.createElementWithID('div', 'moduleOptionsSaveStatus', 'saveStatus');
			thisHeader.appendChild(thisSaveStatus);
		}


		thisDescription = document.createElement('div');
		thisDescription.classList.add('moduleDescription');

		// TODO: potentially use markdown instead of HTML for descriptions and convert on the
		// fly with SnuOwnd. Using .html() is safe here because we control each module's
		// description field, but for future code review sanity we should consider updating.
		if (typeof modules[moduleID].onConsoleOpen === 'function') {
			modules[moduleID].onConsoleOpen();
		}
		$(thisDescription).html(modules[moduleID].description);
		thisHeader.appendChild(thisDescription);
		this.RESConfigPanelOptions.appendChild(thisHeader);
		allOptionsContainer = RESUtils.createElementWithID('div', 'allOptionsContainer');
		this.RESConfigPanelOptions.appendChild(allOptionsContainer);
		// now draw all the options...
		for (i in thisOptions) {
			if (!thisOptions[i].noconfig) {
				optCount++;
				containerID = 'optionContainer-' + moduleID + '-' + i;
				thisOptionContainer = RESUtils.createElementWithID('div', containerID, 'optionContainer');
				dep = thisOptions[i].dependsOn;
				if (dep) {
					// we'll store a list of dependents on the 'parent' so we can show/hide them on
					// the fly as necessary
					if (! thisOptions[dep].dependents) {
						thisOptions[dep].dependents = [];
					}
					// add this option to that list.
					thisOptions[dep].dependents.push(i);
					// if the option this one depends on is false, hide it
					if (!thisOptions[dep].value) {
						thisOptionContainer.setAttribute('style', 'display: none;');
					}
				}

				if (thisOptions[i].advanced) {
					thisOptionContainer.classList.add('advanced');
				}
				thisLabel = document.createElement('label');
				thisLabel.setAttribute('for', i);
				var niceDefaultOption = null;
				switch (thisOptions[i].type) {
					case 'textarea':
					case 'text':
					case 'password':
					case 'list':
						niceDefaultOption = thisOptions[i].default;
						break;
					case 'color':
						niceDefaultOption = thisOptions[i].default;
						if (thisOptions[i].default.substr(0,1) === '#') {
							niceDefaultOption += ' (R:' + parseInt(thisOptions[i].default.substr(1,2),16) + ', G:' + parseInt(thisOptions[i].default.substr(3,2),16) + ', B:' + parseInt(thisOptions[i].default.substr(5,2),16) + ')';
						}
						break;
					case 'boolean':
						niceDefaultOption = thisOptions[i].default ? 'on' : 'off';
						break;
					case 'enum':
						thisOptions[i].values.some(function(thisValue) {
							if (thisOptions[i].default === thisValue.value) {
								niceDefaultOption = thisValue.name;
								return true;
							}
							return false;
						});
						break;
					case 'keycode':
						niceDefaultOption = RESUtils.niceKeyCode(thisOptions[i].default);
						break;
				}
				if (niceDefaultOption !== null) {
					thisLabel.setAttribute('title', 'Default: ' + niceDefaultOption);
				}
				$(thisLabel).text(i);
				var thisOptionDescription = RESUtils.createElementWithID('div', null, 'optionDescription');
				// TODO: same as above in this function, let's use markdown in the future
				$(thisOptionDescription).html(thisOptions[i].description);
				thisOptionContainer.appendChild(thisLabel);
				if (thisOptions[i].type === 'table') {
					var isFixed = thisOptions[i].addRowText === false; // set addRowText value to false to disable additing/removing/moving of row
					thisOptionDescription.classList.add('table');
					// table - has a list of fields (headers of table), users can add/remove rows...
					if (typeof thisOptions[i].fields === 'undefined') {
						alert('Misconfigured table option in module: ' + moduleID + ' - options of type "table" must have fields defined.');
					} else {
						// get field names...
						var fieldNames = [];
						// now that we know the field names, get table rows...
						var thisTable = document.createElement('table');
						thisTable.setAttribute('moduleID', moduleID);
						thisTable.setAttribute('optionName', i);
						thisTable.setAttribute('class', 'optionsTable');
						var thisThead = document.createElement('thead');
						var thisTableHeader = document.createElement('tr'),
							thisTH;
						thisTable.appendChild(thisThead);
						thisOptions[i].fields.forEach(function(field) {
							fieldNames.push(field.name);
							thisTH = document.createElement('th');
							$(thisTH).text(field.name);
							thisTableHeader.appendChild(thisTH);
						});
						if (!isFixed) {
							// add delete column
							thisTH = document.createElement('th');
							thisTableHeader.appendChild(thisTH);
							// add move column
							thisTH = document.createElement('th');
							thisTableHeader.appendChild(thisTH);
						}
						thisThead.appendChild(thisTableHeader);
						thisTable.appendChild(thisThead);
						var thisTbody = document.createElement('tbody'),
							thisTR, thisTD;
						thisTbody.setAttribute('id', 'tbody_' + i);
						if (thisOptions[i].value) {
							thisOptions[i].value.forEach(function(thisValue, j) {
								thisTR = document.createElement('tr');
								$(thisTR).data('itemidx-orig', j);
								thisOptions[i].fields.forEach(function(thisOpt, k) {
									thisTD = document.createElement('td');
									thisTD.className = 'hasTableOption';
									var thisFullOpt = i + '_' + thisOpt.name;
									thisOpt.value = thisValue[k];
									// var thisOptInputName = thisOpt.name + '_' + j;
									var thisOptInputName = thisFullOpt + '_' + j;
									var thisTableEle = this.drawOptionInput(moduleID, thisOptInputName, thisOpt, true);
									thisTD.appendChild(thisTableEle);
									thisTR.appendChild(thisTD);
								}, this);
								if (!isFixed) {
									// add delete button
									thisTD = document.createElement('td');
									var thisDeleteButton = document.createElement('div');
									$(thisDeleteButton)
										.addClass('res-icon-button res-icon deleteButton')
										.html('&#xF056;')
										.attr('title', 'remove this row');

									thisDeleteButton.addEventListener('click', RESConsole.deleteOptionRow);
									thisTD.appendChild(thisDeleteButton);
									thisTR.appendChild(thisTD);

									// add move handle
									thisTD = document.createElement('td');
									var thisHandle = document.createElement('div');
									$(thisHandle)
									.addClass('res-icon-button res-icon handle')
										.html('&#xF0B5;')
										.attr('title', 'drag and drop to move this row')

									thisTD.appendChild(thisHandle);
									thisTR.appendChild(thisTD);
								}
								thisTbody.appendChild(thisTR);
							}, this);
						}
						thisTable.appendChild(thisTbody);
						thisOptionFormEle = thisTable;
					}
					thisOptionContainer.appendChild(thisOptionDescription);
					thisOptionContainer.appendChild(thisOptionFormEle);
					if (!isFixed) {
						// Create an "add row" button...
						var addRowText = thisOptions[i].addRowText || 'Add Row';
						var addRowButton = document.createElement('input');
						addRowButton.classList.add('addRowButton');
						addRowButton.setAttribute('type', 'button');
						addRowButton.setAttribute('value', addRowText);
						addRowButton.setAttribute('optionName', i);
						addRowButton.setAttribute('moduleID', moduleID);
						addRowButton.addEventListener('click', function() {
							var optionName = this.getAttribute('optionName');
							var thisTbodyName = 'tbody_' + optionName;
							var thisTbody = document.getElementById(thisTbodyName);
							var newRow = document.createElement('tr');
							var rowCount = (thisTbody.querySelectorAll('tr')) ? thisTbody.querySelectorAll('tr').length + 1 : 1;
							modules[moduleID].options[optionName].fields.forEach(function(thisOpt) {
								var newCell = document.createElement('td');
								newCell.className = 'hasTableOption';
								if (thisOpt.type !== 'enum') thisOpt.value = '';
								var optionNameWithRow = optionName + '_' + thisOpt.name + '_' + rowCount;
								var thisInput = RESConsole.drawOptionInput(moduleID, optionNameWithRow, thisOpt, true);
								newCell.appendChild(thisInput);
								newRow.appendChild(newCell);
								$(newRow).data('option-index', rowCount - 1);
								var firstText = newRow.querySelector('input[type=text]');
								if (!firstText) firstText = newRow.querySelector('textarea');
								if (firstText) {
									setTimeout(function() {
										firstText.focus();
									}, 200);
								}
							});
							// add delete button
							thisTD = document.createElement('td');
							var thisDeleteButton = document.createElement('div');
							thisDeleteButton.className = 'deleteButton';
							thisDeleteButton.addEventListener('click', RESConsole.deleteOptionRow);
							thisTD.appendChild(thisDeleteButton);
							newRow.appendChild(thisTD);
							// add move handle
							thisTD = document.createElement('td');
							var thisHandle = document.createElement('div');
							$(thisHandle)
								.html('&#x22ee;&#x22ee;')
								.addClass('handle')
								.appendTo(newRow);

							var thisLen = (modules[moduleID].options[optionName].value) ? modules[moduleID].options[optionName].value.length : 0;
							$(thisTR).data('itemidx-orig', thisLen);

							thisTbody.appendChild(newRow);
						}, true);
						thisOptionContainer.appendChild(addRowButton);

						(function(moduleID, optionKey) {
							$(thisTbody).dragsort({
								itemSelector: 'tr',
								dragSelector: '.handle',
								dragEnd: function() {
									var $this = $(this);
									var oldIndex = $this.data('itemidx-orig');
									var newIndex = $this.data('itemidx');
									var rows = modules[moduleID].options[optionKey].value;
									var row = rows.splice(oldIndex, 1)[0];
									rows.splice(newIndex, 0, row);
								},
								dragBetween: false,
								scrollContainer: this.RESConfigPanelOptions,
								placeHolderTemplate: '<tr><td>---</td></tr>'
							});
						})(moduleID, i);
					}
				} else {
					if ((thisOptions[i].type === 'text') || (thisOptions[i].type === 'password') || (thisOptions[i].type === 'keycode')) thisOptionDescription.classList.add('textInput');
					thisOptionFormEle = this.drawOptionInput(moduleID, i, thisOptions[i]);
					thisOptionContainer.appendChild(thisOptionFormEle);
					thisOptionContainer.appendChild(thisOptionDescription);
				}
				var thisClear = document.createElement('div');
				thisClear.setAttribute('class', 'clear');
				thisOptionContainer.appendChild(thisClear);
				allOptionsContainer.appendChild(thisOptionContainer);
			}
		}

		if (!optCount && modules[moduleID].alwaysEnabled) {
			// do nothing
		} else if (optCount === 0) {
			var noOptions = RESUtils.createElementWithID('div', 'noOptions');
			noOptions.classList.add('optionContainer');
			$(noOptions).text('There are no configurable options for this module.');
			this.RESConfigPanelOptions.appendChild(noOptions);
		} else {
			// var thisSaveStatusBottom = RESUtils.createElementWithID('div','moduleOptionsSaveStatusBottom','saveStatus');
			// this.RESConfigPanelOptions.appendChild(thisBottomSaveButton);
			// this.RESConfigPanelOptions.appendChild(thisSaveStatusBottom);
			this.moduleOptionsScrim = RESUtils.createElementWithID('div', 'moduleOptionsScrim');
			if (modules[moduleID].isEnabled()) {
				RESConsole.moduleOptionsScrim.classList.remove('visible');
				$('#moduleOptionsSave').fadeIn();
			} else {
				RESConsole.moduleOptionsScrim.classList.add('visible');
				$('#moduleOptionsSave').fadeOut();
			}
			allOptionsContainer.appendChild(this.moduleOptionsScrim);
			// console.log($(thisSaveButton).position());
		}
	},
	onOptionChange: function(moduleID, fieldID, oldValue, newValue) {
		var thisOptions = RESUtils.getOptions(moduleID);

		if (thisOptions[fieldID] && thisOptions[fieldID].dependents) {
			thisOptions[fieldID].dependents.forEach(function(dep) {
				if (newValue) {
					this.showOption(moduleID, dep);
				} else {
					this.hideOption(moduleID, dep);
				}
			}, this);
		}
	},
	showOption: function(moduleID, fieldID) {
		$('#optionContainer-'+moduleID+'-'+fieldID).slideDown();
	},
	hideOption: function(moduleID, fieldID) {
		$('#optionContainer-'+moduleID+'-'+fieldID).slideUp();
	},
	deleteOptionRow: function(e) {
		var thisRow = e.target.parentNode.parentNode;
		$(thisRow).remove();
	},
	saveCurrentModuleOptions: function() {
		var panelOptionsDiv = this.RESConfigPanelOptions;
		// first, go through inputs that aren't a part of a "table of options"...
		var inputs = panelOptionsDiv.querySelectorAll('input, textarea');
		$.each(inputs, function(i, input) {
			// save values of any inputs onscreen, but skip ones with 'capturefor' - those are display only.
			var notTokenPrefix = (input.getAttribute('id') !== null) && (input.getAttribute('id').indexOf('token-input-') === -1);
			if ((notTokenPrefix) && (input.getAttribute('type') !== 'button') && (input.getAttribute('displayonly') !== 'true') && (input.getAttribute('tableOption') !== 'true')) {
				// get the option name out of the input field id - unless it's a radio button...
				var optionName;
				if (input.getAttribute('type') === 'radio') {
					optionName = input.getAttribute('name');
				} else {
					optionName = input.getAttribute('id');
				}
				// get the module name out of the input's moduleid attribute
				var optionValue, moduleID = RESConsole.currentModule;
				if (input.getAttribute('type') === 'checkbox') {
					optionValue = !! input.checked;
				} else if (input.getAttribute('type') === 'radio') {
					if (input.checked) {
						optionValue = input.value;
					}
				} else {
					// check if it's a keycode, in which case we need to parse it into an array...
					if ((input.getAttribute('class')) && (input.getAttribute('class').indexOf('keycode') !== -1)) {
						var tempArray = input.value.split(',');
						// convert the internal values of this array into their respective types (int, bool, bool, bool)
						optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true'), (tempArray[4] === 'true')];
					} else {
						optionValue = input.value;
					}
				}
				if (typeof optionValue !== 'undefined') {
					RESUtils.setOption(moduleID, optionName, optionValue);
				}
			}
		});
		// Check if there are any tables of options on this panel...
		var optionsTables = panelOptionsDiv.querySelectorAll('.optionsTable');
		if (typeof optionsTables !== 'undefined') {
			// For each table, we need to go through each row in the tbody, and then go through each option and make a multidimensional array.
			// For example, something like: [['foo','bar','baz'],['pants','warez','cats']]
			$.each(optionsTables, function(i, table) {
				var moduleID = table.getAttribute('moduleID');
				var optionName = table.getAttribute('optionName');
				var thisTBODY = table.querySelector('tbody');
				var thisRows = thisTBODY.querySelectorAll('tr');
				// check if there are any rows...
				if (typeof thisRows !== 'undefined') {
					// go through each row, and get all of the inputs...
					var optionMulti = Array.prototype.slice.call(thisRows).map(function(row) {
						var cells = row.querySelectorAll('td.hasTableOption');
						var notAllBlank = false;
						var optionRow = Array.prototype.slice.call(cells).map(function(cell) {
							var inputs = cell.querySelectorAll('input[tableOption=true], textarea[tableOption=true]');
							var optionValue = null;
							$.each(inputs, function(i, input) {
								// get the module name out of the input's moduleid attribute
								// var moduleID = input.getAttribute('moduleID');
								if (input.getAttribute('type') === 'checkbox') {
									optionValue = input.checked;
								} else if (input.getAttribute('type') === 'radio') {
									if (input.checked) {
										optionValue = input.value;
									}
								} else {
									// check if it's a keycode, in which case we need to parse it into an array...
									if ((input.getAttribute('class')) && (input.getAttribute('class').indexOf('keycode') !== -1)) {
										var tempArray = input.value.split(',');
										// convert the internal values of this array into their respective types (int, bool, bool, bool)
										optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true')];
									} else {
										optionValue = input.value;
									}
								}
								if ((optionValue !== '') && (input.getAttribute('type') !== 'radio') &&
										// If no keyCode is set, then discard the value
										!(Array.isArray(optionValue) && isNaN(optionValue[0]))) {
									notAllBlank = true;
								}
							});
							return optionValue;
						});

						if (notAllBlank) {
							return optionRow;
						}
					});
					optionMulti = optionMulti.filter(function(optionRow, i, optionMulti) {
						return Array.isArray(optionRow) && (optionRow.length > 0);
					});

					if (typeof modules[moduleID].options[optionName].sort === 'function') {
						optionMulti.sort(modules[moduleID].options[optionName].sort);
					}

					RESUtils.setOption(moduleID, optionName, optionMulti);
				}
			});
		}

		var statusEle = document.getElementById('moduleOptionsSaveStatus');
		if (statusEle) {
			$(statusEle).text('Options have been saved...');
			statusEle.setAttribute('style', 'display: block; opacity: 1');
			RESUtils.fadeElementOut(statusEle, 1.0);
		}
	},
	open: function(moduleIdOrCategory) {
		var category, moduleID;
		if (!this.RESConsoleContainer) {
			RESConsole.create();
		}

		if (modules[moduleIdOrCategory]) {
			var module = modules[moduleIdOrCategory];
			moduleID = module && module.moduleID;
			category = module && module.category;
		} else if (this.categories[moduleIdOrCategory]) {
			category = moduleIdOrCategory;
			moduleID = this.getModuleIDsByCategory(category)[0];
		}
		if (!moduleID || !moduleID.length) {
			moduleID = RESdefaultModuleID;
			category = modules[moduleID].category;
		}

		// Draw the config panel
		this.drawConfigPanel();
		this.openCategoryPanel(category);
		this.showConfigOptions(moduleID);

		this.isOpen = true;
		// hide the ad-frame div in case it's flash, because then it covers up the settings console and makes it impossible to see the save button!
		var adFrame = document.getElementById('ad-frame');
		if ((typeof adFrame !== 'undefined') && (adFrame !== null)) {
			adFrame.style.display = 'none';
		}
		// add a class to body to hide the scrollbar.
		setTimeout(function() {
			// Main reason for timeout: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
			document.querySelector('body').classList.add('res-console-open');
		}, 500);

		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'RESConsole');
		// var leftCentered = Math.floor((window.innerWidth - 720) / 2);
		// modalOverlay.setAttribute('style','display: block; height: ' + document.documentElement.scrollHeight + 'px');
		this.modalOverlay.classList.remove('fadeOut');
		this.modalOverlay.classList.add('fadeIn');

		// this.RESConsoleContainer.setAttribute('style','display: block; left: ' + leftCentered + 'px');
		// this.RESConsoleContainer.setAttribute('style','display: block; left: 1.5%;');
		this.RESConsoleContainer.classList.remove('slideOut');
		this.RESConsoleContainer.classList.add('slideIn');

		RESStorage.setItem('RESConsole.hasOpenedConsole', true);

		if (modules['settingsNavigation'] && modules['settingsNavigation'].RESSearchBox) {
			modules['settingsNavigation'].RESSearchBox.focus();
		}

		$('body').on('keyup', RESConsole.handleEscapeKey);
	},
	handleEscapeKey: function(event) {
		// don't close if the user is in a token input field (e.g. adding subreddits to a list)
		// because they probably just want to cancel the dropdown list
		if (event.which === 27 && (document.activeElement.id.indexOf('token-input') === -1)) {
			RESConsole.close();
			$('body').off('keyup', RESConsole.handleEscapeKey);
		}
	},
	close: function(resetUrl) {
		$('#moduleOptionsSave').fadeOut();
		this.isOpen = false;
		// Let's be nice to reddit and put their ad frame back now...
		var adFrame = document.getElementById('ad-frame');
		if ((typeof adFrame !== 'undefined') && (adFrame !== null)) {
			adFrame.style.display = 'block';
		}

		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'RESConsole');

		// this.RESConsoleContainer.setAttribute('style','display: none;');
		this.modalOverlay.classList.remove('fadeIn');
		this.modalOverlay.classList.add('fadeOut');
		this.RESConsoleContainer.classList.remove('slideIn');
		this.RESConsoleContainer.classList.add('slideOut');
		setTimeout(function() {
			// Main reason for timeout: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
			document.querySelector('body').classList.remove('res-console-open');
		}, 500);
		// just in case the user was in the middle of setting a key and decided to close the dialog, clean that up.
		if (typeof RESConsole.keyCodeModal !== 'undefined') {
			RESConsole.keyCodeModal.style.display = 'none';
			RESConsole.captureKey = false;
		}

		// Closing should reset the URL by default
		if (typeof resetUrl !== 'undefined' && !resetUrl) {
			return;
		}

		modules['settingsNavigation'].resetUrlHash();
	},
	menuClick: function(obj) {
		if (!obj) return;

		var objID = obj.getAttribute('id');
		var category = objID.split('-');
		category = category[category.length - 1];
		var moduleID = this.getModuleIDsByCategory(category)[0];
		this.openCategoryPanel(category);
		this.showConfigOptions(moduleID);
	},
	openCategoryPanel: function(category) {
		// make all menu items look unselected
		$(RESConsole.RESMenuItems).removeClass('active');

		// make selected menu item look selected
		$(RESConsole.RESMenuItems).filter(function() {
			var thisCategory = (this.getAttribute('id') || '').split('-');
			thisCategory = thisCategory[thisCategory.length - 1];

			return thisCategory === category;
		}).addClass('active');

		// hide all console panels
		$(RESConsole.RESConsoleContent).find('.RESPanel').hide();

		$(this.RESConsoleConfigPanel).show();
		this.drawConfigPanelCategory(category);
	},
	updateAdvancedOptionsVisibility: function() {
		if (modules['settingsNavigation'].options.showAllOptions.value) {
			document.getElementById('RESConsoleContent').classList.remove('advanced-options-disabled');
		} else {
			document.getElementById('RESConsoleContent').classList.add('advanced-options-disabled');
		}
	},
	getOptionValue: function(moduleID, optionKey) {
		var optionInput = document.getElementById(optionKey);
		if (optionInput) {
			return optionInput.value;
		} else {
			console.error('Cannot get a value for ' + moduleID + '.' + optionKey +
				' because the HTML element does not exist.');
			return null;
		}
	},
	setOptionValue: function(moduleID, optionKey, value) {
		var optionInput = document.getElementById(optionKey);
		if (optionInput) {
			optionInput.value = value;
		} else {
			console.error('Cannot set a value for ' + moduleID + '.' + optionKey +
				' because the HTML element does not exist.');
		}
	}
};
