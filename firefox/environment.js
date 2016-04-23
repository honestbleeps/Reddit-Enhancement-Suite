import { createMessageHandler } from '../lib/environment/_helpers';

function _sendMessage(type, obj) {
	self.postMessage({ ...obj, type });
}

const {
	_handleMessage,
	sendMessage,
	addListener
} = createMessageHandler(_sendMessage);

self.on('message', ({ type, ...obj }) => {
	_handleMessage(type, obj);
});

export {
	sendMessage as _sendMessage,
	addListener as _addListener
};
