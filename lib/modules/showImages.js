/* siteModule format:
name: {
//Initialization method for things that cannot be performed inline. The method 
//is required to be present, but it can be empty
	go: function(){},

//Returns true/false to indicate whether the siteModule will attempt to handle the link
//the only parameter is the anchor element
//returns true or false
	detect: function(element) {return true/false;},

//This is where links are parsed, cache checks are made, and XHR is performed.
//the only parameter is the anchor element
//The method is in a jQuery Deferred chain and will be followed by handleInfo. 
//A new $.Deferred object should be created and resolved/rejected as necessary and then reterned.
//If resolving, the element should be passed along with whatever data is required.
	handleLink: function(element) {},

//This is were the embedding information is added to the link
//handleInfo sits in the Deferred chain after handLink
//and should recieve both the element and a data object from handleLink
//the first parameter should the same anchor element passed to handleLink
//the second parameter should module specific data
//A new $.Deferred object should be created and resolved/rejected as necessary and then reterned
//If resolving, the element should be passed
	handleInfo: function(elem, info) {}
*/
/*
Embedding infomation:
all embedding information (except 'site') is to be attatched the 
html anchor in the handleInfo function

required type:
	'IMAGE' for single images | 'GALLERY' for image galleries | 'TEXT' html/text to be displayed
required src:
	if type is TEXT then src is HTML (be carefull what is accepted here)
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
		maxWidth: {
			type: 'text',
			value: '640',
			description: 'Max width of image displayed onscreen'
		},
		maxHeight: {
			type: 'text',
			value: '480',
			description: 'Max height of image displayed onscreen'
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
			description: 'When loading selftext from an Aa+ expando, auto reveal images.'
		},
		imageZoom: {
			type: 'boolean',
			value: true,
			description: 'Allow dragging to resize/zoom images.'
		},
		markVisited: {
			type: 'boolean',
			value: true,
			description: 'Mark links visited when you view images (does eat some resources).'
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
			description: 'Retrieve image captions/attribution information.'
		},
		loadAllInAlbum: {
			type: 'boolean',
			value: false,
			description: 'Display all images at once in a \'filmstrip\' layout, rather than the default navigable \'slideshow\' style.'
		},
		showViewImagesTab: {
			type: 'boolean',
			value: true,
			description: 'Show a \'view images\' tab at the top of each subreddit, to easily toggle showing all images at once.'
		}
	},
	description: 'Opens images inline in your browser with the click of a button. Also has configuration options, check it out!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\_\?=]*/i
	],
	exclude: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/ads\/[-\w\.\_\?=]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*\/submit\/?$/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadDynamicOptions: function() {
		// Augment the options with available image modules
		for (var site in this.siteModules) {
			if (this.siteModules.hasOwnProperty(site) && this.siteModules[site].hasOwnProperty('options') && !this.options.hasOwnProperty('display ' + site)) {
				for (var optionKey in this.siteModules[site].options) {

				}
				this.options[optionKey] = this.siteModules[site].options[optionKey];
			}
		}
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (!this.options.displayImageCaptions.value) {
				RESUtils.addCSS('.imgTitle, .imgCaptions { display: none; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

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
				// we only need this iFrame hack if we're unable to add to history directly, which Firefox addons and Chrome can do.
				if (!BrowserDetect.isChrome() && !BrowserDetect.isFirefox()) {
					this.imageTrackFrame = document.createElement('iframe');
					this.imageTrackFrame.addEventListener('load', function() {
						setTimeout(modules['showImages'].imageTrackShift, 300);
					}, false);
					this.imageTrackFrame.style.display = 'none';
					this.imageTrackFrame.style.width = '0px';
					this.imageTrackFrame.style.height = '0px';
					document.body.appendChild(this.imageTrackFrame);
				}
				this.imageTrackStack = [];
			}

			//set up all site modules
			for (var key in this.siteModules) {
				this.siteModules[key].go();
			}
			this.scanningForImages = false;

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
	findAllImagesInSelfText: function(ele) {
		modules['showImages'].findAllImages(ele, true);
	},
	createImageButtons: function() {
		var mainMenuUL;

		if ((/search\?\/?q\=/.test(location.href)) ||
				(/\/about\/(?:reports|spam|unmoderated)/.test(location.href)) ||
				(location.href.indexOf('/modqueue') !== -1) ||
				(location.href.toLowerCase().indexOf('/dashboard') !== -1)) {
			var hbl = document.getElementById('header-bottom-left');
			if (hbl) {
				mainMenuUL = document.createElement('ul');
				mainMenuUL.setAttribute('class', 'tabmenu viewimages');
				mainMenuUL.setAttribute('style', 'display: inline-block');
				hbl.appendChild(mainMenuUL);
			}
		} else {
			mainMenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
		}

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
				var switches = {};
				var switchCount = 0;

				var whitelist = /^[A-Za-z0-9_ \-]{1,32}$/;
				var configString = tabConfig.hash.match(/\?(.*)/);
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
					var li = document.createElement('li');
					var a = document.createElement('a');
					var text = document.createTextNode('[' + mode + ']');
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
		if (this.currentImageTab === true) {
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
			if ($(image).hasClass(type)) {
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
		} else if(RESUtils.pageType() === 'wiki'){
			allElements = elem.querySelectorAll('.wiki-page-content a');
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
			var siteFound = this.siteModules['default'].detect(elem);
			if (siteFound) {
				elem.site = 'default';
			}
			if (!siteFound) {
				for (var site in this.siteModules) {
					if (site === 'default') continue;
					if (this.siteModuleEnabled(site) && this.siteModules[site].detect(elem)) {
						elem.site = site;
						siteFound = true;
						break;
					}
				}
			}
			if (siteFound && !elem.NSFW) {
				this.imagesRevealed[href] = this.dupeAnchors;
				var siteMod = this.siteModules[elem.site];
				$.Deferred().resolve(elem).then(siteMod.handleLink).then(siteMod.handleInfo).
				then(this.createImageExpando, function() {
					console.error.apply(console, arguments);
				});
			}
		} else if (!elem.classList.contains('imgScanned')) {
			var textFrag = document.createElement('span');
			textFrag.setAttribute('class', 'RESdupeimg');
			$(textFrag).html(' <a class="noKeyNav" href="#img' + escapeHTML(this.imagesRevealed[href]) + '" title="click to scroll to original">[RES ignored duplicate image]</a>');
			RESUtils.insertAfter(elem, textFrag);
		}
	},

	siteModuleEnabled: function(site) {
		var retVal = true;
		if (this.options.hasOwnProperty('Display ' + site)) {
			retVal = this.options['Display ' + site].value;
		}
		return retVal;
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
		if (elem.type === 'TEXT') expandLink.className += ' selftext collapsed';
		if (elem.type === 'VIDEO') expandLink.className += ' video collapsed';
		if (elem.type === 'IFRAME') expandLink.className += ' video collapsed';
		if (elem.type === 'MEDIACRUSH') expandLink.className += ' video collapsed'; // odds are it's interactive anyway
		if (elem.type === 'AUDIO') expandLink.className += ' video collapsed'; // yes, still class "video", that's what reddit uses.
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
		} else {
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
		if ((!expandoButton) || (!$(expandoButton).is(':visible'))) return false;
		// showhide = false means hide, true means show!

		var imageLink = expandoButton.imageLink;
		if (typeof this.siteModules[imageLink.site] === 'undefined') {
			console.log('something went wrong scanning image from site: ' + imageLink.site);
			return;
		}
		if (expandoButton.expandoBox && expandoButton.expandoBox.classList.contains('madeVisible')) {
			if (!showHide) {
				$(expandoButton).removeClass('expanded').addClass('collapsed collapsedExpando');
				expandoButton.expandoBox.style.display = 'none';
				if (imageLink.type === 'AUDIO' || imageLink.type === 'VIDEO') {
					var mediaTag = expandoButton.expandoBox.querySelector(imageLink.type);
					mediaTag.wasPaused = mediaTag.paused;
					mediaTag.pause();
				}
			} else {
				$(expandoButton).addClass('expanded').removeClass('collapsed collapsedExpando');
				expandoButton.expandoBox.style.display = 'block';
				var associatedImage = $(expandoButton).data('associatedImage');
				if (associatedImage) {
					modules['showImages'].syncPlaceholder(associatedImage);
				}
				if (imageLink.type === 'AUDIO' || imageLink.type === 'VIDEO') {
					var mediaTag = expandoButton.expandoBox.querySelector(imageLink.type);
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
					this.generateImageExpando(expandoButton);
					break;
				case 'TEXT':
					this.generateTextExpando(expandoButton);
					break;
				case 'IFRAME':
					this.generateIframeExpando(expandoButton);
					break;
				case 'VIDEO':
					this.generateVideoExpando(expandoButton, imageLink.mediaOptions);
					break;
				case 'AUDIO':
					this.generateAudioExpando(expandoButton);
					break;
				case 'NOEMBED':
					this.generateNoEmbedExpando(expandoButton);
					break;
				case 'MEDIACRUSH':
					this.generateMediacrushExpando(expandoButton, imageLink.expandoOptions);
					break;
				case 'GENERIC_EXPANDO':
					this.generateGenericExpando(expandoButton, imageLink.expandoOptions);
					break;
			}
		}
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

			// Also preload images for an album
			this.preloadImages(imageLink.src, 0);
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
				if (this.options.loadAllInAlbum.value) {
					if (imgDiv.sources.length > 1) {
						var albumLength = " (" + imgDiv.sources.length + " images)";
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

					var leftButton = document.createElement("a");
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
						posLabel.textContent = niceWhich + " of " + imgDiv.sources.length;
					} else {
						posLabel.textContent = "Whoops, this gallery seems to be empty.";
					}
					controlWrapper.appendChild(posLabel);

					var rightButton = document.createElement("a");
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
				image.classList.add("RESImageError");
			};
			image.onload = function() {
				image.classList.remove("RESImageError");
			};
			image.classList.add('RESImage');
			image.id = 'RESImage-' + RESUtils.randomHash();
			image.src = sourceImage.src;
			image.title = 'drag to resize';
			image.style.maxWidth = thisHandle.options.maxWidth.value + 'px';
			image.style.maxHeight = thisHandle.options.maxHeight.value + 'px';
			imageAnchor.appendChild(image);
			modules['showImages'].setPlaceholder(image);
			thisHandle.makeImageZoomable(image);
			thisHandle.trackImageLoad(imageLink, image);
			paragraph.appendChild(imageAnchor);

			container.appendChild(paragraph);
		}

		//Adjusts the images for the gallery navigation buttons as well as the "n of m" display.

		function adjustGalleryDisplay(topLevel) {
			var source = topLevel.sources[topLevel.currentImage];
			var image = topLevel.querySelector('img.RESImage');
			var imageAnchor = image.parentElement;
			var paragraph = imageAnchor.parentElement;
			image.src = source.src;
			imageAnchor.href = source.href || imageLink.href;
			var paddedImageNumber = ((topLevel.currentImage + 1 < 10) && (imgDiv.sources.length >= 10)) ? '0' + (topLevel.currentImage + 1) : topLevel.currentImage + 1;
			if (imgDiv.sources.length) {
				topLevel.querySelector('.RESGalleryLabel').textContent = (paddedImageNumber + " of " + imgDiv.sources.length);
			} else {
				topLevel.querySelector('.RESGalleryLabel').textContent = "Whoops, this gallery seems to be empty.";
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

		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, imgDiv);
		} else {
			expandoButton.parentNode.appendChild(imgDiv);
		}
		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.add('expanded');
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

			delete img; // Delete the image element from the DOM to stop the RAM usage getting to high.
		};
		img.src = srcs[i].src;
	},
	generateIframeExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;

		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'madeVisible';
		wrapperDiv.innerHTML = '<iframe width="600" height="450" src="' + imageLink.getAttribute("data-embed") + '" frameborder="0" allowfullscreen></iframe>';
		
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} 

		expandoButton.expandoBox = wrapperDiv;
		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		expandoButton.addEventListener('click', function(e) {
			var msg = null;
			if (e.target.className.indexOf("expanded") === -1) {
				msg = imageLink.getAttribute("data-pause");
			} else {
				msg = imageLink.getAttribute("data-play");
			}	
			// Pass message to iframe
			if(msg !== null) $(wrapperDiv).children("iframe")[0].contentWindow.postMessage(msg, '*');

		}, false);

		// Delete iframe on close of built-in reddit expando's (if this is part of a linklist page), as they get regenerated on open anyway
		if(RESUtils.pageType() == 'linklist'){
			$(expandoButton).closest("div.entry").children(".expando-button:first").click(function(){
				$(wrapperDiv).children("iframe").remove();
			});
		}
	},
	generateTextExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		var text = document.createElement('div');
		text.className = 'md';
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
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		var video = document.createElement('video');
		video.addEventListener('click', modules['showImages'].handleVideoClick);
		modules['showImages'].makeImageZoomable(video);
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
		}
		var sourcesHTML = "",
			sources = $(imageLink).data('sources'),
			source, sourceEle;

		for (var i = 0, len = sources.length; i < len; i++) {
			source = sources[i];
			sourceEle = document.createElement('source');
			sourceEle.src = source.file;
			sourceEle.type = source.type;
			$(video).append(sourceEle);
		}

		imgDiv.appendChild(video);

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

		modules['showImages'].trackImageLoad(imageLink, video);

	},
	generateAudioExpando: function(expandoButton) {
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
		// TODO: add mute/unmute control, play/pause control.

		var sourcesHTML = "",
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

		modules['showImages'].trackImageLoad(imageLink, audio);
	},
	generateMediacrushExpando: function(expandoButton, options) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		if (options.media.type !== 'application/album') {
			var brand = document.createElement('a');
			brand.href = MediaCrush.domain + '/' + options.media.hash;
			brand.target = '_blank';
			brand.className = 'mediacrush-brand';
			var image = document.createElement('img');
			image.src = MediaCrush.logo;
			image.width = 16; image.height = 16;
			brand.appendChild(image);
			var span = document.createElement('span');
			span.textContent = 'MediaCrush';
			brand.appendChild(span);
		}

		var element = options.generate(options);

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

		if (options.media.type !== 'application/album') {
			imgDiv.appendChild(brand);
		}

		imgDiv.appendChild(element);

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

		modules['showImages'].trackImageLoad(imageLink, element);

	},
	generateGenericExpando: function(expandoButton, options) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';
		
		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';
		
		var element = options.generate(options);
		imgDiv.appendChild(element);
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

		modules['showImages'].trackImageLoad(imageLink, element);

	},
	handleVideoClick: function(e) {
		// for now, this does nothing, because apparently HTML5 video
		// doesn't have a way to detect clicks of native controls via
		// javascript, which means that even if you're muting/unmuting,
		// changing volume etc this event fires and will play/pause the
		// video, but e.target and e.currentTarget still point to the video
		// and not the controls... yuck.
		// 
		// if (e.target.paused) {
		//     e.target.play();
		// }
		// else {
		//     e.target.pause();
		// }
	},
	generateNoEmbedExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink,
			siteMod = imageLink.siteMod,
			apiURL = 'http://noembed.com/embed?url=' + imageLink.src,
			def = $.Deferred();

		GM_xmlhttpRequest({
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

		modules['showImages'].trackImageLoad(imageLink, video);
	},
	visits: [],
	trackVisit: function(link) {
		var $link = $(link).closest('.thing'),
			fullname;

		if (BrowserDetect.isChrome() && !chrome.extension.inIncognitoContext) {
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
	trackImageLoad: function(link, image) {
		if (modules['showImages'].options.markVisited.value) {
			// also use reddit's mechanism for storing visited links if user has gold.
			if ($('body').hasClass('gold')) {
				this.trackVisit(link);
			}
			var isNSFW = $(link).closest('.thing').is('.over18');
			var sfwMode = modules['showImages'].options['sfwHistory'].value;

			if ((BrowserDetect.isChrome()) || (BrowserDetect.isFirefox())) {
				var url = link.historyURL || link.href;
				if (!isNSFW || sfwMode !== 'none') link.classList.add('visited');
				if (!isNSFW || sfwMode === 'add') {
					modules['showImages'].imageTrackStack.push(url);
					if (modules['showImages'].imageTrackStack.length === 1) setTimeout(modules['showImages'].imageTrackShift, 300);
				}
			} else {
				image.addEventListener('load', function(e) {
					var url = link.historyURL || link.href;
					if (!isNSFW || sfwMode !== 'none') link.classList.add('visited');
					if (!isNSFW || sfwMode === 'add') {
						modules['showImages'].imageTrackStack.push(url);
						if (modules['showImages'].imageTrackStack.length === 1) setTimeout(modules['showImages'].imageTrackShift, 300);
					}
				}, false);
			}
		}

		image.addEventListener('load', function(e) {
			modules['showImages'].handleSRStyleToggleVisibility(e.target);
		}, false);
	},
	imageTrackShift: function() {
		var url = modules['showImages'].imageTrackStack.shift();
		if (typeof url === 'undefined') {
			modules['showImages'].handleSRStyleToggleVisibility();
			return;
		}

		var thisJSON = {
			requestType: 'addURLToHistory',
			url: url
		};

		if (!BrowserDetect.isChrome() || !chrome.extension.inIncognitoContext) {
			RESUtils.sendMessage(thisJSON);
		}

		if (BrowserDetect.isChrome() || BrowserDetect.isFirefox()) {
			modules['showImages'].imageTrackShift();
		}
	},
	dragTargetData: {
		//numbers just picked as sane initialization values
		imageWidth: 100,
		diagonal: 0, //zero to represent the state where no the mouse button is not down
		dragging: false
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
	setPlaceholder: function(imageTag) {
		if (!$(imageTag).data('imagePlaceholder')) {
			var thisPH = RESUtils.createElementWithID('div', 'RESImagePlaceholder');
			$(thisPH).addClass('RESImagePlaceholder');
			$(imageTag).data('imagePlaceholder', thisPH);
			// Add listeners for drag to resize functionality...
			$(imageTag).parent().append($(imageTag).data('imagePlaceholder'));
		}
		$(imageTag).load(modules['showImages'].syncPlaceholder);
	},
	syncPlaceholder: function(e) {
		var ele = e.target || e;
		var thisPH = $(ele).data('imagePlaceholder');
		$(thisPH).width($(ele).width() + 'px');
		$(thisPH).height($(ele).height() + 'px');
		$(ele).addClass('loaded');
	},
	makeImageZoomable: function(imageTag) {
		if (this.options.imageZoom.value) {
			imageTag.addEventListener('mousedown', modules['showImages'].mousedownImage, false);
			imageTag.addEventListener('mouseup', modules['showImages'].dragImage, false);
			imageTag.addEventListener('mousemove', modules['showImages'].dragImage, false);
			imageTag.addEventListener('mouseout', modules['showImages'].mouseoutImage, false);

			// click event is unneeded for HTML5 video
			if (imageTag.tagName !== 'VIDEO') {
				imageTag.addEventListener('click', modules['showImages'].clickImage, false);
			}
		}
	},
	mousedownImage: function(e) {
		if (e.button === 0) {
			if (e.target.tagName === 'VIDEO') {
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
			e.preventDefault();
		}
	},
	mouseoutImage: function(e) {
		modules['showImages'].dragTargetData.diagonal = 0;
	},
	dragImage: function(e) {
		if (modules['showImages'].dragTargetData.diagonal) {
			var newDiagonal = modules['showImages'].getDragSize(e),
				oldDiagonal = modules['showImages'].dragTargetData.diagonal,
				imageWidth = modules['showImages'].dragTargetData.imageWidth,
				maxWidth = Math.max(e.target.minWidth, newDiagonal / oldDiagonal * imageWidth);

			modules['showImages'].resizeImage(e.target, maxWidth);
			modules['showImages'].dragTargetData.dragging = true;
		}
		modules['showImages'].handleSRStyleToggleVisibility(e.target);
		if (e.type === 'mouseup') {
			modules['showImages'].dragTargetData.diagonal = 0;
		}
	},
	clickImage: function(e) {
		modules['showImages'].dragTargetData.diagonal = 0;
		if (modules['showImages'].dragTargetData.hasChangedWidth) {
			modules['showImages'].dragTargetData.dragging = false;
			e.preventDefault();
			return false;
		}
		modules['showImages'].dragTargetData.hasChangedWidth = false;
	},
	resizeImage: function(image, newWidth) {
		var currWidth = $(image).width();
		if (newWidth !== currWidth) {
			modules['showImages'].dragTargetData.hasChangedWidth = true;

			image.style.width = newWidth + 'px';
			image.style.maxWidth = newWidth + 'px';
			image.style.maxHeight = '';
			image.style.height = 'auto';

			var thisPH = $(image).data('imagePlaceholder');
			$(thisPH).width($(image).width() + 'px');
			$(thisPH).height($(image).height() + 'px');
		}
	},
	siteModules: {
		'default': {
			acceptRegex: /^[^#]+?\.(gif|jpe?g|png)(?:[?&#_].*|$)/i,
			rejectRegex: /(wikipedia\.org\/wiki|photobucket\.com|gifsound\.com|\/wiki\/File:.*)/i,
			go: function() {},
			detect: function(elem) {
				var siteMod = modules['showImages'].siteModules['default'];
				var href = elem.href;
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
		imgur: {
			options: {
				'display imgur': {
					description: 'Display expander for imgur images and albums',
					value: true,
					type: 'boolean'
				},
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
			hashRe: /^https?:\/\/(?:i\.|m\.|edge\.|www\.)*imgur\.com\/(?!gallery)(?!removalrequest)(?!random)(?!memegen)([A-Za-z0-9]{5}|[A-Za-z0-9]{7})[sbtmlh]?(\.(?:jpe?g|gif|png))?(\?.*)?$/i,
			albumHashRe: /^https?:\/\/(?:i\.|m\.)?imgur\.com\/(?:a|gallery)\/([\w]+)(\..+)?(?:\/)?(?:#\w*)?$/i,
			apiPrefix: 'http://api.imgur.com/2/',
			calls: {},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('imgur.com/') !== -1;
			},
			handleLink: function(elem) {
				var siteMod = modules['showImages'].siteModules['imgur'],
					def = $.Deferred(),
					href = elem.href.split('?')[0],
					groups = siteMod.hashRe.exec(href),
					albumGroups;

				if (!groups) {
					albumGroups = siteMod.albumHashRe.exec(href);
				}

				if (groups && !groups[2]) {
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
											original: 'http://i.imgur.com/' + hash + '.jpg'
										}
									};
								})
							}
						});
					} else {
						// removed caption API calls as they don't seem to exist/matter for single images, only albums...
						//If we don't show captions, then we can skip the API call.
						def.resolve(elem, {
							image: {
								links: {
									//Imgur doesn't really care about the extension and the browsers don't seem to either.
									original: 'http://i.imgur.com/' + groups[1] + '.jpg'
								},
								image: {}
							}
						});
					}
				} else if (albumGroups && !albumGroups[2]) {
					// on detection, if "prefer RES albums" is checked, hide any existing expando...
					// we actually remove it from the DOM for a number of reasons, including the
					// fact that many subreddits style them with display: block !important;, which
					// overrides a "hide" call here.
					if (modules['showImages'].options['prefer RES albums'].value === true) {
						$(elem).closest('.entry').find('.expando-button.video').remove();
						var apiURL = siteMod.apiPrefix + 'album/' + albumGroups[1] + '.json';
						elem.imgHash = albumGroups[1];
						if (apiURL in siteMod.calls) {
							if (siteMod.calls[apiURL] != null) {
								def.resolve(elem, siteMod.calls[apiURL]);
							} else {
								def.reject();
							}
						} else {
							GM_xmlhttpRequest({
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
				} else if (info.error && info.error.message === 'Album not found') {
					// This case comes up when there is an imgur.com/gallery/HASH link that
					// links to an image, not an album (not to be confused with the word "gallery", ugh)
					info = {
						image: {
							links: {
								original: 'http://i.imgur.com/' + elem.imgHash + '.jpg'
							},
							image: {}
						}
					};
					return modules['showImages'].siteModules['imgur'].handleSingleImage(elem, info);
				} else {
					return $.Deferred().reject().promise();
					// console.log("ERROR", info);
					// console.log(arguments.callee.caller);
				}
			},
			handleSingleImage: function(elem, info) {
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
			}
		},
		gfycat: {
			options: {
				'display gfycat': {
					description: 'Display expander for gfycat',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('gfycat.com') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/[a-zA-Z0-9\-\.]*gfycat\.com\/(\w+)\.?/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);

				if (!groups) return def.reject();
				var href = elem.href.toLowerCase();
				var hotLink = false;
				if (href.indexOf('giant.gfycat') !== -1 ||
					href.indexOf('fat.gfycat') !== -1 ||
					href.indexOf('zippy.gfycat') !== -1)
					hotLink = true;

				var siteMod = modules['showImages'].siteModules['gfycat'];
				var apiURL = 'http://gfycat.com/cajax/get/' + groups[1];

				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						siteMod.calls[apiURL] = null;
						def.reject();
					}
				} else {
					GM_xmlhttpRequest({
						method: 'GET',
						url: apiURL,
						aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
								json.gfyItem.src = elem.href;
								json.gfyItem.hotLink = hotLink;
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
				function humanSize(bytes) {
					var byteUnits = [' kB', ' MB'];
					for (var i = -1; bytes > 1024; i++) {
						bytes = bytes / 1024;
					}
					return Math.max(bytes, 0.1).toFixed(1) + byteUnits[i];
				}
				if (info.hotLink) {
					elem.type = "IMAGE";
					elem.src = info.src;
					elem.imageTitle = humanSize(info.gifSize);
					if (((info.gifSize > 524288 && (info.gifSize / info.mp4Size) > 5) ||
							(info.gifSize > 1048576 && (info.gifSize / info.mp4Size) > 2)) &&
							document.createElement('video').canPlayType)
						elem.imageTitle += ' (' + humanSize(info.mp4Size) + " for <a href='http://gfycat.com/" + info.gfyName + "'>HTML5 version.</a>)";

					if (RESUtils.pageType() === 'linklist') {
						$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
					}
					return $.Deferred().resolve(elem).promise();
				}

				elem.mediaOptions = {
					autoplay: true,
					loop: true
				};

				sources = [];
				sources[0] = {
					'file': info.mp4Url,
					'type': 'video/mp4'
				};
				sources[1] = {
					'file': info.webmUrl,
					'type': 'video/webm'
				};
				elem.type = 'VIDEO';
				$(elem).data('sources', sources);

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				return $.Deferred().resolve(elem).promise();
			}
		},
		fitbamob: {
			options: {
				'display fitbamob': {
					description: 'Display expander for fitbamob',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('fitbamob.com') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/fitbamob\.com\/view\/([0-9]+)/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (!groups) return def.reject();
				var href = elem.href.toLowerCase();

				var siteMod = modules['showImages'].siteModules['fitbamob'];
				var apiURL = 'http://fitbamob.com/link/' + groups[1] + '/?format=json';

				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						siteMod.calls[apiURL] = null;
						def.reject();
					}
				} else {
					GM_xmlhttpRequest({
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

				var renderMedia = function(target, urls, id, options, callback) {
					var video = document.createElement('video');
					video.setAttribute("id","fitba_vid_"+id);
					video.loop = true;
					video.autoplay = true;
					video.controls = true;
					for (var i = 0; i < urls.length; i++) {
						var source = document.createElement('source');
						source.src = urls[i];
						video.appendChild(source);
					}
					modules['showImages'].makeImageZoomable(video);
					target.appendChild(video);
				};

				var render = function(target) {
					var album = document.createElement('div');
					album.className = 'fitbamob';

					var controls = document.createElement('span');
					controls.className = 'RESGalleryControls';
					var prev = document.createElement('span');
					prev.className = 'fitbamob-buttons';
					prev.textContent='\uf14d';
					var next = document.createElement('span');
					next.className = 'fitbamob-buttons';
					next.textContent= '\uf14c';
					var text = document.createElement('span');
					text.className = 'fitbamob-buttons';
					text.textContent='playback speed';

					controls.appendChild(prev);
					controls.appendChild(text);
					controls.appendChild(next);

					var brand = document.createElement('a');
					brand.href = 'http://www.fitbamob.com' + '';
					brand.target = '_blank';
					brand.className = 'fitbamob-brand';
					var image = document.createElement('img');
					image.src = image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gEMCSMnhyS4cgAABOJJREFUWMPtmFtMXEUYx/9z9uzZK+wuV0GW0gJdZEEptjFqbQ0NLcVGe0lt0GDa1NCEGOODaXxQ06aJxhhibJNaY7yiwdaU1KSmrcUSNYIPVEpbIvcCQS7lspwF9nrOjg+2C4c9u4fNLn1y3mZ2zuS33zf/mf83BFE2nuejmm8ymaKaT1YDIhY48qBgVgpFHhTISsFIJJhBh5de6JzBHYcXPiEQE4BOzaAgVYcX7ElIN6pJOCgSDuaj38foiWsjEAM0rpHRqRl8WLkG1aWpslBEDub7jil6pHFgVVPW8FI+Km2WEChWbvL7zf8oLnhmzzpUlaSEjLv9AZSevIlRpw8AUJimw5XDhXj752F8fX0yOO/Y1RFU2iwh37PLozPq9NFBh1cR6LUf7+DopaGQcSFA4fIt7jefSDHtEuD2S/dg96QbY3M+mpHAEZ7ng1Filytq2iWsKORCgMLpERXn9U17UPJxh+xvUwsCMhK4YEBMJpN8yuQayxDoOSbqveITKDxRKDQi0IHHkvHBzjXlFh3bFOsm9osUv/Tz9OWGXggRlMtEOgAPb0pHPGAAQK0iqFhvJsUP6SPeChFzoFczcZe7QSHtjNIhFu/GqWIA4lQk7kBKfzL+IYix/Q8U9Tlk4BhszkkAAGjY+PM+kqYD7xHCKo6sthGLOUJdk256fWQBAJBl4rB1XaJEam0j87R70qO4sJYl2FecHCLTa/08dd27aHcVWIgiUHM/j7cuDQMAUgwset7cABWz+N3YnB+1F5S90k6bGfuKkyVjgw4v3VvfDUoBLctg4p2Nyps63chJbuPmAafk4tmebyYmrUoRaP8yGAD4tn0S9N5qyQb5a5RZbiFtqVpJ/2zHlKSvYQn2FCVHhNFzDCpsZkk6xADFd+2La9lSdLLGnwlVgZ5YdIv0F7scIebqwKORgSrWm2HgpFFs6uPpfRcJIKhkxZQxBHi+cNFaunwB/NTlkKTNpFWBEMBq1sBq1iDFwCJRq0KiVgWdmgHvEeETpRaj/q9JSX+3PSlyGbRU/p0TLvrU6dvB/hNWI+p25aAoXU98IkXZZ520LNeEE9utIQs6PSJ2f9OFNKMadc/loKmPx+XuWVzuceC+DdqWZ0JjtY3I1WkkXHH46vl++sPNaQBAXrIWY3N+GDkG2WYNXP4Ammvs0LDyl6/TI+KZM7cxNOvF4w8bUWkzw+EWcKplHAwBmmvsKMk0ELmiMaxjfG9HtuPXAaclN0mLi4cKEKDAn8Nz+KR1AncX/IjkIvpnPBif86O5xo4NmYYgZH37FF4pTZXARNxDS0nTjOqkr17Mw42xBZy/NQNORbBlbSK+2J8L3iOg7rdR2QU9QgBHGgfwxuaMIMycV0RVQw9KMvR4d1sWiVRSE6W6/movT6vP9uL1pzNwdGsmWIbgxugCdnz+N8pyTSBkUdbzPhEzLgEBCvxRWwSWIeiZ8uDguT6kGFg0VOWTpepbUSktB3Vr3EUPnuuDVs3geLkVqQYWz37aiXBe3axj0VpbhC/b7uJUyzgObUzD8XIrWWr4onpskAPzChSnW8fpyZYxzHtDZb28qRiCJ7ONOFZuxaYsI4n5OSZctNz+/86lKz2zaBtZwNCsN/ggkahVoSBVhy1rE7G3KAn2dD2J+4PVSt6N5r0iOJaR9eDRPun9C2S44VXtCOEiAAAAAElFTkSuQmCC"; 
					image.width = 16; image.height = 16;
					brand.appendChild(image);

					var span = document.createElement('span');
					span.textContent = 'fitbamob';
					brand.appendChild(span);

					album.appendChild(controls);
					album.appendChild(brand);

					mediaDiv = document.createElement('div');
					mediaDiv.className = 'mediacrush';
					album.appendChild(mediaDiv);
					urls = [info.webm_url, info.mp4_url];
					renderMedia(mediaDiv, urls, info.id);

					prev.addEventListener('click', function(e) {
						e.preventDefault();
						myVid = document.getElementById('fitba_vid_' + info.id);
						myVid.playbackRate = myVid.playbackRate * 0.5;
					}, false);

					next.addEventListener('click', function(e) {
						e.preventDefault();
						myVid = document.getElementById('fitba_vid_' + info.id);
						myVid.playbackRate = myVid.playbackRate * 1.5;
					}, false);

					target.appendChild(album);
				};

				var generate = function(options) {
					var div = document.createElement('div');
					div.setAttribute('data-media', options.hash + options.settings);
					div.classList.add('mediacrush');
					render(div);
					return div;
				};

				elem.type = 'GENERIC_EXPANDO';
				elem.expandoClass = ' video collapsed';
				elem.expandoOptions = {
					generate: generate,
					hash: info.hash,
					settings: info.settings,
					media: info
				};

				return $.Deferred().resolve(elem).promise();
			}
		},
		giflike: {
			options: {
				'display giflike': {
					description: 'Inline Giflike player',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('giflike.com') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/www\.giflike\.com\/a\/(\w+)/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);

				if (!groups) return def.reject();
				var href = elem.href.toLowerCase();

				var siteMod = modules['showImages'].siteModules['giflike'];
				var apiURL = 'http://www.giflike.com/a/' + groups[1] + '.json';

				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						siteMod.calls[apiURL] = null;
						def.reject();
					}
				} else {
					GM_xmlhttpRequest({
						method: 'GET',
						url: apiURL,
						aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
								siteMod.calls[apiURL] = json;
								var mp4Sizes = json['sizes'] ? json['sizes']['mp4'] : {};
								var size = mp4Sizes['d'] || mp4Sizes['p'] || mp4Sizes['o'];
								if (!size) {
									def.reject();
								} else {
									json['token'] = size.name;
									def.resolve(elem, json);
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
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.mediaOptions = {
					autoplay: true,
					loop: true
				};
				sources = [];
				var token = info['token'];
				sources[0] = {
					'file': 'http://i.giflike.com/' + info['animation_id'] + '_' + token + '.mp4',
					'type': 'video/mp4'
				};
				sources[1] = {
					'file': 'http://i.giflike.com/' + info['animation_id'] + '_' + token + '.webm',
					'type': 'video/webm'
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
			options: {
				'display ctrlv': {
					description: 'Display expander for CtrlV.in',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
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
		ehost: {
			options: {
				'display ehost': {
					description: 'Display expander for ehost',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('eho.st') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/(?:i\.)?(?:\d+\.)?eho\.st\/(\w+)\/?/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, {
						src: 'http://i.eho.st/' + groups[1] + '.jpg'
					});
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				elem.onerror = function() {
					if (this.src.indexOf('.jpg') !== -1) {
						this.src = this.src.slice(0, elem.src.length - 3) + 'png';
					} else if (this.src.indexOf('.png') !== -1) {
						this.src = this.src.slice(0, elem.src.length - 3) + 'gif';
					}
				};
				return $.Deferred().resolve(elem).promise();
			}
		},
		picsarus: {
			options: {
				'display picsarus': {
					description: 'Display expander for picsarus',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('picsarus.com') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^https?:\/\/(?:i\.|edge\.|www\.)*picsarus\.com\/(?:r\/[\w]+\/)?([\w]{6,})(\..+)?$/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, {
						src: 'http://www.picsarus.com/' + groups[1] + '.jpg'
					});
				} else {
					def.reject();
				}
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
		snaggy: {
			options: {
				'display snag.gy': {
					description: 'Display expander for snag.gy',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('snag.gy/') !== -1;
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
			options: {
				'display picshd': {
					description: 'Display expander for picshd',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
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
			options: {
				'display min.us': {
					description: 'Display expander for min.us',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
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
							var apiURL = 'http://min.us/api/GetItems/' + hash;
							var calls = modules['showImages'].siteModules['minus'].calls;
							if (apiURL in calls) {
								if (calls[apiURL] != null) {
									def.resolve(elem, calls[apiURL]);
								} else {
									def.reject();
								}
							} else {
								GM_xmlhttpRequest({
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
		flickr: {
			options: {
				'display flickr': {
					description: 'Display expander for flickr',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var hashRe = /^http:\/\/(?:\w+)\.?flickr\.com\/(?:.*)\/([\d]{10})\/?(?:.*)?$/i;
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
				href = href.replace('/lightbox', '');
				href = 'http://www.flickr.com/services/oembed/?format=json&url=' + href;
				GM_xmlhttpRequest({
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
					elem.credits = 'Picture by: <a href="' + info.author_url + '">' + info.author_name + '</a> @ Flickr';
					elem.type = 'IMAGE';
					def.resolve(elem);
				} else {
					def.reject();
				}
				return def.promise();
			}
		},
		steam: {
			options: {
				'display steam': {
					description: 'Display expander for steam',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
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
			options: {
				'display deviantART': {
					description: 'Display expander for deviantART',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			matchRe: /^http:\/\/(?:fav\.me\/.*|(?:.+\.)?deviantart\.com\/(?:art\/.*|[^#]*#\/d.*))$/i,
			go: function() {},
			detect: function(elem) {
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
					GM_xmlhttpRequest({
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
				if ('url' in info) {
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
				} else {
					def.reject();
				}
				return def.promise();
			}
		},
		tumblr: {
			options: {
				'display tumblr': {
					description: 'Display expander for tumblr',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			APIKey: 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq',
			matchRE: /^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/post\/(\d+)(?:\/.*)?$/i,
			go: function() {},
			detect: function(elem) {
				return modules['showImages'].siteModules['tumblr'].matchRE.test(elem.href);
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var siteMod = modules['showImages'].siteModules['tumblr'];
				var groups = siteMod.matchRE.exec(elem.href);
				if (groups) {
					var apiURL = 'http://api.tumblr.com/v2/blog/' + groups[1] + '/posts?api_key=' + siteMod.APIKey + '&id=' + groups[2] + '&filter=raw';
					if (apiURL in siteMod.calls) {
						if (siteMod.calls[apiURL] != null) {
							def.resolve(elem, siteMod.calls[apiURL]);
						} else {
							def.reject();
						}
					} else {
						GM_xmlhttpRequest({
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
							elem.type = "IMAGE";
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
			options: {
				'display memecrunch': {
					description: 'Display expander for memecrunch',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('memecrunch.com') !== -1;
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
			options: {
				'display imgflip': {
					description: 'Display expander for imgflip',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
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
			options: {
				'display mediacrush': {
					description: 'Display expander for mediacrush',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				return /^https?:\/\/(?:www\.)?mediacru\.sh\/([a-zA-Z0-9_-]{12})(?:\.(?:jpe|jpeg|jpg|png|mp3|flac|ogg|oga|ogv|mp4|webm|pdf|svg))?(?:\/?|\/direct\/?)(#.*)?$/.test(elem.href)
			},
			handleLink: function(elem) {
				var hashRe = /^https?:\/\/(?:www\.)?mediacru\.sh\/([a-zA-Z0-9_-]{12})(?:\.(?:jpe|jpeg|jpg|png|mp3|flac|ogg|oga|ogv|mp4|webm|pdf|svg))?(?:\/?|\/direct\/?)(#.*)?$/;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (!groups) return def.reject();
				var siteMod = modules['showImages'].siteModules['mediacrush'];
				var mediaId = groups[1];
				var mediaSettings = groups[2];
				if (!mediaSettings) mediaSettings = '';
				MediaCrush.get(mediaId, function(media) {
					siteMod.calls['mediacrush-' + mediaId] = media;
					media.settings = mediaSettings;
					def.resolve(elem, media);
				});
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var generate = function(options) {
					var div = document.createElement('div');
					div.setAttribute('data-media', options.hash + options.settings);
					div.classList.add('mediacrush');
					MediaCrush.render(div);
					return div;
				};
				var def = $.Deferred();
				if (info.type === 'application/album') {
					elem.type = 'MEDIACRUSH';
					elem.expandoOptions = {
						generate: generate,
						hash: info.hash,
						settings: info.settings,
						media: info
					};
				} else if (info.blob_type === "video") {
					elem.type = 'MEDIACRUSH';
					elem.expandoOptions = {
						generate: generate,
						hash: info.hash,
						settings: info.settings,
						media: info
					};
				} else if (info.blob_type === "audio") {
					elem.type = 'MEDIACRUSH';
					elem.expandoOptions = {
						generate: generate,
						hash: info.hash,
						settings: info.settings,
						media: info
					};
				} else if (info.blob_type === "image") {
					elem.type = 'IMAGE';
					elem.src = MediaCrush.domain + info.original;
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		livememe: {
			options: {
				'display livememe': {
					description: 'Display expander for livememe',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('livememe.com') !== -1;
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
			options: {
				'display makeameme': {
					description: 'Display expander for makeameme',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('makeameme.org') !== -1;
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
		memefive: {
			options: {
				'display memefive': {
					description: 'Display expander for memefive',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('memefive.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/(?:www\.)?(?:memefive\.com)\/meme\/([\w]+)\/?/i;
				var altHashRe = /^http:\/\/(?:www\.)?(?:memefive\.com)\/([\w]+)\/?/i;
				var groups = hashRe.exec(elem.href);
				if (!groups) {
					groups = altHashRe.exec(elem.href);
				}
				if (groups) {
					def.resolve(elem, 'http://memefive.com/memes/' + groups[1] + '.jpg');
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
			options: {
				'display memegen': {
					description: 'Display expander for memegen',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('.memegen.') !== -1;
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
			options: {
				'display redditbooru': {
					description: 'Display expander for redditbooru',
					value: false,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('redditbooru.com/gallery/') >= 0;
			},
			handleLink: function(elem) {
				var urlRegEx = /^http:\/\/([\w]+\.)?redditbooru.com\/gallery\/([\d]+)\/?$/i,
					href = elem.href.split('?')[0],
					groups = urlRegEx.exec(href),
					def = $.Deferred(),
					self = modules['showImages'].siteModules['redditbooru'];

				if (groups && !groups[3]) {
					var apiURL = 'http://redditbooru.com/images/?ignoreSource&ignoreUser&ignoreVisible&postId=' + groups[2];
					if (apiURL in self.calls) {
						def.resolve(elem, self.calls[apiURL]);
					} else {
						GM_xmlhttpRequest({
							method: 'GET',
							url: apiURL,
							onload: function(response) {
								var json = {};
								try {
									json = JSON.parse(response.responseText);
									def.resolve(elem, json);
								} catch (error) {
									def.reject(elem);
								}
								self.calls[apiURL] = json;
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
							title: '',
							src: e.cdnUrl,
							href: e.cdnUrl,
							caption: ''
						};
					});
					elem.imageTitle = info[0].title;
					elem.type = 'GALLERY';
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		youtube: {
			options: {
				'display youtube': {
					description: 'Display expander for youtube',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				// Only find comments, not the titles.
				var href = elem.href.toLowerCase();
				if (href.indexOf('youtube.com') !== -1  || href.indexOf('youtu.be') !== -1) {
					if (elem.className.indexOf("title") === -1) return true;
				}
				return false ;
			},
			handleLink: function(elem) {
				var def = $.Deferred();

				var hashRe = /^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?.*v=([\w\-]+)/i;
				var altHashRe = /^https?:\/\/(?:www\.)?youtu\.be\/([\w\-]+)/i;

				var groups = hashRe.exec(elem.href);
				if (!groups) groups = altHashRe.exec(elem.href);

				if (groups) {
					def.resolve(elem, '//www.youtube.com/embed/' + groups[1] + '?autoplay=1&enablecastapi=1');
				} else {
					def.reject();
				}

				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IFRAME';
				elem.setAttribute("data-embed", info);
				elem.setAttribute("data-pause", '{"event":"command","func":"pauseVideo","args":""}');
				elem.setAttribute("data-play", '{"event":"command","func":"playVideo","args":""}');

				return $.Deferred().resolve(elem).promise();
			}
		},
		vimeo: {
			options: {
				'display vimeo': {
					description: 'Display expander for vimeo',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				// Only find comments, not the titles.
				var href = elem.href.toLowerCase();
				if (href.indexOf('vimeo.com') !== -1) {
					if (elem.className.indexOf("title") === -1) return true;
				}
				return false ;
			},
			handleLink: function(elem) {
				var def = $.Deferred();

				var hashRe = /^http:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/i; 

				var groups = hashRe.exec(elem.href);

				if (groups) {
					def.resolve(elem, '//player.vimeo.com/video/' + groups[1] + '?autoplay=true');
				} else {
					def.reject();
				}

				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IFRAME';
				elem.setAttribute("data-embed", info);
				elem.setAttribute("data-pause", '{"method":"pause"}');
				elem.setAttribute("data-play", '{"method":"play"}');

				return $.Deferred().resolve(elem).promise();
			}
		},
		soundcloud: {
			options: {
				'display soundcloud': {
					description: 'Display expander for soundcloud',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				if (href.indexOf('soundcloud.com') !== -1) {
					if (elem.className.indexOf("title") === -1) return true;
				}
				return false ;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var apiURL = 'http://soundcloud.com/oembed?url=' +encodeURIComponent(elem.href)+ '&format=json&iframe=true';
				GM_xmlhttpRequest({
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
				var src = $(info.html).attr("src");
				elem.type = 'IFRAME';
				elem.setAttribute("data-embed", src);
				elem.setAttribute("data-pause", '{"method":"pause"}');
				elem.setAttribute("data-play", '{"method":"play"}');
				return $.Deferred().resolve(elem).promise();
			}
		},
	}
};

