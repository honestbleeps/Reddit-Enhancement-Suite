import { createMessageHandler } from '../lib/environment/_helpers';
import { extendDeep, keyedMutex, waitForEvent } from '../lib/utils';
import { apiToPromise } from './_helpers';

const _sendMessage = apiToPromise(chrome.runtime.sendMessage);

const {
	_handleMessage,
	sendMessage,
	addListener,
	addInterceptor,
} = createMessageHandler((type, { transaction, isResponse, ...obj }, sendResponse) => {
	if (isResponse) {
		sendResponse(obj);
	} else {
		_sendMessage({ ...obj, type }).then(obj => {
			_handleMessage(type, { ...obj, transaction, isResponse: true });
		});
	}
});

chrome.runtime.onMessage.addListener(({ type, ...obj }, sender, sendResponse) => _handleMessage(type, obj, sendResponse));

export {
	sendMessage,
	addListener,
	addInterceptor,
};

addListener('userGesture', () => waitForEvent(document.body, 'mousedown', 'keydown'));

addInterceptor('isPrivateBrowsing', () => chrome.extension.inIncognitoContext);

const _set = apiToPromise(::chrome.storage.local.set);
const set = (key, value) => _set({ [key]: value });

const _get = apiToPromise(::chrome.storage.local.get);
const get = async (key, defaultValue = null) => (await _get({ [key]: defaultValue }))[key];

addInterceptor('storage', keyedMutex(async ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			return get(key, null);
		case 'batch':
			const defaults = {};
			// key is an array here
			for (const k of key) {
				defaults[k] = null;
			}
			return _get(defaults);
		case 'set':
			return set(key, value);
		case 'patch':
			const extended = extendDeep(await get(key) || {}, value);
			return set(key, extended);
		case 'deletePath':
			try {
				const stored = await get(key) || {};
				value.split(',').reduce((obj, key, i, { length }) => {
					if (i < length - 1) return obj[key];
					delete obj[key];
				}, stored);
				return set(key, stored);
			} catch (e) {
				throw new Error(`Failed to delete path: ${value} on key: ${key} - error: ${e}`);
			}
		case 'delete':
			return apiToPromise(::chrome.storage.local.remove)(key);
		case 'has':
			const sentinel = Math.random();
			return (await get(key, sentinel)) !== sentinel;
		case 'keys':
			return Object.keys(await _get(null));
		case 'clear':
			return apiToPromise(::chrome.storage.local.clear)();
		default:
			throw new Error(`Invalid storage operation: ${operation}`);
	}
}, ([, key]) => key || '__all_keys__'));
