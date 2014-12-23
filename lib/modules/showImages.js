/* siteModule format:

// Note: Media hosting site must support CORS in order for expandos to work.

module: {

// Optional name (if different from module)
	name: '',

// Returns true/false to indicate whether the siteModule will attempt to handle the link.
// The only parameter is the anchor element.
	detect: function(element) { return true/false; },

// This is where links are parsed, cache checks are made, and XHR is performed.
// The only parameter is the anchor element.
// The method is in a jQuery Deferred chain and will be followed by handleInfo.
// A new $.Deferred object should be created and resolved/rejected as necessary and then returned.
// If resolving, the element should be passed along with whatever data is required.
	handleLink: function(element) {},

// This is where the embedding information is added to the link.
// handleInfo sits in the Deferred chain after handLink
// and should receive both the element and a data object from handleLink.
// The first parameter should the same anchor element passed to handleLink.
// The second parameter should be module-specific data.
// A new $.Deferred object should be created and resolved/rejected as necessary and then returned.
// If resolving, the element should be passed.
	handleInfo: function(elem, info) {}
*/
/*
Embedding infomation:
All embedding information (except 'site') is to be attached to the
html anchor in the handleInfo function.

required type:
	'IMAGE' for single images | 'GALLERY' for image galleries | 'TEXT' html/text to be displayed
required src:
	if type is TEXT then src is HTML (be careful about what is accepted here)
	if type is IMAGE then src is an image URL string
	if type is GALLERY then src is an array of objects with the following properties:
		required src: URL of the image
		optional href: URL of the page containing the image (per image)
		optional title: string to displayed directly above the image (per image)
		optional caption: string to be displayed directly below the image (per image)
optional imageTitle:
	string to be displayed above the image (gallery level).
optional caption:
	string to be displayed below the image
optional credits:
	string to be displayed below caption
optional galleryStart:
	zero-indexed page number to open the gallery to
*/
modules['showImages'] = {
	moduleID: 'showImages',
	moduleName: 'Inline Image Viewer',
	category: 'UI',
	options: {
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
		autoplayVideo: {
			type: 'boolean',
			value: true,
			description: 'Autoplay inline videos'
		}
	},
	description: 'Opens images inline in your browser with the click of a button. Also has configuration options, check it out!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	exclude: [
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/ads\/[-\w\.\_\?=]*/i,
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/[-\w\.\/]*\/submit\/?$/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadDynamicOptions: function() {
		// Augment the options with available image modules
		for (var site in this.siteModules) {
			// Ignore default
			if (site === 'default') continue;
			if (site === 'defaultVideo') continue;
			if (site === 'defaultAudio') continue;

			// Auto add on / off options
			this.createSiteModuleEnabledOption(site);

			// Find out if module has any additional options - if it does add them
			if (this.siteModules[site].options !== 'undefined'){
				for (var optionKey in this.siteModules[site].options) {
					this.options[optionKey] = this.siteModules[site].options[optionKey];
				}
			}
		}
	},
	createSiteModuleEnabledOption: function(site){
		// Create on/off option for given module
		var name = (typeof this.siteModules[site].name !== 'undefined') ? this.siteModules[site].name : site;
		this.options['display ' + name] = {
			description: 'Display expander for ' + name,
			value: true,
			type: 'boolean'
		};
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (!this.options.displayImageCaptions.value) {
				RESUtils.addCSS('.imgTitle, .imgCaptions { display: none; }');
			}
			var selfTextMaxHeight = parseInt(this.options.selfTextMaxHeight.value, 10);
			if (selfTextMaxHeight) {
				// Strange selector necessary to select tumblr expandos, etc.
				RESUtils.addCSS('.selftext.expanded ~ * .md { max-height: ' + selfTextMaxHeight + 'px; overflow-y: auto !important; position: relative; }');
			}
			var commentMaxHeight = parseInt(this.options.commentMaxHeight.value, 10);
			if(commentMaxHeight) {
				RESUtils.addCSS('.comment .md { max-height: ' + commentMaxHeight + 'px; overflow-y: auto !important; position: relative; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			// Generate domain to module map
			this.generateDomainModuleMap();

			this.imageList = [];
			this.imagesRevealed = {};
			this.dupeAnchors = 0;
			/*
			true: show all images
			false: hide all images
			'any string': display images match the tab
			*/
			this.currentImageTab = false;
			this.customImageTabs = {};

			if (this.options.markVisited.value) {
				this.imageTrackStack = [];
			}

			this.scanningForImages = false;

			if (this.options.conserveMemory.value) {
				window.addEventListener('scroll', modules['showImages'].handleScroll, false);
			}

			RESUtils.watchForElement('siteTable', modules['showImages'].findAllImages);
			RESUtils.watchForElement('selfText', modules['showImages'].findAllImagesInSelfText);
			RESUtils.watchForElement('newComments', modules['showImages'].findAllImagesInSelfText);

			this.createImageButtons();
			this.findAllImages();
			document.addEventListener('dragstart', function() {
				return false;
			}, false);
		}
	},
	handleScroll: function(e) {
		if (modules['showImages'].scrollTimer) clearTimeout(modules['showImages'].scrollTimer);
		modules['showImages'].scrollTimer = setTimeout(modules['showImages'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function(e) {
		var i, len, thisMarker, thisXY;

		for (i = 0, len = modules['showImages'].imageList.length; i < len; i++) {
			thisXY = RESUtils.getXYpos(modules['showImages'].imageList[i]);
			if (thisXY.y > window.pageYOffset) {
				thisMarker = modules['showImages'].imageList[i];
				if (thisMarker) {
					modules['showImages'].lazyUnload(i);
					break;
				}
			}
		}
	},
	lazyUnload: function(idx) {
		// hide any expanded images that are further than bufferScreens above or below viewport
		// show any expanded images that are within bufferScreens of viewport
		var bufferScreens = this.options.bufferScreens.value || 2,
			viewportHeight = $(window).height(),
			maximumTop = viewportHeight * (bufferScreens + 1),
			minimumBottom = viewportHeight * bufferScreens * -1,
			i = 0,
			len = this.imageList.length,
			boundingBox;

		for (; i < len; i++) {
			if (this.imageList[i].imageLink && this.imageList[i].imageLink.image) {
				boundingBox = this.imageList[i].imageLink.image.getBoundingClientRect();
				if (boundingBox.top > maximumTop || boundingBox.bottom < minimumBottom) {
					this.unloadRevealedImage(this.imageList[i]);
				} else {
					this.reloadRevealedImage(this.imageList[i]);
				}
			}
		}
	},
	transparentGif: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
	unloadRevealedImage: function(ele) {
		var src, width, height,
			$img;

		if (ele.imageLink && ele.imageLink.image) {
			$img = $(ele.imageLink.image);
			src = $img.attr('src');
			if (src === this.transparentGif) {
				return;
			}
			width = $img.width();
			height = $img.height();
			// only hide the image if it has a width and height (it may not be loaded yet)
			if (width && height && $img.data('loaded')) {
				// preserve src and set the width to height to make the page not jump
				$img.data('src',src).attr('width',width).attr('height',height);
				// swap img with transparent gif to save memory
				$img.attr('src',this.transparentGif);
			}
		}
	},
	reloadRevealedImage: function(ele) {
		var src, $img;

		if (ele.imageLink && ele.imageLink.image) {
			$img = $(ele.imageLink.image);
			src = $img.data('src');
			if (src && ($img.attr('src') !== src)) {
				$img.attr('src',src);
			}
		}
	},
	findAllImagesInSelfText: function(ele) {
		modules['showImages'].findAllImages(ele, true);
	},
	createImageButtons: function() {
		var mainMenuUL = RESUtils.getHeaderMenuList()

		if (mainMenuUL) {
			var li = document.createElement('li');
			var a = document.createElement('a');
			var text = document.createTextNode('scanning for images...');
			this.scanningForImages = true;

			a.href = '#';
			a.id = 'viewImagesButton';
			a.addEventListener('click', function(e) {
				e.preventDefault();
				if (!modules['showImages'].scanningForImages) {
					modules['showImages'].setShowImages(null, 'image');
				}
			}, true);
			a.appendChild(text);
			li.appendChild(a);
			if (!this.options.showViewImagesTab.value) {
				li.style.display = 'none';
			}
			mainMenuUL.appendChild(li);
			this.viewImageButton = a;

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
						this.customImageTabs[key] = new RegExp('[\\[\\{\\<\\(]\s*(' + switches[key].join('|') + ')\s*[\\]\\}\\>\\)]', 'i');
					}
				}
			}

			if (!/comments\/[-\w\.\/]/i.test(location.href)) {
				for (var mode in this.customImageTabs) {
					var li = document.createElement('li'),
						a = document.createElement('a'),
						text = document.createTextNode('[' + mode + ']');
					a.href = '#';
					a.className = 'RESTab-' + mode.toLowerCase().replace(/- /g, '_');
					a.addEventListener('click', (function(mode) {
						return function(e) {
							e.preventDefault();
							modules['showImages'].setShowImages(mode);
						};
					})(mode), true);

					a.appendChild(text);
					li.appendChild(a);
					mainMenuUL.appendChild(li);
				}
			}
		}

		for (var key in modules['showImages'].siteModules) {
			var siteModule = modules['showImages'].siteModules[key];
			if (!siteModule) continue;
			if (!modules['showImages'].siteModules.hasOwnProperty(key)) continue;
			var siteModule = modules['showImages'].siteModules[key];
			if (typeof siteModule.go === 'function') {
				siteModule.go();
			}
		}
	},
	setShowImages: function(newImageTab, type) {
		type = type || 'image';
		if (newImageTab == null) {
			//This is for the all images button
			//If we stored `true` then toggle to false, in all other cases turn it to true
			if (this.currentImageTab === true) {
				this.currentImageTab = false;
			} else {
				this.currentImageTab = true;
			}
		} else if (this.currentImageTab === newImageTab) {
			//If they are the same, turn it off
			this.currentImageTab = false;
		} else if (newImageTab in this.customImageTabs) {
			//If the tab is defined, switch to it
			this.currentImageTab = newImageTab;
		} else {
			//Otherwise ignore it
			return;
		}
		this.updateImageButtons();
		this.updateRevealedImages(type);
	},
	updateImageButtons: function() {
		var imgCount = this.imageList.length;
		var showHideText = 'view';
		this.haltMediaBrowseMode = false;
		if (this.currentImageTab === true) {
			this.haltMediaBrowseMode = true;
			showHideText = 'hide';
		}
		if (typeof this.viewImageButton !== 'undefined') {
			var buttonText = showHideText + ' images ';
			if (!RESUtils.currentSubreddit('dashboard')) buttonText += '(' + imgCount + ')';
			$(this.viewImageButton).text(buttonText);
		}
	},
	updateRevealedImages: function(type) {
		for (var i = 0, len = this.imageList.length; i < len; i++) {
			var image = this.imageList[i];
			if ($(image).hasClass(type) || image.imageLink.expandOnViewAll) {
				this.revealImage(image, this.findImageFilter(image.imageLink));
			}
		}
	},
	findImageFilter: function(image) {
		var isMatched = false;
		if (typeof this.currentImageTab === 'boolean') {
			//booleans indicate show all or nothing
			isMatched = this.currentImageTab;
		} else if (this.currentImageTab in this.customImageTabs) {
			var re = this.customImageTabs[this.currentImageTab];
			isMatched = re.test(image.text);
		}
		//If false then there is no need to go through the NSFW filter
		if (!isMatched) return false;

		image.NSFW = false;
		if (this.options.hideNSFW.value) {
			image.NSFW = /nsfw/i.test(image.text);
		}

		return !image.NSFW;
	},
	findAllImages: function(elem, isSelfText) {
		modules['showImages'].scanningForImages = true;
		if (!elem) {
			elem = document.body;
		}
		// get elements common across all pages first...
		// if we're on a comments page, get those elements too...
		var commentsre = /comments\/[-\w\.\/]/i;
		var userre = /user\/[-\w\.\/]/i;
		modules['showImages'].scanningSelfText = false;
		var allElements = [];
		if (commentsre.test(location.href) || userre.test(location.href)) {
			allElements = elem.querySelectorAll('#siteTable a.title, .expando .usertext-body > div.md a, .content .usertext-body > div.md a');
		} else if (isSelfText) {
			// We're scanning newly opened (from an expando) selftext...
			allElements = elem.querySelectorAll('.usertext-body > div.md a');
			modules['showImages'].scanningSelfText = true;
		} else if (RESUtils.pageType() === 'wiki'){
			allElements = elem.querySelectorAll('.wiki-page-content a');
		} else if (RESUtils.pageType() === 'inbox') {
			allElements = elem.querySelectorAll('#siteTable div.entry .md a');
		} else {
			allElements = elem.querySelectorAll('#siteTable A.title');
		}

		if (RESUtils.pageType() === 'comments') {
			RESUtils.forEachChunked(allElements, 15, 1000, function(element, i, array) {
				modules['showImages'].checkElementForImage(element);
				if (i >= array.length - 1) {
					modules['showImages'].scanningSelfText = false;
					modules['showImages'].scanningForImages = false;
					modules['showImages'].updateImageButtons(modules['showImages'].imageList.length);
				}
			});
		} else {
			var chunkLength = allElements.length;
			for (var i = 0; i < chunkLength; i++) {
				modules['showImages'].checkElementForImage(allElements[i]);
			}
			modules['showImages'].scanningSelfText = false;
			modules['showImages'].scanningForImages = false;
			modules['showImages'].updateImageButtons(modules['showImages'].imageList.length);
		}
	},
	domainModuleMap: {},
	generateDomainModuleMap: function(){
		for(var m in this.siteModules){
			if (!this.siteModules.hasOwnProperty(m)) continue;

			var module = this.siteModules[m];

			// Use module id as name if one is not set
			if(typeof module.name === 'undefined') module.name = m;
			// Add default by default
			if(module.name === 'default'){
				this.domainModuleMap['default'] = module;
				continue;
			} else if (module.name === 'defaultVideo') {
				this.domainModuleMap['defaultVideo'] = module;
				continue;
			} else if (module.name === 'defaultAudio') {
				this.domainModuleMap['defaultAudio'] = module;
				continue;
			}

			// check if module is enabled
			if(this.siteModuleEnabled(module.name)){
				// if so add its domains to the mapping
				for(var d=0; d < module.domains.length; d++){
					this.domainModuleMap[ this.domainToModuleName(module.domains[d]) ] = module;
				}
			}
		}
	},
	siteModuleEnabled: function(site_name) {
		var key = 'display ' + site_name;
		return (typeof this.options[key] === 'undefined') ? true : this.options[key].value;
	},
	domainToModuleName: function(hostname){
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
	},
	checkElementForImage: function(elem) {
		if (this.options.hideNSFW.value) {
			if (elem.classList.contains('title')) {
				elem.NSFW = elem.parentNode.parentNode.parentNode.classList.contains('over18');
			}
		} else {
			elem.NSFW = false;
		}
		var href = elem.href;
		if ((!elem.classList.contains('imgScanned') && (typeof this.imagesRevealed[href] === 'undefined' || !this.options.ignoreDuplicates.value || (RESUtils.currentSubreddit('dashboard'))) && href !== null) || this.scanningSelfText) {
			elem.classList.add('imgScanned');
			this.dupeAnchors++;

			var siteFound = this.siteModules['default'].detect(elem.href.toLowerCase(), elem);
			if (siteFound) {
				elem.site = 'default';
			} else if (this.siteModules['defaultVideo'].detect(elem.href.toLowerCase(), elem)) {
				elem.site = 'defaultVideo';
				siteFound = true;
			} else if (this.siteModules['defaultAudio'].detect(elem.href.toLowerCase(), elem)) {
				elem.site = 'defaultAudio';
				siteFound = true;
			} else {
				var module = this.domainToModuleName(elem.hostname);
				// Check module exists
				if (typeof this.domainModuleMap[module] !== 'undefined') {
					// If its enabled & detect validates, use it
					if (this.domainModuleMap[module].detect(elem.href.toLowerCase(), elem)) {
						elem.site = module;
						siteFound = true;
					}
				}
			}

			if (siteFound && !elem.NSFW) {
				this.imagesRevealed[href] = this.dupeAnchors;
				var siteModule = this.domainModuleMap[elem.site];
				$.Deferred().resolve(elem).then(siteModule.handleLink).then(siteModule.handleInfo).
				then(this.createImageExpando, function() {
					console.error('showImages: error detecting image expando for ' + elem.href);
					console.error.apply(console, arguments);
				});
			}
		} else if (!elem.classList.contains('imgScanned')) {
			var textFrag = document.createElement('span');
			textFrag.setAttribute('class', 'RESdupeimg');
			$(textFrag).html(' <a class="noKeyNav" href="#img' + parseInt(this.imagesRevealed[href], 10) + '" title="click to scroll to original">[RES ignored duplicate link]</a>');
			RESUtils.insertAfter(elem, textFrag);
		}
	},
	createImageExpando: function(elem) {
		var mod = modules['showImages'];
		if (!elem) return false;
		var href = elem.href;
		if (!href) return false;

		// isSelfText indicates if this expando is being created within a
		// selftext expando.
		var isSelfTextExpando = false;
		if (! $(elem).hasClass('title') && RESUtils.pageType() === 'linklist') {
			if ($(elem).closest('.expando').length > 0) {
				isSelfTextExpando = true;
			}
		}
		// This should not be reached in the case of duplicates
		elem.name = 'img' + mod.imagesRevealed[href];

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
			e.preventDefault();
			modules['showImages'].revealImage(e.target, (e.target.classList.contains('collapsedExpando')));
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
		mod.imageList.push(expandLink);

		if ((mod.scanningSelfText || isSelfTextExpando) && mod.options.autoExpandSelfText.value) {
			mod.revealImage(expandLink, true);
		} else if (elem.type === 'IMAGE' || elem.type === 'GALLERY' || (elem.type === 'GENERIC_EXPANDO' && elem.expandOnViewAll === true)) {
			// this may have come from an asynchronous call, in which case it'd get missed by findAllImages, so
			// if all images are supposed to be visible, expand this link now.
			mod.revealImage(expandLink, mod.findImageFilter(expandLink.imageLink));
		}
		if (!mod.scanningForImages) {
			// also since this may have come from an asynchronous call, we need to update the view images count.
			mod.updateImageButtons(mod.imageList.length);
		}
	},
	revealImage: function(expandoButton, showHide) {
		// don't reveal images for invisible buttons (offsetParent is a cheaper way of checking
		// visibility than jquery's .is(':visible'))
		if ((!expandoButton) || (!expandoButton.offsetParent)) {
			return false;
		}
		// showhide = false means hide, true means show!

		var imageLink = expandoButton.imageLink,
			mediaType, mediaTag, associatedImage;

		if (typeof this.domainModuleMap[imageLink.site] === 'undefined') {
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
					modules['showImages'].syncPlaceholder(associatedImage);
				}

				if (isMedia && mediaTag) {
					if (!mediaTag.wasPaused) {
						mediaTag.play();
					}
				}
			}
			this.handleSRStyleToggleVisibility();
		} else if (showHide) {
			//TODO: flash
			switch (imageLink.type) {
				case 'IMAGE':
				case 'GALLERY':
					if (this.options.convertGifstoGfycat.value) {
						var gif = new RegExp('^(http|https|ftp)://.*\\.gif($|/?)');
						if (gif.test(imageLink.src)) {
							if (!imageLink.res_checked) {
								imageLink.res_checked = true;
								this.generateGfycatExpando(expandoButton, {autoplay: true, loop: true, muted: true});
							}
							break;
						}
					}

					this.generateImageExpando(expandoButton);
					break;
				case 'TEXT':
					this.generateTextExpando(expandoButton);
					break;
				case 'IFRAME':
					this.generateIframeExpando(expandoButton);
					break;
				case 'VIDEO':
					this.generateVideoExpando(expandoButton, imageLink.expandoOptions);
					break;
				case 'AUDIO':
					this.generateAudioExpando(expandoButton);
					break;
				case 'NOEMBED':
					this.generateNoEmbedExpando(expandoButton);
					break;
				case 'GENERIC_EXPANDO':
					this.generateGenericExpando(expandoButton, imageLink.expandoOptions);
					break;
			}
		}
		modules['showImages'].updateParentHeight(expandoButton);
	},

	generateImageExpando: function(expandoButton) {
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
			if (this.options.preloadImages.value) {
				this.preloadImages(imageLink.src, 0);
			}
		} else {
			// Only the image is left to display, pack it like a single-image album with no caption or title
			var singleImage = {
				src: imageLink.src,
				href: imageLink.href
			};
			imgDiv.sources[0] = singleImage;
		}

		if ('imageTitle' in imageLink) {
			var header = document.createElement('h3');
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
				var loadAllInAlbum = this.options.loadAllInAlbum.value;
				var dontLoadAlbumsBiggerThan = parseInt(this.options.dontLoadAlbumsBiggerThan.value, 10) || 0;
				if (loadAllInAlbum && (dontLoadAlbumsBiggerThan <= 0 || imgDiv.sources.length <= dontLoadAlbumsBiggerThan)) {
					if (imgDiv.sources.length > 1) {
						var albumLength = ' (' + imgDiv.sources.length + ' images)';
						$(header).append(albumLength);
					}

					for (var imgNum = 0; imgNum < imgDiv.sources.length; imgNum++) {
						addImage(imgDiv, imgNum, this);
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

			case 'IMAGE':
				addImage(imgDiv, which, this);
		}

		function addImage(container, sourceNumber, thisHandle) {
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
			imageAnchor.href = sourceImage.href;
			if (thisHandle.options.openInNewWindow.value) {
				imageAnchor.target = '_blank';
			}

			var image = document.createElement('img');
			$(expandoButton).data('associatedImage', image);
			//Unfortunately it is impossible to use a global event handler for these.
			image.onerror = function() {
				image.classList.add('RESImageError');
			};
			image.onload = function() {
				image.classList.remove('RESImageError');
				if (modules['showImages'].options.displayOriginalResolution.value && this.naturalWidth && this.naturalHeight) {
					this.title = this.naturalWidth + ' × ' + this.naturalHeight + ' px';
				}
			};
			image.classList.add('RESImage');
			image.id = 'RESImage-' + RESUtils.randomHash();
			image.src = sourceImage.src;
			if (modules['showImages'].options.clippy.value) {
				image.title = 'drag to resize or shift+drag to move';
			}
			image.style.maxWidth = thisHandle.options.maxWidth.value + 'px';
			image.style.maxHeight = thisHandle.options.maxHeight.value + 'px';
			imageLink.image = image;
			imageAnchor.appendChild(image);
			thisHandle.makeMediaZoomable(image);
			thisHandle.makeMediaMovable(image);
			thisHandle.trackMediaLoad(imageLink, image);
			paragraph.appendChild(imageAnchor);

			container.appendChild(paragraph);
		}

		//Adjusts the images for the gallery navigation buttons as well as the "n of m" display.

		function adjustGalleryDisplay(topLevel) {
			var source = topLevel.sources[topLevel.currentImage];
			var image = topLevel.querySelector('img.RESImage');
			var imageAnchor = image.parentElement;
			var paragraph = imageAnchor.parentElement;

			// if it's a gif file, blank out the image so there's no confusion about loading...
			if (image.src.toLowerCase().substr(-4) === '.gif') {
				image.src = modules['showImages'].transparentGif;
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
	},
	/**
	 * Recursively loads the images synchronously.
	 */
	preloadImages: function(srcs, i) {
		var _this = this,
			_i = i,
			img = new Image();
		img.onload = img.onerror = function() {
			_i++;
			if (typeof srcs[_i] === 'undefined') {
				return;
			}
			_this.preloadImages(srcs, _i);

			delete img; // Delete the image element from the DOM to stop the RAM usage getting too high.
		};
		img.src = srcs[i].src;
	},
	generateIframeExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		imageLink.wrapperDiv = wrapperDiv;

		wrapperDiv.className = 'madeVisible';
		var iframeNode = document.createElement('iframe');
		iframeNode.setAttribute('width', '600');
		iframeNode.setAttribute('height', '450');
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
	},
	generateTextExpando: function(expandoButton) {
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
		imageLink.src = imageLink.src.replace(/\<iframe/ig, '&lt;iframe');

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
	},
	generateVideoExpando: function(expandoButton, options) {
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
		video.style.maxWidth = this.options.maxWidth.value + 'px';
		video.style.maxHeight = this.options.maxHeight.value + 'px';

		var sourcesHTML = '',
			sources = $(mediaLink).data('sources'),
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
					modules['showImages'].makeMediaZoomable(fallbackImg);
					modules['showImages'].makeMediaMovable(fallbackImg);
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


		this.makeMediaZoomable(video);
		this.makeMediaMovable(video);
		modules['showImages'].trackMediaLoad(mediaLink, video);
	},
	generateAudioExpando: function(expandoButton, options) {
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
		audio.addEventListener('click', modules['showImages'].handleaudioClick);
		audio.setAttribute('controls', '');
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
		}
		// TODO: add mute/unmute control, play/pause control.

		var sourcesHTML = '',
			sources = $(imageLink).data('sources'),
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

		modules['showImages'].trackMediaLoad(imageLink, audio);
	},
	addGfycatVideo: function(info, expandoButton, options) {
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
			directurl: info.url,
		};

		videoData.poster = location.protocol + '//thumbs.gfycat.com/'+info.gfyName+'-poster.jpg';
		if (location.protocol === 'https:') {
			info.webmUrl = info.webmUrl.replace('http:','https:');
			info.mp4Url = info.mp4Url.replace('http:','https:');
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

		new gfyObject(element,info.url,info.frameRate);

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

		modules['showImages'].makeMediaZoomable(video);
		modules['showImages'].syncPlaceholder(video);
		modules['showImages'].trackMediaLoad(imageLink, video);
	},
	handleGfycatSources: function (name, expandoButton, options) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', location.protocol + '//gfycat.com/cajax/get/' + name);

		xhr.onload = function(e) {
			var json = JSON.parse(e.target.responseText);

			modules['showImages'].addGfycatVideo(json.gfyItem, expandoButton, options);
		};

		xhr.onerror = function() {
			modules['showImages'].generateImageExpando(expandoButton);
		};

		xhr.send();
	},
	generateGfycatExpando: function(expandoButton, options) {
		var apiURL = location.protocol + '//upload.gfycat.com/transcodeRelease?fetchUrl=' + encodeURIComponent(expandoButton.imageLink.src);

		var xhr = new XMLHttpRequest();
		xhr.open('GET', apiURL);

		xhr.onload = function(e) {
			try {
				var json = JSON.parse(e.target.responseText);
				if ('gfyName' in json) {
					modules['showImages'].handleGfycatSources(json.gfyName, expandoButton, options);
				} else {
					modules['showImages'].generateImageExpando(expandoButton);
				}
			} catch (error) {
				modules['showImages'].generateImageExpando(expandoButton);
			}
		};

		xhr.onerror = function() {
			modules['showImages'].generateImageExpando(expandoButton);
		};

		xhr.send();
	},

	generateGenericExpando: function(expandoButton, options) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';
		imageLink.wrapperDiv = wrapperDiv;

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var element = options.generate(options);
		imgDiv.appendChild(element);
		wrapperDiv.appendChild(imgDiv);

		expandoButton.addEventListener('click', function(e) {
			if (options.media.blob_type === 'video' || options.media.blob_type === 'audio') {
				var media = wrapperDiv.querySelector('video, audio');
				if (expandoButton.classList.contains('expanded')) {
					if (!media.wasPaused) {
						media.play();
					}
				}
				else {
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

		expandoButton.expandoBox = imgDiv;
		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');
		$(expandoButton).data('associatedImage', video || element);

		if (video) {
			modules['showImages'].makeMediaZoomable(video);
			modules['showImages'].syncPlaceholder(video);
		}

		if (imageLink.onExpandData) {
			imageLink.onExpandData.siteMod.onExpand(imageLink);
		}

		modules['showImages'].trackMediaLoad(imageLink, element);
	},
	generateNoEmbedExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink,
			siteMod = imageLink.siteMod,
			apiURL = '//noembed.com/embed?url=' + encodeURIComponent(imageLink.src),
			def = $.Deferred();

		BrowserStrategy.ajax({
			method: 'GET',
			url: apiURL,
			// aggressiveCache: true,
			onload: function(response) {
				try {
					var json = JSON.parse(response.responseText);
					siteMod.calls[apiURL] = json;
					modules['showImages'].handleNoEmbedQuery(expandoButton, json);
					def.resolve(elem, json);
				} catch (error) {
					siteMod.calls[apiURL] = null;
					def.reject();
				}
			},
			onerror: function(response) {
				def.reject();
			}
		});
	},
	handleNoEmbedQuery: function(expandoButton, response) {
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

		modules['showImages'].trackMediaLoad(imageLink, video);
	},
	visits: [],
	trackVisit: function(link) {
		var $link = $(link).closest('.thing'),
			fullname;

		if (BrowserDetect.isChrome() && chrome.extension.inIncognitoContext) {
			return;
		}

		if ($link.hasClass('visited')) {
			return;
		}

		fullname = $link.data('fullname');

		if (this.sendVisitsThrottle) {
			clearTimeout(this.sendVisitsThrottle);
		}
		this.visits.push(fullname);
		this.sendVisitsThrottle = setTimeout(this.sendVisits, 1000);
	},
	sendVisits: function() {
		var modhash = RESUtils.loggedInUserHash(),
			data = modules['showImages'].visits.join(',');

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
				modules['showImages'].visits = [];
			}
		});
	},
	trackMediaLoad: function(link, media) {
		if (modules['showImages'].options.markVisited.value) {
			// also use reddit's mechanism for storing visited links if user has gold.
			if ($('body').hasClass('gold')) {
				this.trackVisit(link);
			}
			var isNSFW = $(link).closest('.thing').is('.over18');
			var sfwMode = modules['showImages'].options['sfwHistory'].value;

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
				modules['showImages'].imageTrackStack.push(url);
				if (modules['showImages'].imageTrackStack.length === 1) setTimeout(modules['showImages'].imageTrackShift, 300);
			}
		}

		media.addEventListener('load', function(e) {
			$(e.target).data('loaded', true);
			$(e.target).closest('a.madeVisible').removeClass('csspinner');
			modules['showImages'].handleSRStyleToggleVisibility(e.target);
		}, false);
	},
	imageTrackShift: function() {
		var url = modules['showImages'].imageTrackStack.shift();
		if (typeof url === 'undefined') {
			modules['showImages'].handleSRStyleToggleVisibility();
			return;
		}

		BrowserStrategy.addURLToHistory(url);
		modules['showImages'].imageTrackShift();
	},
	dragTargetData: {
		//numbers just picked as sane initialization values
		imageWidth: 100,
		diagonal: 0, //zero to represent the state where no the mouse button is not down
		dragging: false
	},
	moveTargetData: {
		moving: false, // Whether the image should move with the mouse or not
		mouseLastPos: [0, 0], // Last position of the mouse. Used to calculate deltaX and deltaY for our move.
		hasMoved: false // If true we will stop click events on the image
	},
	getDragSize: function(e) {
		var rc = e.target.getBoundingClientRect(),
			p = Math.pow,
			dragSize = p(p(e.clientX - rc.left, 2) + p(e.clientY - rc.top, 2), 0.5);

		return Math.round(dragSize);
	},
	handleSRStyleToggleVisibility: function(image) {
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
	},
	setPlaceholder: function(mediaTag) {
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
			mediaTag.addEventListener('loadeddata', modules['showImages'].handleMediaLoad);
		} else {
			mediaTag.addEventListener('load', modules['showImages'].handleMediaLoad);
		}
	},
	handleMediaLoad: function() {
		// don't do this twice (e.g. on image reload from cache), as we get bad height/width data.
		if ($(this).data('loaded')) {
			return;
		}
		modules['showImages'].syncPlaceholder(this);

		if(! this.tagName) { //validation to fix issue #1672
			return;
		}
		$(this).data('loaded', true);
		if (this.tagName !== 'VIDEO') {
			this.style.position = 'absolute';
		} else {
			var $resPlayer = $(this.parentNode).closest('.res-player');
			$resPlayer[0].style.position = 'absolute';
		}
	},
	syncPlaceholder: function(e) {
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
		modules['showImages'].updateParentHeight(ele);
	},
	makeMediaZoomable: function (mediaTag) {
		if (this.options.imageZoom.value) {
			modules['showImages'].setPlaceholder(mediaTag);

			mediaTag.addEventListener('mousedown', modules['showImages'].mousedownMedia, false);
			mediaTag.addEventListener('mouseup', modules['showImages'].dragMedia, false);
			mediaTag.addEventListener('mousemove', modules['showImages'].dragMedia, false);
			mediaTag.addEventListener('mouseout', modules['showImages'].mouseoutMedia, false);

			// click event is unneeded for HTML5 video -- but allow Gfycat, giphy and gifyoutube to follow gif behaviour
			if (mediaTag.tagName !== 'VIDEO' || mediaTag.className.indexOf('gfyRVid') !== -1 || mediaTag.className.indexOf('giphyVid') !== -1 || mediaTag.className.indexOf('gifyoutubeVid') !== -1 || mediaTag.className.indexOf('imgurgifvVid') !== -1) {
				mediaTag.addEventListener('click', modules['showImages'].clickMedia, false);
			}
		}
	},
	makeMediaMovable: function(mediaTag) {
		if (this.options.imageMove.value) {
			// We can add duplicates safely without checking if makeMediaZoomable already added them
			// because duplicate EventListeners are discarded
			// See: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
			mediaTag.addEventListener('mousedown', modules['showImages'].mousedownMedia, false);
			// The click event fires after the mouseup event, and it is the click event that triggers link following.
			// Therefore preventing this event and not mouseup.
			// If we haven't moved we should not prevent the default behaviour
			mediaTag.addEventListener('click', function (e) {
				if(modules['showImages'].moveTargetData.moving && modules['showImages'].moveTargetData.hasMoved) {
					modules['showImages'].moveTargetData.moving = false;
					e.preventDefault();
				}
			}, false);
			mediaTag.addEventListener('mousemove', modules['showImages'].checkMoveMedia, false);
			mediaTag.addEventListener('mouseout', function (e) {
				modules['showImages'].moveTargetData.moving = false;
			}, false);
			// Set this so the image is displayed above the "Set tag" buttons
			mediaTag.style.zIndex = 1;
		}
	},
	mousedownMedia: function(e) {
		if (e.button === 0) {
			if(!e.shiftKey) {
				if (e.target.tagName === 'VIDEO' && e.target.hasAttribute('controls')) {
					var rc = e.target.getBoundingClientRect();
					// ignore drag if click is in control area (40 px from bottom of video)
					if ((rc.height - 40) < (e.clientY - rc.top)) {
						return true;
					}
				}
				if (!e.target.minWidth) e.target.minWidth = Math.max(1, Math.min($(e.target).width(), 100));
				modules['showImages'].dragTargetData.imageWidth = $(e.target).width();
				modules['showImages'].dragTargetData.diagonal = modules['showImages'].getDragSize(e);
				modules['showImages'].dragTargetData.dragging = false;
				modules['showImages'].dragTargetData.hasChangedWidth = false;
			} else {
				// Record where the move began, both for the cursor and the image
				modules['showImages'].moveTargetData.moving = true;
				modules['showImages'].moveTargetData.hasMoved = false;
				modules['showImages'].moveTargetData.mouseLastPos = [e.clientX, e.clientY];
			}
			e.preventDefault();
		}
	},
	mouseoutMedia: function(e) {
		modules['showImages'].dragTargetData.diagonal = 0;
	},
	dragMedia: function(e) {
		if (modules['showImages'].dragTargetData.diagonal) {
			var newDiagonal = modules['showImages'].getDragSize(e),
				oldDiagonal = modules['showImages'].dragTargetData.diagonal,
				imageWidth = modules['showImages'].dragTargetData.imageWidth,
				maxWidth = Math.max(e.target.minWidth, newDiagonal / oldDiagonal * imageWidth);

			if (Math.abs(newDiagonal - oldDiagonal) > 5 && e.target.tagName == 'VIDEO') {
				e.target.preventPlayPause = true;
			}

			modules['showImages'].resizeMedia(e.target, maxWidth);
			modules['showImages'].dragTargetData.dragging = true;
		}
		modules['showImages'].handleSRStyleToggleVisibility(e.target);
		if (e.type === 'mouseup') {
			modules['showImages'].dragTargetData.diagonal = 0;
		}
	},
	checkMoveMedia: function(e) {
		if(modules['showImages'].moveTargetData.moving) {
			var deltaX = e.clientX - modules['showImages'].moveTargetData.mouseLastPos[0],
				deltaY = e.clientY - modules['showImages'].moveTargetData.mouseLastPos[1];
			modules['showImages'].moveMedia(e.target, deltaX, deltaY);

			modules['showImages'].moveTargetData.mouseLastPos[0] = e.clientX;
			modules['showImages'].moveTargetData.mouseLastPos[1] = e.clientY;
			modules['showImages'].moveTargetData.hasMoved = true;
		}
	},
	moveMedia: function(ele, deltaX, deltaY) {
		$(ele).css('margin-left', parseInt($(ele).css('margin-left'), 10) + deltaX);
		$(ele).css('margin-top', parseInt($(ele).css('margin-top'), 10) + deltaY);

		if (ele.tagName !== 'VIDEO') {
			ele.style.position = 'absolute';
		} else {
			// get the div.res-player and sync it too
			var $resPlayer = $(ele.parentNode).closest('.res-player');
			$resPlayer[0].style.position = 'absolute';
		}

		modules['showImages'].syncPlaceholder(ele);
	},
	clickMedia: function(e) {
		modules['showImages'].dragTargetData.diagonal = 0;
		if (modules['showImages'].dragTargetData.hasChangedWidth) {
			modules['showImages'].dragTargetData.dragging = false;
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
		modules['showImages'].dragTargetData.hasChangedWidth = false;
	},
	resizeMedia: function(ele, newWidth) {
		var currWidth = $(ele).width();
		if (newWidth !== currWidth) {
			modules['showImages'].dragTargetData.hasChangedWidth = true;

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

			modules['showImages'].syncPlaceholder(ele);
		}
	},
	updateParentHeight: function(ele) {
		if (this.options.autoMaxHeight.value && ele) {
			var parent = $(ele).closest('.md')[0],
				type = $(parent).closest('body:not(.comments-page) .expando')[0] || $(parent).closest('.thing')[0];
			if (parent && (type.classList.contains('expando') || type.classList.contains('comment'))) {
				var placeholders = $(parent).find('.expando-button.expanded + * .RESImagePlaceholder, .expando-button.expanded + * > *:not(p)'),
					height = 0,
					tempHeight,
					selfMax = parseInt(this.options.selfTextMaxHeight.value, 10),
					commentMax = parseInt(this.options.commentMaxHeight.value, 10);

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
	},
	siteModules: {
		'default': {
			domains: [],
			acceptRegex: /^[^#]+?\.(gif|jpe?g|png)(?:[?&#_].*|$)/i,
			rejectRegex: /(?:wikipedia\.org\/wiki|(?:i\.|m\.)?imgur\.com|photobucket\.com|gifsound\.com|mediacru\.sh|gfycat\.com|\/wiki\/File:.*|reddit\.com|onedrive\.live\.com|500px\.(?:com|net|org)|(?:www\.|share\.)?gifyoutube\.com)/i,
			detect: function(href, elem) {
				var siteMod = modules['showImages'].siteModules['default'];
				return (siteMod.acceptRegex.test(href) && !siteMod.rejectRegex.test(href));
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var href = elem.href;

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
				elem.href = info.src;

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
			detect: function (href, elem) {
				var siteMod = modules['showImages'].siteModules['defaultVideo'];
				return (siteMod.acceptRegex.test(href) && !siteMod.rejectRegex.test(href));
			},
			handleLink: function (elem) {
				var def = $.Deferred();
				var siteMod = modules['showImages'].siteModules['defaultVideo'];
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
			handleInfo: function (elem, info) {
				elem.expandoOptions = {
					autoplay: false,
					loop: false
				};
				sources = [];
				sources[0] = {
					'file': info['src'],
					'type': info['format']
				};

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
			detect: function (href, elem) {
				var siteMod = modules['showImages'].siteModules['defaultAudio'];
				return (siteMod.acceptRegex.test(href) && !siteMod.rejectRegex.test(href));
			},
			handleLink: function (elem) {
				var def = $.Deferred();
				var siteMod = modules['showImages'].siteModules['defaultAudio'];
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
				sources = [];
				sources[0] = {
					'file': info['src'],
					'type': info['format']
				};

				elem.type = 'AUDIO';
				$(elem).data('sources', sources);
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		imgur: {
			domains: ['imgur.com'],
			options: {
				'prefer RES albums': {
					description: 'Prefer RES support for imgur albums rather than reddit\'s built in support',
					value: true,
					type: 'boolean'
				}
			},
			APIKey: 'fe266bc9466fe69aa1cf0904e7298eda',
			// hashRe: /^https?:\/\/(?:i\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)?([\w]{5,}(?:[&,][\w]{5,})?)(\..+)?(?:#(\d*))?$/i,
			// the modified regex below fixes detection of "edited" imgur images, but imgur's edited images are broken right now actually, falling into
			// a redirect loop.  preserving the old one just in case.  however it also fixes detection of the extension (.jpg, for example) which
			// was too greedy a search...
			// the hashRe below was provided directly by MrGrim (well, everything after the domain was), using that now.
			// in addition to the above, the album index was moved out of the first capture group.
			hashRe: /^https?:\/\/(?:i\.|m\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)*(?!gallery)(?!removalrequest)(?!random)(?!memegen)([\w]{5,7}(?:[&,][\w]{5,7})*)(?:#\d+)?[sbtmlh]?(\.(?:jpe?g|gif|png|gifv))?(\?.*)?$/i,
			albumHashRe: /^https?:\/\/(?:i\.|m\.)?imgur\.com\/(?:a|gallery)\/([\w]+)(\..+)?(?:\/)?(?:#?\w*)?$/i,
			apiPrefix: 'https://api.imgur.com/2/',
			calls: {},
			detect: function(href, elem) {
				return href.indexOf('imgur.com/') !== -1;
			},
			handleLink: function(elem) {
				var siteMod = modules['showImages'].siteModules['imgur'],
					def = $.Deferred(),
					href = elem.href.split('?')[0],
					groups = siteMod.hashRe.exec(href),
					extension,
					albumGroups;

				if (!groups) {
					albumGroups = siteMod.albumHashRe.exec(href);
				}

				if (groups && !albumGroups) {
					// handling for separated list of IDs
					if (groups[1].search(/[&,]/) > -1) {
						var hashes = groups[1].split(/[&,]/);
						def.resolve(elem, {
							album: {
								images: hashes.map(function(hash) {
									return {
										image: {
											title: '',
											caption: '',
											hash: hash
										},
										links: {
											original: location.protocol + '//i.imgur.com/' + hash + '.jpg'
										}
									};
								})
							}
						});
					} else {
						// removed caption API calls as they don't seem to exist/matter for single images, only albums...
						//If we don't show captions, then we can skip the API call.
						extension = groups[2] || '.jpg';
						if (extension === '.gifv' || extension === '.gif') {
							// remove the default reddit expando button
							$(elem).closest('.entry').find('.expando-button.video').remove();

							def.resolve(elem, {
								gifv: {
									webmUrl: location.protocol + '//i.imgur.com/' + groups[1] + '.webm',
									mp4Url: location.protocol + '//i.imgur.com/' + groups[1] + '.mp4',
									gifUrl: location.protocol + '//i.imgur.com/' + groups[1] + '.gif',
									downloadUrl: location.protocol + '//i.imgur.com/download/' + groups[1],
									image: {}
								}
							});
						} else {
							def.resolve(elem, {
								image: {
									links: {
										//Imgur doesn't really care about the extension and the browsers don't seem to either.
										original: location.protocol + '//i.imgur.com/' + groups[1] + extension
									},
									image: {}
								}
							});
						}
					}
				} else if (albumGroups && !albumGroups[2]) {
					// on detection, if "prefer RES albums" is checked, hide any existing expando...
					// we actually remove it from the DOM for a number of reasons, including the
					// fact that many subreddits style them with display: block !important;, which
					// overrides a "hide" call here.
					if (modules['showImages'].options['prefer RES albums'].value === true) {
						$(elem).closest('.entry').find('.expando-button.video').remove();
						var apiURL = siteMod.apiPrefix + 'album/' + encodeURIComponent(albumGroups[1]) + '.json';
						elem.imgHash = albumGroups[1];
						if (apiURL in siteMod.calls) {
							if (siteMod.calls[apiURL] != null) {
								def.resolve(elem, siteMod.calls[apiURL]);
							} else {
								def.reject();
							}
						} else {
							BrowserStrategy.ajax({
								method: 'GET',
								url: apiURL,
								// aggressiveCache: true,
								onload: function(response) {
									if (response.status === 404) {
										return def.reject();
									}
									try {
										var json = JSON.parse(response.responseText);
										siteMod.calls[apiURL] = json;
										def.resolve(elem, json);
									} catch (error) {
										siteMod.calls[apiURL] = null;
										def.reject();
									}
								},
								onerror: function(response) {
									def.reject();
								}
							});
						}
					} else {
						// do not use RES's album support...
						return def.reject();
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				if ('image' in info) {
					return modules['showImages'].siteModules['imgur'].handleSingleImage(elem, info);
				} else if ('album' in info) {
					return modules['showImages'].siteModules['imgur'].handleGallery(elem, info);
				} else if ('gifv' in info) {
					return modules['showImages'].siteModules['imgur'].handleGifv(elem, info.gifv);
				} else if (info.error && info.error.message === 'Album not found') {
					// This case comes up when there is an imgur.com/gallery/HASH link that
					// links to an image, not an album (not to be confused with the word "gallery", ugh)
					info = {
						image: {
							links: {
								original: location.protocol + '//i.imgur.com/' + elem.imgHash + '.jpg'
							},
							image: {}
						}
					};
					return modules['showImages'].siteModules['imgur'].handleSingleImage(elem, info);
				} else {
					return $.Deferred().reject().promise();
					// console.log('ERROR', info);
					// console.log(arguments.callee.caller);
				}
			},
			handleSingleImage: function(elem, info) {
				if (location.protocol === 'https:') {
					info.image.links.original = info.image.links.original.replace('http:','https:');
				}
				elem.src = info.image.links.original;
				elem.href = info.image.links.original;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				elem.type = 'IMAGE';
				if (info.image.image.caption) elem.caption = info.image.image.caption;
				return $.Deferred().resolve(elem).promise();
			},
			handleGallery: function(elem, info) {
				var base = elem.href.split('#')[0];
				elem.src = info.album.images.map(function(e, i, a) {
					if (location.protocol === 'https:') {
						e.links.original = e.links.original.replace('http:','https:');
					}
					return {
						title: e.image.title,
						src: e.links.original,
						href: base + '#' + e.image.hash,
						caption: e.image.caption
					};
				});
				if (elem.hash) {
					var hash = elem.hash.slice(1);
					if (isNaN(hash)) {
						for (var i = 0; i < elem.src.length; i++) {
							if (hash == info.album.images[i].image.hash) {
								elem.galleryStart = i;
								break;
							}
						}
					} else {
						elem.galleryStart = parseInt(hash, 10);
					}
				}
				elem.imageTitle = info.album.title;
				elem.caption = info.album.description;
				elem.type = 'GALLERY';
				return $.Deferred().resolve(elem).promise();
			},
			handleGifv: function(elem, info) {
				RESTemplates.load('imgurgifvUI');

				var generate = function(options) {
					var template = RESTemplates.getSync('imgurgifvUI');
					var video = {
						loop: true,
						autoplay: true, // imgurgifv will always be muted, so autoplay is OK
						muted: true,
						directurl: elem.href,
						downloadurl: info.downloadUrl,
					};
					video.sources = [
						{
							'source': info.webmUrl,
							'type': 'video/webm',
							'class': 'imgurgifvwebmsrc'
						},
						{
							'source': info.mp4Url,
							'type': 'video/mp4',
							'class': 'imgurgifvmp4src'
						},
					];
					var element = template.html(video)[0],
						v = element.querySelector('video');

					// set the max width to the width of the entry area
					v.style.maxWidth = $(elem).closest('.entry').width() + 'px';
					new window.imgurgifvObject(element, elem.href, info.gifUrl);
					return element;
				};
				elem.type = 'GENERIC_EXPANDO';
				elem.subtype = 'VIDEO';
				// open via 'view all images'
				elem.expandOnViewAll = true;
				elem.expandoClass = ' video-muted';

				elem.expandoOptions = {
					generate: generate,
					media: info
				};

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		gfycat: {
			domains: ['gfycat.com'],
			calls: {},
			detect: function(href, elem) {
				return href.indexOf('gfycat.com') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^https?:\/\/(?:[\w]+.)?gfycat\.com\/(\w+)(?:\.gif)?/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);

				if (!groups) return def.reject();
				var href = elem.href.toLowerCase();


				var siteMod = modules['showImages'].siteModules['gfycat'];
				var apiURL = location.protocol + '//gfycat.com/cajax/get/' + encodeURIComponent(groups[1]);

				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						siteMod.calls[apiURL] = null;
						def.reject();
					}
				} else {
					BrowserStrategy.ajax({
						method: 'GET',
						url: apiURL,
						aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
								json.gfyItem.src = elem.href;
								siteMod.calls[apiURL] = json;
								def.resolve(elem, json.gfyItem);
							} catch (error) {
								siteMod.calls[apiURL] = null;
								def.reject();
							}
						},
						onerror: function(response) {
							def.reject();
						}
					});
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {

				RESTemplates.load('GfycatUI');

				var generate = function(options) {
					var template = RESTemplates.getSync('GfycatUI');
					var video = {
						loop: true,
						autoplay: true, // gfycat always has muted or no auto, so autoplay is OK
						muted: true,
						directurl: elem.href,
					};
					video.poster = location.protocol + '//thumbs.gfycat.com/'+info.gfyName+'-poster.jpg';
					// gfycat returns http:// even if the request came over https://, so let's swap it out
					if (location.protocol === 'https:') {
						info.webmUrl = info.webmUrl.replace('http:','https:');
						info.mp4Url = info.mp4Url.replace('http:','https:');
					}
					video.sources = [
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
					var element = template.html(video)[0],
						v = element.querySelector('video');

					// set the max width to the width of the entry area
					v.style.maxWidth = $(elem).closest('.entry').width() + 'px';
					new window.gfyObject(element,elem.href,info.frameRate);
					return element;
				};
				elem.type = 'GENERIC_EXPANDO';
				elem.subtype = 'VIDEO';
				// open via 'view all images'
				elem.expandOnViewAll = true;
				elem.expandoClass = ' video-muted';

				elem.expandoOptions = {
					generate: generate,
					media: info
				};

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				return $.Deferred().resolve(elem).promise();
			}
		},
		gifyoutube: {
			domains: ['gifyoutube.com', 'gifyt.com'],
			calls: {},
			detect: function(href, elem) {
				return (href.indexOf('gifyoutube.com') !== -1 || href.indexOf('gifyt.com') !== -1);
			},
			handleLink: function(elem) {
				// for share.gifyoutube.com links, that's going to be a direct piece of media,
				// if it ends in GIF, just swap it to webm.
				var hashRe = /^https?:\/\/(?:beta\.|www\.)?(?:gifyoutube|gifyt)\.com\/gif\/(\w+)\.?/i,
					def = $.Deferred(),
					groups = hashRe.exec(elem.href),
					href = elem.href.toLowerCase(),
					siteMod = modules['showImages'].siteModules['gifyoutube'],
					beta = '',
					proto = location.protocol,
					apiURL;


				if (!groups) {
					hashRe = /^https?:\/\/share\.gifyoutube\.com\/(\w+)\.gif/i;
					groups = hashRe.exec(elem.href);

					if (!groups) {
						return def.reject();
					}
				}
				if (href.indexOf('beta.') !== -1) {
					beta = 'beta.';
					proto = 'http:'; // beta doesn't support https yet
				}
				apiURL = proto + beta + 'gifyoutube.com/api/' + encodeURIComponent(groups[1]);
				elem.onExpandData = {
					siteMod: siteMod,
					apiURL: apiURL
				};

				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						siteMod.calls[apiURL] = null;
						def.reject();
					}
				} else {
					info = {
						gifUrl: 'http://share.gifyoutube.com/' + groups[1] + '.gif',
						webmUrl: 'http://share.gifyoutube.com/' + groups[1] + '.webm',
						mp4Url: 'http://share.gifyoutube.com/' + groups[1] + '.mp4',
						original: elem.href
					}
					def.resolve(elem, info);
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {

				RESTemplates.load('gifyoutubeUI');

				var generate = function(options) {
					var template = RESTemplates.getSync('gifyoutubeUI');
					var video = {
						loop: true,
						autoplay: true, // gifyoutube will always be muted, so autoplay is OK
						muted: true,
						directurl: elem.href,
					};
					video.sources = [
						{
							'source': info.webmUrl,
							'type': 'video/webm',
							'class': 'gifyoutubewebmsrc'
						},
						{
							'source': info.mp4Url,
							'type': 'video/mp4',
							'class': 'gifyoutubemp4src'
						},
					];
					var element = template.html(video)[0],
						v = element.querySelector('video');

					// set the max width to the width of the entry area
					v.style.maxWidth = $(elem).closest('.entry').width() + 'px';
					new window.gifyoutubeObject(element, elem.href, info.gifUrl);
					return element;
				};
				elem.type = 'GENERIC_EXPANDO';
				elem.subtype = 'VIDEO';
				// open via 'view all images'
				elem.expandOnViewAll = true;
				elem.expandoClass = ' video-muted';

				elem.expandoOptions = {
					generate: generate,
					media: info
				};

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			},
			onExpand: function(mediaLink) {
				var data = mediaLink.onExpandData;

				if (!data.apiURL) {
					return;
				}
				var apiURL = data.apiURL,
					siteMod = data.siteMod;

				BrowserStrategy.ajax({
					method: 'GET',
					url: data.apiURL,
					aggressiveCache: true,
					onload: function(response) {
						try {
							var json = JSON.parse(response.responseText);

							siteMod.calls[apiURL] = json;
							mediaLink.wrapperDiv.querySelector('.gifyoutube-source-button').href = json.sauce;

						} catch (error) {
							siteMod.calls[apiURL] = null;
						}
					},
					onerror: function(response) {
						siteMod.calls[apiURL] = null;
					}
				});
			}
		},
		vidble: {
			domains: ['vidble.com'],
			calls: {},
			detect: function(href, elem) {
				return href.indexOf('vidble.com') > 0;
			},
			handleLink: function(elem) {
				var def = $.Deferred(),
					hashRe = /^https?:\/\/(?:www\.)?vidble.com\/show\/([a-z0-9]+)/i,
					albumHashRe = /^https?:\/\/(?:www\.)?vidble.com\/album\/([a-z0-9]+)/i,
					apiPrefix = location.protocol + '//vidble.com/album/',
					siteMod = modules['showImages'].siteModules['vidble'],
					groups = hashRe.exec(elem.href);

				if (groups) {
					def.resolve(elem, location.protocol + '//vidble.com/' + groups[1] + '_med.jpg');
				} else {
					albumGroups = albumHashRe.exec(elem.href);
					if (albumGroups) {
						var apiURL = apiPrefix + 'album/' + encodeURIComponent(albumGroups[1]) + '?json=1';
						elem.imgHash = albumGroups[1];

						if (apiURL in siteMod.calls) {
							if (siteMod.calls[apiURL] != null) {
								def.resolve(elem, siteMod.calls[apiURL]);
							} else {
								def.reject();
							}
						} else {
							BrowserStrategy.ajax({
								method: 'GET',
								url: apiURL,
								// aggressiveCache: true,
								onload: function(response) {
									if (response.status === 404) {
										return def.reject();
									}
									try {
										var json = JSON.parse(response.responseText);
										siteMod.calls[apiURL] = json;
										def.resolve(elem, json);
									} catch (error) {
										siteMod.calls[apiURL] = null;
										def.reject();
									}
								},
								onerror: function(response) {
									def.reject();
								}
							});
						}
					}
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				if (typeof info === 'string') {
					// direct image link
					elem.type = 'IMAGE';
					elem.src = info;
					elem.href = info;
					if (RESUtils.pageType() === 'linklist') {
						$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
					}
				} else {
					// album link
					modules['showImages'].siteModules['vidble'].handleGallery(elem, info);
				}
				return $.Deferred().resolve(elem).promise();
			},
			handleGallery: function(elem, info) {
				var base = elem.href.split('#')[0];
				elem.src = info.pics.map(function(e, i, a) {
					return {
						src: location.protocol + e,
						href: location.protocol + e
					};
				});
				elem.type = 'GALLERY';
				return $.Deferred().resolve(elem).promise();
			}
		},
		fitbamob: {
			domains: ['fitbamob.com','offsided.com'],
			calls: {},
			detect: function(href, elem) {
				return href.indexOf('fitbamob.com') !== -1 || href.indexOf('offsided.com') !== -1 ;
			},
			handleLink: function(elem) {
				var hashRe = /r\/[a-zA-Z0-9]+\/([a-zA-Z0-9]+[\/]*$)|b\/([a-zA-Z0-9]+[\/]*$)|v\/([a-zA-Z0-9]+[\/]*$)/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);

				if (!groups) return def.reject();
				var href = elem.href.toLowerCase();

				var siteMod = modules['showImages'].siteModules['fitbamob'];
				var link_id;
				if (typeof groups[1] !== 'undefined'){
					link_id = encodeURIComponent(groups[1]);
				} else if (typeof groups[2] !== 'undefined') {
					link_id = encodeURIComponent(groups[2]);
				} else {
					link_id = encodeURIComponent(groups[3]);
				}
				var apiURL = location.protocol + '//fitbamob.com/link/' + link_id + '/?format=json';

				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						siteMod.calls[apiURL] = null;
						def.reject();
					}
				} else {
					BrowserStrategy.ajax({
						method: 'GET',
						url: apiURL,
						aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
								siteMod.calls[apiURL] = json;
								def.resolve(elem, json);
							} catch (error) {
								siteMod.calls[apiURL] = null;
								def.reject();
							}
						},
						onerror: function(response) {
							def.reject();
						}
					});
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				RESTemplates.load('VideoUI');
				var generate = function(options) {
					var template = RESTemplates.getSync('VideoUI');
					var video = {
						loop: true,
						autoplay: true, // fitbamob is gfycat-based, thus also muted / no audio, so autoplay is OK
						muted: true,
						brand: {
							'url': elem.href,
							'name': 'Fitbamob',
							'img': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAkCAYAAABxE+FXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAzFJREFUeNrsmHtojXEYx9/XGZKQ5rJcSi4ZMVJESrknt1yK8sdcllxCQikjiRkr4g+WESK3cp0tsfKHFCn3lQl/KCv+sGU222w7vk++Pz1+fud9T9uZ8wdPfXbO+b3veZ/fc/k9z3PmR6NRL1nSxkuipMgff2OJXksFy8FE0AG0xDU+aAQvwSnw1FyIHpzyU7mSseAy6JVgIyeD9SAb5PxmOaUfuAZ6BjykAXwATda6eKcd6E1rzVo56M5rsr4HVIIToM7EPA3sDFHs0X3pYAgYqhhMr1Wqe8WQPmCf9YxdIFNbPgqMi8N9GeCJ7FpZ6NETnUBXtRaxXnVODdLKU60vBp2O9DjjPIdu7+a41tGOuZ3VTYxxSyTN8tCfR81SXAXWgIdU7rdwA5Jsc0FuLOVa5KidTfBRewUWgNFhFe5jKxW0z/GU1wbvL0lSa/t/5X4CjlSzlUu5rOB5r2klXVXU8wVU63N+FdziZmpbSflS0JYG1mvl30nQUOA7Wmksb7ruq45V4bazAtWzHK4CD6y6n8+2GeQZaRinQZ5jXSpnD/ANnATHjXJZHKFuzrKUm16+Mg7LnznWpLZP53vZ/E2dcG/AV3XzTNP2lJTEobiOm7QlU72vNaXWKJcOVmq1wknWA16DshDl99jD7QFkqvpcZgZJo/wxKHYMk1oaeSqC5IZjbYJVQ4o5Df1KOEm0i2AbE85MItmq16fQgiLuvL3avDSjgWATuA7e8/4BYJFSLHou2EfNuKMArOXnYUweydLz6jTMCrBcNn8b3AHzQBejiFLA8Dlre47qu+LiS2AheM6pMyvE7XkcJMdzTBbLZ/BahZ7ZXcrL+WtF5AzYDYaD/oznshDlWxlPmYaPgk/UISV7hZ2MrjFKYrYaHKOLSvmldeAtuM+Z3MQ8wpiPofKR6lky0xeCLa5kTYlhQT4T6AVYwpjLBvbyIe9YpyPcgM8fHIUqpovBOXAAHAmaXl2yGdwFhxnvXMbSYxhcIlZv4PQrG5vN09GsYaKIMZd6vR9MC7m/L9jBfMkIUhxmuZEaJt4hMJ/jr7i4M2tCPXu0TL2PwBX27vDfz//sfyZ+CDAAXXm2zpHEcnIAAAAASUVORK5CYII='
						}
					};
					if (location.protocol === 'https:') {
						info.webm_url = info.webm_url.replace('http:','https:');
						info.mp4_url = info.mp4_url.replace('http:','https:');
					}
					video.sources = [
						{
							'source': info.mp4_url,
							'type': 'video/mp4'
						},
						{
							'source': info.webm_url,
							'type': 'video/webm'
						}
					];
					var element = template.html(video)[0];
					new MediaPlayer(element);
					return element;
				};

				elem.type = 'GENERIC_EXPANDO';
				elem.expandoClass = ' video';
				elem.expandoOptions = {
					generate: generate,
					media: info
				};

				return $.Deferred().resolve(elem).promise();
			}
		},
		giflike: {
			domains: ['giflike.com'],
			acceptRegex: /^https?:\/\/(?:\w+\.)?giflike\.com\/(?:a\/)?(\w{7})(?:\/.*)?/i,
			detect: function (href, elem) {
				var siteMod = modules['showImages'].siteModules['giflike'];
				return siteMod.acceptRegex.test(href);
			},
			handleLink: function (elem) {
				var def = $.Deferred();
				var siteMod = modules['showImages'].siteModules['giflike'];
				var groups = siteMod.acceptRegex.exec(elem.href);
				if (groups) {
					def.resolve(elem, {
						videoId: groups[1]
					});
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function (elem, info) {
				elem.expandoOptions = {
					autoplay: true, // Giflike only supports muted videos.
					loop: true // Loops since it's gif-like, short form.
				};

				sources = [];
				sources[0] = {
					'file': 'http://i.giflike.com/' + info.videoId + '.webm',
					'type': 'video/webm'
				};
				sources[1] = {
					'file': 'http://i.giflike.com/' + info.videoId + '.mp4',
					'type': 'video/mp4'
				};
				sources[2] = {
					'file': 'http://i.giflike.com/' + info.videoId + '.gif',
					'type': 'image/gif'
				};

				elem.type = 'VIDEO';
				$(elem).data('sources', sources);
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		ctrlv: {
			name: 'CtrlV.in',
			domains: ['ctrlv.in'],
			detect: function(href, elem) {
				return elem.href.toLowerCase().indexOf('ctrlv.in/') !== -1;
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/((m|www)\.)?ctrlv\.in\/([0-9]+)/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, {
						type: 'IMAGE',
						src: 'http://img.ctrlv.in/id/' + groups[3],
						href: elem.href
					});
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();

				elem.type = info.type;
				elem.src = info.src;
				elem.href = info.href;

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				def.resolve(elem);
				return def.promise();
			}
		},
		snag: {
			name: 'snag.gy',
			domains: ['snag.gy'],
			detect: function(href, elem) {
				return href.indexOf('snag.gy/') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var href = elem.href;
				var extensions = ['.jpg', '.png', '.gif'];
				if (href.indexOf('i.snag') === -1) href = href.replace('snag.gy', 'i.snag.gy');
				if (extensions.indexOf(href.substr(-4)) === -1) href = href + '.jpg';
				def.resolve(elem, {
					src: href
				});
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		picshd: {
			domains: ['picshd.com'],
			detect: function(href, elem) {
				return href.indexOf('picshd.com/') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^https?:\/\/(?:i\.|edge\.|www\.)*picshd\.com\/([\w]{5,})(\..+)?$/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, 'http://i.picshd.com/' + groups[1] + '.jpg');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		minus: {
			name: 'min.us',
			domains: ['min.us'],
			calls: {},
			detect: function(href, elem) {
				return href.indexOf('min.us') !== -1 && href.indexOf('blog.') === -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred(),
					imgRe = /\.(jpg|jpeg|gif|png)/i,
					hashRe = /^http:\/\/min\.us\/([\w]+)(?:#[\d+])?$/i,
					href = elem.href.split('?')[0],
					//TODO: just make default run first and remove this
					getExt = href.split('.'),
					ext = (getExt.length > 1 ? getExt[getExt.length - 1].toLowerCase() : '');
				if (imgRe.test(ext)) {
					var groups = hashRe.exec(href);
					if (groups && !groups[2]) {
						var hash = groups[1];
						if (hash.substr(0, 1) === 'm') {
							var apiURL = 'http://min.us/api/GetItems/' + encodeURIComponent(hash);
							var calls = modules['showImages'].siteModules['minus'].calls;
							if (apiURL in calls) {
								if (calls[apiURL] != null) {
									def.resolve(elem, calls[apiURL]);
								} else {
									def.reject();
								}
							} else {
								BrowserStrategy.ajax({
									method: 'GET',
									url: apiURL,
									onload: function(response) {
										try {
											var json = JSON.parse(response.responseText);
											modules['showImages'].siteModules['minus'].calls[apiURL] = json;
											def.resolve(elem, json);
										} catch (e) {
											modules['showImages'].siteModules['minus'].calls[apiURL] = null;
											def.reject();
										}
									},
									onerror: function(response) {
										def.reject();
									}
								});
							}
						} else { // if not 'm', not a gallery, we can't do anything with the API.
							def.reject();
						}
					} else {
						def.reject();
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();
				//TODO: Handle titles
				//TODO: Handle possibility of flash items
				if ('ITEMS_GALLERY' in info) {
					if (info.ITEMS_GALLERY.length > 1) {
						elem.type = 'GALLERY';
						elem.src = {
							src: info.ITEMS_GALLERY
						};
					} else {
						elem.type = 'IMAGE';
						elem.href = info.ITEMS_GALLERY[0];
						if (RESUtils.pageType() === 'linklist') {
							$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
						}
						elem.src = info.ITEMS_GALLERY[0];
					}
					def.resolve(elem);
				} else {
					def.reject();
				}
				return def.promise();
			}
		},
		/**
		 *
		 * It's worth commenting here that this is essentially "reverse" support. There is
		 * no support for inline expansion of 500px.com links in RES. This module "gives back
		 * credit" to 500px.com authors when someone posts their image directly, by figuring
		 * out the original 500px.com link and adding a caption / link to 500px.com
		 *
		 */
		fiveHundredPx: {
			domains: ['ppcdn.500px.org', 'pcdn.500px.net'],
			detect: function(href, elem) {
				return /pcdn\.500px\.(?:org|net)/.test(elem.href)
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var photoId = elem.href.match(/pcdn\.500px\.(?:net|com|org)\/([0-9]+)\//);
				if (photoId == null) {
						def.reject();
				} else {
						def.resolve(elem, photoId[1]);
				}
				return def.promise();
			},
			handleInfo: function(elem, photoId) {
				elem.type = 'IMAGE';
				elem.src = elem.href.replace(/\/[0-9]+\.jpg$/, '/5.jpg')
				elem.credits = 'View original and details at: <a href="http://500px.com/photo/' + RESUtils.sanitizeHTML(photoId) + '">500px.com</a>';
				return $.Deferred().resolve(elem).promise();
			}
		},
		flickr: {
			domains: ['flickr.com'],
			detect: function(href, elem) {
				var hashRe = /^https?:\/\/(?:\w+\.)?flickr\.com\/(?:.*)\/([\d]{10})\/?(?:.*)?$/i;

				var href = elem.href;
				return hashRe.test(href);
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				// modules['showImages'].createImageExpando(elem);
				// var selector = '#allsizes-photo > IMG';
				var href = elem.href;
				if (href.indexOf('/sizes') === -1) {
					var inPosition = href.indexOf('/in/');
					var inFragment = '';
					if (inPosition !== -1) {
						inFragment = href.substring(inPosition);
						href = href.substring(0, inPosition);
					}

					href += '/sizes/c' + inFragment;
				}
				href = href.replace('/lightbox', '').replace('https://','http://');
				// href = 'http://www.flickr.com/services/oembed/?format=json&url=' + encodeURIComponent(href);
				href = 'http://noembed.com/embed?url=' + encodeURIComponent(href);
				BrowserStrategy.ajax({
					method: 'GET',
					url: href,
					onload: function(response) {
						try {
							var json = JSON.parse(response.responseText);
							def.resolve(elem, json);
						} catch (e) {
							def.reject();
						}
					},
					onerror: function(response) {
						def.reject();
					}
				});
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();
				var imgRe = /\.(jpg|jpeg|gif|png)/i;
				if ('url' in info) {
					elem.imageTitle = info.title;
					var original_url = elem.href;
					if (imgRe.test(info.media_url)) {
						elem.src = info.media_url;
						// elem.href = info.url;
					} else {
						elem.src = info.thumbnail_url;
						// elem.href = info.thumbnail_url;
					}
					if (RESUtils.pageType() === 'linklist') {
						$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
					}
					elem.credits = 'Picture by: <a href="' + info.author_url + '">' + info.author_name + '</a> @ Flickr';
					elem.type = 'IMAGE';
					def.resolve(elem);
				} else {
					def.reject();
				}
				return def.promise();
			}
		},
		steampowered: {
			name: 'steam',
			domains: ['steampowered.com'],
			detect: function(href, elem) {
				return /^cloud(?:-\d)?.steampowered.com$/i.test(elem.host);
			},
			handleLink: function(elem) {
				return $.Deferred().resolve(elem, elem.href).promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		deviantart: {
			name: 'deviantART',
			domains: ['deviantart.com'],
			calls: {},
			matchRe: /^http:\/\/(?:fav\.me\/.*|(?:.+\.)?deviantart\.com\/(?:art\/.*|[^#]*#\/d.*))$/i,
			detect: function(href, elem) {
				return modules['showImages'].siteModules['deviantart'].matchRe.test(elem.href);
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var siteMod = modules['showImages'].siteModules['deviantart'];
				var apiURL = 'http://backend.deviantart.com/oembed?url=' + encodeURIComponent(elem.href);
				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						def.reject();
					}
				} else {
					BrowserStrategy.ajax({
						method: 'GET',
						url: apiURL,
						// aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
								siteMod.calls[apiURL] = json;
								def.resolve(elem, json);
							} catch (error) {
								siteMod.calls[apiURL] = null;
								def.reject();
							}
						},
						onerror: function(response) {
							def.reject();
						}
					});
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred(),
					imgRe = /\.(jpg|jpeg|gif|png)/i;
				switch(info.type) {
					case 'photo':
						elem.imageTitle = info.title;
						var original_url = elem.href;
						if (imgRe.test(info.url)) {
							elem.src = info.url;
							// elem.href = info.url;
						} else {
							elem.src = info.thumbnail_url;
							// elem.href = info.thumbnail_url;
						}
						if (RESUtils.pageType() === 'linklist') {
							$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
						}
						// elem.credits = 'Original link: <a href="'+original_url+'">'+original_url+'</a><br>Art by: <a href="'+info.author_url+'">'+info.author_name+'</a> @ deviantART';
						elem.credits = 'Art by: <a href="' + info.author_url + '">' + info.author_name + '</a> @ deviantART';
						elem.type = 'IMAGE';
						def.resolve(elem);
						break;
					case 'rich':
						elem.type = 'TEXT';
						elem.imageTitle = info.title;
						elem.src = info.html + ((/[^\s\.]\s*$/).test(info.html) ? '...' : '');
						elem.credits = '<a href="' + elem.href + '">Click here to read the full text</a> - Written By: <a href="' + info.author_url + '">' + info.author_name + '</a> @ deviantART';
						def.resolve(elem);
						break;
					default:
						def.reject();
				}
				return def.promise();
			}
		},
		tumblr: {
			domains: ['tumblr.com'],
			calls: {},
			APIKey: 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq',
			matchRE: /^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/post\/(\d+)(?:\/.*)?$/i,
			detect: function(href, elem) {
				return modules['showImages'].siteModules['tumblr'].matchRE.test(elem.href);
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var siteMod = modules['showImages'].siteModules['tumblr'];
				var groups = siteMod.matchRE.exec(elem.href);
				if (groups) {
					var apiURL = 'http://api.tumblr.com/v2/blog/' + encodeURIComponent(groups[1]) + '/posts?api_key=' + encodeURIComponent(siteMod.APIKey) + '&id=' + encodeURIComponent(groups[2]) + '&filter=raw';
					if (apiURL in siteMod.calls) {
						if (siteMod.calls[apiURL] != null) {
							def.resolve(elem, siteMod.calls[apiURL]);
						} else {
							def.reject();
						}
					} else {
						BrowserStrategy.ajax({
							method: 'GET',
							url: apiURL,
							// aggressiveCache: true,
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
									if ('meta' in json && json.meta.status === 200) {
										siteMod.calls[apiURL] = json;
										def.resolve(elem, json);
									} else {
										siteMod.calls[apiURL] = null;
										def.reject();
									}
								} catch (error) {
									siteMod.calls[apiURL] = null;
									def.reject();
								}
							},
							onerror: function(response) {
								def.reject();
							}
						});
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();
				var original_url = elem.href;
				var post = info.response.posts[0];
				switch (post.type) {
					case 'photo':
						if (post.photos.length > 1) {
							elem.type = 'GALLERY';
							elem.src = post.photos.map(function(e) {
								return {
									src: e.original_size.url,
									caption: e.caption
								};
							});
						} else {
							elem.type = 'IMAGE';
							elem.src = post.photos[0].original_size.url;
						}
						break;
					case 'text':
						elem.type = 'TEXT';
						elem.imageTitle = post.title;
						if (post.format === 'markdown') {
							elem.src = modules['commentPreview'].converter.render(post.body);
						} else if (post.format === 'html') {
							elem.src = post.body;
						}
						break;
					default:
						return def.reject().promise();
						break;
				}
				elem.caption = post.caption;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				elem.credits = 'Posted by: <a href="' + info.response.blog.url + '">' + info.response.blog.name + '</a> @ Tumblr';
				def.resolve(elem);
				return def.promise();
			}
		},
		memecrunch: {
			domains: ['memecrunch.com'],
			detect: function(href, elem) {
				return href.indexOf('memecrunch.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/memecrunch\.com\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i;
				var groups = hashRe.exec(elem.href);
				if (groups && typeof groups[1] !== 'undefined') {
					def.resolve(elem, 'http://memecrunch.com/meme/' + groups[1] + '/' + (groups[2] || 'null') + '/image.png');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		imgflip: {
			domains: ['imgflip.com'],
			detect: function(href, elem) {
				return /^https?:\/\/imgflip\.com\/(i|gif)\/[a-z0-9]+/.test(elem.href);
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var groups = /^https?:\/\/imgflip\.com\/(i|gif)\/([a-z0-9]+)/.exec(elem.href);
				def.resolve(elem, '//i.imgflip.com/' + groups[2] + '.' + (groups[1] === 'gif' ? 'gif' : 'jpg'));
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = elem.src;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		mediacrush: {
			name: 'mediacrush',
			domains: ['mediacru.sh'],
			calls: {},
			detect: function(href, elem) {
				return /^https?:\/\/(?:www\.|cdn\.)?mediacru\.sh\/([a-zA-Z0-9_-]{12})(?:\.(?:jpe|jpeg|jpg|png|mp3|flac|ogg|oga|ogv|mp4|webm|pdf|svg))?(?:\/?|\/(direct|grid|list|focus)\/?)(#.*)?$/.test(elem.href)
			},
			handleLink: function(elem) {
				var hashRe = /^https?:\/\/(?:www\.|cdn\.)?mediacru\.sh\/([a-zA-Z0-9_-]{12})(?:\.(?:jpe|jpeg|jpg|png|mp3|flac|ogg|oga|ogv|mp4|webm|pdf|svg))?(?:\/?|\/direct|grid|list|focus\/?)(#.*)?$/,
					def = $.Deferred(),
					groups = hashRe.exec(elem.href);

				if (!groups) {
					return def.reject();
				}
				var siteMod = modules['showImages'].siteModules['mediacrush'],
					mediaId = groups[1],
					mediaSettings = groups[2];

				if (!mediaSettings) {
					mediaSettings = '';
				}
				window.MediaCrush.get(mediaId, function(media) {
					siteMod.calls['mediacrush-' + mediaId] = media;
					media.settings = mediaSettings;
					def.resolve(elem, media);
				});
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var autoplay = modules['showImages'].options.autoplayVideo.value;

				// Avoid auto playing more than 1 item
				if (modules['showImages'].options.autoplayVideo.value) {
					if ($(elem).closest('.md').find('.expando-button.video').length > 0) {
						autoplay = false;
					}
				}
				if (typeof info.metadata.has_audio !== 'undefined' && info.metadata.has_audio
						&& typeof info.flags !== 'undefined' && autoplay === false) {
					info.flags.autoplay = false;
				}

				var generate = function(options) {
					var div = document.createElement('div');
					div.setAttribute('data-media', options.media.hash);
					div.classList.add('mediacrush');
					// store a reference to elem so that expandoOptions can be accessed in mediacrush.js
					div.ele = elem;
					window.MediaCrush.render(div);
					return div;
				};
				var def = $.Deferred();
				if (info.type === 'application/album') {
					elem.type = 'GENERIC_EXPANDO';
					elem.expandoClass = ' image gallery';
					if (info.files[0].metadata.has_audio) {
						elem.expandOnViewAll = false;
					} else {
						elem.expandOnViewAll = true;
					}
					elem.expandoOptions = {
						generate: generate,
						media: info
					};
				} else if (info.blob_type === 'video') {
					elem.type = 'GENERIC_EXPANDO';
					if (info.metadata.has_audio) {
						elem.expandoClass = ' video';
					} else {
						elem.expandoClass = ' video-muted';
						elem.expandOnViewAll = true;
					}
					elem.expandoOptions = {
						generate: generate,
						media: info
					};
				} else if (info.blob_type === 'audio') {
					elem.type = 'GENERIC_EXPANDO';
					elem.expandoClass = ' video';
					elem.expandoOptions = {
						generate: generate,
						media: info
					};
				} else if (info.blob_type === 'image') {
					/* We could be using the IMAGE expando here, but this lets us
					 * include MediaCrush titles/descriptions with no extra code */
					elem.type = 'GENERIC_EXPANDO';
					elem.expandoClass = ' image';
					elem.expandOnViewAll = true;
					elem.expandoOptions = {
						generate: generate,
						media: info
					};
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		livememe: {
			domains: ['livememe.com'],
			detect: function(href, elem) {
				return href.indexOf('livememe.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/(?:www\.livememe\.com|lvme\.me)\/(?!edit)([\w]+)\/?/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, 'http://www.livememe.com/' + groups[1] + '.jpg');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		makeameme: {
			domains: ['makeameme.org'],
			detect: function(href, elem) {
				return href.indexOf('makeameme.org') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/makeameme\.org\/meme\/([\w-]+)\/?/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, 'http://makeameme.org/media/created/' + groups[1] + '.jpg');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		memegen: {
			domains: [
				'memegen.com',
				'memegen.de',
				'memegen.nl',
				'memegen.fr',
				'memegen.it',
				'memegen.es',
				'memegen.se',
				'memegen.pl'
			],
			detect: function(href, elem) {
				return href.indexOf('.memegen.') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/((?:www|ar|ru|id|el|pt|tr)\.memegen\.(?:com|de|nl|fr|it|es|se|pl))(\/a)?\/(?:meme|mem|mim)\/([A-Za-z0-9]+)\/?/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					// Animated vs static meme images.
					if (groups[2]) {
						def.resolve(elem, 'http://a.memegen.com/' + groups[3] + '.gif');
					} else {
						def.resolve(elem, 'http://m.memegen.com/' + groups[3] + '.jpg');
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		redditbooru: {
			domains: ['redditbooru.com'],
			calls: {},
			detect: function(href, elem) {
				return href.indexOf('redditbooru.com/gallery/') >= 0;
			},
			handleLink: function(elem) {
				var urlRegEx = /^http[s]?:\/\/([\w\.]+)?redditbooru\.com\/gallery\/([\w]+)(\/[\w-]+)?/i,
					href = elem.href.split('?')[0],
					groups = urlRegEx.exec(href),
					def = $.Deferred(),
					self = modules['showImages'].siteModules['redditbooru'],
					apiUrl = 'http://redditbooru.com/images/?postId=',
					id;

				if (groups) {

					// this will only be set for base36 IDs
					if (groups[3].length > 0) {
						id = parseInt(groups[2], 36);
					} else {
						id = groups[2];
					}

					apiUrl += encodeURIComponent(id);
					if (apiUrl in self.calls) {
						def.resolve(elem, self.calls[apiUrl]);
					} else {
						BrowserStrategy.ajax({
							method: 'GET',
							url: apiUrl,
							onload: function(response) {
								var json = {};
								try {
									json = JSON.parse(response.responseText);
									def.resolve(elem, json);
								} catch (error) {
									def.reject(elem);
								}
								self.calls[apiUrl] = json;
							}
						});
					}
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();
				if (typeof info === 'object' && info.length > 0) {
					elem.src = info.map(function(e, i, a) {
						return {
							title: e.caption,
							src: e.cdnUrl,
							href: e.cdnUrl,
							caption: e.sourceUrl.length ? 'Source: <a href="' + e.sourceUrl + '">' + e.sourceUrl + '</a>': ''
						};
					});
					elem.imageTitle = info[0].title;
					elem.type = 'GALLERY';
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		youtube: {
			name: 'youtube',
			domains: ['youtube.com', 'youtu.be'],
			detect: function(href, elem) {
				// Only find comments, not the titles.
				if (href.indexOf('youtube.com') !== -1  || href.indexOf('youtu.be') !== -1) {
					if (elem.className.indexOf('title') === -1) return true;
				}
				return false;
			},
			handleLink: function(elem) {
				var def = $.Deferred();

				var hashRe = /^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?.*v=([\w\-]+)/i;
				var altHashRe = /^https?:\/\/(?:www\.)?youtu\.be\/([\w\-]+)/i;

				var groups = hashRe.exec(elem.href);
				if (!groups) groups = altHashRe.exec(elem.href);

				if (groups) {

					// Check url for timecode e.g t=1h23m15s
					var timecodeRe = /t=(.*?)&|t=(.*?)$/i;
					var starttime = 0, timecodeResult = timecodeRe.exec(elem.href);

					if (timecodeResult !== null) {
						var time_blocks = {'h':3600, 'm':60, 's':1},
							timeRE = /[0-9]+[h|m|s]/ig;

						// Get each segment e.g. 8m and calculate its value in seconds
						var timeMatch = timecodeResult[0].match(timeRE);
						if (timeMatch) {
							timeMatch.forEach(function(ts){
								var unit = time_blocks[ts.charAt(ts.length-1)];
								var amount = parseInt(ts.slice(0, - 1), 10);
								// Add each unit to starttime
								starttime += unit * amount;
							});
						} else {
							// support direct timestamp e.g. t=200
							starttime = parseInt(timecodeResult[0].replace('t=',''), 10);
							if (isNaN(starttime)) starttime = 0;
						}
					}
					def.resolve(elem, '//www.youtube.com/embed/' + groups[1] + '?enablejsapi=1&enablecastapi=1&start=' + starttime);
				} else {
					def.reject();
				}

				return def.promise();
			},
			handleInfo: function(elem, info) {

				if (modules['showImages'].options.autoplayVideo.value) {
					// Avoid auto playing more than 1 item
					if ($(elem).closest('.md').find('.expando-button.video').length === 0) info += '&autoplay=1';
				}

				elem.type = 'IFRAME';
				elem.setAttribute('data-embed', info);
				elem.setAttribute('data-pause', '{"event":"command","func":"pauseVideo","args":""}');
				elem.setAttribute('data-play', '{"event":"command","func":"playVideo","args":""}');

				return $.Deferred().resolve(elem).promise();
			}
		},
		vimeo: {
			domains: ['vimeo.com'],
			detect: function(href, elem) {
				// Only find comments, not the titles.
				if (href.indexOf('vimeo.com') !== -1) {
					if (elem.className.indexOf('title') === -1) return true;
				}
				return false;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/i;
				var groups = hashRe.exec(elem.href);

				if (groups) {
					def.resolve(elem, '//player.vimeo.com/video/' + groups[1] );
				} else {
					def.reject();
				}

				return def.promise();
			},
			handleInfo: function(elem, info) {

				if (modules['showImages'].options.autoplayVideo.value) {
					// Avoid auto playing more than 1 item
					if ($(elem).closest('.md').find('.expando-button.video').length === 0) info += '?autoplay=true';
				}

				elem.type = 'IFRAME';
				elem.setAttribute('data-embed', info);
				elem.setAttribute('data-pause', '{"method":"pause"}');
				elem.setAttribute('data-play', '{"method":"play"}');

				return $.Deferred().resolve(elem).promise();
			}
		},
		soundcloud: {
			domains: ['soundcloud.com'],
			detect: function(href, elem) {
				if (href.indexOf('soundcloud.com') !== -1) {
					if (elem.className.indexOf('title') === -1) return true;
				}
				return false;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var apiURL = 'http://soundcloud.com/oembed?url=' + encodeURIComponent(elem.href) + '&format=json&iframe=true';
				BrowserStrategy.ajax({
					method: 'GET',
					url: apiURL,
					// aggressiveCache: true,
					onload: function(response) {
						try {
							def.resolve(elem, JSON.parse(response.responseText) );
						} catch (error) {
							def.reject();
						}
					},
					onerror: function(response) {
						def.reject();
					}
				});

				return def.promise();
			},
			handleInfo: function(elem, info) {
				// Get src from iframe html returned
				var src = $(info.html).attr('src');
				elem.type = 'IFRAME';
				elem.setAttribute('data-embed', src);
				elem.setAttribute('data-pause', '{"method":"pause"}');
				elem.setAttribute('data-play', '{"method":"play"}');
				return $.Deferred().resolve(elem).promise();
			}
		},
		clyp: {
			domains: ['clyp.it'],
			detect: function(href, elem) {
				if (href.indexOf('clyp.it') !== -1) {
					if (elem.className.indexOf('title') === -1) return true;
				}
				return false;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/clyp\.it\/(playlist\/)?([A-Za-z0-9]+)\/?/i;
				var groups = hashRe.exec(elem.href);

				if (groups) {
					var urlBase = groups[1] ? 'http://clyp.it/playlist/' : 'http://clyp.it/';
					def.resolve(elem, urlBase + groups[2] + '/widget');
				} else {
					def.reject();
				}

				return def.promise();
			},
			handleInfo: function(elem, info) {
				var generate = function(options) {
					var element = document.createElement('iframe');
					element.src = info;
					element.height = '160px';
					element.width = '100%';

					return element;
				};

				elem.type = 'GENERIC_EXPANDO';
				elem.expandoClass = ' video';
				elem.expandoOptions = {
					generate: generate,
					media: info
				};

				return $.Deferred().resolve(elem).promise();
			}
		},
		memedad: {
			domains: ['memedad.com'],
			detect: function(href, elem) {
				return href.indexOf('memedad.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/memedad.com\/meme\/([0-9]+)/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, 'http://memedad.com/memes/' + groups[1] + '.jpg');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		ridewithgps: {
			domains: ['ridewithgps.com'],
			detect: function(href, elem) {
				return href.toLowerCase().indexOf('ridewithgps.com') !== -1;
			},
			go: function() {},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^https?:\/\/(?:www\.)?ridewithgps\.com\/(trips|routes)\/(\d+).*/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, '//ridewithgps.com/' + groups[1] + '/' + groups[2] + '/embed');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IFRAME';
				elem.setAttribute('data-embed', info);
				return $.Deferred().resolve(elem).promise();
			}
		},
		photobucket: {
			domains: ['photobucket.com'],
			go: function() {},
			detect: function(href, elem) {
				return href.indexOf('photobucket.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var href = elem.href;
				var hashRe = /((i|s|)[0-9]{1,})|media|smg|img(?=.photobucket.com)/i;
				var apiUrl = 'http://api.photobucket.com/v2/media/fromurl?url=';
				var match = href.match(hashRe);
				if (match) {
					if (href.lastIndexOf('.html') !== -1) {
						href = href.replace('.html', '');
					}
					//user linked direct image so no need to hit API
					if (match[0].indexOf('i') !== -1) {
						def.resolve(elem, href);
					} else {
						var encodedUrl = encodeURIComponent(href);
						BrowserStrategy.ajax({
							method: 'GET',
							url: apiUrl + encodedUrl,
							onload: function(response) {
								try {
									if (response.status === 200) {
										var json = JSON.parse(response.responseText);
										def.resolve(elem, json);
									} else {
										def.reject();
									}
								} catch (e) {
									def.reject();
								}
							},
							onerror: function(response) {
								def.reject();
							}
						});
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				if (info instanceof Object) {
					elem.src = info.imageUrl;
					elem.href = info.imageUrl;
				} else {
					elem.src = info;
					elem.href = info;
				}

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				return $.Deferred().resolve(elem).promise();
			}
		},
		giphy: {
			domains: ['giphy.com'],
			calls: {},
			detect: function(href, elem) {
				return href.indexOf('giphy.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();

				var hashRe = /^http:\/\/(?:www\.)?giphy\.com\/gifs\/(.*?)(\/html5)?$/i;
				var groups = hashRe.exec(elem.href);

				if (!groups) return def.reject();

				// remove the default reddit expando button
				$(elem).closest('.entry').find('.expando-button.video').remove();

				var isHtml5 = (groups[2]) ? true : false;
				var giphyUrl = location.protocol + '//giphy.com/gifs/' + groups[1];
				var mp4Url = location.protocol + '//media.giphy.com/media/' + groups[1] + '/giphy.mp4';
				var gifUrl = location.protocol + '//media.giphy.com/media/' + groups[1] + '/giphy.gif';

				def.resolve(elem, { isHtml5: isHtml5, giphyUrl: giphyUrl, mp4Url: mp4Url, gifUrl: gifUrl });

				return def.promise();
			},
			handleInfo: function(elem, info) {
				RESTemplates.load('GiphyUI');

				if (info.isHtml5) {

					// html5 video player
					var generate = function(options) {
						var template = RESTemplates.getSync('GiphyUI');
						var video = {
							loop: true,
							autoplay: true,
							muted: true,
							giphyUrl: info.giphyUrl,
							brand: {
								'url': info.giphyUrl,
								'name': 'Giphy',
								'img': ''
							}
						};
						video.sources = [
							{
								'source': info.mp4Url,
								'type': 'video/mp4'
							}
						];
						var element = template.html(video)[0];
						new MediaPlayer(element);
						return element;
					};

					elem.type = 'GENERIC_EXPANDO';
					elem.expandoClass = ' video-muted';
					elem.expandoOptions = {
						generate: generate,
						media: info
					};

				} else {

					// gif
					elem.type = 'IMAGE';
					elem.src = info.gifUrl;
					elem.href = info.gifUrl;
				}

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		streamable: {
			domains: ['streamable.com'],
			detect: function(href, elem) {
				return href.indexOf('streamable.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^https?:\/\/(?:www\.)?streamable\.com\/([\w]+)/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, '//streamable.com/res/' + groups[1] );
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IFRAME';
				elem.setAttribute('data-embed', info);
				elem.setAttribute('data-pause', '{"method":"pause"}');
				elem.setAttribute('data-play', '{"method":"play"}');
				return $.Deferred().resolve(elem).promise();
			}
		},
		raddit: {
			name: 'radd.it',
			domains: ['radd.it'],
			options: {
				'show playlister toggle': {
					description: 'Show a toggle for radd.it embeds in subreddits with sidebar links to a raddit.com/r/subreddit playlist',
					value: true,
					type: 'boolean'
				},
				'autoplay sidebar playlister': {
					dependsOn: 'show playlister toggle',
					description: 'Start playing the radd.it sidebar embed when opening it',
					type: 'boolean',
					value: true,
				},
				'always show sidebar playlister': {
					description: 'Always show the radd.it embed in the sidebar when applicable',
					value: false,
					type: 'boolean'
				}
			},
			detect: function(href, elem) { return href.indexOf('radd.it/') !== -1; },
			handleLink: function(elem) {
				var def = $.Deferred(),
					hashRe = /^https?:\/\/(?:(?:www|m|embed)\.)?radd\.it(\/(?:search|r|user|comments|playlists)\/.+)/i,
					groups = hashRe.exec(elem.href);

				if (groups) {
					// remove embedly's expando if present
					$(elem).closest('.entry').find('.expando-button.video').remove();

					def.resolve(elem, '//embed.radd.it' + groups[1]);
				} else {
					def.reject();
				}

				return def.promise();
			},
			handleInfo: function(elem, info) {
				var generate = function(options) {
					var element = document.createElement('iframe');
					element.src = info;
					element.height = '640px';
					element.width = '320px';

					return element;
				};

				elem.type = 'GENERIC_EXPANDO';
				elem.expandoClass = ' video';
				elem.expandoOptions = {
					generate: generate,
					media: info
				};
				return $.Deferred().resolve(elem).promise();
			},
			go: function() {
				if (modules['showImages'].options['display radd.it'].value === false) return;
				modules['showImages'].siteModules['raddit'].handleSidebarLink();
			},
			handleSidebarLink: function() {
				// check sidebar for radd.it links, add embedded player option to toolbar if found
				var radditLink = document.querySelector('.side .md a[href^="http://radd.it/r/"], .side .md a[href^="https://radd.it/r/"]');
				if (radditLink) {
					var path = radditLink.href.match(/https?:\/\/radd\.it(\/.*)/)[1];

					if (modules['showImages'].options['always show sidebar playlister'].value) {
						modules['showImages'].siteModules['raddit'].toggleSidebarPlaylist(path);
					}

					if (modules['showImages'].options['display radd.it'].value &&
							modules['showImages'].options['show playlister toggle'].value) {
						modules['showImages'].siteModules['raddit'].addPlaylisterToggle(path);
					}
				}
			},
			addPlaylisterToggle: function(path) {
				if (modules['showImages'].options['display radd.it'].value === false) return;
				if (modules['showImages'].options['show playlister toggle'].value === false) return;

				var mainMenuUL = RESUtils.getHeaderMenuList(),
					li = document.createElement('li'),
					a = document.createElement('a'),
					text = document.createTextNode('playlister');
				li.className = 'RES-raddit-embed';
				li.title = 'show/hide radd.it' + path + ' playlist in the sidebar';

				a.href = '#';
				a.className = 'RES-raddit-embed';
				a.addEventListener('mousedown', function(e) {
					e.preventDefault();
					modules['showImages'].siteModules['raddit'].toggleSidebarPlaylist(path, true);
				}, true);

				a.appendChild(text);
				li.appendChild(a);

				var main
				mainMenuUL.appendChild(li);
			},
			toggleSidebarPlaylist: function(path, autoplay) {
				var sb = document.querySelector('.side');
				var listr = document.querySelector('.side iframe.RES-raddit');

				if (listr) {
					sb.removeChild(listr);		// nix it if it exists.
				} else {						// otherwise, create it.
					var width = window.getComputedStyle(sb).width;

					var src = document.location.protocol + '//embed.radd.it/' + path;
					if (autoplay && modules['showImages'].options['autoplay sidebar playlister']) {
						src = src + (src.indexOf('?') !== 1 ? '?' : '&') + 'autoplay=1';
					}
					listr = document.createElement('iframe');
					listr.className = 'RES-raddit';
					listr.src = src;
					listr.width = width;
					listr.height = '640px';
					listr.style.marginBottom = '5px';
					sb.insertBefore(listr, sb.querySelector('.spacer'));
				}
			}
		}
	}
};
