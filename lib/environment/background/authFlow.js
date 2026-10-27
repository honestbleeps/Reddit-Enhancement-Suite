/* @flow */

declare var crypto: {
	getRandomValues: (array: Uint8Array) => Uint8Array,
};

export function generateState(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function isExpectedRedirect(responseUrl: string, redirectUri: string): boolean {
	const response = new URL(responseUrl);
	const redirect = new URL(redirectUri);

	return response.origin === redirect.origin &&
		response.pathname === redirect.pathname &&
		response.search === redirect.search;
}

export function validateAuthResponse(responseUrl: string, redirectUri: string, expectedState: string): string {
	if (!isExpectedRedirect(responseUrl, redirectUri)) {
		throw new Error('Authorization response used an unexpected redirect URI.');
	}

	const hash = new URL(responseUrl).hash.slice(1);
	const state = new URLSearchParams(hash).get('state');
	if (state !== expectedState) throw new Error('Authorization response state did not match.');

	return responseUrl;
}
