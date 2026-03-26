/* @flow */

import test from 'ava';

import { callActionMethod, handleToolbarClick } from '../action.js';

test('callActionMethod returns false when the action method is unavailable', t => {
	t.false(callActionMethod({}, 'disable', 1));
});

test('callActionMethod invokes available action methods', t => {
	let invoked = false;

	t.true(callActionMethod({
		enable(tabId) {
			invoked = tabId === 3;
		},
	}, 'enable', 3));
	t.true(invoked);
});

test('handleToolbarClick retries after bootstrapping when the initial click delivery fails', async t => {
	const stages = [];
	let attempts = 0;
	let bootstraps = 0;

	await handleToolbarClick(5, {
		reportError: stage => {
			stages.push(stage);
		},
		sendClickMessage: () => {
			attempts += 1;
			return attempts === 1 ? Promise.reject(new Error('No receiver')) : Promise.resolve();
		},
		bootstrapActionClick: () => Promise.resolve().then(() => {
			bootstraps += 1;
		}),
		supportsActionClickBootstrap: true,
	});

	t.deepEqual(stages, ['toolbar-click']);
	t.is(attempts, 2);
	t.is(bootstraps, 1);
});

test('handleToolbarClick reports missing tab ids without bootstrapping', async t => {
	const stages = [];
	let attempts = 0;
	let bootstraps = 0;

	await handleToolbarClick(null, {
		reportError: stage => {
			stages.push(stage);
		},
		sendClickMessage: () => Promise.resolve().then(() => {
			attempts += 1;
		}),
		bootstrapActionClick: () => Promise.resolve().then(() => {
			bootstraps += 1;
		}),
		supportsActionClickBootstrap: true,
	});

	t.deepEqual(stages, ['toolbar-click:no-tab']);
	t.is(attempts, 0);
	t.is(bootstraps, 0);
});
