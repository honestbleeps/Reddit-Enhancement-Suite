/* @flow */

import test from 'ava';
import {
	createVideoBootstrapPromise,
	getVideoTransport,
} from '../videoBootstrap.js';

test('getVideoTransport detects mp4, hls, dash, and unknown source strategies', t => {
	t.is(getVideoTransport([{ type: 'video/mp4' }]), 'mp4');
	t.is(getVideoTransport([{ type: 'application/vnd.apple.mpegurl' }]), 'hls');
	t.is(getVideoTransport([{ type: 'application/dash+xml' }]), 'dash');
	t.is(getVideoTransport([]), 'unknown');
});

test('createVideoBootstrapPromise resolves when playable media arrives before failure or timeout', async t => {
	await t.notThrowsAsync(createVideoBootstrapPromise({
		waitForPlayable: Promise.resolve(),
		waitForFailure: new Promise(() => {}),
	}));
});

test('createVideoBootstrapPromise rejects when media bootstrap fails', async t => {
	await t.throwsAsync(createVideoBootstrapPromise({
		waitForPlayable: new Promise(() => {}),
		waitForFailure: Promise.reject(new Error('Loading stalled')),
	}), { message: 'Loading stalled' });
});

test('createVideoBootstrapPromise rejects when media bootstrap times out', async t => {
	await t.throwsAsync(createVideoBootstrapPromise({
		waitForPlayable: new Promise(() => {}),
		waitForFailure: new Promise(() => {}),
		setTimeoutFn(callback) {
			callback();
			return null;
		},
		clearTimeoutFn() {},
	}), { message: 'Video did not become playable before the bootstrap timeout.' });
});
