/* @flow */

export function getExtensionId(): string {
	return chrome.runtime.id;
}

export const getURL = chrome.runtime.getURL;

export const getOptionsURL = (hash: string = '') => new URL(hash, getURL('options.html'));
export const isOptionsPage = () => location.origin === getOptionsURL().origin;
