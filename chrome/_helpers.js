export function apiToPromise(func) {
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

export function createChromeMessageHandler(_sendMessage) {
	const listeners = new Map();

	function addListener(type, callback) {
		if (listeners.has(type)) {
			throw new Error(`Listener for message type: ${type} already exists.`);
		}
		listeners.set(type, { callback });
	}

	async function sendMessage(type, data, context) {
		const message = { type, data };

		const response = await _sendMessage(message, context);

		if (!response) {
			throw new Error(`Critical error in target's handler for type: ${type}`);
		}

		if (response.error) {
			throw new Error(`Error in target's handler for type: ${type} - message: ${response.error}`);
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
			// sender.tab will be undefined for background -> foreground messages
			response = listener.callback(data, sender.tab);
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
}
