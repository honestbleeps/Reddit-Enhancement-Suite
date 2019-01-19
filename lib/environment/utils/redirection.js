/* @flow */

export type RedirectRule = {|
	name: string,
	from: RegExp | string,
	fromType: 'abs' | 'rel',
	to: string | null,
|};

export const requiredPermissions: Array<string> = ['webRequestBlocking'];
