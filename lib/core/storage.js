var RESStorage = {};

function setUpRESStorage(response) {
	RESStorage = response;

	// We'll set up a method for getItem, but it's not adviseable to use since
	// it's asynchronous...
	RESStorage.getItem = function(key) {
		if (typeof RESStorage[key] !== 'undefined') {
			return RESStorage[key];
		}
		return null;
	};

	// If the fromBG parameter is true, we've been informed by another tab
	// that this item has updated. We should update the data locally, but
	// not send a background request.
	RESStorage.setItem = function(key, value, fromBG) {
		// Protect from excessive disk I/O...
		if (RESStorage[key] !== value) {
			// Save it locally in the RESStorage variable, but also write it
			// to the extension's localStorage...
			// It's OK that saving it is asynchronous since we're saving it
			// in this local variable, too...
			RESStorage[key] = value;
			var thisJSON = {
				requestType: 'localStorage',
				operation: 'setItem',
				itemName: key,
				itemValue: value
			};

			if (!fromBG) {
				BrowserStrategy.sendMessage(thisJSON);
			}
		}
	};

	RESStorage.removeItem = function(key) {
		// Delete it locally in the RESStorage variable, but also delete it
		// from the extension's localStorage...
		// It's OK that deleting it is asynchronous since we're deleting it in
		// this local variable, too...
		delete RESStorage[key];
		var thisJSON = {
			requestType: 'localStorage',
			operation: 'removeItem',
			itemName: key
		};

		BrowserStrategy.sendMessage(thisJSON);
	};

	RESStorage.isReady = true;

	window.localStorage = RESStorage;
	//RESInit();

	RESOptionsMigrate.migrate();

	RESdoBeforeLoad();
}

var RESLoadResourceAsText;
(function(u) {
	// Don't fire the script on the iframe. This annoyingly fires this whole thing twice. Yuck.
	// Also don't fire it on static.reddit or thumbs.reddit, as those are just images.
	// Also omit blog and code.reddit
	if ((typeof RESRunOnce !== 'undefined') ||
			(/\/toolbar\/toolbar\?id/i.test(location.href)) ||
			(/comscore-iframe/i.test(location.href)) ||
			(/(?:static|thumbs|blog|code)\.reddit\.com/i.test(location.hostname)) ||
			(/^[www\.]?(?:i|m)\.reddit\.com/i.test(location.href)) ||
			(/\.(?:compact|mobile)$/i.test(location.pathname)) ||
			(/metareddit\.com/i.test(location.href))) {
		// do nothing.
		return false;
	}

	// call preInit function - work in this function should be kept minimal.  It's for
	// doing stuff as early as possible prior to pageload, and even prior to the localStorage copy
	// from the background.
	// Specifically, this is used to add a class to the document for .res-nightmode, etc, as early
	// as possible to avoid the flash of unstyled content.
	RESUtils.preInit();

	RESRunOnce = true;
	var thisJSON = {
		requestType: 'getLocalStorage'
	};

	BrowserStrategy.storageSetup(thisJSON);
})();

function RESInitReadyCheck() {
	if (!sessionStorage.getItem('RES.disabled')) {
		if (
			(!RESStorage.isReady) ||
			(typeof document.body === 'undefined') ||
			(!document.html) ||
			(typeof document.html.classList === 'undefined')
		) {
			setTimeout(RESInitReadyCheck, 50);
		} else {
			BrowserStrategy.RESInitReadyCheck(RESInit);
		}
	}
}

function RESdoAfterLoad() {
	var i;
	for (i in modules) {
		if (typeof modules[i].afterLoad === 'function') {
			modules[i].afterLoad();
		}
	}
}

window.addEventListener('DOMContentLoaded', RESInitReadyCheck, false);
window.addEventListener('load', RESdoAfterLoad, false);
