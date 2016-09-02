import _ from 'lodash';
import { Alert, mutex } from '../utils';
import { Storage } from './';
import { sendMessage } from 'browserEnvironment';

function filterPerms(perms) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

const STORAGE_KEY = 'RES.cachedDeniedPerms';

export function reset() {
	Storage.delete(STORAGE_KEY);
}

/**
 * @param {...string} perms Optional Chrome permissions to request.
 * @returns {Promise<void, *>} Resolves if the permissions are granted, rejects otherwise.
 */
export const request = _.memoize(
	mutex(async (...perms) => {
		const { permissions, origins } = filterPerms(perms);

		const hasPermissions = await sendMessage('permissions', { operation: 'contains', permissions, origins });

		// already granted, don't ask the user again
		if (hasPermissions) return;

		const cacheKey = perms.join(',');
		const cachedPerms = await Storage.get(STORAGE_KEY) || {};
		if (cachedPerms[cacheKey]) {
			throw new Error(`Cached denial for permission: ${perms.join(', ')}`);
		}

		const urlStripRe = /((?:\w+\.)+\w+)(?=\/|$)/i;

		await Alert.open(`
			<p>To create expandos, RES needs permission to access the API(s) at:</p>
			<br>
			<p>${origins.map(url => `<code>${urlStripRe.exec(url)[0]}</code>`).join(', ')}</p>
			<br>
			<p>Be assured RES does not access/modify any of your information on these domains - it only accesses the public API.</p>
			<br>
			<p><b>Clicking "ok" will open a popup where you may accept or deny this permission.</b></p>
		`);

		const granted = await sendMessage('permissions', { operation: 'request', permissions, origins });

		if (!granted) {
			Storage.patch(STORAGE_KEY, { [cacheKey]: true });
			throw new Error(`Permission not granted for: ${perms.join(', ')}`);
		}
	}),
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
