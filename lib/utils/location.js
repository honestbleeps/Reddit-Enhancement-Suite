/* @flow */

import _ from 'lodash';

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
	comments:         /^\/(?:r\/([\w\.]+)\/|(u(?:ser)?\/[\w-]+)\/)?comments\/([a-z0-9]+)(?:\/|$)/i,
	commentsLinklist: /^\/(?:r\/[\w\.\+]+\/|u(?:ser)?\/[\w-]+\/)?comments\/?$/i,
	inbox:            /^\/(?:r\/([\w\.]+)\/)?message(?:\/|$)/i,
	profile:          /^\/user\/([\w\-]+)(?:\/(?!m\/)|$)/i,
	submit:           /^\/(?:r\/([\w\.\+]+)\/)?submit(?:\/|$)/i,
	prefs:            /^\/prefs(?:\/|$)/i,
	account:          /^\/account-activity(?:\/|$)/i,
	wiki:             /^\/(?:r\/([\w\.]+)\/)?wiki(?:\/|$)/i,
	stylesheet:       /^\/(?:r\/([\w\.]+)\/)about\/stylesheet(?:\/|$)/i,
	search:           /^\/(?:r\/[\w\.\+]+\/|(?:me|user\/[\w\-]+)\/[mf]\/[\w\.\+]+\/|domain\/[^\/]+\/)?search(?:\/|$)/i,
	commentPermalink: /^\/(?:r\/([\w\.]+)\/)?comments\/([a-z0-9]+)\/[^\/]*\/([a-z0-9]+)(?:\/|$)/i,
	duplicates:       /^\/r\/[\w\.\+]+\/duplicates\/([a-z0-9]+)/i,
	subreddit:        /^\/r\/([\w\.\+]+)(?:\/|$)/i,
	subredditAbout:   /^\/r\/([\w\.]+)\/about(?:\/(?!modqueue|reports|spam|unmoderated|edited)|$)/i,
	modqueue:         /^\/r\/([\w\.\+]+)\/about\/(?:modqueue|reports|spam|unmoderated|edited)(?:\/|$)/i,
	multireddit:      /^\/((?:me|user\/[\w\-]+)\/[mf]\/[\w\.\+]+)(?:\/|$)/i,
	domain:           /^\/domain\/([\w\.]+)(?:\/|$)/i,
	composeMessage:   /^\/(?:r\/([\w\.\+]+)\/)?message\/compose(?:\/|$)/i,
	liveThread:       /^\/live\/(?!create(?:\/|$))([a-z0-9]+)(?:\/|$)/i,
};
/* eslint-enable key-spacing */

export const execRegexes: { [k: string]: (path: string) => ?string[] } = {
	comments: path => {
		const match = regexes.comments.exec(path);
		if (!match) return match;
		match.splice(1, 2, match[1] || match[2] && match[2].replace(/^u.*\//, 'u_'));
		return match;
	},
};

export type PageType = 'wiki' | 'search' | 'profile' | 'stylesheet' | 'modqueue' | 'subredditAbout' | 'comments' | 'commentsLinklist' | 'liveThread' | 'inbox' | 'submit' | 'account' | 'prefs' | 'linklist';

export const pageType = _.once((): PageType => {
	const defaultPageType = 'linklist';
	const pageTypes = ['wiki', 'search', 'stylesheet', 'modqueue', 'subredditAbout', 'comments', 'commentsLinklist', 'profile', 'liveThread', 'inbox', 'submit', 'account', 'prefs'];
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

export function isCurrentSubreddit(...subreddits: string[]): boolean {
	const sub = (currentSubreddit() || '').toLowerCase();
	if (!sub) return false;
	return subreddits.some(v => v.toLowerCase() === sub);
}

export const currentMultireddit = _.once((): string | void => {
	const match = location.pathname.match(regexes.multireddit);
	if (match) return match[1];
});

export function isCurrentMultireddit(...multireddits: string[]): boolean {
	const multi = (currentMultireddit() || '').toLowerCase();
	if (!multi) return false;
	return multireddits.some(v => v.toLowerCase() === multi);
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
