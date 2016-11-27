/* @flow */

import test from 'ava';

import {
	extendDeep,
	mapValueToObject,
 } from '../object';

test('extendDeep', t => {
	const e = extendDeep;
	t.deepEqual(e({}, { foo: 1 }), { foo: 1 });
	t.deepEqual(e({ foo: { bar: 2 } }, { foo: { baz: 3 } }), { foo: { bar: 2, baz: 3 } });
	t.deepEqual(e({ foo: { bar: 2 } }, { foo: [1, 2, 3] }), { foo: [1, 2, 3] }, 'do not merge objects with arrays');
	t.deepEqual(e({ foo: [2, 3, 4] }, { foo: [1] }), { foo: [1] }, 'do not merge arrays');
	t.deepEqual(e({ foo: { bar: 1 }, baz: 3 }, { foo: null }), { foo: null, baz: 3 }, 'handles replacing with null');
	t.deepEqual(e({ foo: null, baz: 3 }, { foo: { bar: 1 } }), { foo: { bar: 1 }, baz: 3 }, 'handles replacing null');
	t.deepEqual(e({ foo: { bar: 1 }, baz: 3 }, { foo: undefined }), { foo: undefined, baz: 3 }, 'handles replacing with undefined');
	t.deepEqual(e({ foo: undefined, baz: 3 }, { foo: { bar: 1 } }), { foo: { bar: 1 }, baz: 3 }, 'handles replacing undefined');
});

test('mapValueToObject get', t => {
	const fields = [{ name: 'aaa' }, { name: 'b b' }, { name: 'c_c' }, { name: 'D d' }];
	const value = [0, 1, 2];
	const obj = mapValueToObject({ fields }, value);
	t.is(obj.aaa, 0);
	t.is(obj['b b'], 1);
	t.is(obj.c_c, 2);
	t.is(obj['D d'], undefined);
});

test('mapValueToObject set', t => {
	const fields = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
	const value = [0, 0, 0];
	const obj = mapValueToObject({ fields }, value);
	obj.a = 1;
	obj.b = 2;
	t.is(obj.a, 1);
	t.is(obj.b, 2);
	t.is(obj.c, 0);
	t.deepEqual(value, [1, 2, 0]);
});
