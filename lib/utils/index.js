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
	asyncFlow,
	fastAsync,
	batch,
	forEachChunked,
	frameThrottle,
	idleThrottle,
	keyedMutex,
	mutex,
	reifyPromise,
	waitFor,
} from './async';

export {
	colorFromArray,
	colorToArray,
} from './color';

export {
	addCSS,
	click,
	elementInViewport,
	getViewportSize,
	getHeaderOffset,
	getPercentageVisibleYAxis,
	observe,
	scrollTo,
	scrollToElement,
	waitForChild,
	waitForEvent,
} from './dom';

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
	mapScalarToObject,
} from './object';

export {
	indexOptionTable,
} from './options';

export {
	DAY,
	HOUR,
	MINUTE,
	WEEK,
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
	newSitetable,
	watchForElements,
	watchForThings,
} from './watchers';

export * as BodyClasses from './bodyClasses';

export * as BrowserDetect from './browserDetect';

export * as CreateElement from './createElement';

export * as Alert from './alert';

export * as string from './string';
