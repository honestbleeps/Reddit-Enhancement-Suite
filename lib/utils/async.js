import _ from 'lodash';

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

export async function seq(iterable, callback) {
	let i = 0;
	for (const val of iterable) {
		await callback(val, i++, iterable); // eslint-disable-line babel/no-await-in-loop
	}
}

/**
 * @typedef {T|Promise<T, E>} MaybePromise
 * @template T, E
 */

/**
 * @typedef {MaybePromise<T, E>|E} Result
 * @template T, E
 */

/**
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
				promises.forEach(({ resolve, reject }, i) => {
					if (results[i] instanceof Error) reject(results[i]);
					else resolve(results[i]);
				});
			} catch (e) {
				promises.forEach(({ reject }) => reject(e));
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
