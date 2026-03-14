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

test('handleToolbarClick records bootstrap failures and opens diagnostics', async t => {
	const stages = [];
	let diagnosticsOpened = false;

	await handleToolbarClick(5, {
		openDiagnosticsPage: () => Promise.resolve().then(() => {
			diagnosticsOpened = true;
		}),
		reportError: stage => {
			stages.push(stage);
		},
		sendClickMessage: () => Promise.reject(new Error('No receiver')),
		bootstrapActionClick: () => Promise.reject(new Error('Bootstrap failed')),
		supportsActionClickBootstrap: true,
	});

	t.deepEqual(stages, ['toolbar-click', 'toolbar-bootstrap']);
	t.true(diagnosticsOpened);
});

test('handleToolbarClick opens diagnostics when Safari does not provide a tab id', async t => {
	const stages = [];
	let diagnosticsOpened = false;

	await handleToolbarClick(null, {
		openDiagnosticsPage: () => Promise.resolve().then(() => {
			diagnosticsOpened = true;
		}),
		reportError: stage => {
			stages.push(stage);
		},
		sendClickMessage: () => Promise.resolve(),
		bootstrapActionClick: () => Promise.resolve(),
		supportsActionClickBootstrap: true,
	});

	t.deepEqual(stages, ['toolbar-click:no-tab']);
	t.true(diagnosticsOpened);
});
