/* @flow */

import { Module } from '../core/module';
import { ajax, Storage } from '../environment';

const REDIRECT_HOSTNAMES = new Set([
	'reddit.com',
	'www.reddit.com',
	'new.reddit.com',
	'sh.reddit.com',
]);
const OLD_REDDIT_HOSTNAME = 'old.reddit.com';
const NEW_REDDIT_HOSTNAME = 'www.reddit.com';
const LOGOUT_DEST = `https://${NEW_REDDIT_HOSTNAME}/`;
const LOGOUT_FLAG_KEY = 'RES.oldRedditRedirect.loggedOutAt';
const LOGOUT_FLAG_TTL = 60 * 1000;
const LOGOUT_FORM_SELECTOR = 'form.logout, form[action$="/logout"]';
const LOOP_GUARD_TTL = 10 * 1000;

const lastRedirect = Storage.wrap('RESmodules.oldRedditRedirect.lastRedirect', (null as null | { to: 'old' | 'new', at: number }));
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
	// Reddit sends logged-out users to old Reddit's own login page (e.g. ?reason=lor2); leaving it would loop.
	if (AUTH_FLOW_PATH.test(url.pathname)) return null;

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

// Old Reddit's logout endpoint redirects to the form's `dest`, so point it at new Reddit.
// The timestamp is a fallback in case Reddit ignores `dest` and lands on an old Reddit page (e.g. its login page).
function handleLogout(e: Event) {
	const target = e.target;
	const form = target instanceof Element ? target.closest(LOGOUT_FORM_SELECTOR) : null;
	if (!(form instanceof HTMLFormElement)) return;

	let dest = form.querySelector('input[name="dest"]');
	if (!(dest instanceof HTMLInputElement)) {
		dest = document.createElement('input');
		dest.type = 'hidden';
		dest.name = 'dest';
		form.append(dest);
	}
	dest.value = LOGOUT_DEST;

	try {
		sessionStorage.setItem(LOGOUT_FLAG_KEY, String(Date.now()));
	} catch (err) {
		// Storage may be unavailable; the `dest` redirect still applies.
	}
}

function takeRecentLogout(): boolean {
	try {
		const loggedOutAt = Number(sessionStorage.getItem(LOGOUT_FLAG_KEY));
		sessionStorage.removeItem(LOGOUT_FLAG_KEY);
		return Date.now() - loggedOutAt < LOGOUT_FLAG_TTL;
	} catch (err) {
		return false;
	}
}

// Old and new Reddit can disagree about whether you're logged in (e.g. a new Reddit session that old Reddit doesn't accept),
// which would bounce between them forever. Extension storage is shared across both hostnames, so remember the last
// redirect and stop if it went the opposite way moments ago; the user is left on the current page to sign in.
async function redirect(url: string, to: 'old' | 'new') {
	const last = await lastRedirect.get();
	if (last && last.to !== to && Date.now() - last.at < LOOP_GUARD_TTL) {
		// Keep the guard active while the user keeps browsing here.
		await lastRedirect.set({ to: last.to, at: Date.now() });
		return;
	}

	await lastRedirect.set({ to, at: Date.now() });
	window.location.replace(url);
}

// Logged-in users are sent to old Reddit and logged-out users to new Reddit (where signing in works).
module.beforeLoad = async () => {
	const onOldReddit = new URL(location.href).hostname === OLD_REDDIT_HOSTNAME;
	if (onOldReddit) {
		// Capture phase runs before old Reddit's inline onclick submits the logout form.
		document.addEventListener('click', handleLogout, true);
		document.addEventListener('submit', handleLogout, true);
	}

	const oldRedditUrl = getOldRedditUrl(location.href);
	const newRedditUrl = onOldReddit && takeRecentLogout() ? LOGOUT_DEST : getNewRedditUrl(location.href);
	if (!oldRedditUrl && !newRedditUrl) return;

	const loggedIn = await isLoggedIn();
	if (loggedIn === true && oldRedditUrl) {
		await redirect(oldRedditUrl, 'old');
	} else if (loggedIn === false && newRedditUrl) {
		await redirect(newRedditUrl, 'new');
	}
};
