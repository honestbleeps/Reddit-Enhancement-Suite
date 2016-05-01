/*
	If you would like RES to embed content from your website,
	consult lib/modules/hosts/example.js
*/
addModule('showImages', (module, moduleID) => {
	module.moduleName = 'Inline Image Viewer';
	module.category = ['Productivity', 'Browsing'];
	module.description = 'Opens images inline in your browser with the click of a button. Also has configuration options, check it out!';
	module.options = {
		conserveMemory: {
			type: 'boolean',
			value: true,
			description: 'Conserve memory by temporarily hiding images when they are offscreen.'
		},
		preloadImages: {
			type: 'boolean',
			value: false,
			description: 'Preload gallery images for faster browsing. Beware: this is at the expense of lots of bandwidth usage.'
		},
		bufferScreens: {
			type: 'text',
			value: 2,
			description: 'Hide images that are further than x screens away to save memory. A higher value means less flicker, but less memory savings.',
			dependsOn: 'conserveMemory',
			advanced: true
		},
		maxWidth: {
			type: 'text',
			value: '640',
			description: 'Max width of image displayed onscreen',
			advanced: true
		},
		maxHeight: {
			type: 'text',
			value: '480',
			description: 'Max height of image displayed onscreen',
			advanced: true
		},
		displayOriginalResolution: {
			type: 'boolean',
			value: false,
			description: 'Display each image\'s original (unresized) resolution in a tooltip.'
		},
		selfTextMaxHeight: {
			type: 'text',
			value: 0,
			description: 'Add a scroll bar to text expandos taller than [x] pixels (enter zero for unlimited).',
			advanced: true
		},
		commentMaxHeight: {
			type: 'text',
			value: 0,
			description: 'Add a scroll bar to comments taller than [x] pixels (enter zero for unlimited).',
			advanced: true
		},
		autoMaxHeight: {
			type: 'boolean',
			value: false,
			description: `
				Increase the max height of a self-text expando or comment if an expando is taller than the current max height.
				This only takes effect if max height is specified (previous two options).
			`,
			advanced: true
		},
		openInNewWindow: {
			type: 'boolean',
			value: true,
			description: 'Open images in a new tab/window when clicked?'
		},
		hideNSFW: {
			type: 'boolean',
			value: false,
			description: 'If checked, do not show images marked NSFW.'
		},
		highlightNSFWButton: {
			type: 'boolean',
			value: true,
			description: 'Add special styling to expando buttons for images marked NSFW.',
			bodyClass: true
		},
		autoExpandSelfText: {
			type: 'boolean',
			value: true,
			description: 'When loading selftext from an Aa+ expando, auto expand images, videos, and embeds.'
		},
		imageZoom: {
			type: 'boolean',
			value: true,
			description: 'Allow dragging to resize/zoom images.'
		},
		imageMove: {
			type: 'boolean',
			value: true,
			description: 'Allow dragging while holding shift to move images.'
		},
		mediaControls: {
			type: 'boolean',
			value: true,
			description: 'Show additional image controls on hover.'
		},
		mediaControlsPosition: {
			type: 'enum',
			value: 'top-left',
			values: [{
				name: 'Top left',
				value: 'top-left'
			}, {
				name: 'Top right',
				value: 'top-right'
			}, {
				name: 'Bottom left.',
				value: 'bottom-left'
			}, {
				name: 'Bottom right.',
				value: 'bottom-right'
			}],
			description: 'Set position of media controls'
		},
		clippy: {
			type: 'boolean',
			value: true,
			description: 'Show educational tooltips, such as showing "drag to resize" when your mouse hovers over an image.'
		},
		markVisited: {
			type: 'boolean',
			value: true,
			description: 'Mark links visited when you view images (does eat some resources).',
			advanced: true
		},
		sfwHistory: {
			type: 'enum',
			value: 'add',
			values: [{
				name: 'Add links to history',
				value: 'add'
			}, {
				name: 'Color links, but do not add to history',
				value: 'color'
			}, {
				name: 'Do not add or color links.',
				value: 'none'
			}],
			description: `
				Keeps NSFW links from being added to your browser history <span style="font-style: italic">by the markVisited feature</span>.<br/>
				<span style="font-style: italic">If you chose the second option, then links will be blue again on refresh.</span><br/>
				<span style="color: red">This does not change your basic browser behavior.
				If you click on a link then it will still be added to your history normally.
				This is not a substitute for using your browser's privacy mode.</span>
			`
		},
		ignoreDuplicates: {
			type: 'boolean',
			value: true,
			description: 'Do not create expandos for images that appear multiple times in a page.'
		},
		displayImageCaptions: {
			type: 'boolean',
			value: true,
			description: 'Retrieve image captions/attribution information.',
			advanced: true,
			bodyClass: true
		},
		captionsPosition: {
			dependsOn: 'displayImageCaptions',
			type: 'enum',
			value: 'titleAbove',
			values: [{
				name: 'Display all captions above image.',
				value: 'allAbove'
			}, {
				name: 'Display title and caption above image, credits below.',
				value: 'creditsBelow'
			}, {
				name: 'Display title above image, caption and credits below.',
				value: 'titleAbove'
			}, {
				name: 'Display all captions below image.',
				value: 'allBelow'
			}],
			description: 'Where to display captions around an image.',
			advanced: true
		},
		loadAllInAlbum: {
			type: 'boolean',
			value: false,
			description: 'Display all images at once in a \'filmstrip\' layout, rather than the default navigable \'slideshow\' style.'
		},
		dontLoadAlbumsBiggerThan: {
			dependsOn: 'loadAllInAlbum',
			type: 'text',
			value: 30,
			description: 'Use the \'slideshow\' style for albums with more images than this number. (0 for always use \'filmstrip\')'
		},
		convertGifstoGfycat: {
			type: 'boolean',
			value: false,
			description: 'Convert Gif links to Gfycat links.'
		},
		showViewImagesTab: {
			type: 'boolean',
			value: true,
			description: 'Show a \'view images\' tab at the top of each subreddit, to easily toggle showing all images at once.'
		},
		showSiteAttribution: {
			type: 'boolean',
			value: true,
			description: 'Show the site logo and name after embedded content.'
		},
		showVideoControls: {
			type: 'boolean',
			value: true,
			description: 'Show controls such as pause/play, step and playback rate.'
		},
		autoplayVideo: {
			type: 'boolean',
			value: true,
			description: 'Autoplay inline videos'
		}
	};
	module.exclude = [
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/ads\/[\-\w\.\_\?=]*/i,
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/[\-\w\.\/]*\/submit\/?$/i,
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/subreddits/i
	];
	module.loadLibraries = function() {
		return RESUtils.init.await.library('mediaHosts').then(siteModules => $.extend(module.siteModules, siteModules));
	};
	module.loadDynamicOptions = function() {
		// Augment the options with available image modules
		for (const site in this.siteModules) {
			// Ignore default
			if (site === 'default') continue;
			if (site === 'defaultVideo') continue;
			if (site === 'defaultAudio') continue;

			// Auto add on / off options
			createSiteModuleEnabledOption(site);

			// Find out if module has any additional options - if it does add them
			if (this.siteModules[site].options !== 'undefined') {
				for (const optionKey in this.siteModules[site].options) {
					this.options[optionKey] = this.siteModules[site].options[optionKey];
				}
			}
		}
	};

	function createSiteModuleEnabledOption(site) {
		// Create on/off option for given module
		const name = (typeof module.siteModules[site].name !== 'undefined') ? module.siteModules[site].name : site;
		module.options[`display ${name}`] = {
			description: `Display expander for ${name}`,
			value: true,
			type: 'boolean'
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
	let scanningForImages = false;
	let scanningSelfText = false;

	module.siteModules = {};

	module.beforeLoad = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			const selfTextMaxHeight = parseInt(this.options.selfTextMaxHeight.value, 10);
			if (selfTextMaxHeight) {
				// Strange selector necessary to select tumblr expandos, etc.
				RESUtils.addCSS(`.selftext.expanded ~ * .md { max-height: ${selfTextMaxHeight}px; overflow-y: auto !important; position: relative; }`);
			}
			const commentMaxHeight = parseInt(this.options.commentMaxHeight.value, 10);
			if (commentMaxHeight) {
				RESUtils.addCSS(`.comment .md { max-height: ${commentMaxHeight}px; overflow-y: auto !important; position: relative; }`);
			}

			// Generate domain to module map
			generateDomainModuleMap();
		}
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.conserveMemory.value) {
				window.addEventListener('scroll', RESUtils.debounce(lazyUnload, 300), false);
			}

			RESUtils.watchForElement('siteTable', findAllImages);
			RESUtils.watchForElement('selfText', findAllImagesInSelfText);
			RESUtils.watchForElement('newComments', findAllImagesInSelfText);

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
		}
	};

	/**
	 * lazyUnload
	 * attempt to unload collapsed expando's & images that are off screen in order
	 * to save memory
	 *
	 * @returns {void}
	 */
	function lazyUnload() {
		// hide any expanded images that are further than bufferScreens above or below viewport
		// show any expanded images that are within bufferScreens of viewport
		const bufferScreens = module.options.bufferScreens.value || 2;
		const viewportHeight = $(window).height();
		const maximumTop = viewportHeight * (bufferScreens + 1);
		const minimumBottom = viewportHeight * bufferScreens * -1;

		for (const image of activeImageList) {
			// If image has no expandoBox, remove from this list
			if (!image.expandoBox) {
				activeImageList.delete(image);
			}

			// If the expando is collapsed, clean it up if possible
			if (image.classList.contains('collapsed')) {
				const boundingBox = image.getBoundingClientRect();
				if (boundingBox.top > maximumTop || boundingBox.bottom < minimumBottom) {
					// Destroy collapsed expando
					unloadCollapsedExpando(image);
				}
			} else if (image.classList.contains('expanded') && image.imageLink.media) {
				// is open and is an image - swap out for handle unload/reload of image asset
				const boundingBox = image.imageLink.media.getBoundingClientRect();
				if (boundingBox.top > maximumTop || boundingBox.bottom < minimumBottom) {
					unloadRevealedImage(image);
				} else {
					reloadRevealedImage(image);
				}
			}
		}
	}

	const transparentGif = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

	/**
	 * unloadCollapsedExpando
	 * attempt to unload collapsed expandos in order to conserve memory
	 *
	 * @param {node} image - expando node to unload
	 * @returns {void}
	 */
	function unloadCollapsedExpando(image) {
		// destroy media reference if one exists (images)
		if (image.imageLink.media) {
			image.imageLink.media.src = transparentGif;
			image.imageLink.media = null;
		}

		// unload iframe if there is one (in case somthing still holds a reference to it)
		const iframe = image.expandoBox.querySelector('iframe');
		if (iframe) iframe.src = 'about:blank';

		// remove expando container
		// use jQuery as this will attempt to remove any jQuery events & data attributes in use.
		$(image.expandoBox).remove();
		image.expandoBox = null;

		// clear associatedImage
		const associatedImage = $(image).data('associatedImage');
		// if has associatedImage
		if (associatedImage) {
			// destroy placeholder (and its own data)
			$($(associatedImage).data('imagePlaceholder')).remove();
			// clear any data / listeners jquery has
			$(associatedImage).remove();
		}
		// clear associatedImage data reference from "image" itself
		$(image).removeData('associatedImage');

		// remove from activeImageList
		activeImageList.delete(image);
	}

	function unloadRevealedImage(ele) {
		if (ele.imageLink && ele.imageLink.media) {
			const $img = $(ele.imageLink.media);
			const src = $img.attr('src');
			// only hide the image if it hasn't been hidden and it's loaded
			if (src !== transparentGif && $img.data('loaded')) {
				// preserve src
				$img.data('src', src);
				// swap img with transparent gif to save memory
				$img.attr('src', transparentGif);
			}
		}
	}

	function reloadRevealedImage(ele) {
		if (ele.imageLink && ele.imageLink.media) {
			const $img = $(ele.imageLink.media);
			const src = $img.data('src');
			if (src && ($img.attr('src') === transparentGif)) {
				$img.attr('src', src);
			}
		}
	}

	function findAllImagesInSelfText(ele) {
		findAllImages(ele, true);
	}

	let viewImageButton;

	function createImageButtons() {
		let mainMenuUL = $('#header-bottom-left ul.tabmenu')[0];
		// Create new tabmenu on these pages, regardless if one already exists.
		if ((RESUtils.regexes.search.test(location.href)) ||
				(/\/about\/(?:reports|spam|unmoderated)/.test(location.href)) ||
				(location.href.indexOf('/modqueue') !== -1) ||
				(location.href.toLowerCase().indexOf('/dashboard') !== -1)) {
			mainMenuUL = RESUtils.createElement('ul', null, 'tabmenu viewimages');
			document.getElementById('header-bottom-left').appendChild(mainMenuUL);
			mainMenuUL.style.display = 'inline-block'; // Override dashboard's subreddit style.
		}

		if (mainMenuUL) {
			const viewImagesLI = document.createElement('li');
			const viewImagesLink = document.createElement('a');
			const viewImagesText = document.createTextNode('scanning for images...');
			scanningForImages = true;

			viewImagesLink.href = '#';
			viewImagesLink.id = 'viewImagesButton';
			viewImagesLink.addEventListener('click', e => {
				e.preventDefault();
				if (!scanningForImages) {
					module.setShowImages(null, 'image');
				}
			}, true);
			viewImagesLink.appendChild(viewImagesText);
			viewImagesLI.appendChild(viewImagesLink);
			if (module.options.showViewImagesTab.value) {
				mainMenuUL.appendChild(viewImagesLI);
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
							module.setShowImages(mode);
						};
					})(mode), true);

					a.appendChild(text);
					li.appendChild(a);
					mainMenuUL.appendChild(li);
				}
			}
		}

		$.each(module.siteModules, (key, siteModule) => {
			if (!siteModule) return;
			if (!module.siteModules.hasOwnProperty(key)) return;
			if (typeof siteModule.go === 'function') {
				siteModule.go();
			}
		});
	}

	module.setShowImages = function(newImageTab, type) {
		if (!(module.isEnabled() && module.isMatchURL())) return;
		type = type || 'image';
		if (['number', 'string'].indexOf(typeof newImageTab) === -1) {
			// This is for the all images button
			// If we stored `true` then toggle to false, in all other cases turn it to true
			if (currentImageTab === true) {
				currentImageTab = false;
			} else {
				currentImageTab = true;
			}
		} else if (currentImageTab === newImageTab) {
			// If they are the same, turn it off
			currentImageTab = false;
		} else if (newImageTab in customImageTabs) {
			// If the tab is defined, switch to it
			currentImageTab = newImageTab;
		} else {
			// Otherwise ignore it
			return;
		}
		updateImageButtons();
		updateRevealedImages(type);
	};

	function updateImageButtons() {
		const imgCount = imageList.length;
		const showAllImagesEnabled = currentImageTab === true;
		const showHideText = showAllImagesEnabled ? 'hide' : 'view';
		module.haltMediaBrowseMode = showAllImagesEnabled;
		if (viewImageButton) {
			let buttonText = `${showHideText} images `;
			if (!RESUtils.currentSubreddit('dashboard')) buttonText += `(${imgCount})`;
			$(viewImageButton).text(buttonText);
		}
	}

	function updateRevealedImages(type) {
		const imagesReveal = imageList
			.filter(v => v.classList.contains(type) || v.imageLink.expandOnViewAll)
			.map(v => [v.getBoundingClientRect().top, v])
			.sort((a, b) => a[0] - b[0])
			.map(v => v[1]);

		RESUtils.forEachChunked(imagesReveal, image => { revealImage(image, findImageFilter(image.imageLink)); });
	}

	function findImageFilter(image) {
		let isMatched = false;
		if (typeof currentImageTab === 'boolean') {
			// booleans indicate show all or nothing
			isMatched = currentImageTab;
		} else if (currentImageTab in customImageTabs) {
			const re = customImageTabs[currentImageTab];
			isMatched = re.test(image.text);
		}
		// If false then there is no need to go through the NSFW filter
		if (!isMatched) return false;

		image.NSFW = false;
		if (module.options.hideNSFW.value) {
			image.NSFW = (/nsfw/i).test(image.text);
		}

		return !image.NSFW;
	}

	function findAllImages(elem, isSelfText) {
		scanningForImages = true;
		if (!elem) {
			elem = document.body;
		}
		// get elements common across all pages first...
		// if we're on a comments page, get those elements too...
		const commentsre = /comments\/[\-\w\.\/]/i;
		const userre = /user\/[\-\w\.\/]/i;
		scanningSelfText = false;
		let allElements = [];
		if (commentsre.test(location.href) || userre.test(location.href)) {
			allElements = elem.querySelectorAll('#siteTable a.title, .expando .usertext-body > div.md a, .content .usertext-body > div.md a');
		} else if (isSelfText) {
			// We're scanning newly opened (from an expando) selftext...
			allElements = elem.querySelectorAll('.usertext-body > div.md a');
			scanningSelfText = true;
		} else if (RESUtils.pageType() === 'wiki') {
			allElements = elem.querySelectorAll('.wiki-page-content a');
		} else if (RESUtils.pageType() === 'inbox') {
			allElements = elem.querySelectorAll('#siteTable div.entry .md a');
		} else if (RESUtils.pageType() === 'search') {
			allElements = elem.querySelectorAll('#siteTable a.title, .contents a.search-link');
		} else {
			allElements = elem.querySelectorAll('#siteTable A.title, #siteTable_organic a.title');
		}

		if (RESUtils.pageType() === 'comments') {
			RESUtils.forEachChunked(allElements, e => checkElementForImage(e))
				.then(() => {
					scanningSelfText = false;
					scanningForImages = false;
					updateImageButtons(imageList.length);
				});
		} else {
			Array.from(allElements).forEach(element => checkElementForImage(element));
			scanningSelfText = false;
			scanningForImages = false;
			updateImageButtons(imageList.length);
		}
	}

	const domainModuleMap = {};

	function generateDomainModuleMap() {
		for (const m in module.siteModules) {
			if (!module.siteModules.hasOwnProperty(m)) continue;

			const _module = module.siteModules[m];

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

		// Remove second level domain if needed (eg. "co" in co.uk)
		// Code inactive as no current site modules need this
		//
		//	if( ['co'].indexOf(domainStack[domainStack.length-1] ) !== -1){
		//		domainStack.pop();
		//	}

		// Return relevant domain section
		return domainStack.pop();
	}

	async function checkElementForImage(elem) {
		if (module.options.hideNSFW.value) {
			elem.NSFW = new RESUtils.thing(elem).isNSFW();
		} else {
			elem.NSFW = false;
		}

		const href = elem.href;
		if ((!elem.classList.contains('imgScanned') && (typeof imagesRevealed[href] === 'undefined' || !module.options.ignoreDuplicates.value || (RESUtils.currentSubreddit('dashboard'))) && href !== null) || scanningSelfText) {
			elem.classList.add('imgScanned');
			dupeAnchors++;

			let detectResult;

			const siteModule = [
				'default',
				'defaultVideo',
				'defaultAudio',
				domainToModuleName(elem.hostname)
			]
				.map(modId => domainModuleMap[modId])
				.find(mod => mod && (detectResult = mod.detect(elem.href, elem)));

			if (!siteModule) return;

			elem.site = siteModule.moduleID;

			if (detectResult && !elem.NSFW) {
				imagesRevealed[href] = dupeAnchors;

				try {
					await siteModule.handleLink(elem, detectResult);
					createImageExpando(elem);
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
			RESUtils.insertAfter(elem, textFrag);
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

	function createImageExpando(elem) {
		if (!elem) return false;
		const href = elem.href;
		if (!href) return false;

		// isSelfText indicates if this expando is being created within a
		// selftext expando.
		let isSelfTextExpando = false;
		if (!$(elem).hasClass('title') && RESUtils.pageType() === 'linklist') {
			if ($(elem).closest('.expando').length > 0) {
				isSelfTextExpando = true;
			}
		}

		if (elem.type === 'VIDEO' && elem.expandoOptions.muted) {
			elem.expandOnViewAll = true;
			elem.expandoClass = 'video-muted';
		}

		removeRedditExpandoButton(elem);

		// This should not be reached in the case of duplicates
		elem.name = `img${imagesRevealed[href]}`;

		// expandLink aka the expando button
		const expandLink = document.createElement('a');
		expandLink.className = 'toggleImage expando-button collapsed collapsedExpando';

		const defaultClass = {
			IMAGE: 'image',
			GALLERY: 'image gallery',
			TEXT: 'selftext',
			VIDEO: 'video',
			IFRAME: 'video',
			AUDIO: 'video', // yes, still class "video", that's what reddit uses.
			NOEMBED: 'video',
			GENERIC_EXPANDO: 'selftext'
		};
		expandLink.className += ` ${elem.expandoClass || defaultClass[elem.type]}`;

		if (elem.type === 'GALLERY' && elem.src && elem.src.length) expandLink.setAttribute('title', `${elem.src.length} items in gallery`);
		$(expandLink).html('&nbsp;');
		expandLink.addEventListener('click', e => {
			// This event handler must be attached directly to the expando button, not delegated
			// to protect it from reddit's delegated handler for clicks on expando button.
			e.stopPropagation();

			e.preventDefault();
			modules['selectedEntry'].handleClick(e);
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
		RESUtils.insertAfter(preNode, expandLink);
		/*
		 * save the link element for later use since some extensions
		 * like web of trust can place other elements in places that
		 * confuse the old method
		 */
		expandLink.imageLink = elem;
		imageList.push(expandLink);

		if ((scanningSelfText || isSelfTextExpando) && module.options.autoExpandSelfText.value) {
			revealImage(expandLink, true);
		} else if (elem.type === 'IMAGE' || elem.type === 'GALLERY' || elem.expandOnViewAll) {
			// this may have come from an asynchronous call, in which case it'd get missed by findAllImages, so
			// if all images are supposed to be visible, expand this link now.
			revealImage(expandLink, findImageFilter(expandLink.imageLink));
		}
		if (!scanningForImages) {
			// also since this may have come from an asynchronous call, we need to update the view images count.
			updateImageButtons(imageList.length);
		}
	}

	async function revealImage(expandoButton, showHide) {
		// don't reveal images for invisible buttons (offsetParent is a cheaper way of checking
		// visibility than jquery's .is(':visible'))
		if ((!expandoButton) || (!expandoButton.offsetParent)) {
			return false;
		}
		// showhide = false means hide, true means show!

		const imageLink = expandoButton.imageLink;

		if (typeof module.siteModules[imageLink.site] === 'undefined') {
			console.log(`something went wrong scanning image from site: ${imageLink.site}`);
			return false;
		}
		if (expandoButton.expandoBox && expandoButton.expandoBox.classList.contains('madeVisible')) {
			const isMedia = (imageLink.type === 'AUDIO' || imageLink.type === 'VIDEO');

			let mediaTag;
			if (isMedia) {
				mediaTag = expandoButton.expandoBox.querySelector(imageLink.type);
			}

			if (!showHide) {
				$(expandoButton).removeClass('expanded').addClass('collapsed collapsedExpando');
				expandoButton.expandoBox.style.display = 'none';

				if (isMedia && mediaTag) {
					mediaTag.wasPaused = mediaTag.paused;
					mediaTag.pause();
				}
			} else {
				$(expandoButton).addClass('expanded').removeClass('collapsed collapsedExpando');
				expandoButton.expandoBox.style.display = 'block';

				const associatedImage = $(expandoButton).data('associatedImage');

				if (associatedImage) {
					syncPlaceholder(associatedImage);
				}

				if (isMedia && mediaTag) {
					if (!mediaTag.wasPaused) {
						mediaTag.play();
					}
				}
			}
		} else if (showHide) {
			if (module.options.convertGifstoGfycat.value &&
					imageLink.type === 'IMAGE' &&
				(/^(http|https|ftp):\/\/.*\.gif($|\/?)/).test(imageLink.src)) {
				const { gfyName: id } = await RESEnvironment.ajax({
					type: 'json',
					url: '//upload.gfycat.com/transcodeRelease',
					data: { fetchUrl: imageLink.src },
					cacheFor: RESUtils.DAY
				});

				if (id) await module.siteModules['gfycat'].handleLink(imageLink, [undefined, id]);
			}

			// TODO: flash
			switch (imageLink.type) {
				case 'IMAGE':
				case 'GALLERY':
					generateImageExpando(expandoButton);
					break;
				case 'TEXT':
					generateTextExpando(expandoButton);
					break;
				case 'IFRAME':
					generateIframeExpando(expandoButton);
					break;
				case 'VIDEO':
					await generateVideoExpando(expandoButton, imageLink.expandoOptions);
					break;
				case 'AUDIO':
					generateAudioExpando(expandoButton);
					break;
				case 'NOEMBED':
					generateNoEmbedExpando(expandoButton);
					break;
				case 'GENERIC_EXPANDO':
					generateGenericExpando(expandoButton, imageLink.expandoOptions);
					break;
				default:
					throw new Error(`Invalid expando type: ${imageLink.type}`);
			}

			if (module.options.showSiteAttribution.value && expandoButton.imageLink.classList.contains('title')) {
				addSiteAttribution(imageLink.site, expandoButton.expandoBox);
			}

			// Set value so we can very quickly tell if the expando markup has been generated
			// Currently used by `lazyUnload`
			activeImageList.add(expandoButton);
		}
		updateParentHeight(expandoButton);
	}

	function generateImageExpando(expandoButton) {
		const imageLink = expandoButton.imageLink;
		const which = imageLink.galleryStart || 0;

		const imgDiv = document.createElement('div');
		imgDiv.classList.add('madeVisible');
		imgDiv.currentImage = which;
		imgDiv.sources = [];

		// Test for a single image or an album/array of image
		if (Array.isArray(imageLink.src)) {
			imgDiv.sources = imageLink.src;

			// Also preload images for an album if the option is on.
			if (module.options.preloadImages.value) {
				preloadImages(imageLink.src, 0);
			}
		} else {
			// Only the image is left to display, pack it like a single-image album with no caption or title
			const singleImage = {
				src: imageLink.src,
				href: imageLink.href
			};
			imgDiv.sources[0] = singleImage;
		}

		// Pre-generate elements to be added based on caption ordering option
		let header, captions, credits;
		if ('imageTitle' in imageLink) {
			header = document.createElement('h3');
			header.classList.add('imgTitle');
			$(header).safeHtml(imageLink.imageTitle);
		}
		if ('caption' in imageLink) {
			captions = document.createElement('div');
			captions.className = 'imgCaptions';
			$(captions).safeHtml(imageLink.caption);
		}
		if ('credits' in imageLink) {
			credits = document.createElement('div');
			credits.className = 'imgCredits';
			$(credits).safeHtml(imageLink.credits);
		}

		const captionsAboveBelow = modules['showImages'].options.captionsPosition.value;
		if (header && captionsAboveBelow !== 'allBelow') imgDiv.appendChild(header);
		if (captions && (captionsAboveBelow === 'allAbove' || captionsAboveBelow === 'creditsBelow')) imgDiv.appendChild(captions);
		if (credits && captionsAboveBelow === 'allAbove') imgDiv.appendChild(credits);

		// Create paragraph to hold image captions, if necessary
		let imgCapPar;
		if (captionsAboveBelow === 'allBelow') imgCapPar = document.createElement('p');

		let leftButton, rightButton;

		switch (imageLink.type) {
			case 'GALLERY':
				const loadAllInAlbum = module.options.loadAllInAlbum.value;
				const dontLoadAlbumsBiggerThan = parseInt(module.options.dontLoadAlbumsBiggerThan.value, 10) || 0;
				if (loadAllInAlbum && (dontLoadAlbumsBiggerThan <= 0 || imgDiv.sources.length <= dontLoadAlbumsBiggerThan)) {
					if (imgDiv.sources.length > 1) {
						const albumLength = ` (${imgDiv.sources.length} images)`;
						if (header) {
							$(header).append(albumLength);
						}
					}

					for (const imgNum of RESUtils.gen.range(0, imgDiv.sources.length)) {
						addImage(imgDiv, imgNum);
					}
					break;
				} else {
					// If we're using the traditional album view, add the controls then fall through to add the IMAGE
					const controlWrapper = document.createElement('div');
					controlWrapper.className = 'RESGalleryControls';

					leftButton = document.createElement('a');
					leftButton.className = 'previous noKeyNav';
					leftButton.addEventListener('click', e => {
						const topWrapper = e.target.parentElement.parentElement;
						if (topWrapper.currentImage === 0) {
							topWrapper.currentImage = topWrapper.sources.length - 1;
						} else {
							topWrapper.currentImage -= 1;
						}
						adjustGalleryDisplay(topWrapper);
					});
					controlWrapper.appendChild(leftButton);

					const posLabel = document.createElement('span');
					posLabel.className = 'RESGalleryLabel';
					const niceWhich = ((which + 1 < 10) && (imgDiv.sources.length >= 10)) ? `0${which + 1}` : (which + 1);
					if (imgDiv.sources.length) {
						posLabel.textContent = `${niceWhich} of ${imgDiv.sources.length}`;
					} else {
						posLabel.textContent = 'Whoops, this gallery seems to be empty.';
					}
					controlWrapper.appendChild(posLabel);

					if (loadAllInAlbum && dontLoadAlbumsBiggerThan > 0 && dontLoadAlbumsBiggerThan < imgDiv.sources.length) {
						const largeAlbum = $('<span />').attr('title', `Album has more than ${dontLoadAlbumsBiggerThan} images. \nClick to adjust settings.`);
						const largeAlbumSettings = modules['settingsNavigation'].makeUrlHashLink('showImages', 'dontLoadAlbumsBiggerThan', '*', 'RESGalleryLargeInfo');
						largeAlbum.append(largeAlbumSettings);

						largeAlbum.appendTo(controlWrapper);
					}

					rightButton = document.createElement('a');
					rightButton.className = 'next noKeyNav';
					rightButton.addEventListener('click', e => {
						const topWrapper = e.target.parentElement.parentElement;
						if (+topWrapper.currentImage === topWrapper.sources.length - 1) {
							topWrapper.currentImage = 0;
						} else {
							topWrapper.currentImage += 1;
						}
						adjustGalleryDisplay(topWrapper);
					});
					controlWrapper.appendChild(rightButton);

					if (!imgDiv.sources.length) {
						$(leftButton).css('visibility', 'hidden');
						$(rightButton).css('visibility', 'hidden');
					}

					imgDiv.appendChild(controlWrapper);
				}
				/* falls through */
			case 'IMAGE':
				addImage(imgDiv, which, imgCapPar);
				break;
			default:
				throw new Error(`Invalid image expando type: ${imageLink.type}`);
		}

		if (captionsAboveBelow === 'allBelow') {
			if (header) imgDiv.appendChild(header);
			if (imgCapPar) imgDiv.appendChild(imgCapPar);
		}
		if (captions && (captionsAboveBelow === 'allBelow' || captionsAboveBelow === 'titleAbove')) imgDiv.appendChild(captions);
		if (credits && captionsAboveBelow !== 'allAbove') imgDiv.appendChild(credits);

		function addImage(container, sourceNumber, captionContainer) {
			const sourceImage = container.sources[sourceNumber];

			if (!captionContainer) {
				captionContainer = document.createElement('p');
			}

			if (!sourceImage) {
				return;
			}

			// Pre-generate elements to be added based on caption ordering option
			let imageTitle, imageCaptions;
			if ('title' in sourceImage) {
				imageTitle = document.createElement('h4');
				imageTitle.className = 'imgCaptions';
				$(imageTitle).safeHtml(sourceImage.title);
			}
			if ('caption' in sourceImage) {
				imageCaptions = document.createElement('div');
				imageCaptions.className = 'imgCaptions';
				$(imageCaptions).safeHtml(sourceImage.caption);
			}

			const captionsAboveBelow = modules['showImages'].options.captionsPosition.value;
			if (imageTitle && captionsAboveBelow !== 'allBelow') captionContainer.appendChild(imageTitle);
			if (imageCaptions && (captionsAboveBelow === 'allAbove' || captionsAboveBelow === 'creditsBelow')) captionContainer.appendChild(imageCaptions);

			const imageAnchor = document.createElement('a');
			imageAnchor.classList.add('madeVisible');
			imageAnchor.href = sourceImage.href || sourceImage.src;
			if (module.options.openInNewWindow.value) {
				imageAnchor.target = '_blank';
			}
			const media = this::(/* sourceImage.expandoOptions && sourceImage.expandoOptions.generate || */ generateImage)(sourceImage);

			$(expandoButton).data('associatedImage', media);
			imageLink.media = media;
			imageAnchor.appendChild(media);
			module.makeMediaZoomable(media);
			module.makeMediaMovable(media);
			trackMediaLoad(imageLink, media);
			captionContainer.appendChild(imageAnchor);

			if (imageTitle && captionsAboveBelow === 'allBelow') captionContainer.appendChild(imageTitle);
			if (imageCaptions && (captionsAboveBelow === 'allBelow' || captionsAboveBelow === 'titleAbove')) captionContainer.appendChild(imageCaptions);

			container.appendChild(captionContainer);
		}

		function generateImage(sourceImage) {
			const image = document.createElement('img');
			// Unfortunately it is impossible to use a global event handler for these.
			image.onerror = function() {
				image.classList.add('RESImageError');
			};
			image.onload = function() {
				image.classList.remove('RESImageError');
				if (module.options.displayOriginalResolution.value && this.naturalWidth && this.naturalHeight) {
					this.title = `${this.naturalWidth} × ${this.naturalHeight} px`;
				}
			};
			image.classList.add('RESImage');
			image.id = `RESImage-${RESUtils.randomHash()}`;
			image.src = sourceImage.src;
			image.style.maxWidth = `${module.options.maxWidth.value}px`;
			image.style.maxHeight = `${module.options.maxHeight.value}px`;
			return image;
		}

		// Adjusts the images for the gallery navigation buttons as well as the "n of m" display.

		function adjustGalleryDisplay(topLevel) {
			const source = topLevel.sources[topLevel.currentImage];
			const image = topLevel.querySelector('img.RESImage');
			const imageAnchor = image.parentElement;
			const paragraph = imageAnchor.parentElement;

			// if it's a gif file, blank out the image so there's no confusion about loading...
			if (image.src.toLowerCase().substr(-4) === '.gif') {
				image.src = transparentGif;
			}
			imageAnchor.classList.add('csspinner');
			imageAnchor.classList.add('ringed');

			// set 'loaded' to false since we're about to load a new image
			$(image).data('loaded', false);
			image.src = source.src;
			imageAnchor.href = source.href || imageLink.href;
			const paddedImageNumber = ((topLevel.currentImage + 1 < 10) && (imgDiv.sources.length >= 10)) ? `0${topLevel.currentImage + 1}` : topLevel.currentImage + 1;
			if (imgDiv.sources.length) {
				topLevel.querySelector('.RESGalleryLabel').textContent = `${paddedImageNumber} of ${imgDiv.sources.length}`;
			} else {
				topLevel.querySelector('.RESGalleryLabel').textContent = 'Whoops, this gallery seems to be empty.';
			}
			if (topLevel.currentImage === 0) {
				leftButton.classList.add('end');
				rightButton.classList.remove('end');
			} else if (topLevel.currentImage === topLevel.sources.length - 1) {
				leftButton.classList.remove('end');
				rightButton.classList.add('end');
			} else {
				leftButton.classList.remove('end');
				rightButton.classList.remove('end');
			}

			$(paragraph).find('.imgCaptions').empty();
			const imageTitle = paragraph.querySelector('h4.imgCaptions');
			if (imageTitle) $(imageTitle).safeHtml(source.title);
			const imageCaptions = paragraph.querySelector('div.imgCaptions');
			if (imageCaptions) $(imageCaptions).safeHtml(source.caption);
		}

		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsed', 'collapsedExpando');
		expandoButton.classList.add('expanded');

		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, imgDiv);
		} else {
			expandoButton.parentNode.appendChild(imgDiv);
		}
	}

	/*
	 * Recursively loads the images synchronously.
	 */
	function preloadImages(srcs, i) {
		let _i = i;
		const img = new Image();
		img.onload = img.onerror = function() {
			_i++;
			if (typeof srcs[_i] === 'undefined') {
				return;
			}
			preloadImages(srcs, _i);
		};
		img.src = srcs[i].src;
	}

	function generateIframeExpando(expandoButton) {
		const imageLink = expandoButton.imageLink;
		const wrapperDiv = document.createElement('div');
		imageLink.wrapperDiv = wrapperDiv;

		wrapperDiv.className = 'madeVisible';
		const iframeNode = document.createElement('iframe');
		iframeNode.setAttribute('width', imageLink.getAttribute('data-width') || '640');
		iframeNode.setAttribute('height', imageLink.getAttribute('data-height') || '360');
		iframeNode.style.maxWidth = imageLink.getAttribute('data-maxwidth') || '100%';
		iframeNode.setAttribute('src', imageLink.getAttribute('data-embed'));
		iframeNode.setAttribute('frameborder', '0');
		iframeNode.setAttribute('allowfullscreen', '');
		wrapperDiv.appendChild(iframeNode);

		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}

		expandoButton.expandoBox = wrapperDiv;
		expandoButton.classList.remove('collapsed', 'collapsedExpando');
		expandoButton.classList.add('expanded');

		expandoButton.addEventListener('click', e => {
			let msg = null;
			if (e.target.className.indexOf('expanded') === -1) {
				msg = imageLink.getAttribute('data-pause');
			} else {
				msg = imageLink.getAttribute('data-play');
			}
			// Pass message to iframe
			if (msg !== null) $(wrapperDiv).children('iframe')[0].contentWindow.postMessage(msg, '*');
		}, false);

		// Pause if comment (or any parent of comment) is collapsed
		if (RESUtils.pageType() === 'comments') {
			$(expandoButton).parents('.comment').find('> .entry .tagline > .expand').click(() => {
				$(wrapperDiv).children('iframe')[0].contentWindow.postMessage(imageLink.getAttribute('data-pause'), '*');
			});
		}

		// Delete iframe on close of built-in reddit expando's (if this is part of a linklist page), as they get regenerated on open anyway
		if (RESUtils.pageType() === 'linklist') {
			$(expandoButton).closest('div.entry').children('.expando-button:first').click(() => {
				$(wrapperDiv).children('iframe').remove();
			});
		}
	}

	function generateTextExpando(expandoButton) {
		const imageLink = expandoButton.imageLink;
		const wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';
		imageLink.wrapperDiv = wrapperDiv;

		const imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		const header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		const text = document.createElement('div');
		text.className = 'md';

		// filter out iframes, as they will not survive safeHTML
		// TODO: make safeHTML handle iframes acceptably?
		imageLink.src = imageLink.src.replace(/<iframe/ig, '&lt;iframe');

		$(text).safeHtml(imageLink.src);
		imgDiv.appendChild(text);

		const captions = document.createElement('div');
		captions.className = 'imgCaptions';
		$(captions).safeHtml(imageLink.caption);
		imgDiv.appendChild(captions);

		if ('credits' in imageLink) {
			const credits = document.createElement('div');
			credits.className = 'imgCredits';
			$(credits).safeHtml(imageLink.credits);
			imgDiv.appendChild(credits);
		}

		wrapperDiv.appendChild(imgDiv);
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}
		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsed', 'collapsedExpando');
		expandoButton.classList.add('expanded');

		// TODO: Decide how to handle history for this.
		// Selfposts already don't mark it, so either don't bother or add marking for selfposts.
	}

	async function generateVideoExpando(expandoButton, options) {
		// Use default values for options not explicitly set
		const filledOptions = {
			autoplay: module.options.autoplayVideo.value,
			advancedControls: module.options.showVideoControls.value,
			controls: true,
			frameRate: 24,
			loop: false,
			muted: true,
			playbackRate: 1,
			reversable: false,
			time: 0,
			href: expandoButton.imageLink.href,
			...options
		};

		const element = await videoAdvanced(filledOptions);

		generateGenericExpando(expandoButton, {
			generate: () => element
		});
	}

	function generateAudioExpando(expandoButton, options) {
		const imageLink = expandoButton.imageLink;
		const wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		const imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		const header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		const audio = document.createElement('audio');
		audio.setAttribute('controls', '');
		if (options) {
			if (options.autoplay) {
				audio.setAttribute('autoplay', '');
			}
			if (options.muted) {
				audio.setAttribute('muted', '');
			}
			if (options.loop) {
				audio.setAttribute('loop', '');
			}
		}
		// TODO: add mute/unmute control, play/pause control.

		const sources = $(imageLink).data('sources');

		for (const source of sources) {
			const sourceEle = document.createElement('source');
			sourceEle.src = source.file;
			sourceEle.type = source.type;
			$(audio).append(sourceEle);
		}

		imgDiv.appendChild(audio);

		if ('credits' in imageLink) {
			const credits = document.createElement('div');
			credits.className = 'imgCredits';
			$(credits).safeHtml(imageLink.credits);
			imgDiv.appendChild(credits);
		}

		wrapperDiv.appendChild(imgDiv);
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}
		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsed', 'collapsedExpando');
		expandoButton.classList.add('expanded');

		if (imageLink.onExpand) {
			imageLink.onExpand(imageLink);
		}

		trackMediaLoad(imageLink, audio);
	}

	function generateGenericExpando(expandoButton, options) {
		const mediaLink = expandoButton.imageLink;
		const wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';
		mediaLink.wrapperDiv = wrapperDiv;

		const mediaDiv = document.createElement('div');
		mediaDiv.className = 'madeVisible usertext-body';

		const element = options.generate(options);
		mediaDiv.appendChild(element);
		wrapperDiv.appendChild(mediaDiv);

		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}

		const video = element.querySelector('video');

		expandoButton.expandoBox = mediaDiv;
		expandoButton.classList.remove('collapsed', 'collapsedExpando');
		expandoButton.classList.add('expanded');
		$(expandoButton).data('associatedImage', video || element);

		if (video) {
			module.makeMediaZoomable(video);
			syncPlaceholder(video);
		}

		if (mediaLink.onExpand) {
			mediaLink.onExpand(mediaLink);
		}

		trackMediaLoad(mediaLink, element);
	}

	async function generateNoEmbedExpando(expandoButton) {
		const imageLink = expandoButton.imageLink;

		const response = await RESEnvironment.ajax({
			url: 'https://noembed.com/embed',
			data: { url: imageLink.src },
			type: 'json'
		});

		const wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';
		imageLink.wrapperDiv = wrapperDiv;

		const noEmbedFrame = document.createElement('iframe');
		// not all noEmbed responses have a height and width, so if
		// this siteMod has a width and/or height set, use them.
		if (imageLink.siteMod.width) {
			noEmbedFrame.setAttribute('width', imageLink.siteMod.width);
		}
		if (imageLink.siteMod.height) {
			noEmbedFrame.setAttribute('height', imageLink.siteMod.height);
		}
		if (imageLink.siteMod.urlMod) {
			noEmbedFrame.setAttribute('src', imageLink.siteMod.urlMod(response.url));
		}
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
		noEmbedFrame.className = 'madeVisible usertext-body';

		wrapperDiv.appendChild(noEmbedFrame);
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}

		expandoButton.expandoBox = noEmbedFrame;

		expandoButton.classList.remove('collapsed', 'collapsedExpando');
		expandoButton.classList.add('expanded');
	}

	const trackVisit = RESUtils.batch(async links => {
		if (await RESEnvironment.isPrivateBrowsing()) return;

		const fullnames = links
			.map(link => $(link).closest('.thing'))
			.filter($link => !$link.hasClass('visited'))
			.map($link => $link.data('fullname'));

		await RESEnvironment.ajax({
			method: 'POST',
			url: '/api/store_visits',
			data: { links: fullnames.join(',') }
		});
	}, { delay: 1000 });

	function trackMediaLoad(link, media) {
		if (module.options.markVisited.value) {
			// also use reddit's mechanism for storing visited links if user has gold.
			if ($('body').hasClass('gold')) {
				trackVisit(link);
			}
			const isNSFW = $(link).closest('.thing').is('.over18');
			const sfwMode = module.options['sfwHistory'].value;

			if ((BrowserDetect.isChrome()) || (BrowserDetect.isFirefox())) {
				onLoad();
			} else {
				media.addEventListener('load', onLoad, false);
			}

			function onLoad() {
				const url = link.historyURL || link.href;
				if (!isNSFW || sfwMode !== 'none') link.classList.add('visited');
				if (!isNSFW || sfwMode === 'add') {
					RESEnvironment.addURLToHistory(url);
				}
			}
		}

		media.addEventListener('load', e => {
			$(e.target).data('loaded', true);
			$(e.target).closest('a.madeVisible').removeClass('csspinner');
		}, false);
	}

	const dragTargetData = {
		// numbers just picked as sane initialization values
		imageWidth: 100,
		diagonal: 0, // zero to represent the state where no the mouse button is not down
		dragging: false
	};
	const moveTargetData = {
		moving: false, // Whether the image should move with the mouse or not
		mouseLastPos: [0, 0], // Last position of the mouse. Used to calculate deltaX and deltaY for our move.
		hasMoved: false // If true we will stop click events on the image
	};

	function getDragSize(e) {
		const rc = e.target.getBoundingClientRect();
		const p = Math.pow;
		const dragSize = p(p(e.clientX - rc.left, 2) + p(e.clientY - rc.top, 2), 0.5);

		return Math.round(dragSize);
	}

	function setPlaceholder(mediaTag) {
		if (!$(mediaTag).data('imagePlaceholder')) {
			const thisPH = document.createElement('div');
			$(thisPH).addClass('RESImagePlaceholder');
			$(mediaTag).data('imagePlaceholder', thisPH);

			if (mediaTag.tagName === 'VIDEO') {
				// the placeholder for videos should be sibling to .res-player
				$(mediaTag).closest('.res-player').parent().append(thisPH);
			} else {
				$(mediaTag).parent().append(thisPH);
			}
		}
		// we need to use a different onload event for videos...
		if (mediaTag.tagName === 'VIDEO') {
			mediaTag.addEventListener('loadedmetadata', handleMediaLoad);
		} else {
			mediaTag.addEventListener('load', handleMediaLoad);
		}
	}

	async function setMediaControls(mediaTag) {
		// Is bar enabled
		if (!module.options.mediaControls.value) return;

		// Generate media controls
		const template = await RESTemplates.load('mediaControls');
		const controls = document.createElement('div');
		controls.className = `RESMediaControls ${module.options.mediaControlsPosition.value}`;
		controls.innerHTML = template.text();

		const $media = $(mediaTag);
		$media.data('media-controls', controls);
		$media.parent().append(controls);

		// Hook up controls
		$(controls).find('span').click(function(e) {
			e.preventDefault();
			e.stopPropagation();

			// Implement control logic
			switch ($(this).data('action')) {
				case 'rotateLeft':
					rotateMedia(mediaTag, ($media.data('rotation-state') || 0) - 1);
					break;
				case 'rotateRight':
					rotateMedia(mediaTag, ($media.data('rotation-state') || 0) + 1);
					break;
				case 'imageLookup':
					let lookupUrl = ($media[0].tagName === 'IMG') ? $media.attr('src') : $media.parent().attr('href');

					// Google doesn't like image url's without a protacol
					lookupUrl = new URL(lookupUrl, location.href).href;

					RESEnvironment.openNewTab(`https://images.google.com/searchbyimage?image_url=${lookupUrl}`);
					break;
				case 'showImageSettings':
					modules['settingsNavigation'].loadSettingsPage(moduleID, 'mediaControls');
					break;
				default:
					// do nothing if action is unknown
					break;
			}
			return false;
		});
	}

	function handleMediaLoad() {
		// don't do this twice (e.g. on image reload from cache), as we get bad height/width data.
		if ($(this).data('loaded')) {
			return;
		}
		if (!this.tagName) { // validation to fix issue #1672
			return;
		}

		$(this).data('loaded', true);
		if (this.tagName !== 'VIDEO') {
			this.style.position = 'absolute';
		}

		syncPlaceholder(this);
	}

	function syncPlaceholder(e) {
		// Get media item as jQuery object
		const $ele = $(e.target || e);

		const $thisPH = $($ele.data('imagePlaceholder'));
		const rotationState = $ele.data('rotation-state');

		// Is the media item currently horizontal?
		const isHorizontal = (rotationState === 1 || rotationState === 3);

		if ($ele[0].tagName !== 'VIDEO') {
			// Flip height & width if image is horizontal
			if (isHorizontal) {
				$thisPH.width(`${$ele.height()}px`).height(`${$ele.width()}px`);
			} else {
				$thisPH.width(`${$ele.width()}px`).height(`${$ele.height()}px`);
			}
		} else {
			// get the div.res-player and sync it too
			const $resPlayer = $ele.parent().closest('.res-player');

			if (isHorizontal) {
				// Explicitly set container height & width, else videos can get cut off
				$ele.parent().width(`${$ele.height()}px`).height(`${$ele.width()}px`);
				$resPlayer.width(`${$ele.height()}px`);
			} else {
				// Unset containers height/width
				$ele.parent().width('auto').height('auto');
				$resPlayer.width(`${$ele.width()}px`);
			}

			// Set placeholder height to match players
			$thisPH.height(`${$resPlayer.height()}px`);
		}
		updateParentHeight($ele[0]);
	}

	async function addSiteAttribution(siteModuleID, expandoBox) {
		const siteModule = module.siteModules[siteModuleID];
		if (siteModule.attribution === false || siteModule.domains.length === 0) {
			// Site module adds its own attribution or deliberately doesn't want it
			return;
		}

		if (!expandoBox) {
			return;
		}

		const metadata = {
			name: siteModule.name || siteModuleID,
			url: siteModule.landingPage || `//${siteModule.domains[0]}`,
			logoUrl: siteModule.logo
		};

		const template = await RESTemplates.load('showImages-siteAttribution');

		const $element = template.html(metadata);
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

	module.makeMediaZoomable = function(mediaTag) {
		if (module.options.imageZoom.value) {
			setPlaceholder(mediaTag);
			setMediaControls(mediaTag);
			setMediaClippyText(mediaTag);

			mediaTag.addEventListener('mousedown', mousedownMedia, false);
			mediaTag.addEventListener('mouseup', dragMedia, false);
			mediaTag.addEventListener('mousemove', dragMedia, false);
			mediaTag.addEventListener('mouseout', mouseoutMedia, false);

			mediaTag.addEventListener('click', clickMedia, false);
		}
	};

	module.makeMediaMovable = function(mediaTag) {
		if (module.options.imageMove.value) {
			setMediaClippyText(mediaTag);
			// We can add duplicates safely without checking if makeMediaZoomable already added them
			// because duplicate EventListeners are discarded
			// See: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
			mediaTag.addEventListener('mousedown', mousedownMedia, false);
			// The click event fires after the mouseup event, and it is the click event that triggers link following.
			// Therefore preventing this event and not mouseup.
			// If we haven't moved we should not prevent the default behaviour
			mediaTag.addEventListener('click', e => {
				if (moveTargetData.moving && moveTargetData.hasMoved) {
					moveTargetData.moving = false;
					e.preventDefault();
				}
			}, false);
			mediaTag.addEventListener('mousemove', checkMoveMedia, false);
			mediaTag.addEventListener('mouseout', () => {
				moveTargetData.moving = false;
			}, false);
			// Set this so the image is displayed above the "Set tag" buttons
			mediaTag.style.zIndex = 1;
		}
	};

	async function videoAdvanced(options) {
		const {
			fallback,
			frameRate,
			playbackRate,
			advancedControls
		} = options;

		let {
			time
		} = options;

		const template = await RESTemplates.load('video-advanced');
		const element = template.html(options)[0];

		const vid = element.querySelector('video');
		const sourceElements = vid.querySelectorAll('source');

		const msgError = element.querySelector('.video-advanced-error');

		function setAdvancedControls() {
			function updatePlayControls() {
				ctrlTogglePause.innerHTML = vid.paused ? '&#xf16b;' : '&#xf16c;';

				ctrlTimeDecrease.hidden = !vid.paused;
				ctrlTimeIncrease.hidden = !vid.paused;
				msgTime.hidden = !vid.paused;

				ctrlSpeedDecrease.hidden = vid.paused;
				ctrlSpeedIncrease.hidden = vid.paused;
				msgSpeed.hidden = vid.paused;
			}

			function reverse() {
				time = vid.duration - vid.currentTime;

				Array.from(vid.querySelectorAll('source')).forEach(v => {
					const currentSrc = v.src;
					v.src = v.dataset.reverse;
					v.dataset.reverse = currentSrc;
				});

				vid.load();
				vid.play();

				ctrlReverse.innerHTML = ctrlReverse.innerText === String.fromCharCode(0xf16d) ? '&#xf169;' : '&#xf16d;';
			}

			const ctrlContainer = element.querySelector('.video-advanced-controls');

			const ctrlReverse = ctrlContainer.querySelector('.video-advanced-reverse');
			const ctrlTogglePause = ctrlContainer.querySelector('.video-advanced-toggle-pause');
			const ctrlSpeedDecrease = ctrlContainer.querySelector('.video-advanced-speed-decrease');
			const ctrlSpeedIncrease = ctrlContainer.querySelector('.video-advanced-speed-increase');
			const ctrlTimeDecrease = ctrlContainer.querySelector('.video-advanced-time-decrease');
			const ctrlTimeIncrease = ctrlContainer.querySelector('.video-advanced-time-increase');

			const indicatorPosition = element.querySelector('.video-advanced-position');

			const msgSpeed = ctrlContainer.querySelector('.video-advanced-speed');
			const msgTime = ctrlContainer.querySelector('.video-advanced-time');

			ctrlTogglePause.addEventListener('click', () => { vid[vid.paused ? 'play' : 'pause'](); });
			if (ctrlReverse) ctrlReverse.addEventListener('click', reverse);

			ctrlSpeedDecrease.addEventListener('click', () => { vid.playbackRate /= 1.1; });
			ctrlSpeedIncrease.addEventListener('click', () => { vid.playbackRate *= 1.1; });
			ctrlTimeDecrease.addEventListener('click', () => { vid.currentTime -= 1 / frameRate; });
			ctrlTimeIncrease.addEventListener('click', () => { vid.currentTime += 1 / frameRate; });

			vid.addEventListener('timeupdate', () => { indicatorPosition.style.left = `${(vid.currentTime / vid.duration) * 100}%`; });
			vid.addEventListener('timeupdate', () => { msgTime.innerHTML = `${vid.currentTime.toFixed(2).replace('.', '.<wbr>')}s`; });
			vid.addEventListener('ratechange', () => { msgSpeed.innerHTML = `${vid.playbackRate.toFixed(2).replace('.', '.<wbr>')}x`; });
			vid.addEventListener('loadedmetadata', () => { ctrlContainer.hidden = false; });
			vid.addEventListener('pause', updatePlayControls);
			vid.addEventListener('play', updatePlayControls);

			updatePlayControls();
		}

		function sourceErrorFallback() {
			if (fallback) {
				const fallbackImg = document.createElement('img');

				fallbackImg.src = fallback;
				fallbackImg.className = 'RESImage';

				element.parentNode.replaceChild(fallbackImg, element);
				modules['showImages'].makeMediaZoomable(fallbackImg);
				modules['showImages'].makeMediaMovable(fallbackImg);
			} else {
				msgError.hidden = false;
			}
		}

		const lastSource = sourceElements[sourceElements.length - 1];
		lastSource.addEventListener('error', sourceErrorFallback, false);

		vid.addEventListener('loadedmetadata', () => { vid.currentTime = time; });
		vid.playbackRate = playbackRate;

		if (advancedControls) {
			setAdvancedControls();
		}

		vid.style.maxWidth = `${module.options.maxWidth.value}px`;
		vid.style.maxHeight = `${module.options.maxHeight.value}px`;

		return element;
	}

	function mousedownMedia(e) {
		if (e.button === 0) {
			if (!e.shiftKey) {
				if (e.target.tagName === 'VIDEO' && e.target.hasAttribute('controls')) {
					const rc = e.target.getBoundingClientRect();
					// ignore drag if click is in control area (40 px from bottom of video)
					if ((rc.height - 40) < (e.clientY - rc.top)) {
						return true;
					}
				}
				if (!e.target.minWidth) e.target.minWidth = Math.max(1, Math.min($(e.target).width(), 100));
				dragTargetData.imageWidth = $(e.target).width();
				dragTargetData.diagonal = getDragSize(e);
				dragTargetData.dragging = false;
				dragTargetData.hasChangedWidth = false;
			} else {
				// Record where the move began, both for the cursor and the image
				moveTargetData.moving = true;
				moveTargetData.hasMoved = false;
				moveTargetData.mouseLastPos = [e.clientX, e.clientY];
			}
			e.preventDefault();
		}
	}

	function mouseoutMedia() {
		dragTargetData.diagonal = 0;
	}

	function dragMedia(e) {
		if (dragTargetData.diagonal) {
			const newDiagonal = getDragSize(e);
			const oldDiagonal = dragTargetData.diagonal;
			const imageWidth = dragTargetData.imageWidth;
			const maxWidth = Math.max(e.target.minWidth, newDiagonal / oldDiagonal * imageWidth);

			if (Math.abs(newDiagonal - oldDiagonal) > 5 && e.target.tagName === 'VIDEO') {
				e.target.preventPlayPause = true;
			}

			module.resizeMedia(e.target, maxWidth);
			dragTargetData.dragging = true;
		}
		if (e.type === 'mouseup') {
			dragTargetData.diagonal = 0;
		}
	}

	function checkMoveMedia(e) {
		if (moveTargetData.moving) {
			const deltaX = e.clientX - moveTargetData.mouseLastPos[0];
			const deltaY = e.clientY - moveTargetData.mouseLastPos[1];
			module.moveMedia(e.target, deltaX, deltaY);

			moveTargetData.mouseLastPos[0] = e.clientX;
			moveTargetData.mouseLastPos[1] = e.clientY;
			moveTargetData.hasMoved = true;
		}
	}

	module.moveMedia = function(ele, deltaX, deltaY) {
		$(ele).css('margin-left', parseInt($(ele).css('margin-left'), 10) + deltaX);
		$(ele).css('margin-top', parseInt($(ele).css('margin-top'), 10) + deltaY);

		if (ele.tagName !== 'VIDEO') {
			ele.style.position = 'absolute';
		}

		syncPlaceholder(ele);
	};

	function clickMedia(e) {
		dragTargetData.diagonal = 0;
		if (dragTargetData.hasChangedWidth) {
			dragTargetData.dragging = false;
			// if video let video controls function
			if (e.target.tagName === 'VIDEO' && e.target.hasAttribute('controls')) {
				const rc = e.target.getBoundingClientRect();
				// ignore drag if click is in control area (40 px from bottom of video)
				if ((rc.height - 40) < (e.clientY - rc.top)) {
					return true;
				}
			}
			e.preventDefault();
			return false;
		}
		dragTargetData.hasChangedWidth = false;
	}

	module.resizeMedia = function(ele, newWidth) {
		const currWidth = $(ele).width();
		if (newWidth !== currWidth) {
			dragTargetData.hasChangedWidth = true;

			ele.style.width = `${newWidth}px`;
			ele.style.maxWidth = `${newWidth}px`;
			ele.style.maxHeight = '';
			ele.style.height = 'auto';

			if (ele.tagName !== 'VIDEO') {
				ele.style.position = 'absolute';
			}

			syncPlaceholder(ele);
		}
	};

	function rotateMedia(ele, rotationState) {
		const $ele = $(ele);
		// get valid rotation state
		const newRotationState = Math.abs(rotationState % 4);

		// apply data
		$ele.css('transform-origin', 'top left');
		$ele.data('rotation-state', newRotationState);

		// apply rotation
		switch (newRotationState) {
			case 0:
				$ele.css('transform', '');
				break;
			case 1:
				$ele.css('transform', 'rotate(90deg) translateY(-100%)');
				break;
			case 2:
				$ele.css('transform', 'rotate(180deg) translate(-100%, -100%)');
				break;
			case 3:
				$ele.css('transform', 'rotate(270deg) translateX(-100%)');
				break;
			default:
				$ele.css('transform', ''); // default on unknown value
				break;
		}

		// re-sync container heights
		syncPlaceholder(ele);
	}

	function updateParentHeight(ele) {
		if (module.options.autoMaxHeight.value && ele) {
			const parent = $(ele).closest('.md')[0];
			const type = $(parent).closest('body:not(.comments-page) .expando')[0] || $(parent).closest('.thing')[0];
			if (parent && (type.classList.contains('expando') || type.classList.contains('comment'))) {
				const placeholders = $(parent).find('.expando-button.expanded + * .RESImagePlaceholder, .expando-button.expanded + * > *:not(p)');
				const selfMax = parseInt(module.options.selfTextMaxHeight.value, 10);
				const commentMax = parseInt(module.options.commentMaxHeight.value, 10);
				let height = 0;

				for (const placeholder of Array.from(placeholders)) {
					const tempHeight = $(placeholder).height();
					if ((tempHeight || 0) > height) {
						height = tempHeight;
					}
				}

				if (selfMax && type.classList.contains('expando')) {
					parent.style.maxHeight = `${(height > selfMax) ? height : selfMax}px`;
				} else if (commentMax && type.classList.contains('comment')) {
					parent.style.maxHeight = `${(height > commentMax) ? height : commentMax}px`;
				}
			}
		}
	}

	addLibrary('mediaHosts', 'default', {
		domains: [],
		detect(href) {
			const acceptRegex = /^[^#]+?\.(gif|jpe?g|png)(?:[?&#_].*|$)/i;
			const rejectRegex = /(?:wikipedia\.org\/wiki|(?:i\.|m\.)?imgur\.com|photobucket\.com|gifsound\.com|gfycat\.com|\/wiki\/File:.*|reddit\.com|onedrive\.live\.com|500px\.(?:com|net|org)|(?:www\.|share\.)?gifyoutube\.com)|futurism\.co/i;

			return acceptRegex.test(href) && !rejectRegex.test(href);
		},
		handleLink(elem) {
			elem.type = 'IMAGE';
			elem.src = elem.href;
		}
	});

	addLibrary('mediaHosts', 'defaultVideo', {
		domains: [],
		videoDetect: document.createElement('VIDEO'),
		detect(href) {
			const acceptRegex = /^[^#]+?\.(webm|mp4|ogv|3gp|mkv)(?:[?&#_].*|$)/i;
			const rejectRegex = /(?:onedrive\.live\.com)/i;

			// important that acceptRegex is last (the returned value)
			return !rejectRegex.test(href) && acceptRegex.exec(href);
		},
		handleLink(elem, [, extension]) {
			// Change ogv to ogg format.
			if (extension === 'ogv') extension = 'ogg';

			const format = `video/${extension}`;

			// Only add the inline video player if the users browser
			// 'probably' or 'maybe' supports the linked video format.
			// This should cover most video problems. You can never be
			// sure if the client supports the codecs used in the container.
			if (this.videoDetect.canPlayType(format) === '') {
				throw new Error(`Format ${format} unsupported.`);
			}

			elem.type = 'VIDEO';

			elem.expandoOptions = {
				sources: [{
					source: elem.href,
					type: format
				}]
			};
		}
	});

	addLibrary('mediaHosts', 'defaultAudio', {
		domains: [],
		audioDetect: document.createElement('AUDIO'),
		detect(href) {
			const acceptRegex = /^[^#]+?\.(opus|weba|ogg|wav|mp3|flac)(?:[?&#_].*|$)/i;
			const rejectRegex = /(?:onedrive\.live\.com)/i;

			// important that acceptRegex is last (the returned value)
			return !rejectRegex.test(href) && acceptRegex.exec(href);
		},
		handleLink(elem, [, extension]) {
			// Change weba and opus to their correct containers.
			if (extension === 'weba') extension = 'webm';
			if (extension === 'opus') extension = 'ogg';

			const format = `audio/${extension}`;

			// Only add the inline audio player if the users browser
			// 'probably' or 'maybe' supports the linked audio format.
			// This should cover most aduio problems. You can never be
			// sure if the client supports the codecs used in the container.
			if (this.audioDetect.canPlayType(format) === '') {
				throw new Error(`Format ${format} unsupported.`);
			}

			elem.type = 'AUDIO';

			elem.expandoOptions = {
				autoplay: true,
				loop: false
			};

			$(elem).data('sources', [{
				file: elem.href,
				type: format
			}]);
		}
	});
});
