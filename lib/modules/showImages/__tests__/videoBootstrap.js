/* @flow */

import test from 'ava';
import {
	createVideoBootstrapPromise,
	EXPANDO_INIT_TIMEOUT_MS,
	getVideoTransport,
	shouldTreatStalledVideoAsFailure,
	VIDEO_MIN_READY_STATE,
	withBootstrapTimeout,
} from '../videoBootstrap.js';

test('getVideoTransport detects mp4, hls, dash, and unknown source strategies', t => {
	t.is(getVideoTransport([{ type: 'video/mp4' }]), 'mp4');
	t.is(getVideoTransport([{ type: 'application/vnd.apple.mpegurl' }]), 'hls');
	t.is(getVideoTransport([{ type: 'application/dash+xml' }]), 'dash');
	t.is(getVideoTransport([]), 'unknown');
});

test('shouldTreatStalledVideoAsFailure only flags unrecovered initial stalls', t => {
	t.true(shouldTreatStalledVideoAsFailure({
		currentTime: 0,
		paused: true,
		readyState: VIDEO_MIN_READY_STATE - 1,
	}));
	t.false(shouldTreatStalledVideoAsFailure({
		currentTime: 1,
		paused: false,
		readyState: VIDEO_MIN_READY_STATE - 1,
	}));
	t.false(shouldTreatStalledVideoAsFailure({
		currentTime: 0,
		paused: true,
		readyState: VIDEO_MIN_READY_STATE,
	}));
	t.false(shouldTreatStalledVideoAsFailure({
		currentTime: 0,
		ended: true,
		paused: true,
		readyState: VIDEO_MIN_READY_STATE - 1,
	}));
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

test('withBootstrapTimeout resolves when the wrapped promise settles before timeout', async t => {
	await t.notThrowsAsync(withBootstrapTimeout(Promise.resolve('ok')));
});

test('withBootstrapTimeout preserves wrapped rejections', async t => {
	await t.throwsAsync(withBootstrapTimeout(Promise.reject(new Error('broken'))), { message: 'broken' });
});

test('withBootstrapTimeout rejects when the wrapped promise does not settle in time', async t => {
	await t.throwsAsync(withBootstrapTimeout(new Promise(() => {}), {
		timeoutMs: EXPANDO_INIT_TIMEOUT_MS,
		setTimeoutFn(callback) {
			callback();
			return null;
		},
		clearTimeoutFn() {},
	}), { message: 'Expando initialization did not finish before the bootstrap timeout.' });
});
