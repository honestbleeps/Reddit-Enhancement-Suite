/* @flow */

import _ from 'lodash';
import { sendMessage } from '../../browser';

export function get(key: string): Promise<any | null> {
	return sendMessage('storage', ['get', key]);
}

export function getAll(): Promise<{ [key: string]: mixed }> {
	return sendMessage('storage', ['getAll']);
}

export function batch<T: string>(keys: T[]): Promise<{ [key: T]: any | null }> {
	return sendMessage('storage', ['batch', keys]);
}

export function set(key: string, value: mixed) {
	return sendMessage('storage', ['set', key, value]);
}

/*
 * Deeply extends a value in storage.
 */
export function patch(key: string, value: { [key: string]: mixed }) {
	return sendMessage('storage', ['patch', key, value]);
}

/*
 * Deletes a property on a value in storage.
 * Path components may not contain ','
 * i.e. `deletePath('userTaggerStorageKey', 'username', 'tag')`
 * will `delete userTaggerStoredValue.username.tag`
 */
export function deletePath(key: string, ...path: string[]) {
	return sendMessage('storage', ['deletePath', key, path.join(',')]);
}

function _delete(keys: string | string[]) {
	return sendMessage('storage', ['delete', keys]);
}
export { _delete as delete };

export function has(key: string): Promise<boolean> {
	return sendMessage('storage', ['has', key]);
}

export function keys(): Promise<string[]> {
	return sendMessage('storage', ['keys']);
}

export function clear() {
	return sendMessage('storage', ['clear']);
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

	async getAll(): Promise<{ [key: string]: T }> {
		const everything = await getAll();
		return _.transform(everything, (acc, v, k) => {
			if (k.startsWith(this._prefix)) {
				acc[k.slice(this._prefix.length)] = v;
			}
		}, {});
	}

	set(key: string, value: T): Promise<void> {
		return set(this._keyGen(key), value);
	}

	patch(key: string, value: $Shape<T>): Promise<void> {
		return patch(this._keyGen(key), (value: any));
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
