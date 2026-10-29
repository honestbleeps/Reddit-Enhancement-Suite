/* @flow */

/* eslint-disable ava/use-test */
import anyTest from 'ava';
import type { TestInterface } from 'ava';
/* eslint-enable ava/use-test */

import { serialize, deserialize } from '../serialization.js';

const test: TestInterface<{ _realConsoleWarn: any, ... }> = (anyTest as any);

test.before(t => {
	t.context._realConsoleWarn = console.warn;
	// $FlowFixMe[cannot-write]
	console.warn = () => {};
});

test.after(t => {
	// $FlowFixMe[cannot-write]
	console.warn = t.context._realConsoleWarn;
});

test('throws on invalid json', t => {
	t.throws(() => deserialize('{ foo: 1 }'));
});

test('deserialize schema version 0', t => {
	const blob = `
		{
			"foo": "bar",
			"bar": "321",
			"baz": "[1, 2, 3]"
		}
	`;
	const expected = {
		foo: 'bar',
		bar: 321,
		baz: [1, 2, 3],
	};
	t.deepEqual(deserialize(blob), expected);
});

test('deserialize schema version 1', t => {
	const blob = `
		{
			"SCHEMA_VERSION": 1,
			"foo": "bar",
			"bar": "321",
			"baz": [1, 2, 3]
		}
	`;
	const expected = {
		foo: 'bar',
		bar: '321',
		baz: [1, 2, 3],
	};
	t.deepEqual(deserialize(blob), expected);
});

test('deserialize schema version 2', t => {
	const blob = `
		{
			"SCHEMA_VERSION": 2,
			"data": {
				"foo": "bar",
				"bar": "321",
				"baz": [1, 2, 3]
			}
		}
	`;
	const expected = {
		foo: 'bar',
		bar: '321',
		baz: [1, 2, 3],
	};
	t.deepEqual(deserialize(blob), expected);
});

test('serialize current schema version', t => {
	const data = {
		foo: 'bar',
		bar: '321',
		baz: [1, 2, 3],
	};
	const expected = JSON.stringify({
		// NOTE: when updating this test for a new schema version
		// also add a test for deserializing from that version
		// (like the "deserialize schema version 2" above)
		SCHEMA_VERSION: 2,
		data: {
			foo: 'bar',
			bar: '321',
			baz: [1, 2, 3],
		},
	});
	t.is(serialize(data), expected);
});

test('roundtrip current schema version', t => {
	const data = {
		a: 1,
		b: [1, 2, 3],
		c: 'hi',
		d: '5',
		e: '[1, 2, 3]',
		f: { foo: 'bar' },
	};
	const clonedData = structuredClone(data);
	t.deepEqual(deserialize(serialize(clonedData)), data);
});

test('includes Account Switcher settings by default and when exclusion is disabled', t => {
	const data = {
		'RESoptions.accountSwitcher': {
			accounts: { value: [['example', 'saved-password', true]] },
		},
	};
	t.deepEqual(deserialize(serialize(data)), data);
	t.deepEqual(deserialize(serialize(data, false)), data);
});

test('excludes Account Switcher settings without changing local storage or other settings', t => {
	const data = {
		'RESoptions.accountSwitcher': {
			accounts: { value: [['example', 'saved-password', true]] },
			keepLoggedIn: { value: true },
		},
		'RESoptions.backupAndRestore': {
			excludeAccountSwitcher: { value: true },
		},
		'backup.lastModified.file': 123,
	};
	const original = structuredClone(data);
	const serialized = serialize(data, true);
	const restored = deserialize(serialized);
	t.deepEqual(restored, {
		'RESoptions.backupAndRestore': data['RESoptions.backupAndRestore'],
		'backup.lastModified.file': 123,
	});
	t.false(serialized.includes('example'));
	t.false(serialized.includes('saved-password'));
	t.deepEqual(data, original);
	t.deepEqual({ ...data, ...restored }['RESoptions.accountSwitcher'], data['RESoptions.accountSwitcher']);
});

test('exclusion supports storage without Account Switcher settings', t => {
	const data = { foo: 'bar' };
	t.deepEqual(deserialize(serialize(data, true)), data);
});
