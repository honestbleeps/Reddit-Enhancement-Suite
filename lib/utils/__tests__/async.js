/* @flow */

import test from 'ava';

import {
	asyncFlow,
	batch,
	fastAsync,
	keyedMutex,
	mutex,
	reifyPromise,
	waitFor,
} from '../async';

function sleep(ms) {
	return new Promise(r => setTimeout(r, ms));
}

test('waitFor - basic', async t => {
	const unique = {};
	t.is(await waitFor(() => unique), unique);
});

test('waitFor - repeats', async t => {
	t.plan(3);

	let i = 3;
	await waitFor(() => {
		t.pass();
		return --i ? null : {};
	});
});

test('waitFor - fast path', async t => {
	t.plan(1);
	let pass = true;
	sleep(5).then(() => {
		pass = false;
	});
	// should not repeat
	await waitFor(() => true, 100).then(() => {
		t.is(pass, true);
	});
});

test('batch - basic', async t => {
	const process = batch(xs => Promise.resolve(xs.map(x => 2 ** x)), { delay: 1 });
	t.deepEqual(await Promise.all([process(1), process(2), process(3)]), [2, 4, 8]);
});

test('batch - erroring all', async t => {
	const process = batch(() => Promise.reject(new Error('foo')), { delay: 1 });
	const a = process(1);
	const b = process(2);
	const c = process(3);
	const errA = await t.throws(a, /foo/);
	const errB = await t.throws(b, /foo/);
	const errC = await t.throws(c, /foo/);
	t.is(errA, errB, 'rejected with the same error');
	t.is(errB, errC, 'rejected with the same error');
});

test('batch - erroring one', async t => {
	const process = batch(xs => Promise.resolve(xs), { delay: 1 });
	t.is(await process(1), 1);
	await t.throws(process(new Error('foo')), /foo/);
});

test('batch - fast path', async t => {
	t.plan(1);
	let pass = true;
	sleep(1).then(() => {
		pass = false;
	});
	const process = batch(() => {
		t.is(pass, true);
	}, { size: 2, delay: 100 });
	process(1);
	await process(2);
});

test('fastAsync - sync', t => {
	t.is(fastAsync(function*(a, b, c) {
		return (yield a) + (yield b) + (yield c);
	})(1, 2, 3), 6);
});

test('fastAsync - async', async t => {
	t.is(await fastAsync(function*(a, b, c) {
		return (yield a) + (yield b) + (yield c);
	})(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)), 6);
});

test('fastAsync - mixed (a)sync', async t => {
	t.plan(3);
	const resolved = Promise.resolve();
	await resolved;

	await fastAsync(function*() {
		t.is(yield Promise.resolve(1), 1);

		let pass = true;
		resolved.then(() => {
			pass = false;
		});

		t.is((yield 1) + (yield 2), 3);

		t.is(pass, true, 'yielding non-promises is synchronous');
	})();
});

test('fastAsync - sync throw', t => {
	t.throws(fastAsync(function*() {
		yield 1;
		throw new Error('foo');
	}), /foo/);
});

test('fastAsync - async throw', async t => {
	await t.throws(fastAsync(function*() {
		yield Promise.resolve();
		throw new Error('foo');
	})(), /foo/);
});

test('fastAsync - sync rejection', async t => {
	await t.throws(fastAsync(function*() {
		yield Promise.reject(new Error('foo'));
	})(), /foo/);
});

test('fastAsync - async rejection', async t => {
	await t.throws(fastAsync(function*() {
		yield Promise.resolve();
		yield Promise.reject(new Error('foo'));
	})(), /foo/);
});

test('fastAsync - handle rejection', async t => {
	t.plan(1);
	await fastAsync(function*() {
		try {
			yield Promise.reject(new Error('foo'));
		} catch (e) {
			t.is(e.message, 'foo');
		}
	})();
});

test('fastAsync - preserves reciever', t => {
	t.plan(2);
	const obj = {
		t: fastAsync(function*() {
			t.is(this, obj);
			yield 1;
			t.is(this, obj);
		}),
	};
	obj.t();
});

test('asyncFlow - all sync', t => {
	t.is(asyncFlow(
		x => x + 3,
		y => y + 5
	)(1), 9);
});

test('asyncFlow - all async', async t => {
	t.plan(4);
	t.is(await asyncFlow(
		async x => { // eslint-disable-line require-await
			t.is(x, 1);
			return x + 3;
		},
		y => {
			t.is(y, 4);
			return Promise.resolve(y + 5);
		},
		z => {
			t.is(z, 9);
			return Promise.resolve(z + 4);
		}
	)(1), 13);
});

test('asyncFlow - sync throw', t => {
	t.throws(asyncFlow(
		() => 5,
		() => { throw new Error('foo'); },
		() => t.fail(),
	), /foo/);
});

test('asyncFlow - async throw', async t => {
	await t.throws(asyncFlow(
		() => Promise.resolve(5),
		() => { throw new Error('foo'); },
		() => t.fail(),
	)(), /foo/);
});

test('asyncFlow - reject', async t => {
	await t.throws(asyncFlow(
		() => Promise.resolve(),
		() => Promise.reject(new Error('foo')),
		() => t.fail(),
	)(), /foo/);
});

test('reifyPromise', async t => {
	const x = reifyPromise(Promise.resolve(1));
	t.true(x.get() instanceof Promise);
	await sleep(1);
	t.is(x.get(), 1);
});

test('keyedMutex', async t => {
	const progress = [];
	const fn = keyedMutex(async (key, x) => {
		progress.push(x);
		await sleep(1);
		progress.push(x + 1);
	});
	fn('abc', 1);
	await fn('abc', 10);
	t.deepEqual(progress, [1, 2, 10, 11]);

	t.is(keyedMutex(() => {})(), undefined, 'tolerates returning undefined');
});

test('keyedMutex - multiple keys', async t => {
	const progress = [];
	const fn = keyedMutex(async (key, x) => {
		progress.push(key);
		await Promise.resolve();
		progress.push(x);
	});
	fn(1, 2);
	await fn(10, 11);
	t.deepEqual(progress, [1, 10, 2, 11]);
});

test('mutex', async t => {
	const progress = [];
	const fn = mutex(async x => {
		progress.push(x);
		await sleep(1);
		progress.push(x + 1);
	});
	fn(1);
	await fn(10);
	t.deepEqual(progress, [1, 2, 10, 11]);

	t.is(mutex(() => {})(), undefined, 'tolerates returning undefined');
});
