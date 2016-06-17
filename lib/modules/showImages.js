/*
	If you would like RES to embed content from your website,
	consult lib/modules/hosts/example.js
*/

import _ from 'lodash';
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
	addCSS,
	batch,
	CreateElement,
	forEachChunked,
	forEachSeq,
	filter,
	frameDebounce,
	isCurrentSubreddit,
	isPageType,
	objectValidator,
	waitForEvent,
	watchForElement,
	scrollToElement,
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
		value: '640',
		description: 'Max width of image displayed onscreen (enter zero for unlimited).',
		advanced: true,
	},
	maxHeight: {
		type: 'text',
		value: '0',
		description: 'Max height of image displayed onscreen (enter zero for unlimited).',
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
		description: 'Mark links visited when you view images (does eat some resources).',
		advanced: true,
	},
	sfwHistory: {
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
	loadAllInAlbum: {
		type: 'boolean',
		value: false,
		description: 'Display all images at once in a \'filmstrip\' layout, rather than the default navigable \'slideshow\' style.',
	},
	dontLoadAlbumsBiggerThan: {
		dependsOn: 'loadAllInAlbum',
		type: 'text',
		value: 30,
		description: 'Limit the number of images initally shown in a \'filmstrip\' by this number. (0 for no limit)',
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

module.loadDynamicOptions = function() {
	// Augment the options with available image modules
	for (const site in siteModules) {
		// Ignore default
		if (site === 'default') continue;
		if (site === 'defaultVideo') continue;
		if (site === 'defaultAudio') continue;

		// Auto add on / off options
		createSiteModuleEnabledOption(site);

		// Find out if module has any additional options - if it does add them
		if (siteModules[site].options) {
			for (const optionKey in siteModules[site].options) {
				this.options[optionKey] = siteModules[site].options[optionKey];
			}
		}
	}
};

function isSiteModuleEnabled(siteName) {
	const key = `display ${siteName}`;
	return (module.options[key] && module.options[key].value) !== false;
}

function createSiteModuleEnabledOption(site) {
	// Create on/off option for given module
	const name = (typeof siteModules[site].name !== 'undefined') ? siteModules[site].name : site;
	module.options[`display ${name}`] = {
		description: `Display expander for ${name}`,
		value: true,
		type: 'boolean',
	};
}

module.beforeLoad = function() {
	const selfTextMaxHeight = parseInt(this.options.selfTextMaxHeight.value, 10);
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

	const commentMaxHeight = parseInt(this.options.commentMaxHeight.value, 10);
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

const domainModuleMap = {};

// Return the 2nd last component ("a.x.com" → "x"), in case the hosts have several tlds
const getMainDomainComponent = domain => domain.split('.').splice(-2)[0];

module.go = function() {
	if (this.options.conserveMemory.value) {
		enableConserveMemory();
	}

	enableCompleteDeferredExpandos();

	watchForElement('siteTable', findAllImages);
	watchForElement('selfText', v => findAllImages(v, true));
	watchForElement('newComments', v => findAllImages(v, true));

	createImageButtons();

	for (const module of Object.values(siteModules)) {
		if (isSiteModuleEnabled(module.name)) {
			if (module.go) module.go();
			for (const domain of module.domains) {
				domainModuleMap[getMainDomainComponent(domain)] = module;
			}
		}
	}

	findAllImages(document.body);
	document.addEventListener('dragstart', () => false, false);

	// Handle spotlight next/prev hiding open expando's
	const spotlight = document.querySelector('#siteTable_organic');
	if (spotlight) {
		const nextprev = spotlight.querySelector('.nextprev');
		if (!nextprev) return;

		nextprev.addEventListener('click', () => {
			const open = spotlight.querySelector('.expando-button.expanded');
			if (open) open.click();
		}, false);
	}
};

// @type {Map.<expandoButton, () => completeExpando>}
const deferredExpandos = new Map();

const mediaStates = {
	NONE: 0,
	LOADED: 1,
	UNLOADED: 2,
};

const resizeSources = {
	MANUAL: 0,
	OTHER: 1,
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
	window.addEventListener('resize', check);
}

/**
 * enableConserveMemory
 * attempt to unload collapsed expando's & images that are off screen in order
 * to save memory
 *
 * @returns {void}
 */
function enableConserveMemory() {
	window.addEventListener('scroll', _.debounce(() => {
		const activeExpandos = Array.from(primaryExpandos.values());

		// Empty collapsed when beyond buffer
		for (const expando of activeExpandos) {
			if (!expando.isAttached()) expando.destroy();
			else if (!expando.open && !isWithinBuffer(expando.button)) expando.empty();
		}

		// Unload expanded when beyond buffer
		activeExpandos
			.filter(v => v.open)
			.map(v => ({ media: v.media, data: v.media }))
			::lazyUnload(isWithinBuffer);
	}, 150), false);
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
export let autoExpandActive = false;

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

export function toggleThingExpandos(thing, scrollOnExpanding) {
	const expandos = thing.getExpandos();
	if (!expandos.length) return;

	const openExpandos = expandos.filter(v => v.open);

	// If any open expandos exists within thing, collapse all
	// Else, expand all
	if (openExpandos.length) {
		for (const expando of openExpandos) expando.collapse();
	} else {
		for (const expando of expandos) {
			if (!(expando instanceof Expando) ||
				expando::isExpandWanted({ thing, autoExpand: true, ignoreDuplicates: false })
			) {
				expando.expand();
			}
		}

		if (scrollOnExpanding) {
			const upperExpando = expandos::sortExpandosVertically()[0];
			const element = upperExpando instanceof Expando && upperExpando.inText ?
				upperExpando.button : thing.getTitleElement();
			scrollToElement(element, { scrollStyle: 'top' });
		}
	}
}

function isExpandWanted({
		thing = null,
		autoExpand = autoExpandActive,
		ignoreDuplicates = true,
	} = {}) {
	if (ignoreDuplicates && !this.isPrimary()) return false;

	if (thing && (autoExpand ||
		module.options.autoExpandSelfText.value && thing.isSelfPost() && !isPageType('comments') && this.inText
	)) {
		// Expand all muted expandos and the first non-muted expando
		return this.mediaOptions.muted ||
			!thing.getTextExpandos()
				.find(v => (v.open || v.expandWanted) && !v.mediaOptions.muted);
	} else {
		return autoExpand && (this.mediaOptions && this.mediaOptions.muted);
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

function getMediaInfo(mediaLink) {
	const matchingHosts = _.compact([
		domainModuleMap[getMainDomainComponent(mediaLink.hostname)],
		siteModules.default,
		siteModules.defaultVideo,
		siteModules.defaultAudio,
	]);

	for (const siteModule of matchingHosts) {
		const detectResult = siteModule.detect(mediaLink);
		if (detectResult) return { detectResult, siteModule, mediaLink, href: mediaLink.href };
	}
}

function checkElementForMedia(mediaLink) {
	if (mediaLink.classList.contains('imgScanned')) return;
	mediaLink.classList.add('imgScanned');

	let thing;

	if (module.options.hideNSFW.value) {
		thing = new Thing(mediaLink);
		if (thing.isNSFW()) return;
	}

	const mediaInfo = getMediaInfo(mediaLink);
	if (!mediaInfo) return;

	thing = thing || new Thing(mediaLink);

	const inText = !!$(mediaLink).closest('.md, .search-result-footer')[0];

	const nativeExpando = !inText && thing.getEntryExpando();
	const nativeExpandoButton = nativeExpando && nativeExpando.button;
	if (nativeExpandoButton) {
		if (thing.querySelector('.media-preview')) {
			console.log('A media preview is already available; skipping.', mediaLink.href);
			return;
		}

		nativeExpandoButton.remove();
	}

	const expando = new Expando(inText);
	expandos.set(expando.button, expando);

	if (!inText && thing.getTitleElement()) {
		$(expando.button).insertAfter(mediaLink.parentElement);
		thing.entry.appendChild(expando.box);
	} else {
		$(expando.button)
			.insertAfter(mediaLink)
			.after(expando.box);
	}

	expando.button.addEventListener('click', () => {
		if (expando.deferred) {
			deferredExpandos.get(expando)();
		}

		expando.toggle();
	}, true);

	const complete = () => {
		completeExpando(expando, thing, mediaInfo).catch(e => {
			console.error(`showImages: could not create expando for ${mediaInfo.href}`);
			console.error(e);

			if (nativeExpandoButton) $(expando.button).after(nativeExpandoButton);
			expando.destroy();
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

	if (thing.querySelector('.media-preview')) throw Error('Native expando has been expanded');

	Object.assign(expando, options);

	if (thing.isComment()) {
		let wasOpen;

		// Execute expando toggle procedure when comment collapse / expand
		thing.$thing
			.parents('.comment')
			.andSelf()
			.find('> .entry .expand')
			.click(() => {
				if (expando.button.offsetParent) {
					if (wasOpen) expando.expand();
				} else {
					wasOpen = expando.open;
					if (expando.open) expando.collapse();
				}

				updateAutoExpandCount();
			});
	}

	if (module.options.autoMaxHeight.value && expando.inText) {
		thing.entry.addEventListener('mediaResize', updateParentHeight);
	}

	expando.resize = frameDebounce(() => {
		const $container = $(expando.box).closest('.md > *, .entry > *');
		// jQuery().width() returns non-padded width
		const width = $container.parent().width();
		// In case the box is inside a table or list, normalize its horizontal position
		const marginLeft = $container[0].getBoundingClientRect().left -
			expando.box.getBoundingClientRect().left;

		expando.adjustInnersize(width, marginLeft);
	});

	if (!expando.expandWanted) expando.expandWanted = expando::isExpandWanted({ thing });

	expando.initialize();

	updateAutoExpandCount();
}

const retrieveExpandoOptions = _.memoize(async (thing, { siteModule, detectResult, mediaLink, href }) => {
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

	mediaOptions = {
		attribution,
		href,
		muted: ['IMAGE', 'GALLERY', 'TEXT'].includes(mediaOptions.type),
		...mediaOptions,
	};

	const trackLoad = _.once(() => trackMediaLoad(mediaLink));

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

	const filmstripActive = module.options.loadAllInAlbum.value;
	const filmstripMaxCount = parseInt(module.options.dontLoadAlbumsBiggerThan.value, 10) || Infinity;

	const pieces = options.src.map(src => ({ options: { href: options.href, ...src }, media: null }));
	let lastRevealedPiece = null;

	function revealPiece(piece) {
		lastRevealedPiece = piece;

		piece.media = piece.media || generateMedia(piece.options);
		piece.media.hidden = false;
		if (!piece.media.parentElement) {
			const block = document.createElement('div');
			block.classList.add('res-gallery-piece-block');
			block.appendChild(piece.media);
			piecesContainer.appendChild(block);
		}
		if (piece.media.expand) piece.media.expand();
		piece.media.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));
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
		const revealTo = Math.min(revealFrom + filmstripMaxCount, pieces.length);

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
			ctrlConcurrentIncrease.innerText = `Show next ${Math.min(filmstripMaxCount, pieces.length - revealTo)} pieces`;
			ctrlConcurrentIncrease.hidden = false;
		}

		preloadAhead();
	}

	async function changeSlideshowPiece(step) {
		const lastRevealedPieceIndex = lastRevealedPiece ? pieces.indexOf(lastRevealedPiece) : 0;

		if (lastRevealedPiece && lastRevealedPiece.media) {
			const removeInstead = lastRevealedPiece.media.collapse && lastRevealedPiece.media.collapse();
			if (removeInstead) {
				lastRevealedPiece.media.remove();
			} else {
				lastRevealedPiece.media.hidden = true;
			}
		}

		let newIndex = lastRevealedPieceIndex + step;
		// Allow wrap-around
		newIndex = positiveModulo(newIndex, pieces.length);

		individualCtrl.setAttribute('first-piece', newIndex === 0);
		individualCtrl.setAttribute('last-piece', newIndex === pieces.length - 1);
		msgPosition.innerText = newIndex + 1;

		revealPiece(pieces[newIndex]);

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

	ctrlPrev.addEventListener('click', () => { changeSlideshowPiece(-1); });
	ctrlNext.addEventListener('click', () => { changeSlideshowPiece(1); });

	ctrlConcurrentIncrease.addEventListener('click', expandFilmstrip);

	if (filmstripActive || pieces.length === 1) {
		expandFilmstrip();
	} else {
		element.classList.add('res-gallery-slideshow');
		changeSlideshowPiece(0);
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

		image.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));
	});
	image.addEventListener('load', () => {
		if (element.state === mediaStates.NONE) {
			if (module.options.displayOriginalResolution.value && image.naturalWidth && image.naturalHeight) {
				image.title = `${image.naturalWidth} × ${image.naturalHeight} px`;
			}

			image.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));

			element.state = mediaStates.LOADED;
		}
	});

	const maxWidth = parseInt(module.options.maxWidth.value, 10);
	if (maxWidth > 0) image.style.maxWidth = `${maxWidth}px`;
	const maxHeight = parseInt(module.options.maxHeight.value, 10);
	if (maxHeight > 0) image.style.maxHeight = `${maxHeight}px`;

	element.unload = () => {
		element.state = mediaStates.UNLOADED;

		image.src = transparentGif;
	};
	element.restore = () => {
		element.state = mediaStates.LOADED;

		image.src = options.src;
	};

	element.ready = waitForEvent(image, 'load', 'error');

	let lastHeight;
	const resize = frameDebounce((/* force */) => {
		if (/* force || */image.clientHeight !== lastHeight) {
			image.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));
			lastHeight = image.clientHeight;
		}
	});
	// Loading of images is often slow, and it takes a while for the load event to be emitted
	// so have the placeholder mostly synchroized, send a resize event often
	const resizeWhileLoading = setInterval(resize, 50);

	element.ready.then(() => { clearInterval(resizeWhileLoading); });

	makeMediaZoomable(image);
	setMediaClippyText(image);
	const wrapper = setMediaControls(anchor, options.src);
	makeMediaMovable(wrapper);
	keepMediaVisible(wrapper, element);

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
		iframeNode.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));

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

	keepMediaVisible(iframeNode, element);

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
	};

	const $element = $(siteAttributionTemplate(metadata));
	const $replace = $.find('.res-expando-siteAttribution', media);
	if ($replace.length) {
		$element.replaceAll($replace);
	} else {
		$element.appendTo(media);
	}
}

function keepMediaVisible(media, listenElement = media) {
	let isManuallyMoved = false;

	media.classList.add('res-media-keep-visible');

	const adjustAlignment = frameDebounce(e => {
		if (!media.offsetParent) return;

		// Realignment on manual resizing may be non-intutive
		if (isManuallyMoved || e.detail === resizeSources.MANUAL) {
			isManuallyMoved = true;
			return;
		}

		const width = document.documentElement.clientWidth;

		// scrollWidth includes the width of any overflow
		const mediaWidth = media.scrollWidth;
		const mediaLeft = media.getBoundingClientRect().left;
		const mediaRight = mediaLeft + mediaWidth;

		if (mediaWidth > width) {
			moveMedia(media, -mediaLeft, 0, resizeSources.OTHER);
		} else if (mediaRight - media.offsetLeft > width) {
			moveMedia(media, width - mediaRight, 0, resizeSources.OTHER);
		} else if (media.offsetLeft) {
			moveMedia(media, -media.offsetLeft, 0, resizeSources.OTHER);
		}
	});

	listenElement.addEventListener('mediaResize', adjustAlignment);
	window.addEventListener('resize', adjustAlignment);
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

function addDragListener({ media, atShiftKey, onStart, onMove }) {
	let isActive, hasMoved, lastX, lastY;

	const handleMove = frameDebounce(e => {
		if (!e.movementX && !e.movementY) {
			// Mousemove may be triggered even without movement
			return;
		} else if (e.buttons !== 1) {
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
			document.body.classList.add('res-media-dragging');
		}

		onMove(e.clientX, e.clientY, e.clientX - lastX, e.clientY - lastY);
		({ clientX: lastX, clientY: lastY } = e);
	});

	function handleClick(e) {
		if (hasMoved) e.preventDefault();
		document.removeEventListener('click', handleClick);

		stop();
	}

	function stop() {
		document.body.classList.remove('res-media-dragging');

		document.removeEventListener('mousemove', handleMove);
	}

	function initiate(e) {
		if (e.buttons !== 1) return;

		({ clientX: lastX, clientY: lastY } = e);

		hasMoved = false;
		isActive = false;

		document.addEventListener('mousemove', handleMove);
		document.addEventListener('click', handleClick);

		e.preventDefault();
	}

	media.addEventListener('mousedown', initiate);
}

function makeMediaZoomable(media) {
	if (!module.options.imageZoom.value) return;

	media.classList.add('res-media-zoomable');

	let initialWidth, initialDiagonal, minWidth;

	function getDiagonal(x, y) {
		const { left, top } = media.getBoundingClientRect();
		const w = Math.max(1, x - left);
		const h = Math.max(1, y - top);
		return Math.round(Math.hypot(w, h));
	}

	addDragListener({
		media,
		atShiftKey: false,
		onStart(x, y) {
			initialDiagonal = getDiagonal(x, y);
			initialWidth = media.clientWidth;
			minWidth = Math.max(1, Math.min(media.clientWidth, 100));
		},
		onMove(x, y) {
			const newWidth = Math.max(minWidth, getDiagonal(x, y) / initialDiagonal * initialWidth);
			resizeMedia(media, newWidth, resizeSources.MANUAL);
		},
	});
}

function makeMediaMovable(media) {
	if (!module.options.imageMove.value) return;

	media.classList.add('res-media-movable');

	addDragListener({
		media,
		atShiftKey: true,
		onMove(x, y, deltaX, deltaY) { moveMedia(media, deltaX, deltaY); },
	});
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

	const element = $(videoAdvancedTemplate(options))[0];

	const vid = element.querySelector('video');
	const sourceElements = vid.querySelectorAll('source');

	const msgError = element.querySelector('.video-advanced-error');

	function setAdvancedControls() {
		function reverse() {
			time = vid.duration - vid.currentTime;

			Array.from(vid.querySelectorAll('source')).forEach(v => {
				[v.src, v.dataset.reverse] = [v.dataset.reverse, v.src];
			});

			vid.load();
			vid.play();

			element.classList.toggle('reversed');
		}

		const ctrlContainer = element.querySelector('.video-advanced-controls');

		const ctrlReverse = ctrlContainer.querySelector('.video-advanced-reverse');
		const ctrlTogglePause = ctrlContainer.querySelector('.video-advanced-toggle-pause');
		const ctrlSpeedDecrease = ctrlContainer.querySelector('.video-advanced-speed-decrease');
		const ctrlSpeedIncrease = ctrlContainer.querySelector('.video-advanced-speed-increase');
		const ctrlTimeDecrease = ctrlContainer.querySelector('.video-advanced-time-decrease');
		const ctrlTimeIncrease = ctrlContainer.querySelector('.video-advanced-time-increase');

		const progress = element.querySelector('.video-advanced-progress');
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
		Promise.all([waitForEvent(element, 'mouseenter'), waitForEvent(vid, 'loadedmetadata')])
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
	lastSource.addEventListener('error', sourceErrorFallback, false);

	vid.addEventListener('pause', () => { element.classList.remove('playing'); });
	vid.addEventListener('play', () => { element.classList.add('playing'); });

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

	const maxWidth = parseInt(module.options.maxWidth.value, 10);
	if (maxWidth > 0) vid.style.maxWidth = `${maxWidth}px`;
	const maxHeight = parseInt(module.options.maxHeight.value, 10);
	if (maxHeight > 0) vid.style.maxHeight = `${maxHeight}px`;

	makeMediaZoomable(vid);
	setMediaClippyText(vid);
	setMediaControls(vid);
	makeMediaMovable(element);
	keepMediaVisible(element);

	element.collapse = () => {
		// Video is auto-paused when detached from DOM
		if (!document.body.contains(vid)) return;

		autoplay = !vid.paused;
		if (!vid.paused) vid.pause();
	};
	element.expand = () => { if (autoplay) vid.play(); };

	element.ready = Promise.race([waitForEvent(vid, 'loadeddata'), waitForEvent(lastSource, 'error')]);

	vid.addEventListener('loadedmetadata', () => { element.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true })); });

	return element;
}

export function moveMedia(ele, deltaX, deltaY, source = resizeSources.MANUAL) {
	ele.style.left = `${(parseFloat(ele.style.left, 10) || 0) + deltaX}px`;
	ele.style.top = `${(parseFloat(ele.style.top, 10) || 0) + deltaY}px`;

	ele.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true, detail: source }));
}

export function resizeMedia(ele, newWidth, source = resizeSources.OTHER) {
	ele.style.width = `${newWidth}px`;
	ele.style.maxWidth = `${newWidth}px`;
	ele.style.maxHeight = '';
	ele.style.height = 'auto';

	ele.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true, detail: source }));
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
