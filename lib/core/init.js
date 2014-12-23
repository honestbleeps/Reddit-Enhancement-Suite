var _beforeLoadComplete = false;

function RESdoBeforeLoad() {
	if (document && document.html && document.html.classList) {
		if (_beforeLoadComplete) return;
		_beforeLoadComplete = true;
		// if (beforeLoadDoneOnce) return;
		// first, go through each module and set all of the options so that if a module needs to check another module's options, they're ready...
		// console.log('get options start: ' + Date());
		for (var thisModuleID in modules) {
			if (typeof modules[thisModuleID] === 'object') {

				// Allow the module to instaniate any dynamic options
				if (typeof modules[thisModuleID].loadDynamicOptions === 'function') {
					modules[thisModuleID].loadDynamicOptions();
				}

				RESUtils.getOptions(thisModuleID);
			}
		}
		// console.log('get options end: ' + Date());
		for (var thisModuleID in modules) {
			if (typeof modules[thisModuleID] === 'object') {
				if (typeof modules[thisModuleID].beforeLoad === 'function') {
					modules[thisModuleID].beforeLoad();
				}
			}
		}
		if (RESUtils.htmlClasses.length > 0) {
			DOMTokenList.prototype.add.apply(document.html.classList, RESUtils.htmlClasses);
		}

		// apply style...
		RESUtils.addStyle(RESUtils.css);
		// clear out css cache...
		RESUtils.css = '';
	} else {
		setTimeout(RESdoBeforeLoad, 1);
	}
}

function RESInit() {
	// body should be present now, add those classes.
	if (RESUtils.bodyClasses.length > 0) {
		DOMTokenList.prototype.add.apply(document.html.classList, RESUtils.bodyClasses);
		if (document.body) {
			DOMTokenList.prototype.add.apply(document.body.classList, RESUtils.bodyClasses);
		}
	}

	// if RESStorage isn't fully loaded, and _beforeLoadComplete isn't true,
	// then wait. It means we haven't read all of the modules' options yet.
	if (!RESStorage.isReady || !_beforeLoadComplete) {
		setTimeout(RESInit, 10);
		return;
	}

	// $.browser shim since jQuery removed it
	$.browser = {
		safari: BrowserDetect.isSafari(),
		mozilla: BrowserDetect.isFirefox(),
		chrome: BrowserDetect.isChrome(),
		opera: BrowserDetect.isOpera()
	};

	$.fn.safeHtml = function(string) {
		if (!string) return '';
		else return $(this).html(RESUtils.sanitizeHTML(string));
	};

	RESUtils.initObservers();
	var localStorageFail = false;
	/*
	var backup = {};
	$.extend(backup, RESStorage);
	delete backup.getItem;
	delete backup.setItem;
	delete backup.removeItem;
	console.log(backup);
	*/

	// Check for localStorage functionality...
	try {
		localStorage.setItem('RES.localStorageTest', 'test');
		BrowserStrategy.localStorageTest();
	} catch (e) {
		localStorageFail = true;
	}

	// report the version of RES to reddit's advisory checker.
	var RESVersionReport = RESUtils.createElementWithID('div','RESConsoleVersion');
	RESVersionReport.setAttribute('style','display: none;');
	RESVersionReport.textContent = RESVersion;
	document.body.appendChild(RESVersionReport);

	if (localStorageFail) {
		RESFail = 'Sorry, but localStorage seems inaccessible. Reddit Enhancement Suite can\'t work without it. \n\n';
		if (BrowserDetect.isSafari()) {
			RESFail += 'Since you\'re using Safari, it might be that you\'re in private browsing mode, which unfortunately is incompatible with RES until Safari provides a way to allow extensions localStorage access.';
		} else if (BrowserDetect.isChrome()) {
			RESFail += 'Since you\'re using Chrome, you might just need to go to your extensions settings and check the "Allow in Incognito" box.';
		} else if (BrowserDetect.isOpera()) {
			RESFail += 'Since you\'re using Opera, you might just need to go to your extensions settings and click the gear icon, then click "privacy" and check the box that says "allow interaction with private tabs".';
		} else {
			RESFail += 'Since it looks like you\'re using Firefox, you probably need to go to about:config and ensure that dom.storage.enabled is set to true, and that dom.storage.default_quota is set to a number above zero (i.e. 5120, the normal default)".';
		}
		var userMenu = document.querySelector('#header-bottom-right');
		if (userMenu) {
			var preferencesUL = userMenu.querySelector('UL');
			var separator = document.createElement('span');
			separator.setAttribute('class', 'separator');
			separator.textContent = '|';
			RESPrefsLink = document.createElement('a');
			RESPrefsLink.setAttribute('href', 'javascript:void(0)');
			RESPrefsLink.addEventListener('click', function(e) {
				e.preventDefault();
				alert(RESFail);
			}, true);
			RESPrefsLink.textContent = '[RES - ERROR]';
			RESPrefsLink.setAttribute('style', 'color: red; font-weight: bold;');
			RESUtils.insertAfter(preferencesUL, RESPrefsLink);
			RESUtils.insertAfter(preferencesUL, separator);
		}
	} else {
		document.body.addEventListener('mousemove', RESUtils.setMouseXY, false);
		// added this if statement because some people's Greasemonkey "include" lines are getting borked or ignored, so they're calling RES on non-reddit pages.
		if (RESUtils.allRegex.test(location.href)) {
			RESUtils.firstRun();
			RESUtils.checkForUpdate();
			// add the config console link...
			// RESConsole.create();

			RESConsole.addConsoleLink();
			RESConsole.addConsoleDropdown();
			// go through each module and run it
			for (var thisModuleID in modules) {
				if (typeof modules[thisModuleID] === 'object') {
					// console.log(thisModuleID + ' start: ' + Date());
					// perfTest(thisModuleID+' start');
					modules[thisModuleID].go();
					// perfTest(thisModuleID+' end');
					// console.log(thisModuleID + ' end: ' + Date());
				}
			}
			RESUtils.addStyle(RESUtils.css);
			//	console.log('end: ' + Date());
		}
		if ((location.href.indexOf('reddit.honestbleeps.com/download') !== -1) ||
				(location.href.indexOf('redditenhancementsuite.com/download') !== -1)) {
			var installLinks = document.body.querySelectorAll('.install');
			for (var i = 0, len = installLinks.length; i < len; i++) {
				installLinks[i].classList.add('update');
				installLinks[i].classList.add('res4'); // if update but not RES 4, then FF users == greasemonkey...
				installLinks[i].classList.remove('install');
			}
		}
		konami = new Konami();
		konami.code = function() {
			var baconBit = RESUtils.createElementWithID('div', 'baconBit');
			document.body.appendChild(baconBit);
			modules['notifications'].showNotification({
				header: 'RES Easter Eggies!',
				message: 'Mmm, bacon!'
			});
			setTimeout(function() {
				baconBit.classList.add('makeitrain');
			}, 500);
		};
		konami.iphone.load = function() { }; // nix touch support; occasional false positives on touchscreen laptops
		konami.load();

		RESTemplates.load();
	}

	RESUtils.postLoad = true;
}
