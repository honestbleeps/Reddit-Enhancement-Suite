/* @flow */

import _ from 'lodash';
import { ajax } from '../environment';
import type { RedditAccount } from '../types/reddit';
import { MINUTE, string, regexes } from './';

export const loggedInUser = _.once((): string | void => {
	const link: ?HTMLAnchorElement = (document.querySelector('#header-bottom-right > span.user > a'): any);
	if (!link || link.classList.contains('login-required')) return;
	const profile = regexes.profile.exec(link.pathname);
	return profile ? profile[1] : undefined;
});

export const isModeratorAnywhere = _.once((): boolean => !!document.getElementById('modmail'));

export const loggedInUserHash = _.once((): ?string => {
	const hashEle: any = document.querySelector('[name=uh]');
	return hashEle && hashEle.value;
});

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
