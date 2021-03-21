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
	frameDebounce,
	frameThrottle,
	throttleQueuePositionReset,
	idleThrottle,
	throttle,
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
	addDashboardTab,
} from './dashboard';

export {
	addCSS,
	click,
	elementInViewport,
	empty,
	getViewportSize,
	getHeaderOffset,
	getD2xBodyOffset,
	getPercentageVisibleYAxis,
	preventCloning,
	scrollToElement,
	waitForChild,
	waitForDescendant,
	waitForDescendantChange,
	watchForChildren,
	watchForFutureChildren,
	watchForDescendants,
	watchForFutureDescendants,
	waitForEvent,
	waitForAttach,
	waitForDetach,
} from './dom';

export {
	addFloater,
} from './floater';

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
} from './thingHide';

export {
	escapeHTML,
} from './html';

export {
	NAMED_KEYS,
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
} from './object';

export {
	indexOptionTable,
} from './options';

export {
	stopPageContextScript,
} from './pageContextScript';

export {
	markStart,
	markEnd,
} from './profiling';

export {
	maybePruneOldEntries,
	shouldPrune,
} from './storage';

export {
	fakeSubreddits,
	isFakeSubreddit,
} from './subreddits';

export {
	DAY,
	HOUR,
	MINUTE,
	WEEK,
	fromSecondsToTime,
} from './time';

export {
	isLoggedIn,
	getUserInfo,
	isModeratorAnywhere,
	loggedInUser,
	documentLoggedInUser,
	loggedInUserHash,
	usernameSelector,
	getUsernameFromLink,
} from './user';

export {
	firstValid,
} from './value';

export {
	registerPage,
	r2WatcherContentLoaded,
	r2WatcherContentStart,
	watchForElements,
	watchForThings,
} from './watchers';

export {
	initD2xWatcher,
	watchForRedditEvents,
} from './watchers_d2x';

export * as BodyClasses from './bodyClasses';

export * as BrowserDetect from './browserDetect';

export * as CreateElement from './createElement';

export * as Alert from './alert';

export * as PagePhases from './pagePhases';

export * as SelectedThing from './selectedThing';

export * as Table from './table';

export * as caseBuilder from './caseBuilder';

export * as string from './string';
