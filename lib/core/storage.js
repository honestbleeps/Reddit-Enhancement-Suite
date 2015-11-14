/* exported RESStorage, RESLoadResourceAsText */

var RESStorage = RESStorage || {};

RESStorage.setup = function() {
	if (!RESStorage.setup._complete) {
		RESStorage.setup._complete = $.Deferred();
		RESUtils.runtime.storageSetup({ requestType: 'getLocalStorage' });
	}
	return RESStorage.setup._complete
		.then(RESOptionsMigrate.migrate);
};

RESStorage.setup.complete = function (response) {
	var originalStorage = RESStorage;
	RESStorage = response;
	for (var key in originalStorage) {
		RESStorage[key] = originalStorage[key];
	}

	RESStorage.isReady = true;

	window.localStorage = RESStorage;
	if (RESStorage.setup.testLocalStorage()) {
		RESStorage.setup._complete.resolve();
	} else {
		RESStorage.setup._complete.reject();
	}
};

RESStorage.setup.testLocalStorage = function() {
	var success = true;

	// Check for localStorage functionality...
	try {
		localStorage.setItem('RES.localStorageTest', 'test');
		RESUtils.runtime.localStorageTest();
	} catch (e) {
		success = false;
	}

	return success;
};

RESStorage.loadItem = function(key) {
	if (arguments.length > 1) {
		return RESUtils.deferred.all(Array.prototype.slice.call(arguments).map(function(key) {
			return RESStorage.loadItem(key);
		}));
	}
	return RESStorage.setup._complete
		.then(function() {
			return RESStorage.getItem(key);
		});
};

RESStorage.getItem = function(key) {
	// Make sure to call RESStorage.loadItem(key) or RESStorage.loadItem(...keys)
	// and ensure it is done or return it from a module's beginning-of-lifecycle
	// callbacks: loadDynamicOptions, beforeLoad, go
	// before calling RESStorage.getItem(key) directly.
	if (!RESStorage.setup._complete || RESStorage.setup._complete.state() !== 'resolved') {
		try {
			throw 'RESStorage.getItem("' + key + '") called before RESStorage.loadItem("' + key + '").';
		} catch (e) {
			console.error(e, e.stack);
		}
	}

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

		if (!fromBG) {
			var thisJSON = {
				requestType: 'localStorage',
				operation: 'setItem',
				itemName: key,
				itemValue: value
			};

			RESUtils.runtime.sendMessage(thisJSON);
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

	RESUtils.runtime.sendMessage(thisJSON);
};

var RESLoadResourceAsText;
