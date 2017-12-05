/* @flow */

export function isPrivateBrowsing(): boolean {
	return chrome.extension.inIncognitoContext;
}
