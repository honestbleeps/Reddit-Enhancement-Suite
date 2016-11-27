/* @flow */

/*
 * Roughly equivalent to `$.extend(true, target, source)`
 * Unfortunately lodash does not seem to offer any function that does this:
 * _.assign/_.extend/Object.assign are not recursive
 * _.merge and _.defaultsDeep ignore undefined values
 */
export function extendDeep(target: { [key: string]: mixed }, source: { [key: string]: mixed }): { [key: string]: mixed } {
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

export function mapScalarToObject<Field: { name: string }>(option: { fields: Field[] }, value: mixed[]): { [key: string]: mixed } {
	const object = {};

	option.fields.forEach((field, index) => {
		Reflect.defineProperty(object, field.name, {
			get: () => value[index],
			set: v => (value[index] = v),
		});
	});

	return object;
}

