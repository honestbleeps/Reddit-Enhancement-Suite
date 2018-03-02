/* @flow */

export function getExtensionId(): string {
	if (typeof chrome !== "undefined") {
		return chrome.runtime.id;
	} else {
		return "unknown";
	}
}
