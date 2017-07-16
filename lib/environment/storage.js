/* @flow */

import _ from 'lodash';
import { sendMessage, sendSynchronous } from '../../browser';

export function get(key: string): Promise<any | null> {
	return sendSynchronous('storage', ['get', key]);
}

export function getAll(): Promise<{ [key: string]: mixed }> {
	return sendSynchronous('storage', ['getAll']);
}

export function batch<T: string>(keys: T[]): Promise<{ [key: T]: any | null }> {
	return sendSynchronous('storage', ['batch', keys]);
}

export function set(key: string, value: mixed) {
	return sendSynchronous('storage', ['set', key, value]);
}

export function setMultiple(valueMap: { +[key: string]: mixed }) {
	return sendSynchronous('storage', ['setMultiple', null, valueMap]);
}

export function compareAndSet(key: string, oldValue: mixed, newValue: mixed): Promise<boolean> {
	return sendMessage('storage-cas', [key, oldValue, newValue]);
}

/*
 * Deeply extends a value in storage.
 */
export function patch(key: string, value: { [key: string]: mixed }) {
	return sendSynchronous('storage', ['patch', key, value]);
}

/*
 * Deletes a property on a value in storage.
 * Path components may not contain ','
 * i.e. `deletePath('userTaggerStorageKey', 'username', 'tag')`
 * will `delete userTaggerStoredValue.username.tag`
 */
export function deletePath(key: string, ...path: string[]) {
	return sendSynchronous('storage', ['deletePath', key, path.join(',')]);
}

function _delete(keys: string | string[]) {
	return sendSynchronous('storage', ['delete', keys]);
}
export { _delete as delete };

export function has(key: string): Promise<boolean> {
	return sendSynchronous('storage', ['has', key]);
}

export function keys(): Promise<string[]> {
	return sendSynchronous('storage', ['keys']);
}

export function clear() {
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
		return deletePath(this._key(), ...path);
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

	getNullable(key: string): Promise<?T> {
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

	async batch(keys: string[]): Promise<{ [key: string]: T }> {
		const rawValues = await batch(keys.map(k => this._keyGen(k)));
		return _.transform(rawValues, (acc, v, k) => {
			acc[k.slice(this._prefix.length)] = (v === null ? this._default() : v);
		}, {});
	}

	async batchNullable(keys: string[]): Promise<{ [key: string]: ?T }> {
		const rawValues = await batch(keys.map(k => this._keyGen(k)));
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

	compareAndSet(key: string, oldValue: T, newValue: T): Promise<boolean> {
		return compareAndSet(this._keyGen(key), oldValue, newValue);
	}

	deletePath(key: string, ...path: string[]): Promise<void> {
		return deletePath(this._keyGen(key), ...path);
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
