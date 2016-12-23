import { makeGetMessage } from '../locales/dynamic';
import { createMessageHandler } from '../lib/environment/_messaging';

const {
	_handleMessage,
	sendMessage,
	sendSynchronous,
	addListener,
	addInterceptor,
} = createMessageHandler((type, obj) => self.postMessage({ ...obj, type }));

self.on('message', ({ type, ...obj }) => {
	_handleMessage(type, obj);
});

export {
	sendMessage,
	sendSynchronous,
	addListener,
};

addInterceptor('permissions', () => true);

let getMessage;

addInterceptor('i18n-load', async userLocale => {
	getMessage = await makeGetMessage(userLocale, path => sendMessage('loadJson', path));
});

addInterceptor('i18n', ([messageName, substitutions]) => getMessage(messageName, substitutions));
