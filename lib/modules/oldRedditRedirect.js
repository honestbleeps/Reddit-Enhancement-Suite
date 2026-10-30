/* @flow */

import { Module } from '../core/module';
import { ajax } from '../environment';

const REDIRECT_HOSTNAMES = new Set([
	'reddit.com',
	'www.reddit.com',
	'new.reddit.com',
	'sh.reddit.com',
	'm.reddit.com',
]);
const OLD_REDDIT_HOSTNAME = 'old.reddit.com';
const NEW_REDDIT_HOSTNAME = 'www.reddit.com';
const AUTH_FLOW_PATH = /^\/(?:login|logout|register|account|password|username|verification|onboarding|api\/login|api\/v1\/authorize)(?:[/.]|$)/i;

export const module: Module<any> = new Module('oldRedditRedirect');

module.moduleName = 'oldRedditRedirectName';
module.category = 'browsingCategory';
module.description = 'oldRedditRedirectDesc';
module.keywords = ['old reddit', 'legacy', 'redirect'];
module.disabledByDefault = true;

function getOldRedditUrl(currentUrl: string): ?string {
	const url = new URL(currentUrl);

	if (!REDIRECT_HOSTNAMES.has(url.hostname)) return null;
	if ((/^\/(?:media|mod|poll|settings|topics|community-points|appeals?|notifications|message\/compose\/)/i).test(url.pathname)) return null;
	if ((/^\/(?:gallery|mail|answers|r\/subreddit)(?:\/|$)/i).test(url.pathname)) return null;
	if ((/^\/(?:(?:r|u|user)\/[^/]+\/)?s(?:\/|$)/i).test(url.pathname)) return null;
	if (url.searchParams.getAll('new_reddit').includes('true')) return null;
	// Let sign-in, sign-up, 2FA and OAuth flows finish on new Reddit; Reddit then navigates to a regular page, which gets redirected.
	if (AUTH_FLOW_PATH.test(url.pathname)) return null;

	url.hostname = OLD_REDDIT_HOSTNAME;
	return url.href;
}

function getNewRedditUrl(currentUrl: string): ?string {
	const url = new URL(currentUrl);
	if (url.hostname !== OLD_REDDIT_HOSTNAME) return null;

	url.hostname = NEW_REDDIT_HOSTNAME;
	return url.href;
}

// The session cookie is HttpOnly and the DOM isn't available yet, so ask the API.
// Returns null when the check fails, so a transient error doesn't trigger a redirect.
async function isLoggedIn(): Promise<?boolean> {
	try {
		const me = await ajax({ url: '/api/me.json', type: 'json' });
		return !!(me && me.data && me.data.name);
	} catch (e) {
		return null;
	}
}

// Logged-in users are sent to old Reddit and logged-out users to new Reddit (where signing in works),
// so the two redirects never loop.
module.beforeLoad = async () => {
	const oldRedditUrl = getOldRedditUrl(location.href);
	const newRedditUrl = getNewRedditUrl(location.href);
	if (!oldRedditUrl && !newRedditUrl) return;

	const loggedIn = await isLoggedIn();
	if (loggedIn === true && oldRedditUrl) {
		window.location.replace(oldRedditUrl);
	} else if (loggedIn === false && newRedditUrl) {
		window.location.replace(newRedditUrl);
	}
};
