/* @flow */

import { Module } from '../core/module';

const OLD_REDDIT_HOSTNAME = 'old.reddit.com';
const REDIRECT_HOSTNAMES = new Set([
	'reddit.com',
	'www.reddit.com',
	'new.reddit.com',
	'm.reddit.com',
	'amp.reddit.com',
	'i.reddit.com',
	'sh.reddit.com',
]);

export const module: Module<any> = new Module('oldRedditRedirect');

module.moduleName = 'oldRedditRedirectName';
module.category = 'browsingCategory';
module.description = 'oldRedditRedirectDesc';
module.keywords = ['old reddit', 'legacy', 'redirect'];
module.disabledByDefault = true;

function getOldRedditUrl(currentUrl: string): ?string {
	const url = new URL(currentUrl);

	const isOldReddit = url.hostname === OLD_REDDIT_HOSTNAME;
	if (!isOldReddit && !REDIRECT_HOSTNAMES.has(url.hostname)) return null;
	if ((/^\/(?:media|mod|poll|settings|topics|community-points|appeals?|notifications|message\/compose\/)/i).test(url.pathname)) return null;
	if ((/^\/(?:mail|answers|r\/subreddit)(?:\/|$)/i).test(url.pathname)) return null;
	if ((/^\/(?:(?:r|u|user)\/[^/]+\/)?s(?:\/|$)/i).test(url.pathname)) return null;
	if (url.searchParams.getAll('new_reddit').includes('true')) return null;

	// Old Reddit has no gallery page, but shows galleries on the post's comments page
	const gallery = (/^\/gallery\/(.+)/i).exec(url.pathname);
	if (gallery) {
		url.pathname = `/comments/${gallery[1]}`;
	} else if (isOldReddit) {
		return null;
	}

	url.hostname = OLD_REDDIT_HOSTNAME;
	return url.href;
}

module.beforeLoad = () => {
	const redirectUrl = getOldRedditUrl(location.href);
	if (redirectUrl) window.location.replace(redirectUrl);
};
