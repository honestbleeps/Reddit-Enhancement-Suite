import { extendDeep } from '../lib/utils';

export function _sendMessage() { /* empty */ }
export function _addListener() { /* empty */ }

let _storage = {};

export function _mockStorage(storage) {
	if (storage) {
		_storage = storage;
	}
	return _storage;
}

export const Storage = {
	get(key) {
		try {
			return Promise.resolve(key in _storage ? JSON.parse(_storage[key]) : null);
		} catch (e) {
			console.warn('Failed to parse:', key, 'falling back to raw string.');
		}
		return Promise.resolve(_storage[key]);
	},
	set(key, value) {
		return new Promise(resolve => {
			_storage[key] = JSON.stringify(value);
			resolve();
		});
	},
	patch(key, value) {
		return new Promise(resolve => {
			try {
				const stored = JSON.parse(_storage[key] || '{}') || {};
				_storage[key] = JSON.stringify(extendDeep(stored, value));
			} catch (e) {
				throw new Error(`Failed to patch: ${key} - error: ${e}`);
			}
			resolve();
		});
	},
	deletePath(key, ...path) {
		return new Promise(resolve => {
			try {
				const stored = JSON.parse(_storage[key] || '{}') || {};
				path.reduce((obj, key, i, { length }) => {
					if (i < length - 1) return obj[key];
					delete obj[key];
				}, stored);
				_storage[key] = JSON.stringify(stored);
			} catch (e) {
				throw new Error(`Failed to delete path: ${path} on key: ${key} - error: ${e}`);
			}
			resolve();
		});
	},
	delete(key) {
		delete _storage[key];
		return Promise.resolve();
	},
	has(key) {
		return Promise.resolve(key in _storage);
	},
	keys() {
		return Promise.resolve(Object.keys(_storage));
	},
	clear() {
		_storage = {};
		return Promise.resolve();
	}
};
