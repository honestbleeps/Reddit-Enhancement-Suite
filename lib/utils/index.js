export Cache from './Cache';

export Thing from './Thing';

export {
	forEachChunked
} from './array';

export {
	batch,
	nonNull,
	seq
} from './async';

export {
	niceDate,
	niceDateDiff,
	niceDateTime
} from './date';

export {
	addCSS,
	click,
	elementInViewport,
	fadeElementIn,
	fadeElementOut,
	getHeaderOffset,
	getPercentageVisibleYAxis,
	mousedown,
	observe,
	scrollTo,
	scrollToElement,
	waitForChild,
	waitForEvent
} from './dom';

export {
	range,
	repeatWhile
} from './generator';

export {
	hashCode,
	randomHash
} from './hash';

export {
	escapeHTML,
	sanitizeHTML
} from './html';

export {
	checkKeysForEvent,
	hashKeyArray,
	hashKeyEvent,
	niceKeyCode
} from './keycode';

export {
	currentDomain,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	getUrlParams,
	insertParam,
	isCurrentMultireddit,
	isCurrentSubreddit,
	isMatchURL,
	isPageType,
	isReddit,
	matchesPageLocation,
	matchesPageRegex,
	pageType,
	regexes
} from './location';

export {
	extendDeep
} from './object';

export {
	getUserInfo,
	isModeratorAnywhere,
	loggedInUser,
	loggedInUserHash
} from './user';

export * as bodyClasses from './bodyClasses';

export * as browserDetect from './browserDetect';

export * as gdAlert from './alert';

export * as string from './string';
