/* @flow */
/* global globalThis */

type IdleDeadline = {|
	didTimeout: boolean,
	timeRemaining: () => number,
|};

function createIdleDeadline(startTime: number): IdleDeadline {
	return {
		didTimeout: false,
		timeRemaining: () => Math.max(0, 50 - (Date.now() - startTime)),
	};
}

export function installRequestIdleCallback(target: any = (globalThis: any)) {
	if (typeof target.requestIdleCallback !== 'function') {
		target.requestIdleCallback = (callback, options) => {
			const startTime = Date.now();
			const timeout = options && typeof options.timeout === 'number' ? options.timeout : 1;
			return target.setTimeout(() => callback(createIdleDeadline(startTime)), timeout);
		};
	}

	if (typeof target.cancelIdleCallback !== 'function') {
		target.cancelIdleCallback = handle => {
			target.clearTimeout(handle);
		};
	}

	return target.requestIdleCallback;
}
