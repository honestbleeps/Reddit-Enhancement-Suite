import _ from 'lodash';
import { mutex } from '../utils';
import * as Notifications from '../modules/notifications'; // eslint-disable-line import/no-restricted-paths
import { sendMessage } from 'browserEnvironment';

function filterPerms(perms) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

export const has = _.memoize(
	async (...perms) => {
		const { permissions, origins } = filterPerms(perms);

		return await sendMessage('permissions', { operation: 'contains', permissions, origins });
	},
	(...perms) => perms.join(',')
);

/**
 * @param {string} perms Name of site to request permission for
 * @param {...string} perms Optional Chrome permissions to request.
 * @returns {Promise<void, *>} Resolves if the permissions are granted, rejects otherwise.
 */
export const request = mutex(async (siteName, ...perms) => {
	if (await has(...perms)) return;

	const { permissions, origins } = filterPerms(perms);

	const urlStripRe = /((?:\w+\.)+\w+)(?=\/|$)/i;

	Notifications.showNotification({
		header: 'Permission required',
		moduleID: 'permissions',
		closeDelay: 20000,
		message: `
				<p>In order to inline expand content from ${siteName}, RES needs permission to access the API(s) at:</p>
				<p>${origins.map(url => `<code>${urlStripRe.exec(url)[0]}</code>`).join(', ')}</p>
				<p>Be assured RES does not access/modify any of your information on these domains - it only accesses the public API.</p>`,
	});

	const granted = await sendMessage('permissions', { operation: 'request', permissions, origins });
	if (granted) {
		has.cache.set(perms.join(','), true);
	} else {
		throw new Error(`Permission not granted for: ${perms.join(', ')}`);
	}
});

/**
 * @param {...string} perms Optional Chrome permissions to remove.
 * @returns {Promise<void, *>} Resolves if the permissions are removed, rejects otherwise.
 */
export async function remove(...perms) {
	const { permissions, origins } = filterPerms(perms);
	const removed = await sendMessage('permissions', { operation: 'remove', permissions, origins });
	if (!removed) {
		throw new Error(`Permissions not removed: ${perms.join(', ')} - are you trying to remove required permissions?`);
	}
}
