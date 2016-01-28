/* global safari */

// Safari has a ridiculous bug that causes it to lose access to safari.self.tab if you click the back button.
// this stupid one liner fixes that.
window.onunload = () => { /* empty */ };

// since safari's built in extension stylesheets are treated as user stylesheets,
// we can't inject them that way.  That makes them "user stylesheets" which would make
// them require !important everywhere - we don't want that, so we'll inject this way instead.
(function setupCSS() {
	if (!document.head) {
		setTimeout(setupCSS, 200);
		return;
	}

	const cssFiles = ['css/res.css', 'vendor/guiders.css', 'vendor/tokenize.css'];

	cssFiles.forEach(filename => {
		const linkTag = document.createElement('link');
		linkTag.rel = 'stylesheet';
		linkTag.href = safari.extension.baseURI + filename;
		document.head.appendChild(linkTag);
	});
})();

{
	const listeners = new Map();
	const waiting = new Map();
	let transaction = 0;

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
	 * If it rejects, an invalid response will be sent.
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
	 * Sends a message to the background page.
	 * @param {string} type
	 * @param {*} [data]
	 * @returns {Promise<*, Error>} Rejects if an invalid response is received,
	 * resolves with the response data otherwise.
	 */
	RESEnvironment._sendMessage = (type, data) => {
		++transaction;

		safari.self.tab.dispatchMessage(type, { data, transaction });

		return new Promise((resolve, reject) => waiting.set(transaction, { resolve, reject }));
	};

	safari.self.addEventListener('message', ({ name: type, message: { data, transaction, error, isResponse } }) => {
		if (isResponse) {
			if (!waiting.has(transaction)) {
				throw new Error(`No response handler for type: ${type}, transaction: ${transaction} - this should never happen.`);
			}

			const handler = waiting.get(transaction);
			waiting.delete(transaction);

			if (error) {
				handler.reject(new Error(`Error in background handler for type: ${type} - message: ${error}`));
			} else {
				handler.resolve(data);
			}

			return;
		}

		if (!listeners.has(type)) {
			throw new Error(`Unrecognised message type: ${type}`);
		}
		const listener = listeners.get(type);

		function sendResponse({ data, error }) {
			safari.self.tab.dispatchMessage(type, { data, transaction, error, isResponse: true });
		}

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
	}, false);

	// Listeners

	RESEnvironment._addSharedListeners(addListener);

	// RESEnvironment

	RESEnvironment.sanitizeJSON = data => {
		if (data.slice(0, 2) === 's{') {
			data = data.slice(1);
		}
		return data;
	};

	RESEnvironment.loadResourceAsText = filename =>
		RESEnvironment.ajax({ url: safari.extension.baseURI + filename });

	RESEnvironment.deleteCookies = (...cookieNames) => {
		cookieNames.forEach(cookieName => document.cookie = `${cookieName}=null;expires=${Date.now()}; path=/;domain=reddit.com`);
		return Promise.resolve();
	};

	// The iframe hack doesn't work anymore, so Safari has no way to add urls to history
	RESEnvironment.addURLToHistory = () => Promise.resolve();

	// Safari has no pageAction
	RESEnvironment.pageAction.show = () => Promise.resolve();
	RESEnvironment.pageAction.hide = () => Promise.resolve();
	RESEnvironment.pageAction.destroy = () => Promise.resolve();
}
