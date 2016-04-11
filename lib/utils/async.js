export function nonNull(callback, interval = 1) {
	return new Promise(resolve => {
		(function repeat() {
			const val = callback();
			if (!val) {
				setTimeout(repeat, interval);
				return;
			}
			resolve(val);
		})();
	});
}

export async function seq(iterable, callback) {
	let i = 0;
	for (const val of iterable) {
		await callback(val, i++, iterable); // eslint-disable-line babel/no-await-in-loop
	}
}
