// allow the reexports to be overridden
/* eslint-disable import/export */

import { createMessageHandler } from '../lib/environment/_helpers';

export * from '../lib/environment';

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
