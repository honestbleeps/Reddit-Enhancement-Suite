/* global safari */

import { apiToPromise } from './_helpers';

const {
	sendMessage,
	addListener
} = (() => {
	if (process.env.BUILD_TARGET === 'chrome') {
		const listeners = new Map();

		function addListener(type, callback) {
			if (listeners.has(type)) {
				throw new Error(`Listener for message type: ${type} already exists.`);
			}
			listeners.set(type, { callback });
		}

		async function sendMessage(type, data) {
			const message = { type, data };

			const response = await apiToPromise(chrome.runtime.sendMessage)(message);

			if (!response) {
				throw new Error(`Critical error in background handler for type: ${type}`);
			}

			if (response.error) {
				throw new Error(`Error in background handler for type: ${type} - message: ${response.error}`);
			}

			return response.data;
		}

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

		return {
			sendMessage,
			addListener
		};
	} else if (process.env.BUILD_TARGET === 'firefox' || process.env.BUILD_TARGET === 'safari') {
		let _sendMessage;

		if (process.env.BUILD_TARGET === 'firefox') {
			_sendMessage = (type, obj) => {
				self.postMessage({ ...obj, type });
			};

			self.on('message', ({ type, data, transaction, error, isResponse }) => {
				_handleMessage(type, data, transaction, error, isResponse);
			});
		} else if (process.env.BUILD_TARGET === 'safari') {
			_sendMessage = (type, obj) => {
				safari.self.tab.dispatchMessage(type, obj);
			};

			safari.self.addEventListener('message', ({ name: type, message: { data, transaction, error, isResponse } }) => {
				_handleMessage(type, data, transaction, error, isResponse);
			});
		}

		const listeners = new Map();
		const waiting = new Map();
		let transaction = 0;

		function addListener(type, callback) {
			if (listeners.has(type)) {
				throw new Error(`Listener for message type: ${type} already exists.`);
			}
			listeners.set(type, { callback });
		}

		function sendMessage(type, data) {
			++transaction;

			_sendMessage(type, { data, transaction });

			return new Promise((resolve, reject) => waiting.set(transaction, { resolve, reject }));
		}

		function _handleMessage(type, data, transaction, error, isResponse) {
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
				_sendMessage(type, { data, transaction, error, isResponse: true });
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
				return;
			}
			sendResponse({ data: response });
		}

		return {
			sendMessage,
			addListener
		};
	} else {
		return {
			sendMessage: () => Promise.resolve(),
			addListener: () => {}
		};
	}
})();

export {
	sendMessage as _sendMessage,
	addListener as _addListener
};
