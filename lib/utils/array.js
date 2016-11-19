/* @flow */
import _ from 'lodash';

export type Iteratee<T, R> = (e: T, i: number, a: T[]) => R;

/*
 * If `callback` returns a promise, waits for the promise to resolve before advancing to the next item.
 */
export async function forEachSeq<T>(iterable: Iterable<T>, callback: (x: T) => ?Promise<void>): Promise<void> {
	for (const val of iterable) {
		await callback(val); // eslint-disable-line babel/no-await-in-loop
	}
}

export async function asyncFilter<T>(array: T[], predicate: Iteratee<T, Promise<mixed>>): Promise<T[]> {
	const shouldKeep = await Promise.all(array.map(predicate));
	return array.filter((e, i) => shouldKeep[i]);
}

export async function asyncReduce<T, V>(iterable: Iterable<T>, callback: (acc: V, e: T) => Promise<V>, initialValue: V): Promise<V> {
	let accumulator = initialValue;

	for (const val of iterable) {
		accumulator = await callback(accumulator, val); // eslint-disable-line babel/no-await-in-loop
	}

	return accumulator;
}

export async function asyncFind<T>(iterable: Iterable<T>, predicate: (x: T) => Promise<mixed> | mixed): Promise<T | void> {
	for (const val of iterable) {
		if (await predicate(val)) return val; // eslint-disable-line babel/no-await-in-loop
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
function concurrentFold<T, V>(array: Promise<T>[], reduce: (a: V, b: T) => V, initialValue: V, baseCase: V): Promise<V> {
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

/*
 * Guaranteed to execute concurrently, unlike `Array.prototype.some`.
 * Rejects on a best-effort basis if any of the promises reject.
 * May resolve to `true` even if some of the promises reject.
 */
export function asyncSome<T>(array: T[], predicate: Iteratee<T, Promise<mixed>>): Promise<boolean> {
	return concurrentFold(array.map(predicate), (a, b) => a || !!b, false, true);
}

/*
 * Guaranteed to execute concurrently, unlike `Array.prototype.every`.
 * Rejects on a best-effort basis if any of the promises reject.
 * May resolve to `false` even if some of the promises reject.
 */
export function asyncEvery<T>(array: T[], predicate: Iteratee<T, Promise<mixed>>): Promise<boolean> {
	return concurrentFold(array.map(predicate), (a, b) => a && !!b, true, false);
}

// Flow doesn't understand `Array.prototype.filter` refining types (yet https://github.com/facebook/flow/issues/34)
// so this is necessary if you want to do `arr.filter(...).map(...)`
export const filterMap = _.curryRight(/*:: <T, V> */(iterable: Iterable<T>, callback: (x: T) => ?[V, void]): V[] => {
	const mapped = [];
	for (const x of iterable) {
		const result = callback(x);
		if (result) mapped.push(result[0]);
	}
	return mapped;
});
