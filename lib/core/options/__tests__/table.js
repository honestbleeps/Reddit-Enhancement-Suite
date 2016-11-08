import test from 'ava';

import {
	mapValueToObject,
} from '../table';

test('mapValueToObject get', t => {
	const fields = [{ name: 'aaa' }, { name: 'b b' }, { name: 'c_c' }, { name: 'D d' }];
	const value = [0, 1, 2];
	const obj = mapValueToObject({ fields }, value);
	t.deepEqual(obj, { aaa: 0, 'b b': 1, c_c: 2, 'D d': undefined });
});

test('mapValueToObject set', t => {
	const fields = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
	const value = [0, 0, 0];
	const obj = mapValueToObject({ fields }, value);
	obj.a = 1;
	obj.b = 2;
	t.deepEqual(obj, { a: 1, b: 2, c: 0 });
});
