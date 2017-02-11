/* @flow */

import _ from 'lodash';
import elementResizeDetectorMaker from 'element-resize-detector';
import { filter, flow, keyBy, map, sortBy } from 'lodash/fp';
import audioTemplate from '../templates/audio.mustache';
import galleryTemplate from '../templates/gallery.mustache';
import imageTemplate from '../templates/image.mustache';
import iframeTemplate from '../templates/iframe.mustache';
import mediaControlsTemplate from '../templates/mediaControls.mustache';
import siteAttributionTemplate from '../templates/siteAttribution.mustache';
import textTemplate from '../templates/text.mustache';
import videoAdvancedTemplate from '../templates/videoAdvanced.mustache';
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
import type { ExpandoMediaElement } from '../utils/expando';
import {
	DAY,
	positiveModulo,
	downcast,
	Expando,
	expandos,
	primaryExpandos,
	Thing,
	addCSS,
	batch,
	click,
	CreateElement,
	elementInViewport,
	scrollToElement,
	filterMap,
	forEachChunked,
	forEachSeq,
	idleThrottle,
	frameThrottle,
	nextFrame,
	isPageType,
	string,
	waitForEvent,
	watchForElements,
	getPercentageVisibleYAxis,
} from '../utils';
import { addURLToHistory, ajax, isPrivateBrowsing, openNewTab, Permissions } from '../environment';
import * as Options from '../core/options';
import * as NeverEndingReddit from './neverEndingReddit';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';

const hostsContext = require.context('./hosts', false, /\.js$/);
const siteModules: { [key: string]: Host<any, any> } = flow(
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
	browsePreloadCount: {
		type: 'text',
		value: '1',
		description: 'Number of preloaded expandos for faster browsing. Currently only active when using keyboard navigation.',
	},
	galleryPreloadCount: {
		type: 'text',
		value: '2',
		description: 'Number of preloaded gallery pieces for faster browsing.',
	},
	conserveMemory: {
		type: 'boolean',
		value: true,
		description: 'Conserve memory by temporarily hiding images when they are offscreen.',
	},
	bufferScreens: {
		type: 'text',
		value: '2',
		description: 'Hide images that are further than x screens away to save memory. A higher value means less flicker, but less memory savings.',
		dependsOn: options => options.conserveMemory.value,
		advanced: true,
	},
	maxWidth: {
		type: 'text',
		value: '100%',
		description: 'Max width of media (in pixels, enter zero for unlimited). Percentage of window width may also be used (e.g. "100%").',
		advanced: true,
	},
	maxHeight: {
		type: 'text',
		value: '80%',
		description: 'Max height of media (in pixels, enter zero for unlimited). Percentage of window height may also be used (e.g. "100%").',
		advanced: true,
	},
	displayOriginalResolution: {
		type: 'boolean',
		value: false,
		description: 'Display each image\'s original (unresized) resolution in a tooltip.',
	},
	selfTextMaxHeight: {
		type: 'text',
		value: '0',
		description: 'Add a scroll bar to text expandos taller than [x] pixels (enter zero for unlimited).',
		advanced: true,
	},
	commentMaxHeight: {
		type: 'text',
		value: '0',
		description: 'Add a scroll bar to comments taller than [x] pixels (enter zero for unlimited).',
		advanced: true,
	},
	autoMaxHeight: {
		type: 'boolean',
		value: false,
		description: `
			Increase the max height of a self-text expando or comment if an expando is taller than the current max height.
			This only takes effect if max height is specified (previous two options).
		`,
		advanced: true,
	},
	openInNewWindow: {
		type: 'boolean',
		value: true,
		description: 'Open images in a new tab/window when clicked?',
	},
	hideNSFW: {
		type: 'boolean',
		value: false,
		description: 'If checked, do not show images marked NSFW.',
	},
	highlightNSFWButton: {
		type: 'boolean',
		value: true,
		description: 'Add special styling to expando buttons for images marked NSFW.',
		bodyClass: true,
	},
	highlightSpoilerButton: {
		type: 'boolean',
		value: true,
		description: 'Add special styling to expando buttons for images marked as spoilers.',
		bodyClass: true,
	},
	imageZoom: {
		type: 'boolean',
		value: true,
		description: 'Allow dragging to resize/zoom images.',
	},
	imageMove: {
		type: 'boolean',
		value: true,
		description: 'Allow dragging while holding shift to move images.',
	},
	mediaControls: {
		type: 'boolean',
		value: true,
		description: 'Show additional image controls on hover.',
	},
	mediaControlsPosition: {
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
		description: 'Set position of media controls',
	},
	clippy: {
		dependsOn: options => options.mediaControls.value,
		type: 'boolean',
		value: true,
		description: 'Show educational info, such as showing "drag to resize" in the media controls.',
	},
	displayImageCaptions: {
		type: 'boolean',
		value: true,
		description: 'Retrieve image captions/attribution information.',
		advanced: true,
		bodyClass: true,
	},
	captionsPosition: {
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
		description: 'Where to display captions around an image.',
		advanced: true,
		bodyClass: true,
	},
	markVisited: {
		type: 'boolean',
		value: true,
		description: 'Mark non-selftext links visited when opening the expando.',
		advanced: true,
	},
	markSelftextVisited: {
		dependsOn: options => options.markVisited.value,
		type: 'boolean',
		value: false,
		description: 'Mark selftext links visited when opening the expando.',
		advanced: true,
	},
	sfwHistory: {
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
		description: `
			Keeps NSFW links from being added to your browser history <span style="font-style: italic">by the markVisited feature</span>.<br/>
			<span style="font-style: italic">If you chose the second option, then links will be blue again on refresh.</span><br/>
			<span style="color: red">This does not change your basic browser behavior.
			If you click on a link then it will still be added to your history normally.
			This is not a substitute for using your browser's privacy mode.</span>
		`,
	},
	galleryRememberWidth: {
		dependsOn: options => options.imageZoom.value,
		type: 'boolean',
		value: true,
		description: 'In \'slideshow\' layout, use the same width on all pieces after resizing.',
	},
	galleryAsFilmstrip: {
		type: 'boolean',
		value: false,
		description: 'Display all media at once in a \'filmstrip\' layout, rather than the default navigable \'slideshow\' style.',
	},
	filmstripLoadIncrement: {
		dependsOn: options => options.galleryAsFilmstrip.value,
		type: 'text',
		value: '30',
		description: 'Limit the number of pieces loaded in a \'filmstrip\' by this number. (0 for no limit)',
	},
	useSlideshowWhenLargerThan: {
		dependsOn: options => options.galleryAsFilmstrip.value,
		type: 'text',
		value: '0',
		description: 'Show gallery as \'slideshow\' when the total number of pieces is larger than this number. (0 for no limit)',
	},
	convertGifstoGfycat: {
		type: 'boolean',
		value: false,
		description: 'Convert Gif links to Gfycat links.',
	},
	showViewImagesTab: {
		type: 'boolean',
		value: true,
		description: 'Show a \'show images\' tab at the top of each subreddit, to easily toggle showing all images at once.',
	},
	autoExpandTypes: {
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
		description: 'Media types to be automatically expanded when using "show images" or autoExpandSelfText.',
	},
	autoExpandSelfText: {
		type: 'boolean',
		value: true,
		description: 'When loading selftext from an Aa+ expando, auto expand enclosed expandos.',
	},
	autoExpandSelfTextFirstVisibleNonMuted: {
		dependsOn: options => options.autoExpandSelfText.value,
		type: 'boolean',
		value: true,
		description: 'In selftexts, expand the first visible potentially non-muted expando.',
	},
	autoExpandSelfTextNSFW: {
		dependsOn: options => options.autoExpandSelfText.value,
		type: 'boolean',
		value: false,
		description: 'Also expand expandos in selftexts which are marked NSFW.',
	},
	showSiteAttribution: {
		type: 'boolean',
		value: true,
		description: 'Show the site logo and name after embedded content.',
	},
	expandoCommentRedirects: {
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
		description: 'How should RES handle posts where the link is redirected to the comments page with preview expanded?',
	},
	showVideoControls: {
		type: 'boolean',
		value: true,
		description: 'Show controls such as pause/play, step and playback rate.',
	},
	onlyPlayMutedWhenVisible: {
		dependsOn: options => options.showVideoControls.value,
		type: 'boolean',
		value: true,
		description: 'Auto-pause muted videos when they are not visible.',
	},
	maxSimultaneousPlaying: {
		dependsOn: options => options.showVideoControls.value,
		type: 'text',
		value: '0',
		description: 'Auto-play at most this many muted videos simultaneously. (0 for no limit)',
	},
	autoplayVideo: {
		type: 'boolean',
		value: true,
		description: 'Autoplay inline videos',
	},
};
module.exclude = [
	/^\/ads\/[\-\w\._\?=]*/i,
	'submit',
	/^\/subreddits/i,
];

module.loadDynamicOptions = () => {
	// Augment the options with available image modules
	for (const siteModule of Object.values(siteModules)) {
		// Ignore default
		if (genericHosts.includes(siteModule)) continue;

		// Create on/off options
		module.options[siteModuleOptionKey(siteModule)] = {
			title: `display ${siteModule.name}`,
			description: `Display expander for ${siteModule.name}`,
			value: true,
			type: 'boolean',
		};

		// Find out if module has any additional options - if it does add them
		Object.assign(module.options, siteModule.options); // Object.assign ignores null/undefined
	}
};

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

	for (const siteModule of Object.values(siteModules)) {
		if (isSiteModuleEnabled(siteModule)) {
			if (siteModule.go) siteModule.go();
		}
	}

	SelectedEntry.addListener(mediaBrowse, 'beforeScroll');

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

	enableCompleteDeferredExpandos();
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

// @type {Map.<expandoButton, () => completeExpando>}
const deferredExpandos = new Map();

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

function isWithinBuffer(ele) {
	if (!ele.offsetParent) return false;

	const bufferScreens = parseInt(module.options.bufferScreens.value, 10) || 2;
	const viewportHeight = window.innerHeight;
	const maximumTop = viewportHeight * (bufferScreens + 1);
	const minimumBottom = viewportHeight * bufferScreens * -1;

	const { bottom, top } = ele.getBoundingClientRect();
	return top <= maximumTop && bottom >= minimumBottom;
}

const checkDeferredExpando = _.throttle(() => {
	// Complete any deferred expandos which is within the buffer
	for (const [expando, completeFunc] of deferredExpandos) {
		const thing = Thing.from(expando.button);
		if (!thing || thing.isVisible()) completeFunc();
	}
}, 150);

function enableCompleteDeferredExpandos() {
	window.addEventListener('scroll', checkDeferredExpando);
	// not using element-resize-detector because it sets the target to `position: relative`, breaking some stylesheets (/r/nba)
	window.addEventListener('resize', checkDeferredExpando);
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
	const refresh = _.throttle(frameThrottle(() => {
		// Running this can conflict with partially-ready expandos, as is the case
		// while NER is ready-ing a new page
		if (NeverEndingReddit.loadPromise) return;

		const activeExpandos = Array.from(primaryExpandos.values());
		const openExpandos = [];

		// Empty collapsed when beyond buffer
		for (const expando of activeExpandos) {
			if (!expando.isAttached()) expando.destroy();
			else if (expando.open) openExpandos.push(expando);
			else if (expando.media && !isWithinBuffer(expando.button)) expando.empty();
		}

		// Unload expanded when beyond buffer
		flow(
			filterMap(expando => {
				if (expando.media) return [{ media: expando.media, data: expando.media }];
			}),
			lazyUnload(isWithinBuffer)
		)(openExpandos);
	}), 150);

	window.addEventListener('scroll', refresh);
	// not using element-resize-detector because it sets the target to `position: relative`, breaking some stylesheets (/r/nba)
	window.addEventListener('resize', refresh);
}

const lazyUnload = _.curryRight(/*:: <T> */(pieces: Array<{ media: ?ExpandoMediaElement, data: T }>, testKeepLoaded: (data: T) => boolean) => {
	const actions: Array<() => void> = [];

	for (const { media, data } of pieces) {
		if (!media || !media.unload || !media.restore) continue;

		const keepLoaded = testKeepLoaded(data);
		if (/*:: media.restore && */ keepLoaded && media.state === mediaStates.UNLOADED) {
			actions.push(media.restore);
		} else if (/*:: media.unload && */ !keepLoaded && media.state !== mediaStates.UNLOADED) {
			actions.push(media.unload);
		}
	}

	for (const action of actions) action();
});

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
	checkDeferredExpando();
	updateAutoExpandCount();
}

const updateAutoExpandCount = _.debounce(() => {
	if (!viewImagesButton) return;

	const count = Array.from(primaryExpandos.values())
		.filter(expando => expando.isAttached() && expando.button.offsetParent &&
			isExpandWanted(expando, { autoExpand: true }))
		.length;

	nextFrame(() => viewImagesButton.setAttribute('aftercontent', ` (${count})`));
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

export function toggleThingExpandos(thing: Thing, scrollOnExpando?: boolean): void {
	const expandos = thing.getExpandos();
	if (!expandos.length) return;

	const openExpandos = expandos.filter(v => v.open);

	// If any open expandos exists within thing, collapse all
	// Else, expand all
	if (openExpandos.length) {
		for (const expando of openExpandos) expando.collapse();

		if (scrollOnExpando) scrollToElement(thing.entry, { scrollStyle: 'directional' });
	} else {
		for (const expando of expandos) {
			if (
				!(expando instanceof Expando) ||
				isExpandWanted(expando, { thing, autoExpandFirstVisibleNonMutedInThing: true, autoExpand: true, autoExpandTypes: ['any'], ignoreDuplicatesScope: thing.entry })
			) {
				expando.expand();
			}
		}

		if (scrollOnExpando) scrollToElement(thing.entry, { scrollStyle: 'top' });
	}
}

// idleThrottle since this is low-priority
const preloadExpandos = idleThrottle((fromThing, direction, preloadCount = parseInt(module.options.browsePreloadCount.value, 10)) => {
	const pieces = [];
	let target = fromThing;

	do {
		const expando = target.getEntryExpando();
		if (expando && expando instanceof Expando) pieces.push(expando);
	} while ((target = target.getNext({ direction })) && pieces.length <= preloadCount);

	preloadMedia(pieces);
});

function mediaBrowse(selected, unselected, options) {
	if (!selected || !options.mediaBrowse || autoExpandActive) return;

	const oldExpando = unselected && unselected.getEntryExpando();
	const newExpando = selected && selected.getEntryExpando();

	if (oldExpando) {
		mediaBrowseModeActive = oldExpando.expandWanted || oldExpando.open;
		oldExpando.collapse();
	}

	if (mediaBrowseModeActive && newExpando) {
		newExpando.expand();
		if (options.mediaBrowseScrollStyle) options.scrollStyle = options.mediaBrowseScrollStyle;

		preloadExpandos(selected, options.direction);
	}
}

function hasEntryAnyExpandedNonMuted(thing) {
	return thing && thing.getTextExpandos().some(expando =>
		expando.getTypes().includes('non-muted') && (expando.open || expando.expandWanted)
	);
}

export function matchesTypes(expandoTypes: string[], wantedTypes: string[]): boolean {
	return wantedTypes.includes('any') || !!_.intersection(expandoTypes, wantedTypes).length;
}

function isExpandWanted(expando: Expando, {
		thing,
		autoExpand = autoExpandActive,
		autoExpandTypes = module.options.autoExpandTypes.value.split(' '),
		ignoreDuplicates = true,
		ignoreDuplicatesScope,
		onlyExpandMuted = true,
		autoExpandFirstVisibleNonMutedInThing = false,
	}: {
		thing?: ?Thing,
		autoExpand?: boolean,
		autoExpandTypes?: string[],
		ignoreDuplicates?: boolean,
		ignoreDuplicatesScope?: HTMLElement,
		onlyExpandMuted?: boolean,
		autoExpandFirstVisibleNonMutedInThing?: boolean,
	} = {}
) {
	if (ignoreDuplicates && !expando.isPrimary()) {
		if (!ignoreDuplicatesScope) return false;
		const primary = expando.getPrimary();
		if (primary && ignoreDuplicatesScope.contains(primary.button)) return false;
	}

	const expandoTypes = expando.getTypes();
	const expandoIsNonMuted = expandoTypes.includes('non-muted');

	const typeCriteriaOK = matchesTypes(expandoTypes, autoExpandTypes);
	const muteCriteriaOK = !(onlyExpandMuted && expandoIsNonMuted) ||
		(autoExpandFirstVisibleNonMutedInThing && elementInViewport(expando.button) && !hasEntryAnyExpandedNonMuted(thing));

	return autoExpand && muteCriteriaOK && typeCriteriaOK;
}

async function convertGifToVideo(options) {
	try {
		const info = await ajax({
			type: 'json',
			url: '//upload.gfycat.com/transcodeRelease',
			data: { fetchUrl: options.src },
			cacheFor: DAY,
		});

		if (!info.gfyName) throw new Error('gfycat transcode did not contain "gfyName"');

		return {
			options: await siteModules.gfycat.handleLink('', [], info),
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
		const dataUrl = thing.$thing.attr('data-url');
		const fullDataUrl = dataUrl && new URL(dataUrl, location.href);
		if (fullDataUrl && fullDataUrl.href !== thing.getCommentsLink().href) {
			return fullDataUrl;
		}
	}

	return element;
}

async function getMediaInfo(element, mediaUrl, thing) {
	const matchingHosts = [
		...modulesForHostname(mediaUrl.hostname),
		...genericHosts,
	];

	for (const siteModule of matchingHosts) {
		const detectResult = siteModule.detect(mediaUrl, thing);
		if (detectResult) {
			const requiresPermission = siteModule.permissions ? !(await Permissions.has(siteModule.permissions)) : false; // eslint-disable-line no-await-in-loop
			return { detectResult, siteModule, requiresPermission, element, href: mediaUrl.href };
		}
	}
}

const scannedLinks: WeakMap<HTMLAnchorElement, boolean | Expando> = new WeakMap();
export const getLinkExpando = (link: HTMLAnchorElement): ?Expando => {
	const expando = scannedLinks.get(link);
	if (expando instanceof Expando) return expando;
};

async function checkElementForMedia(element) {
	if (scannedLinks.has(element)) return;
	else scannedLinks.set(element, true);

	const thing = Thing.from(element);

	const inText = !!$(element).closest('.md, .search-result-footer')[0];
	const entryExpando = !inText && thing && thing.getEntryExpando();
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
	const mediaInfo = await getMediaInfo(element, mediaUrl, thing);

	if (!mediaInfo) return;

	if (mediaUrl && module.options.expandoCommentRedirects.value === 'rewrite') {
		element.href = mediaUrl;
		element.removeAttribute('data-inbound-url');
	}

	if (nativeExpando) nativeExpando.detach();

	const expando = new Expando(inText, mediaInfo.requiresPermission);
	expandos.set(expando.button, expando);
	scannedLinks.set(element, expando);

	expando.button.setAttribute('data-host', mediaInfo.siteModule.moduleID);

	if (!inText && thing && thing.getTitleElement()) {
		$(expando.button).insertAfter(element.parentElement);
		thing.entry.appendChild(expando.box);
	} else {
		$(element).add($(element).next('.keyNavAnnotation')).last()
			.after(expando.box)
			.after(expando.button);
	}

	expando.button.addEventListener('click', () => {
		const completeDeferred = deferredExpandos.get(expando);
		if (completeDeferred) {
			completeDeferred('click');
		}

		expando.toggle({ scrollOnMoveError: true });
	}, true);

	const complete = async () => {
		try {
			await completeExpando(expando, thing, mediaInfo);
		} catch (e) {
			console.error(`showImages: could not create expando for ${mediaInfo.href}`);
			console.error(e);

			if (nativeExpando) nativeExpando.reattach();
			expando.destroy();
			scannedLinks.set(element, true);
		}

		thingExpandoBuildListeners.fire(thing);
	};

	if (
		mediaInfo.requiresPermission || // Only auto-complete if we know it can be completed without any prompts
		(
			thing && !thing.isVisible() && // No need to complete building non-visible expandos
			// Filtered because it didn't have an expando when checked? Let's try again.
			!(thing.filter && thing.filter.key === 'hasExpando') //  XXX: Dirty
		)
	) {
		deferredExpandos.set(expando, (completeType = 'auto') => {
			// Chrome: A click is necessary to prompt for access
			if (mediaInfo.requiresPermission && completeType !== 'click') return;

			complete();
			deferredExpandos.delete(expando);
		});
	} else {
		complete();
	}

	thingExpandoBuildListeners.fire(thing);
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
		const { $thing } = thing;
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

	if (module.options.autoMaxHeight.value && thing && expando.inText) {
		thing.entry.addEventListener('mediaResize', updateParentHeight);
	}

	if (!expando.expandWanted) {
		let autoExpand;
		let autoExpandFirstVisibleNonMutedInThing;

		if (module.options.autoExpandSelfText.value && expando.inText && thing && thing.isSelfPost() && !isPageType('comments')) {
			const dontAutoExpandNSFW = !module.options.autoExpandSelfTextNSFW.value && thing.isNSFW();
			autoExpand = !dontAutoExpandNSFW;
			autoExpandFirstVisibleNonMutedInThing = module.options.autoExpandSelfTextFirstVisibleNonMuted.value;
		}

		expando.expandWanted = isExpandWanted(expando, { thing, autoExpand, autoExpandFirstVisibleNonMutedInThing });
	}

	nextFrame(() => expando.initialize());

	updateAutoExpandCount();
}

const retrieveExpandoOptions = _.memoize(async (thing, { siteModule, detectResult, requiresPermission, element, href }) => {
	if (requiresPermission && siteModule.permissions) await Permissions.request(siteModule.permissions);
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

	const attribution = module.options.showSiteAttribution.value &&
		thing && thing.isPost() && !thing.isSelfPost() &&
		siteModule.domains.length && siteModule.attribution !== false;

	const isMuted = media => media.muted || ['IMAGE', 'TEXT'].includes(media.type);

	const trackLoad = _.once(() => trackMediaLoad(element, thing));

	if ((mediaOptions.type === 'IMAGE' || mediaOptions.type === 'VIDEO') &&
		!mediaOptions.href) {
		mediaOptions.href = href;
	}

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
			const element = generateMedia(mediaOptions);
			if (attribution) addSiteAttribution(siteModule, element);
			return element;
		},
		onMediaAttach() {
			trackLoad();
			if (mediaOptions.onAttach) mediaOptions.onAttach();
		},
		requiresPermission: false,
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

function generateMedia(options: ExpandoMedia) {
	const $span = $('<span>');
	if (options.credits) options.credits = $span.safeHtml(options.credits).html();
	if (options.caption) options.caption = $span.safeHtml(options.caption).html();

	let element;

	switch (options.type) {
		case 'GALLERY':
			element = generateGallery(options);
			break;
		case 'IMAGE':
			element = generateImage(options);
			break;
		case 'TEXT':
			element = generateText(options);
			break;
		case 'IFRAME':
			element = generateIframe(options);
			break;
		case 'VIDEO':
			element = generateVideo(options);
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

	return element;
}

function generateGallery(options: GalleryMedia) {
	const element: ExpandoMediaElement = ($(galleryTemplate(options))[0]: any);

	const piecesContainer = element.querySelector('.res-gallery-pieces');
	const individualCtrl = element.querySelector('.res-gallery-individual-controls');
	const ctrlPrev = individualCtrl.querySelector('.res-gallery-previous');
	const ctrlNext = individualCtrl.querySelector('.res-gallery-next');
	const msgPosition = individualCtrl.querySelector('.res-gallery-position');
	const ctrlConcurrentIncrease = element.querySelector('.res-gallery-increase-concurrent');

	const preloadCount = parseInt(module.options.galleryPreloadCount.value, 10) || 0;

	const filmstripLoadIncrement = parseInt(module.options.filmstripLoadIncrement.value, 10) || Infinity;
	const slideshowWhenLargerThan = parseInt(module.options.useSlideshowWhenLargerThan.value, 10) || Infinity;
	const filmstripActive = module.options.galleryAsFilmstrip.value &&
		options.src.length < slideshowWhenLargerThan;

	const pieces: [{
		generateMedia: () => ExpandoMediaElement,
		media: ?ExpandoMediaElement,
	}] = options.src.map(src => ({
		generateMedia: () => generateMedia(src),
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

			flow(
				filterMap(piece => {
					if (piece.media) return [{ media: piece.media, data: piece }];
				}),
				lazyUnload(piece => {
					const index = pieces.indexOf(piece);
					if (last > pieces.length && last % pieces.length >= index) return true;
					if (first < 0 && positiveModulo(first, pieces.length) <= index) return true;
					return index >= first && index <= last;
				})
			)(pieces);
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
	}

	element.ready = initialLoadPromise;

	return element;
}

function generateImage(options: ImageMedia) {
	const element: ExpandoMediaElement = ($(imageTemplate({
		openInNewWindow: module.options.openInNewWindow.value,
		...options,
	}))[0]: any);
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
	makeMediaZoomable(image);
	const wrapper = setMediaControls(anchor, options.src, options.src);
	makeMediaMovable(wrapper);
	keepMediaVisible(wrapper);
	makeMediaIndependentOnResize(element, wrapper);

	return element;
}

function generateIframe(options: IframeMedia) {
	const element: ExpandoMediaElement = ($(iframeTemplate({
		url: (module.options.autoplayVideo.value && options.embedAutoplay) ? options.embedAutoplay : options.embed,
		width: options.width || '640px',
		height: options.height || '360px',
	}))[0]: any);

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

	makeMediaZoomable(iframeNode, dragHandle, !options.fixedRatio);
	makeMediaMovable(iframeWrapper, dragHandle);
	keepMediaVisible(iframeWrapper);
	makeMediaIndependentOnResize(element, iframeWrapper);

	return element;
}

function generateText(options: TextMedia) {
	options.src = $('<span>').safeHtml(options.src).html();

	return (($(textTemplate(options))[0]: any): ExpandoMediaElement);
}

function generateVideo(options: VideoMedia) {
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

	return videoAdvanced(filledOptions);
}

function generateAudio(options: AudioMedia) {
	let {
		autoplay,
	} = options;

	const element: ExpandoMediaElement = ($(audioTemplate(options))[0]: any);
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

	element.appendChild(options.generate(options));

	// Always remove content, in case it contains audio or other unwanted things
	element.collapse = () => true;

	return element;
}

const trackVisit = batch(async links => {
	if (await isPrivateBrowsing()) return;

	const fullnames = links
		.map(link => $(link).closest('.thing'))
		.filter($link => !$link.hasClass('visited'))
		.map($link => $link.attr('data-fullname'));

	await ajax({
		method: 'POST',
		url: '/api/store_visits',
		data: { links: fullnames.join(',') },
	});
}, { delay: 1000 });

function trackMediaLoad(link, thing) {
	if (module.options.markVisited.value) {
		// also use reddit's mechanism for storing visited links if user has gold.
		if (document.body.classList.contains('gold')) {
			trackVisit(link);
		}

		const isNSFW = thing && thing.isNSFW();
		const sfwMode = module.options.sfwHistory.value;

		if ((!isNSFW || sfwMode !== 'none') && thing) thing.element.classList.add('visited');
		if (!isNSFW || sfwMode === 'add') addURLToHistory(link.href);
	}
}

function setMediaControls(media, lookupUrl, downloadUrl) {
	if (!module.options.mediaControls.value) return media;

	const [y, x] = module.options.mediaControlsPosition.value.split('-');
	const options = { clippy: module.options.clippy.value, lookupUrl, downloadUrl, x, y };

	const element = $(mediaControlsTemplate(options))[0];
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
				downloadUrl = new URL(downloadUrl, location.href).href;

				// Create element to trigger download
				const link = document.createElement('a');
				link.href = downloadUrl;
				link.download = '';
				click(link);
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
	const metadata = {
		name: siteModule.name,
		url: siteModule.landingPage || `//${siteModule.domains[0]}`,
		logoUrl: siteModule.logo,
		settingsLink: SettingsNavigation.makeUrlHash(module.moduleID, siteModuleOptionKey(siteModule)),
	};

	const $element = $(siteAttributionTemplate(metadata));
	const $replace = $('.res-expando-siteAttribution', media);
	if ($replace.length) {
		$element.replaceAll($replace);
	} else {
		$element.appendTo(media);
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

		const documentWidth = document.documentElement.getBoundingClientRect().width;

		const { width: mediaWidth, left: mediaLeft, right: mediaRight } = media.getBoundingClientRect();

		const basisLeft: number = (media.parentElement: any).getBoundingClientRect().left;
		const deltaLeft = mediaLeft - basisLeft;

		if (mediaWidth > documentWidth) { // Left align
			moveMedia(media, -mediaLeft, 0, resizeSources.KEEP_VISIBLE);
		} else if (mediaRight - deltaLeft > documentWidth) { // Right align
			moveMedia(media, documentWidth - mediaRight, 0, resizeSources.KEEP_VISIBLE);
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

const setMediaMaxSizeStyle = _.once(() => {
	let value = module.options.maxWidth.value;
	const maxWidth = parseInt(value, 10);
	const maxWidthUnit = _.isString(value) && value.endsWith('%') ? 'vw' : 'px';

	value = module.options.maxHeight.value;
	const maxHeight = parseInt(value, 10);
	const maxHeightUnit = _.isString(value) && value.endsWith('%') ? 'vh' : 'px';

	let style = '';
	if (maxWidth) style += `max-width: ${maxWidth}${maxWidthUnit};`;
	if (maxHeight) style += `max-height: ${maxHeight}${maxHeightUnit};`;
	if (style) addCSS(`body .res-media-max-size { ${style} }`);
});

function setMediaMaxSize(media) {
	media.classList.add('res-media-max-size');
	setMediaMaxSizeStyle();
}

function addDragListener({ media, atShiftKey, onStart, onMove }: {
	media: HTMLElement,
	atShiftKey: boolean,
	onStart?: (x: number, y: number) => void,
	onMove: (x: number, y: number, moveX: number, moveY: number) => void,
}) {
	let isActive, hasMoved, lastX, lastY;

	const handleMove = frameThrottle((e: MouseEvent) => {
		const movementX = e.clientX - lastX;
		const movementY = e.clientY - lastY;

		if (!movementX && !movementY) {
			// Mousemove may be triggered even without movement
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
			document.body.classList.add('res-media-dragging');
		}

		onMove(e.clientX, e.clientY, movementX, movementY);
		({ clientX: lastX, clientY: lastY } = e);
	});

	function handleClick(e: Event) {
		if (hasMoved) e.preventDefault();
	}

	function stop() {
		document.body.classList.remove('res-media-dragging');

		document.removeEventListener('mousemove', handleMove);
		document.removeEventListener('mouseup', stop);

		// `handleClick` is only invoked if the mouse target is `media`
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

	media.addEventListener('mousedown', initiate);
}

function makeMediaZoomable(media, dragInitiater = media, absoluteSizing = false) {
	if (!module.options.imageZoom.value) return;

	media.classList.add('res-media-zoomable');

	let initialWidth, initialDiagonal, left, top;

	function getDiagonal(x, y) {
		const w = Math.max(1, x - left);
		const h = Math.max(1, y - top);
		return Math.round(Math.hypot(w, h));
	}

	addDragListener({
		media: dragInitiater,
		atShiftKey: false,
		onStart(x, y) {
			({ left, top, width: initialWidth } = media.getBoundingClientRect());
			initialDiagonal = getDiagonal(x, y);
		},
		onMove(x, y, deltaX, deltaY) {
			if (absoluteSizing) {
				const { width, height } = media.getBoundingClientRect();
				resizeMedia(media, width + deltaX, height + deltaY);
			} else {
				const newWidth = getDiagonal(x, y) / initialDiagonal * initialWidth;
				resizeMedia(media, newWidth);
			}
		},
	});
}

function makeMediaMovable(media, dragInitiater = media) {
	if (!module.options.imageMove.value) return;

	media.classList.add('res-media-movable');

	addDragListener({
		media: dragInitiater,
		atShiftKey: true,
		onMove(x, y, deltaX, deltaY) { moveMedia(media, deltaX, deltaY); },
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

		if (!media.offsetParent) {
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
		// This is a slower method to listen to resizes, as it waits till the frame after the size is set to update.
		// Using this is however necessary when it's not possible to determine size from media events.
		elementResizeDetector().listenTo(element, () => {
			if (element.clientHeight !== lastHeight) media.emitResizeEvent();
		});

		window.addEventListener('resize', debouncedResize);

		if (media.independent) media.emitResizeEvent();
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

function videoAdvanced(options) {
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
	const player = $(videoAdvancedTemplate({
		...options,
		formattedPlaybackRate: formatPlaybackRate(options.playbackRate),
	}))[0];
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

	function sourceErrorFallback(error) {
		if (fallback) {
			console.log('Could not play video', error);
			const image = generateImage({
				type: 'IMAGE',
				title: options.title,
				caption: options.caption,
				credits: options.credits,
				src: fallback,
			});
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
	makeMediaZoomable(vid);
	setMediaControls(vid, undefined, options.sources[0].source);
	makeMediaMovable(container);
	keepMediaVisible(container);
	makeMediaIndependentOnResize(element, container);

	return element;
}

export function moveMedia(ele: HTMLElement, deltaX: number, deltaY: number, source?: number = resizeSources.USER_MOVE): void {
	ele.style.marginLeft = `${((parseFloat(ele.style.marginLeft, 10) || 0) + deltaX).toFixed(2)}px`;
	ele.style.marginTop = `${((parseFloat(ele.style.marginTop, 10) || 0) + deltaY).toFixed(2)}px`;

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
