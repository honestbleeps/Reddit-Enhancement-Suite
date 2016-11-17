/* @flow */

/* eslint-disable no-redeclare, no-unused-vars */
declare function downcast<From, To: From>(val: From, ty: Class<To>): To;
declare function downcast(val: mixed, ty: 'boolean'): boolean;
declare function downcast(val: mixed, ty: 'number'): number;
declare function downcast(val: mixed, ty: 'string'): string;
/* eslint-enable no-unused-vars */

export function downcast(val, ty) {
	if (
		// only perform the check in dev mode, but hide this from Flow
		/*:: ` */ process.env.NODE_ENV !== 'development' || /*:: ` && */
		(typeof ty === 'string' ? typeof val === ty : val instanceof ty) // eslint-disable-line valid-typeof
	) {
		return val;
	}

	throw new TypeError(`Expected ${val} to be instance of ${ty}.`);
}
/* eslint-enable no-redeclare */
