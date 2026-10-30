/* @flow */

import { Module } from '../core/module';
import { ajax } from '../environment';

export const module: Module<any> = new Module('oldRedditRedirect');

module.moduleName = 'oldRedditRedirectName';
module.category = 'browsingCategory';
module.description = 'oldRedditRedirectDesc';
module.keywords = ['old reddit', 'legacy', 'redirect'];
module.disabledByDefault = true;

const OLD_REDDIT_HOSTNAME = 'old.reddit.com';
const NEW_REDDIT_HOSTNAME = 'www.reddit.com';
const NEW_REDDIT_HOSTNAMES = new Set(['reddit.com', 'www.reddit.com', 'new.reddit.com', 'sh.reddit.com']);

// Pages that only exist (or only work) on new Reddit
const NEW_REDDIT_ONLY_PATHS = [
	/^\/(?:media|mod|poll|settings|topics|community-points|appeals?|notifications|message\/compose\/)/i,
	/^\/(?:gallery|mail|answers|r\/subreddit)(?:\/|$)/i,
	/^\/(?:(?:r|u|user)\/[^/]+\/)?s(?:\/|$)/i, // share links
];

// Sign-in, sign-up, 2FA and OAuth pages are never redirected: leaving them mid-flow causes redirect loops.
// Once the flow finishes, Reddit navigates to a regular page, which is redirected as usual.
const AUTH_PATH = /^\/(?:login|logout|register|account|password|username|verification|onboarding|api\/login|api\/v1\/authorize)(?:[/.]|$)/i;

const LOGOUT_DESTINATION = `https://${NEW_REDDIT_HOSTNAME}/`;
const LOGOUT_FORM_SELECTOR = 'form.logout, form[action$="/logout"]';
const RECENT_LOGOUT_KEY = 'RES.oldRedditRedirect.loggedOutAt';
const RECENT_LOGOUT_TTL = 60 * 1000;

module.beforeLoad = async () => {
	const url = new URL(location.href);
	const onOldReddit = url.hostname === OLD_REDDIT_HOSTNAME;
	if (onOldReddit) watchForLogout();

	const oldRedditUrl = getOldRedditUrl(url);
	const newRedditUrl = onOldReddit && takeRecentLogout() ? LOGOUT_DESTINATION : getNewRedditUrl(url);
	if (!oldRedditUrl && !newRedditUrl) return;

	// Users logged in to old Reddit go there; everyone else goes to new Reddit, where signing in works.
	const loggedIn = await fetchLoggedInToOldReddit();
	if (loggedIn === true && oldRedditUrl) {
		window.location.replace(oldRedditUrl);
	} else if (loggedIn === false && newRedditUrl) {
		window.location.replace(newRedditUrl);
	}
};

function getOldRedditUrl(url: URL): ?string {
	if (!NEW_REDDIT_HOSTNAMES.has(url.hostname)) return null;
	if (AUTH_PATH.test(url.pathname)) return null;
	if (NEW_REDDIT_ONLY_PATHS.some(re => re.test(url.pathname))) return null;
	if (url.searchParams.getAll('new_reddit').includes('true')) return null;

	return withHostname(url, OLD_REDDIT_HOSTNAME);
}

function getNewRedditUrl(url: URL): ?string {
	if (url.hostname !== OLD_REDDIT_HOSTNAME) return null;
	if (AUTH_PATH.test(url.pathname)) return null;

	return withHostname(url, NEW_REDDIT_HOSTNAME);
}

function withHostname(url: URL, hostname: string): string {
	const result = new URL(url.href);
	result.hostname = hostname;
	return result.href;
}

// Old and new Reddit can disagree about whether the user is logged in (e.g. a new Reddit session that old Reddit
// doesn't accept, which sends them to old Reddit's login page). Asking old Reddit on both hostnames keeps the two
// redirects consistent, so they can't bounce between each other.
// The session cookie is HttpOnly and the DOM isn't available yet, so ask the API.
// Resolves to null if the check fails, so a transient error never triggers a redirect.
async function fetchLoggedInToOldReddit(): Promise<?boolean> {
	try {
		const me = await ajax({ url: `https://${OLD_REDDIT_HOSTNAME}/api/me.json`, type: 'json' });
		return !!(me && me.data && me.data.name);
	} catch (e) {
		return null;
	}
}

// Old Reddit's logout endpoint redirects to the form's `dest`, so point it at new Reddit.
// Also remember the logout in case Reddit ignores `dest` and lands on an old Reddit page (e.g. its login page).
function watchForLogout() {
	// Capture phase runs before old Reddit's inline onclick submits the logout form.
	document.addEventListener('click', handleLogout, true);
	document.addEventListener('submit', handleLogout, true);
}

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
	dest.value = LOGOUT_DESTINATION;

	try {
		sessionStorage.setItem(RECENT_LOGOUT_KEY, String(Date.now()));
	} catch (err) {
		// Storage may be unavailable; `dest` still applies.
	}
}

function takeRecentLogout(): boolean {
	try {
		const loggedOutAt = Number(sessionStorage.getItem(RECENT_LOGOUT_KEY));
		sessionStorage.removeItem(RECENT_LOGOUT_KEY);
		return Date.now() - loggedOutAt < RECENT_LOGOUT_TTL;
	} catch (err) {
		return false;
	}
}
