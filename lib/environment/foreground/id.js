/* @flow */

export function getExtensionId(): string {
	return chrome.runtime.id;
}

export const getURL = chrome.runtime.getURL;
