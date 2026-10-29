/* @flow */

import { pull, debounce, once, curryRight, remove } from 'lodash-es';
import { zip } from './generator.js';

type MaybeAsyncFunction<V> = (...args: any) => Promise<V> | V;

type ForEachChunked = {
	<T>(callback: (x: T) => void): (collection: Iterable<T>) => Promise<void>,
	<T>(collection: Iterable<T>, callback: (x: T) => void): Promise<void>,
};

type ChunkedQueue = {
	generator: Iterator<any>,
	callback: (x: any) => void,
	resolve: () => void,
	reject: (e: unknown) => void,
};

export function waitFor<T>(callback: () => ?T, interval?: number = 1): Promise<T> {
	return new Promise(resolve => {
		(function repeat() {
			let val;
			// The callback might throw an error
			// wrapped in try...catch so that we can retry later
			try {
				val = callback();
			} catch (e) {
				console.warn(val);
			}
			if (!val) {
				setTimeout(repeat, interval);
				return;
			}
			resolve(val);
		})();
	});
}

/*
 Iterate through an array in chunks, executing a callback on each element.
 Each chunk is handled asynchronously from the others with a delay betwen each batch.
 This will change the timeout dynamically based on current screen performance in an effort
 to work as fast as possibly without blocking the screen.
 */

export const forEachChunked: ForEachChunked = (() => {
	const framerate = 30;
	const frameTime = 1000 / framerate;

	const queues: Array<ChunkedQueue> = [];

	const run: (...args: any) => Promise<void> = frameThrottle(() => {
		const start = performance.now();
		do {
			remove(queues, ({ generator, callback, resolve, reject }): boolean | void => {
				const { value, done } = generator.next();

				if (done) {
					resolve();
					return true;
				}

				try {
					callback(value);
				} catch (e) {
					if (generator.return) generator.return();
					reject(e);
					return true;
				}
			});
			// stop if there are no queues left
			if (!queues.length) {
				return;
			}
		} while (performance.now() - start < frameTime);
		run();
	});

	return curryRight(<T>(collection: Iterable<T>, callback: (x: T) => void): Promise<void> =>
		new Promise((resolve, reject) => {
			const iterable = (Symbol.iterator in collection) ? collection : Array.from(collection); // eslint-disable-line no-restricted-syntax
			queues.push({ generator: iterable[Symbol.iterator](), callback, resolve, reject });
			run();
		}),
	);
})();

/*
 * Will accumulate values until `size` elements are accumulated or `delay` milliseconds pass.
 * `callback` accepts an array of batched values and should return an array of results **in the same order**.
 * If it throws, all promises will be rejected with the same error.
 * If one of the results is an instance of `Error`, the corresponding promise will be rejected with that error.
 */
export function batch<T, V>(callback: (xs: T[]) => Promise<Iterable<Error | Promise<V> | V> | void> | void, { size = 100, delay = 50, flushBeforeUnload = false }: { size?: number, delay?: number, flushBeforeUnload?: boolean } = {}): (x: T) => Promise<V> {
	let invoke;

	function* batchAccumulator(): Generator<Promise<V>, void, T | void> {
		const entries: T[] = [];
		const promises: Array<{ resolve: (x: Promise<V> | V) => void, reject: (e: unknown) => void }> = [];

		function addPromise(): Promise<V> {
			if (entries.length) {
				return new Promise((resolve, reject) => { promises.push({ resolve, reject }); });
			} else {
				return (undefined as any); // dummy - never observed
			}
		}

		invoke = once(async () => {
			startNewBatch();
			if (!entries.length) return;
			try {
				const results = await callback(entries) || [];
				for (const [{ resolve, reject }, result] of zip(promises, results)) {
					if (result instanceof Error) reject(result);
					else resolve(result);
				}
			} catch (e) {
				for (const { reject } of promises) {
					reject(e);
				}
			}
		});

		const timeout = delay ? debounce(invoke, delay) : throttle(invoke);

		while (entries.length < size) {
			const entry = yield addPromise();
			if (entry === undefined) throw new Error('undefined passed into batch generator');
			entries.push(entry);
			timeout();
		}

		const lastPromise = addPromise();
		invoke();
		yield lastPromise;
	}

	let currentBatch: Generator<Promise<V>, void, T | void>;

	function startNewBatch() {
		currentBatch = batchAccumulator();
		currentBatch.next(); // prime the generator, so the first `.next(value)` isn't lost
	}

	startNewBatch();

	if (flushBeforeUnload) window.addEventListener('beforeunload', () => { invoke(); }, true);

	return entry => {
		const { value } = currentBatch.next(entry);
		if (value === undefined) throw new Error('Batch generator was not replaced after completion');
		return value;
	};
}

function always<T>(promise: Promise<T>, callback: (x: T) => Promise<void> | void): Promise<void> {
	return promise.then(callback, callback);
}

// Like _asyncToGenerator, but calls back into the generator synchronously if the value is not a promise
// unless you're certain that you need to avoid asynchronicity at all costs, just use an async function
export function fastAsync<A, B, C, D, E, F, G, R>(
	callback: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Generator<any, R, any>,
): (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R | Promise<R> {
	return function(this: unknown, ...args: Array<any>) {
		return (function next(generator: Generator<any, R, any>, arg: any, throwing: boolean): R | Promise<R> {
			const { value, done } = !throwing ? generator.next(arg) : generator.throw(arg);

			if (done) {
				// $FlowFixMe[incompatible-type] the lib types the return value of a done IteratorResult as optional
				return value;
			} else if (!(value instanceof Promise)) {
				return next(generator, value, false);
			} else {
				return value.then(
					val => next(generator, val, false),
					err => next(generator, err, true),
				);
			}
		})(Reflect.apply(callback, this, args), undefined, false);
	};
}

/* eslint-disable no-redeclare, no-unused-vars */
declare function asyncFlow<A1, A2, A3, A4, RA, RB, F1 extends (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<RA> | RB>
	(f1: F1): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<RA> | Promise<RB> | RB;
declare function asyncFlow<A1, A2, A3, A4, B, RA, RB, F1 extends (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2 extends (b: B) => Promise<RA> | RB>
	(f1: F1, f2: F2): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<RA> | Promise<RB> | RB;
declare function asyncFlow<A1, A2, A3, A4, B, C, RA, RB, F1 extends (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2 extends (b: B) => Promise<C> | C, F3 extends (c: C) => Promise<RA> | RB>
	(f1: F1, f2: F2, f3: F3): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<RA> | Promise<RB> | RB;
declare function asyncFlow<A1, A2, A3, A4, B, C, D, RA, RB, F1 extends (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2 extends (b: B) => Promise<C> | C, F3 extends (c: C) => Promise<D> | D, F4 extends (d: D) => Promise<RA> | RB>
	(f1: F1, f2: F2, f3: F3, f4: F4): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<RA> | Promise<RB> | RB;
declare function asyncFlow<A1, A2, A3, A4, B, C, D, E, RA, RB, F1 extends (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2 extends (b: B) => Promise<C> | C, F3 extends (c: C) => Promise<D> | D, F4 extends (d: D) => Promise<E> | E, F5 extends (e: E) => Promise<RA> | RB>
	(f1: F1, f2: F2, f3: F3, f4: F4, f5: F5): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<RA> | Promise<RB> | RB;
declare function asyncFlow<A1, A2, A3, A4, B, C, D, E, F, RA, RB, F1 extends (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2 extends (b: B) => Promise<C> | C, F3 extends (c: C) => Promise<D> | D, F4 extends (d: D) => Promise<E> | E, F5 extends (e: E) => Promise<F> | F, F6 extends (f: F) => Promise<RA> | RB>
	(f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<RA> | Promise<RB> | RB;

export function asyncFlow(firstFn: (...args: Array<any>) => any, ...fns: Array<(x: any) => any>): (...args: Array<any>) => any {
	return fastAsync(function*(...args: Array<any>): Generator<any, any, any> {
		let accum = firstFn(...args);
		for (const fn of fns) {
			accum = fn(yield accum);
		}
		return accum;
	});
}

// once the promise has resolved, its value is available synchronously
// intended for use with fastAsync
export function reifyPromise<T>(promise: Promise<T>): { get(): T | Promise<T>, ... } {
	let val: T | Promise<T> = promise;
	promise.then(x => { val = x; });
	return { get: () => val };
}

export function keyedMutex<V, T extends MaybeAsyncFunction<V>>(
	callback: T,
	keyResolver?: (...args: any) => unknown = x => x,
): T {
	const queues: Map<unknown, Promise<any>> = new Map();

	return (function(this: unknown, ...args: Array<any>) {
		const key = keyResolver(...args);

		// https://github.com/facebook/flow/issues/34
		const tail = queues.has(key) ?
			always(queues.get(key) /*:: || Promise.resolve() */, () => Reflect.apply(callback, this, args)) :
			Reflect.apply(callback, this, args);

		if (tail instanceof Promise) {
			queues.set(key, tail);

			always(tail, () => {
				if (queues.get(key) === tail) queues.delete(key);
			});
		}

		return tail;
	} as any);
}

export function mutex<V, T extends MaybeAsyncFunction<V>>(callback: T): T {
	let queue: ?Promise<any>;

	return (function(this: unknown, ...args: Array<any>) {
		const tail = queue ?
			always(queue, () => Reflect.apply(callback, this, args)) :
			Reflect.apply(callback, this, args);

		if (tail instanceof Promise) {
			queue = tail;

			always(tail, () => {
				if (queue === tail) queue = undefined;
			});
		}

		return tail;
	} as any);
}

// `callback` is invoked when the micro task queue is emptied
// returns a promise that resolves when callback resolves
export function throttle(callback: () => void | Promise<void>): () => Promise<void> {
	let promise: ?Promise<any>;

	return () => {
		promise = promise || Promise.resolve().then(() => {
			promise = null;
			callback();
		});
		return promise;
	};
}

// Invokes callback after the returned function has not been invoked for `debounce` number of frames
export function frameDebounce(callback: () => any, debounce: number = 1): () => void {
	let remaining: number;

	const update: (...args: any) => Promise<void> = frameThrottle(() => {
		if (remaining) requestAnimationFrame(() => { update(); });
		else callback();
		remaining -= 1;
	});

	return () => {
		remaining = debounce;
		requestAnimationFrame(() => { update(); });
	};
}

/**
 * Returns a wrapper function, similar to _.throttle, that will invoke `callback` at most once per frame.
 * `callback` will be invoked with the arguments provided to the most recent call of the wrapper function.
 */
export function frameThrottle<V>(callback: (...args: any) => V): (...args: any) => Promise<V> {
	let args: Array<any> = [];
	let promise: ?Promise<V>;

	return (...a) => {
		args = a;
		promise = promise || new Promise((res, rej) => {
			requestAnimationFrame(() => {
				promise = null;
				try {
					res(callback(...args));
				} catch (e) {
					rej(e);
				}
			});
		});
		return promise;
	};
}

/*
 * Similar to throttle, but callbacks are ordered:
 * When the returned wrapper function is invoked, `callback` will be placed last in the execution queue
 */
export const throttleQueuePositionReset: (callback: () => void) => (...a: Array<any>) => void = (() => {
	let queues: Array<() => void> = [];

	const run = throttle(() => {
		for (const fn of queues) {
			try {
				fn();
			} catch (e) { /* empty */ }
		}
		queues = [];
	});

	return function(callback: () => void) {
		let args: Array<any> = [];
		let queued = false;

		function runCallback() {
			queued = false;
			callback();
		}

		return (...a: Array<any>) => {
			args = a;

			if (queued) {
				pull(queues, callback);
			} else {
				queued = true;
			}

			queues.push(callback);
			run();
		};
	};
})();

/**
 * Returns a wrapper function, similar to _.throttle, that will only invoke the latest `callback` in the next upcoming idle period.
 * `callback` will be invoked with the arguments provided to the most recent call of the wrapper function.
 */
export function idleThrottle<V>(callback: (...args: any) => V): (...args: any) => Promise<V> {
	let args: Array<any> = [];
	let promise: ?Promise<V>;

	return (...a) => {
		args = a;
		promise = promise || new Promise((res, rej) => {
			requestIdleCallback(() => {
				promise = null;
				try {
					res(callback(...args));
				} catch (e) {
					rej(e);
				}
			});
		});
		return promise;
	};
}
