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
			_.remove(queues, q => {
				if (q.i < q.items.length) {
					try {
						// take one item from the queue
						q.callback(q.items[q.i], q.i, q.items);
						q.i++;
						return false;
					} catch (e) {
						// error thrown, stop processing this queue and reject
						q.reject(e);
						return true;
					}
				} else {
					// entire queue has been drained, resolve and remove it
					q.resolve();
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
			queues.push({ items: Array.from(this), i: 0, callback, resolve, reject });
			run();
		});
	};
})();

export function invokeAll(...args) {
	for (const fn of this) {
		fn(...args);
	}
}
