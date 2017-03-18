/* @flow */

type MessagePayload = {
	type: string,
	transaction: number,
	data?: mixed,
	error?: string,
	isResponse?: boolean,
};

type InternalMessageSender<Ctx> = (msg: MessagePayload, context: Ctx) => void;

type InternalMessageHandler<Ctx> = (msg: MessagePayload, context: Ctx) => boolean;

export type MessageSender<Ctx> = (type: string, data: mixed, context: Ctx) => Promise<mixed>;

export type SynchronousMessageSender<Ctx> = (type: string, data: mixed, context: Ctx) => mixed;

export type AddListener<Ctx> = (type: string, callback: ListenerCallback<Ctx>) => void;

type ListenerCallback<Ctx> = (data: any, context: Ctx) => Promise<mixed> | mixed;

type HandlerFunctions<Ctx> = {
	_handleMessage: InternalMessageHandler<Ctx>,
	sendMessage: MessageSender<Ctx>,
	sendSynchronous: SynchronousMessageSender<Ctx>,
	addListener: AddListener<Ctx>,
	addInterceptor: AddListener<Ctx>,
};

function isPromise(maybePromise) {
	return maybePromise && typeof maybePromise === 'object' && typeof maybePromise.then === 'function';
}

export function createMessageHandler<Ctx>(_sendMessage: InternalMessageSender<Ctx>, _onListenerError: (e: mixed) => void = e => console.error(e)): HandlerFunctions<Ctx> {
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
		const interceptor = interceptors.get(type);
		if (interceptor) {
			try {
				const response = interceptor(data, context);
				if (isPromise(response) /*:: && response instanceof Promise */) {
					return response.catch(e => Promise.reject(new Error(`Error in "${type}" interceptor: ${e.message || e}`)));
				}
				return Promise.resolve(response);
			} catch (e) {
				return Promise.reject(new Error(`Error in "${type}" interceptor: ${e.message || e}`));
			}
		}

		++transaction;

		_sendMessage({ type, data, transaction }, context);

		return new Promise((resolve, reject) => waiting.set(transaction, { resolve, reject }));
	}

	function sendSynchronous(type, data, context) {
		const interceptor = interceptors.get(type);
		if (!interceptor) {
			throw new Error(`Unrecognised interceptor type: ${type}`);
		}

		try {
			return interceptor(data, context);
		} catch (e) {
			throw new Error(`Error in "${type}" interceptor: ${e.message || e}`);
		}
	}

	function _handleMessage({ type, data, transaction, error, isResponse }, context) {
		if (isResponse) {
			const handler = waiting.get(transaction);
			if (!handler) {
				throw new Error(`No "${type}" response handler (transaction ${transaction}) - this should never happen.`);
			}
			waiting.delete(transaction);

			if (error) {
				handler.reject(new Error(`Error in target's "${type}" handler: ${error}`));
			} else {
				handler.resolve(data);
			}

			return false;
		}

		function sendResponse({ data, error }: { data?: mixed, error?: string }) {
			_sendMessage({ type, data, transaction, error, isResponse: true }, context);
		}

		const listener = listeners.get(type);
		if (!listener) {
			sendResponse({ error: `Unrecognised message type: ${type}` });
			return false;
		}

		let response;

		try {
			response = listener(data, context);
		} catch (e) {
			sendResponse({ error: e.message || e });
			_onListenerError(e);
			return false;
		}

		if (isPromise(response) /*:: && response instanceof Promise */) {
			response
				.then(
					data => sendResponse({ data }),
					e => {
						sendResponse({ error: e.message || e });
						_onListenerError(e);
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
