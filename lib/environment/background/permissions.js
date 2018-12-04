/* @flow */

import { apiToPromise } from '../utils/api';
import { filterPerms } from '../utils/permissions';
import { addListener } from './messaging';

addListener('permissions', ({ operation, permissions, origins }) => {
	if (process.env.BUILD_TARGET === 'chrome') {
		switch (operation) {
			case 'contains':
				return apiToPromise(chrome.permissions.contains)({ permissions, origins });
			case 'request':
				return apiToPromise(chrome.permissions.request)({ permissions, origins });
			default:
				throw new Error(`Invalid permissions operation: ${operation}`);
		}
	} else if (process.env.BUILD_TARGET === 'firefox' || process.env.BUILD_TARGET === 'edge') {
		return true;
	}
});

export function checkPermissionsGranted(perms: Array<string>) {
	return apiToPromise(chrome.permissions.contains)(filterPerms(perms));
}
