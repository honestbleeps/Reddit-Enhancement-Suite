/* global self */

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
	 * Register a listener to be invoked whenever a message of <tt>type</tt> is received.
	 * Responses may be sent synchronously or asynchronously:
	 * If <tt>callback</tt> returns a non-promise value, a response will be sent synchronously.
	 * If <tt>callback</tt> returns a promise, a response will be sent asynchronously when it resolves.
	 * If it rejects, an invalid response will be sent.
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
	 * Sends a message to the background page.
	 * @param {string} type
	 * @param {*} [data]
	 * @returns {Promise<*, Error>} Rejects if an invalid response is received,
	 * resolves with the response data otherwise.
	 */
	RESEnvironment._sendMessage = (type, data) => {
		++transaction;

		self.postMessage({ type, data, transaction });

		return new Promise((resolve, reject) => waiting.set(transaction, { resolve, reject }));
	};

	self.on('message', ({ type, data, transaction, isError, isResponse }) => {
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

		function sendResponse({ data, isError }) {
			self.postMessage({ type, data, transaction, isError, isResponse: true });
		}

		let response;

		try {
			response = listener.callback(data);
		} catch (e) {
			sendResponse({ isError: true });
			throw e;
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
	});

	// Listeners

	addListener('pageActionRefresh', () => modules['styleTweaks'].updatePageAction());

	RESEnvironment._addSharedListeners(addListener);

	// RESEnvironment

	RESEnvironment.loadResourceAsText = filename =>
		RESEnvironment._sendMessage('readResource', filename);

	RESEnvironment.storageSetup = async () => {
		// we've got firefox jetpack, get localStorage from background process
		let response = await RESEnvironment._sendMessage('getLocalStorage');

		// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy
		// old school localStorage from the foreground page to the background page to keep their settings...
		if (!response || !response.importedFromForeground) {
			// it doesn't exist.. copy it over...
			response = await RESEnvironment._sendMessage('saveLocalStorage', localStorage);
		}

		RESStorage.setup.complete(response);
	};
}
