/* @flow */

export function getExtensionId(): string {
	return chrome.runtime.id;
}

export function getURL(path: string): string {
	return chrome.runtime.getURL(path);
}

export const getOptionsURL = (hash: string = '') => new URL(hash, getURL('options.html'));
export const isOptionsPage = () => location.origin === getOptionsURL().origin;
