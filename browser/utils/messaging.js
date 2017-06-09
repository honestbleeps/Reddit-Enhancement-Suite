/* @flow */

type MessagePayload = {|
	type: string,
	data?: mixed,
|};

type ResponsePayload = {|
	data?: mixed,
	error?: string,
|};

type InternalMessageSender<MsgCtx> = (msg: MessagePayload, context: MsgCtx) => Promise<ResponsePayload>;

type InternalMessageHandler<ListenerCtx> = (msg: MessagePayload, sendResponse: (response: ResponsePayload) => void, context: ListenerCtx) => boolean;

export type MessageSender<MsgCtx> = (type: string, data: mixed, context: MsgCtx) => Promise<any>;

export type SynchronousMessageSender<MsgCtx> = (type: string, data: mixed, context: MsgCtx) => any;

export type AddListener<Ctx> = (type: string, callback: ListenerCallback<Ctx>) => void;

type ListenerCallback<Ctx> = (data: any, context: Ctx) => Promise<mixed> | mixed;

function isPromise(maybePromise) {
	return maybePromise && typeof maybePromise === 'object' && typeof maybePromise.then === 'function';
}

export function createMessageHandler<MsgCtx, ListenerCtx>(_sendMessage: InternalMessageSender<MsgCtx>): {|
	_handleMessage: InternalMessageHandler<ListenerCtx>,
	sendMessage: MessageSender<MsgCtx>,
	sendSynchronous: SynchronousMessageSender<MsgCtx>,
	addListener: AddListener<ListenerCtx>,
	addInterceptor: AddListener<MsgCtx>,
|} {
	const listeners = new Map();
	const interceptors = new Map();

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
					return response.catch(e => {
						console.error(e);
						return Promise.reject(new Error(`Error in "${type}" interceptor: ${e.message || e}`));
					});
				}
				return Promise.resolve(response);
			} catch (e) {
				console.error(e);
				return Promise.reject(new Error(`Error in "${type}" interceptor: ${e.message || e}`));
			}
		}

		return _sendMessage({ type, data }, context).then(({ data, error }) => {
			if (error) {
				throw new Error(`Error in target's "${type}" handler: ${error}`);
			} else {
				return data;
			}
		});
	}

	function sendSynchronous(type, data, context) {
		const interceptor = interceptors.get(type);
		if (!interceptor) {
			throw new Error(`Unrecognised interceptor type: ${type}`);
		}

		try {
			return interceptor(data, context);
		} catch (e) {
			console.error(e);
			throw new Error(`Error in "${type}" interceptor: ${e.message || e}`);
		}
	}

	function _handleMessage({ type, data }, sendResponse, context) {
		const listener = listeners.get(type);
		if (!listener) {
			sendResponse({ error: `Unrecognised message type: ${type}` });
			return false;
		}

		let response;

		try {
			response = listener(data, context);
		} catch (e) {
			console.error(e);
			sendResponse({ error: e.message || e });
			return false;
		}

		if (isPromise(response) /*:: && response instanceof Promise */) {
			response
				.then(
					data => sendResponse({ data }),
					e => {
						console.error(e);
						sendResponse({ error: e.message || e });
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
