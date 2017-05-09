/* eslint-env webextensions */

import { keyedMutex } from '../lib/utils/async';
import { extendDeep } from '../lib/utils/object';
import { createMessageHandler } from './utils/messaging';
import { apiToPromise } from './utils/api';

const _sendMessage = apiToPromise(chrome.runtime.sendMessage);

const {
	_handleMessage,
	sendMessage,
	sendSynchronous,
	addListener,
	addInterceptor,
} = createMessageHandler(({ transaction, isResponse, ...obj }, sendResponse) => {
	if (isResponse) {
		sendResponse(obj);
	} else {
		_sendMessage(obj).then(obj => {
			_handleMessage({ ...obj, transaction, isResponse: true });
		});
	}
});

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => _handleMessage(obj, sendResponse));

export {
	sendMessage,
	sendSynchronous,
	addListener,
	addInterceptor,
};

addInterceptor('extensionId', () => chrome.runtime.id);

addInterceptor('isPrivateBrowsing', () => chrome.extension.inIncognitoContext);

const _set = apiToPromise((items, callback) => chrome.storage.local.set(items, callback));
const set = (key, value) => _set({ [key]: value });

const _get = apiToPromise((keys, callback) => chrome.storage.local.get(keys, callback));
const get = async (key, defaultValue = null) => (await _get({ [key]: defaultValue }))[key];

const _delete = apiToPromise((keys, callback) => chrome.storage.local.remove(keys, callback));

const _clear = apiToPromise(callback => chrome.storage.local.clear(callback));

addInterceptor('storage', keyedMutex(async ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			return get(key, null);
		case 'getAll':
			return _get(null);
		case 'batch':
			const defaults = {};
			// key is an array here
			for (const k of key) {
				defaults[k] = null;
			}
			return _get(defaults);
		case 'set':
			return set(key, value);
		case 'setMultiple':
			return _set(value);
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
			return _delete(key);
		case 'has':
			const sentinel = Math.random();
			return (await get(key, sentinel)) !== sentinel;
		case 'keys':
			return Object.keys(await _get(null));
		case 'clear':
			return _clear();
		default:
			throw new Error(`Invalid storage operation: ${operation}`);
	}
}, ([, key]) => key || '__all_keys__'));
