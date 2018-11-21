/* @flow */

import { regexes } from '../../utils/location';
import { addListener } from './messaging';

const state = {
	enabled: false,
	options: {},
};
let webReqListenerAdded: boolean = false;

// this listener handles changes to the redirect module's state
addListener('redirection', ({ type, data }) => {
	if (type === 'updateState') {
		state.enabled = data.enabled;
		state.options = { ...data.options };

		if (!webReqListenerAdded && state.enabled) {
			chrome.webRequest.onBeforeRequest.addListener(
				webReqListener,
				{ urls: ['*://*.reddit.com/*'], types: ['main_frame'] },
				['blocking']
			);
			webReqListenerAdded = true;
		}

		return true;
	} else {
		throw new Error(`Invalid redirection operation: ${type}`);
	}
});

// this listener actually does the redirects
function webReqListener({ url }) {
	const { enabled, options } = state;
	if (!enabled) return {};

	const { origin: urlOrigin, pathname: urlPath } = new URL(url);

	let name: string | void, currentSection: string | void;

	// user profile landing page check
	[, name, currentSection] = regexes.profile.exec(urlPath) || [];
	if (
		name !== undefined &&
		currentSection === undefined &&
		Reflect.has(options, 'fromProfileLandingPage') &&
		Reflect.has(options, 'customFromProfileLandingPage')
	) {
		return getRedirectResponse(
			`${urlOrigin}/user/${name}`,
			getOptionValue(options.fromProfileLandingPage, options.customFromProfileLandingPage)
		);
	} else if (name !== undefined) {
		// request is for a user profile page other than landing page, so pass it through
		return {};
	}

	// subreddit front page check
	[, name, currentSection] = regexes.subreddit.exec(urlPath) || [];
	if (
		name !== undefined &&
		currentSection === undefined &&
		Reflect.has(options, 'fromSubredditFrontPage') &&
		Reflect.has(options, 'customFromSubredditFrontPage')
	) {
		return getRedirectResponse(
			`${urlOrigin}/r/${name}`,
			getOptionValue(options.fromSubredditFrontPage, options.customFromSubredditFrontPage)
		);
	} else if (name !== undefined) {
		// request is for a subreddit page other than front page, so pass it through
		return {};
	}

	return {};
}

function getOptionValue(mainOpt, customMod) {
	if (mainOpt.value === 'custom') return customMod.value;
	return mainOpt.value;
}

function getRedirectResponse(urlPrefix: string, redirectTo: string) {
	if (redirectTo === 'none') return {};
	return { redirectUrl: `${urlPrefix}/${redirectTo}/` };
}
