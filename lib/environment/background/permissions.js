/* @flow */

import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

addListener('permissions', ({ operation, permissions, origins }) => {
	if (process.env.BUILD_TARGET === 'chrome' || process.env.BUILD_TARGET === 'firefox') {
		switch (operation) {
			case 'contains':
				return apiToPromise(chrome.permissions.contains)({ permissions, origins });
			case 'request':
				return apiToPromise(chrome.permissions.request)({ permissions, origins });
			default:
				throw new Error(`Invalid permissions operation: ${operation}`);
		}
	} else if (process.env.BUILD_TARGET === 'edge') {
		return true;
	}
});
