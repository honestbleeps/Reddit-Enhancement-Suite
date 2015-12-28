/* global safari */

// Safari has a ridiculous bug that causes it to lose access to safari.self.tab if you click the back button.
// this stupid one liner fixes that.
window.onunload = () => {};

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
	 * Ignored if the listener is silent.
	 */

	/**
	 * Register a listener to be invoked whenever a message of <tt>type</tt> is received.
	 * Responses may be sent synchronously or asynchronously:
	 * If <tt>silent</tt> is true, no response will be sent.
	 * If <tt>callback</tt> returns a non-promise value, a response will be sent synchronously.
	 * If <tt>callback</tt> returns a promise, a response will be sent asynchronously when it resolves.
	 * If it rejects, an invalid response will be sent.
	 * @param {string} type
	 * @param {MessageListener} callback
	 * @param {boolean} [silent=false]
	 * @throws {Error} If a listener for <tt>messageType</tt> already exists.
	 * @returns {void}
	 */
	function addListener(type, callback, { silent = false } = {}) {
		if (listeners.has(type)) {
			throw new Error(`Listener for message type: ${type} already exists.`);
		}
		listeners.set(type, {
			options: { silent },
			callback
		});
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

	safari.self.addEventListener('message', ({ name: type, message: { data, transaction, isError, isResponse } }) => {
		if (isResponse) {
			if (!waiting.has(transaction)) {
				throw new Error(`No response handler for type: ${type}, transaction: ${transaction} - this should never happen.`);
			}

			const handler = waiting.get(transaction);
			waiting.delete(transaction);

			if (isError) {
				handler.reject(new Error(`Error in background handler for type: ${type}`));
			} else {
				handler.resolve(data);
			}

			return;
		}

		if (!listeners.has(type)) {
			throw new Error(`Unrecognised message type: ${type}`);
		}
		const listener = listeners.get(type);

		const response = listener.callback(data);

		if (listener.options.silent) {
			return;
		}

		function sendResponse({ data, isError }) {
			safari.self.tab.dispatchMessage(type, { data, transaction, isError, isResponse: true });
		}

		if (response instanceof Promise) {
			response
				.then(data => sendResponse({ data }))
				.catch(error => {
					sendResponse({ isError: true });
					throw error;

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

	RESEnvironment.addURLToHistory = (() => {
		// This is the poor man's implementation of browser.history.push()
		const frame = RESUtils.once(() => {
			const frame = document.createElement('iframe');
			frame.addEventListener('load', function onload() {
				frame.removeEventListener('load', onload);
				frame.contentWindow.location.replace('about:blank');
			});
			frame.style.display = 'none';
			frame.style.width = '0px';
			frame.style.height = '0px';
			document.body.appendChild(frame);
			return frame;
		});

		return async url => {
			if (!(await RESEnvironment.isPrivateBrowsing())) {
				frame().contentWindow.location.replace(url);
			}
		};
	})();

	// Safari has no pageAction
	RESEnvironment.pageAction.show = () => Promise.resolve();
	RESEnvironment.pageAction.hide = () => Promise.resolve();
	RESEnvironment.pageAction.destroy = () => Promise.resolve();

	RESEnvironment.storageSetup = async () => {
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
}
