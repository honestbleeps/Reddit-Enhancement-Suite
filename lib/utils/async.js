import _ from 'lodash';
import { invokeAll, now, zip } from './';

export function nonNull(callback, interval = 1) {
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

/**
 * @typedef {T|Promise<T, E>} MaybePromise
 * @template T, E
 */

/**
 * @typedef {MaybePromise<T, E>|E} Result
 * @template T, E
 */

/*
 * Will accumulate values until `size` elements are accumulated or `delay` milliseconds pass.
 * @template T, V, E
 * @param {function(T[]): MaybePromise<Result<V, E>[], E>} callback
 * Accepts an array of batched values, should return an array of results **in the same order**.
 * If it throws, all promises will be rejected with the same error.
 * If one of the results is an instance of `Error`, the corresponding promise will be rejected with that error.
 * @param {number} size
 * @param {number} delay
 * @returns {function(T): Promise<V, E>} Accepts a single value; returns a promise.
 */
export function batch(callback, { size = 100, delay = 250 } = {}) {
	function* batchAccumulator() {
		const entries = [];
		const promises = [];

		function addPromise() {
			if (entries.length) {
				return new Promise((resolve, reject) => promises.push({ resolve, reject }));
			}
		}

		const timeout = _.debounce(async () => {
			startNewBatch();
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
		}, delay);

		while (entries.length < size) {
			entries.push(yield addPromise());
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

	return entry => currentBatch.next(entry).value;
}

export function always(callback) {
	return this.then(callback, callback);
}

export function keyedMutex(callback, keyResolver = x => x) {
	const queues = new Map();

	return (...args) => {
		const key = keyResolver(...args);

		const tail = queues.has(key) ?
			queues.get(key)::always(() => callback(...args)) :
			callback(...args);

		queues.set(key, tail);

		tail::always(() => {
			if (queues.get(key) === tail) queues.delete(key);
		});

		return tail;
	};
}

export function mutex(callback) {
	let queue;

	return (...args) => {
		const tail = queue ?
			queue::always(() => callback(...args)) :
			callback(...args);

		queue = tail;

		tail::always(() => {
			if (queue === tail) queue = undefined;
		});

		return tail;
	};
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
		callbacks.splice(0, callbacks.length)::invokeAll(start);
	}

	return function nextFrame(callback) {
		callbacks.push(callback);

		if (queued) return;
		queued = true;

		requestAnimationFrame(runCallbacks);
	};
})();

/**
 * Returns a wrapper function, similar to _.debounce, that will invoke `callback` at most once per frame.
 * `callback` will be invoked with the arguments provided to the most recent call of the wrapper function.
 * @param {function(...*, number): void} callback Last param is the start time of the current frame.
 * @returns {function(...*): void}
 */
export function frameDebounce(callback) {
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

		nextFrame(runCallback);
	};
}
