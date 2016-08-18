/*
	If you would like RES to embed content from your website,
	consult lib/modules/hosts/example.js
*/

import _ from 'lodash';
import elementResizeDetectorMaker from 'element-resize-detector';
import { flow, forEach, keyBy, map, tap } from 'lodash/fp';
import audioTemplate from '../templates/audio.mustache';
import galleryTemplate from '../templates/gallery.mustache';
import imageTemplate from '../templates/image.mustache';
import mediaControlsTemplate from '../templates/mediaControls.mustache';
import siteAttributionTemplate from '../templates/siteAttribution.mustache';
import textTemplate from '../templates/text.mustache';
import videoAdvancedTemplate from '../templates/videoAdvanced.mustache';
import { $ } from '../vendor';
import {
	DAY,
	positiveModulo,
	Expando,
	expandos,
	primaryExpandos,
	Thing,
	getPostMetadata,
	addCSS,
	batch,
	CreateElement,
	scrollToElement,
	forEachChunked,
	forEachSeq,
	filter,
	frameDebounce,
	isCurrentSubreddit,
	isPageType,
	objectValidator,
	waitForEvent,
	watchForElement,
	regexes,
} from '../utils';
import { addURLToHistory, ajax, isPrivateBrowsing, openNewTab } from '../environment';
import * as SettingsNavigation from './settingsNavigation';

const hostsContext = require.context('./hosts', false, /\.js$/);
const siteModules = flow(
	map(hostsContext),
	map('default'),
	tap(forEach(objectValidator({ requiredProps: ['moduleID', 'name', 'domains', 'detect', 'handleLink'] }))),
	keyBy('moduleID')
)(hostsContext.keys());

export const module = {};

module.moduleID = 'showImages';
module.moduleName = 'Inline Image Viewer';
module.category = ['Productivity', 'Browsing'];
module.description = 'Opens images inline in your browser with the click of a button. Also has configuration options, check it out!';
module.bodyClass = true;
module.options = {
	galleryPreloadCount: {
		type: 'text',
		value: 2,
		description: 'Number of preloaded gallery pieces for faster browsing.',
	},
	conserveMemory: {
		type: 'boolean',
		value: true,
		description: 'Conserve memory by temporarily hiding images when they are offscreen.',
	},
	bufferScreens: {
		type: 'text',
		value: 2,
		description: 'Hide images that are further than x screens away to save memory. A higher value means less flicker, but less memory savings.',
		dependsOn: 'conserveMemory',
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
		value: 0,
		description: 'Add a scroll bar to text expandos taller than [x] pixels (enter zero for unlimited).',
		advanced: true,
	},
	commentMaxHeight: {
		type: 'text',
		value: 0,
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
	autoExpandSelfText: {
		type: 'boolean',
		value: true,
		description: 'When loading selftext from an Aa+ expando, auto expand images, videos, and embeds.',
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
	displayImageCaptions: {
		type: 'boolean',
		value: true,
		description: 'Retrieve image captions/attribution information.',
		advanced: true,
		bodyClass: true,
	},
	captionsPosition: {
		dependsOn: 'displayImageCaptions',
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
	clippy: {
		type: 'boolean',
		value: true,
		description: 'Show educational tooltips, such as showing "drag to resize" when your mouse hovers over an image.',
	},
	markVisited: {
		type: 'boolean',
		value: true,
		description: 'Mark links visited when you view images.',
		advanced: true,
	},
	sfwHistory: {
		dependsOn: 'markVisited',
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
	galleryAsFilmstrip: {
		type: 'boolean',
		value: false,
		description: 'Display all media at once in a \'filmstrip\' layout, rather than the default navigable \'slideshow\' style.',
	},
	filmstripLoadIncrement: {
		dependsOn: 'galleryAsFilmstrip',
		type: 'text',
		value: 30,
		description: 'Limit the number of pieces loaded in a \'filmstrip\' by this number. (0 for no limit)',
	},
	useSlideshowWhenLargerThan: {
		dependsOn: 'galleryAsFilmstrip',
		type: 'text',
		value: 0,
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
		description: 'Show a \'view images\' tab at the top of each subreddit, to easily toggle showing all images at once.',
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
	autoplayVideo: {
		type: 'boolean',
		value: true,
		description: 'Autoplay inline videos',
	},
};
module.exclude = [
	/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/ads\/[\-\w\._\?=]*/i,
	/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/[\-\w\.\/]*\/submit\/?$/i,
	/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/subreddits/i,
];

module.loadDynamicOptions = () => {
	// Augment the options with available image modules
	for (const [id, siteModule] of Object.entries(siteModules)) {
		// Ignore default
		if (id === 'default') continue;
		if (id === 'defaultVideo') continue;
		if (id === 'defaultAudio') continue;

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
};

let elementResizeDetector;

module.go = () => {
	elementResizeDetector = elementResizeDetectorMaker({ stategy: 'scroll' });

	watchForElement('siteTable', findAllImages);
	watchForElement('selfText', v => findAllImages(v, true));
	watchForElement('newComments', v => findAllImages(v, true));

	createImageButtons();

	for (const siteModule of Object.values(siteModules)) {
		if (isSiteModuleEnabled(siteModule)) {
			if (siteModule.go) siteModule.go();
		}
	}

	findAllImages(document.body);
	document.addEventListener('dragstart', () => false);

	// Handle spotlight next/prev hiding open expando's
	const spotlight = document.querySelector('#siteTable_organic');
	if (spotlight) {
		const nextprev = spotlight.querySelector('.nextprev');
		if (!nextprev) return;

		nextprev.addEventListener('click', () => {
			const open = spotlight.querySelector('.expando-button.expanded');
			if (open) open.click();
		});
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
	DRAG_MOVE: 2,
};

function isWithinBuffer(ele) {
	if (!ele.offsetParent) return false;

	const bufferScreens = module.options.bufferScreens.value || 2;
	const viewportHeight = window.innerHeight;
	const maximumTop = viewportHeight * (bufferScreens + 1);
	const minimumBottom = viewportHeight * bufferScreens * -1;

	const { bottom, top } = ele.getBoundingClientRect();
	return top <= maximumTop && bottom >= minimumBottom;
}

function enableCompleteDeferredExpandos() {
	const check = _.throttle(() => {
		// Complete any deferred expandos which is within the buffer
		for (const [expando, completeFunc] of deferredExpandos) {
			if (isWithinBuffer(expando.button)) completeFunc();
		}
	}, 150);

	window.addEventListener('scroll', check);
	elementResizeDetector.listenTo(document.body, check);
}

/**
 * enableConserveMemory
 * attempt to unload collapsed expando's & images that are off screen in order
 * to save memory
 *
 * @returns {void}
 */
function enableConserveMemory() {
	const refresh = _.debounce(() => {
		const activeExpandos = Array.from(primaryExpandos.values());

		// Empty collapsed when beyond buffer
		for (const expando of activeExpandos) {
			if (!expando.isAttached()) expando.destroy();
			else if (!expando.open && !isWithinBuffer(expando.button)) expando.empty();
		}

		// Unload expanded when beyond buffer
		activeExpandos
			.filter(v => v.isAttached() && v.open)
			.map(v => ({ media: v.media, data: v.media }))
			::lazyUnload(isWithinBuffer);
	}, 150);

	window.addEventListener('scroll', refresh);
	elementResizeDetector.listenTo(document.body, refresh);
}

function lazyUnload(testKeepLoaded) {
	for (const { media, data } of this) {
		if (!media.unload || !media.restore) continue;

		const keepLoaded = testKeepLoaded(data);
		if (keepLoaded && media.state === mediaStates.UNLOADED) {
			media.restore();
		} else if (!keepLoaded && media.state === mediaStates.LOADED) {
			media.unload();
		}
	}
}

let viewImagesButton;
let autoExpandActive = false;
let mediaBrowseModeActive = false;

export function toggleViewImages() {
	viewImagesButton.checkbox.checked = !viewImagesButton.checkbox.checked;
	viewImagesButton.checkbox.dispatchEvent(new Event('change'));
}

function createImageButtons() {
	let $mainMenuUL = $('#header-bottom-left ul.tabmenu');
	// Create new tabmenu on these pages, regardless if one already exists.
	if (isPageType('search', 'modqueue') || isCurrentSubreddit('dashboard')) {
		$mainMenuUL = $('<ul>', { class: 'tabmenu viewimages' });
		$mainMenuUL.appendTo('#header-bottom-left');
		$mainMenuUL.css('display', 'inline-block'); // Override dashboard's subreddit style.
	}

	if (module.options.showViewImagesTab.value) {
		viewImagesButton = CreateElement.tabMenuItem({
			text: 'show images',
		});

		viewImagesButton.checkbox.addEventListener('change', e => {
			autoExpandActive = e.target.checked;
			// When activated, open the new ones in addition to the ones already open
			// When deactivated, close all which are open
			updateRevealedImages({ onlyOpen: autoExpandActive });
		});
	}
}

const updateAutoExpandCount = _.debounce(() => {
	if (!viewImagesButton) return;

	const count = Array.from(primaryExpandos.values())
		.filter(expando => expando.isAttached() && expando.button.offsetParent &&
			expando::isExpandWanted({ autoExpand: true }))
		.length;

	viewImagesButton.label.setAttribute('aftercontent', ` (${count})`);
}, 200);

const updateRevealedImages = _.debounce(({ onlyOpen = false } = {}) => {
	primaryExpandos.values()
		::filter(expando => expando.isAttached() && expando.button.offsetParent)
		::sortExpandosVertically()
		::forEachChunked(expando => {
			const open = expando::isExpandWanted();
			if (open) expando.expand();
			else if (!onlyOpen) expando.collapse();
		});
}, 100, { leading: true });

function sortExpandosVertically() {
	return Array.from(this)
		.map(v => [v.button.getBoundingClientRect().top, v])
		.sort((a, b) => a[0] - b[0])
		.map(v => v[1]);
}

export function toggleThingExpandos(thing, scrollOnExpando) {
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
			if (!(expando instanceof Expando) ||
				expando::isExpandWanted({ thing, autoExpand: true, ignoreDuplicates: false, explicitOpen: true })
			) {
				expando.expand();
			}
		}

		if (scrollOnExpando) scrollToElement(thing.entry, { scrollStyle: 'top' });
	}
}

export function mediaBrowseMode(oldThing, newThing) {
	if (autoExpandActive) return false;

	const oldExpando = oldThing && oldThing.getEntryExpando();
	const newExpando = newThing && newThing.getEntryExpando();

	if (oldExpando) {
		mediaBrowseModeActive = oldExpando.expandWanted || oldExpando.open;
	}

	if (mediaBrowseModeActive) {
		if (oldExpando) oldExpando.collapse();
		if (newExpando) newExpando.expand();
	}

	return newExpando && mediaBrowseModeActive;
}

function isExpandWanted({
		thing = null,
		explicitOpen = false,
		autoExpand = autoExpandActive || explicitOpen,
		ignoreDuplicates = true,
	} = {}) {
	if (ignoreDuplicates && !this.isPrimary()) return false;

	if (this.inText && thing && (autoExpand ||
		module.options.autoExpandSelfText.value && thing.isSelfPost() && !isPageType('comments')
	)) {
		// Expand all muted expandos and the first non-muted expando
		return (this.mediaOptions && this.mediaOptions.muted) ||
			!thing.getTextExpandos()
				.find(v => (v.open || v.expandWanted) && (v.mediaOptions && !v.mediaOptions.muted));
	} else {
		return explicitOpen || (autoExpand && (this.mediaOptions && this.mediaOptions.muted));
	}
}

function findAllImages(elem, isSelfText) {
	// get elements common across all pages first...
	// if we're on a comments page, get those elements too...
	let allElements = [];
	if (isPageType('comments', 'profile')) {
		allElements = elem.querySelectorAll('#siteTable a.title, .expando .usertext-body > div.md a, .content .usertext-body > div.md a');
	} else if (isSelfText) {
		// We're scanning newly opened (from an expando) selftext...
		allElements = elem.querySelectorAll('.usertext-body > div.md a');
	} else if (isPageType('wiki')) {
		allElements = elem.querySelectorAll('.wiki-page-content a');
	} else if (isPageType('inbox')) {
		allElements = elem.querySelectorAll('#siteTable div.entry .md a');
	} else if (isPageType('search')) {
		allElements = elem.querySelectorAll('#siteTable a.title, .contents a.search-link');
	} else {
		allElements = elem.querySelectorAll('#siteTable A.title, #siteTable_organic a.title');
	}

	allElements::forEachChunked(checkElementForMedia);
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

async function resolveMediaUrl(element, thing) {
	if (module.options.expandoCommentRedirects.value === 'nothing') {
		return element;
	}

	if (element.classList.contains('title')) {
		const dataUrl = thing.$thing.data('url');
		const fullDataUrl = dataUrl && new URL(dataUrl, location);
		if (fullDataUrl && fullDataUrl.href !== thing.getCommentsLink().href) {
			return fullDataUrl;
		}

		if (element.hostname === location.hostname) {
			const [, , id] = regexes.comments.exec(element.pathname);
			const { url } = await getPostMetadata({ id });

			if (module.options.expandoCommentRedirects.value === 'rewrite') {
				element.href = url;
			}

			return new URL(url, location);
		}
	}

	return element;
}

function getMediaInfo(element, mediaUrl) {
	const matchingHosts = [
		...modulesForHostname(mediaUrl.hostname),
		siteModules.default,
		siteModules.defaultVideo,
		siteModules.defaultAudio,
	];

	for (const siteModule of matchingHosts) {
		const detectResult = siteModule.detect(mediaUrl);
		if (detectResult) return { detectResult, siteModule, element, href: mediaUrl.href };
	}
}

// @type {WeakMap.<element, boolean|Expando>}
const scannedLinks = new WeakMap();
export const getLinkExpando = link => {
	const expando = scannedLinks.get(link);
	if (expando instanceof Expando) return expando;
};

async function checkElementForMedia(element) {
	if (scannedLinks.has(element)) return;
	else scannedLinks.set(element, true);

	const thing = new Thing(element);
	if (!thing.element) return;

	const inText = !!$(element).closest('.md, .search-result-footer')[0];
	const entryExpando = !inText && thing.getEntryExpando();
	const nativeExpando = entryExpando instanceof Expando ? null : entryExpando;

	if (module.options.hideNSFW.value && thing.isNSFW()) {
		if (nativeExpando) nativeExpando.detach();

		return;
	}

	if (nativeExpando) {
		trackNativeExpando(nativeExpando, element);

		if (nativeExpando.open) {
			console.log('Native expando has already been opened; skipping.', element.href);
			return;
		}
	}

	const mediaUrl = await resolveMediaUrl(element, thing);
	const mediaInfo = getMediaInfo(element, mediaUrl);

	if (!mediaInfo) return;

	if (nativeExpando) nativeExpando.detach();

	const expando = new Expando(inText);
	expandos.set(expando.button, expando);
	scannedLinks.set(element, expando);

	if (!inText && thing.getTitleElement()) {
		$(expando.button).insertAfter(element.parentElement);
		thing.entry.appendChild(expando.box);
	} else {
		$(element).add($(element).next('.keyNavAnnotation')).last()
			.after(expando.box)
			.after(expando.button);
	}

	expando.button.addEventListener('click', () => {
		if (expando.deferred) {
			deferredExpandos.get(expando)();
		}

		expando.toggle({ scrollOnMoveError: true });
	}, true);

	const complete = () => {
		completeExpando(expando, thing, mediaInfo).catch(e => {
			console.error(`showImages: could not create expando for ${mediaInfo.href}`);
			console.error(e);

			if (nativeExpando) nativeExpando.reattach();
			expando.destroy();
			scannedLinks.set(element, true);
		});
	};

	if (!expando.button.offsetParent) {
		// No need to complete building non-visible expandos
		expando.deferred = true;
		deferredExpandos.set(expando, () => {
			complete();
			deferredExpandos.delete(expando);
		});
	} else {
		complete();
	}
}

async function completeExpando(expando, thing, mediaInfo) {
	expando.deferred = false;

	const options = await retrieveExpandoOptions(thing, mediaInfo);

	Object.assign(expando, options);

	if (thing.isComment()) {
		expando.onExpand(_.once(() => {
			let wasOpen;

			// Execute expando toggle procedure when comment collapse / expand
			thing.$thing
				.parents('.comment')
				.addBack()
				.find('> .entry .tagline > .expand')
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

	if (module.options.autoMaxHeight.value && expando.inText) {
		thing.entry.addEventListener('mediaResize', updateParentHeight);
	}

	if (!expando.expandWanted) expando.expandWanted = expando::isExpandWanted({ thing });

	expando.initialize();

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

	const attribution = module.options.showSiteAttribution.value &&
		thing.isPost() && !thing.isSelfPost() &&
		siteModule.domains.length && siteModule.attribution !== false;

	const isMuted = ({ muted, type }) => muted || ['IMAGE', 'TEXT'].includes(type);

	mediaOptions = {
		attribution,
		href,
		muted: mediaOptions.type === 'GALLERY' ? mediaOptions.src.every(isMuted) : isMuted(mediaOptions),
		...mediaOptions,
	};

	mediaOptions.buttonInfo = getMediaButtonInfo(mediaOptions);

	const trackLoad = _.once(() => trackMediaLoad(element));

	return {
		href, // Since mediaOptions.href may be overwritten
		generateMedia: () => generateMedia(mediaOptions, siteModule),
		mediaOptions,
		onMediaAttach() {
			trackLoad();
			if (mediaOptions.onAttach) mediaOptions.onAttach();
		},
	};
}, (thing, { href }) => href);

function updateParentHeight(e) {
	const thing = new Thing(e.target);

	const basisHeight = (thing.isSelfPost() && parseInt(module.options.selfTextMaxHeight.value, 10)) ||
		(thing.isComment() && parseInt(module.options.commentMaxHeight.value, 10));

	if (basisHeight > 0) {
		// .expando-button causes a line break
		const expandoHeight = Array
			.from(thing.entry.querySelectorAll('.res-expando-box, .expando-button.expanded'))
			.reduce((a, b) => a + b.getBoundingClientRect().height, 0);

		thing.querySelector('.md').style.maxHeight = `${basisHeight + expandoHeight}px`;
	}
}

function trackNativeExpando(expando, element) {
	// only track media
	if (expando.button.classList.contains('selftext')) return;

	const trackLoad = _.once(() => trackMediaLoad(element));

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
		NOEMBED: 'video',
		GENERIC_EXPANDO: 'selftext',
	}[type];

	return {
		title,
		mediaClass: options.expandoClass || defaultClass,
	};
}

function generateMedia(options, siteModule) {
	if (options.credits) options.credits = $('<span>').safeHtml(options.credits).html();
	if (options.caption) options.caption = $('<span>').safeHtml(options.caption).html();

	const mediaGenerators = {
		GALLERY: generateGallery,
		IMAGE: generateImage,
		TEXT: generateText,
		IFRAME: generateIframe,
		VIDEO: generateVideo,
		AUDIO: generateAudio,
		NOEMBED: generateNoEmbed,
		GENERIC_EXPANDO: generateGeneric,
	};

	const element = mediaGenerators[options.type](options);

	if (options.attribution) addSiteAttribution(siteModule, element);

	return element;
}

function generateGallery(options) {
	const element = $(galleryTemplate(options))[0];

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

	const pieces = options.src.map(src => ({ options: { href: options.href, ...src }, media: null }));
	let lastRevealedPiece = null;

	function revealPiece(piece) {
		lastRevealedPiece = piece;

		piece.media = piece.media || generateMedia(piece.options);
		if (!piece.media.parentElement) {
			const block = document.createElement('div');
			block.appendChild(piece.media);
			piecesContainer.appendChild(block);
		}
		piece.media.parentElement.hidden = false;
		if (piece.media.expand) piece.media.expand();
	}

	function preloadAhead() {
		const preloadFrom = pieces.indexOf(lastRevealedPiece) + 1;
		const preloadTo = Math.min(preloadFrom + preloadCount, pieces.length);

		pieces.slice(preloadFrom, preloadTo)::forEachSeq(piece => {
			if (!piece.media) piece.media = generateMedia(piece.options);
			return piece.media.ready;
		});
	}

	async function expandFilmstrip() {
		const revealFrom = pieces.indexOf(lastRevealedPiece) + 1;
		const revealTo = Math.min(revealFrom + filmstripLoadIncrement, pieces.length);

		ctrlConcurrentIncrease.hidden = true;

		// wait for last revealed piece to load, if present
		if (lastRevealedPiece && lastRevealedPiece.media && lastRevealedPiece.media.ready) {
			await lastRevealedPiece.media.ready;
		}

		// reveal new pieces
		await pieces.slice(revealFrom, revealTo)::forEachSeq(piece => {
			revealPiece(piece);
			return piece.media.ready;
		});

		if (revealTo < pieces.length) {
			ctrlConcurrentIncrease.innerText = `Show next ${Math.min(filmstripLoadIncrement, pieces.length - revealTo)} pieces`;
			ctrlConcurrentIncrease.hidden = false;
		}

		preloadAhead();
	}

	async function changeSlideshowPiece(step) {
		const lastRevealedPieceIndex = lastRevealedPiece ? pieces.indexOf(lastRevealedPiece) : 0;
		const previousMedia = lastRevealedPiece && lastRevealedPiece.media;

		let newIndex = lastRevealedPieceIndex + step;
		// Allow wrap-around
		newIndex = positiveModulo(newIndex, pieces.length);

		individualCtrl.setAttribute('first-piece', newIndex === 0);
		individualCtrl.setAttribute('last-piece', newIndex === pieces.length - 1);
		msgPosition.innerText = newIndex + 1;

		revealPiece(pieces[newIndex]);

		if (previousMedia) {
			const removeInstead = previousMedia.collapse && previousMedia.collapse();
			if (removeInstead) {
				previousMedia.remove();
			} else {
				previousMedia.parentElement.hidden = true;
			}
		}

		if (module.options.conserveMemory.value) {
			const first = newIndex - preloadCount;
			const last = newIndex + preloadCount;

			pieces.filter(piece => piece.media)
				.map(piece => ({ media: piece.media, data: piece }))
				::lazyUnload(piece => {
					const index = pieces.indexOf(piece);
					if (last > pieces.length && last % pieces.length >= index) return true;
					if (first < 0 && positiveModulo(first, pieces.length) <= index) return true;
					return index >= first && index <= last;
				});
		}

		if (lastRevealedPiece.media.ready) await lastRevealedPiece.media.ready;
		preloadAhead();
	}

	if (filmstripActive || pieces.length === 1) {
		expandFilmstrip();
		ctrlConcurrentIncrease.addEventListener('click', expandFilmstrip);
	} else {
		element.classList.add('res-gallery-slideshow');
		changeSlideshowPiece(0);
		ctrlPrev.addEventListener('click', () => { changeSlideshowPiece(-1); });
		ctrlNext.addEventListener('click', () => { changeSlideshowPiece(1); });
	}

	return element;
}

function generateImage(options) {
	options.openInNewWindow = module.options.openInNewWindow.value;

	const element = $(imageTemplate(options))[0];
	const image = element.querySelector('img.res-image-media');
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
	setMediaClippyText(image);
	const wrapper = setMediaControls(anchor, options.src);
	makeMediaMovable(wrapper);
	keepMediaVisible(wrapper);
	makeMediaIndependentOnResize(element, wrapper);

	return element;
}

function generateIframe(options) {
	const iframeNode = document.createElement('iframe');
	iframeNode.src = (module.options.autoplayVideo.value && options.embedAutoplay) ?
		options.embedAutoplay : options.embed;
	iframeNode.allowFullscreen = true;
	iframeNode.style.border = '0';
	iframeNode.style.height = options.height || '360px';
	iframeNode.style.width = options.width || '640px';
	iframeNode.style.minWidth = '480px';
	iframeNode.style.maxWidth = 'initial';

	const element = document.createElement('div');
	element.appendChild(iframeNode);

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

	keepMediaVisible(iframeNode);
	makeMediaIndependentOnResize(element, iframeNode);

	return element;
}

function generateText(options) {
	options.src = $('<span>').safeHtml(options.src).html();

	return $(textTemplate(options))[0];
}

function generateVideo(options) {
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
		time: 0,
		...options,
	};

	return videoAdvanced(filledOptions);
}

function generateAudio(options) {
	let {
		autoplay,
	} = options;

	const element = $(audioTemplate(options))[0];
	const audio = element.querySelector('audio');

	element.collapse = () => {
		// Audio is auto-paused when detached from DOM
		if (!document.body.contains(audio)) return;

		autoplay = !audio.paused;
		if (!audio.paused) audio.pause();
	};
	element.expand = () => { if (autoplay) audio.play(); };

	return element;
}

function generateGeneric(options) {
	const element = document.createElement('div');

	element.appendChild(options.generate(options));

	// Always remove content, in case it contains audio or other unwanted things
	element.collapse = () => true;

	return element;
}

// XXX Correctness not considered since it is not in use
async function generateNoEmbed(options) {
	const noEmbedFrame = document.createElement('iframe');
	// not all noEmbed responses have a height and width, so if
	// this siteMod has a width and/or height set, use them.
	if (options.width) {
		noEmbedFrame.setAttribute('width', options.width);
	}
	if (options.height) {
		noEmbedFrame.setAttribute('height', options.height);
	}
	if (options.urlMod) {
		noEmbedFrame.setAttribute('src', options.urlMod(response.url));
	}

	const response = await ajax({
		url: 'https://noembed.com/embed',
		data: { url: options.src },
		type: 'json',
	});

	for (const key in response) {
		switch (key) {
			case 'url':
				if (!noEmbedFrame.hasAttribute('src')) {
					noEmbedFrame.setAttribute('src', response[key]);
				}
				break;
			case 'width':
				noEmbedFrame.setAttribute('width', response[key]);
				break;
			case 'height':
				noEmbedFrame.setAttribute('height', response[key]);
				break;
			default:
				break;
		}
	}

	return noEmbedFrame;
}

const trackVisit = batch(async links => {
	if (await isPrivateBrowsing()) return;

	const fullnames = links
		.map(link => $(link).closest('.thing'))
		.filter($link => !$link.hasClass('visited'))
		.map($link => $link.data('fullname'));

	await ajax({
		method: 'POST',
		url: '/api/store_visits',
		data: { links: fullnames.join(',') },
	});
}, { delay: 1000 });

function trackMediaLoad(link) {
	if (module.options.markVisited.value) {
		// also use reddit's mechanism for storing visited links if user has gold.
		if ($('body').hasClass('gold')) {
			trackVisit(link);
		}

		const isNSFW = $(link).closest('.thing').is('.over18');
		const sfwMode = module.options.sfwHistory.value;

		const url = link.href;
		if (!isNSFW || sfwMode !== 'none') link.classList.add('visited');
		if (!isNSFW || sfwMode === 'add') addURLToHistory(url);
	}
}

function setMediaControls(media, lookupUrl) {
	if (!module.options.mediaControls.value) return media;

	const [y, x] = module.options.mediaControlsPosition.value.split('-');
	const options = { lookupUrl, x, y };

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

	controls.addEventListener('click', e => {
		hookInResizeListener();

		switch (e.target.dataset.action) {
			case 'rotateLeft':
				rotateMedia(media, --rotationState);
				break;
			case 'rotateRight':
				rotateMedia(media, ++rotationState);
				break;
			case 'imageLookup':
				// Google doesn't like image url's without a protacol
				lookupUrl = new URL(lookupUrl, location.href).href;

				openNewTab(`https://images.google.com/searchbyimage?image_url=${lookupUrl}`);
				break;
			case 'showImageSettings':
				SettingsNavigation.loadSettingsPage(module.moduleID, 'mediaControls');
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
	const $replace = $.find('.res-expando-siteAttribution', media);
	if ($replace.length) {
		$element.replaceAll($replace);
	} else {
		$element.appendTo(media);
	}
}

function keepMediaVisible(media) {
	let isManuallyMoved = false;

	media.classList.add('res-media-keep-visible');

	media.addEventListener('mediaResize', e => {
		if (e.detail === resizeSources.KEEP_VISIBLE) return;

		if (isManuallyMoved || e.detail === resizeSources.DRAG_MOVE) {
			isManuallyMoved = true;
			return;
		}

		const documentWidth = document.documentElement.getBoundingClientRect().width;

		const { width: mediaWidth, left: mediaLeft, right: mediaRight } = media.getBoundingClientRect();

		const basisLeft = media.parentElement.getBoundingClientRect().left;
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

function setMediaClippyText(elem) {
	if (!module.options.clippy.value || elem.title) return;

	const clippy = [];
	if (module.options.imageZoom.value) {
		clippy.push('drag to resize');
	}

	if (elem.tagName === 'IMG' && module.options.imageMove.value) {
		clippy.push('shift-drag to move');
	}

	const title = clippy.join(' or ');

	elem.setAttribute('title', title);
}

function setMediaMaxSize(media) {
	let value = module.options.maxWidth.value;
	let maxWidth = parseInt(value, 10);
	if (maxWidth > 0) {
		if (_.isString(value) && value.endsWith('%')) {
			const viewportWidth = document.documentElement.getBoundingClientRect().width;
			maxWidth *= viewportWidth / 100;
		}
		media.style.maxWidth = `${maxWidth}px`;
	}

	value = module.options.maxHeight.value;
	let maxHeight = parseInt(value, 10);
	if (maxHeight > 0) {
		if (_.isString(value) && value.endsWith('%')) {
			const viewportHeight = document.documentElement.clientHeight;
			maxHeight *= viewportHeight / 100;
		}
		media.style.maxHeight = `${maxHeight}px`;
	}
}

function addDragListener({ media, atShiftKey, onStart, onMove }) {
	let isActive, hasMoved, lastX, lastY;

	const handleMove = frameDebounce(e => {
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

	function handleClick(e) {
		if (hasMoved) e.preventDefault();
		document.removeEventListener('click', handleClick);
	}

	function stop() {
		document.body.classList.remove('res-media-dragging');

		document.removeEventListener('mousemove', handleMove);
		document.removeEventListener('mouseup', stop);
	}

	function initiate(e) {
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

function makeMediaZoomable(media) {
	if (!module.options.imageZoom.value) return;

	media.classList.add('res-media-zoomable');

	let initialWidth, initialDiagonal, minWidth, left, top;

	function getDiagonal(x, y) {
		const w = Math.max(1, x - left);
		const h = Math.max(1, y - top);
		return Math.round(Math.hypot(w, h));
	}

	addDragListener({
		media,
		atShiftKey: false,
		onStart(x, y) {
			({ left, top } = media.getBoundingClientRect());
			initialDiagonal = getDiagonal(x, y);
			initialWidth = media.clientWidth;
			minWidth = Math.max(1, Math.min(media.clientWidth, 100));
		},
		onMove(x, y) {
			const newWidth = Math.max(minWidth, getDiagonal(x, y) / initialDiagonal * initialWidth);
			resizeMedia(media, newWidth);
		},
	});
}

function makeMediaMovable(media) {
	if (!module.options.imageMove.value) return;

	media.classList.add('res-media-movable');

	addDragListener({
		media,
		atShiftKey: true,
		onMove(x, y, deltaX, deltaY) { moveMedia(media, deltaX, deltaY, resizeSources.DRAG_MOVE); },
	});
}

function makeMediaIndependentOnResize(media, element) {
	const wrapper = document.createElement('div');
	const independent = document.createElement('div');
	$(element).replaceWith(wrapper);
	wrapper.appendChild(independent);
	independent.appendChild(element);

	const debouncedResize = frameDebounce(media.emitResizeEvent);

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
		window.addEventListener('resize', debouncedResize);
	});

	// This is a slower method to listen to resizes, as it waits till the frame after the size is se to updatet.
	// Using this is however necessary when it's not possible to determine size from media events.
	elementResizeDetector.listenTo(element, () => {
		if (element.clientHeight !== lastHeight) media.emitResizeEvent();
	});

	const prevExpand = media.expand;
	media.expand = () => {
		if (media.independent) media.emitResizeEvent();
		if (prevExpand) return prevExpand();
	};

	const prevCollapse = media.collapse;
	media.collapse = () => {
		window.removeEventListener('resize', debouncedResize);
		if (prevCollapse) return prevCollapse();
	};
}

function videoAdvanced(options) {
	const {
		fallback,
		frameRate,
		playbackRate,
		advancedControls,
	} = options;

	let {
		autoplay,
		time,
	} = options;

	// Poster is unnecessary, and will flash if loaded before the video is ready
	if (autoplay) delete options.poster;

	const element = document.createElement('div');
	const player = $(videoAdvancedTemplate(options))[0];
	element.appendChild(player);

	const vid = player.querySelector('video');

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
		_.defer(sourceErrorFallback);
		return element;
	}

	function setAdvancedControls() {
		function reverse() {
			time = vid.duration - vid.currentTime;

			for (const v of vid.querySelectorAll('source')) {
				[v.src, v.dataset.reverse] = [v.dataset.reverse, v.src];
			}

			vid.load();
			vid.play();

			player.classList.toggle('reversed');
		}

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

		ctrlTogglePause.addEventListener('click', () => { vid[vid.paused ? 'play' : 'pause'](); });
		if (ctrlReverse) ctrlReverse.addEventListener('click', reverse);

		ctrlSpeedDecrease.addEventListener('click', () => { vid.playbackRate /= 1.1; });
		ctrlSpeedIncrease.addEventListener('click', () => { vid.playbackRate *= 1.1; });
		ctrlTimeDecrease.addEventListener('click', () => { vid.currentTime -= 1 / frameRate; });
		ctrlTimeIncrease.addEventListener('click', () => { vid.currentTime += 1 / frameRate; });

		vid.addEventListener('ratechange', () => { msgSpeed.innerHTML = `${vid.playbackRate.toFixed(2).replace('.', '.<wbr>')}x`; });
		vid.addEventListener('timeupdate', () => {
			indicatorPosition.style.left = `${(vid.currentTime / vid.duration) * 100}%`;
			msgTime.innerHTML = `${vid.currentTime.toFixed(2).replace('.', '.<wbr>')}s`;
		});

		progress.addEventListener('mousemove', e => {
			let left = e.offsetX;
			if (e.target === ctrlPosition) { left += e.target.offsetLeft; }
			ctrlPosition.style.left = `${left}px`;

			if (e.buttons === 1 /* left mouse button */) ctrlPosition.click();
		});
		ctrlPosition.addEventListener('click', e => {
			const percentage = (e.target.offsetLeft + e.target.clientWidth / 2) / progress.clientWidth;
			vid.currentTime = vid.duration * percentage;
		});
	}

	if (advancedControls) {
		Promise.all([waitForEvent(player, 'mouseenter'), waitForEvent(vid, 'loadedmetadata')])
			.then(setAdvancedControls);
	}

	function sourceErrorFallback() {
		if (fallback) {
			$(element).replaceWith(generateImage({
				...options,
				src: fallback,
			}));
		} else {
			msgError.hidden = false;
		}
	}

	const lastSource = sourceElements[sourceElements.length - 1];
	lastSource.addEventListener('error', sourceErrorFallback);

	vid.addEventListener('pause', () => { player.classList.remove('playing'); });
	vid.addEventListener('play', () => { player.classList.add('playing'); });

	vid.addEventListener('loadedmetadata', () => { if (time !== vid.currentTime) vid.currentTime = time; });
	vid.playbackRate = playbackRate;

	// Ignore events which might be meant for controls
	vid.addEventListener('mousedown', e => {
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

	element.collapse = () => {
		// Video is auto-paused when detached from DOM
		if (!document.body.contains(vid)) return;

		autoplay = !vid.paused;
		if (!vid.paused) vid.pause();

		time = vid.currentTime;
		vid.setAttribute('src', ''); // vid.src has precedence over any child source element
		vid.load();
	};
	element.expand = () => {
		if (vid.hasAttribute('src')) {
			vid.removeAttribute('src');
			vid.load();
		}

		if (autoplay) vid.play();
	};

	element.emitResizeEvent = () => { vid.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true })); };

	element.ready = Promise.race([waitForEvent(vid, 'suspend'), waitForEvent(lastSource, 'error')]);

	vid.addEventListener('loadedmetadata', element.emitResizeEvent);

	setMediaMaxSize(vid);
	makeMediaZoomable(vid);
	setMediaClippyText(vid);
	setMediaControls(vid);
	makeMediaMovable(player);
	keepMediaVisible(player);
	makeMediaIndependentOnResize(element, player);

	return element;
}

export function moveMedia(ele, deltaX, deltaY, source = resizeSources.OTHER) {
	ele.style.marginLeft = `${(parseInt(ele.style.marginLeft, 10) || 0) + deltaX}px`;
	ele.style.marginTop = `${(parseInt(ele.style.marginTop, 10) || 0) + deltaY}px`;

	ele.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true, detail: source }));
}

export function resizeMedia(ele, newWidth) {
	ele.style.width = `${newWidth}px`;
	ele.style.maxWidth = `${newWidth}px`;
	ele.style.maxHeight = '';
	ele.style.height = 'auto';

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
