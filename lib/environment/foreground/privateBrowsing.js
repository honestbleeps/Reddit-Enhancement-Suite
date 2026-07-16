/* @flow */

export function isPrivateBrowsing(): boolean {
	return Boolean(chrome.extension && chrome.extension.inIncognitoContext);
}
