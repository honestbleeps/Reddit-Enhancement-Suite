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

export function* take(n) {
	let i = 0;
	if (i >= n) return;
	for (const x of this) {
		yield x;
		if (++i >= n) return;
	}
}

export function* takeWhile(predicate) {
	for (const x of this) {
		if (!predicate(x)) return;
		yield x;
	}
}

export function* skip(n) {
	let i = 0;
	for (const x of this) {
		if (++i <= n) continue;
		yield x;
	}
}

export function collect() {
	return Array.from(this);
}
