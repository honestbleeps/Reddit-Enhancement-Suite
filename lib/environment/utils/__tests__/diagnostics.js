/* @flow */

import test from 'ava';

import {
	appendDiagnosticEntry,
	clearDiagnosticEntries,
	DIAGNOSTICS_LIMIT,
} from '../diagnostics.js';

test('appendDiagnosticEntry keeps the newest entries within the limit', t => {
	let entries = clearDiagnosticEntries();

	for (const i of Array.from({ length: DIAGNOSTICS_LIMIT + 2 }, (_, index) => index)) {
		entries = appendDiagnosticEntry(entries, {
			level: 'error',
			message: `message-${i}`,
			source: 'options',
			stack: '',
			stage: 'startup',
			timestamp: i,
		});
	}

	t.is(entries.length, DIAGNOSTICS_LIMIT);
	t.is(entries[0].message, 'message-2');
	t.is(entries[entries.length - 1].message, `message-${DIAGNOSTICS_LIMIT + 1}`);
});

test('clearDiagnosticEntries returns an empty diagnostics buffer', t => {
	t.deepEqual(clearDiagnosticEntries(), []);
});
