var RESStorage = {};
RESStorage.loadItem = function(key) {
	var def = $.Deferred();
	REStorage._loadItem(key, def);
	return def.promise();
}
RESStorage._loadItem = function(key, deferred) {
	if (RESStorage.getItem) {
		deferred.resolve(RESStorage.getItem(key));
	} else {
		setTimeout(RESStorage._loadItem.bind(this, key, deferred), 1);
	}
}

RESStorage.setup = function (response) {
	var originalStorage = RESStorage;
	RESStorage = response;
	for (var key in originalStorage) {
		RESStorage[key] = originalRESStorage[key];
	}

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
	//RESUtils.init.complete();

	RESOptionsMigrate.migrate();
}

var RESLoadResourceAsText;
