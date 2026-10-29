/* @flow */

/* eslint-disable no-redeclare, no-unused-vars */
declare function downcast<From, To extends From>(val: From, ty: Class<To>): To;
declare function downcast(val: unknown, ty: 'boolean'): boolean;
declare function downcast(val: unknown, ty: 'number'): number;
declare function downcast(val: unknown, ty: 'string'): string;
/* eslint-enable no-unused-vars */

export function downcast(val: any, ty: any): any {
	if (
		// only perform the check in dev mode, but hide this from Flow
		// $FlowFixMe[constant-condition] the dev-mode check is deliberately hidden from Flow inside a template literal
		/*:: ` */ process.env.NODE_ENV !== 'development' || /*:: ` && */
		(typeof ty === 'string' ? typeof val === ty : val instanceof ty) // eslint-disable-line valid-typeof
	) {
		return val;
	}

	throw new TypeError(`Expected ${val} to be instance of ${ty}.`);
}
/* eslint-enable no-redeclare */
