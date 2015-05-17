RESUtils.init = function() {
	// Don't fire the script on the iframe. This annoyingly fires this whole thing twice. Yuck.
	// Also don't fire it on static.reddit or thumbs.reddit, as those are just images.
	// Also omit blog and code.reddit
	if (
			(/\/toolbar\/toolbar\?id/i.test(location.href)) ||
			(/comscore-iframe/i.test(location.href)) ||
			(/(?:static|thumbs|blog|code)\.reddit\.com/i.test(location.hostname)) ||
			(/^[www\.]?(?:i|m)\.reddit\.com/i.test(location.href)) ||
			(/\.(?:compact|mobile)$/i.test(location.pathname)) ||
			(/metareddit\.com/i.test(location.href))) {
		return;
	}
	if (sessionStorage.getItem('RES.disabled')) return;

	RESUtils.init._watch();
	RESUtils.init._loadModules();

	RESUtils.init.await.documentElementReady().done(RESUtils.addBodyClasses);
	RESUtils.init.await.documentBodyReady().done(RESUtils.addBodyClasses);
	RESUtils.init.await.beforeLoad().done(RESUtils.addBodyClasses);
	RESUtils.init.await.go().done(RESUtils.addBodyClasses);
	RESUtils.init.await.documentBodyReady().done(RESUtils.watchMouseMove);
	RESUtils.init.await.documentBodyReady().done(RESUtils.init._homePage);
	RESUtils.init.await.documentBodyReady().done(RESUtils.init._reportVersion);
	RESUtils.init.await('storage').fail(RESUtils.init._localStorageFailed);

	RESUtils.init.await.go().fail(RESUtils.init._showErrors);
	RESUtils.init.await.documentBodyReady().always(setTimeout.bind(window, RESUtils.init._showErrors, 10000));
	RESUtils.deferred.collection([
		RESUtils.init.await.documentBodyReady(),
		RESUtils.init.await.go()
	]).done(RESUtils.initObservers);
};

RESUtils.init.await = function(type, id) {
	var def = RESUtils.init.await._deferred(type, id);
	return def.promise();
};
[ 'loadDynamicOptions', 'options', 'beforeLoad', 'documentElementReady', 'documentHeadReady', 'documentBodyReady', 'go', 'afterLoad' ].forEach(function(type) {
	RESUtils.init.await[type] = RESUtils.init.await.bind(RESUtils.init, type);
});
RESUtils.init.await._deferreds = {};
RESUtils.init.await._deferred = function(type, id, deferred) {
	// Wait for various pieces of the environment, memory, and app to be ready
	var collection = RESUtils.init.await._deferreds;

	type = typeof type !== 'undefined' ? type : 'go';
	id = typeof id !== 'undefined' ? id : '_all';
	collection[type] = collection[type] || {};

	deferred = deferred || collection[type][id] || $.Deferred();
	if (typeof deferred.promise !== 'function') {
		throw [ 'Not a deferred: ', type, id, deferred ].join(' - ');
	}

	collection[type][id] = deferred;


	return collection[type][id];
};

RESUtils.init._watch = function() {
	RESUtils.init._watch.storage();
	RESUtils.init._watch.documentElementReady();
	RESUtils.init._watch.headReady();
	$(RESUtils.init._watch.bodyReady);
	window.addEventListener('load', RESUtils.init._watch.contentLoaded, false);
};

RESUtils.init._watch.storage = function() {
	var def = RESStorage.setup();
	RESUtils.init.await._deferred('storage', '_all', def);
}

RESUtils.init._watch.documentElementReady = function() {
	if (document && document.documentElement && document.documentElement.classList) {
		document.html = document.documentElement;
		RESUtils.init.await._deferred('documentElementReady').resolve();
	} else {
		setTimeout(RESUtils.init._watch.documentElementReady, 1);
	}
};


RESUtils.init._watch.headReady = function() {
	if (document && document.head) {
		RESUtils.init.await._deferred('documentElementReady').resolve();
		RESUtils.init.await._deferred('documentHeadReady').resolve();
	} else {
		setTimeout(RESUtils.init._watch.headReady, 1);
	}
};

RESUtils.init._watch.bodyReady = function() {
	if (document && document.body && document.body.classList) {
		RESUtils.init.await._deferred('documentElementReady').resolve();
		RESUtils.init.await._deferred('documentHeadReady').resolve();
		RESUtils.init.await._deferred('documentBodyReady').resolve();
	} else {
		setTimeout(RESUtils.init._watch.bodyReady, 1);
	}
};

RESUtils.init._watch.contentLoaded = function() {
	RESUtils.init.await._deferred('documentContentLoaded').resolve();
};

RESUtils.init._watch.initReadyCheck = function() {
	// TODO: tidy this up, use await.documentHeadReady
	if (
		(!RESStorage.isReady) ||
		(typeof document.body === 'undefined') ||
		(!document.html) ||
		(typeof document.html.classList === 'undefined')
	) {
		setTimeout(RESInitReadyCheck, 50);
	} else {
		RESUtils.runtime.RESInitReadyCheck(RESInit);
	}
}


RESUtils.init._loadModules = function () {
	if (!RESUtils.regexes.all.test(location.href)) {
		// added this if statement because some people's Greasemonkey "include" lines are getting borked or ignored, so they're calling RES on non-reddit pages.
		return;
	}
	RESUtils.init._queueModulesStage('loadDynamicOptions', function(stage, module, moduleID) {
		return RESUtils.init.await._deferred('sourceLoaded')
		 	.then(RESUtils.init._runModuleStage.bind(this, stage, module, moduleID));
	});
	RESUtils.init._queueModulesStage('options', function(stage, module, moduleID) {
		return RESUtils.init.await.loadDynamicOptions(moduleID)
			.then(RESUtils.options.loadOptions.bind(this, moduleID));
	});
	RESUtils.init._queueModulesStage('beforeLoad', function(stage, module, moduleID) {
		return RESUtils.deferred.collection([
				RESUtils.init.await.options(moduleID),
				RESUtils.init.await('documentHeadReady')
			])
			.then(RESUtils.init._runModuleStage.bind(this, stage, module, moduleID));
	});
	RESUtils.init._queueModulesStage('go', function(stage, module, moduleID) {
		return RESUtils.deferred.collection([
				RESUtils.init.await.beforeLoad(moduleID),
				RESUtils.init.await('documentBodyReady')
			])
			.then(RESUtils.init._runModuleStage.bind(this, stage, module, moduleID));
	});

	RESUtils.init._queueModulesStage('afterLoad', function(stage, module, moduleID) {
		return RESUtils.deferred.collection([
				RESUtils.init.await.go(moduleID),
				RESUtils.init.await('documentContentLoaded')
			])
			.then(RESUtils.init._runModuleStage.bind(this, stage, module, moduleID));
	});

	RESUtils.init.await._deferred('sourceLoaded').resolve(); // kick everything off
};

RESUtils.init._queueModulesStage = function(stage, queueModulesStage) {
	var defs = $.map(modules, function(module, moduleID) {
		var def = queueModulesStage(stage, module, moduleID);
		RESUtils.init.await._deferred(stage, moduleID, def);
		return def;
	});
	RESUtils.init.await._deferred(stage, '_all', RESUtils.deferred.collection(defs));
};
RESUtils.init._runModuleStage = function(stage, module, moduleID) {
	var result, deferred;

	if (typeof module[stage] === 'function') {
		try {
			result = module[stage]();
		} catch (e) {
			console.error('Error in modules[' + moduleID + '].' + stage, e, e.stack);
			deferred = $.Deferred().reject(e);
		}
	}

	if (typeof result === 'undefined') {
		deferred = $.Deferred().resolve();
	} else if (result.done) {
		deferred = result;
	} else if (result) {
		deferred = $.Deferred().resolve(result);
	} else {
		deferred = $.Deferred().reject(result);
	}

	return deferred;
}

RESUtils.init._showErrors = function() {
	var deferreds = RESUtils.init.await._deferreds,
		deferred,
		state,
		failure,
		failures = {};
	for (var type in deferreds) {
		if (!(deferreds.hasOwnProperty(type) && typeof deferreds[type] === 'object')) continue;
		for (var id in deferreds[type]) {
			if (!(deferreds[type].hasOwnProperty(id) && typeof deferreds[type][id].state === 'function')) continue;
			if (failures[id]) continue;

			deferred = deferreds[type][id];
			state = deferred.state();
			if (state !== 'resolved') {
				failures[id] = type;
				if (state === 'rejected') {
					deferred.fail(function() {
						failure = Array.prototype.slice.call(arguments, 0);
						console.error('Failed to load', id, type, failure);
					});
				} else {
					console.error('Failed to load', id, type, state);
				}
			}
		}
	}
	RESUtils.init.await._deferreds = {}; // allow garbage collection
}

RESUtils.init.complete = function() {
	// $.browser shim since jQuery removed it
	$.browser = {
		safari: BrowserDetect.isSafari(),
		mozilla: BrowserDetect.isFirefox(),
		chrome: BrowserDetect.isChrome(),
		opera: BrowserDetect.isOpera()
	};
}

RESUtils.init._reportVersion = function() {
	// report the version of RES to reddit's advisory checker.
	var RESVersionReport = RESUtils.createElement('div','RESConsoleVersion');
	RESVersionReport.setAttribute('style','display: none;');
	RESVersionReport.textContent = RESMetadata.version;
	document.body.appendChild(RESVersionReport);
}

RESUtils.init._localStorageFailed = function() {

	var RESFail = 'Sorry, but localStorage seems inaccessible. Reddit Enhancement Suite can\'t work without it. \n\n';
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
		var RESPrefsLink = document.createElement('a');
		RESPrefsLink.setAttribute('href', '#');
		RESPrefsLink.addEventListener('click', function(e) {
			e.preventDefault();
			alert(RESFail);
		}, true);
		RESPrefsLink.textContent = '[RES - ERROR]';
		RESPrefsLink.setAttribute('style', 'color: red; font-weight: bold;');
		RESUtils.insertAfter(preferencesUL, RESPrefsLink);
		RESUtils.insertAfter(preferencesUL, separator);
	}
};

RESUtils.init._homePage = function() {
	if ((location.href.indexOf('reddit.honestbleeps.com/download') !== -1) ||
			(location.href.indexOf('redditenhancementsuite.com/download') !== -1)) {
		var installLinks = document.body.querySelectorAll('.install');
		for (var i = 0, len = installLinks.length; i < len; i++) {
			installLinks[i].classList.add('update');
			installLinks[i].classList.add('res4'); // if update but not RES 4, then FF users == greasemonkey...
			installLinks[i].classList.remove('install');
		}
	}
};


RESUtils.init();
