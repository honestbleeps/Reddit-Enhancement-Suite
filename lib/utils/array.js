export function invokeAll(...args) {
	for (const fn of this) {
		fn(...args);
	}
}

/**
 * If `callback` returns a promise, waits for the promise to resolve before advancing to the next item.
 * @template T
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
 * @param {function(T, number, T[]): (boolean|Promise<boolean>)} predicate
 * @returns {Promise<T|void>}
 */
export async function asyncFind(predicate) {
	let i = 0;
	for (const val of this) {
		if (await predicate(val, i++, this)) return val; // eslint-disable-line babel/no-await-in-loop
	}
}
