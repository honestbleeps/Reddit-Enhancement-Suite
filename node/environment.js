// allow the reexports to be overridden
/* eslint-disable import/export */

import jsdom from 'jsdom';
import { extendDeep } from '../lib/utils';

global.document = jsdom.jsdom(undefined, { url: 'https://www.reddit.com/' });
global.window = document.defaultView;
global.location = window.location;
global.DOMParser = window.DOMParser;

global.sessionStorage = {
	getItem() {
		return undefined;
	}
};

export * from '../lib/environment';

let _storage = {};

export function _mockStorage(storage) {
	if (storage) {
		_storage = storage;
	}
	return _storage;
}

export const storage = {
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
