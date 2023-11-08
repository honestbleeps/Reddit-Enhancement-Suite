/* @flow */

// $FlowIgnore HLS media requires a fairly big dependency, so load it separately on demand
import 'file-loader?name=dash.mediaplayer.min.js!../../node_modules/dashjs/dist/dash.mediaplayer.min.js'; // eslint-disable-line import/no-extraneous-dependencies
/* global dashjs:readonly */
/*:: import dashjs from 'dashjs' */

import $ from 'jquery';
import { pull, without, once, memoize, intersection } from 'lodash-es';
import DOMPurify from 'dompurify';
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
import { loadOptions } from '../core/init';
import { Module } from '../core/module';
import {
	positiveModulo,
	downcast,
	filterMap,
	Thing,
	PagePhases,
	SelectedThing,
	addCSS,
	batch,
	CreateElement,
	elementInViewport,
	empty,
	scrollToElement,
	forEachSeq,
	idleThrottle,
	frameThrottle,
	isPageType,
	isAppType,
	stopPageContextScript,
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
	loadScript,
	Permissions,
	Storage,
} from '../environment';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import * as Notifications from './notifications';
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
	expandos,
	activeExpandos,
} from './showImages/expando';
import vreddit from './hosts/vreddit';
import __hosts from 'sibling-loader?import=default!./hosts/default';

const siteModules: Map<string, Host<any, any>> = new Map(
	Array.from(Object.values(__hosts))
		.map(host => [host.moduleID, downcast(host, Host)]), // ensure that all hosts are instances of `Host`
);

export const genericHosts: Host<any, any>[] = [siteModules.get('default'), siteModules.get('defaultVideo'), siteModules.get('defaultAudio')]
	.map(host => downcast(host, Host));

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
	collapseInlineMedia: {
		title: 'showImagesCollapseInlineMediaTitle',
		type: 'boolean',
		value: false,
		description: 'showImagesCollapseInlineMediaDesc',
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
	...Array.from(siteModules.values()).reduce((options, siteModule) => {
		// Ignore default
		if (genericHosts.includes(siteModule)) return options;

		// Create on/off options
		const key = siteModuleOptionKey(siteModule);
		options[key] = {
			title: siteModule.name,
			description: 'showImagesHostToggleDesc',
			value: true,
			type: 'boolean',
		};

		if (siteModule.options) {
			Object.assign(options, siteModule.options);
			Object.values(siteModule.options).map(v => {
				const origDependsOn = (v: any).dependsOn;
				(v: any).dependsOn = options => options[key].value && (!origDependsOn || origDependsOn());
			});
		}

		return options;
	}, {}),
};

module.onInit = () => {
	if (isAppType('r2')) {
		// We'll probably replace Reddit's video player, so disable the script containing it for now
		// This happens on `onInit` since RES' options load slower than the script's
		const preventVideoPlayerScriptTasks = [
			stopPageContextScript(script => (/^\/?videoplayer\./).test(new URL(script.src, location.origin).pathname), 'head', true),
			// Reddit loads scripts which initializes the video player, which will cause a slowdown if not blocked
			stopPageContextScript(script => !!script.innerHTML.match('RedditVideoPlayer'), PagePhases.contentStart.then(() => document.querySelector('#siteTable')), false),
		];

		loadOptions.then(() => {
			// We might need to restore the native player
			const removeNativePlayer = Modules.isRunning(module) && isSiteModuleEnabled(vreddit) && vreddit.options && vreddit.options.forceReplaceNativeExpando.value;
			if (!removeNativePlayer) forEachSeq(preventVideoPlayerScriptTasks, ({ undo }) => undo());
		});
	}
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
	// The callback function should return a promise which resolves when the expando is built,
	// so that the expando filter can refresh when the expando is loaded
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
	if (module.options.showViewImagesTab.value && isAppType('r2')) {
		viewImagesButton();
	}

	if (module.options.mediaBrowse.value) {
		SelectedThing.addListener(mediaBrowse, 'instantly');
	}

	if (module.options.autoMaxHeight.value) {
		$(document.body).on('mediaResize', '.thing > .entry', updateParentHeight);
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

const sitesMap = once(() =>
	Array.from(siteModules.values())
		.filter(isSiteModuleEnabled)
		.reduce((map, siteModule) => {
			for (const domain of siteModule.domains) {
				map.set(domain, (map.get(domain) || []).concat(siteModule));
			}
			return map;
		}, new Map()),
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
		for (const expando of activeExpandos.values()) {
			if (expando.isAttached()) {
				const { box, media, button } = expando;
				if (!media) continue;
				if (media.supportsUnload()) {
					ioBox.observe(box);
				} else {
					ioBox.unobserve(box);
				}

				boxMap.set(box, expando);
				ioButton.observe(button);
				buttonMap.set(button, expando);
			} else {
				expando.destroy();
			}
		}
	}));
}

let autoExpandActive = false;
let mediaBrowseModeActive = false;

export const viewImagesButton = once(() => CreateElement.tabMenuItem({
	text: 'show images',
	className: 'res-show-images',
	onChange: active => {
		autoExpandActive = active;
		// When activated, open the new ones in addition to the ones already open
		// When deactivated, close all which are open
		for (const expando of expandos.values()) {
			if (!(
				expando instanceof Expando &&
				expando.ready &&
				expando.button.offsetParent
			)) continue;
			const open = isExpandWanted(expando);
			if (open) expando.expand();
			else if (!autoExpandActive) expando.collapse();
		}
	},
}));

export async function toggleThingExpandos(thing: Thing, { scrollOnToggle }: {| scrollOnToggle?: boolean |} = {}) {
	const gate = thing.entry.querySelector('.expando-gate__show-once');
	if (gate) {
		gate.click();
		return;
	}

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
			const lock = expando instanceof Expando && expando.lock;
			if (lock) {
				lock.open();
				await lock.promise; // eslint-disable-line no-await-in-loop
			}

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
		expando.types.includes('non-muted') && (expando.open || expando.expandWanted),
	);
}

export const types = ['selftext', 'video', 'image', 'iframe', 'gallery', 'native', 'muted', 'non-muted'];

export function matchesTypes(wantedTypes: string[], expandoTypes: string[] = types): boolean {
	return !wantedTypes.length || !!intersection(expandoTypes, wantedTypes).length;
}

function isExpandWanted(expando: Expando, {
	thing,
	autoExpand = autoExpandActive,
	autoExpandTypes = module.options.autoExpandTypes.value.replace('any', '').split(' ').filter(Boolean),
	ignoreDuplicates = true,
	ignoreDuplicatesScope,
	onlyExpandMuted = true,
	autoExpandFirstVisibleNonMutedInThing = false,
	treatVideosAsMutedIfStartingMuted = true,
}: {|
	thing?: ?Thing,
	autoExpand?: boolean,
	autoExpandTypes?: string[],
	ignoreDuplicates?: boolean,
	ignoreDuplicatesScope?: HTMLElement,
	onlyExpandMuted?: boolean,
	autoExpandFirstVisibleNonMutedInThing?: boolean,
	treatVideosAsMutedIfStartingMuted?: boolean,
|} = {}) {
	if (ignoreDuplicates) {
		const duplicates = expando.getDuplicates().filter(v => activeExpandos.has(v));
		if (duplicates.length) {
			if (!ignoreDuplicatesScope) return false;
			if (duplicates.some(v => ignoreDuplicatesScope.contains(v.button))) return false;
		}
	}

	const expandoIsNonMuted = expando.types.includes('non-muted');

	const typeCriteriaOK = matchesTypes(autoExpandTypes, expando.types);
	const muteCriteriaOK = !(onlyExpandMuted && expandoIsNonMuted) ||
		(treatVideosAsMutedIfStartingMuted && expando.types.includes('video') && module.options.startVideosMuted.value) ||
		(autoExpandFirstVisibleNonMutedInThing && elementInViewport(expando.button) && !hasEntryAnyExpandedNonMuted(thing));

	return autoExpand && muteCriteriaOK && typeCriteriaOK;
}

function resolveMediaUrl(element, thing) {
	if (
		module.options.expandoCommentRedirects.value !== 'nothing' &&
		thing &&
		element.classList.contains('title')
	) {
		// In old.reddit.com, a reddit gallery's title link can be misleadingly set
		// to the source link in the gallery's caption instead of the normal reddit.com/gallery/<id> URL.
		// The only reliable way to detect a reddit gallery is to check the "data-is-gallery" attribute in the Thing element.
		if (thing.element.dataset.isGallery === 'true') {
			const galleryId = thing.getFullname().replace('t3_', '');
			return new URL(`/gallery/${galleryId}`, location.href);
		}

		const dataUrl = thing.element.getAttribute('data-url');
		const fullDataUrl = dataUrl && new URL(dataUrl, location.href);
		const commentLink = thing.getCommentsLink();
		if (fullDataUrl && commentLink && fullDataUrl.href !== commentLink.href) {
			return fullDataUrl;
		}
	}

	return new URL(element.href, location.href);
}

function promptSiteModulePermissions(siteModule) {
	const { name, permissions = [] } = siteModule;
	const urlStripRe = /((?:\w+\.)+\w+)(?=\/|$)/i;

	const message = string.html`<div>
		<p>In order to inline expand content from ${name}, RES needs permission to access these sites:</p>
		<p><code>${permissions.map(url => `${(urlStripRe.exec(url): any)[0]}`).join(', \n')}</code></p>
		<p>Be assured RES does not access/modify any of your information on these domains - it only accesses the public API.</p>
		<hr>
		<p>If you prefer not to use RES' expando for these sites, you may:</p>
		<button>Disable this host</button>
	</div>`;

	const notification = Notifications.showNotification({
		header: 'Permission required',
		moduleID: 'permissions',
		closeDelay: Infinity,
		message,
	});

	const disableHostButton = message.querySelector('button');

	return Promise.race([
		Permissions.request(permissions).catch(() => new Promise(() => { /* don't resolve if permissions aren't granted */ })),
		waitForEvent(disableHostButton, 'click').then(() => {
			const opt = module.options[siteModuleOptionKey(siteModule)];
			opt.value = false;
			Options.save(opt);
			return Promise.reject(new Error('Host disabled'));
		}),
	]).finally(() => { notification.close(); });
}

const generateSiteModuleLock = memoize(async siteModule => {
	if (!siteModule.permissions || await Permissions.has(siteModule.permissions)) return;

	let resolve, reject;
	return {
		promise: new Promise((_resolve, _reject) => { resolve = _resolve; reject = _reject; }),
		open: () => promptSiteModulePermissions(siteModule).then(resolve, reject),
	};
});

function scanBody(element: ?Element) {
	if (!element) return;
	const promises = [...element.querySelectorAll('a')]
		.filter(link => {
			// Skip links that already have media
			const existingContent = link.querySelector('img, video');

			// Except those inline in posts -- let's just remove them and create an expando instead
			if (existingContent && module.options.collapseInlineMedia.value && existingContent.matches('[src^="https://external-preview.redd.it"')) {
				// Rewrite the anchor to avoid RES querying the 3rd party host for media data
				if (existingContent.hasAttribute('src')) { (link: any).href = existingContent.getAttribute('src'); }
				existingContent.replaceWith(string.html`<i>Collapsed inline media</i>`);
				return true;
			}

			return !existingContent;
		})
		.map(link => checkElementForMedia(downcast(link, HTMLAnchorElement)));
	// $FlowIssue Promise#allSettled is not typed
	return Promise.allSettled(promises);
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
	}

	if (thing && thing.isCrosspost() && module.options.crossposts.value === 'none') {
		return;
	}

	const mediaUrl = resolveMediaUrl(element, thing);

	if (mediaUrl && module.options.expandoCommentRedirects.value === 'rewrite') {
		element.href = mediaUrl.href;
		element.removeAttribute('data-inbound-url');
	}

	for (const siteModule of modulesForHostname(mediaUrl.hostname)) {
		const detectResult = siteModule.detect(mediaUrl, thing);
		if (!detectResult) continue;

		if (nativeExpando) {
			const forceReplaceNativeExpandoOption = siteModule.options && siteModule.options.forceReplaceNativeExpando;
			if (nativeExpando.open && !(forceReplaceNativeExpandoOption && forceReplaceNativeExpandoOption.value)) {
				console.log('Native expando has already been opened; skipping.', element.href);
				return;
			}

			nativeExpando.detach();
		}

		const expando = new Expando(mediaUrl.href);

		placeExpando(expando, element, thing);
		expando.onExpand(() => { trackMediaLoad(element, thing); });
		linksMap.set(element, expando);

		const lock = await generateSiteModuleLock(siteModule); // eslint-disable-line no-await-in-loop
		if (lock) expando.setLock(lock);

		try {
			if (lock) await lock.promise; // eslint-disable-line no-await-in-loop
			await completeExpando(expando, thing, siteModule, detectResult); // eslint-disable-line no-await-in-loop
			break;
		} catch (e) {
			console.error(`showImages: could not create expando for ${mediaUrl.href}`, e);
			if (nativeExpando) nativeExpando.reattach();
			expando.destroy();
			linksMap.delete(element);
		}
	}
}

function placeExpando(expando, element, thing) {
	if (!inText(element) && thing && thing.getTitleElement()) {
		if (element.parentElement) element.parentElement.after(expando.button);
		// Position our expando button after the original button if possible, to not break Reddit's expando
		const sibling = expando.button.nextElementSibling;
		if (sibling && sibling.classList.contains('expando-button')) sibling.after(expando.button);
		thing.entry.appendChild(expando.box);
	} else {
		$(element).add($(element).next('.keyNavAnnotation')).last()
			.after(expando.box)
			.after($('<span class="res-freetext-expando">').append(expando.button));
	}
}

async function completeExpando(expando, thing, siteModule, detectResult) {
	const mediaOptions = await siteModule.handleLink(expando.href, detectResult);

	if (mediaOptions.title && thing && string.areSimilar(mediaOptions.title, thing.getTitle())) {
		mediaOptions.title = '';
	}

	const attribution = module.options.showSiteAttribution.value &&
		thing && thing.isPost() && !thing.isSelfPost() &&
		siteModule.domains.length && siteModule.attribution !== false;

	const isMuted = media => media.muted || ['IMAGE', 'TEXT'].includes(media.type);
	const muted = mediaOptions.type === 'GALLERY' ? mediaOptions.src.every(isMuted) : isMuted(mediaOptions);

	expando.initialize({
		types: [
			mediaOptions.type,
			muted ? 'muted' : 'non-muted',
			...((mediaOptions.expandoClass || '').split(' ')),
		].filter(v => v).map(s => s.toLowerCase()),
		buttonInfo: getMediaButtonInfo(mediaOptions),
		generateMedia() {
			const media = generateMedia(mediaOptions, { href: expando.href });
			if (module.options.crossposts.value === 'withMetadata' && thing && thing.isCrosspost()) {
				media.element.prepend(crosspostMetadataTemplate(thing.element.dataset));
			}
			if (attribution) addSiteAttribution(siteModule, media);
			return media;
		},
	});

	expando.button.setAttribute('data-host', siteModule.moduleID);
	expando.box.setAttribute('data-host', siteModule.moduleID);

	const hideButton = thing && thing.getHideElement();
	if (hideButton) hideButton.addEventListener('click', () => { expando.destroy(); });

	if (thing && thing.isComment()) {
		expando.onExpand(once(() => {
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

function updateParentHeight(e) {
	const thing = Thing.checkedFrom(e.currentTarget);

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

		thing.getTextBody().style.maxHeight = `${basisHeight + expandoHeight}px`;
	}
}

function trackNativeExpando(expando, element, thing) {
	if (!module.options.markSelftextVisited.value && expando.button.classList.contains('selftext')) return;

	const trackLoad = once(() => trackMediaLoad(element, thing));

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
	if (options.credits) options.credits = DOMPurify.sanitize(options.credits);
	if (options.caption) options.caption = DOMPurify.sanitize(options.caption);

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

const observed = new WeakMap();
const resizeObserver = new ResizeObserver(entries => {
	for (const { target, contentRect } of entries) {
		const callback = observed.get(target);
		if (callback) callback(contentRect);
	}
});

export class Media {
	element: HTMLElement;

	ready: ?Promise<any>;

	onAttach: ?() => void;
	isAttached(): boolean { return document.body.contains(this.element); }

	expand(): void | Promise<void> { this.setLoaded(true); }
	collapse(): void { this.setLoaded(false); }

	onResize: Array<* => mixed> = [];
	resizing: ?(contentRect: *) => void;
	rotationState: number = 0;

	supportsUnload(): boolean { return false; }
	_loaded: ?boolean = true;
	_unload(): any {}
	_restore(): any {}

	setLoaded(state: boolean) {
		if (state === this._loaded) return;
		this._loaded = state;
		if (state) this._restore();
		else this._unload();
	}

	makeIndependent(element: HTMLElement) {
		const wrapper = document.createElement('div');
		const independent = document.createElement('div');
		element.replaceWith(wrapper);
		wrapper.appendChild(independent);
		independent.appendChild(element);

		independent.classList.add('res-media-independent');
		wrapper.style.willChange = 'height';

		this.resizing = (contentRect: * = element.getBoundingClientRect()) => {
			for (const callback of this.onResize) callback(contentRect);
			wrapper.style.height = `${contentRect.height}px`;
		};

		this.onResize.push(contentRect => {
			this.element.dispatchEvent(new CustomEvent('mediaResize', { detail: contentRect, bubbles: true }));
		});

		observed.set(element, contentRect => {
			if (!this._loaded) return;
			if (this.resizing) this.resizing(contentRect);
		});
		resizeObserver.observe(element);

		waitForEvent(element, 'mediaManuallyMovedVertically').then(() => { resizeObserver.unobserve(element); });
	}

	keepVisible(element: HTMLElement) {
		element.classList.add('res-element-keep-visible');

		const basisLeft = once(() => downcast(element.parentElement, HTMLElement).getBoundingClientRect().left);
		let isAligned = false;

		this.onResize.push(({ width: elementWidth }: *) => {
			const { width: viewportWidth } = getViewportSize();

			if (!isAligned && basisLeft() + elementWidth < viewportWidth) return;

			const { left: elementLeft, right: elementRight } = element.getBoundingClientRect();

			const deltaLeft = elementLeft - basisLeft();

			if (elementWidth > viewportWidth) { // Left align
				isAligned = true;
				move(element, -elementLeft, 0);
			} else if (elementRight - deltaLeft > viewportWidth) { // Right align
				isAligned = true;
				move(element, viewportWidth - elementRight, 0);
			} else if (deltaLeft) { // Reset
				isAligned = false;
				move(element, -deltaLeft, 0);
			}
		});
	}

	setMaxSize(element: HTMLElement) {
		let value = module.options.maxWidth.value;
		let isPercentage = value.endsWith('%');
		const maxWidth = (isPercentage ? getViewportSize().width / 100 : 1) * parseInt(value, 10);
		if (maxWidth) element.style.maxWidth = `${maxWidth}px`;

		value = module.options.maxHeight.value;
		isPercentage = value.endsWith('%');
		const maxHeight = (isPercentage ? getViewportSize().height / 100 : 1) * parseInt(value, 10);
		if (maxHeight) element.style.maxHeight = `${maxHeight}px`;
	}

	makeZoomable(element: HTMLElement, dragInitiater: HTMLElement = element, absoluteSizing: boolean = false) {
		if (!module.options.imageZoom.value) return;

		element.classList.add('res-media-zoomable');

		let initialWidth, initialHeight, initialDiagonal, left, top;

		function getDiagonal(x, y) {
			const w = Math.max(1, x - left);
			const h = Math.max(1, y - top);
			return Math.round(Math.hypot(w, h));
		}

		addDragListener({
			media: this.element,
			element: dragInitiater,
			atShiftKey: false,
			onStart: (x, y) => {
				({ left, top, width: initialWidth, height: initialHeight } = element.getBoundingClientRect());
				initialDiagonal = getDiagonal(x, y);
			},
			onMove: (x, y, deltaX, deltaY) => {
				const conversionFactor = this.rotationState % 2 ? initialHeight / initialWidth : 1;
				if (absoluteSizing) {
					const { width, height } = element.getBoundingClientRect();
					resize(element, (width + deltaX) * conversionFactor, (height + deltaY) / conversionFactor);
				} else {
					const newWidth = getDiagonal(x, y) / initialDiagonal * initialWidth;
					resize(element, newWidth * conversionFactor);
				}
			},
		});
	}

	makeMovable(element: HTMLElement, dragInitiater: HTMLElement = element) {
		if (!module.options.imageMove.value) return;

		element.classList.add('res-media-movable');

		addDragListener({
			media: this.element,
			element: dragInitiater,
			atShiftKey: true,
			onMove(x, y, deltaX, deltaY) { move(element, deltaX, deltaY); },
		});
	}

	addControls(element: HTMLElement, lookupUrl: *, downloadUrl: *) {
		if (!module.options.mediaControls.value) return element;

		const [y, x] = module.options.mediaControlsPosition.value.split('-');

		const wrapper = mediaControlsTemplate({ clippy: module.options.clippy.value, lookupUrl, downloadUrl, x, y });
		element.replaceWith(wrapper);
		wrapper.appendChild(element);

		element.classList.add('res-media-rotatable');

		const compensateTransformedSize = () => {
			const { width, height } = element.getBoundingClientRect();
			Object.assign(wrapper.style, { width: `${width}px`, height: `${height}px` });
		};

		const compensateTransformedSizeObserver = new ResizeObserver(compensateTransformedSize);

		const updateRotation = () => {
			compensateTransformedSizeObserver.observe(element);
			element.setAttribute('rotation', String(positiveModulo(this.rotationState, 4)));
			compensateTransformedSize();
		};

		wrapper.querySelector('.res-media-controls').addEventListener('click', (e: Event) => {
			switch (e.target.dataset.action) {
				case 'rotateLeft':
					--this.rotationState;
					updateRotation();
					break;
				case 'rotateRight':
					++this.rotationState;
					updateRotation();
					break;
				case 'download':
					Permissions.request(['downloads']).then(() => {
						const re = /(?:\.([^.]+))?$/;
						const ext = re.exec(downloadUrl);
						const thing = Thing.from(wrapper);
						let title = thing && thing.getTitle();
						title = title.replace(/[*|?:"~<>\\\/]|(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi, '');
						title = title.replace(/\p{Emoji}|\p{Emoji_Component}/ug, '');
						title = title.slice(0, 120); // titles may be longer than the filesystem allows
						title = title.trim();
						if (title && ext) {
							let extension = ext[1];
							if (extension.includes('?')) extension = extension.split('?')[0];
							const filename = `${title}.${extension}`;
							download(downloadUrl, filename);
						} else download(downloadUrl);
					});
					break;
				case 'imageLookup':
					// Google doesn't like image url's without a protacol
					lookupUrl = new URL(downcast(lookupUrl, 'string'), location.href).href;

					// Escape query string parameters
					openNewTab(string.encode`https://images.google.com/searchbyimage?client=app&image_url=${lookupUrl}`);
					break;
				case 'showImageSettings':
					SettingsNavigation.open(module.moduleID, 'mediaControls');
					break;
				case 'clippy':
					e.target.textContent = [
						module.options.imageZoom.value && 'drag to resize',
						module.options.imageMove.value && 'shift-drag to move',
					].filter(Boolean).join(' or ');
					module.options.clippy.value = false;
					Options.save(module.options.clippy);
					break;
				default:
					// do nothing if action is unknown
					break;
			}

			e.stopPropagation();
			e.preventDefault();
		});

		return wrapper;
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
		this.individualCtrl = this.element.querySelector('.res-step-container');
		const ctrlPrev = this.individualCtrl.querySelector('.res-step-previous');
		const ctrlNext = this.individualCtrl.querySelector('.res-step-next');
		this.msgPosition = this.individualCtrl.querySelector('.res-step-position');
		this.ctrlToFilmstrip = this.individualCtrl.querySelector('.res-gallery-to-filmstrip');
		this.ctrlConcurrentIncrease = this.element.querySelector('.res-gallery-increase-concurrent');

		this.pieces = options.src.map(src => ({
			generateMedia: () => generateMedia(src, context),
			media: null,
			wrapper: string.html`<div hidden></div>`,
		}));
		piecesContainer.append(...this.pieces.map(({ wrapper }) => wrapper));

		const slideshowWhenLargerThan = parseInt(module.options.useSlideshowWhenLargerThan.value, 10) || Infinity;
		this.filmstripActive = module.options.galleryAsFilmstrip.value && this.pieces.length < slideshowWhenLargerThan;

		if (this.filmstripActive || this.pieces.length === 1) {
			this.ready = this.expandFilmstrip();
			this.ctrlConcurrentIncrease.addEventListener('click', () => this.expandFilmstrip());
		} else {
			this.ready = this.changeSlideshowPiece(0);
			ctrlPrev.addEventListener('click', () => { this.changeSlideshowPiece(-1); });
			ctrlNext.addEventListener('click', () => { this.changeSlideshowPiece(1); });

			waitForEvent(this.ctrlToFilmstrip, 'click').then(() => {
				// The filmstrip view will start at thet currently viewed piece
				// Add a way to also also display previous pieces
				const currentIndex = this.pieces.indexOf(this.lastRevealedPiece);
				if (currentIndex > 0) {
					const showFromBeginning = document.createElement('div');
					showFromBeginning.textContent = 'Show earlier pieces';
					showFromBeginning.style.cursor = 'pointer';
					piecesContainer.before(showFromBeginning);
					showFromBeginning.addEventListener('click', () => {
						this.expandFilmstrip({ revealFrom: 0, revealTo: currentIndex });
						showFromBeginning.remove();
					});
				}

				this.expandFilmstrip();
				this.ctrlConcurrentIncrease.addEventListener('click', () => this.expandFilmstrip());
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
		if (resizeElement) resize(resizeElement, this.lastResizedWidth);
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

	async expandFilmstrip({
		revealFrom = this.lastRevealedPiece ? this.pieces.indexOf(this.lastRevealedPiece) + 1 : 0,
		revealTo = Math.min(revealFrom + this.filmstripLoadIncrement, this.pieces.length),
	} = {}) {
		this.individualCtrl.remove();

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
		return true;
	}

	setLoaded(state) {
		for (const { wrapper, media } of this.pieces) {
			if (!wrapper?.hidden && media && media.supportsUnload()) media.setLoaded(state);
		}
	}

	collapse() {
		for (const { media } of this.pieces) {
			if (media) media.collapse();
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

		this.setMaxSize(this.image);
		const wrapper = this.addControls(anchor, src, src);
		this.makeZoomable(this.image);
		this.makeMovable(wrapper);
		this.keepVisible(wrapper);
		this.makeIndependent(wrapper);
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
	loadPromise: Promise<*>;
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

		this.onAttach = () => {
			this.loadPromise = waitForEvent(this.iframe, 'load')
				.then(() => {
					if (this.isAttached() && this.element.offsetParent) {
						this.loaded = true;
					} else {
						return Promise.reject(new Error('Iframe is not visible'));
					}
				});
		};

		this.makeZoomable(this.iframe, dragHandle, !fixedRatio);
		this.makeMovable(iframeWrapper, dragHandle);
		this.keepVisible(iframeWrapper);
		this.makeIndependent(iframeWrapper);
	}

	async expand() {
		if (module.options.autoplayVideo.value && this.playCommand) {
			await this.loadPromise;

			try {
				this.iframe.contentWindow.postMessage(this.playCommand, '*');
			} catch (e) {
				console.error('Could not post "play" command to iframe', this, e);
			}
		}
	}

	collapse() {
		if (this.loaded && this.pauseCommand) {
			try {
				this.iframe.contentWindow.postMessage(this.pauseCommand, '*');
				return;
			} catch (e) {
				console.error('Could not post "pause" command to iframe', this, e);
			}
		}

		// If we couldn't pause the iframe, remove it
		this.element.remove();
		this.loaded = false;
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
			src: DOMPurify.sanitize(src),
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
	if (!module.options.markVisited.value) return;

	if (thing) trackVisitNative(thing);

	if (!(thing && thing.isNSFW() && module.options.sfwHistory.value !== 'add')) {
		addURLToHistory(link.href);
	}
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

// When videos is added, this will pause or play them individually depending on their visibility
const mutedVideoManager = once(() => {
	const maxSimultaneousPlaying = parseInt(module.options.maxSimultaneousPlaying.value, 10) || Infinity;
	const videos: Video[] = [];

	const updatePlay = frameThrottle(() => {
		const all = videos
			.filter(media => !(media.video.paused && !media.autoPaused) && (media.video.muted || !media.video.volume))
			.map(media => {
				const video = media.video;
				const thing = Thing.from(video);
				return {
					media,
					visibility: getPercentageVisibleYAxis(video),
					top: video.getBoundingClientRect().top,
					selected: Number(thing && thing.isSelected()),
				};
			});

		const notVisible = all.filter(({ visibility }) => visibility === 0);
		for (const { media } of notVisible) media.setAutoPause(true);

		without(all, ...notVisible)
			.sort((a, b) => b.selected - a.selected || b.visibility - a.visibility || a.top - b.top)
			.forEach(({ media }, index) => { media.setAutoPause(index >= maxSimultaneousPlaying); });
	});

	let intervalId = null;

	return {
		observe(video) {
			videos.push(video);
			updatePlay();
			if (intervalId === null) intervalId = setInterval(updatePlay, 100);
		},
		unobserve(video) {
			pull(videos, video);
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
	autoPaused: boolean;
	dashPlayer: *;
	_loaded = false;

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

		this.autoplay = muted || module.options.autoplayVideo.value;
		this.time = time;
		this.frameRate = frameRate;

		this.element = videoTemplate({
			title,
			caption,
			credits,
			source: source || href || context.href,
			// Prevent poster from flashing before the video is ready when autoplaying
			poster: !this.autoplay && poster || '',
			hasAudio: !muted,
			loop,
			reversable,
			formattedPlaybackRate: this.formatMultilineNumber(playbackRate, 'x'),
		});
		this.video = downcast(this.element.querySelector('video'), HTMLVideoElement);
		const container = this.element.querySelector('.res-video-container');

		const msgError = this.element.querySelector('.res-video-error');
		const displayError = message => {
			msgError.hidden = false;
			msgError.textContent = `Could not play video: ${message}`;
		};

		const sourceElements = filterMap(sources, v => {
			if (this.video.canPlayType(v.type)) {
				const source = document.createElement('source');
				source.src = v.source;
				source.type = v.type;
				if (v.reverse) source.dataset.reverse = v.reverse;
				return [source];
			} else {
				if (v.type === 'application/dash+xml') {
					// Use external library
					this.dashPlayer = loadScript('/dash.mediaplayer.min.js').then(() => {
						dashjs.skipAutoCreate = true;

						const player = dashjs.MediaPlayer().create(); // eslint-disable-line new-cap
						// The library needs the manifest a URL
						const url = URL.createObjectURL(new Blob([v.source], { type: 'application/dash+xml' }));

						player.initialize();
						player.setAutoPlay(false);
						player.attachView(this.video);
						player.attachSource(url);

						return {
							stop: () => player.attachSource(null),
							continue: () => player.attachSource(url),
						};
					});

					return [document.createElement('span')]; // Return dummy element as the proper `source` element has side effects
				}
			}
		});

		if (!sourceElements.length) {
			if (fallback) {
				return new Image({ // eslint-disable-line no-constructor-return
					type: 'IMAGE',
					title,
					caption,
					credits,
					src: fallback,
				}, context);
			} else {
				displayError('No playable sources were found');
			}
		}

		this.video.append(...sourceElements);

		this.video.addEventListener('play', () => { empty(msgError); msgError.hidden = true; });
		this.video.addEventListener('stalled', () => { displayError('Loading stalled'); });
		this.video.addEventListener('error', () => { displayError('Unknown error'); });

		if (reversed) this.reverse();

		this.ready = Promise.race([
			// 'ended' is not triggered when the video loops
			waitForEvent(this.video, 'ended'),
			waitForEvent(this.video, 'error'),
			waitForEvent(this.video, 'canplaythrough'),
		]);

		const setPlayIcon = () => {
			if (!this.video.paused) this.element.setAttribute('playing', '');
			else this.element.removeAttribute('playing');
		};

		this.video.addEventListener('pause', () => {
			setPlayIcon();
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

		this.video.addEventListener('dblclick', async () => {
			// $FlowIssue `Document#fullscreen` `Video#requestFullscreen` and `Document#exitFullscreen` not typed
			if (document.fullscreen) return;
			const initialControlsState = this.video.controls;
			this.video.controls = true;
			const enterFullscreenPromise = waitForEvent(this.video, 'fullscreenchange', 'fullscreenerror'); // enters fullscreen
			// $FlowIssue `Document#fullscreen` `Video#requestFullscreen` and `Document#exitFullscreen` not typed
			this.video.requestFullscreen();
			await enterFullscreenPromise;
			// $FlowIssue `Document#fullscreen` `Video#requestFullscreen` and `Document#exitFullscreen` not typed
			if (document.fullscreen) await waitForEvent(this.video, 'fullscreenchange', 'dblclick'); // leaves fullscreen
			// $FlowIssue `Document#fullscreen` `Video#requestFullscreen` and `Document#exitFullscreen` not typed
			if (document.fullscreen) document.exitFullscreen();
			this.video.controls = initialControlsState;
		});

		Promise.all([waitForEvent(this.element, 'mouseenter'), waitForEvent(this.video, 'canplay')])
			.then(() => this.addVideoControls());

		new MutationObserver(() =>
			this.element.classList.toggle('res-video-has-native-controls', this.video.hasAttribute('controls')),
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

		this.setMaxSize(this.video);
		this.makeZoomable(this.video);
		this.addControls(this.video, undefined, sourceElements[0].getAttribute('src'));
		this.makeMovable(container);
		this.keepVisible(container);
		this.makeIndependent(container);
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

	addVideoControls() {
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

		ctrlContainer.hidden = false;

		this.video.addEventListener('click', (e: MouseEvent) => {
			this.togglePlay();
			e.preventDefault();
		});

		ctrlTogglePause.addEventListener('click', () => this.togglePlay());
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
				// If a lower value is chosen, the user likely is muting the video
				if (level > 0.01) {
					this.video.volume = level;
					this.video.muted = false;
					Video.volumeStorage.set(level);
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

	togglePlay() {
		if (this.video.paused) this.video.play(); else this.video.pause();
		if (this.video.paused) this.stopAutoplay();
	}

	stopAutoplay() {
		this.autoplay = false;
	}

	setAutoPause(state) {
		this.autoPaused = state;
		if (state !== this.video.paused) {
			if (state) this.video.pause();
			else this.video.play();
		}
	}

	supportsUnload() {
		// Due to issues brougth about by with `pause` and `play` being asynchronous and conserveMemory and mutedVideoManager
		// could end up in a race condition, only unload paused videoes
		return this.video.paused;
	}

	async _unload() {
		// Video is auto-paused when detached from DOM
		if (!this.isAttached()) return;

		if (!this.video.paused) this.video.pause();

		this.time = this.video.currentTime;

		if (this.dashPlayer) {
			// Wait for the dash player to load before continuing
			(await this.dashPlayer).stop();
		} else {
			this.video.setAttribute('src', ''); // this.video.src has precedence over any child source element
			this.video.load();
		}

		mutedVideoManager().unobserve(this);
	}

	async _restore() {
		if (this.dashPlayer) {
			// Wait for the dash player to load before continuing
			(await this.dashPlayer).continue();
		} else if (this.video.hasAttribute('src')) {
			this.video.removeAttribute('src');
			this.video.load();
		}

		this.video.currentTime = this.time;

		// Wait till the meta-data is ready before starting playback
		if (this.video.readyState === 0) await waitForEvent(this.video, 'loadedmetadata');

		if (this.autoplay) this.video.play();

		mutedVideoManager().observe(this);
	}
}

export function move(ele: HTMLElement, deltaX: number, deltaY: number): void {
	ele.style.marginLeft = `${((parseFloat(ele.style.marginLeft) || 0) + deltaX).toFixed(2)}px`;
	ele.style.marginTop = `${((parseFloat(ele.style.marginTop) || 0) + deltaY).toFixed(2)}px`;

	if (deltaY) ele.dispatchEvent(new CustomEvent('mediaManuallyMovedVertically', { bubbles: true }));
}

export function resize(ele: HTMLElement, newWidth: number, newHeight?: number): void {
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
