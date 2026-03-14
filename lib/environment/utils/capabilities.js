/* @flow */

export type BrowserCapabilities = {|
	buildTarget: string,
	isFirefox: boolean,
	isSafari: boolean,
	supportsActionClickBootstrap: boolean,
	supportsBackgroundRedirectAuth: boolean,
	supportsControlledDownloads: boolean,
	supportsCookieStoreContext: boolean,
	supportsHistory: boolean,
	shouldBatchOptionStorage: boolean,
|};

export function getBuildTarget(buildTarget: ?string = process.env.BUILD_TARGET): string {
	return buildTarget || 'chrome';
}

export function getBrowserCapabilities(buildTarget: ?string = process.env.BUILD_TARGET): BrowserCapabilities {
	const target = getBuildTarget(buildTarget);
	const isFirefox = target === 'firefox';
	const isSafari = target === 'safari';

	return {
		buildTarget: target,
		isFirefox,
		isSafari,
		supportsActionClickBootstrap: isSafari,
		supportsBackgroundRedirectAuth: !isSafari,
		supportsControlledDownloads: !isSafari,
		supportsCookieStoreContext: isFirefox,
		supportsHistory: !isSafari,
		shouldBatchOptionStorage: !isFirefox,
	};
}

export function shouldUseBackgroundRedirectAuth(capabilities: BrowserCapabilities = browserCapabilities): boolean {
	return capabilities.supportsBackgroundRedirectAuth;
}

export function shouldUseControlledDownloads(capabilities: BrowserCapabilities = browserCapabilities): boolean {
	return capabilities.supportsControlledDownloads;
}

export function shouldUseExtensionHistory(privateBrowsing: boolean, capabilities: BrowserCapabilities = browserCapabilities): boolean {
	return capabilities.supportsHistory && !privateBrowsing;
}

export const browserCapabilities = getBrowserCapabilities();
export const buildTarget = browserCapabilities.buildTarget;
export const isFirefox = browserCapabilities.isFirefox;
export const isSafari = browserCapabilities.isSafari;
export const supportsActionClickBootstrap = browserCapabilities.supportsActionClickBootstrap;
export const supportsBackgroundRedirectAuth = browserCapabilities.supportsBackgroundRedirectAuth;
export const supportsControlledDownloads = browserCapabilities.supportsControlledDownloads;
export const supportsCookieStoreContext = browserCapabilities.supportsCookieStoreContext;
export const supportsHistory = browserCapabilities.supportsHistory;
export const shouldBatchOptionStorage = browserCapabilities.shouldBatchOptionStorage;
