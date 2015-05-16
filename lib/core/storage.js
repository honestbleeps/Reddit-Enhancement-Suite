var RESStorage = RESStorage || {};


RESStorage.setup = function() {
	if (!RESStorage.setup._complete) {
		RESStorage.setup._complete = $.Deferred();
		RESUtils.runtime.storageSetup({ requestType: 'getLocalStorage' });
	}
	return RESStorage.setup._complete.promise();
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
		RESOptionsMigrate.migrate();
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
}

RESStorage.loadItem = function(key) {
	if (arguments.length > 1) {
		return RESUtils.deferred.collection(Array.prototype.slice.call(arguments).map(function(key) {
			return RESStorage.loadItem(key);
		}));
	}
	return RESStorage.setup._complete
		.then(function() {
			return RESStorage.getItem(key);
		});
};

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
