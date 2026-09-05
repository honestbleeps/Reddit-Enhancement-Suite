/* @flow */

export function hasOptionalPermissions(permissions: ?string[]): boolean {
	return Array.isArray(permissions) && permissions.length > 0;
}
