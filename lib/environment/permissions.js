/* @flow */

import _ from 'lodash';
import { mutex } from '../utils';
import { sendMessage } from 'browserEnvironment';

function filterPerms(perms) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

/**
 * @param {Array<string>} perms Permissions to check if granted
 * @returns {Promise<boolean>}
 */
export const has = _.memoize(
	perms => sendMessage('permissions', { operation: 'contains', ...filterPerms(perms) }),
	perms => perms.join(',')
);

const requestListeners = [];
export function onRequest(callback: (perms: string[]) => void): void {
	requestListeners.push(callback);
}

/**
 * @param {Array<string>} perms Optional Chrome permissions to request.
 * @param {string} perms Name of site to request permission for
 * @returns {Promise<void, *>} Resolves if the permissions are granted, rejects otherwise.
 */
export const request = mutex(async (perms: string[]) => {
	if (await has(perms)) return;

	const { permissions, origins } = filterPerms(perms);

	for (const fn of requestListeners) fn(perms);

	const granted = await sendMessage('permissions', { operation: 'request', permissions, origins });
	if (granted) {
		has.cache.set(perms.join(','), true);
	} else {
		throw new Error(`Permission not granted for: ${perms.join(', ')}`);
	}
});

/**
 * @param {Array<string>} perms Optional Chrome permissions to remove.
 * @returns {Promise<void, *>} Resolves if the permissions are removed, rejects otherwise.
 */
export async function remove(perms: string[]) {
	const { permissions, origins } = filterPerms(perms);
	const removed = await sendMessage('permissions', { operation: 'remove', permissions, origins });
	if (!removed) {
		throw new Error(`Permissions not removed: ${perms.join(', ')} - are you trying to remove required permissions?`);
	}
}
