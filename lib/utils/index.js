/* @flow */

export { default as Cache } from './Cache';

export { default as Thing } from './Thing';

export {
	getPostMetadata,
} from './thingMetadata';

export {
	asyncEvery,
	asyncFilter,
	asyncFind,
	asyncReduce,
	asyncSome,
	filterMap,
	forEachSeq,
} from './array';

export {
	fastAsync,
	batch,
	forEachChunked,
	frameThrottle,
	idleThrottle,
	keyedMutex,
	mutex,
	nextFrame,
	nonNull,
} from './async';

export {
	colorFromArray,
	colorToArray,
} from './color';

export {
	addCSS,
	click,
	elementInViewport,
	getHeaderOffset,
	getPercentageVisibleYAxis,
	observe,
	scrollTo,
	scrollToElement,
	waitForChild,
	waitForEvent,
} from './dom';

export {
	Expando,
	expandos,
	primaryExpandos,
} from './expando.js';

export {
	downcast,
} from './flow';

export {
	range,
	repeatWhile,
	zip,
} from './generator';

export {
	hashCode,
	randomHash,
} from './hash';

export {
	hide,
	unhide,
} from './thingHide.js';

export {
	escapeHTML,
} from './html';

export {
	checkKeysForEvent,
	hashKeyArray,
	hashKeyEvent,
	niceKeyCode,
} from './keycode';

export {
	formatDate,
	formatDateDiff,
	formatDateTime,
	formatNumber,
} from './localization';

export {
	currentDomain,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	getUrlParams,
	insertParam,
	insertParams,
	isCommentCode,
	isCurrentMultireddit,
	isCurrentSubreddit,
	isEmptyLink,
	isPageType,
	matchesPageLocation,
	matchesPageRegex,
	pageType,
	regexes,
} from './location';

export {
	deinterpolate,
	interpolate,
	projectInto,
	positiveModulo,
} from './math';

export {
	extendDeep,
} from './object';

export {
	indexOptionTable,
} from './options';

export {
	DAY,
	HOUR,
	MINUTE,
	WEEK,
	now,
} from './time';

export {
	getUserInfo,
	isModeratorAnywhere,
	loggedInUser,
	loggedInUserHash,
} from './user';

export {
	firstValid,
} from './value';

export {
	initObservers,
	watchForElement,
	newSitetable,
} from './watchers';

export * as BodyClasses from './bodyClasses';

export * as BrowserDetect from './browserDetect';

export * as CreateElement from './createElement';

export * as Alert from './alert';

export * as string from './string';
