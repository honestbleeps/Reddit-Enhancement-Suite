/* @flow */

import escapeRegExp from 'lodash/escapeRegExp';

const regexRegex = /^\/(.*)\/([gim]+)?$/;

export const regexFromString = (string: string, { allowEmptyString = false, fullMatch = true }: {| allowEmptyString?: boolean, fullMatch?: boolean |} = {}) => {
	if (regexRegex.test(string)) {
		const [, str, flags] = (regexRegex.exec(string): any); // guaranteed to match due to `.test()` above
		return new RegExp(str, flags);
	} else {
		if (!allowEmptyString && !string) throw new Error('String cannot be empty');
		const patt = escapeRegExp(string);
		return new RegExp(fullMatch ? `^${patt}$` : patt, 'i');
	}
};
