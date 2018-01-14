/* @flow */

export {
	LRUCache,
} from './Cache';

export {
	Thing,
} from './Thing';

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
	frameThrottleQueuePositionReset,
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
	empty,
	click,
	elementInViewport,
	getViewportSize,
	getHeaderOffset,
	getPercentageVisibleYAxis,
	scrollTo,
	scrollToElement,
	waitForChild,
	waitForDescendant,
	watchForChildren,
	watchForFutureChildren,
	watchForDescendants,
	watchForFutureDescendants,
	waitForEvent,
} from './dom';

export {
	downcast,
} from './flow';

export {
	range,
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
	formatRelativeTime,
} from './localization';

export {
	appType,
	currentDomain,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	execRegexes,
	isAppType,
	isCommentCode,
	isCurrentMultireddit,
	isCurrentSubreddit,
	isEmptyLink,
	isPageType,
	matchesPageLocation,
	matchesPageRegex,
	fullLocation,
	pageType,
	regexes,
} from './location';

export {
	numericalCompare,
	inverseOperator,
	prettyOperator,
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
	markStart,
	markEnd,
} from './profiling';

export {
	DAY,
	HOUR,
	MINUTE,
	WEEK,
	fromSecondsToTime,
} from './time';

export {
	getUserInfo,
	isModeratorAnywhere,
	loggedInUser,
	documentLoggedInUser,
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
