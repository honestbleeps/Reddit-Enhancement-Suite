export function* repeatWhile(callback) {
	let val;
	while ((val = callback())) {
		yield val;
	}
}

export function* range(start, end) {
	for (let i = start; i < end; ++i) { // eslint-disable-line no-restricted-syntax
		yield i;
	}
}

/**
 * @this {Iterable}
 * @returns {Generator}
 */
export function* enumerate() {
	let i = 0;
	for (const x of this) {
		yield [i, x];
		++i;
	}
}

/**
 * @template T, V
 * @this {Iterable}
 * @param {function(T): V} callback
 * @returns {Generator<V>}
 */
export function* map(callback) {
	for (const x of this) {
		yield callback(x);
	}
}

/**
 * @template T
 * @this {Iterable}
 * @param {function(T): boolean} predicate
 * @returns {Generator<T>}
 */
export function* filter(predicate) {
	for (const x of this) {
		if (predicate(x)) yield x;
	}
}

/**
 * @template T
 * @this {Iterable}
 * @param {function(T): boolean} predicate
 * @returns {T}
 */
export function find(predicate) {
	for (const x of this) {
		if (predicate(x)) return x;
	}
}

export function* zip(...iterables) {
	const iterators = iterables.map(it => it[Symbol.iterator]());
	let results;

	while ((results = iterators.map(gen => gen.next())).some(r => !r.done)) {
		yield results.map(r => r.value);
	}
}

/**
 * @template T
 * @this {Iterable}
 * @param {number} n
 * @returns {Generator<T>}
 */
export function* take(n) {
	let i = 0;
	if (i >= n) return;
	for (const x of this) {
		yield x;
		if (++i >= n) return;
	}
}

/**
 * @template T
 * @this {Iterable}
 * @param {function(T): boolean} predicate
 * @returns {Generator<T>}
 */
export function* takeWhile(predicate) {
	for (const x of this) {
		if (!predicate(x)) return;
		yield x;
	}
}

/**
 * @this {Iterable}
 * @returns {Array}
 */
export function collect() {
	return Array.from(this);
}
