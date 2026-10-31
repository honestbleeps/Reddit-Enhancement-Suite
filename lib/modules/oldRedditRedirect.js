/* @flow */

import { Module } from '../core/module';
import { ajax } from '../environment';

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

// i.redd.it sends browser navigations to new Reddit's media viewer, so show the image's post instead
async function getImagePostUrl(currentUrl: string): Promise<?string> {
	const url = new URL(currentUrl);

	if (!REDIRECT_HOSTNAMES.has(url.hostname)) return null;
	if (!(/^\/media\/?$/i).test(url.pathname)) return null;
	if (url.searchParams.getAll('new_reddit').includes('true')) return null;

	let imageUrl;
	try {
		imageUrl = new URL(url.searchParams.get('url') || '');
	} catch {
		return null;
	}
	if (imageUrl.hostname !== 'i.redd.it') return null;

	const { data } = await ajax({ url: '/api/info.json', query: { url: imageUrl.href }, type: 'json' }).catch(() => ({}));
	const post = data?.children?.find(({ kind }) => kind === 't3');
	return post ? `https://${OLD_REDDIT_HOSTNAME}${post.data.permalink}` : null;
}

async function redirectToOldReddit() {
	const redirectUrl = getOldRedditUrl(location.href) || await getImagePostUrl(location.href);
	if (redirectUrl) window.location.replace(redirectUrl);
}

// New Reddit changes pages without reloading, e.g. from the media viewer to the post's comments page
function watchNavigation() {
	let previousUrl = location.href;
	const onNavigate = () => {
		if (location.href === previousUrl) return;
		previousUrl = location.href;
		redirectToOldReddit();
	};

	const { navigation } = (window as any);
	if (navigation) {
		navigation.addEventListener('currententrychange', onNavigate);
	} else {
		setInterval(onNavigate, 500);
	}
}

module.beforeLoad = async () => {
	if (REDIRECT_HOSTNAMES.has(new URL(location.href).hostname)) watchNavigation();
	await redirectToOldReddit();
};
