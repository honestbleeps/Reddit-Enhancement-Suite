/* @flow */

import test from 'ava';
import _ from 'lodash';

import { serialize, deserialize } from '../serialization';

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

test('roundtrip current schema version', t => {
	const data = {
		a: 1,
		b: [1, 2, 3],
		c: 'hi',
		d: '5',
		e: '[1, 2, 3]',
		f: { foo: 'bar' },
	};
	const clonedData = _.cloneDeep(data);
	t.deepEqual(deserialize(serialize(clonedData)), data);
});
