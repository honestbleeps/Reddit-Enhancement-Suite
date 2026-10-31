/* @flow */

import { Module } from '../core/module';
import { Storage, ajax } from '../environment';
import { isAppType } from '../utils';

const GRAPHQL_URL = 'https://www.reddit.com/svc/shreddit/graphql';
const PREFS_URL = 'https://www.reddit.com/prefs?ext-referrer=DIRECT';
const attemptedStorage = Storage.wrap('RESmodules.oldRedditRedirect.attempted', (false as boolean));

export const module: Module<any> = new Module('oldRedditRedirect');

module.moduleName = 'oldRedditRedirectName';
module.category = 'browsingCategory';
module.description = 'oldRedditRedirectDesc';
module.keywords = ['old reddit', 'legacy', 'redirect', 'redesign', 'opt out'];
module.disabledByDefault = true;

// Turning the module off and on again re-runs the opt-out
module.onToggle = () => { attemptedStorage.delete(); };

function getCsrfToken(): ?string {
	for (const cookie of document.cookie.split(';')) {
		const [name, ...value] = cookie.trim().split('=');
		if (name === 'csrf_token') return decodeURIComponent(value.join('=')) || null;
	}
	return null;
}

module.contentStart = async () => {
	if (isAppType('r2')) return;

	// Logged-out users have no csrf_token cookie and no account preferences to change
	const csrfToken = getCsrfToken();
	if (!csrfToken) return;

	// Only try once per enable so a rejected opt-out can't cause a request/reload loop
	if (await attemptedStorage.get()) return;
	await attemptedStorage.set(true);

	try {
		const response = await ajax({
			method: 'POST',
			url: GRAPHQL_URL,
			headers: { 'Content-Type': 'application/json' },
			data: JSON.stringify({
				operation: 'UpdateAccountPreferences',
				variables: { input: { isInRedesignBeta: false } },
				csrf_token: csrfToken,
			}),
			type: 'json',
		});
		if (response.errors && response.errors.length) throw new Error(JSON.stringify(response.errors));

		await ajax({ url: PREFS_URL });
	} catch (e) {
		console.error('Failed to opt out of the Reddit redesign:', e);
		return;
	}

	location.reload();
};
