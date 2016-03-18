/* global chrome:false */

if (typeof msBrowser !== 'undefined') {
	chrome = msBrowser;
}
else if (typeof browser != 'undefined') {
	chrome = browser;
}

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
	 * Register a listener to be invoked whenever a message of `type` is received.
	 * Responses may be sent synchronously or asynchronously:
	 * If `callback` returns a non-promise value, a response will be sent synchronously.
	 * If `callback` returns a promise, a response will be sent asynchronously when it resolves.
	 * If it rejects, an invalid response will be sent to close the message channel.
	 * @param {string} type
	 * @param {MessageListener} callback
	 * @throws {Error} If a listener for `messageType` already exists.
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
			throw new Error(`Critical error in background handler for type: ${type}`);
		}

		if (response.error) {
			throw new Error(`Error in background handler for type: ${type} - message: ${response.error}`);
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
			sendResponse({ error: e.message || e });
			throw e;
		}

		if (response instanceof Promise) {
			response
				.then(data => sendResponse({ data }))
				.catch(e => {
					sendResponse({ error: e.message || e });
					throw e;
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

		function filterPerms(perms) {
			const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
			const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
			return { permissions, origins };
		}

		RESEnvironment.permissions.request = async (...perms) => {
			const key = perms.join(',');

			if (!inProgress.has(key)) {
				inProgress.set(key, (async () => {
					const { permissions, origins } = filterPerms(perms);

					const granted = await RESEnvironment._sendMessage('permissions', { operation: 'request', permissions, origins });

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

		RESEnvironment.permissions.remove = async (...perms) => {
			const removed = await RESEnvironment._sendMessage('permissions', { operation: 'remove', ...filterPerms(perms) });
			if (!removed) {
				throw new Error(`Permissions not removed: ${perms.join(', ')} - are you trying to remove required permissions?`);
			}
		};
	}

	RESEnvironment.loadResourceAsText = filename =>
		RESEnvironment.ajax({ url: chrome.runtime.getURL(filename) });

	RESEnvironment.isPrivateBrowsing = RESUtils.once(() =>
		Promise.resolve(chrome.extension.inIncognitoContext)
	);
}
