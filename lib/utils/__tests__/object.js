/* @flow */

import test from 'ava';

import {
	extendDeep,
} from '../object.js';

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

test('extendDeep does not pollute prototypes', t => {
	const e = extendDeep;
	const target = {};
	e(target, JSON.parse('{"__proto__": {"polluted": true}, "constructor": {"prototype": {"polluted": true}}, "foo": 1}'));
	t.is(({} as any).polluted, undefined);
	t.is((target as any).polluted, undefined);
	t.is(Object.getPrototypeOf(target), Object.prototype);
	t.deepEqual(target, { foo: 1 });
});
