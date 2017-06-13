/* @flow */

type MessagePayload = {|
	type: string,
	data?: mixed,
|};

type ResponsePayload = {|
	data?: mixed,
	error?: {| message: string, stack: string |},
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

class MessageHandlerError extends Error {
	constructor(message, stack) {
		super();
		this.message = message;
		this.stack = stack;
	}
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
		return _sendMessage({ type, data }, context).then(({ data, error }) => {
			if (error) {
				throw new MessageHandlerError(error.message, `${error.stack}\n    at target's "${type}" handler`);
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
		return interceptor(data, context);
	}

	function _handleMessage({ type, data }, sendResponse, context) {
		const listener = listeners.get(type);
		if (!listener) {
			sendResponse({ error: { message: `Unrecognised message type: ${type}`, stack: '' } });
			return false;
		}

		let response;

		try {
			response = listener(data, context);
		} catch (e) {
			console.error(e);
			sendResponse({ error: { message: e.message, stack: e.stack } });
			return false;
		}

		if (isPromise(response) /*:: && response instanceof Promise */) {
			response
				.then(
					data => sendResponse({ data }),
					e => {
						console.error(e);
						sendResponse({ error: { message: e.message, stack: e.stack } });
					}
				);
			// true = response will be handled asynchronously (needed for Chrome)
			return true;
		} else {
			sendResponse({ data: response });
			return false;
		}
	}

	return {
		_handleMessage,
		sendMessage,
		sendSynchronous,
		addListener,
		addInterceptor,
	};
}
