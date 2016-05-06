import _ from 'lodash';
import { repeatWhile } from './';

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

export function matchesPageLocation(includes, excludes) {
	includes = typeof includes === 'undefined' ? [] : [].concat(includes);
	excludes = typeof excludes === 'undefined' ? [] : [].concat(excludes);

	return (
		(!excludes.length || !isPageType(...excludes) && !matchesPageRegex(...excludes)) &&
		(!includes.length || isPageType(...includes) || matchesPageRegex(...includes))
	);
}

export const regexes = {
	all: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\//i,
	frontpage: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(new|rising|controversial|top)?\/?(?:\?.*)?$/i,
	comments: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/[\-\w\.\/]*\/comments/i,
	nosubComments: /https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/comments\/[\-\w\.\/]*/i,
	friendsComments: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/friends\/comments/i,
	inbox: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:r\/[\-\w\.\/]+?\/)?message\//i,
	profile: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/user\/([\-\w\.#=]*)\/?(?:comments)?\/?(?:\?(?:[a-z]+=[a-zA-Z0-9_%]*&?)*)?$/i,
	submit: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:[\-\w\.\/]*\/)?submit\/?(?:\?.*)?$/i,
	prefs: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/prefs/i,
	account: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/account/i,
	wiki: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:r\/[\-\w\.]+\/)?wiki/i,
	stylesheet: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:r\/[\-\w\.]+\/)?about\/stylesheet/i,
	search: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:[\-\w\.\/]*\/)?search/i,
	toolbar: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/tb\//i,
	commentPermalink: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/[\-\w\.\/]*comments\/[a-z0-9]+\/[^\/]+\/[a-z0-9]+$/i,
	subreddit: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/([\w\.\+]+)/i,
	subredditPostListing: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/([\w\.\+]+)(?:\/(new|rising|controversial|top))?\/?(?:\?.*)?$/i,
	subredditAbout: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/([\w\.\+]+)\/about(?:\/|$)(?!modqueue|reports|spam|unmoderated|edited)/i,
	multireddit: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/((?:me|user\/[\-\w\.#=]*)\/(?:m|f)\/([\w\.\+]+))/i,
	domain: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/domain\/([\w\.\+]+)/i,
};

export function isReddit() {
	const currURL = location.href;
	return regexes.all.test(currURL) && !regexes.toolbar.test(currURL);
}

export const pageType = _.once(() => {
	const currURL = location.href.split('#')[0];
	const defaultPageType = 'linklist';
	const pageTypes = ['wiki', 'search', 'profile', 'stylesheet', 'subredditAbout', 'comments', 'inbox', 'submit', 'account', 'prefs'];
	return pageTypes.find(pageType => regexes[pageType].test(currURL)) || defaultPageType;
});

export function isPageType(...types) {
	const thisPage = pageType();
	return types.some(type => (type === 'all') || (type === thisPage));
}

export function matchesPageRegex(...regexps) {
	const href = document.location.href;
	return regexps.some(regex => regex.test && regex.test(href));
}

export const currentSubreddit = _.once(() => {
	const [, subreddit] = location.href.match(regexes.subreddit) || [];
	return subreddit || null;
});

export function isCurrentSubreddit(subreddit) {
	if (!currentSubreddit()) return false;
	return currentSubreddit().toLowerCase() === subreddit.toLowerCase();
}

export const currentMultireddit = _.once(() => {
	const [, multireddit] = location.href.match(regexes.multireddit) || [];
	return multireddit || null;
});

export function isCurrentMultireddit(multireddit) {
	if (!currentMultireddit()) return false;
	return currentMultireddit().toLowerCase() === multireddit.toLowerCase();
}

export const currentDomain = _.once(() => {
	const [, domain] = location.href.match(regexes.domain) || [];
	return domain || null;
});

export const currentUserProfile = _.once(() => {
	const [, profile] = location.href.match(regexes.profile) || [];
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
	return typeof href !== 'string' || href.substring(0, 11) === 'javascript:'; // eslint-disable-line no-script-url
}
