/* @flow */

import test from 'ava';

import { installRequestIdleCallback } from '../requestIdleCallback.js';

test('installRequestIdleCallback adds missing callbacks', t => {
	let cleared;
	const target = {
		setTimeout(callback) {
			callback();
			return 42;
		},
		clearTimeout(handle) {
			cleared = handle;
		},
	};

	installRequestIdleCallback(target);

	let remaining = -1;
	const handle = target.requestIdleCallback(deadline => {
		t.false(deadline.didTimeout);
		remaining = deadline.timeRemaining();
	});

	target.cancelIdleCallback(handle);

	t.is(handle, 42);
	t.is(cleared, 42);
	t.true(remaining >= 0);
});
