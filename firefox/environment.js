import { createMessageHandler } from '../lib/environment/common/messaging';

const {
	_handleMessage,
	sendMessage,
	sendSynchronous,
	addListener,
	addInterceptor,
} = createMessageHandler(obj => self.postMessage(obj));

self.on('message', obj => _handleMessage(obj));

export {
	sendMessage,
	sendSynchronous,
	addListener,
};

addInterceptor('permissions', () => true);
