import { createMessageHandler } from '../lib/environment/_helpers';
import { extendDeep } from '../lib/utils';

const {
	sendMessage,
	addListener,
	addInterceptor
} = createMessageHandler(() => {});

export {
	sendMessage,
	addListener
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
