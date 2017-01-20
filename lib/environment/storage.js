/* @flow */

import _ from 'lodash';
import { sendMessage } from 'browserEnvironment';

export function get(key: string): Promise<any | null> {
	return sendMessage('storage', ['get', key]);
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

function _delete(key: string) {
	return sendMessage('storage', ['delete', key]);
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
	const keyGenerator = typeof key === 'string' ? _.constant(key) : _.once(key);
	return new Wrapper(keyGenerator, defaultValue);
}

class DomainWrapper<K, T> {
	_keyGen: (k: K) => string;
	_default: T;

	constructor(keyGen: $PropertyType<this, '_keyGen'>, def: T) {
		this._keyGen = keyGen;
		this._default = def;
	}

	get(k: K): Promise<T> {
		return get(this._keyGen(k)).then(val => (val === null ? this._default : val));
	}

	set(k: K, value: T): Promise<void> {
		return set(this._keyGen(k), value);
	}

	patch(k: K, value: $Shape<T>): Promise<void> {
		return patch(this._keyGen(k), (value: any));
	}

	deletePath(k: K, ...path: string[]): Promise<void> {
		return deletePath(this._keyGen(k), ...path);
	}

	delete(k: K): Promise<void> {
		return _delete(this._keyGen(k));
	}

	has(k: K): Promise<boolean> {
		return has(this._keyGen(k));
	}
}

export function wrapDomain<K, T>(keyGenerator: (k: K) => string, defaultValue: T): DomainWrapper<K, T> {
	return new DomainWrapper(keyGenerator, defaultValue);
}
