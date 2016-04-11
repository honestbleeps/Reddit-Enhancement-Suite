import { _addListener, _sendMessage } from './_sendMessage';
import { waitForEvent } from '../utils';

_addListener('userGesture', () => waitForEvent(document.body, 'mousedown', 'keydown'));

const inProgress = new Map();

function filterPerms(perms) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

/**
 * @param {...string} perms Optional Chrome permissions to request.
 * @returns {Promise<void, *>} Resolves if the permissions are granted, rejects otherwise.
 */
export async function request(...perms) {
	if (process.env.BUILD_TARGET === 'chrome') {
		const key = perms.join(',');

		if (!inProgress.has(key)) {
			inProgress.set(key, (async () => {
				const { permissions, origins } = filterPerms(perms);

				const granted = await _sendMessage('permissions', { operation: 'request', permissions, origins });

				inProgress.delete(key);

				if (!granted) {
					const re = /((?:\w+\.)+\w+)(?=\/|$)/i;
					modules['notifications'].showNotification(
						`<p>You clicked "Deny". RES needs permission to access the API(s) at:</p>
							<p>${origins.map(u => `<code>${re.exec(u)[0]}</code>`).join(', ')}</p>
							<p>Be assured RES does not access any of your information on these domains - it only accesses the API.</p>`,
						20000
					);
					throw new Error(`Permission not granted for: ${perms.join(', ')}`);
				}
			})());
		}

		return inProgress.get(key);
	}
}

/**
 * @param {...string} perms Optional Chrome permissions to remove.
 * @returns {Promise<void, *>} Resolves if the permissions are removed, rejects otherwise.
 */
export async function remove(...perms) {
	if (process.env.BUILD_TARGET === 'chrome') {
		const removed = await _sendMessage('permissions', { operation: 'remove', ...filterPerms(perms) });
		if (!removed) {
			throw new Error(`Permissions not removed: ${perms.join(', ')} - are you trying to remove required permissions?`);
		}
	}
}
