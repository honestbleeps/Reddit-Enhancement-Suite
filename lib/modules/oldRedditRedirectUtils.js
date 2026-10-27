/* @flow */

const REDIRECT_HOSTNAMES = new Set([
	'reddit.com',
	'www.reddit.com',
]);
const OLD_REDDIT_HOSTNAME = 'old.reddit.com';

function isIRedditUrl(url: string): boolean {
	try {
		return new URL(url).hostname === 'i.redd.it';
	} catch (e) {
		if (e instanceof TypeError) return false;
		throw e;
	}
}

export function getOldRedditUrl(currentUrl: string): ?string {
	const url = new URL(currentUrl);

	if (!REDIRECT_HOSTNAMES.has(url.hostname)) return null;

	const mediaUrl = url.searchParams.get('url');
	if (
		url.pathname === '/media' &&
		mediaUrl &&
		isIRedditUrl(mediaUrl)
	) return null;

	url.hostname = OLD_REDDIT_HOSTNAME;
	return url.href;
}
