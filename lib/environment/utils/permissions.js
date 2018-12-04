/* @flow */

type Permissions = {|
	permissions: Array<string>,
	origins: Array<string>,
|};

export function filterPerms(perms: Array<string>): Permissions {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}
