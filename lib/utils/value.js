export function firstValid(...vals) {
	return vals.find(val =>
		val !== undefined && val !== null && (typeof val !== 'number' || !isNaN(val))
	);
}


export function numericalCompare(op, a, b) {
	switch (op) {
		case '==':	return a == b; // eslint-disable-line eqeqeq
		case '!=':	return a != b; // eslint-disable-line eqeqeq
		case '>':	return a > b;
		case '<':	return a < b;
		case '>=':	return a >= b;
		case '<=':	return a <= b;
		default: throw new Error(`Unhandled operator ${op}`);
	}
}
