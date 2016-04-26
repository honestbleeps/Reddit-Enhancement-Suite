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

export function* zip(...iterables) {
	const iterators = iterables.map(it => it[Symbol.iterator]());
	let results;

	while ((results = iterators.map(gen => gen.next())).every(r => !r.done)) {
		yield results.map(r => r.value);
	}

	// finalize all iterators that aren't done
	for (const i of range(0, iterators.length)) {
		if (!results[i].done && iterators[i].return) {
			iterators[i].return();
		}
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
