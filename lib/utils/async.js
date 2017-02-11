/* @flow */

import _ from 'lodash';
import { zip } from './generator';
import { now } from './time';

export function waitFor<T>(callback: () => ?T, interval?: number = 1): Promise<T> {
	return new Promise(resolve => {
		(function repeat() {
			const val = callback();
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

export const forEachChunked = (() => {
	const framerate = 15;
	const frameTime = 1000 / framerate;
	const minSlot = frameTime / 2; // In case there's much else going on, don't compromise this too much

	const queues = [];

	const run = frameThrottle((start: number) => {
		const slotEnd = Math.max(start + frameTime, now() + minSlot);
		do {
			_.remove(queues, ({ generator, callback, resolve, reject }): ?boolean => {
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
		} while (now() < slotEnd);
		run();
	});

	return _.curryRight(/*:: <T> */(collection: Iterable<T>, callback: (x: T) => void) =>
		new Promise((resolve, reject) => {
			const iterable = (Symbol.iterator in collection) ? collection : Array.from(collection);
			// $FlowIssue https://github.com/facebook/flow/issues/1163, https://github.com/facebook/flow/issues/1015
			queues.push({ generator: iterable[Symbol.iterator](), callback, resolve, reject });
			run();
		})
	);
})();

/*
 * Will accumulate values until `size` elements are accumulated or `delay` milliseconds pass.
 * `callback` accepts an array of batched values and should return an array of results **in the same order**.
 * If it throws, all promises will be rejected with the same error.
 * If one of the results is an instance of `Error`, the corresponding promise will be rejected with that error.
 */
export function batch<T, V>(callback: (xs: T[]) => Promise<Iterable<Error | Promise<V> | V> | void> | void, { size = 100, delay = 50 }: { size?: number, delay?: number } = {}): (x: T) => Promise<V> {
	function* batchAccumulator() {
		const entries = [];
		const promises = [];

		function addPromise(): Promise<V> {
			if (entries.length) {
				return new Promise((resolve, reject) => { promises.push({ resolve, reject }); });
			} else {
				return (undefined: any); // dummy - never observed
			}
		}

		const timeout = _.debounce(async () => {
			startNewBatch();
			try {
				const results: Iterable<V | Error> = await callback(entries) || [];
				for (const [{ resolve, reject }, result] of zip(promises, results)) {
					if (result instanceof Error) reject(result);
					else resolve(result);
				}
			} catch (e) {
				for (const { reject } of promises) {
					reject(e);
				}
			}
		}, delay);

		while (entries.length < size) {
			const entry = yield addPromise();
			if (entry === undefined) throw new Error('undefined passed into batch generator');
			entries.push(entry);
			timeout();
		}

		const lastPromise = addPromise();
		timeout.flush();
		yield lastPromise;
	}

	let currentBatch;

	function startNewBatch() {
		currentBatch = batchAccumulator();
		currentBatch.next(); // prime the generator, so the first `.next(value)` isn't lost
	}

	startNewBatch();

	return entry => {
		const { value } = currentBatch.next(entry);
		if (value === undefined) throw new Error('Batch generator was not replaced after completion');
		return value;
	};
}

function always<T>(promise: Promise<T>, callback: (x: T) => Promise<void> | void): Promise<void> {
	return promise.then(callback, callback);
}

function isPromise(maybePromise) {
	return maybePromise && typeof maybePromise === 'object' && typeof maybePromise.then === 'function';
}

// Like _asyncToGenerator, but calls back into the generator synchronously if the value is not a promise
// unless you're certain that you need to avoid asynchronicity at all costs, just use an async function
export function fastAsync<A, B, C, D, E, F, G, R>(
	callback: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Generator<any, R, any>
): (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R | Promise<R> {
	return function(...args) {
		return (function next(generator, arg, throwing) {
			const { value, done } = !throwing ? generator.next(arg) : generator.throw(arg);

			if (done) {
				return value;
			} else if (!isPromise(value)) {
				return next(generator, value, false);
			} else {
				return value.then(
					val => next(generator, val, false),
					err => next(generator, err, true)
				);
			}
		})(Reflect.apply(callback, this, args), undefined, false);
	};
}

/* eslint-disable no-redeclare, no-unused-vars */
declare function asyncFlow<A1, A2, A3, A4, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<R> | R>
	(f1: F1, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<R> | R;
declare function asyncFlow<A1, A2, A3, A4, B, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2: (b: B) => Promise<R> | R>
	(f1: F1, f2: F2, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<R> | R;
declare function asyncFlow<A1, A2, A3, A4, B, C, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2: (b: B) => Promise<C> | C, F3: (c: C) => Promise<R> | R>
	(f1: F1, f2: F2, f3: F3, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<R> | R;
declare function asyncFlow<A1, A2, A3, A4, B, C, D, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2: (b: B) => Promise<C> | C, F3: (c: C) => Promise<D> | D, F4: (d: D) => Promise<R> | R>
	(f1: F1, f2: F2, f3: F3, f4: F4, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<R> | R;
declare function asyncFlow<A1, A2, A3, A4, B, C, D, E, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2: (b: B) => Promise<C> | C, F3: (c: C) => Promise<D> | D, F4: (d: D) => Promise<E> | E, F5: (e: E) => Promise<R> | R>
	(f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<R> | R;
declare function asyncFlow<A1, A2, A3, A4, B, C, D, E, F, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<B> | B, F2: (b: B) => Promise<C> | C, F3: (c: C) => Promise<D> | D, F4: (d: D) => Promise<E> | E, F5: (e: E) => Promise<F> | F, F6: (f: F) => Promise<R> | R>
	(f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<R> | R;

export function asyncFlow(firstFn, ...fns) {
	return fastAsync(function*(...args) {
		let accum = firstFn(...args);
		for (const fn of fns) {
			accum = fn(yield accum);
		}
		return accum;
	});
}
/* eslint-enable no-duplicates */

// once the promise has resolved, its value is available synchronously
// intended for use with fastAsync
export function reifyPromise<T>(promise: Promise<T>): { get(): T | Promise<T> } {
	let val = promise;
	promise.then(x => { val = x; });
	return { get: () => val };
}

export function keyedMutex<T:(...args: any) => Promise<void> | void>(
	callback: T,
	keyResolver?: (...args: any) => mixed = x => x
): T {
	const queues = new Map();

	return (function(...args) {
		const key = keyResolver(...args);

		// https://github.com/facebook/flow/issues/34
		const tail = queues.has(key) ?
			always(queues.get(key) /*:: || Promise.resolve() */, () => Reflect.apply(callback, this, args)) :
			Reflect.apply(callback, this, args);

		if (isPromise(tail) /*:: && tail instanceof Promise */) {
			queues.set(key, tail);

			always(tail, () => {
				if (queues.get(key) === tail) queues.delete(key);
			});
		}

		return tail;
	}: any);
}

export function mutex<T:(...args: any) => Promise<void> | void>(callback: T): T {
	let queue;

	return (function(...args) {
		const tail = queue ?
			always(queue, () => Reflect.apply(callback, this, args)) :
			Reflect.apply(callback, this, args);

		if (isPromise(tail) /*:: && tail instanceof Promise */) {
			queue = tail;

			always(tail, () => {
				if (queue === tail) queue = undefined;
			});
		}

		return tail;
	}: any);
}

/**
 * Queues a callback to be invoked during the next frame.
 * @param{function(number): void} callback Invoked with the start time of the current frame.
 * @returns {void}
 */
export const nextFrame = (() => {
	const callbacks = [];
	let queued = false;

	// start = now() is a fallback for non-compliant implementations (old Safari)
	function runCallbacks(start = now()) {
		queued = false;
		for (const fn of callbacks.splice(0, callbacks.length))	fn(start);
	}

	return function nextFrame(callback: (start: number) => void) {
		callbacks.push(callback);

		if (queued) return;
		queued = true;

		requestAnimationFrame(runCallbacks);
	};
})();

/* eslint-disable no-redeclare */
// rest params can't be placed before non-rest params, so this is unfortunately necessary
// add another case if you need more params
declare function frameThrottle(callback: (start: number) => void): () => void;
declare function frameThrottle<A>(callback: (a: A, start: number) => void): (a: A) => void;
declare function frameThrottle<A, B>(callback: (a: A, b: B, start: number) => void): (a: A, b: B) => void;
declare function frameThrottle<A, B, C>(callback: (a: A, b: B, c: C, start: number) => void): (a: A, b: B, c: C) => void;

/**
 * Returns a wrapper function, similar to _.throttle, that will invoke `callback` at most once per frame.
 * `callback` will be invoked with the arguments provided to the most recent call of the wrapper function.
 * @param {function(...*, number): void} callback Last param is the start time of the current frame.
 * @returns {function(...*): void}
 */
export function frameThrottle(callback) {
	let args = [];
	let queued = false;

	function runCallback(start) {
		queued = false;
		callback(...args, start);
	}

	return (...a) => {
		args = a;

		if (queued) return;
		queued = true;

		if (document.hidden) setTimeout(() => { runCallback(now()); });
		else nextFrame(runCallback);
	};
}
/* eslint-enable no-redeclare */

/**
 * Returns a wrapper function, similar to _.throttle, that will only invoke the latest `callback` in the next upcoming idle period.
 *
 * For browsers that don't support requestIdleCallback, an approximation for "Don't do anything this frame" is provided.
 *
 * `callback` will be invoked with the arguments provided to the most recent call of the wrapper function.
 * @param {function(...*): void} callback
 * @returns {function(...*): void}
 */
export function idleThrottle<Fn:(...args: any) => void>(callback: Fn): Fn {
	let args = [];
	let queued = false;

	const requestIdle = window.requestIdleCallback ?
		window.requestIdleCallback : // XXX Only available in Chrome / Opera
		fn => requestAnimationFrame(() => { requestAnimationFrame(fn); });

	function runCallback() {
		queued = false;
		callback(...args);
	}

	return ((...a) => {
		args = a;

		if (queued) return;
		queued = true;

		requestIdle(runCallback);
	}: any);
}
