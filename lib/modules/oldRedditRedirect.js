/* @flow */

import { Module } from '../core/module';

const REDIRECT_HOSTNAMES = new Set([
	'reddit.com',
	'www.reddit.com',
	'new.reddit.com',
	'sh.reddit.com',
]);
const OLD_REDDIT_HOSTNAME = 'old.reddit.com';

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

	url.hostname = OLD_REDDIT_HOSTNAME;
	return url.href;
}

module.beforeLoad = () => {
	const redirectUrl = getOldRedditUrl(location.href);
	if (redirectUrl) window.location.replace(redirectUrl);
};
