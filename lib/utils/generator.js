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

export function* enumerate() {
	let i = 0;
	for (const x of this) {
		yield [i, x];
		++i;
	}
}

export function* map(callback) {
	for (const x of this) {
		yield callback(x);
	}
}

export function* filter(predicate) {
	for (const x of this) {
		if (predicate(x)) yield x;
	}
}

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

export function* takeWhile(predicate) {
	for (const x of this) {
		if (!predicate(x)) return;
		yield x;
	}
}

export function collect() {
	return Array.from(this);
}
