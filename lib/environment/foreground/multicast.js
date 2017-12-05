/* @flow */

import { addListener, sendMessage } from './messaging';

const callbacks = new Map();

addListener('multicast', ({ name, args }) => {
	const callback = callbacks.get(name);
	if (!callback) {
		throw new Error(`Multicast handler "${name}" not found.`);
	}
	return callback(...args);
});

/*
 * Creates a wrapper function that will invoke `callback` in all other tabs.
 */
export function multicast<T:(...args: any) => void>(callback: T, { name, local = true, crossContext = true }: {| name: string, local?: boolean, crossContext?: boolean |}): T {
	if (callbacks.has(name)) {
		throw new Error(`Multicast handler with name "${name}" exists.`);
	}

	callbacks.set(name, callback);

	function localOnly(...args) {
		callback(...args);
	}

	const invoke: any = (...args) => {
		sendMessage('multicast', { name, args, crossContext });

		if (local) {
			localOnly(...args);
		}
	};

	invoke.local = localOnly;

	return invoke;
}
