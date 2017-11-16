/* @flow */

import _ from 'lodash';
import { sendMessage, sendSynchronous } from '../../browser';

export function get(key: string): Promise<any | null> {
	return sendSynchronous('storage', ['get', key]);
}

export function getAll(): Promise<{ [key: string]: mixed }> {
	return sendSynchronous('storage', ['getAll']);
}

export function getMultiple<T: string>(keys: T[]): Promise<{ [key: T]: any | null }> {
	return sendSynchronous('storage', ['getMultiple', keys]);
}

export function set(key: string, value: mixed): Promise<void> {
	return sendSynchronous('storage', ['set', key, value]);
}

export function setMultiple(valueMap: { +[key: string]: mixed }): Promise<void> {
	return sendSynchronous('storage', ['setMultiple', null, valueMap]);
}

function compareAndSet(key: string, oldValue: mixed, newValue: mixed): Promise<boolean> {
	return sendMessage('storage-cas', [key, oldValue, newValue]);
}

/*
 * Deeply patches an object in storage, like extendDeep().
 */
function patch(key: string, value: { [key: string]: mixed }): Promise<void> {
	return sendSynchronous('storage', ['patch', key, value]);
}

/*
 * Shallowly patches an object in storage, like Object.assign().
 */
function patchShallow(key: string, value: { [key: string]: mixed }): Promise<void> {
	return sendSynchronous('storage', ['patchShallow', key, value]);
}

/*
 * Deletes a property on a value in storage.
 * i.e. `deletePath('userTaggerStorageKey', 'username', 'tag')`
 * will `delete userTaggerStoredValue.username.tag`
 */
function deletePaths(key: string, paths: string[][]): Promise<void> {
	return sendSynchronous('storage', ['deletePaths', key, paths]);
}

function _delete(keys: string | string[]): Promise<void> {
	return sendSynchronous('storage', ['delete', keys]);
}
export { _delete as delete };

export function has(key: string): Promise<boolean> {
	return sendSynchronous('storage', ['has', key]);
}

export function keys(): Promise<string[]> {
	return sendSynchronous('storage', ['keys']);
}

export function clear(): Promise<void> {
	return sendSynchronous('storage', ['clear']);
}

class Wrapper<T> {
	_key: () => string;
	_default: T;

	constructor(key: $PropertyType<this, '_key'>, def: T) {
		this._key = key;
		this._default = def;
	}

	get(): Promise<T> {
		return get(this._key()).then(val => (val === null ? this._default : val));
	}

	set(value: T): Promise<void> {
		return set(this._key(), value);
	}

	patch(value: $Shape<T>): Promise<void> {
		return patch(this._key(), (value: any));
	}

	compareAndSet(oldValue: T, newValue: T): Promise<boolean> {
		return compareAndSet(this._key(), oldValue, newValue);
	}

	deletePath(...path: string[]): Promise<void> {
		return deletePaths(this._key(), [path]);
	}

	delete(): Promise<void> {
		return _delete(this._key());
	}

	has(): Promise<boolean> {
		return has(this._key());
	}
}

export function wrap<T>(key: string | () => string /* pure */, defaultValue: T): Wrapper<T> {
	// $FlowIssue
	const keyGenerator = typeof key === 'string' ? () => key : _.once(key);
	return new Wrapper(keyGenerator, defaultValue);
}

class PrefixWrapper<T> {
	_prefix: string;
	_keyMapper: (key: string) => string;
	_default: () => T;

	constructor(prefix: string, def: () => T, keyMapper: (key: string) => string) {
		this._prefix = prefix;
		this._default = def;
		this._keyMapper = keyMapper;
	}

	_keyGen(key: string): string {
		return this._prefix + this._keyMapper(key);
	}

	get(key: string): Promise<T> {
		return get(this._keyGen(key)).then(val => (val === null ? this._default() : val));
	}

	getNullable(key: string): Promise<T | null> {
		return get(this._keyGen(key));
	}

	async getAll(): Promise<{ [key: string]: T }> {
		const everything = await getAll();
		return _.transform(everything, (acc, v, k) => {
			if (k.startsWith(this._prefix)) {
				acc[k.slice(this._prefix.length)] = v;
			}
		}, {});
	}

	async getMultiple(keys: string[]): Promise<{ [key: string]: T }> {
		const rawValues = await getMultiple(keys.map(k => this._keyGen(k)));
		return _.transform(rawValues, (acc, v, k) => {
			acc[k.slice(this._prefix.length)] = (v === null ? this._default() : v);
		}, {});
	}

	async getMultipleNullable(keys: string[]): Promise<{ [key: string]: T | null }> {
		const rawValues = await getMultiple(keys.map(k => this._keyGen(k)));
		return _.transform(rawValues, (acc, v, k) => {
			acc[k.slice(this._prefix.length)] = v;
		}, {});
	}

	set(key: string, value: T): Promise<void> {
		return set(this._keyGen(key), value);
	}

	patch(key: string, value: $Shape<T>): Promise<void> {
		return patch(this._keyGen(key), (value: any));
	}

	deletePath(key: string, ...path: string[]): Promise<void> {
		return deletePaths(this._keyGen(key), [path]);
	}

	delete(keys: string | string[]): Promise<void> {
		return _delete([].concat(keys).map(k => this._keyGen(k)));
	}

	has(key: string): Promise<boolean> {
		return has(this._keyGen(key));
	}
}

export function wrapPrefix<T>(prefix: string, defaultValue: () => T, destructiveKeyMapper: (key: string) => string = x => x): PrefixWrapper<T> {
	return new PrefixWrapper(prefix, defaultValue, destructiveKeyMapper);
}

class BlobWrapper<T> {
	_rootKey: string;
	_default: () => T;

	constructor(rootKey: string, def: () => T) {
		this._rootKey = rootKey;
		this._default = def;
	}

	get(key: string): Promise<T> {
		return get(this._rootKey).then(val => (
			(val === null || val[key] === undefined) ? this._default() : val[key]
		));
	}

	getNullable(key: string): Promise<T | null> {
		return get(this._rootKey).then(val => (
			(val === null || val[key] === undefined) ? null : val[key]
		));
	}

	getAll(): Promise<{ [key: string]: T }> {
		return get(this._rootKey).then(val => (val === null ? {} : val));
	}

	async getMultiple(keys: string[]): Promise<{ [key: string]: T }> {
		const rawValues = (await get(this._rootKey)) || {};
		return _.transform(keys, (acc, key) => {
			acc[key] = rawValues[key] === undefined ? this._default() : rawValues[key];
		}, {});
	}

	async getMultipleNullable(keys: string[]): Promise<{ [key: string]: T | null }> {
		const rawValues = (await get(this._rootKey)) || {};
		return _.transform(keys, (acc, key) => {
			acc[key] = rawValues[key] === undefined ? null : rawValues[key];
		}, {});
	}

	set(key: string, value: T): Promise<void> {
		return patchShallow(this._rootKey, { [key]: value });
	}

	patch(key: string, value: $Shape<T>): Promise<void> {
		return patch(this._rootKey, { [key]: value });
	}

	deletePath(key: string, ...path: string[]): Promise<void> {
		return deletePaths(this._rootKey, [[key, ...path]]);
	}

	delete(keys: string | string[]): Promise<void> {
		return deletePaths(this._rootKey, [].concat(keys).map(k => [k]));
	}

	has(key: string): Promise<boolean> {
		return get(this._rootKey).then(val => (val !== null && val[key] !== undefined));
	}

	clear(): Promise<void> {
		return _delete(this._rootKey);
	}
}

export function wrapBlob<T>(rootKey: string, defaultValue: () => T): BlobWrapper<T> {
	return new BlobWrapper(rootKey, defaultValue);
}
