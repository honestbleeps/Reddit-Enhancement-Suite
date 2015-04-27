var RESUtils = RESUtils || {};
RESUtils.bootstrap = RESUtils.bootstrap || {};
var RESStorage = {};

RESUtils.bootstrap.setUpRESStorage = function(response) {
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

	RESStorage.isReady = true;

	window.localStorage = RESStorage;
	//RESUtils.bootstrap.init();

	RESOptionsMigrate.migrate();
	RESUtils.bootstrap.fetchedStorage();
}

RESUtils.bootstrap.fetchStorage = function() {
	var thisJSON = {
		requestType: 'getLocalStorage'
	};

	RESUtils.runtime.storageSetup(thisJSON);
}

RESUtils.bootstrap.fetchedStorage = function() {
	RESUtils.bootstrap.beforeLoad();
}
