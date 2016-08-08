/**
 * @this {Iterable}
 * @param {...*} args
 * @returns {void}
 */
export function invokeAll(...args) {
	for (const fn of this) {
		fn(...args);
	}
}

/**
 * If `callback` returns a promise, waits for the promise to resolve before advancing to the next item.
 * @template T
 * @this {Array}
 * @param {function(T, number, T[]): (void|Promise<void>)} callback
 * @returns {Promise<void>}
 */
export async function forEachSeq(callback) {
	let i = 0;
	for (const val of this) {
		await callback(val, i++, this); // eslint-disable-line babel/no-await-in-loop
	}
}

/**
 * @template T
 * @this {Array}
 * @param {function(T, number, T[]): (boolean|Promise<boolean>)} predicate
 * @returns {Promise<T[]>}
 */
export async function asyncFilter(predicate) {
	const shouldKeep = await Promise.all(this.map(predicate));
	return this.filter((e, i) => shouldKeep[i]);
}

/**
 * Unlike `Array.prototype.reduce`, `initialValue` must be provided.
 * @template T, V
 * @this {Array}
 * @param {function(V, T, number, T[]): (V|Promise<V>)} callback
 * @param {V} initialValue
 * @returns {Promise<V>}
 */
export async function asyncReduce(callback, initialValue) {
	let accumulator = initialValue;

	let i = 0;
	for (const val of this) {
		accumulator = await callback(accumulator, val, i++, this); // eslint-disable-line babel/no-await-in-loop
	}

	return accumulator;
}

/**
 * @template T
 * @this {Array}
 * @param {function(T, number, T[]): (boolean|Promise<boolean>)} predicate
 * @returns {Promise<T|void>}
 */
export async function asyncFind(predicate) {
	let i = 0;
	for (const val of this) {
		if (await predicate(val, i++, this)) return val; // eslint-disable-line babel/no-await-in-loop
	}
}

/**
 * @template T, V
 * @param {Promise<T>[]} array
 * @param {function(V, T): V} reduce
 * @param {V} initialValue
 * @param {V} baseCase
 * @returns {Promise<T>}
 */
function concurrentFold(array, reduce, initialValue, baseCase) {
	if (!array.length) return Promise.resolve(initialValue);

	return new Promise((resolve, reject) => {
		let remaining = array.length;
		let accum = initialValue;

		function onResolve(x) {
			if (remaining === 0) return;

			accum = reduce(accum, x);

			if (accum === baseCase || --remaining === 0) {
				remaining = 0;
				resolve(accum);
			}
		}

		function onReject(err) {
			if (remaining === 0) return;

			remaining = 0;
			reject(err);
		}

		array.forEach(promise => promise.then(onResolve, onReject));
	});
}

/**
 * Guaranteed to execute concurrently, unlike `Array.prototype.some`.
 * Rejects on a best-effort basis if any of the promises reject.
 * May resolve to `true` even if some of the promises reject.
 * @template T
 * @this {Array}
 * @param {function(T, number, T[]): Promise<boolean>} predicate
 * @returns {Promise<boolean>}
 */
export function asyncSome(predicate) {
	return concurrentFold(this.map(predicate), (a, b) => a || !!b, false, true);
}

/**
 * Guaranteed to execute concurrently, unlike `Array.prototype.every`.
 * Rejects on a best-effort basis if any of the promises reject.
 * May resolve to `false` even if some of the promises reject.
 * @template T
 * @this {Array}
 * @param {function(T, number, T[]): Promise<boolean>} predicate
 * @returns {Promise<boolean>}
 */
export function asyncEvery(predicate) {
	return concurrentFold(this.map(predicate), (a, b) => a && !!b, true, false);
}
