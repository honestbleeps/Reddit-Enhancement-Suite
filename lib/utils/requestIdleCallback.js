/* @flow */
type IdleDeadline = {|
	didTimeout: boolean,
	timeRemaining: () => number,
|};

type IdleCallback = (deadline: IdleDeadline) => mixed;
type IdleOptions = {|
	timeout?: number,
|};

function createIdleDeadline(startTime: number): IdleDeadline {
	return {
		didTimeout: false,
		timeRemaining: () => Math.max(0, 50 - (Date.now() - startTime)),
	};
}

export function installRequestIdleCallback(target?: any) {
	const runtimeTarget = target || (typeof window === 'object' ? window : {});

	if (typeof runtimeTarget.requestIdleCallback !== 'function') {
		runtimeTarget.requestIdleCallback = (callback: IdleCallback, options?: IdleOptions) => {
			const startTime = Date.now();
			const timeout = options && typeof options.timeout === 'number' ? options.timeout : 1;
			return runtimeTarget.setTimeout(() => callback(createIdleDeadline(startTime)), timeout);
		};
	}

	if (typeof runtimeTarget.cancelIdleCallback !== 'function') {
		runtimeTarget.cancelIdleCallback = handle => {
			runtimeTarget.clearTimeout(handle);
		};
	}

	return runtimeTarget.requestIdleCallback;
}
