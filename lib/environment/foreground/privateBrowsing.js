/* @flow */

export function isPrivateBrowsing(): boolean {
	return chrome && chrome.extension.inIncognitoContext || false;
}
