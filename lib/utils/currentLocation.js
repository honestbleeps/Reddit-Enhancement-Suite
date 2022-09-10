/* @flow */

import { partition, once, memoize } from 'lodash-es';
import { waitForEvent } from './dom';
import { appPageTypes, regexes } from './location';
import type { AppType, PageType } from './location';

export function matchesPageLocation(includes: Array<PageType | AppType | RegExp>, excludes: Array<PageType | AppType | RegExp> = []): boolean {
	const [includeStrings, includeRegExps]: any = partition(includes, (x: string | RegExp): boolean => typeof x === 'string');
	const [excludeStrings, excludeRegExps]: any = partition(excludes, (x: string | RegExp): boolean => typeof x === 'string');

	return (
		!excludes.length ||
		!(isPageType(...excludeStrings) || isAppType(...excludeStrings) || matchesPageRegex(...excludeRegExps))
	) && (
		!includes.length ||
		(isPageType(...includeStrings) || isAppType(...includeStrings) || matchesPageRegex(...includeRegExps))
	);
}

export const appType = once((): AppType => {
	if (document.documentElement.hasAttribute('res-options')) {
		return 'options';
	}
	if (document.documentElement.getAttribute('xmlns')) {
		return 'r2';
	}
	return 'd2x';
});

export function isAppType(...types: AppType[]): boolean {
	const thisApp = appType();
	return types.some(type => type === thisApp);
}

export const pageType = memoize((): ?PageType => {
	waitForEvent(document, 'reddit.urlChanged').then(() => {
		pageType.cache.clear();
	});
	const spec = appPageTypes[appType()];
	return spec.pageTypes.find(pageType => regexes[pageType].test(location.pathname)) || spec.default;
});

export function matchesPageRegex(...regexps: RegExp[]): boolean {
	return regexps.some(regex => regex.test(location.pathname));
}

export const currentSubreddit = once((): string | void => {
	const match = location.pathname.match(regexes.subreddit);
	if (match) return match[1];
});

export function isCurrentSubreddit(...subreddits: string[]): boolean {
	const sub = (currentSubreddit() || '').toLowerCase();
	if (!sub) return false;
	return subreddits.some(v => v.toLowerCase() === sub);
}

export const currentMultireddit = once((): string | void => {
	const match = location.pathname.match(regexes.multireddit);
	if (match) return match[1];
});

export function isCurrentMultireddit(...multireddits: string[]): boolean {
	const multi = (currentMultireddit() || '').toLowerCase();
	if (!multi) return false;
	return multireddits.some(v => v.toLowerCase() === multi);
}

export const currentDomain = once((): string | void => {
	const match = location.pathname.match(regexes.domain);
	if (match) return match[1];
});

export const currentUserProfile = once((): string | void => {
	const match = location.pathname.match(regexes.profile);
	if (match) return match[1];
});

export function isPageType(...types: PageType[]): boolean {
	const thisPage = pageType();
	return types.some(type => type === thisPage);
}

export const inQuarantinedSubreddit = once(() => document.body.classList.contains('quarantine'));
