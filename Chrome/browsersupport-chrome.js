/* global chrome:false */

{
	// via https://github.com/erikdesjardins/global-mediakeys
	// Erik Desjardins, GPLv3

	function apiToPromise(func) {
		return (...args) =>
			new Promise((resolve, reject) =>
				func(...args, (...results) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(results.length > 1 ? results : results[0]);
					}
				})
			);
	}

	const listeners = new Map();

	/**
	 * @callback MessageListener
	 * @template T
	 * @param {*} data The message data.
	 * @returns {T|Promise<T, *>} The response data, optionally wrapped in a promise.
	 */

	/**
	 * Register a listener to be invoked whenever a message of <tt>type</tt> is received.
	 * Responses may be sent synchronously or asynchronously:
	 * If <tt>callback</tt> returns a non-promise value, a response will be sent synchronously.
	 * If <tt>callback</tt> returns a promise, a response will be sent asynchronously when it resolves.
	 * If it rejects, an invalid response will be sent to close the message channel.
	 * @param {string} type
	 * @param {MessageListener} callback
	 * @throws {Error} If a listener for <tt>messageType</tt> already exists.
	 * @returns {void}
	 */
	function addListener(type, callback) {
		if (listeners.has(type)) {
			throw new Error(`Listener for message type: ${type} already exists.`);
		}
		listeners.set(type, { callback });
	}

	/**
	 * Sends a message to non-content scripts.
	 * @param {string} type
	 * @param {*} [data]
	 * @returns {Promise<*, Error>} Rejects if an invalid response is received,
	 * resolves with the response data otherwise.
	 */
	RESEnvironment._sendMessage = async (type, data) => {
		const message = { type, data };

		const response = await apiToPromise(chrome.runtime.sendMessage)(message);

		if (!response) {
			throw new Error(`Error in background handler for type: ${type}`);
		}

		return response.data;
	};

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		const { type, data } = request;

		if (!listeners.has(type)) {
			throw new Error(`Unrecognised message type: ${type}`);
		}
		const listener = listeners.get(type);

		let response;

		try {
			response = listener.callback(data);
		} catch (e) {
			sendResponse();
			throw e;
		}

		if (response instanceof Promise) {
			response
				.then(data => sendResponse({ data }))
				.catch(error => {
					sendResponse();
					throw error;
				});
			return true;
		}
		sendResponse({ data: response });
	});

	// Listeners

	function waitForEvent(ele, ...events) {
		return Promise.race(events.map(event =>
			new Promise(resolve => ele.addEventListener(event, function fire() {
				ele.removeEventListener(event, fire);
				resolve();
			}))
		));
	}

	addListener('userGesture', () => waitForEvent(document.body, 'mousedown', 'keydown'));

	RESEnvironment._addSharedListeners(addListener);

	// RESEnvironment

	{
		const inProgress = new Map();

		RESEnvironment.requestPermissions = async (...perms) => {
			const key = perms.join(',');

			if (!inProgress.has(key)) {
				inProgress.set(key, (async () => {
					const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
					const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');

					const granted = await RESEnvironment._sendMessage('permissions', { permissions, origins });

					inProgress.delete(key);

					if (!granted) {
						const re = /((?:\w+\.)+\w+)(?=\/|$)/i;
						modules['notifications'].showNotification(
							`<p>You clicked "Deny". RES needs permission to access the API(s) at:</p>
							<p>${origins.map(u => `<code>${re.exec(u)[0]}</code>`).join(', ')}</p>
							<p>Be assured RES does not access any of your information on these domains - it only accesses the API.</p>`,
							20000
						);
						throw new Error(`Permission not granted for: ${perms.join(', ')}`);
					}
				})());
			}

			return inProgress.get(key);
		};
	}

	RESEnvironment.loadResourceAsText = filename =>
		RESEnvironment.ajax({ url: chrome.runtime.getURL(filename) });

	RESEnvironment.storageSetup = async () => {
		// we've got chrome, get a copy of the background page's localStorage first, so don't init until after.
		let response = await RESEnvironment._sendMessage('getLocalStorage');

		// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy
		// old school localStorage from the foreground page to the background page to keep their settings...
		if (!response || !response.importedFromForeground) {
			// it doesn't exist.. copy it over...
			const ls = {};
			for (let i = 0, len = localStorage.length; i < len; i++) {
				if (localStorage.key(i)) {
					ls[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
				}
			}

			response = await RESEnvironment._sendMessage('saveLocalStorage', ls);
		}

		RESStorage.setup.complete(response);
	};

	RESEnvironment.isPrivateBrowsing = RESUtils.once(() =>
		Promise.resolve(chrome.extension.inIncognitoContext)
	);
}
