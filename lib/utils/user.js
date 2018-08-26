/* @flow */

import _ from 'lodash';
import { ajax } from '../environment';
import type { CurrentRedditUser, RedditAccount } from '../types/reddit';
import { MINUTE } from './time';
import { regexes } from './location';
import * as string from './string';

export const isLoggedIn = _.once(() => {
	if (loggedInUser()) {
		return true;
	} else if (!document.querySelector('#header a[href*="/login"]')) {
		return true;
	}
});

export const loggedInUser = _.once((): string | void => documentLoggedInUser(document));

export const documentLoggedInUser = (document: Document | Element): string | void => {
	const link: ?HTMLAnchorElement = (document.querySelector('#header-bottom-right > span.user > a'): any);
	if (!link || link.classList.contains('login-required')) return;
	const profile = regexes.profile.exec(link.pathname);
	if (profile) {
		return profile[1];
	}
};

export const isModeratorAnywhere = _.once((): boolean => !!document.getElementById('modmail'));

export const loggedInUserHash = _.once(async (): Promise<?string> => {
	const hashEle = document.querySelector('[name=uh]');
	if (hashEle instanceof HTMLInputElement) {
		return hashEle.value;
	}

	const userInfo = await loggedInUserInfo();
	return userInfo && userInfo.data && userInfo.data.modhash;
});

export const loggedInUserInfo = _.once((): Promise<CurrentRedditUser | void> =>
	!isLoggedIn() ? Promise.resolve() : ajax({ url: '/api/me.json', type: 'json' })
		.then(data => data.data && data.data.modhash ? data : undefined));

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
