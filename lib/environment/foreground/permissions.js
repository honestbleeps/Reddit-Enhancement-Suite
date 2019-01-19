/* @flow */

import _ from 'lodash';
import { mutex } from '../../utils/async';
import { sendMessage } from './messaging';

type Perms = Array<string>;

function filterPerms(perms: Array<string>) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

/**
 * @param {Array<string>} perms Permissions to check if granted
 * @returns {Promise<boolean>}
 */
export const has = _.memoize(
	(perms: Perms) => sendMessage('permissions', { operation: 'contains', ...filterPerms(perms) }),
	perms => perms.join(',')
);

/**
 * @param {Array<string>} perms Optional Chrome permissions to request.
 * @param {string} perms Name of site to request permission for
 * @returns {Promise<void, *>} Resolves if the permissions are granted, rejects otherwise.
 */
export const request = mutex(async (perms: Perms) => {
	if (await has(perms)) return;

	const { permissions, origins } = filterPerms(perms);

	const granted = await sendMessage('permissions', { operation: 'request', permissions, origins });
	if (granted) {
		has.cache.set(perms.join(','), true);
	} else {
		throw new Error(`Permission not granted for: ${perms.join(', ')}`);
	}
});
