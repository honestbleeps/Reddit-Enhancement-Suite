import { makeGetMessage } from '../locales/dynamic';
import { createMessageHandler } from '../lib/environment/_messaging';
import { nativeRequire } from '../lib/environment/_nativeRequire';
import { extendDeep } from '../lib/utils';

const {
	sendMessage,
	sendSynchronous,
	addListener,
	addInterceptor,
} = createMessageHandler(() => {});

export {
	sendMessage,
	sendSynchronous,
	addListener,
};

let _storage = {};

export function _mockStorage(storage) {
	if (storage) {
		_storage = storage;
	}
	return _storage;
}

addInterceptor('storage', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			try {
				return key in _storage ? JSON.parse(_storage[key]) : null;
			} catch (e) {
				console.warn('Failed to parse:', key, 'falling back to raw string.');
			}
			return _storage[key];
		case 'batch':
			const values = {};
			const keys = key;
			for (const key of keys) {
				try {
					values[key] = key in _storage ? JSON.parse(_storage[key]) : null;
				} catch (e) {
					console.warn('Failed to parse:', key, 'falling back to raw string.');
					values[key] = _storage[key];
				}
			}
			return values;
		case 'set':
			_storage[key] = JSON.stringify(value);
			break;
		case 'patch':
			try {
				const stored = JSON.parse(_storage[key] || '{}') || {};
				_storage[key] = JSON.stringify(extendDeep(stored, value));
			} catch (e) {
				throw new Error(`Failed to patch: ${key} - error: ${e}`);
			}
			break;
		case 'deletePath':
			try {
				const stored = JSON.parse(_storage[key] || '{}') || {};
				value.split(',').reduce((obj, key, i, { length }) => {
					if (i < length - 1) return obj[key];
					delete obj[key];
				}, stored);
				_storage[key] = JSON.stringify(stored);
			} catch (e) {
				throw new Error(`Failed to delete path: ${value} on key: ${key} - error: ${e}`);
			}
			break;
		case 'delete':
			delete _storage[key];
			break;
		case 'has':
			return key in _storage;
		case 'keys':
			return Object.keys(_storage);
		case 'clear':
			_storage = {};
			break;
		default:
			throw new Error(`Invalid storage operation: ${operation}`);
	}
});

let getMessage;

addInterceptor('i18n-load', async userLocale => {
	getMessage = await makeGetMessage(userLocale, nativeRequire);
});

addInterceptor('i18n', ([messageName, substitutions]) => getMessage(messageName, substitutions));
