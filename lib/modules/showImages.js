/* @flow */

import _ from 'lodash';
import ResizeObserverLite from 'resize-observer-lite';
import { flow, keyBy, map } from 'lodash/fp';
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
	forEachSeq,
	idleThrottle,
	frameThrottle,
	isPageType,
	string,
	waitForEvent,
	watchForElements,
	watchForThings,
	watchForRedditEvents,
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
	Storage,
} from '../environment';
import * as Options from '../core/options';
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
	videoTemplate,
} from './showImages/templates';
import {
	Expando,
	primaryExpandos,
} from './showImages/expando';
import __hosts from 'sibling-loader?import=default!./hosts/default';

const siteModules: { [string]: Host<any, any> } = flow(
	() => Object.values(__hosts),
	map(host => downcast(host, Host)), // ensure that all hosts are instances of `Host`
	keyBy(host => host.moduleID)
)();

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
	startVideosMuted: {
		title: 'showImagesStartVideosMutedTitle',
		type: 'boolean',
		value: false,
		description: 'showImagesStartVideosMutedDesc',
	},
	onlyPlayMutedWhenVisible: {
		title: 'showImagesOnlyPlayMutedWhenVisibleTitle',
		type: 'boolean',
		value: true,
		description: 'showImagesOnlyPlayMutedWhenVisibleDesc',
	},
	maxSimultaneousPlaying: {
		title: 'showImagesMaxSimultaneousPlayingTitle',
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
	hidePinnedRedditVideos: {
		title: 'showImagesHidePinnedRedditVideosTitle',
		type: 'boolean',
		value: false,
		description: 'showImagesHidePinnedRedditVideosDesc',
		bodyClass: true,
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

	watchForElements(['selfText'], null, scanBody);
	watchForThings(['comment', 'message'], thing => scanBody(thing.getTextBody()), { id: module });
	watchForThings(['post'], thing => checkElementForMedia(thing.getPostLink()), { id: module });

	watchForRedditEvents('comment', (placeholder, { _: { update } }) => {
		if (update) return;
		const comment = placeholder.closest('.Comment');
		// TODO `comment` should be refined to the text body, but it doesn't yet have a class
		scanBody(comment);
	});

	// selftexts in comment pages evidently does not emit an event
	// TODO this prevent expando from being added when there's already media there
	watchForRedditEvents('postAuthor', (placeholder, { _: { update } }) => {
		if (update) return;
		const body = placeholder.closest('[data-test-id="post-content"]');
		// Ignore posts that has native media
		if (body && body.querySelector('.media-element')) return;
		scanBody(body);
	});
};

module.contentStart = () => {
	if (module.options.showViewImagesTab.value) viewImagesButton();

	if (module.options.mediaBrowse.value) {
		SelectedEntry.addListener(mediaBrowse, 'instantly');
	}
};

module.go = () => {
	if (isPageType('wiki')) scanBody(document.querySelector('.wiki-page-content'));

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
};

function siteModuleOptionKey(siteModule) {
	const id = siteModule.moduleID;
	return `display_${id}`;
}

function isSiteModuleEnabled(siteModule) {
	const key = siteModuleOptionKey(siteModule);
	return !module.options[key] || module.options[key].value;
}

const sitesMap = _.once(() =>
	Object.values(siteModules)
		.filter(isSiteModuleEnabled)
		.reduce((map, siteModule) => {
			for (const domain of siteModule.domains) {
				map.set(domain, (map.get(domain) || []).concat(siteModule));
			}
			return map;
		}, new Map())
);

// A missing subdomain matches all subdomains, for example:
// A module with `domains: ['example.com']` will match `www.example.com` and `example.com`
// A module with `domains: ['www.example.com']` will match only `www.example.com`
function* modulesForHostname(hostname) {
	do {
		for (const m of sitesMap().get(hostname) || []) yield m;
	} while ((hostname = hostname.replace(/^.+?(\.|$)/, '')));

	for (const m of genericHosts) yield m;
}

/**
 * enableConserveMemory
 * attempt to unload collapsed expando's & images that are off screen in order
 * to save memory
 *
 * @returns {void}
 */
function enableConserveMemory() {
	// Making elements fullscreen makes the intersectionobserver report that nothing is intersecting
	// $FlowIssue `mozFullScreenElement` is not recognized
	const fullscreenActive = () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement: any);

	// x-axis is set to 100000% in order to not unload images when scrolling too far horizontally
	const rootMargin = '50% 100000%';

	const boxMap = new WeakMap();
	const ioBox = new IntersectionObserver(entries => {
		for (const { isIntersecting, target } of entries) {
			if (!isIntersecting && fullscreenActive()) return;
			const { media } = downcast(boxMap.get(target), Expando);
			if (media) media.setLoaded(isIntersecting);
			else ioBox.unobserve(target);
		}
	}, { rootMargin });

	const buttonMap = new WeakMap();
	const ioButton = new IntersectionObserver(entries => {
		if (fullscreenActive()) return;
		for (const { isIntersecting, target } of entries) {
			const expando = downcast(buttonMap.get(target), Expando);
			const { open } = expando;
			if (!isIntersecting && !open) {
				ioButton.unobserve(target);
				expando.empty();
			}
		}
	}, { rootMargin });

	window.addEventListener('scroll', idleThrottle(() => {
		for (const expando of primaryExpandos.values()) {
			if (expando.isAttached()) {
				const { box, media, button } = expando;
				if (!media) continue;
				if (media.supportsUnload()) {
					ioBox.observe(box);
					boxMap.set(box, expando);
				} else {
					ioButton.observe(button);
					buttonMap.set(button, expando);
				}
			} else {
				expando.destroy();
			}
		}
	}));
}

let autoExpandActive = false;
let mediaBrowseModeActive = false;

export const viewImagesButton = _.once(() => CreateElement.tabMenuItem({
	text: 'show images',
	className: 'res-show-images',
	onChange: active => {
		autoExpandActive = active;
		// When activated, open the new ones in addition to the ones already open
		// When deactivated, close all which are open
		for (const expando of Array.from(primaryExpandos.values()).filter(expando => expando instanceof Expando && expando.button.offsetParent)) {
			const open = isExpandWanted(expando);
			if (open) expando.expand();
			else if (!autoExpandActive) expando.collapse();
		}
	},
}));

export function toggleThingExpandos(thing: Thing, { scrollOnToggle }: {| scrollOnToggle?: boolean |} = {}): void {
	const expandos = Expando.getAllExpandosFrom(thing);
	if (!expandos.length) return;

	const openExpandos = expandos.filter(v => v.open);

	// If any open expandos exists within thing, collapse all
	// Else, expand all
	if (openExpandos.length) {
		for (const expando of openExpandos) expando.collapse();

		if (scrollOnToggle) {
			// Only scroll downwards to the top of the entry, to make more space for the expandos
			scrollToElement(thing.entry, null, { scrollStyle: 'directional', restrictDirectionTo: 'up' });
		}
	} else {
		for (const expando of expandos) {
			if (
				!(expando instanceof Expando) ||
				isExpandWanted(expando, { thing, autoExpandFirstVisibleNonMutedInThing: true, autoExpand: true, autoExpandTypes: [], ignoreDuplicatesScope: thing.entry })
			) {
				expando.expand();
			}
		}

		if (scrollOnToggle) {
			// Only scroll downwards to the top of the entry, to make more space for the expandos
			scrollToElement(thing.entry, null, { scrollStyle: 'top', restrictDirectionTo: 'down' });
		}
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
		expando.types.includes('non-muted') && (expando.open || expando.expandWanted)
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

	const expandoIsNonMuted = expando.types.includes('non-muted');

	const typeCriteriaOK = matchesTypes(autoExpandTypes, expando.types);
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
			<p>${permissions.map(url => `<code>${(urlStripRe.exec(url): any)[0]}</code>`).join(', ')}</p>
			<p>Be assured RES does not access/modify any of your information on these domains - it only accesses the public API.</p>
		`,
	});
	return Permissions.request(permissions);
}

const generateSiteModuleLock = _.memoize(async siteModule => {
	if (!siteModule.permissions || await Permissions.has(siteModule.permissions)) return;

	let resolve;
	return {
		promise: new Promise(_resolve => { resolve = _resolve; }),
		open: () => promptSiteModulePermissions(siteModule).then(resolve),
	};
});

function getMediaInfo(mediaUrl, thing) {
	for (const siteModule of modulesForHostname(mediaUrl.hostname)) {
		const detectResult = siteModule.detect(mediaUrl, thing);
		if (detectResult) {
			return { detectResult, siteModule, href: mediaUrl.href };
		}
	}
}

function scanBody(element: ?Element) {
	if (!element) return;
	for (const link of element.querySelectorAll('a')) {
		checkElementForMedia(downcast(link, HTMLAnchorElement));
	}
}

const linksMap: WeakMap<HTMLAnchorElement, Expando> = new WeakMap();
export function getLinkExpando(link: HTMLAnchorElement): ?Expando {
	return linksMap.get(link);
}

const inText = element => !!element.closest('.md, .search-result-footer');

async function checkElementForMedia(element: HTMLAnchorElement) {
	const thing = Thing.from(element);
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
	const mediaInfo = getMediaInfo(mediaUrl, thing);

	if (!mediaInfo) return;

	if (thing && thing.isCrosspost() && module.options.crossposts.value === 'none') {
		return;
	}

	if (mediaUrl && module.options.expandoCommentRedirects.value === 'rewrite') {
		element.href = mediaUrl.href;
		element.removeAttribute('data-inbound-url');
	}

	const expando = new Expando(mediaInfo.href);
	linksMap.set(element, expando);

	expando.button.setAttribute('data-host', mediaInfo.siteModule.moduleID);
	expando.box.setAttribute('data-host', mediaInfo.siteModule.moduleID);

	expando.onExpand(() => { trackMediaLoad(element, thing); });

	if (nativeExpando) nativeExpando.detach();
	placeExpando(expando, element, thing);

	const lock = await generateSiteModuleLock(mediaInfo.siteModule);
	if (lock) {
		expando.setLock(lock);
		await lock.promise;
	}

	try {
		await completeExpando(expando, thing, mediaInfo);
	} catch (e) {
		console.error(`showImages: could not create expando for ${mediaInfo.href}`);
		console.error(e);

		if (nativeExpando) nativeExpando.reattach();
		expando.destroy();
		linksMap.delete(element);
	}
}

function placeExpando(expando, element, thing) {
	if (!inText(element) && thing && thing.getTitleElement()) {
		if (element.parentElement) element.parentElement.after(expando.button);
		thing.entry.appendChild(expando.box);
	} else {
		$(element).add($(element).next('.keyNavAnnotation')).last()
			.after(expando.box)
			.after($('<span class="res-freetext-expando">').append(expando.button));
	}
}

async function completeExpando(expando, thing, mediaInfo) {
	expando.initialize(await retrieveExpandoOptions(thing, mediaInfo));

	const hideButton = thing && thing.getHideElement();
	if (hideButton) hideButton.addEventListener('click', () => { expando.destroy(); });

	if (thing && thing.isComment()) {
		expando.onExpand(_.once(() => {
			let wasOpen;

			// Collapse / restore expandos when toggling comment visibility
			$([thing, ...thing.getParents()].map(e => e.entry))
				.find('.tagline > .expand, > .buttons .toggleChildren')
				.click(() => {
					if (thing.isContentVisible()) {
						if (wasOpen && expando.media) expando.expand();
					} else {
						wasOpen = expando.open;
						if (expando.open) expando.collapse();
					}
				});
		}));
	}

	// The d2x lightbox hides overflowing media
	expando.onExpand(() => {
		const lightbox = expando.media.element.closest('#overlayScrollContainer');
		if (lightbox) lightbox.firstChild.style.overflowY = 'initial';
	});

	// Start loading media early to make it snappier
	expando.button.addEventListener('mousedown', () => { preloadMedia([expando]); });

	if (module.options.autoMaxHeight.value && thing && inText(expando.button)) {
		thing.entry.addEventListener('mediaResize', updateParentHeight);
	}

	if (!expando.open) {
		let autoExpand;
		let autoExpandFirstVisibleNonMutedInThing;

		if (module.options.autoExpandSelfText.value && inText(expando.button) && thing && thing.isSelfPost() && !isPageType('comments')) {
			const dontAutoExpandNSFW = !module.options.autoExpandSelfTextNSFW.value && thing.isNSFW();
			autoExpand = !dontAutoExpandNSFW;
			autoExpandFirstVisibleNonMutedInThing = module.options.autoExpandSelfTextFirstVisibleNonMuted.value;
		}

		if (isExpandWanted(expando, { thing, autoExpand, autoExpandFirstVisibleNonMutedInThing })) {
			expando.expand();
		}
	}
}

const retrieveExpandoOptions = _.memoize(async (thing, { siteModule, detectResult, href }) => {
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

	const attribution = module.options.showSiteAttribution.value &&
		thing && thing.isPost() && !thing.isSelfPost() &&
		siteModule.domains.length && siteModule.attribution !== false;

	const isMuted = media => media.muted || ['IMAGE', 'TEXT'].includes(media.type);
	const muted = mediaOptions.type === 'GALLERY' ? mediaOptions.src.every(isMuted) : isMuted(mediaOptions);

	return {
		types: [
			mediaOptions.type,
			muted ? 'muted' : 'non-muted',
			...((mediaOptions.expandoClass || '').split(' ')),
		].filter(v => v).map(s => s.toLowerCase()),
		buttonInfo: getMediaButtonInfo(mediaOptions),
		generateMedia() {
			const media = generateMedia(mediaOptions, { href });
			if (module.options.crossposts.value === 'withMetadata' && thing && thing.isCrosspost()) {
				media.element.prepend(crosspostMetadataTemplate(thing.element.dataset));
			}
			if (attribution) addSiteAttribution(siteModule, media);
			return media;
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

function generateMedia(options: ExpandoMedia, context: {| href: string |}): Media {
	const $span = $('<span>');
	if (options.credits) options.credits = $span.safeHtml(options.credits).html();
	if (options.caption) options.caption = $span.safeHtml(options.caption).html();

	switch (options.type) {
		case 'GALLERY': return new Gallery(options, context);
		case 'IMAGE': return new Image(options, context);
		case 'TEXT': return new Text(options);
		case 'IFRAME': return new Iframe(options);
		case 'VIDEO': return new Video(options, context);
		case 'AUDIO': return new Audio(options);
		case 'GENERIC_EXPANDO': return new Generic(options);
		default: throw new Error(`Unreachable: invalid media type ${options.type}`);
	}
}

const stopEventPropagation = e => { e.stopImmediatePropagation(); };

export class Media {
	element: HTMLElement;

	ready: ?Promise<any>;

	onAttach: ?() => void;
	isAttached(): boolean { return document.body.contains(this.element); }

	expand(): void | Promise<void> { this.setLoaded(true); }
	collapse(): void { this.setLoaded(false); }

	supportsUnload(): boolean { return false; }
	_state: 'loaded' | 'unloaded' = 'unloaded';
	_unload(): void {}
	_restore(): void {}

	setLoaded(state: boolean) {
		if (state && this._state === 'unloaded') {
			this.element.removeEventListener('mediaResize', stopEventPropagation, true);
			this._restore();
			this._state = 'loaded';
		} else if (!state && this._state === 'loaded') {
			this.element.addEventListener('mediaResize', stopEventPropagation, true);
			this._unload();
			this._state = 'unloaded';
		}
	}
}

class Gallery extends Media {
	filmstripLoadIncrement = parseInt(module.options.filmstripLoadIncrement.value, 10) || Infinity;
	preloadCount = parseInt(module.options.galleryPreloadCount.value, 10) || 0;

	individualCtrl;
	msgPosition;
	ctrlToFilmstrip;
	ctrlConcurrentIncrease;

	pieces: Array<{
		generateMedia: () => Media,
		media: ?Media,
		wrapper: HTMLElement,
	}>;

	lastRevealedPiece = null;
	filmstripActive: boolean;
	rememberResizeWidth: boolean;
	lastResizedWidth: number;

	constructor(options: GalleryMedia, context) {
		super();

		this.element = galleryTemplate({
			title: options.title,
			caption: options.caption,
			credits: options.credits,
			src: options.src,
		});

		const piecesContainer = this.element.querySelector('.res-gallery-pieces');
		this.individualCtrl = this.element.querySelector('.res-gallery-individual-controls');
		const ctrlPrev = this.individualCtrl.querySelector('.res-gallery-previous');
		const ctrlNext = this.individualCtrl.querySelector('.res-gallery-next');
		this.msgPosition = this.individualCtrl.querySelector('.res-gallery-position');
		this.ctrlToFilmstrip = this.individualCtrl.querySelector('.res-gallery-to-filmstrip');
		this.ctrlConcurrentIncrease = this.element.querySelector('.res-gallery-increase-concurrent');

		this.pieces = options.src.map(src => ({
			generateMedia: () => generateMedia(src, context),
			media: null,
			wrapper: document.createElement('div'),
		}));
		piecesContainer.append(...this.pieces.map(({ wrapper }) => wrapper));

		const slideshowWhenLargerThan = parseInt(module.options.useSlideshowWhenLargerThan.value, 10) || Infinity;
		this.filmstripActive = module.options.galleryAsFilmstrip.value && this.pieces.length < slideshowWhenLargerThan;

		if (this.filmstripActive || this.pieces.length === 1) {
			this.ready = this.expandFilmstrip();
			this.ctrlConcurrentIncrease.addEventListener('click', () => this.expandFilmstrip());
		} else {
			this.element.classList.add('res-gallery-slideshow');
			this.ready = this.changeSlideshowPiece(0);
			ctrlPrev.addEventListener('click', () => { this.changeSlideshowPiece(-1); });
			ctrlNext.addEventListener('click', () => { this.changeSlideshowPiece(1); });

			waitForEvent(this.ctrlToFilmstrip, 'click').then(() => {
				this.expandFilmstrip();
				this.ctrlConcurrentIncrease.addEventListener('click', () => this.expandFilmstrip());
				this.element.classList.remove('res-gallery-slideshow');
			});
		}
	}

	shouldRememberResizeWidth() {
		return module.options.galleryRememberWidth.value && !this.filmstripActive;
	}

	rememberWidth(piece) {
		const resizedElement = piece.media && piece.media.element.querySelector('.res-media-zoomable');
		// Only resized elements have style.width
		const resizedWidth = resizedElement && parseInt(resizedElement.style.width, 10);
		if (resizedWidth) this.lastResizedWidth = resizedWidth;
	}

	restoreWidth(piece) {
		if (!this.lastResizedWidth) return;
		const resizeElement = piece.media && piece.media.element.querySelector('.res-media-zoomable');
		if (resizeElement) resizeMedia(resizeElement, this.lastResizedWidth);
	}

	revealPiece(piece) {
		if (this.shouldRememberResizeWidth() && this.lastRevealedPiece) this.rememberWidth(this.lastRevealedPiece);
		this.lastRevealedPiece = piece;

		piece.media = piece.media || piece.generateMedia();
		const { media, wrapper } = piece;
		if (!media.isAttached()) wrapper.appendChild(media.element);
		wrapper.hidden = false;
		if (this.shouldRememberResizeWidth()) this.restoreWidth(piece);
		// When preloading the gallery object, don't run the `expand` method on the piece as that may cause audio to play
		if (this.isAttached()) media.expand();
	}

	preloadAhead() {
		const preloadFrom = this.pieces.indexOf(this.lastRevealedPiece);
		const preloadTo = Math.min(preloadFrom + this.preloadCount + 1, this.pieces.length);

		return preloadMedia(this.pieces.slice(preloadFrom, preloadTo));
	}

	async expandFilmstrip() {
		const revealFrom = this.lastRevealedPiece ? this.pieces.indexOf(this.lastRevealedPiece) : 0;
		const revealTo = Math.min(revealFrom + this.filmstripLoadIncrement, this.pieces.length);

		this.ctrlConcurrentIncrease.hidden = true;

		// reveal new pieces
		await forEachSeq(this.pieces.slice(revealFrom, revealTo), piece => {
			this.revealPiece(piece);
			return piece.media && piece.media.ready;
		});

		if (revealTo < this.pieces.length) {
			this.ctrlConcurrentIncrease.innerText = `Show next ${Math.min(this.filmstripLoadIncrement, this.pieces.length - revealTo)} pieces`;
			this.ctrlConcurrentIncrease.hidden = false;
		}

		return this.preloadAhead();
	}

	changeSlideshowPiece(step) {
		const previous = this.lastRevealedPiece;
		const previousIndex = previous ? this.pieces.indexOf(previous) : 0;

		let newIndex = previousIndex + step;
		// Allow wrap-around
		newIndex = positiveModulo(newIndex, this.pieces.length);

		this.individualCtrl.setAttribute('first-piece', String(newIndex === 0));
		this.individualCtrl.setAttribute('last-piece', String(newIndex === this.pieces.length - 1));
		this.msgPosition.innerText = String(newIndex + 1);

		this.revealPiece(this.pieces[newIndex]);

		if (previous) {
			const { media, wrapper } = previous;
			if (!media) throw new Error();
			media.collapse();
			wrapper.hidden = true;
		}

		return this.preloadAhead();
	}

	supportsUnload() {
		return this.pieces.every(({ media }) => !media || media.supportsUnload()) || false;
	}

	setLoaded(state) {
		for (const { media } of this.pieces) {
			if (media) media.setLoaded(state);
		}
	}
}

class Image extends Media {
	image: HTMLImageElement;
	src: string;

	constructor({
		title,
		caption,
		credits,
		src,
		href,
	}: ImageMedia, context) {
		super();

		this.src = src;

		this.element = imageTemplate({
			title,
			caption,
			credits,
			src,
			href: href || context.href,
			openInNewWindow: module.options.openInNewWindow.value,
		});
		this.image = downcast(this.element.querySelector('img.res-image-media'), HTMLImageElement);
		const anchor = this.element.querySelector('a.res-expando-link');

		this.ready = waitForEvent(this.image, 'load', 'error');

		this.image.addEventListener('error', () => {
			this.element.classList.add('res-media-load-error');
		});

		if (module.options.displayOriginalResolution.value) {
			this.image.addEventListener('load', () => {
				this.image.title = `${this.image.naturalWidth} × ${this.image.naturalHeight} px`;
			});
		}

		setMediaMaxSize(this.image);
		makeMediaZoomable(this.element, this.image);
		const wrapper = setMediaControls(anchor, src, src);
		makeMediaMovable(this.element, wrapper);
		keepMediaVisible(wrapper);
		makeMediaIndependent(wrapper);
	}

	supportsUnload() {
		return true;
	}

	_unload() {
		this.image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
	}

	_restore() {
		this.image.src = this.src;
	}
}

class Iframe extends Media {
	loaded: boolean = false;
	iframe: HTMLIFrameElement;
	pauseCommand: ?string;
	playCommand: ?string;

	constructor({
		embed,
		embedAutoplay,
		width = '640px',
		height = '360px',
		fixedRatio = false,
		pause: pauseCommand,
		play: playCommand,
	}: IframeMedia) {
		super();

		this.pauseCommand = pauseCommand;
		this.playCommand = playCommand;

		this.element = iframeTemplate({
			url: (module.options.autoplayVideo.value && embedAutoplay) ? embedAutoplay : embed,
			width,
			height,
		});
		this.iframe = downcast(this.element.querySelector('iframe'), HTMLIFrameElement);
		const iframeWrapper = downcast(this.element.firstElementChild, HTMLElement);
		const dragHandle = this.element.querySelector('.res-iframe-expando-drag-handle');

		makeMediaZoomable(this.element, this.iframe, dragHandle, !fixedRatio);
		makeMediaMovable(this.element, iframeWrapper, dragHandle);
		keepMediaVisible(iframeWrapper);
		makeMediaIndependent(iframeWrapper);
	}

	async expand() {
		if (module.options.autoplayVideo.value && this.playCommand) {
			if (!this.loaded) await waitForEvent(this.iframe, 'load');
			this.loaded = true;

			try {
				this.iframe.contentWindow.postMessage(this.playCommand, '*');
			} catch (e) {
				console.error('Could not post "play" command to iframe', this, e);
			}
		}
	}

	collapse() {
		if (this.pauseCommand) {
			try {
				this.iframe.contentWindow.postMessage(this.pauseCommand, '*');
				return;
			} catch (e) {
				console.error('Could not post "pause" command to iframe', this, e);
			}
		}

		// If we couldn't pause the iframe, remove it
		this.element.remove();
	}
}

class Text extends Media {
	constructor({
		title,
		credits,
		src,
	}: TextMedia) {
		super();

		this.element = textTemplate({
			title,
			credits,
			src: $('<span>').safeHtml(src).html(),
		});
	}
}

class Audio extends Media {
	autoplay: boolean;
	audio: HTMLAudioElement;

	constructor({
		autoplay = false,
		loop,
		sources,
	}: AudioMedia) {
		super();

		this.autoplay = autoplay;

		this.element = audioTemplate({
			loop,
			sources,
		});
		this.audio = downcast(this.element.querySelector('audio'), HTMLAudioElement);
	}

	collapse() {
		// Audio is auto-paused when detached from DOM
		if (!this.isAttached()) return;

		this.autoplay = !this.audio.paused;
		if (!this.audio.paused) this.audio.pause();
	}

	expand() {
		if (this.autoplay) this.audio.play();
	}
}

class Generic extends Media {
	constructor(options: GenericMedia) {
		super();

		this.onAttach = options.onAttach;

		this.element = document.createElement('div');
		this.element.appendChild(options.generate());
	}

	// Always remove content, in case it contains audio or other unwanted things
	collapse() {
		this.element.remove();
	}
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
	media.replaceWith(element);
	element.appendChild(media);

	media.classList.add('res-media-rotatable');

	let rotationState = 0;

	function refreshRotatedSize({ width, height }) {
		const horizontal = rotationState % 2 === 0;
		element.style.height = `${horizontal ? height : width}px`;
		element.style.width = `${horizontal ? width : height}px`;
	}

	const hookInResizeObserver = _.once(() => {
		new ResizeObserverLite(refreshRotatedSize).observe(media);
	});

	function updateRotation() {
		hookInResizeObserver();
		media.setAttribute('rotation', String(positiveModulo(rotationState, 4)));
		refreshRotatedSize(media.getBoundingClientRect());
	}

	controls.addEventListener('click', (e: Event) => {
		switch (e.target.dataset.action) {
			case 'rotateLeft':
				--rotationState;
				updateRotation();
				break;
			case 'rotateRight':
				++rotationState;
				updateRotation();
				break;
			case 'download':
				Permissions.request(['downloads']).then(() => {
					const re = /(?:\.([^.]+))?$/;
					const ext = re.exec(downloadUrl);
					const thing = Thing.from(media);
					let title = thing && thing.getTitle();
					if (title && ext) {
						let extension = ext[1];
						if (extension.includes('?')) extension = extension.split('?')[0];
						title = title.replace(/[*|?:"<>\\\/]/gi, '');
						const filename = `${title}.${extension}`;
						download(downloadUrl, filename);
					} else download(downloadUrl);
				});
				break;
			case 'imageLookup':
				// Google doesn't like image url's without a protacol
				lookupUrl = new URL(downcast(lookupUrl, 'string'), location.href).href;

				// Escape query string parameters
				openNewTab(string.encode`https://images.google.com/searchbyimage?image_url=${lookupUrl}`);
				break;
			case 'showImageSettings':
				SettingsNavigation.open(module.moduleID, 'mediaControls');
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
	const $replace = $('.res-expando-siteAttribution', media.element);
	if ($replace.length) {
		$element.replaceAll($replace);
	} else {
		$element.addClass('res-expando-siteAttribution-generic').appendTo(media.element);
	}
}

function keepMediaVisible(media) {
	media.classList.add('res-media-keep-visible');

	const basisLeft = _.once(() => downcast(media.parentElement, HTMLElement).getBoundingClientRect().left);
	let isAligned = false;

	media.addEventListener('mediaResize', ({ detail: { width: mediaWidth } }: any) => {
		const { width: viewportWidth } = getViewportSize();

		if (!isAligned && basisLeft() + mediaWidth < viewportWidth) return;

		const { left: mediaLeft, right: mediaRight } = media.getBoundingClientRect();

		const deltaLeft = mediaLeft - basisLeft();

		if (mediaWidth > viewportWidth) { // Left align
			isAligned = true;
			moveMedia(media, -mediaLeft, 0);
		} else if (mediaRight - deltaLeft > viewportWidth) { // Right align
			isAligned = true;
			moveMedia(media, viewportWidth - mediaRight, 0);
		} else if (deltaLeft) { // Reset
			isAligned = false;
			moveMedia(media, -deltaLeft, 0);
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
	// Invoke handleMove immediately to avoid pauses, but only once per frame
	let hasFrameExecution = false;
	const setFrameExecution = (() => {
		const throttle = frameThrottle(() => { hasFrameExecution = false; });
		return () => {
			throttle();
			hasFrameExecution = true;
		};
	})();

	let isActive, hasMoved, lastX, lastY;

	const handleMove = (e: MouseEvent) => {
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
			requestAnimationFrame(() => { media.classList.add('res-media-dragging'); });
		}

		if (hasFrameExecution) return;
		setFrameExecution();

		onMove(e.clientX, e.clientY, movementX, movementY);
		({ clientX: lastX, clientY: lastY } = e);
	};

	function handleClick(e: Event) {
		if (hasMoved) e.preventDefault();
	}

	function stop() {
		requestAnimationFrame(() => { media.classList.remove('res-media-dragging'); });

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

function makeMediaZoomable(media: HTMLElement, element: HTMLElement, dragInitiater: HTMLElement = element, absoluteSizing: boolean = false) {
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

function makeMediaMovable(media: HTMLElement, element: HTMLElement, dragInitiater: HTMLElement = element) {
	if (!module.options.imageMove.value) return;

	element.classList.add('res-media-movable');

	const mediaManuallyMoved = _.once(() => { element.dispatchEvent(new CustomEvent('mediaManuallyMoved', { bubbles: true })); });

	addDragListener({
		media,
		element: dragInitiater,
		atShiftKey: true,
		onMove(x, y, deltaX, deltaY) { moveMedia(element, deltaX, deltaY); mediaManuallyMoved(); },
	});
}

function makeMediaIndependent(element: HTMLElement) {
	const wrapper = document.createElement('div');
	const independent = document.createElement('div');
	element.replaceWith(wrapper);
	wrapper.appendChild(independent);
	independent.appendChild(element);

	independent.classList.add('res-media-independent');
	wrapper.style.willChange = 'height';

	wrapper.addEventListener('mediaResize', ({ detail: { height } }: any) => {
		wrapper.style.height = `${height}px`;
	});

	const observer = new ResizeObserverLite(contentRect => {
		element.dispatchEvent(new CustomEvent('mediaResize', { detail: contentRect, bubbles: true }));
	});
	observer.observe(element);
	waitForEvent(element, 'mediaManuallyMoved').then(() => { observer.disconnect(); });
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

class Video extends Media {
	static volumeStorage = Storage.wrap('showImages.video.volume', (1: number));

	video: HTMLVideoElement;
	autoplay: boolean;
	time: number;
	frameRate: number;
	useVideoManager: boolean;

	constructor({
		title,
		caption,
		credits,
		fallback,
		frameRate = 24,
		href,
		loop = false,
		muted = false,
		playbackRate = 1,
		poster,
		reversable = false,
		reversed = false,
		source,
		sources,
		time = 0,
	}: VideoMedia, context) {
		super();

		this.useVideoManager = module.options.onlyPlayMutedWhenVisible.value && muted;

		this.autoplay = muted || module.options.autoplayVideo.value;
		this.time = time;
		this.frameRate = frameRate;

		this.element = videoTemplate({
			title,
			caption,
			credits,
			href: href || context.href,
			source,
			// Prevent poster from flashing before the video is ready when autoplaying
			poster: !this.autoplay && poster || '',
			hasAudio: !muted,
			loop,
			reversable,
			openInNewWindow: module.options.openInNewWindow.value,
			formattedPlaybackRate: this.formatMultilineNumber(playbackRate, 'x'),
		});
		this.video = downcast(this.element.querySelector('video'), HTMLVideoElement);
		const container = this.element.querySelector('.res-video-container');

		const msgError = this.element.querySelector('.res-video-error');
		const displayError = (error: Error | ProgressEvent) => {
			if (msgError.hidden) {
				msgError.hidden = false;
				$('<span>').text(`Could not play video: ${error.message ? String(error.message) : 'Unknown error'}`).appendTo(msgError);
			}
		};

		const sourceElements = $(_.compact(sources.map(v => {
			if (!this.video.canPlayType(v.type)) return null;
			const source = document.createElement('source');
			source.src = v.source;
			source.type = v.type;
			if (v.reverse) source.dataset.reverse = v.reverse;
			return source;
		}))).appendTo(this.video).get();

		if (!sourceElements.length) {
			if (fallback) {
				return new Image({
					type: 'IMAGE',
					title,
					caption,
					credits,
					src: fallback,
				}, context);
			} else {
				displayError(new Error('No playable sources were found'));
			}
		}

		const lastSource = sourceElements[sourceElements.length - 1];
		lastSource.addEventListener('error', displayError);

		if (reversed) this.reverse();

		this.ready = Promise.race([waitForEvent(this.video, 'suspend'), waitForEvent(lastSource, 'error')]);

		const setPlayIcon = () => {
			if (!this.video.paused) this.element.setAttribute('playing', '');
			else this.element.removeAttribute('playing');
		};

		this.video.addEventListener('pause', () => {
			setPlayIcon();
			// If browser controls are shown, stop auto mananging since that could cause conflicts (e.g. force play when paused by user)
			if (this.video.controls && this.useVideoManager) mutedVideoManager().unobserve(this.video);
		});
		this.video.addEventListener('play', setPlayIcon);

		this.video.addEventListener('loadedmetadata', () => { if (this.time !== this.video.currentTime) this.video.currentTime = this.time; });
		this.video.playbackRate = playbackRate;

		// Ignore events which might be meant for controls
		this.video.addEventListener('mousedown', (e: MouseEvent) => {
			if (this.video.hasAttribute('controls')) {
				const { height, top } = this.video.getBoundingClientRect();
				let controlsBottomHeight = 0;
				if (process.env.BUILD_TARGET === 'firefox') controlsBottomHeight = 40;
				if ((height - controlsBottomHeight) < (e.clientY - top)) {
					e.stopImmediatePropagation();
				}
			}
		});

		Promise.all([waitForEvent(this.element, 'mouseenter'), waitForEvent(this.video, 'loadedmetadata')])
			.then(() => this.addControls());

		new MutationObserver(() =>
			this.element.classList.toggle('res-video-has-native-controls', this.video.hasAttribute('controls'))
		).observe(this.video, { attributes: true });

		if (!loop && this.autoplay) {
			waitForEvent(this.video, 'ended').then(() => this.stopAutoplay());
		}

		if (!muted) {
			if (module.options.startVideosMuted.value) this.video.muted = true;
			Promise.all([waitForEvent(this.video, 'canplay'), Video.volumeStorage.get()]).then(([, volume]) => {
				this.video.volume = volume;
			});
		}

		setMediaMaxSize(this.video);
		makeMediaZoomable(this.element, this.video);
		setMediaControls(this.video, undefined, sources[0].source);
		makeMediaMovable(this.element, container);
		keepMediaVisible(container);
		makeMediaIndependent(container);
	}

	reverse() {
		this.time = this.video.duration - this.video.currentTime;
		if (isNaN(this.time)) this.time = 0;

		for (const v of this.video.querySelectorAll('source')) {
			// $FlowIssue
			[v.src, v.dataset.reverse] = [v.dataset.reverse, v.src];
		}

		this.video.load();
		this.video.play();

		// $FlowIssue
		this.element.toggleAttribute('reversed');
	}

	formatMultilineNumber(value: number, suffix: string) {
		return `${value.toFixed(2).replace('.', '.\u200B'/* zwsp */)}${suffix}`;
	}

	addControls() {
		const ctrlContainer = this.element.querySelector('.res-video-controls');
		const ctrlReverse = ctrlContainer.querySelector('.res-video-reverse');
		const ctrlTogglePause = ctrlContainer.querySelector('.res-video-toggle-pause');
		const ctrlSpeedDecrease = ctrlContainer.querySelector('.res-video-speed-decrease');
		const ctrlSpeedIncrease = ctrlContainer.querySelector('.res-video-speed-increase');
		const ctrlTimeDecrease = ctrlContainer.querySelector('.res-video-time-decrease');
		const ctrlTimeIncrease = ctrlContainer.querySelector('.res-video-time-increase');

		const progress = this.element.querySelector('.res-video-progress');
		const indicatorPosition = progress.querySelector('.res-video-position');
		const ctrlPosition = progress.querySelector('.res-video-position-thumb');

		const msgSpeed = ctrlContainer.querySelector('.res-video-speed');
		const msgTime = ctrlContainer.querySelector('.res-video-time');

		ctrlTogglePause.addEventListener('click', () => {
			if (this.video.paused) this.video.play(); else this.video.pause();
			if (this.video.paused) this.stopAutoplay();
		});
		if (ctrlReverse) ctrlReverse.addEventListener('click', () => this.reverse());

		ctrlSpeedDecrease.addEventListener('click', () => { this.video.playbackRate /= 1.1; });
		ctrlSpeedIncrease.addEventListener('click', () => { this.video.playbackRate *= 1.1; });
		ctrlTimeDecrease.addEventListener('click', () => { this.video.currentTime -= 1 / this.frameRate; });
		ctrlTimeIncrease.addEventListener('click', () => { this.video.currentTime += 1 / this.frameRate; });

		this.video.addEventListener('ratechange', () => {
			msgSpeed.textContent = this.formatMultilineNumber(this.video.playbackRate, 'x');
		});
		this.video.addEventListener('timeupdate', () => {
			indicatorPosition.style.left = `${(this.video.currentTime / this.video.duration) * 100}%`;
			msgTime.textContent = this.formatMultilineNumber(this.video.currentTime, 's');
		});

		progress.addEventListener('mousemove', (e: MouseEvent) => {
			let left = e.offsetX;
			if (e.target === ctrlPosition) { left += e.target.offsetLeft; }
			ctrlPosition.style.left = `${left}px`;

			if (e.buttons === 1 /* left mouse button */) ctrlPosition.click();
		});
		ctrlPosition.addEventListener('click', (e: MouseEvent) => {
			const percentage = (e.target.offsetLeft + e.target.clientWidth / 2) / progress.clientWidth;
			this.video.currentTime = this.video.duration * percentage;
		});

		const ctrlVolume = ctrlContainer.querySelector('.res-video-volume');
		if (ctrlVolume) {
			const ctrlVolumeLevel = ctrlVolume.querySelector('.res-video-volume-level');
			const volumePercentage = ctrlVolume.querySelector('.res-video-volume-percentage');

			const updateVolume = e => {
				const base = ctrlVolumeLevel.clientHeight;
				const click = base - e.offsetY;
				const level = Math.min(click / base, 1);
				if (level > 0.05) {
					this.video.volume = level;
					this.video.muted = false;
					Video.volumeStorage.set(level);
				} else {
					this.video.muted = true;
				}
			};

			ctrlVolume.addEventListener('click', () => {
				this.video.muted = !this.video.muted;
			});
			ctrlVolumeLevel.addEventListener('mousemove', (e: MouseEvent) => {
				if (e.buttons === 1 /* left mouse button */) updateVolume(e);
			});
			ctrlVolumeLevel.addEventListener('click', (e: MouseEvent) => {
				updateVolume(e);
				e.stopPropagation();
			});

			const refresh = () => {
				ctrlVolume.setAttribute('level', (this.video.muted || !this.video.volume) ? '0' : String(Math.ceil(this.video.volume * 3)));
				volumePercentage.style.height = `${this.video.volume * 100}%`;
			};

			this.video.addEventListener('volumechange', refresh);
			refresh();
		}
	}

	stopAutoplay() {
		this.autoplay = false;
		if (this.useVideoManager) mutedVideoManager().unobserve(this.video);
	}

	supportsUnload() {
		// Due to issues brougth about by with `pause` and `play` being asynchronous and conserveMemory and mutedVideoManager
		// could end up in a race condition, only unload paused videoes
		return this.video.paused;
	}

	_unload() {
		// Video is auto-paused when detached from DOM
		if (!this.isAttached()) return;

		if (!this.video.paused) this.video.pause();

		this.time = this.video.currentTime;
		this.video.setAttribute('src', ''); // this.video.src has precedence over any child source element
		this.video.load();

		if (this.useVideoManager) mutedVideoManager().unobserve(this.video);
	}

	_restore() {
		if (this.video.hasAttribute('src')) {
			this.video.removeAttribute('src');
			this.video.load();
		}

		if (this.autoplay) {
			if (this.useVideoManager) mutedVideoManager().observe(this.video);
			else this.video.play();
		}
	}
}

export function moveMedia(ele: HTMLElement, deltaX: number, deltaY: number): void {
	ele.style.marginLeft = `${((parseFloat(ele.style.marginLeft) || 0) + deltaX).toFixed(2)}px`;
	ele.style.marginTop = `${((parseFloat(ele.style.marginTop) || 0) + deltaY).toFixed(2)}px`;
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
}
