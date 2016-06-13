/*
 * Roughly equivalent to `$.extend(true, target, source)`
 * Unfortunately lodash does not seem to offer any function that does this:
 * _.assign/_.extend/Object.assign are not recursive
 * _.merge and _.defaultsDeep ignore undefined values
 */
export function extendDeep(target, source) {
	for (const key in source) {
		if (
			target[key] && source[key] &&
			typeof target[key] === 'object' && typeof source[key] === 'object' &&
			!Array.isArray(source[key]) && !Array.isArray(target[key])
		) {
			extendDeep(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
	return target;
}

export function objectValidator({ requiredProps = [] }) {
	return obj => {
		const errors = [];

		for (const key of requiredProps) {
			if (!obj[key]) errors.push(['missing required prop:', key]);
		}

		if (errors.length) {
			for (const args of errors) {
				console.error(...args);
			}

			if (process.env.NODE_ENV === 'development') {
				console.error('^^^ on object:', obj);
				throw new Error('object validation failed');
			} else {
				console.error('^^^ object validation failed:', obj);
			}
		}
	};
}
