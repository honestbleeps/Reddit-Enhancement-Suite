import _ from 'lodash';
import * as Notifications from '../modules/notifications';
import { sendMessage } from 'browserEnvironment';

function filterPerms(perms) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

/**
 * @param {...string} perms Optional Chrome permissions to request.
 * @returns {Promise<void, *>} Resolves if the permissions are granted, rejects otherwise.
 */
export const request = _.memoize(
	async (...perms) => {
		const { permissions, origins } = filterPerms(perms);
		const granted = await sendMessage('permissions', { operation: 'request', permissions, origins });
		if (!granted) {
			const re = /((?:\w+\.)+\w+)(?=\/|$)/i;
			Notifications.showNotification(`
				<p>You clicked "Deny". RES needs permission to access the API(s) at:</p>
				<p>${origins.map(u => `<code>${re.exec(u)[0]}</code>`).join(', ')}</p>
				<p>Be assured RES does not access any of your information on these domains - it only accesses the API.</p>
			`, 20000);
			throw new Error(`Permission not granted for: ${perms.join(', ')}`);
		}
	},
	(...perms) => perms.join(',')
);

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
