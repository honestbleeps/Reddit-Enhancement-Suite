/* exported RESStorage */

var RESStorage = RESStorage || {};

RESStorage.setup = function() {
	if (!RESStorage.setup._complete) {
		RESStorage.setup._complete = $.Deferred();
		RESEnvironment.storageSetup({ requestType: 'getLocalStorage' });
	}
	return RESStorage.setup._complete;
};

RESStorage.setup.complete = function (underlyingStorage) {
	for (var key in underlyingStorage) {
		if (typeof underlyingStorage[key] === 'function') {
			RESStorage[key] = underlyingStorage[key].bind(underlyingStorage);
		} else {
			RESStorage[key] = underlyingStorage[key];
		}
	}

	RESStorage.isReady = true;

	if (typeof window !== 'undefined') {
		window.localStorage = RESStorage;
	}
	var error = RESStorage.setup.testLocalStorage();
	if (!error) {
		RESStorage.setup._complete.resolve();
	} else {
		RESStorage.setup._complete.reject(error);
	}
};

RESStorage.setup.testLocalStorage = function() {
	var error;

	// Check for localStorage functionality...
	try {
		var localStorage = RESEnvironment.localStorage();
		if (localStorage) {
			localStorage.setItem('RES.localStorageTest', 'test');
		}
		RESEnvironment.localStorageTest();
	} catch (e) {
		error = e;
	}

	return error;
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

			RESEnvironment.sendMessage(thisJSON);
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

	RESEnvironment.sendMessage(thisJSON);
};

if (typeof exports === 'object') {
	exports.RESStorage = RESStorage;
}
