import _ from 'lodash';
import { frameDebounce } from './async';
import { now } from './';

/*
 Iterate through an array in chunks, executing a callback on each element.
 Each chunk is handled asynchronously from the others with a delay betwen each batch.
 This will change the timeout dynamically based on current screen performance in an effort
 to work as fast as possibly without blocking the screen.
 */

export const forEachChunked = (() => {
	const framerate = 15;
	const frameTime = 1000 / framerate;

	const queues = [];

	const run = frameDebounce(start => {
		do {
			_.remove(queues, ({ generator, callback, resolve, reject }) => {
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
		} while (now() - start < frameTime);
		run();
	});

	return function forEachChunked(callback) {
		return new Promise((resolve, reject) => {
			const iterable = (Symbol.iterator in this) ? this : Array.from(this);
			queues.push({ generator: iterable[Symbol.iterator](), callback, resolve, reject });
			run();
		});
	};
})();

export function invokeAll(...args) {
	for (const fn of this) {
		fn(...args);
	}
}

/**
 * If `callback` returns a promise, waits for the promise to resolve before advancing to the next item.
 * @template T
 * @param {function(T, number, T[]): (Promise<void>|void)} callback
 * @returns {Promise<void>}
 */
export async function forEachSeq(callback) {
	let i = 0;
	for (const val of this) {
		await callback(val, i++, this); // eslint-disable-line babel/no-await-in-loop
	}
}

/**
 * `predicate` may return a promise.
 * @template T
 * @param {function(T, number, T[]): (boolean|Promise<boolean>)} predicate
 * @returns {Promise<T[]>}
 */
export async function asyncFilter(predicate) {
	const shouldKeep = await Promise.all(this.map(predicate));
	return this.filter((e, i) => shouldKeep[i]);
}

/**
 * `callback` may return a promise.
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
 * `callback` may return a promise.
 * @template T
 * @param {function(T, number, T[]): (boolean|Promise<boolean>)} callback
 * @returns {Promise<T|void>}
 */
export async function asyncFind(callback) {
	let i = 0;
	for (const val of this) {
		if (await callback(val, i++, this)) return val; // eslint-disable-line babel/no-await-in-loop
	}
}
