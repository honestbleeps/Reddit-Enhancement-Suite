import test from 'ava';

import { interpolate, deinterpolate, projectInto } from '../math';

test('interpolate', t => {
	const i = interpolate;

	t.is(i(0, 0, 0), 0);
	t.is(i(0, 0, 1), 0);
	t.is(i(0, 10, 0), 0);
	t.is(i(0, 10, 1), 10);
	t.is(i(0, 10, 0.5), 5);
	t.is(i(10, 20, 0.75), 17.5);
});

test('deinterpolate', t => {
	const d = deinterpolate;

	t.is(d(0, 1, 0), 0);
	t.is(d(0, 1, 0.5), 0.5);
	t.is(d(0, 1, 1), 1);
	t.is(d(0, 10, 5), 0.5);
	t.is(d(0, 10, 10), 1);
	t.is(d(10, 20, 17.5), 0.75);
	t.is(d(10, Infinity, 100), 0);
	t.is(d(-Infinity, 10, -1), 1);
	t.is(d(-Infinity, Infinity, 50), 0.5);
});

test('projectInto', t => {
	const p = projectInto;

	t.is(p(0, 1, 2, 5, 1), 5);
	t.is(p(0, 1, 3, 7, 0), 3);
	t.is(p(10, 20, 0, 10, 17.5), 7.5);
	t.is(p(20, Infinity, 0, 255, 50), 0);
	t.is(p(-Infinity, -20, 0, 255, -50), 255);
	t.is(p(-Infinity, Infinity, 0, 254, 42), 127);
});
