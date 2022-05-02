/* @flow */

import { once } from 'lodash-es';
import { ajax } from '../environment';
import type { CurrentRedditUser, RedditAccount } from '../types/reddit';
import { MINUTE } from './time';
import { isAppType, regexes } from './location';
import * as string from './string';

export const isLoggedIn = once(() => {
	if (loggedInUser()) {
		return true;
	} else if (document.querySelector('header a[href^="/message/inbox"]')) {
		return true;
	}
});

export const loggedInUser = once((): string | void => documentLoggedInUser(document));

export const documentLoggedInUser = (document: Document | Element): string | void => {
	if (location.host === 'mod.reddit.com') {
		// eslint-disable-next-line no-useless-assign/no-useless-assign
		const username = document.querySelector('.Header__user').textContent;
		return username;
	}
	if (isAppType('d2x')) {
		// The first text node in the user button contains the username
		const findFirstTextNode = e => [...e.childNodes].filter(v => v.nodeType === 3).concat(...[...e.children].map(findFirstTextNode));
		const button = document.querySelector('#USER_DROPDOWN_ID > *');
		const username = button && findFirstTextNode(button)[0];
		return username && username.textContent;
	}

	const link: ?HTMLAnchorElement = (document.querySelector('#header-bottom-right > span.user > a'): any);
	if (!link || link.classList.contains('login-required')) return;
	const profile = regexes.profile.exec(link.pathname);
	if (profile) {
		return profile[1];
	}
};

export const isModeratorAnywhere = once((): boolean => !!(document.getElementById('modmail') || document.querySelector('[href="/r/mod/"]')));

export const loggedInUserHash = once(async (): Promise<?string> => {
	const hashEle = document.querySelector('[name=uh]');
	if (hashEle instanceof HTMLInputElement) {
		return hashEle.value;
	}

	const userInfo = await loggedInUserInfo();
	return userInfo && userInfo.data && userInfo.data.modhash;
});

export const loggedInUserInfo = once((): Promise<CurrentRedditUser | void> =>
	!isLoggedIn() ? Promise.resolve() : ajax({ url: '/api/me.json', type: 'json' })
		.then(data => data.data && data.data.modhash ? data : undefined));

const usernameRE = /(?:u|user)\/([\w\-]{3,20}(?![\w\-]))/;

export const usernameSelector = [
	'.contents .author',
	'p.tagline a.author',
	'#friend-table span.user a',
	'.sidecontentbox .author',
	'div.md a[href^="/u/"]:not([href*="/m/"])',
	'div.md a[href*="reddit.com/u/"]:not([href*="/m/"])',
	'.usertable a.author',
	'.parent > a.author',
	'.usertable span.user a',
	'div.wiki-page-content .author',
	'.Post__authorLink', // Newish profile page
].join(', ');

export function getUsernameFromLink(element: HTMLElement): ?string {
	if (!(element instanceof HTMLAnchorElement)) return;

	const { href, origin } = element;

	// The link should refer to this site
	if (!location.origin.endsWith(origin.split('.').slice(-2).join('.'))) return;

	const [, username] = href.match(usernameRE) || [];
	if (username) return username;
}

export function getUserInfo(username: ?string = loggedInUser()): Promise<RedditAccount> {
	if (!username) {
		return Promise.reject(new Error('getUserInfo: null/undefined username'));
	}

	return ajax({
		url: string.encode`/user/${username}/about.json`,
		type: 'json',
		cacheFor: 10 * MINUTE,
	});
}
