export Cache from './Cache';

export {
	extendDeep
} from './object';

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
	nonNull,
	seq
} from './async';

export {
	range,
	repeatWhile
} from './generator'

export {
	waitForEvent
} from './dom';

export * as bodyClasses from './bodyClasses';
