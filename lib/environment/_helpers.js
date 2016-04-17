export function createMessageHandler(_sendMessage) {
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

	function _handleMessage(type, { data, transaction, error, isResponse }) {
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
		_handleMessage,
		sendMessage,
		addListener
	};
}
