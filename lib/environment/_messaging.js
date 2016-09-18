function isPromise(maybePromise) {
	return typeof maybePromise === 'object' && typeof maybePromise.then === 'function';
}

export function createMessageHandler(_sendMessage) {
	const listeners = new Map();
	const interceptors = new Map();
	const waiting = new Map();
	let transaction = 0;

	function addListener(type, callback) {
		if (listeners.has(type)) {
			throw new Error(`Listener for "${type}" already exists.`);
		}
		listeners.set(type, callback);
	}

	function addInterceptor(type, callback) {
		if (interceptors.has(type)) {
			throw new Error(`Interceptor for "${type}" already exists.`);
		}
		interceptors.set(type, callback);
	}

	function sendMessage(type, data, context) {
		if (interceptors.has(type)) {
			try {
				const response = interceptors.get(type)(data, context);
				if (isPromise(response)) {
					return response.catch(e => Promise.reject(new Error(`Error in "${type}" interceptor: ${e.message || e}`)));
				}
				return Promise.resolve(response);
			} catch (e) {
				return Promise.reject(new Error(`Error in "${type}" interceptor: ${e.message || e}`));
			}
		}

		++transaction;

		_sendMessage(type, { data, transaction }, context);

		return new Promise((resolve, reject) => waiting.set(transaction, { resolve, reject }));
	}

	function sendSynchronous(type, data, context) {
		if (!interceptors.has(type)) {
			throw new Error(`Unrecognised interceptor type: ${type}`);
		}

		try {
			return interceptors.get(type)(data, context);
		} catch (e) {
			throw new Error(`Error in "${type}" interceptor: ${e.message || e}`);
		}
	}

	function _handleMessage(type, { data, transaction, error, isResponse }, context) {
		if (isResponse) {
			if (!waiting.has(transaction)) {
				throw new Error(`No "${type}" response handler (transaction ${transaction}) - this should never happen.`);
			}

			const handler = waiting.get(transaction);
			waiting.delete(transaction);

			if (error) {
				handler.reject(new Error(`Error in target's "${type}" handler: ${error}`));
			} else {
				handler.resolve(data);
			}

			return false;
		}

		if (!listeners.has(type)) {
			throw new Error(`Unrecognised message type: ${type}`);
		}

		function sendResponse({ data, error }) {
			_sendMessage(type, { data, transaction, error, isResponse: true }, context);
		}

		let response;

		try {
			response = listeners.get(type)(data, context);
		} catch (e) {
			sendResponse({ error: e.message || e });
			throw e;
		}

		if (isPromise(response)) {
			response
				.then(
					data => sendResponse({ data }),
					e => {
						sendResponse({ error: e.message || e });
						throw e;
					}
				);
			// true = response will be handled asynchronously (needed for Chrome)
			return true;
		}

		sendResponse({ data: response });

		return false;
	}

	return {
		_handleMessage,
		sendMessage,
		sendSynchronous,
		addListener,
		addInterceptor,
	};
}
