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
				if (typeof modules[thisModuleID].beforeLoad === 'function') modules[thisModuleID].beforeLoad();
			}
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
	}

	RESUtils.initObservers();
	localStorageFail = false;
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
		// if this is a firefox addon, check for the old lsTest to see if they used to use the Greasemonkey script...
		// if so, present them with a notification explaining that they should download a new script so they can
		// copy their old settings...
		if (BrowserDetect.isFirefox()) {
			if ((localStorage.getItem('RES.lsTest') === 'test') && (localStorage.getItem('copyComplete') !== 'true')) {
				modules['notifications'].showNotification('<h2>Important Alert for Greasemonkey Users!</h2>Hey! It looks like you have upgraded to RES 4.0, but used to use the Greasemonkey version of RES. You\'re going to see double until you uninstall the Greasemonkey script. However, you should first copy your settings by clicking the blue button. <b>After installing, refresh this page!</b> <a target="_blank" class="RESNotificationButtonBlue" href="http://redditenhancementsuite.com/gmutil/reddit_enhancement_suite.user.js">GM->FF Import Tool</a>', 15000);
				localStorage.removeItem('RES.lsTest');

				// this is the only "old school" DOMNodeInserted event left... note to readers of this source code:
				// it will ONLY ever be added to the DOM in the specific instance of former OLD RES users from Greasemonkey
				// who haven't yet had the chance to copy their settings to the XPI version of RES.  Once they've completed
				// that, this eventlistener will never be added again, nor will it be added for those who are not in this
				// odd/small subset of people.
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('copyToSimpleStorage') !== -1)) {
						GMSVtoFFSS();
					}
				}, true);
			}
		}
	} catch (e) {
		localStorageFail = true;
	}

	document.body.classList.add('res', 'res-v430');

	if (localStorageFail) {
		RESFail = "Sorry, but localStorage seems inaccessible. Reddit Enhancement Suite can't work without it. \n\n";
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
		if (/^https?:\/\/(?:[\w]+\.)?reddit\.com/i.test(location.href)) {
			RESUtils.firstRun();
			RESUtils.checkForUpdate();
			// add the config console link...
			RESConsole.create();
			RESConsole.addConsoleLink();
			RESConsole.addConsoleDropdown();
			RESUtils.checkIfSubmitting();
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
		if ((location.href.indexOf('reddit.honestbleeps.com/download') !== -1)
				|| (location.href.indexOf('redditenhancementsuite.com/download') !== -1)) {
			var installLinks = document.body.querySelectorAll('.install');
			for (var i = 0, len = installLinks.length; i < len; i++) {
				installLinks[i].classList.add('update');
				installLinks[i].classList.add('res4'); // if update but not RES 4, then FF users == greasemonkey...
				installLinks[i].classList.remove('install');
			}
		}
		konami = new Konami();
		konami.code = function() {
			var baconBit = createElementWithID('div', 'baconBit');
			document.body.appendChild(baconBit);
			modules['notifications'].showNotification({
				header: 'RES Easter Eggies!',
				message: 'Mmm, bacon!'
			});
			setTimeout(function() {
				baconBit.classList.add('makeitrain');
			}, 500);
		}
		konami.load();

		RESTemplates.load();
	}

	RESUtils.postLoad = true;
}
