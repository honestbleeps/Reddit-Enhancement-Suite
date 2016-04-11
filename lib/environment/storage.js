import { _sendMessage } from './_sendMessage';
import { apiToPromise } from './_helpers';
import { extendDeep } from '../utils';

let _storage = {};

export function _mockStorage(storage) {
	if (storage) {
		_storage = storage;
	}
	return _storage;
}

const {
	get,
	set,
	patch,
	deletePath,
	_delete,
	has,
	keys,
	clear
} = (() => {
	if (process.env.BUILD_TARGET === 'chrome') {
		const queues = new Map();

		function mutex(callback) {
			return (...args) => {
				const key = args[0];
				let tail;
				if (queues.has(key)) {
					tail = queues.get(key).then(() => callback(...args));
				} else {
					tail = callback(...args);
				}
				queues.set(key, tail);
				tail.then(() => {
					if (queues.get(key) === tail) queues.delete(key);
				});
				return tail;
			};
		}

		const _set = apiToPromise(::chrome.storage.local.set);
		const set = (key, value) => _set({ [key]: value });

		const _get = apiToPromise(::chrome.storage.local.get);
		const get = async (key, defaultValue = null) => (await _get({ [key]: defaultValue }))[key];

		return {
			get: mutex(key => get(key, null)),

			set: mutex((key, value) => set(key, value)),

			patch: mutex(async (key, value) => {
				const extended = extendDeep(await get(key) || {}, value);
				return set(key, extended);
			}),

			deletePath: mutex(async (key, ...path) => {
				try {
					const stored = await get(key) || {};
					path.reduce((obj, key, i, { length }) => {
						if (i < length - 1) return obj[key];
						delete obj[key];
					}, stored);
					return set(key, stored);
				} catch (e) {
					throw new Error(`Failed to delete path: ${path} on key: ${key} - error: ${e}`);
				}
			}),

			_delete: mutex(apiToPromise(::chrome.storage.local.remove)),

			has: mutex(async key => {
				const sentinel = Math.random();
				return (await get(key, sentinel)) !== sentinel;
			}),

			keys: async () => Object.keys(await _get(null)),

			clear: apiToPromise(::chrome.storage.local.clear)
		};
	} else if (process.env.BUILD_TARGET === 'node') {
		return {
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
	} else {
		return {
			/**
			 * @param {string} key
			 * @returns {Promise<*|null, *>}
			 */
			get(key) {
				return _sendMessage('storage', ['get', key]);
			},

			/**
			 * @param {string} key
			 * @param {*} [value]
			 * @returns {Promise<void, *>}
			 */
			set(key, value) {
				return _sendMessage('storage', ['set', key, value]);
			},

			/**
			 * Deeply extends a value in storage.
			 * @param {string} key
			 * @param {!Object} value
			 * @returns {Promise<void, *>}
			 */
			patch(key, value) {
				return _sendMessage('storage', ['patch', key, value]);
			},

			/**
			 * Deletes a property on a value in storage.
			 * Path components may not contain ','
			 * i.e. `deletePath('userTaggerStorageKey', 'username', 'tag')`
			 * will `delete userTaggerStoredValue.username.tag`
			 * @param {string} key
			 * @param {...string} path
			 * @returns {Promise<void, *>}
			 */
			deletePath(key, ...path) {
				return _sendMessage('storage', ['deletePath', key, path.join(',')]);
			},

			/**
			 * @param {string} key
			 * @returns {Promise<void, *>}
			 */
			_delete(key) {
				return _sendMessage('storage', ['delete', key]);
			},

			/**
			 * @param {string} key
			 * @returns {Promise<boolean, *>}
			 */
			has(key) {
				return _sendMessage('storage', ['has', key]);
			},

			/**
			 * @returns {Promise<string[], *>}
			 */
			keys() {
				return _sendMessage('storage', ['keys']);
			},

			/**
			 * @returns {Promise<void, *>}
			 */
			clear() {
				return _sendMessage('storage', ['clear']);
			}
		};
	}
})();

export {
	get,
	set,
	patch,
	deletePath,
	_delete as delete,
	has,
	keys,
	clear
};
