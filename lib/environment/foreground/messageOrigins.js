/* @flow */

export function isRedditOrigin(origin: ?string): boolean {
	if (!origin) return false;

	try {
		const { protocol, hostname } = new URL(origin);
		return protocol === 'https:' && (hostname === 'reddit.com' || hostname.endsWith('.reddit.com'));
	} catch (e) {
		return false;
	}
}
