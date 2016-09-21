import _ from 'lodash';
import { repeatWhile } from './generator';

export function getUrlParams(url) {
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

export function insertParam(href, key, value) {
	const pre = href.includes('?') ? '&' : '?';
	return `${href}${pre}${key}=${value}`;
}

export function insertParams(href, paramMap) {
	return Object.entries(paramMap)
		.reduce((str, [key, val]) => insertParam(str, key, val), href);
}

export function matchesPageLocation(includes = [], excludes = []) {
	includes = [].concat(includes);
	excludes = [].concat(excludes);

	return (
		(!excludes.length || !isPageType(...excludes) && !matchesPageRegex(...excludes)) &&
		(!includes.length || isPageType(...includes) || matchesPageRegex(...includes))
	);
}

/* eslint-disable key-spacing */
export const regexes = {
	frontpage:        /^\/(?:hot|new|rising|controversial|top)?(?:\/|$)/i,
	comments:         /^\/(?:r\/([\w\.]+)\/)?comments(?:\/([a-z0-9]+))(?:\/|$)/i,
	commentsLinklist: /^\/(?:r\/[\w\.\+]+\/)?comments\/?$/i,
	inbox:            /^\/message(?:\/|$)/i,
	profile:          /^\/user\/([\w\-]+)(?:\/(?!m\/)|$)/i,
	submit:           /^\/(?:r\/([\w\.\+]+)\/)?submit(?:\/|$)/i,
	prefs:            /^\/prefs(?:\/|$)/i,
	account:          /^\/account-activity(?:\/|$)/i,
	wiki:             /^\/(?:r\/([\w\.]+)\/)?wiki(?:\/|$)/i,
	stylesheet:       /^\/(?:r\/([\w\.]+)\/)about\/stylesheet(?:\/|$)/i,
	search:           /^\/(?:r\/[\w\.\+]+\/|(?:me|user\/[\w\-]+)\/[mf]\/[\w\.\+]+\/)?search(?:\/|$)/i,
	commentPermalink: /^\/(?:r\/([\w\.]+)\/)?comments\/([a-z0-9]+)\/\w*\/([a-z0-9]+)(?:\/|$)/i,
	subreddit:        /^\/r\/([\w\.\+]+)(?:\/|$)/i,
	subredditAbout:   /^\/r\/([\w\.]+)\/about(?:\/(?!modqueue|reports|spam|unmoderated|edited)|$)/i,
	modqueue:         /^\/r\/([\w\.\+]+)\/about\/(?:modqueue|reports|spam|unmoderated|edited)(?:\/|$)/i,
	multireddit:      /^\/((?:me|user\/[\w\-]+)\/[mf]\/[\w\.\+]+)(?:\/|$)/i,
	domain:           /^\/domain\/([\w\.]+)(?:\/|$)/i,
	composeMessage:   /^\/(?:r\/([\w\.\+]+)\/)?message\/compose(?:\/|$)/i,
	liveThread:       /^\/live\/(?!create(?:\/|$))([a-z0-9]+)(?:\/|$)/i,
};
/* eslint-enable key-spacing */

export const pageType = _.once(() => {
	const defaultPageType = 'linklist';
	const pageTypes = ['wiki', 'search', 'profile', 'stylesheet', 'modqueue', 'subredditAbout', 'comments', 'commentsLinklist', 'liveThread', 'inbox', 'submit', 'account', 'prefs'];
	return pageTypes.find(pageType => regexes[pageType].test(location.pathname)) || defaultPageType;
});

export function isPageType(...types) {
	const thisPage = pageType();
	return types.some(type => (type === 'all') || (type === thisPage));
}

export function matchesPageRegex(...regexps) {
	return regexps.some(regex => regex.test && regex.test(location.href));
}

export const currentSubreddit = _.once(() => {
	const [, subreddit] = location.pathname.match(regexes.subreddit) || [];
	return subreddit || null;
});

export function isCurrentSubreddit(subreddit) {
	if (!currentSubreddit()) return false;
	return currentSubreddit().toLowerCase() === subreddit.toLowerCase();
}

export const currentMultireddit = _.once(() => {
	const [, multireddit] = location.pathname.match(regexes.multireddit) || [];
	return multireddit || null;
});

export function isCurrentMultireddit(multireddit) {
	if (!currentMultireddit()) return false;
	return currentMultireddit().toLowerCase() === multireddit.toLowerCase();
}

export const currentDomain = _.once(() => {
	const [, domain] = location.pathname.match(regexes.domain) || [];
	return domain || null;
});

export const currentUserProfile = _.once(() => {
	const [, profile] = location.pathname.match(regexes.profile) || [];
	return profile || null;
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

export function isCommentCode(link) {
	// don't add annotations for hidden links - these are used as CSS
	// hacks on subreddits to do special formatting, etc.

	// Note that link.href will return the full href (which includes the
	// reddit.com domain). We don't want that.
	const href = link.getAttribute('href');

	const emptyText = link.textContent.length === 0;
	const isCommentCode = COMMENT_CODE_REGEX.test(href);

	return emptyText && isCommentCode;
}

export function isEmptyLink(link) {
	// Note that link.href will return the full href (which includes the
	// reddit.com domain). We don't want that.
	const href = link.getAttribute('href');
	return typeof href !== 'string' || href.startsWith('javascript:') || href === '#'; // eslint-disable-line no-script-url
}
