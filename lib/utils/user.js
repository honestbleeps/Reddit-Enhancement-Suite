import _ from 'lodash';
import { HOUR, MINUTE, string } from './';
import { ajax } from 'environment';

export const loggedInUser = _.once(() => {
	const userLink = document.querySelector('#header-bottom-right > span.user > a');
	return userLink && !userLink.classList.contains('login-required') && userLink.textContent || null;
});

export const isModeratorAnywhere = _.once(() => !!document.getElementById('modmail'));

export const loggedInUserHash = _.once(() => {
	const hashEle = document.querySelector('[name=uh]');
	return hashEle && hashEle.value;
});

export function getUserInfo(username = loggedInUser(), live = false) {
	if (!username) {
		return Promise.reject(new Error('getUserInfo: null/undefined username'));
	}

	return ajax({
		url: string.encode`/user/${username}/about.json`,
		type: 'json',
		cacheFor: live ? MINUTE : HOUR
	});
}
