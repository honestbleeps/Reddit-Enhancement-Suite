/* @flow */

import _ from 'lodash';
import { repeatWhile } from './generator';

export function getUrlParams(url?: string): { [key: string]: string } {
	const result = {};
	const re = /([^&=]+)=([^&]*)/g;
	let queryString;
	if (url) {
		const fullUrlRe = /\?((?:[^&=]+=[^&]*?&?)+)(?:#[^&]*)?$/;
		const groups = fullUrlRe.exec(url);
		if (groups) {
			queryString = groups[1];
		} else {
			return {};
		}
	} else {
		queryString = location.search.substr(1);
	}
	for (const [, key, val] of repeatWhile(() => re.exec(queryString))) {
		result[decodeURIComponent(key)] = decodeURIComponent(val.replace(/\+/g, ' '));
	}
	return result;
}

export function insertParams(href: string, paramMap: { [key: string]: string | number }): string {
	return Object.entries(paramMap).reduce((str, [key, val]) => {
		const pre = href.includes('?') ? '&' : '?';
		return `${str}${pre}${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`;
	}, href);
}

type OneOrMany<T> = T | T[];

export function matchesPageLocation(includes?: OneOrMany<PageType | RegExp> = [], excludes?: OneOrMany<PageType | RegExp> = []): boolean {
	const [includeStrings, includeRegExps]: [any[], any[]] = _.partition([].concat(includes), (x: string | RegExp): boolean => typeof x === 'string');
	const [excludeStrings, excludeRegExps]: [any[], any[]] = _.partition([].concat(excludes), (x: string | RegExp): boolean => typeof x === 'string');

	return (
		(!excludes.length || !isPageType(...excludeStrings) && !matchesPageRegex(...excludeRegExps)) &&
		(!includes.length || isPageType(...includeStrings) || matchesPageRegex(...includeRegExps))
	);
}

/* eslint-disable key-spacing */
export const regexes: { [key: string]: RegExp } = {
	frontpage:        /^\/(?:hot|new|rising|controversial|top)?(?:\/|$)/i,
	comments:         /^\/(?:r\/([\w\.]+)\/)?comments\/([a-z0-9]+)(?:\/|$)/i,
	commentsLinklist: /^\/(?:r\/[\w\.\+]+\/)?comments\/?$/i,
	inbox:            /^\/(?:r\/([\w\.]+)\/)?message(?:\/|$)/i,
	profile:          /^\/user\/([\w\-]+)(?:\/(?!m\/)|$)/i,
	submit:           /^\/(?:r\/([\w\.\+]+)\/)?submit(?:\/|$)/i,
	prefs:            /^\/prefs(?:\/|$)/i,
	account:          /^\/account-activity(?:\/|$)/i,
	wiki:             /^\/(?:r\/([\w\.]+)\/)?wiki(?:\/|$)/i,
	stylesheet:       /^\/(?:r\/([\w\.]+)\/)about\/stylesheet(?:\/|$)/i,
	search:           /^\/(?:r\/[\w\.\+]+\/|(?:me|user\/[\w\-]+)\/[mf]\/[\w\.\+]+\/|domain\/[^\/]+\/)?search(?:\/|$)/i,
	commentPermalink: /^\/(?:r\/([\w\.]+)\/)?comments\/([a-z0-9]+)\/[^\/]*\/([a-z0-9]+)(?:\/|$)/i,
	subreddit:        /^\/r\/([\w\.\+]+)(?:\/|$)/i,
	subredditAbout:   /^\/r\/([\w\.]+)\/about(?:\/(?!modqueue|reports|spam|unmoderated|edited)|$)/i,
	modqueue:         /^\/r\/([\w\.\+]+)\/about\/(?:modqueue|reports|spam|unmoderated|edited)(?:\/|$)/i,
	multireddit:      /^\/((?:me|user\/[\w\-]+)\/[mf]\/[\w\.\+]+)(?:\/|$)/i,
	domain:           /^\/domain\/([\w\.]+)(?:\/|$)/i,
	composeMessage:   /^\/(?:r\/([\w\.\+]+)\/)?message\/compose(?:\/|$)/i,
	liveThread:       /^\/live\/(?!create(?:\/|$))([a-z0-9]+)(?:\/|$)/i,
};
/* eslint-enable key-spacing */

export type PageType = 'wiki' | 'search' | 'profile' | 'stylesheet' | 'modqueue' | 'subredditAbout' | 'comments' | 'commentsLinklist' | 'liveThread' | 'inbox' | 'submit' | 'account' | 'prefs' | 'linklist';

export const pageType = _.once((): PageType => {
	const defaultPageType = 'linklist';
	const pageTypes = ['wiki', 'search', 'profile', 'stylesheet', 'modqueue', 'subredditAbout', 'comments', 'commentsLinklist', 'liveThread', 'inbox', 'submit', 'account', 'prefs'];
	return pageTypes.find(pageType => regexes[pageType].test(location.pathname)) || defaultPageType;
});

export function isPageType(...types: PageType[]): boolean {
	const thisPage = pageType();
	return types.some(type => (type === 'all') || (type === thisPage));
}

export function matchesPageRegex(...regexps: RegExp[]): boolean {
	return regexps.some(regex => regex.test(location.pathname));
}

export const currentSubreddit = _.once((): string | void => {
	const match = location.pathname.match(regexes.subreddit);
	if (match) return match[1];
});

export function isCurrentSubreddit(subreddit: string): boolean {
	const sub = currentSubreddit();
	if (!sub) return false;
	return sub.toLowerCase() === subreddit.toLowerCase();
}

export const currentMultireddit = _.once((): string | void => {
	const match = location.pathname.match(regexes.multireddit);
	if (match) return match[1];
});

export function isCurrentMultireddit(multireddit: string): boolean {
	const multi = currentMultireddit();
	if (!multi) return false;
	return multi.toLowerCase() === multireddit.toLowerCase();
}

export const currentDomain = _.once((): string | void => {
	const match = location.pathname.match(regexes.domain);
	if (match) return match[1];
});

export const currentUserProfile = _.once((): string | void => {
	const match = location.pathname.match(regexes.profile);
	if (match) return match[1];
});

// A link is a comment code if all these conditions are true:
// * It has no content (i.e. content.length === 0)
// * Its href is of the form "/code" or "#code"
//
// In case it's not clear, here is a list of some common comment
// codes on a specific subreddit:
// http://www.reddit.com/r/metarage/comments/p3eqe/full_updated_list_of_comment_faces_wcodes/
// also for CSS hacks to do special formatting, like /r/CSSlibrary

const COMMENT_CODE_REGEX = /^[\/#].+$/;

export function isCommentCode(link: HTMLAnchorElement): boolean {
	// don't add annotations for hidden links - these are used as CSS
	// hacks on subreddits to do special formatting, etc.

	// Note that link.href will return the full href (which includes the
	// reddit.com domain). We don't want that.
	const href = link.getAttribute('href');

	const emptyText = link.textContent.length === 0;
	const isCommentCode = COMMENT_CODE_REGEX.test(href);

	return emptyText && isCommentCode;
}

export function isEmptyLink(link: HTMLAnchorElement): boolean {
	// Note that link.href will return the full href (which includes the
	// reddit.com domain). We don't want that.
	const href = link.getAttribute('href');
	return typeof href !== 'string' || href.startsWith('javascript:') || href === '#'; // eslint-disable-line no-script-url
}
