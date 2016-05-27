/*
	If you would like RES to embed content from your website,
	consult lib/modules/hosts/example.js
*/

import _ from 'lodash';
import { flow, forEach, keyBy, map, tap } from 'lodash/fp';
import audioTemplate from '../templates/audio.mustache';
import expandoTemplate from '../templates/expando.mustache';
import galleryTemplate from '../templates/gallery.mustache';
import imageTemplate from '../templates/image.mustache';
import mediaControlsTemplate from '../templates/mediaControls.mustache';
import siteAttributionTemplate from '../templates/siteAttribution.mustache';
import textTemplate from '../templates/text.mustache';
import videoAdvancedTemplate from '../templates/videoAdvanced.mustache';
import { $ } from '../vendor';
import {
	DAY,
	Thing,
	addCSS,
	batch,
	forEachChunked,
	frameDebounce,
	isCurrentSubreddit,
	isPageType,
	objectValidator,
	regexes,
	seq,
	waitForEvent,
	watchForElement,
} from '../utils';
import { addURLToHistory, ajax, isPrivateBrowsing, openNewTab } from '../environment';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';
import gfycat from './hosts/gfycat';

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
		description: 'Max width of image displayed onscreen',
		advanced: true,
	},
	maxHeight: {
		type: 'text',
		value: '480',
		description: 'Max height of image displayed onscreen',
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
	ignoreDuplicates: {
		type: 'boolean',
		value: true,
		description: 'Do not create expandos for images that appear multiple times in a page.',
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

function createSiteModuleEnabledOption(site) {
	// Create on/off option for given module
	const name = (typeof siteModules[site].name !== 'undefined') ? siteModules[site].name : site;
	module.options[`display ${name}`] = {
		description: `Display expander for ${name}`,
		value: true,
		type: 'boolean',
	};
}

const imageList = [];
// Subset of imageList, populated by images that have been interacted with & are thus eligible for cleanup
const activeImageList = new Set();
const imagesRevealed = {};
let dupeAnchors = 0;
/*
 true: show all images
 false: hide all images
 'any string': display images match the tab
 */
let currentImageTab = false;
const customImageTabs = {};

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

	// Generate domain to module map
	generateDomainModuleMap();
};

module.go = function() {
	if (this.options.conserveMemory.value) {
		enableConserveMemory();
	}

	watchForElement('siteTable', findAllImages);
	watchForElement('selfText', findAllImagesInSelfText);
	watchForElement('newComments', findAllImagesInSelfText);

	createImageButtons();
	findAllImages();
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

const mediaStates = {
	NONE: 0,
	LOADED: 1,
	UNLOADED: 2,
};

const resizeSources = {
	MANUAL: 0,
};

/**
 * enableConserveMemory
 * attempt to unload collapsed expando's & images that are off screen in order
 * to save memory
 *
 * @returns {void}
 */
function enableConserveMemory() {
	window.addEventListener('scroll', _.debounce(() => {
		const bufferScreens = module.options.bufferScreens.value || 2;
		const viewportHeight = window.innerHeight;
		const maximumTop = viewportHeight * (bufferScreens + 1);
		const minimumBottom = viewportHeight * bufferScreens * -1;

		const isWithinBuffer = ele => {
			const { bottom, top } = ele.getBoundingClientRect();
			return top <= maximumTop && bottom >= minimumBottom;
		};

		// Destroy collapsed when beyond buffer
		Array.from(activeImageList)
			.filter(v => v.classList.contains('collapsed'))
			.map(v => ({ expando: v, data: v }))
			::lazyDestroy(isWithinBuffer);

		// Unload expanded when beyond buffer
		Array.from(activeImageList)
			.filter(v => v.classList.contains('expanded'))
			.map(v => ({ media: v.mediaElement, data: v }))
			::lazyUnload(isWithinBuffer);
	}, 300), false);
}

function lazyDestroy(testKeepLoaded) {
	for (const { expando, data } of this) {
		if (!testKeepLoaded(data)) {
			expando.destroy();
		}
	}
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

function findAllImagesInSelfText(ele) {
	findAllImages(ele, true);
}

let viewImageButton;

export function toggleViewImages() { currentImageTab = !currentImageTab; }

function createImageButtons() {
	let $mainMenuUL = $('#header-bottom-left ul.tabmenu');
	// Create new tabmenu on these pages, regardless if one already exists.
	if (
		regexes.search.test(location.href) ||
		regexes.modqueue.test(location.href) ||
		location.href.toLowerCase().includes('/dashboard')
	) {
		$mainMenuUL = $('<ul>', { class: 'tabmenu viewimages' });
		$mainMenuUL.appendTo('#header-bottom-left');
		$mainMenuUL.css('display', 'inline-block'); // Override dashboard's subreddit style.
	}

	if ($mainMenuUL.length) {
		const viewImagesLI = document.createElement('li');
		const viewImagesLink = document.createElement('a');
		const viewImagesText = document.createTextNode('scanning for images...');

		viewImagesLink.href = '#';
		viewImagesLink.id = 'viewImagesButton';
		viewImagesLink.addEventListener('click', e => {
			e.preventDefault();

			currentImageTab = !currentImageTab;
			updateImageButtons();
			updateRevealedImages();
		}, true);
		viewImagesLink.appendChild(viewImagesText);
		viewImagesLI.appendChild(viewImagesLink);
		if (module.options.showViewImagesTab.value) {
			$mainMenuUL.append(viewImagesLI);
		}
		viewImageButton = viewImagesLink;

		/*
			To enable custom image tabs for a subreddit start by adding `[](#/RES_SR_Config/ImageTabs?)` to the markdown code of the sidebar.
			This should not have any visible effect on the HTML.
			Right now no options have been configured, so there won't be any new tabs.
			You can add up to 8 tabs in the following manner:
			A tab is defined by a label and a tag list separated by an equals sign like this: `LABEL=TAGLIST`
			The label can be up to 32 characters long and may contain english letters, numbers, hyphens, spaces, and underscores. The labels must be URI encoded.
			The tag list can contain up to tag values separated by commas. Individual tags have the same content restrictions a labels. (do not URI encode the commmas)

			The the tab definitions are joined by ampersands (`&`).
			Labels appear to the right of the "view images" button and are surrounded by `[]` brackets.
			Post titles are searched for any place that an entry in the tag list appears surrounded by any kind of bracket <>, [], (), {}.
			Tags are not case sensitive and whitespace is permitted between the brackets and the tag.

			To allow the tabs to be styled, the tabs will have a class that is the tab label with the spaces and hyphens replaced by underscores and then prefixed with `'RESTab-'` so the label 'Feature Request' becomes `'RESTab-feature_request'`.

			We realize that the format is highly restrictive, but you must understand that that is for everyone's protection. If there is demand, the filter can be expanded.

			Examples:
			A hypothetical setup for /r/minecraft that creates tabs for builds, mods, and texture packs:

				[](#/RES_SR_Config/ImageTabs?build=build,project&mod=mod&texture%20pack=texture,textures,pack,texture%20pack)

			To duplicate the behavior originally used for /r/gonewild you would use:

				[](#/RES_SR_Config/ImageTabs?m=m,man,male&f=f,fem,female)

		 */
		const tabConfig = document.querySelector('.side .md a[href^="#/RES_SR_Config/ImageTabs"]');

		if (tabConfig) {
			const switches = {};
			let switchCount = 0;
			const whitelist = /^[A-Za-z0-9_ \-]{1,32}$/;
			const configString = tabConfig.hash.match(/\?(.*)/);

			if (configString !== null) {
				const pairs = configString[1].split('&');
				for (const pa of pairs) {
					if (switchCount >= 8) break;
					const pair = pa.split('=');
					if (pair.length !== 2) continue;
					const label = decodeURIComponent(pair[0]);
					if (!whitelist.test(label)) continue;
					const parts = pair[1].split(',');
					const acceptedParts = [];
					for (const p of parts) {
						if (acceptedParts.length >= 8) break;
						const part = decodeURIComponent(p);
						if (!whitelist.test(part)) continue;
						else acceptedParts.push(part);
					}
					if (acceptedParts.length > 0) {
						if (!(label in switches)) switchCount++;
						switches[label] = acceptedParts;
					}
				}
			}
			if (switchCount > 0) {
				for (const key in switches) {
					customImageTabs[key] = new RegExp(`[\\[\\{\\<\\(]\\s*(${switches[key].join('|')})\\s*[\\]\\}\\>\\)]`, 'i');
				}
			}
		}

		if (!(/comments\/[\-\w\.\/]/i).test(location.href)) {
			for (const mode in customImageTabs) {
				const li = document.createElement('li');
				const a = document.createElement('a');
				const text = document.createTextNode(`[${mode}]`);
				a.href = '#';
				a.className = `RESTab-${mode.toLowerCase().replace(/- /g, '_')}`;
				a.addEventListener('click', (function(mode) {
					return function(e) {
						e.preventDefault();
						currentImageTab = mode;
						updateRevealedImages();
					};
				})(mode), true);

				a.appendChild(text);
				li.appendChild(a);
				$mainMenuUL.append(li);
			}
		}
	}

	for (const siteModule of Object.values(siteModules)) {
		if (!siteModule) continue;
		if (typeof siteModule.go === 'function') {
			siteModule.go();
		}
	}
}

export let haltMediaBrowseMode;

function updateImageButtons() {
	const prevFilter = currentImageTab;
	currentImageTab = true;
	const imgCount = imageList.filter(findImageFilter).length;
	currentImageTab = prevFilter;

	const showAllImagesEnabled = currentImageTab === true;
	const showHideText = showAllImagesEnabled ? 'hide' : 'view';
	haltMediaBrowseMode = showAllImagesEnabled;
	if (viewImageButton) {
		let buttonText = `${showHideText} images `;
		if (!isCurrentSubreddit('dashboard')) buttonText += `(${imgCount})`;
		$(viewImageButton).text(buttonText);
	}
}

function updateRevealedImages(type = 'expando-button') {
	imageList
		.filter(v => v.classList.contains(type))
		.map(v => [v.getBoundingClientRect().top, v])
		.sort((a, b) => a[0] - b[0])
		.map(v => v[1])
		::forEachChunked(image => revealImage(image, findImageFilter(image)));
}

function findImageFilter(expandoButton) {
	let isMatched = false;
	if (typeof currentImageTab === 'boolean') {
		// booleans indicate show all or nothing
		isMatched = currentImageTab;
	} else if (currentImageTab in customImageTabs) {
		const re = customImageTabs[currentImageTab];
		isMatched = re.test(expandoButton.imageLink.text);
	}
	if (isMatched) isMatched = expandoButton.autoExpand;
	// If false then there is no need to go through the NSFW filter
	if (!isMatched) return false;

	let NSFW = false;
	if (module.options.hideNSFW.value) {
		NSFW = (/nsfw/i).test(expandoButton.imageLink.text);
	}

	return !NSFW;
}

function findAllImages(elem, isSelfText) {
	if (!elem) {
		elem = document.body;
	}
	// get elements common across all pages first...
	// if we're on a comments page, get those elements too...
	const commentsre = /comments\/[\-\w\.\/]/i;
	const userre = /user\/[\-\w\.\/]/i;
	let allElements = [];
	if (commentsre.test(location.href) || userre.test(location.href)) {
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

	allElements::forEachChunked(e => checkElementForImage(e, isSelfText));
}

const domainModuleMap = {};

function generateDomainModuleMap() {
	for (const m in siteModules) {
		if (!siteModules.hasOwnProperty(m)) continue;

		const _module = siteModules[m];

		// Add default by default
		switch (_module.name) {
			case 'default':
			case 'defaultVideo':
			case 'defaultAudio':
				domainModuleMap[m] = _module;
				break;
			default:
				if (siteModuleEnabled(_module.name)) {
					// if module is enabled, add its domains to the mapping
					_module.domains.forEach(domain => (domainModuleMap[domainToModuleName(domain)] = _module));
				}
				break;
		}
	}
}

function siteModuleEnabled(siteName) {
	const key = `display ${siteName}`;
	return (typeof module.options[key] === 'undefined') ? true : module.options[key].value;
}

function domainToModuleName(hostname) {
	const domainStack = hostname.split('.');
	// remove tld
	domainStack.pop();

	// Return relevant domain section
	return domainStack.pop();
}

async function checkElementForImage(elem, selfTextExpando = false) {
	if (module.options.hideNSFW.value) {
		elem.NSFW = new Thing(elem).isNSFW();
	} else {
		elem.NSFW = false;
	}

	elem.selfTextExpando = selfTextExpando;
	elem.linklistExpando = !!elem.parentNode.classList.contains('title');

	const href = elem.href;
	if ((!elem.classList.contains('imgScanned') && (typeof imagesRevealed[href] === 'undefined' || !module.options.ignoreDuplicates.value || isCurrentSubreddit('dashboard')) && href !== null)) {
		elem.classList.add('imgScanned');
		dupeAnchors++;

		let detectResult;

		const siteModule = [
			'default',
			'defaultVideo',
			'defaultAudio',
			domainToModuleName(elem.hostname),
		]
			.map(modId => domainModuleMap[modId])
			.find(mod => mod && (detectResult = mod.detect(elem)));

		if (!siteModule) return;

		elem.site = siteModule.moduleID;

		if (detectResult && !elem.NSFW) {
			imagesRevealed[href] = dupeAnchors;

			try {
				const options = await siteModule.handleLink(href, detectResult);
				await createImageExpando(elem, options);
			} catch (e) {
				console.error(`showImages: error detecting image expando for ${elem.href}`);
				console.error(e);
			}
		}
	} else if (!elem.classList.contains('imgScanned')) {
		const textFrag = document.createElement('span');
		textFrag.setAttribute('class', 'RESdupeimg');
		removeRedditExpandoButton(elem);
		$(textFrag).html(`<a class="noKeyNav" href="#img${parseInt(imagesRevealed[href], 10)}" title="click to scroll to original">[RES ignored duplicate link]</a>`);
		$(elem).after(textFrag);
	}
}

function removeRedditExpandoButton(elem) {
	if (elem.classList.contains('title')) {
		// remove the default reddit expando button on post listings
		// we actually remove it from the DOM for a number of reasons, including the
		// fact that many subreddits style them with display: block !important;, which
		// overrides a "hide" call here.
		$(elem).closest('.entry').find('.expando-button.video:not(.commentImg)').remove();
	}
}

async function createImageExpando(elem, options) {
	if (!elem) return false;
	const href = elem.href;
	if (!href) return false;

	removeRedditExpandoButton(elem);

	// This should not be reached in the case of duplicates
	elem.name = `img${imagesRevealed[href]}`;

	// expandLink aka the expando button
	const expandLink = document.createElement('a');
	expandLink.className = 'toggleImage expando-button collapsed collapsedExpando';

	if (module.options.convertGifstoGfycat.value &&
		options.type === 'IMAGE' &&
		(/^(http|https|ftp):\/\/.*\.gif($|\/?)/).test(options.src)) {
		try {
			options = await convertGifToVideo(options);
		} catch (e) {
			console.error(e);
		}
	}

	expandLink.options = options;
	options.href = options.href || elem.href;

	expandLink.autoExpand = options.muted || ['IMAGE', 'GALLERY', 'TEXT'].includes(options.type);

	const defaultClass = {
		IMAGE: 'image',
		GALLERY: 'image gallery',
		TEXT: 'selftext',
		VIDEO: 'video',
		IFRAME: 'video',
		AUDIO: 'video', // yes, still class "video", that's what reddit uses.
		NOEMBED: 'video',
		GENERIC_EXPANDO: 'selftext',
	}[options.type];
	expandLink.className += ` ${defaultClass}`;
	if (expandLink.autoExpand) expandLink.className += ` ${defaultClass}-muted res-media-muted`;
	if (options.expandoClass) {
		expandLink.className += ` ${options.expandoClass}`;
	}

	if (options.type === 'GALLERY' && options.src && options.src.length) expandLink.setAttribute('title', `${options.src.length} items in gallery`);
	$(expandLink).html('&nbsp;');
	expandLink.addEventListener('click', e => {
		// This event handler must be attached directly to the expando button, not delegated
		// to protect it from reddit's delegated handler for clicks on expando button.
		e.stopPropagation();

		e.preventDefault();
		SelectedEntry.handleClick(e);
		revealImage(e.target, (e.target.classList.contains('collapsedExpando')));
	}, true);
	let preNode = null;
	if (elem.parentNode.classList.contains('title')) {
		preNode = elem.parentNode;
		expandLink.classList.add('linkImg');
	} else {
		preNode = elem;
		expandLink.classList.add('commentImg');
	}
	$(preNode).after(expandLink);

	expandLink.imageLink = elem;
	imageList.push(expandLink);
	updateImageButtons();

	const forceReveal = (elem.selfTextExpando && module.options.autoExpandSelfText.value &&
			!$(elem).closest('.md').find('.expando-button.expanded:not(.res-media-muted)').length);
	if (forceReveal || findImageFilter(expandLink)) {
		revealImage(expandLink, true);
	}

	function updateParentFromExpandoResize() {
		function updateParentHeight(basisHeight) {
			// .expando-button causes a line break
			const expandoHeight = Array.from(parent.querySelectorAll('.res-expando, .expando-button'))
				.reduce((a, b) => a + b.getBoundingClientRect().height, 0);

			parent.style.maxHeight = `${basisHeight + expandoHeight}px`;
		}

		const type = $(expandLink).closest('body:not(.comments-page) .expando')[0] || $(expandLink).closest('.thing')[0];
		const parent = $(expandLink).closest('.md')[0];

		if (parent && type) {
			const selfMax = parseInt(module.options.selfTextMaxHeight.value, 10);
			const commentMax = parseInt(module.options.commentMaxHeight.value, 10);

			if (type.classList.contains('expando') && selfMax) {
				expandLink.expandoBox.addEventListener('resize', () => { updateParentHeight(selfMax); });
			} else if (type.classList.contains('comment') && commentMax) {
				expandLink.expandoBox.addEventListener('resize', () => { updateParentHeight(commentMax); });
			}
		}
	}

	if (module.options.autoMaxHeight.value) updateParentFromExpandoResize();
}

function revealImage(expandoButton, showHide) {
	// don't reveal images for invisible buttons (offsetParent is a cheaper way of checking
	// visibility than jquery's .is(':visible'))
	if ((!expandoButton) || (!expandoButton.offsetParent)) {
		return false;
	}
	// showhide = false means hide, true means show!

	const site = expandoButton.imageLink.site;
	if (typeof siteModules[site] === 'undefined') {
		console.log(`something went wrong scanning image from site: ${site}`);
		return false;
	}

	if (!expandoButton.expandoBox) {
		if (showHide) buildExpandoBox(expandoButton);
		else return false;
	}

	function expand() {
		$(expandoButton).addClass('expanded').removeClass('collapsed collapsedExpando');

		if (!expandoButton.expandoBox.parentElement) {
			if (expandoButton.classList.contains('commentImg')) {
				$(expandoButton).after(expandoButton.expandoBox);
			} else {
				expandoButton.parentElement.appendChild(expandoButton.expandoBox);
			}

			if (!expandoButton.previouslyAttached) {
				expandoButton.previouslyAttached = true;
				trackMediaLoad(expandoButton.imageLink);
				if (expandoButton.options.onAttach) expandoButton.options.onAttach();
			}
		} else {
			expandoButton.expandoBox.hidden = false;
		}

		if (expandoButton.mediaElement.expand) expandoButton.mediaElement.expand();
	}

	function collapse() {
		$(expandoButton).removeClass('expanded').addClass('collapsed collapsedExpando');

		expandoButton.expandoBox.hidden = true;

		if (expandoButton.mediaElement.collapse) {
			const removeInstead = expandoButton.mediaElement.collapse();
			if (removeInstead) {
				expandoButton.destroy();
			}
		}
	}

	if (isPageType('comments')) {
		// Execute expando collapse procedure when comment is collapsed
		$(expandoButton).parents('.comment').find('> .entry .tagline > .expand').click(collapse);
	}

	if (showHide) expand();
	else collapse();
}

async function convertGifToVideo(options) {
	const { gfyName: id } = await ajax({
		type: 'json',
		url: '//upload.gfycat.com/transcodeRelease',
		data: { fetchUrl: options.src },
		cacheFor: DAY,
	});

	if (id) {
		return await gfycat.handleLink('', [undefined, id]);
	} else {
		throw Error('Could not convert gif to video', options.src);
	}
}

function buildExpandoBox(expandoButton) {
	const imageLink = expandoButton.imageLink;
	const options = {
		loadHeight: 20, // gives an indication that the expando is opened
		width: imageLink.parentElement.getBoundingClientRect().width,
	};

	const expando = expandoButton.expandoBox = $(expandoTemplate(options))[0];
	const mediaContainer = expando.querySelector('.res-expando-media');

	mediaContainer.addEventListener('resize', () => {
		if (mediaContainer.clientHeight === 0 || mediaContainer.clientWidth === 0) {
			console.error('Received bad resize');
			return;
		}

		// Await giving it 'position: absolute' till there's a size ready
		mediaContainer.classList.add('res-expando-independent');

		// Set the childs size(which is position: absolute) height to the parent element
		expando.style.height = `${mediaContainer.clientHeight}px`;
		expando.style.width = `${mediaContainer.clientWidth}px`;
	});

	const media = expandoButton.mediaElement = generateMedia(expandoButton.options);
	mediaContainer.appendChild(media);

	if (module.options.showSiteAttribution.value && imageLink.classList.contains('title')) {
		addSiteAttribution(imageLink.site, media);
	}

	expandoButton.destroy = () => {
		if (expandoButton.expandoBox) expandoButton.expandoBox.remove();
		delete expandoButton.expandoBox;
		delete expandoButton.mediaElement;
		activeImageList.delete(expandoButton);
	};

	activeImageList.add(expandoButton);
}

function generateMedia(options) {
	if (options.credits) options.credits = $('<span>').safeHtml(options.credits).html();
	if (options.captions) options.caption = $('<span>').safeHtml(options.caption).html();

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

	return mediaGenerators[options.type](options);
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
		piecesContainer.dispatchEvent(new CustomEvent('resize', { bubbles: true }));
	}

	function preloadAhead() {
		const preloadFrom = pieces.indexOf(lastRevealedPiece) + 1;
		const preloadTo = Math.min(preloadFrom + preloadCount, pieces.length);

		let previous = null;
		seq(pieces.slice(preloadFrom, preloadTo), async piece => {
			if (previous && previous.ready) { await previous.ready; }
			if (!piece.media) piece.media = previous = generateMedia(piece.options);
		});
	}

	async function expandFilmstrip() {
		const revealFrom = pieces.indexOf(lastRevealedPiece) + 1;
		const revealTo = Math.min(revealFrom + filmstripMaxCount, pieces.length);

		ctrlConcurrentIncrease.hidden = true;

		await seq(pieces.slice(revealFrom, revealTo), async piece => {
			if (lastRevealedPiece && lastRevealedPiece.media && lastRevealedPiece.media.ready) {
				await lastRevealedPiece.media.ready;
			}
			revealPiece(piece);
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
		newIndex = ((newIndex % pieces.length) + pieces.length) % pieces.length;

		individualCtrl.setAttribute('first-piece', newIndex === 0);
		individualCtrl.setAttribute('last-piece', newIndex === pieces.length - 1);
		msgPosition.innerText = newIndex + 1;

		revealPiece(pieces[newIndex]);

		if (module.options.conserveMemory.value) {
			pieces.filter(piece => piece.media)
				.map(piece => ({ media: piece.media, data: piece }))
				::lazyUnload(piece => {
					const index = pieces.indexOf(piece);
					return index >= newIndex - preloadCount && index <= newIndex + preloadCount;
				});
		}

		if (lastRevealedPiece.media.ready) await lastRevealedPiece.media.ready;
		preloadAhead();
	}

	ctrlPrev.addEventListener('click', () => { changeSlideshowPiece(-1); });
	ctrlNext.addEventListener('click', () => { changeSlideshowPiece(1); });

	ctrlConcurrentIncrease.addEventListener('click', expandFilmstrip);

	piecesContainer.addEventListener('resize', ({ detail }) => {
		let minHeight = '';
		if (!filmstripActive) {
			if (detail !== resizeSources.MANUAL) {
				// Avoid having the container unnecessarily resize when switching piece by keeping the largest
				const currentMin = parseFloat(piecesContainer.style.minHeight, 10) || 0;
				minHeight = `${Math.max(currentMin, piecesContainer.getBoundingClientRect().height)}px`;
			}
		}
		piecesContainer.style.minHeight = minHeight;
	});

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
	const image = element.querySelector('img');

	const transparentGif = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	element.state = mediaStates.NONE;

	image.addEventListener('error', () => {
		element.classList.add('res-media-load-error');
		image.title = '';

		image.dispatchEvent(new CustomEvent('resize', { bubbles: true }));
	});
	image.addEventListener('load', () => {
		if (element.state !== mediaStates.UNLOADED) {
			if (module.options.displayOriginalResolution.value && image.naturalWidth && image.naturalHeight) {
				image.title = `${image.naturalWidth} × ${image.naturalHeight} px`;
			}

			element.state = mediaStates.LOADED;

			image.dispatchEvent(new CustomEvent('resize', { bubbles: true }));
		}
	});

	image.style.maxWidth = `${module.options.maxWidth.value}px`;
	image.style.maxHeight = `${module.options.maxHeight.value}px`;

	element.unload = () => {
		element.state = mediaStates.UNLOADED;

		image.src = transparentGif;
		image.style.height = `${image.clientHeight}px`;
		image.style.width = `${image.clientWidth}px`;
	};
	element.restore = () => {
		element.state = mediaStates.LOADED;

		image.src = options.src;
		image.style.height = '';
		image.style.width = '';
	};

	element.collapse = element.unload;
	element.expand = element.restore;

	element.ready = waitForEvent(image, 'load', 'error');

	makeMediaZoomable(image);
	makeMediaMovable(element);
	setMediaControls(image, options.src);
	setMediaClippyText(image);

	return element;
}

function generateIframe(options) {
	const iframeNode = document.createElement('iframe');
	iframeNode.setAttribute('width', options.width || '640');
	iframeNode.setAttribute('height', options.height || '360');
	iframeNode.style.maxWidth = options.maxwidth || '100%';
	iframeNode.setAttribute('src', options.embed);
	iframeNode.setAttribute('frameborder', '0');
	iframeNode.setAttribute('allowfullscreen', '');

	iframeNode.expand = () => {
		if (options.play) {
			try {
				iframeNode.contentWindow.postMessage(options.play, '*');
			} catch (e) {
				console.error('Could not post "play" command to iframe', options.embed, e);
			}
		}
	};

	iframeNode.collapse = () => {
		let removeInstead = true;
		if (isPageType('comments') && options.pause) {
			try {
				iframeNode.contentWindow.postMessage(options.pause, '*');
				removeInstead = false;
			} catch (e) {
				console.error('Could not post "pause" command to  iframe', options.embed, e);
			}
		}
		return removeInstead;
	};

	return iframeNode;
}

function generateText(options) {
	options.src = $('<span>').safeHtml(options.src).html();

	return $(textTemplate(options))[0];
}

function generateVideo(options) {
	// Use default values for options not explicitly set
	const filledOptions = {
		autoplay: module.options.autoplayVideo.value,
		advancedControls: module.options.showVideoControls.value,
		controls: true,
		frameRate: 24,
		loop: false,
		muted: true,
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

	const audio = $(audioTemplate(options))[0];

	audio.collapse = () => { autoplay = !audio.paused; if (!audio.paused) audio.pause(); };
	audio.expand = () => { if (autoplay) audio.play(); };

	return audio;
}

function generateGeneric(options) {
	const element = options.generate(options);

	const mediaDiv = document.createElement('div');
	mediaDiv.appendChild(element);

	return mediaDiv;
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
	if (!module.options.mediaControls.value) return;

	const options = { lookupUrl, position: module.options.mediaControlsPosition.value };

	const element = $(mediaControlsTemplate(options))[0];
	const controls = element.querySelector('.RESMediaControls');
	$(media).replaceWith(element);
	element.appendChild(media);

	let rotationState = 0;

	const hookInResizeListener = _.once(() => {
		media.addEventListener('resize', () => {
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
}

function addSiteAttribution(siteModuleID, expandoBox) {
	const siteModule = siteModules[siteModuleID];
	if (siteModule.attribution === false || siteModule.domains.length === 0) {
		// Site module adds its own attribution or deliberately doesn't want it
		return;
	}

	const metadata = {
		name: siteModule.name || siteModuleID,
		url: siteModule.landingPage || `//${siteModule.domains[0]}`,
		logoUrl: siteModule.logo,
	};

	const $element = $(siteAttributionTemplate(metadata));
	const $replace = $.find('.res-expando-siteAttribution', expandoBox);
	if ($replace.length) {
		$element.replaceAll($replace);
	} else {
		$element.appendTo(expandoBox);
	}
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

function makeMediaZoomable(mediaTag) {
	if (!module.options.imageZoom.value) return;

	mediaTag.classList.add('res-media-resizable');

	let dragTargetData;

	function getDragSize(e) {
		const { left, top } = e.target.getBoundingClientRect();
		const dragSize = Math.hypot(e.clientX - left, e.clientY - top);

		return Math.round(dragSize);
	}

	const dragMedia = frameDebounce(e => {
		if (!dragTargetData) return;

		const newDiagonal = getDragSize(e);
		const oldDiagonal = dragTargetData.diagonal;

		if (newDiagonal !== oldDiagonal) {
			dragTargetData.hasChangedWidth = true;

			const imageWidth = dragTargetData.imageWidth;
			const maxWidth = Math.max(mediaTag.minWidth, newDiagonal / oldDiagonal * imageWidth);

			resizeMedia(mediaTag, maxWidth);
		}
	});

	function endDrag() {
		document.body.classList.remove('res-media-resizing');
		dragTargetData = null;
	}

	mediaTag.addEventListener('mousedown', e => {
		// shiftKey is used by makeMediaMovable
		if (e.button === 0 && !e.shiftKey) {
			document.body.classList.add('res-media-resizing');

			if (!e.target.minWidth) mediaTag.minWidth = Math.max(1, Math.min(mediaTag.clientWidth, 100));
			dragTargetData = {
				imageWidth: mediaTag.clientWidth,
				diagonal: getDragSize(e),
				hasChangedWidth: false,
			};

			e.preventDefault();
		}
	}, false);
	mediaTag.addEventListener('mouseup', dragMedia, false);
	mediaTag.addEventListener('mousemove', dragMedia, false);
	mediaTag.addEventListener('mouseout', endDrag, false);
	mediaTag.addEventListener('click', e => {
		if (dragTargetData && dragTargetData.hasChangedWidth) {
			e.preventDefault();
		}

		endDrag();
	}, false);
}

function makeMediaMovable(mediaTag) {
	if (!module.options.imageMove.value) return;
	mediaTag.classList.add('res-media-movable');

	const moveTargetData = {
		moving: false, // Whether the image should move with the mouse or not
		mouseLastPos: [0, 0], // Last position of the mouse. Used to calculate deltaX and deltaY for our move.
		hasMoved: false, // If true we will stop click events on the image
	};

	mediaTag.addEventListener('mousedown', e => {
		if (e.button === 0 && e.shiftKey) {
			// Record where the move began, both for the cursor and the image
			moveTargetData.moving = true;
			moveTargetData.hasMoved = false;
			moveTargetData.mouseLastPos = [e.clientX, e.clientY];
		}

		e.preventDefault();
	}, false);

	// The click event fires after the mouseup event, and it is the click event that triggers link following.
	// Therefore preventing this event and not mouseup.
	// If we haven't moved we should not prevent the default behaviour
	mediaTag.addEventListener('click', e => {
		if (moveTargetData.moving && moveTargetData.hasMoved) {
			moveTargetData.moving = false;
			e.preventDefault();
		}
	}, false);
	mediaTag.addEventListener('mousemove', e => {
		if (moveTargetData.moving) {
			const deltaX = e.clientX - moveTargetData.mouseLastPos[0];
			const deltaY = e.clientY - moveTargetData.mouseLastPos[1];

			if (deltaX || deltaY) {
				moveMedia(mediaTag, deltaX, deltaY);
				moveTargetData.mouseLastPos[0] = e.clientX;
				moveTargetData.mouseLastPos[1] = e.clientY;
				moveTargetData.hasMoved = true;
			}
		}
	}, false);
	mediaTag.addEventListener('mouseout', () => {
		moveTargetData.moving = false;
	}, false);
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

	vid.style.maxWidth = `${module.options.maxWidth.value}px`;
	vid.style.maxHeight = `${module.options.maxHeight.value}px`;

	makeMediaZoomable(vid);
	makeMediaMovable(element);
	setMediaControls(vid);
	setMediaClippyText(vid);

	element.collapse = () => { autoplay = !vid.paused; if (!vid.paused) vid.pause(); };
	element.expand = () => { if (autoplay) vid.play(); };

	element.ready = Promise.race([waitForEvent(vid, 'loadeddata'), waitForEvent(lastSource, 'error')]);

	vid.addEventListener('loadedmetadata', () => { element.dispatchEvent(new CustomEvent('resize', { bubbles: true })); });

	return element;
}

export function moveMedia(ele, deltaX, deltaY) {
	ele.style.left = `${(parseFloat(ele.style.left, 10) || 0) + deltaX}px`;
	ele.style.top = `${(parseFloat(ele.style.top, 10) || 0) + deltaY}px`;
}

export function resizeMedia(ele, newWidth) {
	ele.style.width = `${newWidth}px`;
	ele.style.maxWidth = `${newWidth}px`;
	ele.style.maxHeight = '';
	ele.style.height = 'auto';

	// a numerical constant must be used for event.detail because Firefox doesn't allow objects
	ele.dispatchEvent(new CustomEvent('resize', { bubbles: true, detail: resizeSources.MANUAL }));
}

function rotateMedia(ele, rotationState) {
	ele.style.transformOrigin = 'top left';

	// apply rotation
	switch (((rotationState % 4) + 4) % 4) {
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

	ele.dispatchEvent(new CustomEvent('resize', { bubbles: true }));
}
