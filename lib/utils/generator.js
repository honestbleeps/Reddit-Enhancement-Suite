/* @flow */

export function* repeatWhile<T>(callback: () => T): Iterable<T> {
	let val;
	while ((val = callback())) {
		yield val;
	}
}

export function* range(start: number, end: number): Iterable<number> {
	for (let i = start; i < end; ++i) { // eslint-disable-line no-restricted-syntax
		yield i;
	}
}

/* eslint-disable no-redeclare, no-unused-vars */
declare function zip<A>(a: Iterable<A>): Iterable<[A]>;
declare function zip<A, B>(a: Iterable<A>, b: Iterable<B>): Iterable<[A | void, B | void]>;
declare function zip<A, B, C>(a: Iterable<A>, b: Iterable<B>, c: Iterable<C>): Iterable<[A | void, B | void, C | void]>;
/* eslint-enable no-unused-vars */

export function* zip(...iterables) {
	const generators = iterables.map(it => it[Symbol.iterator]());
	let results;

	while ((results = generators.map(gen => gen.next())).some(r => !r.done)) {
		yield results.map(r => r.value);
	}
}
/* eslint-enable no-redeclare */
