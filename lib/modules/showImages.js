/*
	If you would like RES to embed content from your website,
	consult lib/modules/hosts/example.js
*/
addModule('showImages', function(module, moduleID) {
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
			description: 'Increase the max height of a self-text expando or comment if an expando is taller than the current max height.\
				This only takes effect if max height is specified (previous two options).',
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
			description: 'Keeps NSFW links from being added to your browser history <span style="font-style: italic">by the markVisited feature</span>.<br/>\
				<span style="font-style: italic">If you chose the second option, then links will be blue again on refresh.</span><br/>\
				<span style="color: red">This does not change your basic browser behavior.\
				If you click on a link then it will still be added to your history normally.\
				This is not a substitute for using your browser\'s privacy mode.</span>'
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
		autoplayVideo: {
			type: 'boolean',
			value: true,
			description: 'Autoplay inline videos'
		}
	};
	module.exclude = [
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/ads\/[\-\w\.\_\?=]*/i,
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/[\-\w\.\/]*\/submit\/?$/i
	];
	module.loadLibraries = function() {
		return RESUtils.init.await.library('mediaHosts').then(function(siteModules) {
			$.extend(module.siteModules, siteModules);
		});
	};
	module.loadDynamicOptions = function() {
		// Augment the options with available image modules
		for (var site in this.siteModules) {
			// Ignore default
			if (site === 'default') continue;
			if (site === 'defaultVideo') continue;
			if (site === 'defaultAudio') continue;

			// Auto add on / off options
			createSiteModuleEnabledOption(site);

			// Find out if module has any additional options - if it does add them
			if (this.siteModules[site].options !== 'undefined'){
				for (var optionKey in this.siteModules[site].options) {
					this.options[optionKey] = this.siteModules[site].options[optionKey];
				}
			}
		}
	};

	function createSiteModuleEnabledOption(site){
		// Create on/off option for given module
		var name = (typeof module.siteModules[site].name !== 'undefined') ? module.siteModules[site].name : site;
		module.options['display ' + name] = {
			description: 'Display expander for ' + name,
			value: true,
			type: 'boolean'
		};
	}

	var imageList = [];
	var imagesRevealed = {};
	var dupeAnchors = 0;
	/*
	 true: show all images
	 false: hide all images
	 'any string': display images match the tab
	 */
	var currentImageTab = false;
	var customImageTabs = {};
	var imageTrackStack = [];
	var scanningForImages = false;
	var scanningSelfText = false;

	module.beforeLoad = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var selfTextMaxHeight = parseInt(this.options.selfTextMaxHeight.value, 10);
			if (selfTextMaxHeight) {
				// Strange selector necessary to select tumblr expandos, etc.
				RESUtils.addCSS('.selftext.expanded ~ * .md { max-height: ' + selfTextMaxHeight + 'px; overflow-y: auto !important; position: relative; }');
			}
			var commentMaxHeight = parseInt(this.options.commentMaxHeight.value, 10);
			if (commentMaxHeight) {
				RESUtils.addCSS('.comment .md { max-height: ' + commentMaxHeight + 'px; overflow-y: auto !important; position: relative; }');
			}

			// Generate domain to module map
			generateDomainModuleMap();
		}
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if (this.options.conserveMemory.value) {
				window.addEventListener('scroll', RESUtils.debounce.bind(RESUtils, 'scroll.showImages', 300, handleScroll), false);
			}

			RESUtils.watchForElement('siteTable', findAllImages);
			RESUtils.watchForElement('selfText', findAllImagesInSelfText);
			RESUtils.watchForElement('newComments', findAllImagesInSelfText);

			createImageButtons();
			findAllImages();
			document.addEventListener('dragstart', function() {
				return false;
			}, false);
		}
	};

	function handleScroll() {
		imageList.some(function(image) {
			var thisXY = RESUtils.getXYpos(image);
			if (image && thisXY.y > window.pageYOffset) {
				lazyUnload();
				return true;
			}
		});
	}

	function lazyUnload() {
		// hide any expanded images that are further than bufferScreens above or below viewport
		// show any expanded images that are within bufferScreens of viewport
		var bufferScreens = module.options.bufferScreens.value || 2,
			viewportHeight = $(window).height(),
			maximumTop = viewportHeight * (bufferScreens + 1),
			minimumBottom = viewportHeight * bufferScreens * -1,
			boundingBox;

		imageList.forEach(function(image) {
			if (image.imageLink && image.imageLink.image) {
				boundingBox = image.imageLink.image.getBoundingClientRect();
				if (boundingBox.top > maximumTop || boundingBox.bottom < minimumBottom) {
					unloadRevealedImage(image);
				} else {
					reloadRevealedImage(image);
				}
			}
		});
	}

	var transparentGif = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

	function unloadRevealedImage(ele) {
		var src, width, height,
			$img;

		if (ele.imageLink && ele.imageLink.image) {
			$img = $(ele.imageLink.image);
			src = $img.attr('src');
			if (src === transparentGif) {
				return;
			}
			width = $img.width();
			height = $img.height();
			// only hide the image if it has a width and height (it may not be loaded yet)
			if (width && height && $img.data('loaded')) {
				// preserve src and set the width to height to make the page not jump
				$img.data('src', src).attr('width', width).attr('height', height);
				// swap img with transparent gif to save memory
				$img.attr('src', transparentGif);
			}
		}
	}

	function reloadRevealedImage(ele) {
		var src, $img;

		if (ele.imageLink && ele.imageLink.image) {
			$img = $(ele.imageLink.image);
			src = $img.data('src');
			if (src && ($img.attr('src') === transparentGif)) {
				$img.attr('src', src);
			}
		}
	}

	function findAllImagesInSelfText(ele) {
		findAllImages(ele, true);
	}

	var viewImageButton;

	function createImageButtons() {
		var mainMenuUL = $('#header-bottom-left ul.tabmenu')[0];
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
			var viewImagesLI = document.createElement('li');
			var viewImagesLink = document.createElement('a');
			var viewImagesText = document.createTextNode('scanning for images...');
			scanningForImages = true;

			viewImagesLink.href = '#';
			viewImagesLink.id = 'viewImagesButton';
			viewImagesLink.addEventListener('click', function(e) {
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
			var tabConfig = document.querySelector('.side .md a[href^="#/RES_SR_Config/ImageTabs"]');

			if (tabConfig) {
				var switches = {},
					switchCount = 0,
					whitelist = /^[A-Za-z0-9_ \-]{1,32}$/,
					configString = tabConfig.hash.match(/\?(.*)/);

				if (configString !== null) {
					var pairs = configString[1].split('&');
					for (var i = 0; i < pairs.length && switchCount < 8; i++) {
						var pair = pairs[i].split('=');
						if (pair.length !== 2) continue;
						var label = decodeURIComponent(pair[0]);
						if (!whitelist.test(label)) continue;
						var parts = pair[1].split(',');
						var acceptedParts = [];
						for (var j = 0; j < parts.length && acceptedParts.length < 8; j++) {
							var part = decodeURIComponent(parts[j]);
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
					for (var key in switches) {
						customImageTabs[key] = new RegExp('[\\[\\{\\<\\(]\\s*(' + switches[key].join('|') + ')\\s*[\\]\\}\\>\\)]', 'i');
					}
				}
			}

			if (!/comments\/[\-\w\.\/]/i.test(location.href)) {
				for (var mode in customImageTabs) {
					var li = document.createElement('li'),
						a = document.createElement('a'),
						text = document.createTextNode('[' + mode + ']');
					a.href = '#';
					a.className = 'RESTab-' + mode.toLowerCase().replace(/- /g, '_');
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

		$.each(module.siteModules, function(key, siteModule) {
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
		if ([ 'number', 'string' ].indexOf(typeof newImageTab) === -1) {
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
		var imgCount = imageList.length;
		var showHideText = 'view';
		module.haltMediaBrowseMode = false;
		if (currentImageTab === true) {
			module.haltMediaBrowseMode = true;
			showHideText = 'hide';
		}
		if (viewImageButton) {
			var buttonText = showHideText + ' images ';
			if (!RESUtils.currentSubreddit('dashboard')) buttonText += '(' + imgCount + ')';
			$(viewImageButton).text(buttonText);
		}
	}

	function updateRevealedImages(type) {
		for (var i = 0, len = imageList.length; i < len; i++) {
			var image = imageList[i];
			if ($(image).hasClass(type) || image.imageLink.expandOnViewAll) {
				revealImage(image, findImageFilter(image.imageLink));
			}
		}
	}

	function findImageFilter(image) {
		var isMatched = false;
		if (typeof currentImageTab === 'boolean') {
			//booleans indicate show all or nothing
			isMatched = currentImageTab;
		} else if (currentImageTab in customImageTabs) {
			var re = customImageTabs[currentImageTab];
			isMatched = re.test(image.text);
		}
		//If false then there is no need to go through the NSFW filter
		if (!isMatched) return false;

		image.NSFW = false;
		if (module.options.hideNSFW.value) {
			image.NSFW = /nsfw/i.test(image.text);
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
		var commentsre = /comments\/[\-\w\.\/]/i;
		var userre = /user\/[\-\w\.\/]/i;
		scanningSelfText = false;
		var allElements = [];
		if (commentsre.test(location.href) || userre.test(location.href)) {
			allElements = elem.querySelectorAll('#siteTable a.title, .expando .usertext-body > div.md a, .content .usertext-body > div.md a');
		} else if (isSelfText) {
			// We're scanning newly opened (from an expando) selftext...
			allElements = elem.querySelectorAll('.usertext-body > div.md a');
			scanningSelfText = true;
		} else if (RESUtils.pageType() === 'wiki'){
			allElements = elem.querySelectorAll('.wiki-page-content a');
		} else if (RESUtils.pageType() === 'inbox') {
			allElements = elem.querySelectorAll('#siteTable div.entry .md a');
		} else if (RESUtils.pageType() === 'search') {
			allElements = elem.querySelectorAll('#siteTable a.title, .contents a.search-link');
		} else {
			allElements = elem.querySelectorAll('#siteTable A.title');
		}

		if (RESUtils.pageType() === 'comments') {
			RESUtils.forEachChunked(allElements, 15, 1000, function(element, i, array) {
				checkElementForImage(element);
				if (i >= array.length - 1) {
					scanningSelfText = false;
					scanningForImages = false;
					updateImageButtons(imageList.length);
				}
			});
		} else {
			Array.prototype.slice.call(allElements).forEach(function(element) {
				checkElementForImage(element);
			});
			scanningSelfText = false;
			scanningForImages = false;
			updateImageButtons(imageList.length);
		}
	}

	var domainModuleMap = {};

	function generateDomainModuleMap() {
		for (var m in module.siteModules){
			if (!module.siteModules.hasOwnProperty(m)) continue;

			var _module = module.siteModules[m];

			// Use module id as name if one is not set
			if (typeof _module.name === 'undefined') _module.name = m;
			// Add default by default
			if (_module.name === 'default'){
				domainModuleMap['default'] = _module;
				continue;
			} else if (_module.name === 'defaultVideo') {
				domainModuleMap['defaultVideo'] = _module;
				continue;
			} else if (_module.name === 'defaultAudio') {
				domainModuleMap['defaultAudio'] = _module;
				continue;
			}

			// check if module is enabled
			if (siteModuleEnabled(_module.name)) {
				// if so add its domains to the mapping
				_module.domains.forEach(function(domain) {
					domainModuleMap[domainToModuleName(domain)] = _module;
				});
			}
		}
	}

	function siteModuleEnabled(siteName) {
		var key = 'display ' + siteName;
		return (typeof module.options[key] === 'undefined') ? true : module.options[key].value;
	}

	function domainToModuleName(hostname){
		var domainStack = hostname.split('.');
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

	function checkElementForImage(elem) {
		if (module.options.hideNSFW.value) {
			if (elem.classList.contains('title')) {
				elem.NSFW = elem.parentNode.parentNode.parentNode.classList.contains('over18');
			}
		} else {
			elem.NSFW = false;
		}
		var href = elem.href;
		if ((!elem.classList.contains('imgScanned') && (typeof imagesRevealed[href] === 'undefined' || !module.options.ignoreDuplicates.value || (RESUtils.currentSubreddit('dashboard'))) && href !== null) || scanningSelfText) {
			elem.classList.add('imgScanned');
			dupeAnchors++;

			var siteFound = module.siteModules['default'].detect(elem.href.toLowerCase(), elem);
			if (siteFound) {
				elem.site = 'default';
			} else if (module.siteModules['defaultVideo'].detect(elem.href.toLowerCase(), elem)) {
				elem.site = 'defaultVideo';
				siteFound = true;
			} else if (module.siteModules['defaultAudio'].detect(elem.href.toLowerCase(), elem)) {
				elem.site = 'defaultAudio';
				siteFound = true;
			} else {
				var _module = domainToModuleName(elem.hostname);
				// Check module exists
				if (typeof domainModuleMap[_module] !== 'undefined') {
					// If its enabled & detect validates, use it
					if (domainModuleMap[_module].detect(elem.href.toLowerCase(), elem)) {
						elem.site = _module;
						siteFound = true;
					}
				}
			}

			if (siteFound && !elem.NSFW) {
				imagesRevealed[href] = dupeAnchors;
				var siteModule = domainModuleMap[elem.site];
				$.Deferred().resolve(elem).then(siteModule.handleLink).then(siteModule.handleInfo).
				then(createImageExpando, function() {
					console.error('showImages: error detecting image expando for ' + elem.href);
					console.error.apply(console, arguments);
				});
			}
		} else if (!elem.classList.contains('imgScanned')) {
			var textFrag = document.createElement('span');
			textFrag.setAttribute('class', 'RESdupeimg');
			removeRedditExpandoButton(elem);
			$(textFrag).html('<a class="noKeyNav" href="#img' + parseInt(imagesRevealed[href], 10) + '" title="click to scroll to original">[RES ignored duplicate link]</a>');
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
		var href = elem.href;
		if (!href) return false;

		// isSelfText indicates if this expando is being created within a
		// selftext expando.
		var isSelfTextExpando = false;
		if (!$(elem).hasClass('title') && RESUtils.pageType() === 'linklist') {
			if ($(elem).closest('.expando').length > 0) {
				isSelfTextExpando = true;
			}
		}

		removeRedditExpandoButton(elem);

		// This should not be reached in the case of duplicates
		elem.name = 'img' + imagesRevealed[href];

		// expandLink aka the expando button
		var expandLink = document.createElement('a');
		expandLink.className = 'toggleImage expando-button collapsed collapsedExpando';
		if (elem.type === 'IMAGE') expandLink.className += ' image';
		if (elem.type === 'GALLERY') expandLink.className += ' image gallery';
		if (elem.type === 'TEXT') expandLink.className += ' selftext';
		if (elem.type === 'VIDEO') expandLink.className += ' video';
		if (elem.type === 'IFRAME') expandLink.className += ' video';
		if (elem.type === 'AUDIO') expandLink.className += ' video'; // yes, still class "video", that's what reddit uses.
		if (elem.type === 'NOEMBED') expandLink.className += ' ' + elem.expandoClass;
		if (elem.type === 'GENERIC_EXPANDO') expandLink.className +=  elem.expandoClass;
		if (elem.type === 'GALLERY' && elem.src && elem.src.length) expandLink.setAttribute('title', elem.src.length + ' items in gallery');
		$(expandLink).html('&nbsp;');
		expandLink.addEventListener('click', function(e) {
			// This event handler must be attached directly to the expando button, not delegated
			// to protect it from reddit's delegated handler for clicks on expando button.
			e.stopPropagation();

			e.preventDefault();
			modules['selectedEntry'].select(e.target);
			revealImage(e.target, (e.target.classList.contains('collapsedExpando')));
		}, true);
		var preNode = null;
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

		if ((scanningSelfText || isSelfTextExpando) && module.options.autoExpandSelfText.value && !elem.doNotExpandInSelfText) {
			revealImage(expandLink, true);
		} else if (elem.type === 'IMAGE' || elem.type === 'GALLERY' || (elem.type === 'GENERIC_EXPANDO' && elem.expandOnViewAll === true)) {
			// this may have come from an asynchronous call, in which case it'd get missed by findAllImages, so
			// if all images are supposed to be visible, expand this link now.
			revealImage(expandLink, findImageFilter(expandLink.imageLink));
		}
		if (!scanningForImages) {
			// also since this may have come from an asynchronous call, we need to update the view images count.
			updateImageButtons(imageList.length);
		}
	}

	function revealImage(expandoButton, showHide) {
		// don't reveal images for invisible buttons (offsetParent is a cheaper way of checking
		// visibility than jquery's .is(':visible'))
		if ((!expandoButton) || (!expandoButton.offsetParent)) {
			return false;
		}
		// showhide = false means hide, true means show!

		var imageLink = expandoButton.imageLink,
			mediaType, mediaTag, associatedImage;

		if (typeof domainModuleMap[imageLink.site] === 'undefined') {
			console.log('something went wrong scanning image from site: ' + imageLink.site);
			return;
		}
		if (expandoButton.expandoBox && expandoButton.expandoBox.classList.contains('madeVisible')) {
			var isMedia = (imageLink.type === 'AUDIO' || imageLink.type === 'VIDEO' ||
					imageLink.subtype === 'VIDEO');

			if (isMedia) {
				mediaType = (imageLink.subtype === 'VIDEO') ? 'VIDEO' : imageLink.type;
				mediaTag = expandoButton.expandoBox.querySelector(mediaType);
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

				associatedImage = $(expandoButton).data('associatedImage');

				if (associatedImage) {
					syncPlaceholder(associatedImage);
				}

				if (isMedia && mediaTag) {
					if (!mediaTag.wasPaused) {
						mediaTag.play();
					}
				}
			}
			handleSRStyleToggleVisibility();
		} else if (showHide) {
			//TODO: flash
			switch (imageLink.type) {
				case 'IMAGE':
				case 'GALLERY':
					if (module.options.convertGifstoGfycat.value) {
						var gif = new RegExp('^(http|https|ftp)://.*\\.gif($|/?)');
						if (gif.test(imageLink.src)) {
							if (!imageLink.resChecked) {
								imageLink.resChecked = true;
								generateGfycatExpando(expandoButton, {autoplay: true, loop: true, muted: true});
							}
							break;
						}
					}

					generateImageExpando(expandoButton);
					break;
				case 'TEXT':
					generateTextExpando(expandoButton);
					break;
				case 'IFRAME':
					generateIframeExpando(expandoButton);
					break;
				case 'VIDEO':
					generateVideoExpando(expandoButton, imageLink.expandoOptions);
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
			}
		}
		updateParentHeight(expandoButton);
	}

	function generateImageExpando(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var which = imageLink.galleryStart || 0;

		var imgDiv = document.createElement('div');
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
			var singleImage = {
				src: imageLink.src,
				href: imageLink.href
			};
			imgDiv.sources[0] = singleImage;
		}

		var header;
		if ('imageTitle' in imageLink) {
			header = document.createElement('h3');
			header.classList.add('imgTitle');
			$(header).safeHtml(imageLink.imageTitle);
			imgDiv.appendChild(header);
		}

		if ('imgCaptions' in imageLink) {
			var captions = document.createElement('div');
			captions.className = 'imgCaptions';
			$(captions).safeHtml(imageLink.caption);
			imgDiv.appendChild(captions);
		}

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			$(credits).safeHtml(imageLink.credits);
			imgDiv.appendChild(credits);
		}

		switch (imageLink.type) {
			case 'GALLERY':
				var loadAllInAlbum = module.options.loadAllInAlbum.value;
				var dontLoadAlbumsBiggerThan = parseInt(module.options.dontLoadAlbumsBiggerThan.value, 10) || 0;
				if (loadAllInAlbum && (dontLoadAlbumsBiggerThan <= 0 || imgDiv.sources.length <= dontLoadAlbumsBiggerThan)) {
					if (imgDiv.sources.length > 1) {
						var albumLength = ' (' + imgDiv.sources.length + ' images)';
						if (header) {
							$(header).append(albumLength);
						}
					}

					for (var imgNum = 0; imgNum < imgDiv.sources.length; imgNum++) {
						addImage(imgDiv, imgNum);
					}
					break;
				} else {
					// If we're using the traditional album view, add the controls then fall through to add the IMAGE
					var controlWrapper = document.createElement('div');
					controlWrapper.className = 'RESGalleryControls';

					var leftButton = document.createElement('a');
					leftButton.className = 'previous noKeyNav';
					leftButton.addEventListener('click', function(e) {
						var topWrapper = e.target.parentElement.parentElement;
						if (topWrapper.currentImage === 0) {
							topWrapper.currentImage = topWrapper.sources.length - 1;
						} else {
							topWrapper.currentImage -= 1;
						}
						adjustGalleryDisplay(topWrapper);
					});
					controlWrapper.appendChild(leftButton);

					var posLabel = document.createElement('span');
					posLabel.className = 'RESGalleryLabel';
					var niceWhich = ((which + 1 < 10) && (imgDiv.sources.length >= 10)) ? '0' + (which + 1) : (which + 1);
					if (imgDiv.sources.length) {
						posLabel.textContent = niceWhich + ' of ' + imgDiv.sources.length;
					} else {
						posLabel.textContent = 'Whoops, this gallery seems to be empty.';
					}
					controlWrapper.appendChild(posLabel);

					if (loadAllInAlbum && dontLoadAlbumsBiggerThan > 0 && dontLoadAlbumsBiggerThan < imgDiv.sources.length) {
						var largeAlbum = $('<span />').attr('title', 'Album has more than ' + dontLoadAlbumsBiggerThan + ' images. \nClick to adjust settings.');
						var largeAlbumSettings = modules['settingsNavigation'].makeUrlHashLink('showImages', 'dontLoadAlbumsBiggerThan', '*', 'RESGalleryLargeInfo');
						largeAlbum.append(largeAlbumSettings);

						largeAlbum.appendTo(controlWrapper);
					}

					var rightButton = document.createElement('a');
					rightButton.className = 'next noKeyNav';
					rightButton.addEventListener('click', function(e) {
						var topWrapper = e.target.parentElement.parentElement;
						if (topWrapper.currentImage == topWrapper.sources.length - 1) {
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
				addImage(imgDiv, which, this);
		}

		function addImage(container, sourceNumber) {
			var sourceImage = container.sources[sourceNumber];

			var paragraph = document.createElement('p');

			if (!sourceImage) {
				return;
			}
			if ('title' in sourceImage) {
				var imageTitle = document.createElement('h4');
				imageTitle.className = 'imgCaptions';
				$(imageTitle).safeHtml(sourceImage.title);
				paragraph.appendChild(imageTitle);
			}

			if ('caption' in sourceImage) {
				var imageCaptions = document.createElement('div');
				imageCaptions.className = 'imgCaptions';
				$(imageCaptions).safeHtml(sourceImage.caption);
				paragraph.appendChild(imageCaptions);
			}

			var imageAnchor = document.createElement('a');
			imageAnchor.classList.add('madeVisible');
			imageAnchor.href = sourceImage.src;
			if (module.options.openInNewWindow.value) {
				imageAnchor.target = '_blank';
			}
			var media = (/*sourceImage.expandoOptions && sourceImage.expandoOptions.generate ||*/ generateImage.bind(this, sourceImage))();

			$(expandoButton).data('associatedImage', media);
			imageLink.media = media;
			imageAnchor.appendChild(media);
			module.makeMediaZoomable(media);
			module.makeMediaMovable(media);
			trackMediaLoad(imageLink, media);
			paragraph.appendChild(imageAnchor);

			container.appendChild(paragraph);
		}

		function generateImage(sourceImage) {
			var image = document.createElement('img');
			//Unfortunately it is impossible to use a global event handler for these.
			image.onerror = function() {
				image.classList.add('RESImageError');
			};
			image.onload = function() {
				image.classList.remove('RESImageError');
				if (module.options.displayOriginalResolution.value && this.naturalWidth && this.naturalHeight) {
					this.title = this.naturalWidth + ' × ' + this.naturalHeight + ' px';
				}
			};
			image.classList.add('RESImage');
			image.id = 'RESImage-' + RESUtils.randomHash();
			image.src = sourceImage.src;
			image.style.maxWidth = module.options.maxWidth.value + 'px';
			image.style.maxHeight = module.options.maxHeight.value + 'px';
			return image;
		}

		//Adjusts the images for the gallery navigation buttons as well as the "n of m" display.

		function adjustGalleryDisplay(topLevel) {
			var source = topLevel.sources[topLevel.currentImage];
			var image = topLevel.querySelector('img.RESImage');
			var imageAnchor = image.parentElement;
			var paragraph = imageAnchor.parentElement;

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
			var paddedImageNumber = ((topLevel.currentImage + 1 < 10) && (imgDiv.sources.length >= 10)) ? '0' + (topLevel.currentImage + 1) : topLevel.currentImage + 1;
			if (imgDiv.sources.length) {
				topLevel.querySelector('.RESGalleryLabel').textContent = (paddedImageNumber + ' of ' + imgDiv.sources.length);
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
			var imageTitle = paragraph.querySelector('h4.imgCaptions');
			if (imageTitle) $(imageTitle).safeHtml(source.title);
			var imageCaptions = paragraph.querySelector('div.imgCaptions');
			if (imageCaptions) $(imageCaptions).safeHtml(source.caption);
		}

		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.add('expanded');

		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, imgDiv);
		} else {
			expandoButton.parentNode.appendChild(imgDiv);
		}
	}

	/**
	 * Recursively loads the images synchronously.
	 */
	function preloadImages(srcs, i) {
		var _i = i,
			img = new Image();
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
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		imageLink.wrapperDiv = wrapperDiv;

		wrapperDiv.className = 'madeVisible';
		var iframeNode = document.createElement('iframe');
		iframeNode.setAttribute('width', imageLink.getAttribute('data-width') || '640');
		iframeNode.setAttribute('height', imageLink.getAttribute('data-height') || '360');
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
		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		expandoButton.addEventListener('click', function(e) {
			var msg = null;
			if (e.target.className.indexOf('expanded') === -1) {
				msg = imageLink.getAttribute('data-pause');
			} else {
				msg = imageLink.getAttribute('data-play');
			}
			// Pass message to iframe
			if (msg !== null) $(wrapperDiv).children('iframe')[0].contentWindow.postMessage(msg, '*');
		}, false);

		// Pause if comment (or any parent of comment) is collapsed
		if (RESUtils.pageType() == 'comments') {
			$(expandoButton).parents('.comment').find('> .entry .tagline > .expand').click(function(){
				$(wrapperDiv).children('iframe')[0].contentWindow.postMessage(imageLink.getAttribute('data-pause'), '*');
			});
		}

		// Delete iframe on close of built-in reddit expando's (if this is part of a linklist page), as they get regenerated on open anyway
		if (RESUtils.pageType() == 'linklist') {
			$(expandoButton).closest('div.entry').children('.expando-button:first').click(function(){
				$(wrapperDiv).children('iframe').remove();
			});
		}
	}

	function generateTextExpando(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';
		imageLink.wrapperDiv = wrapperDiv;

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		var text = document.createElement('div');
		text.className = 'md';

		// filter out iframes, as they will not survive safeHTML
		// TODO: make safeHTML handle iframes acceptably?
		imageLink.src = imageLink.src.replace(/<iframe/ig, '&lt;iframe');

		$(text).safeHtml(imageLink.src);
		imgDiv.appendChild(text);

		var captions = document.createElement('div');
		captions.className = 'imgCaptions';
		$(captions).safeHtml(imageLink.caption);
		imgDiv.appendChild(captions);

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
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

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		//TODO: Decide how to handle history for this.
		//Selfposts already don't mark it, so either don't bother or add marking for selfposts.
	}

	function generateVideoExpando(expandoButton, options) {
		var mediaLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'madeVisible';
		mediaLink.wrapperDiv = wrapperDiv;

		var playerDiv = document.createElement('div');
		playerDiv.className = 'res-player';

		wrapperDiv.appendChild(playerDiv);


		var video = document.createElement('video'),
			$video = $(video);
		video.setAttribute('controls', '');
		video.setAttribute('preload', '');
		if (options) {
			if (options.autoplay) {
				video.setAttribute('autoplay', '');
			}
			if (options.muted) {
				video.setAttribute('muted', '');
			}
			if (options.loop) {
				video.setAttribute('loop', '');
			}
			if (options.poster) {
				video.setAttribute('poster', options.poster);
			}
		}
		video.style.maxWidth = module.options.maxWidth.value + 'px';
		video.style.maxHeight = module.options.maxHeight.value + 'px';

		var sources = $(mediaLink).data('sources'),
			fallback = $(mediaLink).data('fallback'),
			original = $(mediaLink).data('original'),
			source, sourceEle;

		for (var i = 0, len = sources.length; i < len; i++) {
			source = sources[i];
			sourceEle = document.createElement('source');
			sourceEle.src = source.file;
			sourceEle.type = source.type;
			if (fallback && i === len - 1) {
				$(sourceEle).data('fallback', fallback);
				$(sourceEle).data('original', original);
				sourceEle.addEventListener('error', function(e) {
					var fallbackLink = document.createElement('a'),
						fallbackImg = document.createElement('img'),
						vid = e.target.parentNode,
						player = vid.parentNode;

					fallbackImg.src = $(e.target).data('fallback');
					fallbackImg.class = 'RESImage';
					fallbackLink.href = $(e.target).data('original');
					fallbackLink.target = '_blank';
					fallbackLink.appendChild(fallbackImg);

					player.parentNode.replaceChild(fallbackLink, player);
					module.makeMediaZoomable(fallbackImg);
					module.makeMediaMovable(fallbackImg);
				}, false);
			}
			$video.append(sourceEle);
		}

		playerDiv.appendChild(video);

		expandoButton.expandoBox = wrapperDiv;
		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}

		if (mediaLink.onExpandData) {
			mediaLink.onExpandData.siteMod.onExpand(mediaLink);
		}


		module.makeMediaZoomable(video);
		module.makeMediaMovable(video);
		trackMediaLoad(mediaLink, video);
	}

	function generateAudioExpando(expandoButton, options) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		var audio = document.createElement('audio');
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

		var sources = $(imageLink).data('sources'),
			source, sourceEle;

		for (var i = 0, len = sources.length; i < len; i++) {
			source = sources[i];
			sourceEle = document.createElement('source');
			sourceEle.src = source.file;
			sourceEle.type = source.type;
			$(audio).append(sourceEle);
		}

		imgDiv.appendChild(audio);

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
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

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		if (imageLink.onExpandData) {
			imageLink.onExpandData.siteMod.onExpand(imageLink);
		}

		trackMediaLoad(imageLink, audio);
	}

	function addGfycatVideo(info, expandoButton, options) {
		var imageLink = expandoButton.imageLink;
		imageLink.type = 'VIDEO';

		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		var template = RESTemplates.getSync('GfycatUI');
		var videoData = {
			loop: true,
			autoplay: true,
			muted: true,
			directurl: info.url
		};

		videoData.poster = location.protocol + '//thumbs.gfycat.com/'+info.gfyName+'-poster.jpg';
		if (location.protocol === 'https:') {
			info.webmUrl = info.webmUrl.replace('http:', 'https:');
			info.mp4Url = info.mp4Url.replace('http:', 'https:');
		}
		videoData.sources = [
			{
				'source': info.webmUrl,
				'type': 'video/webm',
				'class': 'gfyRwebmsrc'
			},
			{
				'source': info.mp4Url,
				'type': 'video/mp4',
				'class': 'gfyRmp4src'
			}
		];
		var element = template.html(videoData)[0],
			video = element.querySelector('video');

		new gfyObject(element, info.url, info.frameRate);

		imgDiv.appendChild(element);

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
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

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		module.makeMediaZoomable(video);
		syncPlaceholder(video);
		trackMediaLoad(imageLink, video);
	}

	function handleGfycatSources(name, expandoButton, options) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', location.protocol + '//gfycat.com/cajax/get/' + name);

		xhr.onload = function(e) {
			var json = JSON.parse(e.target.responseText);

			addGfycatVideo(json.gfyItem, expandoButton, options);
		};

		xhr.onerror = function() {
			generateImageExpando(expandoButton);
		};

		xhr.send();
	}

	function generateGfycatExpando(expandoButton, options) {
		var apiURL = location.protocol + '//upload.gfycat.com/transcodeRelease?fetchUrl=' + encodeURIComponent(expandoButton.imageLink.src);

		var xhr = new XMLHttpRequest();
		xhr.open('GET', apiURL);

		xhr.onload = function(e) {
			try {
				var json = JSON.parse(e.target.responseText);
				if ('gfyName' in json) {
					handleGfycatSources(json.gfyName, expandoButton, options);
				} else {
					generateImageExpando(expandoButton);
				}
			} catch (error) {
				generateImageExpando(expandoButton);
			}
		};

		xhr.onerror = function() {
			generateImageExpando(expandoButton);
		};

		xhr.send();
	}

	function generateGenericExpando(expandoButton, options) {
		var mediaLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';
		mediaLink.wrapperDiv = wrapperDiv;

		var mediaDiv = document.createElement('div');
		mediaDiv.className = 'madeVisible usertext-body';

		var element = options.generate(options);
		mediaDiv.appendChild(element);
		wrapperDiv.appendChild(mediaDiv);

		expandoButton.addEventListener('click', function(e) {
			if (options.media.blob_type === 'video' || options.media.blob_type === 'audio') {
				var media = wrapperDiv.querySelector('video, audio');
				if (expandoButton.classList.contains('expanded')) {
					if (!media.wasPaused) {
						media.play();
					}
				} else {
					media.wasPaused = media.paused;
					media.pause();
				}
			}
		}, false);

		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}

		var video = element.querySelector('video');
		if (options.media.blob_type === 'video') {
			video.style.maxWidth = $(element).closest('.entry').width() + 'px';
		}

		expandoButton.expandoBox = mediaDiv;
		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');
		$(expandoButton).data('associatedImage', video || element);

		if (video) {
			module.makeMediaZoomable(video);
			syncPlaceholder(video);
		}

		if (mediaLink.onExpandData) {
			mediaLink.onExpandData.siteMod.onExpand(mediaLink);
		}

		trackMediaLoad(mediaLink, element);
	}

	function generateNoEmbedExpando(expandoButton) {
		var imageLink = expandoButton.imageLink,
			apiURL = '//noembed.com/embed?url=' + encodeURIComponent(imageLink.src),
			def = $.Deferred();

		RESEnvironment.ajax({
			method: 'GET',
			url: apiURL,
			// aggressiveCache: true,
			onload: function(response) {
				try {
					var json = JSON.parse(response.responseText);
					handleNoEmbedQuery(expandoButton, json);
					def.resolve(expandoButton, json);
				} catch (error) {
					def.reject();
				}
			},
			onerror: function(response) {
				def.reject();
			}
		});
	}

	function handleNoEmbedQuery(expandoButton, response) {
		var imageLink = expandoButton.imageLink;

		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';
		imageLink.wrapperDiv = wrapperDiv;

		var noEmbedFrame = document.createElement('iframe');
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
		for (var key in response) {
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

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');
	}

	var visits = [];
	var sendVisitsThrottle;

	function trackVisit(link) {
		var $link = $(link).closest('.thing'),
			fullname;

		if (BrowserDetect.isChrome() && chrome.extension.inIncognitoContext) {
			return;
		}

		if ($link.hasClass('visited')) {
			return;
		}

		fullname = $link.data('fullname');
		visits.push(fullname);

		clearTimeout(sendVisitsThrottle);
		sendVisitsThrottle = setTimeout(sendVisits, 1000);
	}

	function sendVisits() {
		var modhash = RESUtils.loggedInUserHash(),
			data = visits.join(',');

		$.ajax({
			type: 'POST',
			url: '/api/store_visits',
			headers: {
				'X-Modhash': modhash
			},
			data: {
				'links': data
			},
			success: function() {
				// clear the queue.
				visits = [];
			}
		});
	}

	function trackMediaLoad(link, media) {
		if (module.options.markVisited.value) {
			// also use reddit's mechanism for storing visited links if user has gold.
			if ($('body').hasClass('gold')) {
				trackVisit(link);
			}
			var isNSFW = $(link).closest('.thing').is('.over18');
			var sfwMode = module.options['sfwHistory'].value;

			if ((BrowserDetect.isChrome()) || (BrowserDetect.isFirefox())) {
				onLoad();
			} else {
				media.addEventListener('load', onLoad, false);
			}
		}

		function onLoad() {
			var url = link.historyURL || link.href;
			if (!isNSFW || sfwMode !== 'none') link.classList.add('visited');
			if (!isNSFW || sfwMode === 'add') {
				imageTrackStack.push(url);
				if (imageTrackStack.length === 1) setTimeout(imageTrackShift, 300);
			}
		}

		media.addEventListener('load', function(e) {
			$(e.target).data('loaded', true);
			$(e.target).closest('a.madeVisible').removeClass('csspinner');
			handleSRStyleToggleVisibility(e.target);
		}, false);
	}

	function imageTrackShift() {
		var url = imageTrackStack.shift();
		if (typeof url === 'undefined') {
			handleSRStyleToggleVisibility();
			return;
		}

		RESEnvironment.addURLToHistory(url);
		imageTrackShift();
	}

	var dragTargetData = {
		//numbers just picked as sane initialization values
		imageWidth: 100,
		diagonal: 0, //zero to represent the state where no the mouse button is not down
		dragging: false
	};
	var moveTargetData = {
		moving: false, // Whether the image should move with the mouse or not
		mouseLastPos: [0, 0], // Last position of the mouse. Used to calculate deltaX and deltaY for our move.
		hasMoved: false // If true we will stop click events on the image
	};

	function getDragSize(e) {
		var rc = e.target.getBoundingClientRect(),
			p = Math.pow,
			dragSize = p(p(e.clientX - rc.left, 2) + p(e.clientY - rc.top, 2), 0.5);

		return Math.round(dragSize);
	}

	function handleSRStyleToggleVisibility(image) {
		RESUtils.debounce('handleSRStyleToggleVisibility', 50, function() {
			var toggleEle = modules['styleTweaks'].styleToggleContainer;
			if (!toggleEle) return;
			var imageElems = image ? [image] : document.querySelectorAll('.RESImage');

			for (var i = 0; i < imageElems.length; i++) {
				var imageEle = imageElems[i];
				var imageID = imageEle.getAttribute('id');

				if (RESUtils.doElementsCollide(toggleEle, imageEle, 15)) {
					modules['styleTweaks'].setSRStyleToggleVisibility(false, 'imageZoom-' + imageID);
				} else {
					modules['styleTweaks'].setSRStyleToggleVisibility(true, 'imageZoom-' + imageID);
				}
			}
		});
	}

	function setPlaceholder(mediaTag) {
		if (!$(mediaTag).data('imagePlaceholder')) {
			var thisPH = document.createElement('div');
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
			mediaTag.addEventListener('loadeddata', handleMediaLoad);
		} else {
			mediaTag.addEventListener('load', handleMediaLoad);
		}
	}

	function handleMediaLoad() {
		// don't do this twice (e.g. on image reload from cache), as we get bad height/width data.
		if ($(this).data('loaded')) {
			return;
		}
		syncPlaceholder(this);

		if (!this.tagName) { //validation to fix issue #1672
			return;
		}
		$(this).data('loaded', true);
		if (this.tagName !== 'VIDEO') {
			this.style.position = 'absolute';
		} else {
			var $resPlayer = $(this.parentNode).closest('.res-player');
			$resPlayer[0].style.position = 'absolute';
		}
	}

	function syncPlaceholder(e) {
		var ele = e.target || e;
		var thisPH = $(ele).data('imagePlaceholder');
		if (ele.tagName !== 'VIDEO') {
			$(thisPH).width($(ele).width() + 'px').height($(ele).height() + 'px');
		} else {
			// get the div.res-player and sync it too
			var $resPlayer = $(ele.parentNode).closest('.res-player');
			$resPlayer.width($(ele).width() + 'px');
			$(thisPH).height($resPlayer.height() + 'px');
		}
		updateParentHeight(ele);
	}

	function setMediaClippyText(elem) {
		if (!module.options.clippy.value && elem.title) return;

		var clippy = [], title;
		if (module.options.imageZoom.value) {
			clippy.push('drag to resize');
		}

		if (elem.tagName === 'IMG' && module.options.imageMove.value) {
			clippy.push('shift-drag to move');
		}

		title = clippy.join(' or ');

		elem.setAttribute('title', title);
	}

	module.makeMediaZoomable = function(mediaTag) {
		if (module.options.imageZoom.value) {
			setPlaceholder(mediaTag);
			setMediaClippyText(mediaTag);

			mediaTag.addEventListener('mousedown', mousedownMedia, false);
			mediaTag.addEventListener('mouseup', dragMedia, false);
			mediaTag.addEventListener('mousemove', dragMedia, false);
			mediaTag.addEventListener('mouseout', mouseoutMedia, false);

			// click event is unneeded for HTML5 video -- but allow Gfycat, giphy and gifyoutube to follow gif behaviour
			if (mediaTag.tagName !== 'VIDEO' || mediaTag.className.indexOf('gfyRVid') !== -1 || mediaTag.className.indexOf('giphyVid') !== -1 || mediaTag.className.indexOf('gifyoutubeVid') !== -1 || mediaTag.className.indexOf('imgurgifvVid') !== -1) {
				mediaTag.addEventListener('click', clickMedia, false);
			}
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
			mediaTag.addEventListener('click', function(e) {
				if (moveTargetData.moving && moveTargetData.hasMoved) {
					moveTargetData.moving = false;
					e.preventDefault();
				}
			}, false);
			mediaTag.addEventListener('mousemove', checkMoveMedia, false);
			mediaTag.addEventListener('mouseout', function(e) {
				moveTargetData.moving = false;
			}, false);
			// Set this so the image is displayed above the "Set tag" buttons
			mediaTag.style.zIndex = 1;
		}
	};

	function mousedownMedia(e) {
		if (e.button === 0) {
			if (!e.shiftKey) {
				if (e.target.tagName === 'VIDEO' && e.target.hasAttribute('controls')) {
					var rc = e.target.getBoundingClientRect();
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
			} else {
				// Record where the move began, both for the cursor and the image
				moveTargetData.moving = true;
				moveTargetData.hasMoved = false;
				moveTargetData.mouseLastPos = [e.clientX, e.clientY];
			}
			e.preventDefault();
		}
	}

	function mouseoutMedia(e) {
		dragTargetData.diagonal = 0;
	}

	function dragMedia(e) {
		if (dragTargetData.diagonal) {
			var newDiagonal = getDragSize(e),
				oldDiagonal = dragTargetData.diagonal,
				imageWidth = dragTargetData.imageWidth,
				maxWidth = Math.max(e.target.minWidth, newDiagonal / oldDiagonal * imageWidth);

			if (Math.abs(newDiagonal - oldDiagonal) > 5 && e.target.tagName == 'VIDEO') {
				e.target.preventPlayPause = true;
			}

			module.resizeMedia(e.target, maxWidth);
			dragTargetData.dragging = true;
		}
		handleSRStyleToggleVisibility(e.target);
		if (e.type === 'mouseup') {
			dragTargetData.diagonal = 0;
		}
	}

	function checkMoveMedia(e) {
		if (moveTargetData.moving) {
			var deltaX = e.clientX - moveTargetData.mouseLastPos[0],
				deltaY = e.clientY - moveTargetData.mouseLastPos[1];
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
		} else {
			// get the div.res-player and sync it too
			var $resPlayer = $(ele.parentNode).closest('.res-player');
			$resPlayer[0].style.position = 'absolute';
		}

		syncPlaceholder(ele);
	};

	function clickMedia(e) {
		dragTargetData.diagonal = 0;
		if (dragTargetData.hasChangedWidth) {
			dragTargetData.dragging = false;
			// if video let video controls function
			if (e.target.tagName === 'VIDEO' && e.target.hasAttribute('controls')) {
				var rc = e.target.getBoundingClientRect();
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
		var currWidth = $(ele).width();
		if (newWidth !== currWidth) {
			dragTargetData.hasChangedWidth = true;

			ele.style.width = newWidth + 'px';
			ele.style.maxWidth = newWidth + 'px';
			ele.style.maxHeight = '';
			ele.style.height = 'auto';

			if (ele.tagName !== 'VIDEO') {
				ele.style.position = 'absolute';
			} else {
				// get the div.res-player and sync it too
				var $resPlayer = $(ele.parentNode).closest('.res-player');
				$resPlayer[0].style.position = 'absolute';
			}

			syncPlaceholder(ele);
		}
	};

	function updateParentHeight(ele) {
		if (module.options.autoMaxHeight.value && ele) {
			var parent = $(ele).closest('.md')[0],
				type = $(parent).closest('body:not(.comments-page) .expando')[0] || $(parent).closest('.thing')[0];
			if (parent && (type.classList.contains('expando') || type.classList.contains('comment'))) {
				var placeholders = $(parent).find('.expando-button.expanded + * .RESImagePlaceholder, .expando-button.expanded + * > *:not(p)'),
					height = 0,
					tempHeight,
					selfMax = parseInt(module.options.selfTextMaxHeight.value, 10),
					commentMax = parseInt(module.options.commentMaxHeight.value, 10);

				for (var i = 0; i < placeholders.length; i++) {
					tempHeight = $(placeholders[i]).height();
					if ((tempHeight || 0) > height) {
						height = tempHeight;
					}
				}

				if (selfMax && type.classList.contains('expando')) {
					parent.style.maxHeight = ((height > selfMax) ? height : selfMax) + 'px';
				} else if (commentMax && type.classList.contains('comment')) {
					parent.style.maxHeight = ((height > commentMax) ? height : commentMax) + 'px';
				}
			}
		}
	}

	module.siteModules = {
		'default': {
			domains: [],
			acceptRegex: /^[^#]+?\.(gif|jpe?g|png)(?:[?&#_].*|$)/i,
			rejectRegex: /(?:wikipedia\.org\/wiki|(?:i\.|m\.)?imgur\.com|photobucket\.com|gifsound\.com|imgrush\.com|gfycat\.com|\/wiki\/File:.*|reddit\.com|onedrive\.live\.com|500px\.(?:com|net|org)|(?:www\.|share\.)?gifyoutube\.com)|futurism\.co/i,
			detect: function(href, elem) {
				var siteMod = module.siteModules['default'];
				return (siteMod.acceptRegex.test(href) && !siteMod.rejectRegex.test(href));
			},
			handleLink: function(elem) {
				var def = $.Deferred();

				def.resolve(elem, {
					type: 'IMAGE',
					src: elem.href
				});
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();

				elem.type = info.type;
				elem.src = info.src;

				if (RESUtils.pageType() === 'linklist' && elem.classList.contains('title')) {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				def.resolve(elem);
				return def.promise();
			}
		},
		'defaultVideo': {
			domains: [],
			acceptRegex: /^[^#]+?\.(webm|mp4|ogv|3gp)(?:[?&#_].*|$)/i,
			rejectRegex: /(?:onedrive\.live\.com)/i,
			videoDetect: document.createElement('VIDEO'),
			detect: function(href, elem) {
				var siteMod = module.siteModules['defaultVideo'];
				return (siteMod.acceptRegex.test(href) && !siteMod.rejectRegex.test(href));
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var siteMod = module.siteModules['defaultVideo'];
				var groups = siteMod.acceptRegex.exec(elem.href);

				if (groups) {
					// Change ogv to ogg format.
					if (groups[1] === 'ogv') groups[1] = 'ogg';

					var format = 'video/' + groups[1];

					// Only add the inline video player if the users browser
					// 'probably' or 'maybe' supports the linked video format.
					// This should cover most video problems. You can never be
					// sure if the client supports the codecs used in the container.
					if (siteMod.videoDetect.canPlayType(format) !== '') {
						def.resolve(elem, {
							type: 'VIDEO',
							src: elem.href,
							format: format
						});
					} else {
						def.reject();
					}
				} else {
					def.reject();
				}

				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.expandoOptions = {
					autoplay: false,
					loop: false
				};
				var sources = [{
					'file': info['src'],
					'type': info['format']
				}];

				elem.type = 'VIDEO';
				$(elem).data('sources', sources);
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		'defaultAudio': {
			domains: [],
			acceptRegex: /^[^#]+?\.(opus|weba|ogg|wav|mp3|flac)(?:[?&#_].*|$)/i,
			rejectRegex: /(?:onedrive\.live\.com)/i,
			audioDetect: document.createElement('AUDIO'),
			detect: function(href, elem) {
				var siteMod = module.siteModules['defaultAudio'];
				return (siteMod.acceptRegex.test(href) && !siteMod.rejectRegex.test(href));
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var siteMod = module.siteModules['defaultAudio'];
				var groups = siteMod.acceptRegex.exec(elem.href);

				if (groups) {
					// Change weba and opus to their correct containers.
					if (groups[1] === 'weba') groups[1] = 'webm';
					if (groups[1] === 'opus') groups[1] = 'ogg';

					var format = 'audio/' + groups[1];

					// Only add the inline audio player if the users browser
					// 'probably' or 'maybe' supports the linked audio format.
					// This should cover most aduio problems. You can never be
					// sure if the client supports the codecs used in the container.
					if (siteMod.audioDetect.canPlayType(format) !== '') {
						def.resolve(elem, {
							type: 'AUDIO',
							src: elem.href,
							format: format
						});
					} else {
						def.reject();
					}
				} else {
					def.reject();
				}

				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.expandoOptions = {
					autoplay: true,
					loop: false
				};
				var sources = [{
					'file': info['src'],
					'type': info['format']
				}];

				elem.type = 'AUDIO';
				$(elem).data('sources', sources);
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		}
	};
});
