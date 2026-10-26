/* @flow */

import { Module } from '../core/module';
import { i18n } from '../environment';

const REDIRECT_HOSTNAMES = new Set([
	'reddit.com',
	'www.reddit.com',
]);
const OLD_REDDIT_HOSTNAME = 'old.reddit.com';

export const module: Module<*> = new Module('oldRedditRedirect');

module.moduleName = 'oldRedditRedirectName';
module.category = 'browsingCategory';
module.description = 'oldRedditRedirectDesc';
module.keywords = ['old reddit', 'legacy', 'redirect'];
module.disabledByDefault = true;

function getOldRedditUrl(currentUrl: string): ?string {
	const url = new URL(currentUrl);

	if (!REDIRECT_HOSTNAMES.has(url.hostname)) return null;

	url.hostname = OLD_REDDIT_HOSTNAME;
	return url.href;
}

module.beforeLoad = () => {
	const redirectUrl = getOldRedditUrl(location.href);
	if (redirectUrl) window.location.replace(redirectUrl);
};
