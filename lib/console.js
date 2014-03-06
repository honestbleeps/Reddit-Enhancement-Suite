// define the RESConsole class
var RESConsole = {
	modalOverlay: '',
	RESConsoleContainer: '',
	RESMenuItems: [],
	RESConfigPanelOptions: null,
	// make the modules panel accessible to this class for updating (i.e. when preferences change, so we can redraw it)
	RESConsoleConfigPanel: RESUtils.createElementWithID('div', 'RESConsoleConfigPanel', 'RESPanel'),
	RESConsoleAboutPanel: RESUtils.createElementWithID('div', 'RESConsoleAboutPanel', 'RESPanel'),
	RESConsoleProPanel: RESUtils.createElementWithID('div', 'RESConsoleProPanel', 'RESPanel'),
	addConsoleLink: function() {
		this.userMenu = document.querySelector('#header-bottom-right');
		if (this.userMenu) {
			var RESPrefsLink = $("<span id='openRESPrefs'><span id='RESSettingsButton' title='RES Settings' class='gearIcon'></span>")
				.mouseenter(RESConsole.showPrefsDropdown);
			$(this.userMenu).find("ul").after(RESPrefsLink).after("<span class='separator'>|</span>");
			this.RESPrefsLink = RESPrefsLink[0];
		}
	},
	addConsoleDropdown: function() {
		this.gearOverlay = RESUtils.createElementWithID('div', 'RESMainGearOverlay');
		this.gearOverlay.setAttribute('class', 'RESGearOverlay');
		$(this.gearOverlay).html('<div class="gearIcon"></div>');

		this.prefsDropdown = RESUtils.createElementWithID('div', 'RESPrefsDropdown', 'RESDropdownList');
		$(this.prefsDropdown).html('<ul id="RESDropdownOptions"><li id="SettingsConsole">settings console</li><li id="RES-donate">donate to RES</li></ul>');
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
		prefs = {
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
			'spamButton': false,
			'bitcointip': false,
			'RESPro': false
		};
		this.setModulePrefs(prefs);
		return prefs;
	},
	getAllModulePrefs: function(force) {
		var storedPrefs;
		// if we've done this before, just return the cached version
		if ((!force) && (typeof this.getAllModulePrefsCached !== 'undefined')) return this.getAllModulePrefsCached;
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
			} else if ((!modules[module].disabledByDefault) && ((storedPrefs[module] == null) || (module.alwaysEnabled))) {
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
		// create the console container
		this.RESConsoleContainer = RESUtils.createElementWithID('div', 'RESConsole');
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
		var RESConsoleHeader = RESUtils.createElementWithID('div', 'RESConsoleHeader');
		// create the top bar and place it in the header
		var RESConsoleTopBar = RESUtils.createElementWithID('div', 'RESConsoleTopBar');
		this.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAeCAMAAABHRo19AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACxFBMVEXw8/wAAAD+//8EBAQSEhIPDw/w8/v+/v4JCQkHBwcCAgKSk5W8vLz9SADz8/MtLS0iIiIcHBz/VAAYGBmRkZFkZGUkJCQVFhZiYmOZmp2QkpfQ09r9/f3n6vA5OTkvLy//TAAxMTEUFRTl5eVqa2zu8fnt7/fV19ydnqCen6Lt8Pj/TwDk5ORaWlrg4ug1NTUpKSrX19cgICDp6/J6enrFxcW1trpDQ0M7OzwnJyenp6f6TQAXFxj/WACFhojr6+uNjpBHR0cfHx+vr7GSkpJMTEwYGBg+Pj5cXF3CwsJISEj29vYQEBDe3t7+SwBmZmixsbH19fXo6OhQUFAgICJgYWXHyM3q7PTs7vW3uLvb3eKqq650dXbS09js7/aTlJY5OjmUlJeenp7r7vWWl5n8/Px4eHihoqWEhYfO0NTj5euDg4Pa3OGRkpTJy8/g4ODe4Obc3Nzv8vqjo6O1tbW3uLyrq6t1dXX5ya5/f3/5xqxZWVqKiopra2v4uJb99vLCw8fFxsouLS6Oj5Hs7OzY2t+jpKZ4eXv2tY8NDQ35WQny8vJkZGT2lWGQkJB8fHzi5OrLzNFAQUPm6O/3f0W7u7v3oXP4dTb2nXH62MX3pHb87+bn5+dWV1dvb3E0NDT4lWP3jFP4vJn2cS79+vaJioxNTU376d72f0H4Wwf2fT7759z9+fX1lmH4XAv2bSb40bheX2A6Ojr9+vj76t/9+vf76+H5XxVGRkZxcnPQ0te+vr52dnaztLfExMT2tZFYWFhSUlLV1dVwcXL52MS4uLiysrKam5rW1tZPT1CVlZWYmJiUlJRHR0ipqq0qKiqzs7P39/fq6urj4+P89fH09PT6+vo4ODjq7PNsbW4oKCh0dHTv7++3t7fk5u2IiYtFRUU3NzdPT0/Kysru7u6NjY1tbW1gYGBfX19sbGyHh4fh4eEzPXfuAAACPElEQVR4Xq3SQ9fkQBTH4bpVSdru17Zt28bYtm3btm3btm37S8yk0oteTKc7c+a3uf/Nc3JyEvT/48KF69Uhu7dk3AfaZ48PRiHgUwLdpGLdtFbecrkPOxvjuSRcmp2vaIsQt6gdLME4UtlGGs6NFW7+GIw7Qidp2BAq3KaQWg650mwC9LSs6JpRfZG03PTo32reMrmzIW3IlGaSZY/W+aCcoY/xq1SCKXAC5xAaGObkFoSmZoK3uaxqlgzL6vol3UohjIpDLWq6J4jaaNZUnsb4syMCsHU5o10q4015sZAshp2LuuCu4DSZFzJrrh0GURj3Ai8BNHrQ08TdyvZXDsDzYBD+W4OJK5bFh9nGIaRuKKTTxw5fOtJTUCtWjh3H31NQiCdOso2DiVlXSsXGDN+M6XRdnlmtmUNXYrGaLPhD3IFvoQfQrH4KkMdRsjgiK2IZXcurs4zHVvFrdSasQTaeTFu7DtPWa4yaDXSd0xh9N22mMyUVieItWwW8bfuOnbvo2r1n7779mOZ6QByHHsRChw4fsXwsz6OPsdDxE0i0kyQA20rLFIhjzuW0TVxIgpB4Z+AsBRXn1RZTdeEivXFyFbLXJTaJvmkDNJgLrly95iR3juTt9eIbyH6ucJPq2hJGQQiru63lbbriDocc6C7cu1/BgwcPH9U/4cdT9TNQIcd6/oK8fFWbg4Vev0n0I6VvkcO9A38Fq495X5T3wZkhLvAROZ6KYT59Lvvy9VvU9x8/1fW/DEygHfEbNdeCkgdk4HMAAAAASUVORK5CYII=';
		// this string is split because a specific sequence of characters screws up some git clients into thinking this file is binary.
		this.loader = 'data:image/gif;base64,R0lGODlhHQAdAPe9ABZkhBZkhRdkhRdlhRdlhhhlhRhlhhhmhhlmhhpmhhpnhhtnhhtnhxxnhhxohx9phxxoiCFriSJriSJriiJsiiNsiiRsiiRtiyVtiyZuiyZujClviyhvjCpwjStxjityjy1xjSxyjy5zjzB1kTN2kTN2kjR3kjd4kjd4kzZ5lDh5kzp5kzx7lTp8lkN+lkN/l06DmEyDmk+EmkyFnEyGnU2Hnk+HnlCHnVKInlOJn1+Mn1CJoFSLol6PoliOpFqOpFuRp1yQpWWPoGaQomORpGKSpWOSpWCTp2KVqWWVqGqWqGiXq2qYq26Zqm+aq26brWycr3Gaq3Kbq3Wer3ucqnGesXSfsHyisnmjtJmYmZqYmZqZmpuZmpuam5ubnJybnJycnJycnZ2cnZ2dnZ6dnp6en5+en5+foKCfoIWlsYams4Gnt4eotYapt4ysuY2tuouvvYqvvoyvvY+vvJGyv6GhoaChoqGhoqGioqGio6KioqKio6Oio6KjpKOjpKOkpaSkpaWlpaSlpqWmp6amp6anqKenqKinqKeoqKepqqioqaipqqmqqqmqq6qqq6mqrKusrKusramtr62vsa6vsK6wsbCysrCys7KysrGytLK0tbW2t7W3uLW3ube6u7i6u7m6u7m8vbq8vbm8vru9vr2+v72/v76+v5Gzwpy3wqC4wrG/xby/wK3Byb3Awb7Awb/Bw7zCxb3GycDCw8DDxMHDxMPGx8TGx8nMzcrNz8/R0tHT1NLU1QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkGAL0AIf8LTkVUU0NBUEUyLjADAQAAACH/C1hNUCBEYXRhWE1QQz94cGFjazFGNUU5NzY2IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc3MDIyMDQ1N0Y5OWtldCBlbmQ9InIiPz4ALAAAAAAdAB0AAAj';
		this.loader += '+AHsJHEiwIME7BhMqHAirVq9SZmb1msVqocVelr48QtPlzqMvky4mtLXLUZeTKLs46pVL5EBRZu504UIzZcczt1wKRHSSyxdHlgZ9QSlJZy9eg06aKTVwk5mTK12CknnSUsFIKO9sEgnLD0pYBT2hHORQ5KynXTwV3KSli5mWLi2NJbgraZcvmlzqogq1oii7bv1YjAJDoKxYfN2mvJMz4Y8ovV5QwGIFBRvANrsUWmiCggkHBSRIKEBlkCSTKR9VGqRwjYcCsGMXWKHjxiozg0INOrOwyYbXsmUHENGqkN9HC1ONCAA7A40eOzgUaBCAhtFeLJhruDJQjQjYGo5/vBGp5DPsHQV7FGAQoEESkUK+w5ZScAhoB0d0wtEAO0dBILBBQIROSVDQXBUDoSJfARnI4VIKEjAAGwc8MOHDgivcoIpLcLSBgmwNyKYBHdf1kgNzsUkYWgNQlEhDCzRoEAADEBTgwhtJOFiiQDZQ8AQTGeS3I0FpxCCQFSUGBAAh+QQJBgC7ACH/C1hNUCBEYXRhWE1QQz94cGFjazFGNUU5NzY2IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc3MDIyMDQ1N0Y5OWtldCBlbmQ9InIiPz4ALAAAAAAdAB0AhxVkhBdlhRhlhRhlhhhmhhlmhhpmhhpnhhxnhhxohx1ohx1piB9piCBqiSFriiJsiiNsiiNsiyRsiiVtiyduiiZuiyVujCZujChujCtxji1xjSxxjixyjy5zjzN1jy1zkTN2kTN2kjR1kDR2kTZ3kTV3kjZ4kzp5kzt7lT18lj99l0F8lE6Cl0KBm0WBmkaCmkqDm0mFnUyFnE6FnE+Hnk+In1SDl1CHnVOJn1aKn1eKn1qLnlCJoFOLolSMolmNol6PoliOpFyPpVyRp2aRomGQpGKTp2OWq2WUqGqYq2ubrmyarGyarW6brXKbq3afr2ycsHGesXShs3mgsHyisX2isnyltX2nuJqZmpuam5ubm5yam5ubnJybnJycnJ2cnZ+dnZ2dnp6dnp6enp6en5+en6CfoJ+kp4ams4Cnt4mptoitvJertJKyv6GhoqKioqKio6Oio6OjpKSkpKWkpaSlpqWlpqalpqWmp6amp6anqKeoqaioqaipqqmpqqqqq6urq6yrq6mrrKqrrKutrq2ur6Gvta6vsK+ytKe1uq63u7Cys7Gys7KysrOztLG0tbK0tbO0tbW2t7S3uba3uLe5ure5u7e6u7e6vLi5uri6u7u8vby9vr2+v5GzwpK1w5W0wZi2wpu3wpy3wqG9yLy/wK/DzL7Awb/Awb/AwsDAwcDDxMLDxMPGx8TGx8bHx8XHyMTHycXJy8bIys3Oz8vP0c/R09DS0tDS09LT1NbY2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj+AHcJHEiwoMGDCBHKYqQrlxtCu3CxSkhxl6UsdeRk8XKoTp2KBy29+pOlZJYuJT+CJIjLjZcsW7aYLMllj55NKwVCKtnFyx9HelCWNMMpJ6s6Jb0UFSjpZZY/OZGaZFSwEM9Cq1Y64lIyVcGLJ70gWtnKaaaClJJ6BSlLj0k9BG1J9fJqJa1Abkz+8crJLU';
		this.loader += '+oCXdQEWhKlheZSWfKoXTW4JJdoCioEOVjRKLDM2dSPbjGgYkQBQpEOGCBTR1De2ZyGSRnEMIrEQCEnl3gxIoWirIgorRaICyDSFR8mC2beIEftRpDmohwiQLZACjQAHIDw2wcOQWOkG1hsEA0GmSDL9DAYiUNB6F5FBQye0QRkDYQzHZSkIh8BfRXLkEPADvBIbPRkBMpGoRmQRQDfVJgaA74V1ENxRVggQ9JBPFBcS88kdMSSJwQ2gAAHEBbAUpkJ5AUBQwwwIgaYBCDibscEcELCy4AQAijqNEGjLtYscsUB/SQhgkw8GjQCAJ9IoqJAQEAIfkECQYAvwAh/wtYTVAgRGF0YVhNUEM/eHBhY2sxRjVFOTc2NiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3NzAyMjA0NTdGOTlrZXQgZW5kPSJyIj8+ACwAAAAAHQAdAIcWZIQWZIUXZIUXZYUYZYUYZYYYZoYZZoYaZoYaZ4YbZ4YcZ4YdaIcdaIgdaYgeaokfaokgaogia4kha4ojbIokbIolbYsmbosmbowpb4sobowqcI0qcI4tcY0tco4sco8tco8uco8wdI8vdJAxdZEydZAzdZAzdpE2eJM3eJM2eZQ3eZQ4eJM9fJU+fJY/fphIhJxLhZxKhZ1LhZ1MhZxOhp1Php1Ph55Vh5tQh51TiZ9Wip9Zip5QiaBViqBWiqBXjKFUjKJVjaRZjaJej6JYjqRcj6Rcj6VfkKRckadmkaJikaRnladnl6prmKlqmKttmapvmaptm65ym6t0mqpxnrFynrF7orN9orKamZqbmpubm5ycm5ydm5ycnJycnJ2dnJ2enJ2dnZ6enZ6fnp+Fnaefn6CGprOAprWApraEp7aDqLiEq7uMrbqIr76Pr7yVq7SVs7+ZtL+goKGhoKGhoaKioqOkpKSkpKWlpKWkpaalpaampqemp6inp6ioqaqpqquqqqupq6yrrK2rra+srq+trq+ur7Cvr7CusLGvsLGusbKvsbOhsbiwsrOysrKxsrSys7SytLWztba0tbW1trezt7i1t7i1t7m2t7i2uLm3ury5ubq4uru4u7y5u7y6vL27vL28vL28vb69vr++vr+Rs8KStMKdt8GivMemv8m9vsC8v8C9v8GrwMi+wMG/wcLCxMXHycrLysrIy8zJy8zKzM3N0NHP0dPP0tPQ0tTR09TS09TT1dXV19gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI/gB/CRxIsKDBgwgTGur0C5EdgboSSvy1yw4ZPFq0OHJkx9ZEg5McDcpIMksWM7U';
		this.loader += '+FjRkMqPJlloERXqlUmCnlmT8OOpD5uWWTCpfKbKThQuZUQMp9cyyp6aipVkcFTxkkgxDlZ5MbqFJMOuWLFsOqdTUc8vVgZnAbpmU66Olsln6EMS1x6QdXyp7jQr0NUsgVr9G9XmZhZJEHgJVqZIFlYsZqHYCTTqI5pcUBEbkpKihSAvUviY9IXSSQQcIBAgmAGjRqAycO4TJ7CEDCqEVBABQ60YAYsIPQXZYUTUMKmVBKkNYDECwfDfqM7NiURyEKyGM5ggq1DBSo0LzGqZqhp7asLwCloFnTjNX8EPllQrMexQcohuGShwQlg+YUlAJagVNqIRGDfkNIB9BSei3ARI1qVCeFQOZMsJyEJTQ3kdR5IeaBkE8IcSEy9lXUxMqlIDaAPqlWENNA7XhnXO8tdACiwKtMcEIJiKQXwVx0EhQFL+gAoIKbAhRQio+GqTCEgLJQWNAACH5BAkGALsAIf8LWE1QIERhdGFYTVBDP3hwYWNrMUY1RTk3NjYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzcwMjIwNDU3Rjk5a2V0IGVuZD0iciI/PgAsAAAAAB0AHQCHFWSEFmSFF2WFGGWFGGWGGGaGGWaGGWeGGmaGGmeGG2eHHGeGHWiHHmiHHmmIH2qJIWqIIGqJImuJI2yKI2yLI22LJGyKJWyKJW2KJW2LJm6LJ26LJm6MKG+MLXGNLHKPLnOPLnSRL3WRMHSQMXWRM3eSNneSN3iSNXiUOHmTPHqTPnyWP32WQ36WRIGaR4SdSIKaSYWeTIWcTYadT4ifU4ieUoifU4mfZY6fUImgVouhVIyiVIyjXo+iWI6kW4+kXI+lW5GnXJClXJGnZpGiYJGlYpGkYJOnZJOmZJOnZZSnZJera5iqapirbZiqbpyvcpurcpusdJ2udZ2ucZ6xdqGze6CwfaKyeqS0f6W1mpmampqbm5qbm5ucnJucnJycnJydnZydnZ2enp2enp6fn56fn5+goJ+gjaSuhqazgKa1gae2i6u3hKu6iqu4iKy7jq26jK68nK+3jrC+oKChoaGioqKjo6Kjo6OkpKSlpaSlpKWlpKWmpqanpqeop6iqqKipqKmqqamqqqusq6usq6ytrq2tra2urK6vrq+wr6+wrLCxr7Cxr7GysrKysbO1sbS1sbW3sra3tLW2tba3tre4trm6t7q8uLq7ubq7uLq8uLu8uLu9uru8u7y9ur2+vL2+vb6/kbPCnLvIo7vFor3Hp7/JvL/Av7/Avr/Bv8DBv8DCvsHCr8fQwsXGxMbHxMfIxsfIxsjIxsjJx8nKx8rLysnJyMrLz9HT1NbW1dfYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACP4AdwkcSLBgwT8GEyocuMjRLk9hYi2cSBAQlzphugzylCcVRYOU+hzK2IVLSS5cXH0smAqly5dcDr2SuHKXpZNhAD3y4wVlFy+FVm7KEwZlGI8CKYXx0uXMrZoWUTokeAil05qsinJhVdCSyzqSVg5yialgJZd9In1cpJWLH4K56qDso6vmLkU+AXkE1cdlGJUK3zARqKaVJ58mM7o0U0etwhcYpECBkOXQmaIn/ZZNCMMFDwkJEjAAoEMODjRnXobB+ErhDQAAQstOANpKHUCb+kS89ShXQjUtDhyQHTsBAAmtWu/adGiiCggHAByAIKOHjQ6yWQQZtdLJgwQHNIRcGZgGROjjbVbO0WA8R8EfsBc8WakERfQEUQoSWZBggZGVSIQgHGkFDVHcAkfUhEJsGFAxkCghxAZBDnHURIJ0AGjAQxM+fHBeDHYtgQEGxBlHXAik2OUGHBfOFhsJP8hQil0CnQABCPw9QKIQNBIURBW7tAABFmyYIEWPBilxApK7BAQAIfkECQYAtgAh/wtYTVAgRGF0YVhNUEM/eHBhY2sxRjVFOTc2NiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3NzAyMjA0NTdGOTlrZXQgZW5kPSJyIj8+ACwAAAAAHQAdAIcWZIQWZIUXZYUYZYUYZoUZZoUYZYYYZoYZZoYaZoYaZ4YbZ4YbZ4ccZ4YcaIcdaIcdaYgfaYgfaogfaokjbIkjbYskbIokbYolbYsmbosmbownb4wobowpb4wrco4scI0tcY0uco0tco4sco8tc5Auc5AvdJAvdJEydZAzdZA5epQ7epQ6e5Y7e5Y/f5hAfJRCf5hCf5lIgJdDgZtGgZhIgppMhJtMhZxQh51Rh51TiZ9UiJ5Wip9OiKBPiaFQiaBVi6FUjKJej6JYjqRYj6VajqRcj6Rcj6VckadmkaJgkqZlk6ZmlKdll6tmlqpqmKtqmq1smqxtmq1ym6t1na50nq92n69xnrF/oK16obF4orN5orN9orJ8pbWamZqampubmpucm5ubm5ycm5ycnJ2dnJ2dnZ6enZ6enp+fnp+fn6Cgn6Cfo6WTpa2GprOJqriPrbqOsL6Osb+hoKChoaGhoaKjpKWkpKWlpKWkpaalpaampqemp6inp6ioqKioqaqpqquqqqurq6yrra6sra6srq+trq+gr7Wur7CusbOvsrSwsrOxsrOysrKys7SztLW0tLW0tbe1tre1tri1t7i1t7m2uLm3ury4uru5uru5u726u7y8vb69vr++v7+Qs8GRtMKsv8e6v8G8v8C9v8C+v8Gtwcm/wMK/wcK/';
		this.loader += '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';
		this.loader += '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';
		this.loader += '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';
		RESConsoleTopBar.setAttribute('class', 'RESDialogTopBar');
		$(RESConsoleTopBar).html('<img id="RESLogo" src="' + this.logo + '"><h1>reddit enhancement suite</h1>');
		RESConsoleHeader.appendChild(RESConsoleTopBar);
		this.RESConsoleVersion = RESUtils.createElementWithID('div', 'RESConsoleVersion');
		$(this.RESConsoleVersion).text('v' + RESVersion);
		RESConsoleTopBar.appendChild(this.RESConsoleVersion);

		// Create the search bar and place it in the top bar
		var RESSearchContainer = modules['search'].renderSearchForm();
		RESConsoleTopBar.appendChild(RESSearchContainer);

		var RESSubredditLink = RESUtils.createElementWithID('a', 'RESConsoleSubredditLink');
		$(RESSubredditLink).text('/r/Enhancement');
		RESSubredditLink.setAttribute('href', 'http://reddit.com/r/Enhancement');
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
		this.categories = [];
		for (var module in modules) {
			if ((typeof modules[module].category !== 'undefined') && (this.categories.indexOf(modules[module].category) === -1)) {
				this.categories.push(modules[module].category);
			}
		}
		this.categories.sort(function(a, b) {
			if (a == "About RES") return 1;
			if (b == "About RES") return -1;
			return a.localeCompare(b);
		});
		// create the menu
		// var menuItems = this.categories.concat(['RES Pro','About RES'));
		var menuItems = this.categories;
		var RESMenu = RESUtils.createElementWithID('ul', 'RESMenu');
		for (var item = 0; item < menuItems.length; item++) {
			var thisMenuItem = document.createElement('li');
			$(thisMenuItem).text(menuItems[item]);
			thisMenuItem.setAttribute('id', 'Menu-' + menuItems[item]);
			thisMenuItem.addEventListener('click', function(e) {
				e.preventDefault();
				RESConsole.menuClick(this);
			}, true);
			RESMenu.appendChild(thisMenuItem);
		}
		RESConsoleHeader.appendChild(RESMenu);
		this.RESConsoleContainer.appendChild(RESConsoleHeader);
		// Store the menu items in a global variable for easy access by the menu selector function.
		RESConsole.RESMenuItems = RESMenu.querySelectorAll('li');
		// Create a container for each management panel
		this.RESConsoleContent = RESUtils.createElementWithID('div', 'RESConsoleContent');
		this.RESConsoleContainer.appendChild(this.RESConsoleContent);
		// Okay, the console is done. Add it to the document body.
		document.body.appendChild(this.RESConsoleContainer);

		window.addEventListener("keydown", function(e) {
			if ((RESConsole.captureKey) && (e.keyCode !== 16) && (e.keyCode !== 17) && (e.keyCode !== 18)) {
				// capture the key, display something nice for it, and then close the popup...
				e.preventDefault();
				var keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
				document.getElementById(RESConsole.captureKeyID).value = keyArray.join(",");
				document.getElementById(RESConsole.captureKeyID + '-display').value = RESUtils.niceKeyCode(keyArray);
				RESConsole.keyCodeModal.style.display = 'none';
				RESConsole.captureKey = false;
			}
		});

		$("#RESConsoleContent").on({
			focus: function(e) {
				var thisXY = RESUtils.getXYpos(this, true);
				// show dialog box to grab keycode, but display something nice...
				$(RESConsole.keyCodeModal).css({
					display: "block",
					top: RESUtils.mouseY + "px",
					left: RESUtils.mouseX + "px;"
				});
				// RESConsole.keyCodeModal.style.display = 'block';
				RESConsole.captureKey = true;
				RESConsole.captureKeyID = this.getAttribute('capturefor');
			},
			blur: function(e) {
				$(RESConsole.keyCodeModal).css("display", "none");
			}
		}, ".keycode + input[type=text][displayonly]");

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
			return modules[moduleID].category == category;
		});
		moduleList.sort(function(moduleID1, moduleID2) {
			var a = modules[moduleID1];
			var b = modules[moduleID2];

			if (a.sort !== void 0 || b.sort !== void 0) {
				var sortComparison = (a.sort || 0) - (b.sort || 0);
				if (sortComparison != 0) {
					return sortComparison;
		}
			}

			if (a.moduleName.toLowerCase() > b.moduleName.toLowerCase()) return 1;
			return -1;
		});

		return moduleList;
	},
	drawConfigPanelCategory: function(category, moduleList) {
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
		for (var i = 0, len = moduleList.length; i < len; i++) {
			var thisModuleButton = RESUtils.createElementWithID('div', 'module-' + moduleList[i]);
			thisModuleButton.classList.add('moduleButton');
			var thisModule = moduleList[i];
			$(thisModuleButton).text(modules[thisModule].moduleName);
			if (modules[thisModule].isEnabled()) {
				thisModuleButton.classList.add('enabled');
			}
			thisModuleButton.setAttribute('moduleID', modules[thisModule].moduleID);
			thisModuleButton.addEventListener('click', function(e) {
				RESConsole.showConfigOptions(this.getAttribute('moduleID'));
			}, false);
			this.RESConfigPanelModulesPane.appendChild(thisModuleButton);
		}
		this.RESConsoleConfigPanel.appendChild(this.RESConfigPanelModulesPane);

		this.RESConfigPanelOptions = RESUtils.createElementWithID('div', 'RESConfigPanelOptions');
		$(this.RESConfigPanelOptions).html('<h1>RES Module Configuration</h1> Select a module from the column at the left to enable or disable it, and configure its various options.');
		this.RESConsoleConfigPanel.appendChild(this.RESConfigPanelOptions);
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
				// thisOptionFormEle.setAttribute('value',optionObject.value);
				existingOptions = optionObject.value;
				if (typeof existingOptions === 'undefined') existingOptions = '';
				var prepop = [];
				var optionArray = existingOptions.split(',');
				for (var i = 0, len = optionArray.length; i < len; i++) {
					if (optionArray[i] !== '') prepop.push({
						id: optionArray[i],
						name: optionArray[i]
					});
				}
				setTimeout(function() {
					$(thisOptionFormEle).tokenInput(optionObject.source, {
						method: "POST",
						queryParam: "query",
						theme: "facebook",
						allowFreeTagging: true,
						zindex: 999999999,
						onResult: (typeof optionObject.onResult === 'function') ? optionObject.onResult : null,
						onCachedResult: (typeof optionObject.onCachedResult === 'function') ? optionObject.onCachedResult : null,
						prePopulate: prepop,
						hintText: (typeof optionObject.hintText === 'string') ? optionObject.hintText : null
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
				thisOptionFormEle = RESUtils.toggleButton(optionName, optionObject.value, null, null, isTable);
				break;
			case 'enum':
				// radio buttons
				if (typeof optionObject.values === 'undefined') {
					alert('misconfigured enum option in module: ' + moduleID);
				} else {
					thisOptionFormEle = RESUtils.createElementWithID('div', optionName);
					thisOptionFormEle.setAttribute('class', 'enum');
					for (var j = 0; j < optionObject.values.length; j++) {
						var thisDisplay = optionObject.values[j].display;
						var thisValue = optionObject.values[j].value;
						var thisId = optionName + '-' + j;
						var thisOptionFormSubEle = RESUtils.createElementWithID('input', thisId);
						if (isTable) thisOptionFormSubEle.setAttribute('tableOption', 'true');
						thisOptionFormSubEle.setAttribute('type', 'radio');
						thisOptionFormSubEle.setAttribute('name', optionName);
						thisOptionFormSubEle.setAttribute('moduleID', moduleID);
						thisOptionFormSubEle.setAttribute('value', optionObject.values[j].value);
						var nullEqualsEmpty = ((optionObject.value == null) && (optionObject.values[j].value === ''));
						// we also need to check for null == '' - which are technically equal.
						if ((optionObject.value == optionObject.values[j].value) || nullEqualsEmpty) {
							thisOptionFormSubEle.setAttribute('checked', 'checked');
						}
						var thisLabel = document.createElement('label');
						thisLabel.setAttribute('for', thisId);
						var thisOptionFormSubEleText = document.createTextNode(' ' + optionObject.values[j].name + ' ');
						thisLabel.appendChild(thisOptionFormSubEleText);
						thisOptionFormEle.appendChild(thisOptionFormSubEle);
						thisOptionFormEle.appendChild(thisLabel);
						var thisBR = document.createElement('br');
						thisOptionFormEle.appendChild(thisBR);
					}
				}
				break;
			case 'keycode':
				// keycode - shows a key value, but stores a keycode and possibly shift/alt/ctrl combo.
				var realOptionFormEle = $("<input>").attr({
					id: optionName,
					type: "text",
					class: "keycode",
					moduleID: moduleID
				}).css({
					border: "1px solid red",
					display: "none"
				}).val(optionObject.value);
				if (isTable) realOptionFormEle.attr('tableOption', 'true');

				var thisKeyCodeDisplay = $("<input>").attr({
					id: optionName + "-display",
					type: "text",
					capturefor: optionName,
					displayonly: "true"
				}).val(RESUtils.niceKeyCode(optionObject.value));
				thisOptionFormEle = $("<div>").append(realOptionFormEle).append(thisKeyCodeDisplay)[0];
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
		var thisOptions = RESUtils.getOptions(moduleID);
		var optCount = 0;

		this.RESConfigPanelOptions.setAttribute('style', 'display: block;');
		$(this.RESConfigPanelOptions).html('');
		// put in the description, and a button to enable/disable the module, first..
		var thisHeader = document.createElement('div');
		thisHeader.classList.add('moduleHeader');
		$(thisHeader).html('<span class="moduleName">' + modules[moduleID].moduleName + '</span>');
		var thisToggle = document.createElement('div');
		thisToggle.classList.add('moduleToggle');
		if (modules[moduleID].alwaysEnabled) thisToggle.style.display = 'none';
		$(thisToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
		if (modules[moduleID].isEnabled()) thisToggle.classList.add('enabled');
		thisToggle.setAttribute('moduleID', moduleID);
		thisToggle.addEventListener('click', function(e) {
			var activePane = RESConsole.RESConfigPanelModulesPane.querySelector('.active');
			var enabled = this.classList.contains('enabled');
			if (enabled) {
				activePane.classList.remove('enabled');
				this.classList.remove('enabled');
				RESConsole.moduleOptionsScrim.classList.add('visible');
				$('#moduleOptionsSave').hide();
			} else {
				activePane.classList.add('enabled');
				this.classList.add('enabled');
				RESConsole.moduleOptionsScrim.classList.remove('visible');
				$('#moduleOptionsSave').fadeIn();
			}
			RESConsole.enableModule(this.getAttribute('moduleID'), !enabled);
		}, true);
		thisHeader.appendChild(thisToggle);
		// not really looping here, just only executing if there's 1 or more options...
		for (var i in thisOptions) {
			var thisSaveButton = RESUtils.createElementWithID('input', 'moduleOptionsSave');
			thisSaveButton.setAttribute('type', 'button');
			thisSaveButton.setAttribute('value', 'save options');
			thisSaveButton.addEventListener('click', function(e) {
				RESConsole.saveCurrentModuleOptions(e);
			}, true);
			this.RESConsoleConfigPanel.appendChild(thisSaveButton);
			var thisSaveStatus = RESUtils.createElementWithID('div', 'moduleOptionsSaveStatus', 'saveStatus');
			thisHeader.appendChild(thisSaveStatus);
			break;
		}
		var thisDescription = document.createElement('div');
		thisDescription.classList.add('moduleDescription');
		$(thisDescription).html(modules[moduleID].description);
		thisHeader.appendChild(thisDescription);
		this.RESConfigPanelOptions.appendChild(thisHeader);
		var allOptionsContainer = RESUtils.createElementWithID('div', 'allOptionsContainer');
		this.RESConfigPanelOptions.appendChild(allOptionsContainer);
		// now draw all the options...
		for (var i in thisOptions) {
			if (!(thisOptions[i].noconfig)) {
				optCount++;
				var thisOptionContainer = RESUtils.createElementWithID('div', null, 'optionContainer');
				var thisLabel = document.createElement('label');
				thisLabel.setAttribute('for', i);
				$(thisLabel).text(i);
				var thisOptionDescription = RESUtils.createElementWithID('div', null, 'optionDescription');
				$(thisOptionDescription).html(thisOptions[i].description);
				thisOptionContainer.appendChild(thisLabel);
				if (thisOptions[i].type === 'table') {
					thisOptionDescription.classList.add('table');
					// table - has a list of fields (headers of table), users can add/remove rows...
					if (typeof thisOptions[i].fields === 'undefined') {
						alert('misconfigured table option in module: ' + moduleID + ' - options of type "table" must have fields defined');
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
						for (var j = 0; j < thisOptions[i].fields.length; j++) {
							fieldNames[j] = thisOptions[i].fields[j].name;
							thisTH = document.createElement('th');
							$(thisTH).text(thisOptions[i].fields[j].name);
							thisTableHeader.appendChild(thisTH);
						}
						// add delete column
						thisTH = document.createElement('th');
						$(thisTH).text('delete');
						thisTableHeader.appendChild(thisTH);
						// add move column
						thisTH = document.createElement('th');
						$(thisTH).text('move')
							.attr('title', 'click, drag, and drop')
							.css('cursor', 'help');
						thisTableHeader.appendChild(thisTH);
						thisThead.appendChild(thisTableHeader);
						thisTable.appendChild(thisThead);
						var thisTbody = document.createElement('tbody');
						thisTbody.setAttribute('id', 'tbody_' + i);
						if (thisOptions[i].value) {
							for (var j = 0; j < thisOptions[i].value.length; j++) {
								var thisTR = document.createElement('tr'),
									thisTD;
								$(thisTR).data('itemidx-orig', j);
								for (var k = 0; k < thisOptions[i].fields.length; k++) {
									thisTD = document.createElement('td');
									thisTD.className = 'hasTableOption';
									var thisOpt = thisOptions[i].fields[k];
									var thisFullOpt = i + '_' + thisOptions[i].fields[k].name;
									thisOpt.value = thisOptions[i].value[j][k];
									// var thisOptInputName = thisOpt.name + '_' + j;
									var thisOptInputName = thisFullOpt + '_' + j;
									var thisTableEle = this.drawOptionInput(moduleID, thisOptInputName, thisOpt, true);
									thisTD.appendChild(thisTableEle);
									thisTR.appendChild(thisTD);
								}
								// add delete button
								thisTD = document.createElement('td');
								var thisDeleteButton = document.createElement('div');
								thisDeleteButton.className = 'deleteButton';
								thisDeleteButton.addEventListener('click', RESConsole.deleteOptionRow);
								thisTD.appendChild(thisDeleteButton);
								thisTR.appendChild(thisTD);
								// add move handle
								thisTD = document.createElement('td');
								var thisHandle = document.createElement('div');
								$(thisHandle)
									.html("&#x22ee;&#x22ee;")
									.addClass('handle')
									.appendTo(thisTD);
								thisTR.appendChild(thisTD);
								thisTbody.appendChild(thisTR);
							}
						}
						thisTable.appendChild(thisTbody);
						var thisOptionFormEle = thisTable;
					}
					thisOptionContainer.appendChild(thisOptionDescription);
					thisOptionContainer.appendChild(thisOptionFormEle);
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
						for (var i = 0, len = modules[moduleID].options[optionName].fields.length; i < len; i++) {
							var newCell = document.createElement('td');
							newCell.className = 'hasTableOption';
							var thisOpt = modules[moduleID].options[optionName].fields[i];
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
						}
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
							.html("&#x22ee;&#x22ee;")
							.addClass('handle')
							.appendTo(newRow);

						var thisLen = (modules[moduleID].options[optionName].value) ? modules[moduleID].options[optionName].value.length : 0;
						$(thisTR).data('itemidx-orig', thisLen);

						thisTbody.appendChild(newRow);
					}, true);
					thisOptionContainer.appendChild(addRowButton);

					(function(moduleID, optionKey) {
						$(thisTbody).dragsort({
							itemSelector: "tr",
							dragSelector: ".handle",
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
							placeHolderTemplate: "<tr><td>---</td></tr>"
						});
					})(moduleID, i);
				} else {
					if ((thisOptions[i].type === 'text') || (thisOptions[i].type === 'password') || (thisOptions[i].type === 'keycode')) thisOptionDescription.classList.add('textInput');
					var thisOptionFormEle = this.drawOptionInput(moduleID, i, thisOptions[i]);
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
			$(noOptions).text('There are no configurable options for this module');
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
	deleteOptionRow: function(e) {
		var thisRow = e.target.parentNode.parentNode;
		$(thisRow).remove();
	},
	saveCurrentModuleOptions: function(e) {
		e.preventDefault();
		var panelOptionsDiv = this.RESConfigPanelOptions;
		// first, go through inputs that aren't a part of a "table of options"...
		var inputs = panelOptionsDiv.querySelectorAll('input, textarea');
		for (var i = 0, len = inputs.length; i < len; i++) {
			// save values of any inputs onscreen, but skip ones with 'capturefor' - those are display only.
			var notTokenPrefix = (inputs[i].getAttribute('id') !== null) && (inputs[i].getAttribute('id').indexOf('token-input-') === -1);
			if ((notTokenPrefix) && (inputs[i].getAttribute('type') !== 'button') && (inputs[i].getAttribute('displayonly') !== 'true') && (inputs[i].getAttribute('tableOption') !== 'true')) {
				// get the option name out of the input field id - unless it's a radio button...
				var optionName;
				if (inputs[i].getAttribute('type') === 'radio') {
					optionName = inputs[i].getAttribute('name');
				} else {
					optionName = inputs[i].getAttribute('id');
				}
				// get the module name out of the input's moduleid attribute
				var optionValue, moduleID = RESConsole.currentModule;
				if (inputs[i].getAttribute('type') === 'checkbox') {
					optionValue = !! inputs[i].checked;
				} else if (inputs[i].getAttribute('type') === 'radio') {
					if (inputs[i].checked) {
						optionValue = inputs[i].value;
					}
				} else {
					// check if it's a keycode, in which case we need to parse it into an array...
					if ((inputs[i].getAttribute('class')) && (inputs[i].getAttribute('class').indexOf('keycode') !== -1)) {
						var tempArray = inputs[i].value.split(',');
						// convert the internal values of this array into their respective types (int, bool, bool, bool)
						optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true'), (tempArray[4] === 'true')];
					} else {
						optionValue = inputs[i].value;
					}
				}
				if (typeof optionValue !== 'undefined') {
					RESUtils.setOption(moduleID, optionName, optionValue);
				}
			}
		}
		// Check if there are any tables of options on this panel...
		var optionsTables = panelOptionsDiv.querySelectorAll('.optionsTable');
		if (typeof optionsTables !== 'undefined') {
			// For each table, we need to go through each row in the tbody, and then go through each option and make a multidimensional array.
			// For example, something like: [['foo','bar','baz'],['pants','warez','cats']]
			for (var i = 0, len = optionsTables.length; i < len; i++) {
				var moduleID = optionsTables[i].getAttribute('moduleID');
				var optionName = optionsTables[i].getAttribute('optionName');
				var thisTBODY = optionsTables[i].querySelector('tbody');
				var thisRows = thisTBODY.querySelectorAll('tr');
				// check if there are any rows...
				if (typeof thisRows !== 'undefined') {
					// go through each row, and get all of the inputs...
					var optionMulti = [];
					var optionRowCount = 0;
					for (var j = 0; j < thisRows.length; j++) {
						var optionRow = [];
						var cells = thisRows[j].querySelectorAll('td.hasTableOption');
						var notAllBlank = false;
						for (var k = 0; k < cells.length; k++) {
							var inputs = cells[k].querySelectorAll('input[tableOption=true], textarea[tableOption=true]');
							var optionValue = null;
							for (var l = 0; l < inputs.length; l++) {
								// get the module name out of the input's moduleid attribute
								// var moduleID = inputs[l].getAttribute('moduleID');
								if (inputs[l].getAttribute('type') === 'checkbox') {
									optionValue = inputs[l].checked;
								} else if (inputs[l].getAttribute('type') === 'radio') {
									if (inputs[l].checked) {
										optionValue = inputs[l].value;
									}
								} else {
									// check if it's a keycode, in which case we need to parse it into an array...
									if ((inputs[l].getAttribute('class')) && (inputs[l].getAttribute('class').indexOf('keycode') !== -1)) {
										var tempArray = inputs[l].value.split(',');
										// convert the internal values of this array into their respective types (int, bool, bool, bool)
										optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true')];
									} else {
										optionValue = inputs[l].value;
									}
								}
								if ((optionValue !== '') && (inputs[l].getAttribute('type') !== 'radio')
									//If no keyCode is set, then discard the value
									&& !(Array.isArray(optionValue) && isNaN(optionValue[0]))) {
									notAllBlank = true;
								}
								// optionRow[k] = optionValue;
							}
							optionRow.push(optionValue);
						}
						// just to be safe, added a check for optionRow !== null...
						if ((notAllBlank) && (optionRow !== null)) {
							optionMulti[optionRowCount] = optionRow;
							optionRowCount++;
						}
					}
					if (optionMulti == null) {
						optionMulti = [];
					}
					// ok, we've got all the rows... set the option.
					if (typeof optionValue !== 'undefined') {
						RESUtils.setOption(moduleID, optionName, optionMulti);
					}
				}
			}
		}

		var statusEle = document.getElementById('moduleOptionsSaveStatus');
		if (statusEle) {
			$(statusEle).text('Options have been saved...');
			statusEle.setAttribute('style', 'display: block; opacity: 1');
		}
		RESUtils.fadeElementOut(statusEle, 0.1);
		if (moduleID === 'RESPro') RESStorage.removeItem('RESmodules.RESPro.lastAuthFailed');
	},
	drawProPanel: function() {
		RESConsoleProPanel = this.RESConsoleProPanel;
		var proPanelHeader = document.createElement('div');
		$(proPanelHeader).html('RES Pro allows you to save your preferences to the RES Pro server.<br><br><strong>Please note:</strong> this is beta functionality right now. Please don\'t consider this to be a "backup" solution just yet. To start, you will need to <a target="_blank" href="http://redditenhancementsuite.com/register.php">register for a PRO account</a> first, then email <a href="mailto:steve@honestbleeps.com">steve@honestbleeps.com</a> with your RES Pro username to get access.');
		RESConsoleProPanel.appendChild(proPanelHeader);
		this.proSetupButton = RESUtils.createElementWithID('div', 'RESProSetup');
		this.proSetupButton.setAttribute('class', 'RESButton');
		$(this.proSetupButton).text('Configure RES Pro');
		this.proSetupButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].configure();
		}, false);
		RESConsoleProPanel.appendChild(this.proSetupButton);
		/*
		this.proAuthButton = RESUtils.createElementWithID('div','RESProAuth');
		this.proAuthButton.setAttribute('class','RESButton');
		$(this.proAuthButton).html('Authenticate');
		this.proAuthButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].authenticate();
		}, false);
		RESConsoleProPanel.appendChild(this.proAuthButton);
		*/
		this.proSaveButton = RESUtils.createElementWithID('div', 'RESProSave');
		this.proSaveButton.setAttribute('class', 'RESButton');
		$(this.proSaveButton).text('Save Module Options');
		this.proSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].savePrefs();
			modules['RESPro'].authenticate(modules['RESPro'].savePrefs());
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveButton);

		/*
		this.proUserTaggerSaveButton = RESUtils.createElementWithID('div','RESProSave');
		this.proUserTaggerSaveButton.setAttribute('class','RESButton');
		$(this.proUserTaggerSaveButton).html('Save user tags to Server');
		this.proUserTaggerSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].saveModuleData('userTagger');
		}, false);
		RESConsoleProPanel.appendChild(this.proUserTaggerSaveButton);
		*/

		this.proSaveCommentsSaveButton = RESUtils.createElementWithID('div', 'RESProSaveCommentsSave');
		this.proSaveCommentsSaveButton.setAttribute('class', 'RESButton');
		$(this.proSaveCommentsSaveButton).text('Save saved comments to Server');
		this.proSaveCommentsSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].saveModuleData('saveComments');
			modules['RESPro'].authenticate(modules['RESPro'].saveModuleData('saveComments'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveCommentsSaveButton);

		this.proSubredditManagerSaveButton = RESUtils.createElementWithID('div', 'RESProSubredditManagerSave');
		this.proSubredditManagerSaveButton.setAttribute('class', 'RESButton');
		$(this.proSubredditManagerSaveButton).text('Save subreddits to server');
		this.proSubredditManagerSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].saveModuleData('SubredditManager');
			modules['RESPro'].authenticate(modules['RESPro'].saveModuleData('subredditManager'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSubredditManagerSaveButton);

		this.proSaveCommentsGetButton = RESUtils.createElementWithID('div', 'RESProGetSavedComments');
		this.proSaveCommentsGetButton.setAttribute('class', 'RESButton');
		$(this.proSaveCommentsGetButton).text('Get saved comments from Server');
		this.proSaveCommentsGetButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].getModuleData('saveComments');
			modules['RESPro'].authenticate(modules['RESPro'].getModuleData('saveComments'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveCommentsGetButton);

		this.proSubredditManagerGetButton = RESUtils.createElementWithID('div', 'RESProGetSubredditManager');
		this.proSubredditManagerGetButton.setAttribute('class', 'RESButton');
		$(this.proSubredditManagerGetButton).text('Get subreddits from Server');
		this.proSubredditManagerGetButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].getModuleData('SubredditManager');
			modules['RESPro'].authenticate(modules['RESPro'].getModuleData('subredditManager'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSubredditManagerGetButton);

		this.proGetButton = RESUtils.createElementWithID('div', 'RESProGet');
		this.proGetButton.setAttribute('class', 'RESButton');
		$(this.proGetButton).text('Get options from Server');
		this.proGetButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].getPrefs();
			modules['RESPro'].authenticate(modules['RESPro'].getPrefs());
		}, false);
		RESConsoleProPanel.appendChild(this.proGetButton);
		this.RESConsoleContent.appendChild(RESConsoleProPanel);
	},
	open: function(moduleIdOrCategory) {
		var category, moduleID;
		if (moduleIdOrCategory === 'search') {
			moduleID = moduleIdOrCategory;
			category = 'About RES';
		} else {
			var module = modules[moduleIdOrCategory];
			moduleID = module && module.moduleID;
			category = module && module.category;
		}
		category = category || moduleIdOrCategory || this.categories[0];
		moduleID = moduleID || this.getModuleIDsByCategory(category)[0];

		// Draw the config panel
		this.drawConfigPanel();
		// Draw the RES Pro panel
		// this.drawProPanel();
		this.openCategoryPanel(category);
		this.showConfigOptions(moduleID);

		this.isOpen = true;
		// hide the ad-frame div in case it's flash, because then it covers up the settings console and makes it impossible to see the save button!
		var adFrame = document.getElementById('ad-frame');
		if ((typeof adFrame !== 'undefined') && (adFrame !== null)) {
			adFrame.style.display = 'none';
		}
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
	close: function() {
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
		// just in case the user was in the middle of setting a key and decided to close the dialog, clean that up.
		if (typeof RESConsole.keyCodeModal !== 'undefined') {
			RESConsole.keyCodeModal.style.display = 'none';
			RESConsole.captureKey = false;
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

			if (thisCategory == category) return true;
		}).addClass('active');

		// hide all console panels
		$(RESConsole.RESConsoleContent).find('.RESPanel').hide();

		switch (category) {
			case 'Menu-RES Pro': // cruft
			case 'RES Pro':
				// show the pro panel
				$(this.RESConsoleProPanel).show();
				break;
			default:
				// show the config panel for the given category
				$(this.RESConsoleConfigPanel).show();
				this.drawConfigPanelCategory(category);
				break;
		}
	}
};

