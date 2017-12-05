/* @flow */

import _ from 'lodash';
import elementResizeDetectorMaker from 'element-resize-detector';
import { filter, flow, keyBy, map, sortBy } from 'lodash/fp';
import { $ } from '../vendor';
import type {
	ExpandoMedia,
	GalleryMedia,
	ImageMedia,
	VideoMedia,
	AudioMedia,
	TextMedia,
	IframeMedia,
	GenericMedia,
} from '../core/host';
import { Host } from '../core/host';
import { Module } from '../core/module';
import {
	DAY,
	positiveModulo,
	downcast,
	Thing,
	addCSS,
	batch,
	CreateElement,
	elementInViewport,
	scrollToElement,
	forEachChunked,
	forEachSeq,
	idleThrottle,
	frameThrottle,
	isPageType,
	string,
	waitForEvent,
	watchForElements,
	getPercentageVisibleYAxis,
	getViewportSize,
} from '../utils';
import {
	addURLToHistory,
	ajax,
	download,
	isPrivateBrowsing,
	openNewTab,
	Permissions,
} from '../environment';
import * as Options from '../core/options';
import * as NeverEndingReddit from './neverEndingReddit';
import * as Notifications from './notifications';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';
import {
	audioTemplate,
	crosspostMetadataTemplate,
	galleryTemplate,
	imageTemplate,
	iframeTemplate,
	mediaControlsTemplate,
	siteAttributionTemplate,
	textTemplate,
	videoAdvancedTemplate,
} from './showImages/templates';
import {
	Expando,
	expandos,
	primaryExpandos,
} from './showImages/expando';
import type { ExpandoMediaElement } from './showImages/expando';

const hostsContext = (require: any).context('./hosts', false, /\.js$/);
const siteModules: { [string]: Host<any, any> } = flow(
	map(hostsContext),
	map(e => e.default),
	map(host => downcast(host, Host)), // ensure that all hosts are instances of `Host`
	keyBy(host => host.moduleID)
)(hostsContext.keys());
export const genericHosts: Host<any, any>[] = [siteModules.default, siteModules.defaultVideo, siteModules.defaultAudio];

export const module: Module<*> = new Module('showImages');

module.moduleName = 'showImagesName';
module.category = 'productivityCategory';
module.description = 'showImagesDesc';
module.bodyClass = true;
module.options = {
	mediaBrowse: {
		title: 'showImagesMediaBrowseTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesMediaBrowseDesc',
	},
	browsePreloadCount: {
		title: 'showImagesBrowsePreloadCountTitle',
		type: 'text',
		value: '1',
		description: 'showImagesBrowsePreloadCountDesc',
		dependsOn: options => options.mediaBrowse.value,
	},
	galleryPreloadCount: {
		title: 'showImagesGalleryPreloadCountTitle',
		type: 'text',
		value: '2',
		description: 'showImagesGalleryPreloadCountDesc',
	},
	conserveMemory: {
		title: 'showImagesConserveMemoryTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesConserveMemoryDesc',
	},
	bufferScreens: {
		title: 'showImagesBufferScreensTitle',
		type: 'text',
		value: '2',
		description: 'showImagesBufferScreensDesc',
		dependsOn: options => options.conserveMemory.value,
		advanced: true,
	},
	maxWidth: {
		title: 'showImagesMaxWidthTitle',
		type: 'text',
		value: '100%',
		description: 'showImagesMaxWidthDesc',
		advanced: true,
	},
	maxHeight: {
		title: 'showImagesMaxHeightTitle',
		type: 'text',
		value: '80%',
		description: 'showImagesMaxHeightDesc',
		advanced: true,
	},
	displayOriginalResolution: {
		title: 'showImagesDisplayOriginalResolutionTitle',
		type: 'boolean',
		value: false,
		description: 'showImagesDisplayOriginalResolutionDesc',
	},
	selfTextMaxHeight: {
		title: 'showImagesSelfTextMaxHeightTitle',
		type: 'text',
		value: '0',
		description: 'showImagesSelfTextMaxHeightDesc',
		advanced: true,
	},
	commentMaxHeight: {
		title: 'showImagesCommentMaxHeightTitle',
		type: 'text',
		value: '0',
		description: 'showImagesCommentMaxHeightDesc',
		advanced: true,
	},
	autoMaxHeight: {
		title: 'showImagesAutoMaxHeightTitle',
		type: 'boolean',
		value: false,
		description: 'showImagesAutoMaxHeightDesc',
		dependsOn: options => !!parseInt(options.selfTextMaxHeight.value, 10) || !!parseInt(options.commentMaxHeight.value, 10),
		advanced: true,
	},
	openInNewWindow: {
		title: 'showImagesOpenInNewWindowTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesOpenInNewWindowDesc',
	},
	hideNSFW: {
		title: 'showImagesHideNSFWTitle',
		type: 'boolean',
		value: false,
		description: 'showImagesHideNSFWDesc',
	},
	highlightNSFWButton: {
		title: 'showImagesHighlightNSFWButtonTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesHighlightNSFWButtonDesc',
		bodyClass: true,
	},
	highlightSpoilerButton: {
		title: 'showImagesHighlightSpoilerButtonTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesHighlightSpoilerButtonDesc',
		bodyClass: true,
	},
	imageZoom: {
		title: 'showImagesImageZoomTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesImageZoomDesc',
	},
	imageMove: {
		title: 'showImagesImageMoveTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesImageMoveDesc',
	},
	mediaControls: {
		title: 'showImagesMediaControlsTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesMediaControlsDesc',
	},
	mediaControlsPosition: {
		title: 'showImagesMediaControlsPositionTitle',
		dependsOn: options => options.mediaControls.value,
		type: 'enum',
		value: 'top-left',
		values: [{
			name: 'Top left',
			value: 'top-left',
		}, {
			name: 'Top right',
			value: 'top-right',
		}, {
			name: 'Bottom left.',
			value: 'bottom-left',
		}, {
			name: 'Bottom right.',
			value: 'bottom-right',
		}],
		description: 'showImagesMediaControlsPositionDesc',
	},
	clippy: {
		title: 'showImagesClippyTitle',
		dependsOn: options => options.mediaControls.value,
		type: 'boolean',
		value: true,
		description: 'showImagesClippyDesc',
	},
	crossposts: {
		title: 'showImagesCrosspostsTitle',
		description: 'showImagesCrosspostsDescription',
		type: 'enum',
		value: 'withMetadata',
		values: [{
			name: 'Do not replace Reddit crosspost expando',
			value: 'none',
		}, {
			name: 'Show with original post\'s metadata',
			value: 'withMetadata',
		}, {
			name: 'Show without metadata',
			value: 'plain',
		}],
	},
	displayImageCaptions: {
		title: 'showImagesDisplayImageCaptionsTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesDisplayImageCaptionsDesc',
		advanced: true,
		bodyClass: true,
	},
	captionsPosition: {
		title: 'showImagesCaptionsPositionTitle',
		dependsOn: options => options.displayImageCaptions.value,
		type: 'enum',
		value: 'titleAbove',
		values: [{
			name: 'Display all captions above image.',
			value: 'allAbove',
		}, {
			name: 'Display title and caption above image, credits below.',
			value: 'creditsBelow',
		}, {
			name: 'Display title above image, caption and credits below.',
			value: 'titleAbove',
		}, {
			name: 'Display all captions below image.',
			value: 'allBelow',
		}],
		description: 'showImagesCaptionsPositionDesc',
		advanced: true,
		bodyClass: true,
	},
	markVisited: {
		title: 'showImagesMarkVisitedTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesMarkVisitedDesc',
		advanced: true,
	},
	markSelftextVisited: {
		title: 'showImagesMarkSelftextVisitedTitle',
		dependsOn: options => options.markVisited.value,
		type: 'boolean',
		value: false,
		description: 'showImagesMarkSelftextVisitedDesc',
		advanced: true,
	},
	sfwHistory: {
		title: 'showImagesSfwHistoryTitle',
		dependsOn: options => options.markVisited.value,
		type: 'enum',
		value: 'add',
		values: [{
			name: 'Add links to history',
			value: 'add',
		}, {
			name: 'Color links, but do not add to history',
			value: 'color',
		}, {
			name: 'Do not add or color links.',
			value: 'none',
		}],
		description: 'showImagesSfwHistoryDesc',
	},
	galleryRememberWidth: {
		title: 'showImagesGalleryRememberWidthTitle',
		dependsOn: options => options.imageZoom.value,
		type: 'boolean',
		value: true,
		description: 'showImagesGalleryRememberWidthDesc',
	},
	galleryAsFilmstrip: {
		title: 'showImagesGalleryAsFilmstripTitle',
		type: 'boolean',
		value: false,
		description: 'showImagesGalleryAsFilmstripDesc',
	},
	filmstripLoadIncrement: {
		title: 'showImagesFilmstripLoadIncrementTitle',
		dependsOn: options => options.galleryAsFilmstrip.value,
		type: 'text',
		value: '30',
		description: 'showImagesFilmstripLoadIncrementDesc',
	},
	useSlideshowWhenLargerThan: {
		title: 'showImagesUseSlideshowWhenLargerThanTitle',
		dependsOn: options => options.galleryAsFilmstrip.value,
		type: 'text',
		value: '0',
		description: 'showImagesUseSlideshowWhenLargerThanDesc',
	},
	convertGifstoGfycat: {
		title: 'showImagesConvertGifstoGfycatTitle',
		type: 'boolean',
		value: false,
		description: 'showImagesConvertGifstoGfycatDesc',
	},
	showViewImagesTab: {
		title: 'showImagesShowViewImagesTabTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesShowViewImagesTabDesc',
	},
	autoExpandTypes: {
		title: 'showImagesAutoExpandTypesTitle',
		type: 'enum',
		value: 'any',
		values: [{
			name: 'Images (but occasionally also .gif)',
			value: 'image',
		}, {
			name: 'Images, text',
			value: 'image text',
		}, {
			name: 'Images, text, galleries, and muted videos',
			value: 'image text gallery video',
		}, {
			name: 'All muted expandos (includes iframes)',
			value: 'any',
		}],
		description: 'showImagesAutoExpandTypesDesc',
	},
	autoExpandSelfText: {
		title: 'showImagesAutoExpandSelfTextTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesAutoExpandSelfTextDesc',
	},
	autoExpandSelfTextFirstVisibleNonMuted: {
		title: 'showImagesAutoExpandSelfTextFirstVisibleNonMutedTitle',
		dependsOn: options => options.autoExpandSelfText.value,
		type: 'boolean',
		value: true,
		description: 'showImagesAutoExpandSelfTextFirstVisibleNonMutedDesc',
	},
	autoExpandSelfTextNSFW: {
		title: 'showImagesAutoExpandSelfTextNSFWTitle',
		dependsOn: options => options.autoExpandSelfText.value,
		type: 'boolean',
		value: false,
		description: 'showImagesAutoExpandSelfTextNSFWDesc',
	},
	showSiteAttribution: {
		title: 'showImagesShowSiteAttributionTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesShowSiteAttributionDesc',
	},
	expandoCommentRedirects: {
		title: 'showImagesExpandoCommentRedirectsTitle',
		type: 'enum',
		value: 'expando',
		values: [{
			name: 'Do nothing',
			value: 'nothing',
		}, {
			name: 'Create expandos',
			value: 'expando',
		}, {
			name: 'Create expandos, redirect the link back to the image',
			value: 'rewrite',
		}],
		description: 'showImagesExpandoCommentRedirectsDesc',
	},
	showVideoControls: {
		title: 'showImagesShowVideoControlsTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesShowVideoControlsDesc',
	},
	onlyPlayMutedWhenVisible: {
		title: 'showImagesOnlyPlayMutedWhenVisibleTitle',
		dependsOn: options => options.showVideoControls.value,
		type: 'boolean',
		value: true,
		description: 'showImagesOnlyPlayMutedWhenVisibleDesc',
	},
	maxSimultaneousPlaying: {
		title: 'showImagesMaxSimultaneousPlayingTitle',
		dependsOn: options => options.showVideoControls.value,
		type: 'text',
		value: '0',
		description: 'showImagesMaxSimultaneousPlayingDesc',
	},
	autoplayVideo: {
		title: 'showImagesAutoplayVideoTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesAutoplayVideoDesc',
	},
	...Object.values(siteModules).reduce((options, siteModule) => {
		// Ignore default
		if (genericHosts.includes(siteModule)) return options;

		// Create on/off options
		options[siteModuleOptionKey(siteModule)] = {
			title: siteModule.name,
			description: 'showImagesHostToggleDesc',
			value: true,
			type: 'boolean',
		};

		// Find out if module has any additional options - if it does add them
		Object.assign(options, siteModule.options);

		return options;
	}, {}),
};
module.exclude = [
	/^\/ads\/[\-\w\._\?=]*/i,
	'submit',
	/^\/subreddits/i,
	'd2x',
];

module.beforeLoad = () => {
	const selfTextMaxHeight = parseInt(module.options.selfTextMaxHeight.value, 10);
	if (selfTextMaxHeight) {
		// Strange selector necessary to select tumblr expandos, etc.
		addCSS(`
			.selftext.expanded ~ * .md {
				max-height: ${selfTextMaxHeight}px;
				overflow-y: auto !important;
				position: relative;
			}
		`);
	}

	const commentMaxHeight = parseInt(module.options.commentMaxHeight.value, 10);
	if (commentMaxHeight) {
		addCSS(`
			.comment .md {
				max-height: ${commentMaxHeight}px;
				overflow-y: auto !important;
				position: relative;
			}
		`);
	}

	watchForElements(['siteTable'], getSelector(), checkElementForMedia);
	watchForElements(['selfText', 'newComments'], getSelector(true), checkElementForMedia);
};

function getSelector(isSelfText) {
	// get elements common across all pages first...
	// if we're on a comments page, get those elements too...
	if (isPageType('comments', 'commentsLinklist', 'profile')) {
		return '#siteTable a.title, .expando .usertext-body > div.md a, .content .usertext-body > div.md a';
	} else if (isSelfText) {
		// We're scanning newly opened (from an expando) selftext...
		return '.usertext-body > div.md a';
	} else if (isPageType('wiki')) {
		return '.wiki-page-content a';
	} else if (isPageType('inbox')) {
		return '#siteTable div.entry .md a';
	} else if (isPageType('search')) {
		return '#siteTable a.title, .contents a.search-link';
	} else {
		return '#siteTable a.title, #siteTable_organic a.title';
	}
}

const elementResizeDetector = _.once(() => elementResizeDetectorMaker({ strategy: 'object' }));

module.go = () => {
	createImageButtons();

	if (module.options.mediaBrowse.value) {
		SelectedEntry.addListener(mediaBrowse, 'beforeScroll');
	}

	// Handle spotlight next/prev hiding open expando's
	const spotlight = document.querySelector('#siteTable_organic');
	if (spotlight) {
		const nextprev = spotlight.querySelector('.nextprev');
		if (nextprev) {
			nextprev.addEventListener('click', () => {
				const open = spotlight.querySelector('.expando-button.expanded');
				if (open) open.click();
			});
		}
	}
};

module.afterLoad = () => {
	if (module.options.conserveMemory.value) {
		enableConserveMemory();
	}

	enableCompleteDeferredLinks();
};

function siteModuleOptionKey(siteModule) {
	const id = siteModule.moduleID;
	return `display_${id}`;
}

function isSiteModuleEnabled(siteModule) {
	const key = siteModuleOptionKey(siteModule);
	return !module.options[key] || module.options[key].value;
}

// A missing subdomain matches all subdomains, for example:
// A module with `domains: ['example.com']` will match `www.example.com` and `example.com`
// A module with `domains: ['www.example.com']` will match only `www.example.com`
const modulesForHostname = _.memoize(hostname => {
	const hostComponents = hostname.split('.');

	return Object.values(siteModules).filter(siteModule => (
		isSiteModuleEnabled(siteModule) &&
		siteModule.domains.some(domain => {
			const domainComponents = domain.split('.');
			return _.isEqual(domainComponents, _.takeRight(hostComponents, domainComponents.length));
		})
	));
});

const deferredLinks: Map<HTMLElement, () => void> = new Map();

const mediaStates = {
	NONE: 0,
	LOADED: 1,
	UNLOADED: 2,
};

const resizeSources = {
	OTHER: 0,
	KEEP_VISIBLE: 1,
	USER_MOVE: 2,
};

const checkDeferredLinks = frameThrottle(() => {
	for (const [link, complete] of deferredLinks) {
		const thing = Thing.from(link);
		if (!thing || thing.isVisible()) complete();
	}
});

function enableCompleteDeferredLinks() {
	window.addEventListener('scroll', checkDeferredLinks);
	// not using element-resize-detector because it sets the target to `position: relative`, breaking some stylesheets (/r/nba)
	window.addEventListener('resize', checkDeferredLinks);
}

export const thingExpandoBuildListeners: * = $.Callbacks('unique');

/**
 * enableConserveMemory
 * attempt to unload collapsed expando's & images that are off screen in order
 * to save memory
 *
 * @returns {void}
 */
function enableConserveMemory() {
	const rootMargin = `${100 * (parseInt(module.options.bufferScreens.value, 10) || 2)}%`;

	const mediaMap = new WeakMap();
	const ioMedia = new IntersectionObserver(entries => {
		for (const entry of entries) {
			const expando = downcast(mediaMap.get(entry.target), Expando);
			if (expando.open && expando.media) lazyUnload(expando.media, entry.isIntersecting);
		}
	}, { rootMargin });

	const buttonMap = new WeakMap();
	const ioButton = new IntersectionObserver(entries => {
		for (const entry of entries) {
			const expando = downcast(buttonMap.get(entry.target), Expando);
			if (!entry.isIntersecting && !expando.open) {
				// $FlowIssue fixed for future Flow release
				ioMedia.unobserve(expando.media);
				// $FlowIssue fixed for future Flow release
				ioButton.unobserve(expando.button);
				expando.empty();
			}
		}
	}, { rootMargin });

	window.addEventListener('scroll', _.debounce(idleThrottle(() => {
		// Running this can conflict with partially-ready expandos, as is the case
		// while NER is ready-ing a new page
		if (NeverEndingReddit.loadPromise) return;

		const activeExpandos = Array.from(primaryExpandos.values());

		for (const expando of activeExpandos) {
			if (expando.isAttached()) {
				if (expando.media) {
					if (expando.open) {
						ioMedia.observe(expando.media);
						mediaMap.set(expando.media, expando);
					} else {
						ioButton.observe(expando.button);
						buttonMap.set(expando.button, expando);
					}
				}
			} else {
				expando.destroy();
			}
		}
	}), 1000));
}

function lazyUnload(media: ExpandoMediaElement, keepLoaded: boolean) {
	if (!media.unload || !media.restore) return;

	if (/*:: media.restore && */ keepLoaded && media.state === mediaStates.UNLOADED) {
		media.restore();
	} else if (/*:: media.unload && */ !keepLoaded && media.state !== mediaStates.UNLOADED) {
		media.unload();
	}
}

let viewImagesButton;
let autoExpandActive = false;
let mediaBrowseModeActive = false;

export function toggleViewImages() {
	viewImagesButton.click();
}

function createImageButtons() {
	if (module.options.showViewImagesTab.value) {
		viewImagesButton = CreateElement.tabMenuItem({
			text: 'show images',
			className: 'res-show-images',
			aftercontent: ' (0)', // initial count…
		});

		viewImagesButton.addEventListener('change', e => {
			autoExpandActive = (e: any).detail;
			// When activated, open the new ones in addition to the ones already open
			// When deactivated, close all which are open
			updateRevealedImages({ onlyOpen: autoExpandActive });
		});
	}
}

export function refresh() {
	checkDeferredLinks();
	updateAutoExpandCount();
}

const updateAutoExpandCount = _.debounce(() => {
	if (!viewImagesButton) return;

	const count = Array.from(primaryExpandos.values())
		.filter(expando => expando.isAttached() && expando.button.offsetParent &&
			isExpandWanted(expando, { autoExpand: true }))
		.length;

	requestAnimationFrame(() => viewImagesButton.setAttribute('aftercontent', ` (${count})`));
}, 200);

const updateRevealedImages = _.debounce(({ onlyOpen = false } = {}) => {
	flow(
		Array.from,
		filter(expando => expando.isAttached() && expando.button.offsetParent),
		sortExpandosVertically,
		forEachChunked(expando => {
			const open = isExpandWanted(expando);
			if (open) expando.expand();
			else if (!onlyOpen) expando.collapse();
		})
	)(primaryExpandos.values());
}, 100, { leading: true });

const sortExpandosVertically = sortBy(v => v.button.getBoundingClientRect().top);

export function toggleThingExpandos(thing: Thing, { scrollOnToggle, isUserAction }: {| scrollOnToggle?: boolean, isUserAction?: boolean |} = {}): void {
	const expandos = Expando.getAllExpandosFrom(thing);
	if (!expandos.length) return;

	const openExpandos = expandos.filter(v => v.open);

	// If any open expandos exists within thing, collapse all
	// Else, expand all
	if (openExpandos.length) {
		for (const expando of openExpandos) expando.collapse();

		if (scrollOnToggle) scrollToElement(thing.entry, { scrollStyle: 'directional' });
	} else {
		for (const expando of expandos) {
			if (
				!(expando instanceof Expando) ||
				isExpandWanted(expando, { thing, autoExpandFirstVisibleNonMutedInThing: true, autoExpand: true, autoExpandTypes: [], ignoreDuplicatesScope: thing.entry })
			) {
				if (isUserAction && expando.unlock) expando.unlock();
				expando.expand();
			}
		}

		if (scrollOnToggle) scrollToElement(thing.entry, { scrollStyle: 'top' });
	}
}

// idleThrottle since this is low-priority
const preloadExpandos = idleThrottle((fromThing, direction, preloadCount = parseInt(module.options.browsePreloadCount.value, 10)) => {
	const pieces = [];
	let target = fromThing;

	do {
		const expando = Expando.getEntryExpandoFrom(target);
		if (expando && expando instanceof Expando) pieces.push(expando);
	} while ((target = target.getNext({ direction })) && pieces.length <= preloadCount);

	preloadMedia(pieces);
});

function mediaBrowse(selected, unselected, options) {
	if (!selected || !options.allowMediaBrowse || autoExpandActive) return;

	const oldExpando = Expando.getEntryExpandoFrom(unselected);
	const newExpando = Expando.getEntryExpandoFrom(selected);

	if (oldExpando) {
		mediaBrowseModeActive = oldExpando.expandWanted || oldExpando.open;
		oldExpando.collapse();
	}

	if (mediaBrowseModeActive && newExpando) {
		newExpando.expand();
		options.scrollStyle = 'top';

		preloadExpandos(selected, options.direction);
	}
}

function hasEntryAnyExpandedNonMuted(thing) {
	return Expando.getTextExpandosFrom(thing).some(expando =>
		expando.getTypes().includes('non-muted') && (expando.open || expando.expandWanted)
	);
}

export const types = ['selftext', 'video', 'image', 'iframe', 'gallery', 'native', 'muted', 'non-muted'];

export function matchesTypes(wantedTypes: string[], expandoTypes: string[] = types): boolean {
	return !wantedTypes.length || !!_.intersection(expandoTypes, wantedTypes).length;
}

function isExpandWanted(expando: Expando, {
	thing,
	autoExpand = autoExpandActive,
	autoExpandTypes = module.options.autoExpandTypes.value.replace('any', '').split(' ').filter(Boolean),
	ignoreDuplicates = true,
	ignoreDuplicatesScope,
	onlyExpandMuted = true,
	autoExpandFirstVisibleNonMutedInThing = false,
}: {|
	thing?: ?Thing,
	autoExpand?: boolean,
	autoExpandTypes?: string[],
	ignoreDuplicates?: boolean,
	ignoreDuplicatesScope?: HTMLElement,
	onlyExpandMuted?: boolean,
	autoExpandFirstVisibleNonMutedInThing?: boolean,
|} = {}) {
	if (ignoreDuplicates && !expando.isPrimary()) {
		if (!ignoreDuplicatesScope) return false;
		const primary = expando.getPrimary();
		if (primary && ignoreDuplicatesScope.contains(primary.button)) return false;
	}

	const expandoTypes = expando.getTypes();
	const expandoIsNonMuted = expandoTypes.includes('non-muted');

	const typeCriteriaOK = matchesTypes(autoExpandTypes, expandoTypes);
	const muteCriteriaOK = !(onlyExpandMuted && expandoIsNonMuted) ||
		(autoExpandFirstVisibleNonMutedInThing && elementInViewport(expando.button) && !hasEntryAnyExpandedNonMuted(thing));

	return autoExpand && muteCriteriaOK && typeCriteriaOK;
}

async function convertGifToVideo(options) {
	try {
		const info = await ajax({
			type: 'json',
			url: 'https://upload.gfycat.com/transcodeRelease',
			query: { fetchUrl: options.src },
			cacheFor: DAY,
		});

		if (!info.gfyName) throw new Error('gfycat transcode did not contain "gfyName"');

		return {
			options: await (siteModules.gfycat: any).handleLink('', [], info),
			siteModule: siteModules.gfycat,
		};
	} catch (e) {
		throw new Error(`Could not convert gif to video ${options.src}: ${e}`);
	}
}

function resolveMediaUrl(element, thing) {
	if (
		module.options.expandoCommentRedirects.value !== 'nothing' &&
		thing &&
		element.classList.contains('title')
	) {
		const dataUrl = thing.element.getAttribute('data-url');
		const fullDataUrl = dataUrl && new URL(dataUrl, location.href);
		if (fullDataUrl && fullDataUrl.href !== thing.getCommentsLink().href) {
			return fullDataUrl;
		}
	}

	return new URL(element.href, location.href);
}


function promptSiteModulePermissions({ name, permissions = [] }) {
	const urlStripRe = /((?:\w+\.)+\w+)(?=\/|$)/i;
	Notifications.showNotification({
		header: 'Permission required',
		moduleID: 'permissions',
		closeDelay: 20000,
		message: `
			<p>In order to inline expand content from ${name}, RES needs permission to access these sites:</p>
			<p>${permissions.map(url => `<code>${urlStripRe.exec(url)[0]}</code>`).join(', ')}</p>
			<p>Be assured RES does not access/modify any of your information on these domains - it only accesses the public API.</p>
		`,
	});
	return Permissions.request(permissions);
}

const generateSiteModuleLock = _.memoize(siteModule => {
	if (!siteModule.permissions) return {};

	let resolveLock;
	return {
		unlock: async () => {
			if (resolveLock) await promptSiteModulePermissions(siteModule).then(resolveLock);
			resolveLock = null;
		},
		lock: Permissions.has(siteModule.permissions).then(hasPermission => {
			if (!hasPermission) return new Promise(resolve => { resolveLock = resolve; });
		}),
	};
});

function getMediaInfo(element, mediaUrl, thing) {
	const matchingHosts = [
		...modulesForHostname(mediaUrl.hostname),
		...genericHosts,
	];

	for (const siteModule of matchingHosts) {
		const detectResult = siteModule.detect(mediaUrl, thing);
		if (detectResult) {
			const permissions = generateSiteModuleLock(siteModule);
			return { detectResult, siteModule, permissions, element, href: mediaUrl.href };
		}
	}
}

const scannedLinks: WeakMap<HTMLAnchorElement, boolean | Expando> = new WeakMap();
export function getLinkExpando(link: HTMLAnchorElement): ?Expando {
	const expando = scannedLinks.get(link);
	if (expando instanceof Expando) return expando;
}

const inText = element => !!element.closest('.md, .search-result-footer');

async function checkElementForMedia(element) {
	const thing = Thing.from(element);

	if (
		thing && !thing.isVisible() && // No need to complete building non-visible expandos
		// Unless they are hidden because because of the expando filter
		!(thing.filter && thing.filter.key === 'hasExpando') // XXX: Dirty
	) {
		await new Promise(resolve => deferredLinks.set(element, resolve));
		deferredLinks.delete(element);
	}

	const entryExpando = !inText(element) && Expando.getEntryExpandoFrom(thing);
	const nativeExpando = entryExpando instanceof Expando ? null : entryExpando;

	if (module.options.hideNSFW.value && thing && thing.isNSFW()) {
		if (nativeExpando) nativeExpando.detach();
		return;
	}

	if (nativeExpando) {
		trackNativeExpando(nativeExpando, element, thing);

		if (nativeExpando.open) {
			console.log('Native expando has already been opened; skipping.', element.href);
			return;
		}
	}

	const mediaUrl = resolveMediaUrl(element, thing);
	const mediaInfo = getMediaInfo(element, mediaUrl, thing);

	if (!mediaInfo) return;

	if (thing.isCrosspost() && module.options.crossposts.value === 'none') {
		return;
	}

	if (mediaUrl && module.options.expandoCommentRedirects.value === 'rewrite') {
		element.href = mediaUrl.href;
		element.removeAttribute('data-inbound-url');
	}

	const { lock = null, unlock = null } = mediaInfo.permissions;

	const expando = new Expando(lock, unlock);
	expandos.set(expando.button, expando);
	scannedLinks.set(element, expando);

	expando.button.setAttribute('data-host', mediaInfo.siteModule.moduleID);

	expando.button.addEventListener('click', () => {
		if (expando.unlock) expando.unlock();
		expando.toggle({ scrollOnMoveError: true });
	});

	if (nativeExpando) nativeExpando.detach();
	placeExpando(expando, element, thing);

	if (thing) thingExpandoBuildListeners.fire(thing);

	await lock;

	try {
		await completeExpando(expando, thing, mediaInfo);
	} catch (e) {
		console.error(`showImages: could not create expando for ${mediaInfo.href}`);
		console.error(e);

		if (nativeExpando) nativeExpando.reattach();
		expando.destroy();
		scannedLinks.set(element, true);
	}

	if (thing) thingExpandoBuildListeners.fire(thing);
}

function placeExpando(expando, element, thing) {
	if (!inText(element) && thing && thing.getTitleElement()) {
		$(expando.button).insertAfter(element.parentElement);
		thing.entry.appendChild(expando.box);
	} else {
		$(element).add($(element).next('.keyNavAnnotation')).last()
			.after(expando.box)
			.after($('<span class="res-freetext-expando">').append(expando.button));
	}
}

async function completeExpando(expando, thing, mediaInfo) {
	const options = await retrieveExpandoOptions(thing, mediaInfo);

	expando.href = options.href;
	expando.generateMedia = options.generateMedia;
	expando.mediaOptions = options.mediaOptions;
	expando.onMediaAttach = options.onMediaAttach;

	const hideButton = thing && thing.getHideElement();
	if (hideButton) hideButton.addEventListener('click', () => { expando.destroy(); });

	if (thing && thing.isComment()) {
		const $thing = $(thing.element);
		expando.onExpand(_.once(() => {
			let wasOpen;

			// Execute expando toggle procedure when comment collapse / expand
			$thing
				.parents('.comment')
				.addBack()
				.find('> .entry .tagline > .expand, > .entry > .buttons .toggleChildren')
				.click(() => {
					if (expando.button.offsetParent) {
						if (wasOpen) expando.expand();
					} else {
						wasOpen = expando.open;
						if (expando.open) expando.collapse();
					}

					updateAutoExpandCount();
				});
		}));
	}

	if (module.options.autoMaxHeight.value && thing && inText(expando.button)) {
		thing.entry.addEventListener('mediaResize', updateParentHeight);
	}

	if (!expando.expandWanted) {
		let autoExpand;
		let autoExpandFirstVisibleNonMutedInThing;

		if (module.options.autoExpandSelfText.value && inText(expando.button) && thing && thing.isSelfPost() && !isPageType('comments')) {
			const dontAutoExpandNSFW = !module.options.autoExpandSelfTextNSFW.value && thing.isNSFW();
			autoExpand = !dontAutoExpandNSFW;
			autoExpandFirstVisibleNonMutedInThing = module.options.autoExpandSelfTextFirstVisibleNonMuted.value;
		}

		expando.expandWanted = isExpandWanted(expando, { thing, autoExpand, autoExpandFirstVisibleNonMutedInThing });
	}

	requestAnimationFrame(() => expando.initialize());

	updateAutoExpandCount();
}

const retrieveExpandoOptions = _.memoize(async (thing, { siteModule, detectResult, element, href }) => {
	let mediaOptions = await siteModule.handleLink(href, detectResult);

	if (module.options.convertGifstoGfycat.value &&
		mediaOptions.type === 'IMAGE' &&
		(/^(http|https|ftp):\/\/.*\.gif($|\/?)/).test(mediaOptions.src)
	) {
		try {
			({ options: mediaOptions, siteModule } = await convertGifToVideo(mediaOptions));
		} catch (e) {
			console.log(e);
		}
	}

	if (mediaOptions.title && thing && string.areSimilar(mediaOptions.title, thing.getTitle())) {
		mediaOptions.title = '';
	}

	if (module.options.crossposts.value === 'withMetadata' && thing.isCrosspost()) {
		mediaOptions.crosspostData = thing.element.dataset;
	}

	const attribution = module.options.showSiteAttribution.value &&
		thing && thing.isPost() && !thing.isSelfPost() &&
		siteModule.domains.length && siteModule.attribution !== false;

	const isMuted = media => media.muted || ['IMAGE', 'TEXT'].includes(media.type);

	const trackLoad = _.once(() => trackMediaLoad(element, thing));

	return {
		href, // Since mediaOptions.href may be overwritten
		mediaOptions: {
			href,
			muted: mediaOptions.type === 'GALLERY' ? mediaOptions.src.every(isMuted) : isMuted(mediaOptions),
			moduleID: (siteModule && siteModule.moduleID) ? siteModule.moduleID : 'unknown',
			buttonInfo: getMediaButtonInfo(mediaOptions),
			...mediaOptions,
		},
		generateMedia() {
			const element = generateMedia(mediaOptions, { href });
			if (attribution) addSiteAttribution(siteModule, element);
			return element;
		},
		onMediaAttach() {
			trackLoad();
			if (mediaOptions.onAttach) mediaOptions.onAttach();
		},
	};
}, (thing, { href }) => href);

function updateParentHeight(e) {
	const thing = Thing.from(e.target);

	if (!thing) return;

	const basisHeight = (
		thing.isSelfPost() && parseInt(module.options.selfTextMaxHeight.value, 10) ||
		thing.isComment() && parseInt(module.options.commentMaxHeight.value, 10) ||
		0
	);

	if (basisHeight > 0) {
		// .expando-button causes a line break
		const expandoHeight = Array
			.from(thing.entry.querySelectorAll('.res-expando-box, .expando-button.expanded'))
			.reduce((a, b) => a + b.getBoundingClientRect().height, 0);

		thing.element.querySelector('.md').style.maxHeight = `${basisHeight + expandoHeight}px`;
	}
}

function trackNativeExpando(expando, element, thing) {
	if (!module.options.markSelftextVisited.value && expando.button.classList.contains('selftext')) return;

	const trackLoad = _.once(() => trackMediaLoad(element, thing));

	if (expando.open) trackLoad();
	else expando.button.addEventListener('click', trackLoad);
}

function getMediaButtonInfo(options) {
	let title = '';

	let type = options.type;

	if (options.type === 'GALLERY') {
		if (options.src.length === 1) {
			type = options.src[0].type;
		} else {
			title += `${options.src.length} items in gallery`;
		}
	}

	const defaultClass = {
		IMAGE: 'image',
		GALLERY: 'image gallery',
		TEXT: 'selftext',
		VIDEO: options.muted ? 'video-muted' : 'video',
		IFRAME: options.muted ? 'video-muted' : 'video',
		AUDIO: 'video', // yes, still class "video", that's what reddit uses.
		GENERIC_EXPANDO: 'selftext',
	}[type];

	return {
		title,
		mediaClass: options.expandoClass || defaultClass,
	};
}

let lastPreloadIndex = 0;
function preloadMedia(pieces) {
	// Avoid potentially unwanted side-effects by only allowing one concurrent preload sequence
	const index = ++lastPreloadIndex;

	return forEachSeq(pieces, piece => {
		if (!piece.generateMedia) return;
		if (lastPreloadIndex !== index) return;

		piece.media = piece.media || piece.generateMedia();
		return piece.media.ready;
	});
}

function generateMedia(options: ExpandoMedia, context: {| href: string |}) {
	const $span = $('<span>');
	if (options.credits) options.credits = $span.safeHtml(options.credits).html();
	if (options.caption) options.caption = $span.safeHtml(options.caption).html();

	let element;

	switch (options.type) {
		case 'GALLERY':
			element = generateGallery(options, context);
			break;
		case 'IMAGE':
			element = generateImage(options, context);
			break;
		case 'TEXT':
			element = generateText(options);
			break;
		case 'IFRAME':
			element = generateIframe(options);
			break;
		case 'VIDEO':
			element = generateVideo(options, context);
			break;
		case 'AUDIO':
			element = generateAudio(options);
			break;
		case 'GENERIC_EXPANDO':
			element = generateGeneric(options);
			break;
		default:
			throw new Error(`Unreachable: invalid media type ${options.type}`);
	}

	if (options.crosspostData) {
		try {
			element.prepend(crosspostMetadataTemplate(options.crosspostData));
		} catch (e) {
			console.error(`showImages: could not create crosspost metadata expando for ${context.href}`, e);
		}
	}

	return element;
}

function generateGallery(options: GalleryMedia, context) {
	const element: ExpandoMediaElement = (galleryTemplate({
		title: options.title,
		caption: options.caption,
		credits: options.credits,
		src: options.src,
	}): any);

	const piecesContainer = element.querySelector('.res-gallery-pieces');
	const individualCtrl = element.querySelector('.res-gallery-individual-controls');
	const ctrlPrev = individualCtrl.querySelector('.res-gallery-previous');
	const ctrlNext = individualCtrl.querySelector('.res-gallery-next');
	const msgPosition = individualCtrl.querySelector('.res-gallery-position');
	const ctrlToFilmstrip = individualCtrl.querySelector('.res-gallery-to-filmstrip');
	const ctrlConcurrentIncrease = element.querySelector('.res-gallery-increase-concurrent');

	const preloadCount = parseInt(module.options.galleryPreloadCount.value, 10) || 0;

	const filmstripLoadIncrement = parseInt(module.options.filmstripLoadIncrement.value, 10) || Infinity;
	const slideshowWhenLargerThan = parseInt(module.options.useSlideshowWhenLargerThan.value, 10) || Infinity;
	const filmstripActive = module.options.galleryAsFilmstrip.value &&
		options.src.length < slideshowWhenLargerThan;

	const pieces: Array<{
		generateMedia: () => ExpandoMediaElement,
		media: ?ExpandoMediaElement,
	}> = options.src.map(src => ({
		generateMedia: () => generateMedia(src, context),
		media: null,
	}));
	let lastRevealedPiece = null;

	const rememberResizeWidth = module.options.galleryRememberWidth.value && !filmstripActive;
	let lastResizedWidth;

	function rememberWidth(piece) {
		const resizedElement = piece.media && piece.media.querySelector('.res-media-zoomable');
		// Only resized elements have style.width
		const resizedWidth = resizedElement && parseInt(resizedElement.style.width, 10);
		if (resizedWidth) lastResizedWidth = resizedWidth;
	}

	function restoreWidth(piece) {
		if (!lastResizedWidth) return;
		const resizeElement = piece.media && piece.media.querySelector('.res-media-zoomable');
		if (resizeElement) resizeMedia(resizeElement, lastResizedWidth);
	}

	function revealPiece(piece) {
		if (rememberResizeWidth && lastRevealedPiece) rememberWidth(lastRevealedPiece);
		lastRevealedPiece = piece;

		piece.media = piece.media || piece.generateMedia();
		const { media } = piece;
		if (!media.parentElement) {
			const block = document.createElement('div');
			block.appendChild(media);
			piecesContainer.appendChild(block);
		}
		(media.parentElement: any).hidden = false;
		if (rememberResizeWidth) restoreWidth(piece);
		if (media.expand) media.expand();
	}

	function preloadAhead() {
		const preloadFrom = pieces.indexOf((lastRevealedPiece: any));
		const preloadTo = Math.min(preloadFrom + preloadCount + 1, pieces.length);

		return preloadMedia(pieces.slice(preloadFrom, preloadTo));
	}

	async function expandFilmstrip() {
		const revealFrom = lastRevealedPiece ? pieces.indexOf(lastRevealedPiece) : 0;
		const revealTo = Math.min(revealFrom + filmstripLoadIncrement, pieces.length);

		ctrlConcurrentIncrease.hidden = true;

		// reveal new pieces
		await forEachSeq(pieces.slice(revealFrom, revealTo), piece => {
			revealPiece(piece);
			return piece.media && piece.media.ready;
		});

		if (revealTo < pieces.length) {
			ctrlConcurrentIncrease.innerText = `Show next ${Math.min(filmstripLoadIncrement, pieces.length - revealTo)} pieces`;
			ctrlConcurrentIncrease.hidden = false;
		}

		return preloadAhead();
	}

	function changeSlideshowPiece(step) {
		const lastRevealedPieceIndex = lastRevealedPiece ? pieces.indexOf(lastRevealedPiece) : 0;
		const previousMedia = lastRevealedPiece && lastRevealedPiece.media;

		let newIndex = lastRevealedPieceIndex + step;
		// Allow wrap-around
		newIndex = positiveModulo(newIndex, pieces.length);

		individualCtrl.setAttribute('first-piece', String(newIndex === 0));
		individualCtrl.setAttribute('last-piece', String(newIndex === pieces.length - 1));
		msgPosition.innerText = String(newIndex + 1);

		revealPiece(pieces[newIndex]);

		if (previousMedia) {
			const removeInstead = previousMedia.collapse && previousMedia.collapse();
			if (removeInstead) {
				previousMedia.remove();
			} else {
				(previousMedia.parentElement: any).hidden = true;
			}
		}

		if (module.options.conserveMemory.value) {
			const first = newIndex - preloadCount;
			const last = newIndex + preloadCount;

			for (const [index, { media }] of pieces.entries()) {
				if (!media) continue;

				const keepLoaded = last > pieces.length && last % pieces.length >= index ||
					first < 0 && positiveModulo(first, pieces.length) <= index ||
					index >= first && index <= last;

				lazyUnload(media, keepLoaded);
			}
		}

		return preloadAhead();
	}

	let initialLoadPromise;
	if (filmstripActive || pieces.length === 1) {
		initialLoadPromise = expandFilmstrip();
		ctrlConcurrentIncrease.addEventListener('click', expandFilmstrip);
	} else {
		element.classList.add('res-gallery-slideshow');
		initialLoadPromise = changeSlideshowPiece(0);
		ctrlPrev.addEventListener('click', () => { changeSlideshowPiece(-1); });
		ctrlNext.addEventListener('click', () => { changeSlideshowPiece(1); });

		waitForEvent(ctrlToFilmstrip, 'click').then(() => {
			expandFilmstrip();
			ctrlConcurrentIncrease.addEventListener('click', expandFilmstrip);
			element.classList.remove('res-gallery-slideshow');
		});
	}

	element.ready = initialLoadPromise;

	return element;
}

function generateImage(options: ImageMedia, context) {
	const element: ExpandoMediaElement = (imageTemplate({
		title: options.title,
		caption: options.caption,
		credits: options.credits,
		src: options.src,
		href: options.href || context.href,
		openInNewWindow: module.options.openInNewWindow.value,
	}): any);
	const image: HTMLImageElement = (element.querySelector('img.res-image-media'): any);
	const anchor = element.querySelector('a.res-expando-link');

	const transparentGif = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	element.state = mediaStates.NONE;

	image.addEventListener('error', () => {
		element.classList.add('res-media-load-error');
		image.title = '';

		element.emitResizeEvent();
	});
	image.addEventListener('load', () => {
		if (element.state !== mediaStates.UNLOADED) element.emitResizeEvent();
		if (element.state === mediaStates.NONE) {
			if (module.options.displayOriginalResolution.value && image.naturalWidth && image.naturalHeight) {
				image.title = `${image.naturalWidth} × ${image.naturalHeight} px`;
			}

			element.state = mediaStates.LOADED;
		}
	});

	element.unload = () => {
		element.state = mediaStates.UNLOADED;

		image.src = transparentGif;
	};
	element.restore = () => {
		element.state = mediaStates.LOADED;

		image.src = options.src;
	};

	element.ready = waitForEvent(image, 'load', 'error');

	element.emitResizeEvent = () => {
		if (element.state !== mediaStates.UNLOADED) image.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));
	};

	setMediaMaxSize(image);
	makeMediaZoomable(element, image);
	const wrapper = setMediaControls(anchor, options.src, options.src);
	makeMediaMovable(element, wrapper);
	keepMediaVisible(wrapper);
	makeMediaIndependentOnResize(element, wrapper);

	return element;
}

function generateIframe(options: IframeMedia) {
	const element: ExpandoMediaElement = (iframeTemplate({
		url: (module.options.autoplayVideo.value && options.embedAutoplay) ? options.embedAutoplay : options.embed,
		width: options.width || '640px',
		height: options.height || '360px',
	}): any);

	const iframeNode = downcast(element.querySelector('iframe'), HTMLIFrameElement);
	const iframeWrapper = downcast(element.firstElementChild, HTMLElement);
	const dragHandle = element.querySelector('.res-iframe-expando-drag-handle');

	let loaded = false;

	element.expand = async () => {
		if (module.options.autoplayVideo.value && options.play) {
			if (!loaded) await waitForEvent(iframeNode, 'load');
			loaded = true;

			if (!iframeNode.offsetParent) {
				// It may have been collapsed in the meanwhile
				element.remove();
				return;
			}

			try {
				iframeNode.contentWindow.postMessage(options.play, '*');
			} catch (e) {
				console.error('Could not post "play" command to iframe', options.embed, e);
			}
		}
	};
	element.collapse = () => {
		let removeInstead = true;
		if (options.pause) {
			try {
				iframeNode.contentWindow.postMessage(options.pause, '*');
				removeInstead = false;
			} catch (e) {
				console.error('Could not post "pause" command to iframe', options.embed, e);
			}
		}
		return removeInstead;
	};

	element.emitResizeEvent =
		() => { iframeNode.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true })); };

	element.independent = true;

	makeMediaZoomable(element, iframeNode, dragHandle, !options.fixedRatio);
	makeMediaMovable(element, iframeWrapper, dragHandle);
	keepMediaVisible(iframeWrapper);
	makeMediaIndependentOnResize(element, iframeWrapper);

	return element;
}

function generateText(options: TextMedia) {
	return ((textTemplate({
		title: options.title,
		credits: options.credits,
		src: $('<span>').safeHtml(options.src).html(),
	}): any): ExpandoMediaElement);
}

function generateVideo(options: VideoMedia, context) {
	// Use default values for options not explicitly set
	const filledOptions = {
		autoplay: options.muted || module.options.autoplayVideo.value,
		advancedControls: module.options.showVideoControls.value,
		controls: true,
		frameRate: 24,
		loop: false,
		muted: false,
		openInNewWindow: module.options.openInNewWindow.value,
		playbackRate: 1,
		reversable: false,
		reversed: false,
		time: 0,
		...options,
	};

	return videoAdvanced(filledOptions, context);
}

function generateAudio(options: AudioMedia) {
	let {
		autoplay,
	} = options;

	const element: ExpandoMediaElement = (audioTemplate({
		loop: options.loop,
		sources: options.sources,
	}): any);
	const audio: HTMLAudioElement = (element.querySelector('audio'): any);

	element.collapse = () => {
		// Audio is auto-paused when detached from DOM
		if (!document.body.contains(audio)) return;

		autoplay = !audio.paused;
		if (!audio.paused) audio.pause();
	};
	element.expand = () => { if (autoplay) audio.play(); };

	return element;
}

function generateGeneric(options: GenericMedia) {
	const element: ExpandoMediaElement = (document.createElement('div'): any);

	element.appendChild(options.generate());

	// Always remove content, in case it contains audio or other unwanted things
	element.collapse = () => true;

	return element;
}

const trackVisitNative = batch(async things => {
	// this API only works for gold users
	if (!document.body.classList.contains('gold')) return;

	if (isPrivateBrowsing()) return;

	await ajax({
		method: 'POST',
		url: '/api/store_visits',
		data: { links: things.map(t => t.getFullname()).join(',') },
	});
}, { delay: 10000, size: 50 });

function trackMediaLoad(link, thing) {
	if (module.options.markVisited.value) {
		if (thing) trackVisitNative(thing);

		const isNSFW = thing && thing.isNSFW();
		const sfwMode = module.options.sfwHistory.value;

		if ((!isNSFW || sfwMode !== 'none') && thing) thing.element.classList.add('visited');
		if (!isNSFW || sfwMode === 'add') addURLToHistory(link.href);
	}
}

function setMediaControls(media, lookupUrl, downloadUrl) {
	if (!module.options.mediaControls.value) return media;

	const [y, x] = module.options.mediaControlsPosition.value.split('-');

	const element = mediaControlsTemplate({ clippy: module.options.clippy.value, lookupUrl, downloadUrl, x, y });
	const controls = element.querySelector('.res-media-controls');
	$(media).replaceWith(element);
	element.appendChild(media);

	let rotationState = 0;

	const hookInResizeListener = _.once(() => {
		media.addEventListener('mediaResize', () => {
			const horizontal = rotationState % 2 === 0;
			const height = horizontal ? media.clientHeight : media.clientWidth;
			const width = horizontal ? media.clientWidth : media.clientHeight;

			element.style.width = `${width}px`;
			element.style.height = `${height}px`;

			media.style.position = 'absolute';
		});
	});

	controls.addEventListener('click', (e: Event) => {
		hookInResizeListener();

		switch (e.target.dataset.action) {
			case 'rotateLeft':
				rotateMedia(media, --rotationState);
				break;
			case 'rotateRight':
				rotateMedia(media, ++rotationState);
				break;
			case 'download':
				download(downloadUrl);
				break;
			case 'imageLookup':
				// Google doesn't like image url's without a protacol
				lookupUrl = new URL(downcast(lookupUrl, 'string'), location.href).href;

				// Escape query string parameters
				openNewTab(string.encode`https://images.google.com/searchbyimage?image_url=${lookupUrl}`);
				break;
			case 'showImageSettings':
				SettingsNavigation.loadSettingsPage(module.moduleID, 'mediaControls');
				break;
			case 'clippy':
				if (e.target.classList.contains('res-media-controls-clippy-expanded')) {
					Options.set(module, 'clippy', false);
					e.target.remove();
				} else {
					e.target.classList.add('res-media-controls-clippy-expanded');
					e.target.title = 'Click to disable the info button';
					e.target.innerText = getClippyText();
				}
				break;
			default:
				// do nothing if action is unknown
				break;
		}

		e.stopPropagation();
		e.preventDefault();
	});

	return element;
}

function addSiteAttribution(siteModule, media) {
	const $element = $(siteAttributionTemplate({
		name: siteModule.name,
		url: siteModule.landingPage || `https://${siteModule.domains[0]}`,
		logoUrl: siteModule.logo,
		settingsLink: SettingsNavigation.makeUrlHash(module.moduleID, siteModuleOptionKey(siteModule)),
	}));
	const $replace = $('.res-expando-siteAttribution', media);
	if ($replace.length) {
		$element.replaceAll($replace);
	} else {
		$element.addClass('res-expando-siteAttribution-generic').appendTo(media);
	}
}

function keepMediaVisible(media) {
	let isManuallyMoved = false;

	media.classList.add('res-media-keep-visible');

	media.addEventListener('mediaResize', (e: any) => {
		if (e.detail === resizeSources.KEEP_VISIBLE) return;

		if (isManuallyMoved || e.detail === resizeSources.USER_MOVE) {
			isManuallyMoved = true;
			return;
		}

		const { width: viewportWidth } = getViewportSize();

		const { width: mediaWidth, left: mediaLeft, right: mediaRight } = media.getBoundingClientRect();

		const basisLeft: number = (media.parentElement: any).getBoundingClientRect().left;
		const deltaLeft = mediaLeft - basisLeft;

		if (mediaWidth > viewportWidth) { // Left align
			moveMedia(media, -mediaLeft, 0, resizeSources.KEEP_VISIBLE);
		} else if (mediaRight - deltaLeft > viewportWidth) { // Right align
			moveMedia(media, viewportWidth - mediaRight, 0, resizeSources.KEEP_VISIBLE);
		} else if (deltaLeft) { // Reset
			moveMedia(media, -deltaLeft, 0, resizeSources.KEEP_VISIBLE);
		}
	});
}

function getClippyText() {
	const clippy = [];
	if (module.options.imageZoom.value) {
		clippy.push('drag to resize');
	}

	if (module.options.imageMove.value) {
		clippy.push('shift-drag to move');
	}

	return clippy.join(' or ');
}

function setMediaMaxSize(media) {
	let value = module.options.maxWidth.value;
	let isPercentage = value.endsWith('%');
	const maxWidth = (isPercentage ? getViewportSize().width / 100 : 1) * parseInt(value, 10);
	if (maxWidth) media.style.maxWidth = `${maxWidth}px`;

	value = module.options.maxHeight.value;
	isPercentage = value.endsWith('%');
	const maxHeight = (isPercentage ? getViewportSize().height / 100 : 1) * parseInt(value, 10);
	if (maxHeight) media.style.maxHeight = `${maxHeight}px`;
}

function addDragListener({ media, element, atShiftKey, onStart, onMove }: {|
	media: HTMLElement,
	element: HTMLElement,
	atShiftKey: boolean,
	onStart?: (x: number, y: number) => void,
	onMove: (x: number, y: number, moveX: number, moveY: number) => void,
|}) {
	let isActive, hasMoved, lastX, lastY;

	const handleMove = frameThrottle((e: MouseEvent) => {
		const movementX = e.clientX - lastX;
		const movementY = e.clientY - lastY;

		if (!movementX && !movementY) {
			// Mousemove may be triggered even without movement
			return;
		} else if (1 & ~e.buttons) {
			// Mouseup may not trigger in some circumstances
			stop();
			return;
		} else if (atShiftKey !== e.shiftKey) {
			isActive = false;
			({ clientX: lastX, clientY: lastY } = e);
			return;
		}

		if (!isActive) {
			if (onStart) onStart(lastX, lastY);
			isActive = true;
			hasMoved = true;
			media.classList.add('res-media-dragging');
		}

		onMove(e.clientX, e.clientY, movementX, movementY);
		({ clientX: lastX, clientY: lastY } = e);
	});

	function handleClick(e: Event) {
		if (hasMoved) e.preventDefault();
	}

	function stop() {
		media.classList.remove('res-media-dragging');

		document.removeEventListener('mousemove', handleMove);
		document.removeEventListener('mouseup', stop);

		// `handleClick` is only invoked if the mouse target is `element`
		// `setTimeout` is necessary since `mouseup` is emitted before `click`
		setTimeout(() => document.removeEventListener('click', handleClick));
	}

	function initiate(e: MouseEvent) {
		if (e.button !== 0) return;

		({ clientX: lastX, clientY: lastY } = e);

		hasMoved = false;
		isActive = false;

		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', stop);
		document.addEventListener('click', handleClick);

		e.preventDefault();
	}

	element.addEventListener('mousedown', initiate);
}

function makeMediaZoomable(media, element, dragInitiater = element, absoluteSizing = false) {
	if (!module.options.imageZoom.value) return;

	element.classList.add('res-media-zoomable');

	let initialWidth, initialDiagonal, left, top;

	function getDiagonal(x, y) {
		const w = Math.max(1, x - left);
		const h = Math.max(1, y - top);
		return Math.round(Math.hypot(w, h));
	}

	addDragListener({
		media,
		element: dragInitiater,
		atShiftKey: false,
		onStart(x, y) {
			({ left, top, width: initialWidth } = element.getBoundingClientRect());
			initialDiagonal = getDiagonal(x, y);
		},
		onMove(x, y, deltaX, deltaY) {
			if (absoluteSizing) {
				const { width, height } = element.getBoundingClientRect();
				resizeMedia(element, width + deltaX, height + deltaY);
			} else {
				const newWidth = getDiagonal(x, y) / initialDiagonal * initialWidth;
				resizeMedia(element, newWidth);
			}
		},
	});
}

function makeMediaMovable(media, element, dragInitiater = element) {
	if (!module.options.imageMove.value) return;

	element.classList.add('res-media-movable');

	addDragListener({
		media,
		element: dragInitiater,
		atShiftKey: true,
		onMove(x, y, deltaX, deltaY) { moveMedia(element, deltaX, deltaY); },
	});
}

function makeMediaIndependentOnResize(media, element) {
	const wrapper = document.createElement('div');
	const independent = document.createElement('div');
	$(element).replaceWith(wrapper);
	wrapper.appendChild(independent);
	independent.appendChild(element);

	const debouncedResize = frameThrottle(media.emitResizeEvent);

	media.addEventListener('mediaResize', e => {
		media.independent = true;

		// $FlowIssue `mozFullScreenElement` not recognized
		const fullscreenElement = (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement: any);
		if (!media.offsetParent || independent.contains(fullscreenElement)) {
			// Allowing propagation when non-visible may cause unwanted side-effects,
			// so cancel and instead emit a new signal when expanded
			e.stopImmediatePropagation();
		}
	}, true);

	let lastHeight = 0;

	media.addEventListener('mediaResize', () => {
		const height = element.clientHeight;
		if (lastHeight !== height) {
			lastHeight = height;
			wrapper.style.height = `${height}px`;
		}

		independent.classList.add('res-media-independent');
	});

	const prevExpand = media.expand;
	media.expand = () => {
		if (media.independent) {
			media.emitResizeEvent();
		} else {
			// This is a slower method to listen to resizes, as it waits till the frame after the size is set to update.
			// Using this is however necessary when it's not possible to determine size from media events.
			elementResizeDetector().listenTo(element, () => {
				if (element.clientHeight !== lastHeight) media.emitResizeEvent();
			});
		}

		window.addEventListener('resize', debouncedResize);

		if (prevExpand) return prevExpand();
	};

	const prevCollapse = media.collapse;
	media.collapse = () => {
		elementResizeDetector().removeAllListeners(element);
		window.removeEventListener('resize', debouncedResize);
		if (prevCollapse) return prevCollapse();
	};
}


// When videos is added, this will pause or play them individually depending on their visibility
const mutedVideoManager = _.once(() => {
	const maxSimultaneousPlaying = parseInt(module.options.maxSimultaneousPlaying.value, 10) || Infinity;
	const videos: HTMLVideoElement[] = [];

	const updatePlay = frameThrottle(() => {
		const all = videos.map(video => {
			const thing = Thing.from(video);
			return {
				video,
				visibility: getPercentageVisibleYAxis(video),
				top: video.getBoundingClientRect().top,
				selected: Number(thing && thing.isSelected()),
			};
		});

		const notVisible = all.filter(({ visibility }) => visibility === 0);
		for (const { video } of notVisible) if (!video.paused) video.pause();

		_.without(all, ...notVisible)
			.sort((a, b) => b.selected - a.selected || b.visibility - a.visibility || a.top - b.top)
			.forEach(({ video }, index) => {
				const play = index < maxSimultaneousPlaying;
				if (play === video.paused) {
					if (play) video.play();
					else video.pause();
				}
			});
	});

	let intervalId = null;

	return {
		observe(video) {
			videos.push(video);
			updatePlay();
			if (intervalId === null) intervalId = setInterval(updatePlay, 100);
		},
		unobserve(video) {
			_.pull(videos, video);
			if (!videos.length && intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		},
	};
});

function videoAdvanced(options, context) {
	const {
		fallback,
		frameRate,
		loop,
		playbackRate,
		advancedControls,
		reversed,
	} = options;

	let {
		autoplay,
		time,
	} = options;

	function formatPlaybackRate(value) {
		return `${value.toFixed(2).replace('.', '.<wbr>')}x`;
	}

	const useVideoManager = advancedControls && module.options.onlyPlayMutedWhenVisible.value && options.muted;

	// Poster is unnecessary, and will flash if loaded before the video is ready
	if (autoplay) delete options.poster;

	const element: ExpandoMediaElement = (document.createElement('div'): any);
	const player = videoAdvancedTemplate({
		title: options.title,
		caption: options.caption,
		credits: options.credits,
		href: options.href || context.href,
		source: options.source,
		poster: options.poster,
		muted: options.muted,
		loop: options.loop,
		reversable: options.reversable,
		controls: options.controls,
		advancedControls: options.advancedControls,
		openInNewWindow: options.openInNewWindow,
		formattedPlaybackRate: formatPlaybackRate(options.playbackRate),
	});
	element.appendChild(player);

	const vid: HTMLVideoElement = (player.querySelector('video'): any);
	const container: HTMLElement = (player.querySelector('.video-advanced-container'): any);

	const msgError = element.querySelector('.video-advanced-error');

	const sourceElements = $(_.compact(options.sources.map(v => {
		if (!vid.canPlayType(v.type)) return null;
		const source = document.createElement('source');
		source.src = v.source;
		source.type = v.type;
		if (v.reverse) source.dataset.reverse = v.reverse;
		return source;
	}))).appendTo(vid).get();
	if (!sourceElements.length) {
		sourceErrorFallback(new Error('No playable sources were found'));
		return element;
	}

	function reverse() {
		time = vid.duration - vid.currentTime;
		if (isNaN(time)) time = 0;

		for (const v of vid.querySelectorAll('source')) {
			// $FlowIssue
			[v.src, v.dataset.reverse] = [v.dataset.reverse, v.src];
		}

		vid.load();
		vid.play();

		player.classList.toggle('reversed');
	}

	if (reversed) reverse();

	function setAdvancedControls() {
		const ctrlContainer = player.querySelector('.video-advanced-controls');

		const ctrlReverse = ctrlContainer.querySelector('.video-advanced-reverse');
		const ctrlTogglePause = ctrlContainer.querySelector('.video-advanced-toggle-pause');
		const ctrlSpeedDecrease = ctrlContainer.querySelector('.video-advanced-speed-decrease');
		const ctrlSpeedIncrease = ctrlContainer.querySelector('.video-advanced-speed-increase');
		const ctrlTimeDecrease = ctrlContainer.querySelector('.video-advanced-time-decrease');
		const ctrlTimeIncrease = ctrlContainer.querySelector('.video-advanced-time-increase');

		const progress = player.querySelector('.video-advanced-progress');
		const indicatorPosition = progress.querySelector('.video-advanced-position');
		const ctrlPosition = progress.querySelector('.video-advanced-position-thumb');

		const msgSpeed = ctrlContainer.querySelector('.video-advanced-speed');
		const msgTime = ctrlContainer.querySelector('.video-advanced-time');

		ctrlTogglePause.addEventListener('click', () => {
			if (vid.paused) vid.play(); else vid.pause();
			if (vid.paused) stopAutoplay();
		});
		if (ctrlReverse) ctrlReverse.addEventListener('click', reverse);

		ctrlSpeedDecrease.addEventListener('click', () => { vid.playbackRate /= 1.1; });
		ctrlSpeedIncrease.addEventListener('click', () => { vid.playbackRate *= 1.1; });
		ctrlTimeDecrease.addEventListener('click', () => { vid.currentTime -= 1 / frameRate; });
		ctrlTimeIncrease.addEventListener('click', () => { vid.currentTime += 1 / frameRate; });

		vid.addEventListener('ratechange', () => { msgSpeed.innerHTML = formatPlaybackRate(vid.playbackRate); });
		vid.addEventListener('timeupdate', () => {
			indicatorPosition.style.left = `${(vid.currentTime / vid.duration) * 100}%`;
			msgTime.innerHTML = `${vid.currentTime.toFixed(2).replace('.', '.<wbr>')}s`;
		});

		progress.addEventListener('mousemove', (e: MouseEvent) => {
			let left = e.offsetX;
			if (e.target === ctrlPosition) { left += e.target.offsetLeft; }
			ctrlPosition.style.left = `${left}px`;

			if (e.buttons === 1 /* left mouse button */) ctrlPosition.click();
		});
		ctrlPosition.addEventListener('click', (e: MouseEvent) => {
			const percentage = (e.target.offsetLeft + e.target.clientWidth / 2) / progress.clientWidth;
			vid.currentTime = vid.duration * percentage;
		});
	}

	if (advancedControls) {
		Promise.all([waitForEvent(player, 'mouseenter'), waitForEvent(vid, 'loadedmetadata')])
			.then(setAdvancedControls);
	}

	function sourceErrorFallback(error: Error | ProgressEvent) {
		if (fallback) {
			console.log('Could not play video', error);
			const image = generateImage({
				type: 'IMAGE',
				title: options.title,
				caption: options.caption,
				credits: options.credits,
				src: fallback,
			}, context);
			$(element).empty().append(image);
		} else if (msgError.hidden) {
			msgError.hidden = false;
			$('<span>').text(`Could not play video: ${error.message ? String(error.message) : 'Unknown error'}`).appendTo(msgError);
		}
	}

	const lastSource = sourceElements[sourceElements.length - 1];
	lastSource.addEventListener('error', sourceErrorFallback);

	vid.addEventListener('pause', () => { player.classList.remove('playing'); });
	vid.addEventListener('play', () => { player.classList.add('playing'); });

	vid.addEventListener('loadedmetadata', () => { if (time !== vid.currentTime) vid.currentTime = time; });
	vid.playbackRate = playbackRate;

	// Ignore events which might be meant for controls
	vid.addEventListener('mousedown', (e: MouseEvent) => {
		if (vid.hasAttribute('controls')) {
			const { height, top } = vid.getBoundingClientRect();
			let controlsBottomHeight = 0;
			if (process.env.BUILD_TARGET === 'edge') controlsBottomHeight = 0.5 * height;
			if (process.env.BUILD_TARGET === 'firefox') controlsBottomHeight = 40;
			if ((height - controlsBottomHeight) < (e.clientY - top)) {
				e.stopImmediatePropagation();
			}
		}
	});

	if (!loop && autoplay) {
		waitForEvent(vid, 'ended').then(stopAutoplay);
	}

	function stopAutoplay() {
		autoplay = false;
		if (useVideoManager) mutedVideoManager().unobserve(vid);
	}

	function unload() {
		// Video is auto-paused when detached from DOM
		if (!document.body.contains(vid)) return;

		if (!vid.paused) vid.pause();

		time = vid.currentTime;
		vid.setAttribute('src', ''); // vid.src has precedence over any child source element
		vid.load();

		if (useVideoManager) mutedVideoManager().unobserve(vid);
	}

	function restore() {
		if (vid.hasAttribute('src')) {
			vid.removeAttribute('src');
			vid.load();
		}

		if (autoplay) {
			if (useVideoManager) mutedVideoManager().observe(vid);
			else vid.play();
		}
	}

	element.collapse = unload;
	element.expand = restore;

	element.state = mediaStates.NONE;

	element.unload = () => {
		if (element.state === mediaStates.UNLOADED) return;

		// If video has audio, it may be in use even if it is not visible
		if (!options.muted && !vid.paused) return;

		element.state = mediaStates.UNLOADED;
		unload();
	};
	element.restore = () => {
		if (element.state === mediaStates.LOADED) return;

		element.state = mediaStates.LOADED;
		restore();
	};

	element.emitResizeEvent = () => {
		if (element.state !== mediaStates.UNLOADED) vid.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));
	};

	element.ready = Promise.race([waitForEvent(vid, 'suspend'), waitForEvent(lastSource, 'error')]);

	vid.addEventListener('loadedmetadata', element.emitResizeEvent);

	setMediaMaxSize(vid);
	makeMediaZoomable(element, vid);
	setMediaControls(vid, undefined, options.sources[0].source);
	makeMediaMovable(element, container);
	keepMediaVisible(container);
	makeMediaIndependentOnResize(element, container);

	return element;
}

export function moveMedia(ele: HTMLElement, deltaX: number, deltaY: number, source?: number = resizeSources.USER_MOVE): void {
	ele.style.marginLeft = `${((parseFloat(ele.style.marginLeft) || 0) + deltaX).toFixed(2)}px`;
	ele.style.marginTop = `${((parseFloat(ele.style.marginTop) || 0) + deltaY).toFixed(2)}px`;

	ele.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true, detail: source }));
}

export function resizeMedia(ele: HTMLElement, newWidth: number, newHeight?: number): void {
	// ele should always be grippable, so ignore resizes that are too tiny
	if (newWidth < 20) return;

	if (typeof newHeight === 'number') {
		ele.style.height = `${newHeight}px`;
	} else if (ele.style.height) { // If height is previously set, keep the ratio
		const { width, height } = ele.getBoundingClientRect();
		ele.style.height = `${((height / width) * newWidth).toFixed(2)}px`;
	}

	ele.style.width = `${newWidth}px`;
	ele.style.maxWidth = ele.style.maxHeight = 'none';

	ele.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));
}

function rotateMedia(ele, rotationState) {
	ele.style.transformOrigin = 'top left';

	// apply rotation
	switch (positiveModulo(rotationState, 4)) {
		case 0:
			ele.style.transform = '';
			break;
		case 1:
			ele.style.transform = 'rotate(90deg) translateY(-100%)';
			break;
		case 2:
			ele.style.transform = 'rotate(180deg) translate(-100%, -100%)';
			break;
		case 3:
			ele.style.transform = 'rotate(270deg) translateX(-100%)';
			break;
		default:
			break;
	}

	ele.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));
}
