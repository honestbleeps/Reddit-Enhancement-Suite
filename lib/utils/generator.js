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
