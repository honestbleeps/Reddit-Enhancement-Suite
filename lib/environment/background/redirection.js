/* @flow */

import keyBy from 'lodash/keyBy';

import { regexFromString } from '../../utils/regex';
import type { RedirectRule } from '../utils/redirection';
import { _get as storageGet, _set as storageSet } from '../utils/storage';
import { addListener } from './messaging';

let redirectRules: { [string]: RedirectRule };

init();

async function init() {
	// pick up rules from storage so redirects work on cold start
	redirectRules = deserializeRedirectRules(await storageGet('RESRedirect', []));

	addListener('redirection', messageListener);

	if (Object.keys(redirectRules).length) addWebReqListener();
}

function serializeRedirectRules(rules) {
	return Object.values(rules).map(rule => ({
		...rule,
		// browser storage doesn't store regexes correctly (storing '{}' instead)
		//   so converting to string
		from: rule.from.toString(),
	}));
}

function deserializeRedirectRules(rules: Array<RedirectRule>) {
	const deserialized = rules.map(rule => ({
		...rule,
		from: typeof rule.from === 'string' ? regexFromString(rule.from) : rule.from,
	}));

	return keyBy(deserialized, x => x.name);
}

// this listener handles changes to redirect state
function messageListener(rules: Array<RedirectRule>) {
	rules.forEach(rule => {
		if (rule.to === null) {
			delete redirectRules[rule.name];
			return;
		}

		rule.from = typeof rule.from === 'string' ? regexFromString(rule.from) : rule.from;
		redirectRules[rule.name] = rule;
	});

	// put rules in storage so they can be picked up later for cold start
	storageSet('RESRedirect', serializeRedirectRules(redirectRules));

	// assume the foreground script sending the message has taken care of
	//   requesting the permissions we need, and add the listener if
	//   not already added
	if (Object.keys(redirectRules).length) addWebReqListener();
}

const addWebReqListener = onceUnlessThrows(() => {
	// causes an 'Unchecked runtime.lastError' error to be thrown
	//   if we don't have the webRequest permission
	chrome.webRequest.onBeforeRequest.addListener(
		webReqListener,
		{ urls: ['*://*.reddit.com/*'], types: ['main_frame'] },
		['blocking']
	);
}, () => console.log('Failed to add redirects listener. Permissions missing.'));

function onceUnlessThrows(fn, failFn = () => {}) {
	let threw = true;

	return (...args) => {
		if (!threw) return;

		try {
			fn(...args);
			threw = false;
		} catch (e) {
			failFn();
		}
	};
}

// this listener actually does the redirects
function webReqListener({ url }) {
	const urlObj = new URL(url);
	const rules = Object.values(redirectRules);

	const redirectUrl = rules.reduce((acc: string | void, rule: RedirectRule) => {
		if (acc !== undefined) return acc; // there's already been a match, so no need to apply the remaining rules
		return applyRedirectRule(rule, urlObj);
	}, undefined);

	if (redirectUrl === undefined) return {};
	return { redirectUrl };
}

// returns the redirect destination url if rule is applicable
function applyRedirectRule({ name, from, fromType, to }: RedirectRule, urlObj: URL): string | void {
	if (to === null) throw new Error(`Invalid redirect rule: ${name}`);

	from = typeof from === 'string' ? regexFromString(from) : from;

	const matchTarget = fromType === 'abs' ? urlObj.href : urlObj.pathname;

	const [matched, ...matchedParts] = from.exec(matchTarget) || [];
	if (matched === undefined) return;

	// we always want to return an absolute url as the redirection target
	if (!to.includes('://')) to = new URL(to, urlObj.origin).href;

	return matchedParts.reduce((acc, matchedPart, idx) => acc.replace(`$${idx + 1}`, matchedPart), to);
}
