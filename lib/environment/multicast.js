import { addListener, sendMessage } from 'browserEnvironment';
import { cloneDeep } from 'lodash/fp';

const callbacks = new Map();

addListener('multicast', ({ name, args }) => {
	if (!callbacks.has(name)) {
		throw new Error(`Multicast handler "${name}" not found.`);
	}

	return callbacks.get(name)(...args);
});

/**
 * @typedef {boolean|number|string|null|Array.<Serializable>|Object.<string, Serializable>} Serializable
 */

/**
 * Creates a wrapper function that will invoke `callback` in all other tabs.
 * @param {function(...Serializable): void} callback
 * @param {string} name A unique name to identify the callback.
 * @param {boolean} [local=true] Whether `callback` should also be invoked in the current tab.
 * @returns {function(...Serializable): void}
 */
export function multicast(callback, { name, local = true } = {}) {
	if (!name) {
		throw new Error(`Expected a multicast handler name, found ${name}.`);
	}

	if (callbacks.has(name)) {
		throw new Error(`Multicast handler with name "${name}" exists.`);
	}

	callbacks.set(name, callback);

	function localOnly(...args) {
		callback(...cloneDeep(args));
	}

	function invoke(...args) {
		sendMessage('multicast', { name, args });

		if (local) {
			localOnly(...args);
		}
	}

	invoke.local = localOnly;

	return invoke;
}
