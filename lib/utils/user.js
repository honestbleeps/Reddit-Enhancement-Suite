/* @flow */

import _ from 'lodash';
import { ajax } from '../environment';
import type { RedditAccount } from '../types/reddit';
import { MINUTE, string } from './';

export const loggedInUser = _.once((): string | void => {
	const userLink = document.querySelector('#header-bottom-right > span.user > a');
	return userLink && !userLink.classList.contains('login-required') && userLink.textContent || undefined;
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
