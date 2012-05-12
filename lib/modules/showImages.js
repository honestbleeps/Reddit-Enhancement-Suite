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
		ignoreDuplicates: {
			type: 'boolean',
			value: true,
			description: 'Do not create expandos for images that appear multiple times in a page.'
		},
		displayImageCaptions: {
			type: 'boolean',
			value: true,
			description: 'Retrieve image captions/attribution information.'
		}
	},
	description: 'Opens images inline in your browser with the click of a button. Also has configuration options, check it out!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\_\?=]*/i
	),
	exclude: Array(
		/https?:\/\/([a-z]+).reddit.com\/ads\/[-\w\.\_\?=]*/i,
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*\/submit\/?$/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS(".expando-button.image { vertical-align:top !important; float: left; width: 23px; height: 23px; max-width: 23px; max-height: 23px; display: inline-block; background-image: url('http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png'); margin-right: 6px; cursor: pointer;  padding: 0px; }");
			RESUtils.addCSS(".expando-button.image.commentImg { float: none; margin-left: 4px; } ");
			RESUtils.addCSS(".expando-button.image.collapsed { background-position: 0px 0px; } ");
			RESUtils.addCSS(".expando-button.image.collapsed:hover { background-position: 0px -24px; } ");
			RESUtils.addCSS(".expando-button.image.expanded { background-position: 0px -48px; } ");
			RESUtils.addCSS(".expando-button.image.expanded:hover { background-position: 0px -72px; } ");
			RESUtils.addCSS(".expando-button.image.gallery.collapsed { background-position: 0px -368px; } ");
			RESUtils.addCSS(".expando-button.image.gallery.collapsed:hover { background-position: 0px -392px; } ");
			RESUtils.addCSS(".expando-button.image.gallery.expanded { background-position: 0px -416px; } ");
			RESUtils.addCSS(".expando-button.image.gallery.expanded:hover { background-position: 0px -440px; } ");
			RESUtils.addCSS(".madeVisible { clear: left; display: block; overflow: hidden; } ");
			RESUtils.addCSS(".madeVisible a { display: inline-block; overflow: hidden; } ");
			RESUtils.addCSS(".RESImage { float: left; display: block !important;  } ");
			RESUtils.addCSS(".RESdupeimg { color: #000000; font-size: 10px;  } ");
			RESUtils.addCSS(".RESClear { clear: both; margin-bottom: 10px;  } ");
			RESUtils.addCSS('.RESGalleryControls { }');
			RESUtils.addCSS('.RESGalleryControls a { cursor: pointer; display: inline-block; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 16px; height: 16px; margin: 5px; }');
			RESUtils.addCSS('.RESGalleryControls span { position: relative; top: -9px; }');
			RESUtils.addCSS('.RESGalleryControls .previous { background-position: 0px -352px; }');
			RESUtils.addCSS('.RESGalleryControls .next { background-position: 16px -352px; }');
			RESUtils.addCSS('.RESGalleryControls .end { background-position-y: -336px; }');
			RESUtils.addCSS('.RESGalleryControls .previous:hover { background-position: 0px -320px; }');
			RESUtils.addCSS('.RESGalleryControls .next:hover { background-position: 16px -320px; }');
			RESUtils.addCSS('.RESGalleryControls .end:hover { background-position-y: -304px; }');
			RESUtils.addCSS('.imgTitle { font-size: 13px; padding: 2px; }')
			RESUtils.addCSS('.imgCredits { font-size: 11px; padding: 2px; }')
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

			if (this.options.markVisited.value) {
				// we only need this iFrame hack if we're unable to add to history directly, which Firefox addons and Chrome can do.
				if ((typeof(chrome) == 'undefined') && (typeof(self.on) == 'undefined')) {
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

			document.body.addEventListener('DOMNodeInserted', function(event) {
				var target = event.target;
				if (
					((target.tagName == 'DIV') && ( (target.id.indexOf('siteTable') != -1) || hasClass(target, 'comment')))
					|| ((target.tagName == 'FORM') && target.className == 'usertext')
				   ) {
					   var isSelfText = (target.tagName == 'FORM');
					   modules['showImages'].findAllImages(target, isSelfText);
					   if (modules['showImages'].allImagesVisible && !isSelfText) {
						   modules['showImages'].waitForScan = setInterval(function(){
							   if (!modules['showImages'].scanningForImages) {
								   modules['showImages'].showImagesToggle(modules['showImages'].goneWild, true);
								   clearInterval(modules['showImages'].waitForScan);
							   }
						   }, 100);
					   }
				   }
			}, true);

			this.createImageButtons();
			this.findAllImages();
			document.addEventListener('dragstart', function(){return false;}, false);
		}
	},
	createImageButtons: function() {
		if ((location.href.match(/search\?\/?q\=/)) || (location.href.match(/modqueue/) || (location.href.toLowerCase().match('dashboard')))) {
			var hbl = document.body.querySelector('#header-bottom-left');
			if (hbl) {
				var mainMenuUL = document.createElement('ul');
				mainMenuUL.setAttribute('class','tabmenu viewimages');
				mainMenuUL.setAttribute('style','display: inline-block');
				hbl.appendChild(mainMenuUL);
			}
		} else {
			var mainMenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
		}
		if (mainMenuUL) {
			var li = document.createElement('li');
			var a = document.createElement('a');
			var text = document.createTextNode('scanning for images...');
			this.scanningForImages = true;

			a.href = 'javascript:void(0);';
			a.id = 'viewImagesButton';
			a.addEventListener('click', function(e) {
				e.preventDefault();
				if (!modules['showImages'].scanningForImages) {
					modules['showImages'].showImagesToggle();
				}
			}, true);
			a.appendChild(text);
			li.appendChild(a);
			mainMenuUL.appendChild(li);
			this.viewImageButton = a;
			this.goneWild = '';

			if (!/comments\/[-\w\.\/]/i.test(location.href) && /gonewild/i.test(location.href)) {
				var li = document.createElement('li');
				var a = document.createElement('a');
				var text = document.createTextNode('[m]');
				a.href = 'javascript:void(0);';
				a.addEventListener('click', function(e) {
					e.preventDefault();
					modules['showImages'].goneWild = 'm';
					modules['showImages'].showImagesToggle('m');
				}, true);
				a.appendChild(text);
				li.appendChild(a);
				mainMenuUL.appendChild(li);

				var li = document.createElement('li');
				var a = document.createElement('a');
				var text = document.createTextNode('[f]');
				a.href = 'javascript:void(0);';
				a.addEventListener('click', function(e) {
					e.preventDefault();
					modules['showImages'].goneWild = 'f';
					modules['showImages'].showImagesToggle('f');
				}, true);
				a.appendChild(text);
				li.appendChild(a);
				mainMenuUL.appendChild(li);
			}
		}
	},
	updateImageButtons: function(imgCount) {
		if (typeof(this.viewImageButton) != 'undefined') {
			var buttonText = (this.allImagesVisible ?'hide':'view') + ' images';
			if (! RESUtils.currentSubreddit('dashboard')) buttonText += '(' + imgCount + ')';
			this.viewImageButton.innerHTML = buttonText;
		}
	},
	findImages: function(goneWild, showMore) {
		//TODO: restructure this Regex stuff
		var re;
		if (this.options.hideNSFW.value) {
			re = /nsfw/i;
		} else {
			switch (goneWild) {
				case 'f':
					re = /[\[\{\<\(](f|fem|female)[\]\}\>\)]/i;
					break;
				case 'm':
					re = /[\[\{\<\(](m|man|male)[\]\}\>\)]/i;
					break;
			}
		}
		for (var i = 0, len = this.imageList.length; i < len; i++) {
			var image = this.imageList[i];
			var titleMatch = (goneWild?re.test(image.text):false);
			image.NSFW = false;
			if (this.options.hideNSFW.value) {
				image.NSFW = /nsfw/i.test(image.text);
			}
			//I suspect that this part is not necessary
			if (typeof(image.site) == 'undefined') {
				console.log('site missing', image);
				var siteFound = false;
				if (siteFound = this.siteModules['default'].detect(image)) {
					image.site = 'default';
				}
				if (!siteFound) {
					for (var site in this.siteModules) {
						if (site == 'default') continue;
						if (this.siteModules[site].detect(image)) {
							image.site = site;
							siteFound = true;
							break;
						}
					}
				}
			} else {
				var siteFound = true;
			}
			if (image.href && (goneWild == '' || titleMatch) && !image.NSFW && siteFound) {
				if (this.imageList[i].parentNode != null) {
					if (hasClass(this.imageList[i].parentNode,'title')) {
						this.revealImage(this.imageList[i].parentNode.nextSibling, showMore);
					} else {
						this.revealImage(this.imageList[i].nextSibling, showMore);
					}
				}
			}
		}
	},
	showImagesToggle: function(goneWild, showMore) {
		if (this.allImagesVisible && !showMore) {
			// Images are visible, and this request didn't come from never ending reddit, so hide the images...
			// (if it came from NER, we'd want to make the next batch also visible...)

			this.allImagesVisible = false;
			var imageList = document.querySelectorAll("div.madeVisible");
			for (var i=0, len=this.imageList.length; i < len; i++) {
				if (hasClass(imageList[i].previousSibling, 'commentImg')) {
					this.revealImage(imageList[i].previousSibling, false);
				} else {
					this.revealImage(imageList[i].parentNode.firstChild.nextSibling, false);
				}
			}
			this.updateImageButtons(this.imageList.length);
			return false;
		} else {
			this.allImagesVisible = true;
			this.updateImageButtons(this.imageList.length);
			this.findImages(goneWild||'', true);
		}
	},
	findAllImages: function(elem, isSelfText) {
		this.scanningForImages = true;
		if (elem == null) {
			elem = document.body;
		}
		// get elements common across all pages first...
		// if we're on a comments page, get those elements too...
		var commentsre = /comments\/[-\w\.\/]/i;
		var userre = /user\/[-\w\.\/]/i;
		this.scanningSelfText = false;
		var allElements = [];
		if (commentsre.test(location.href) || userre.test(location.href)) {
			allElements = elem.querySelectorAll('#siteTable a.title, .expando .usertext-body > div.md a, .content .usertext-body > div.md a');
		} else if (isSelfText) {
			// We're scanning newly opened (from an expando) selftext...
			allElements = elem.querySelectorAll('.usertext-body > div.md a');
			this.scanningSelfText = true;
		} else {
			allElements = elem.querySelectorAll('#siteTable A.title');
		}

		if (RESUtils.pageType() == 'comments') {
			(function(){
				// we're on a comments page which is more intense, so just scan 15 links at a time...
				var chunkLength = Math.min(this.elements.length - this.elementIndex, 15);
				for (var i = 0; i < chunkLength; i++, this.elementIndex++) {
					modules['showImages'].checkElementForImage(this.elements[this.elementIndex]);
				}
				if (this.elementIndex < this.elements.length) {
					setTimeout(arguments.callee.bind(this), 1000);
				} else {
					modules['showImages'].scanningSelfText = false;
					modules['showImages'].scanningForImages = false;
					modules['showImages'].updateImageButtons(modules['showImages'].imageList.length);
				}
			}).bind({
				elements: allElements,
				elementIndex: 0
			})();
		} else {
			var chunkLength = allElements.length;
			for (var i = 0; i < chunkLength; i++) {
				this.checkElementForImage(allElements[i]);
			}
			this.scanningSelfText = false;
			this.scanningForImages = false;
			this.updateImageButtons(this.imageList.length);
		}
	},
	checkElementForImage: function(elem) {
		if (this.options.hideNSFW.value) {
			if (hasClass(elem, 'title')) {
				elem.NSFW = hasClass(elem.parentNode.parentNode.parentNode, 'over18');
			}
		} else {
			elem.NSFW = false;
		}
		var href = elem.href;
		if ((!hasClass(elem, 'imgScanned') && (typeof(this.imagesRevealed[href]) == 'undefined' || !this.options.ignoreDuplicates.value || (RESUtils.currentSubreddit('dashboard'))) && href != null) || this.scanningSelfText) {
			addClass(elem, 'imgScanned');
			this.dupeAnchors++;
			var siteFound = false;
			if (siteFound = this.siteModules['default'].detect(elem)) {
				elem.site = 'default';
			}
			if (!siteFound) {
				for (var site in this.siteModules) {
					if (site == 'default') continue;
					if (this.siteModules[site].detect(elem)) {
						elem.site = site;
						siteFound = true;
						break;
					}
				}
			}
			if (siteFound && !elem.NSFW) {
				this.imagesRevealed[href] = this.dupeAnchors;
				this.siteModules[elem.site].handleLink(elem);
			}
		} else if (!hasClass(elem, 'imgScanned')) {
			var textFrag = document.createElement('span');
			textFrag.setAttribute('class','RESdupeimg');
			textFrag.innerHTML = ' <a class="noKeyNav" href="#img'+this.imagesRevealed[href]+'" title="click to scroll to original">[RES ignored duplicate image]</a>';
			insertAfter(elem, textFrag);
		}
	},
	createImageExpando: function(elem) {
		if (!elem) return false;
		var href = elem.href;
		if (!href) return false;
		//This should not be reached in the case of duplicates
		elem.name = 'img'+this.imagesRevealed[href];
		this.imageList.push(elem);

		var expandLink = document.createElement('a');
		expandLink.className = 'toggleImage expando-button image collapsed';
		if (elem.type == 'GALLERY') expandLink.className += ' gallery';
		expandLink.innerHTML = '&nbsp;';
		expandLink.addEventListener('click', function(e) {
			e.preventDefault();
			modules['showImages'].revealImage(e.target, (hasClass(e.target, 'collapsed') != null));
		}, true);
		var preNode = null;
		if (hasClass(elem.parentNode, 'title')) {
			preNode = elem.parentNode;
			addClass(expandLink, 'linkImg');
		} else {
			preNode = elem;
			addClass(expandLink, 'commentImg');
		}
		insertAfter(preNode, expandLink);
		if (this.scanningSelfText && this.options.autoExpandSelfText.value) {
			this.revealImage(expandLink, true);
		} else if (this.allImagesVisible) {
			// this may have come from an asynchronous call, in which case it'd get missed by findAllImages, so
			// if all images are supposed to be visible, expand this link now.
			this.revealImage(expandLink, true);
		}
		if (this.scanningForImages == false) {
			// also since this may have come from an asynchronous call, we need to update the view images count.
			this.updateImageButtons(this.imageList.length);
		}
	},
	//Used when returning to the deferred call needs to go back to the reveal process
	revealImageDeferred: function(elem) {
		if (hasClass(elem.parentNode, 'title')) {
			var button = elem.parentNode.nextSibling;
		} else {
			var button = elem.nextSibling;
		}
		this.revealImage(button, true);
	},
	revealImage: function(expandoButton, showHide) {
		if (!expandoButton) return false;
		// showhide = false means hide, true means show!

		if (hasClass(expandoButton, 'commentImg')) {
			var imageLink = expandoButton.previousSibling;
			var expandoBox = expandoButton.nextSibling;
		} else {
			var imageLink = expandoButton.parentNode.firstChild.querySelector('a.title');
			var expandoBox = expandoButton.parentNode.lastChild;
		}
		if (typeof(this.siteModules[imageLink.site]) == 'undefined') {
			console.log('something went wrong scanning image from site: ' + imageLink.site);
			return;
		}
		if (this.siteModules[imageLink.site].deferred && typeof(imageLink.src) == 'undefined') {
			this.siteModules[imageLink.site].deferredHandleLink(imageLink);
			return;
		}
		if (typeof(expandoBox) != 'undefined' && expandoBox != null
		&&  typeof(expandoBox.tagName) != 'undefined' && hasClass(expandoBox, 'madeVisible')) {
			if (!showHide) {
				removeClass(expandoButton, 'expanded');
				addClass(expandoButton, 'collapsed');
				expandoBox.style.display = 'none';
				$('div.side').fadeIn();
			} else {
				removeClass(expandoButton, 'collapsed');
				addClass(expandoButton, 'expanded');
				expandoBox.style.display = 'block';
			}
		} else {
			//TODO: text, flash, custom
			switch (imageLink.type) {
				case 'IMAGE':
					this.generateImageExpando(expandoButton, imageLink);
					break;
				case 'GALLERY':
					this.generateGalleryExpando(expandoButton, imageLink);
					break;
			}
		}
	},
	generateImageExpando: function(expandoButton, imageLink) {
		var imgDiv = document.createElement('div');
		addClass(imgDiv, 'madeVisible');

		if ('imageTitle' in imageLink) {
			var header = document.createElement('h3');
			header.className = 'imgTitle';
			header.innerHTML = imageLink.imageTitle;
			imgDiv.appendChild(header);
		}

		var imageAnchor = document.createElement('a');
		addClass(imageAnchor, 'madeVisible');
		imageAnchor.href = imageLink.href;
		if (this.options.openInNewWindow.value) {
			imageAnchor.target = '_blank';
		}


		// I know it's weird, but going back to RES's old way of using innerHTML here instead of
		// appending as a DOM element is what fixes the GIF stuttering problem in Firefox.
		// Why?  No logical reason I can fathom.
		/*
		var image = document.createElement('img');
		if (imageLink.type == 'IMAGE_SCRAPE') {
			image.src = imageLink.getAttribute('scraped_src');
		} else {
			image.src = imageLink.src;
		}
		image.title = 'drag to resize';
		addClass(image, 'RESImage');
		image.style.maxWidth = this.options.maxWidth.value + 'px';
		image.style.maxHeight = this.options.maxHeight.value + 'px';

		imageAnchor.appendChild(image);
		*/
		var thisSrc = (imageLink.type == 'IMAGE_SCRAPE') ? imageLink.getAttribute('scraped_src') : imageLink.src;
		imageAnchor.innerHTML = '<img title="drag to resize" class="RESImage" style="max-width:'+this.options.maxWidth.value+'px;max-height:'+this.options.maxHeight.value+'px;" src="' + thisSrc + '" />';
		var image = imageAnchor.querySelector('IMG');

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			credits.innerHTML = imageLink.credits;
			imgDiv.appendChild(credits);
		}

		imgDiv.appendChild(imageAnchor);

		if ('caption' in imageLink) {
			var captions = document.createElement('div');
			captions.className = 'imgCaptions';
			captions.innerHTML = imageLink.caption;
			imgDiv.appendChild(captions);
		}


		if (hasClass(expandoButton, 'commentImg')) {
			insertAfter(expandoButton, imgDiv);
		} else {
			expandoButton.parentNode.appendChild(imgDiv);
		}
		removeClass(expandoButton, 'collapsed');
		addClass(expandoButton, 'expanded');

		this.trackImageLoad(imageLink, image);
		this.makeImageZoomable(image);
	},
	generateGalleryExpando: function(expandoButton, imageLink) {
		var imgDiv = document.createElement('div');
		addClass(imgDiv, 'madeVisible');
		imgDiv.sources = imageLink.src;
		imgDiv.currentImage = 0;

		var imageAnchor = document.createElement('a');
		addClass(imageAnchor, 'madeVisible');
		imageAnchor.href = imageLink.href;
		if (this.options.openInNewWindow.value) {
			imageAnchor.target ='_blank';
		}
		
		var controlWrapper = document.createElement('div');
		controlWrapper.className  = 'RESGalleryControls';

		var leftButton = document.createElement("a");
		leftButton.className = 'previous';
		leftButton.addEventListener('click', function(e){
			var topWrapper = e.target.parentElement.parentElement;
			if (topWrapper.currentImage == 0) {
				topWrapper.currentImage = topWrapper.sources.length-1;
			} else {
				topWrapper.currentImage -= 1;
			}
			adjustGalleryDisplay(topWrapper);
		});
		controlWrapper.appendChild(leftButton);

		var posLabel = document.createElement('span');
		posLabel.className = 'RESGalleryLabel';
		posLabel.innerHTML = "1 of " + imgDiv.sources.length;
		controlWrapper.appendChild(posLabel);

		var rightButton = document.createElement("a");
		rightButton.className = 'next';
		rightButton.addEventListener('click', function(e){
			var topWrapper = e.target.parentElement.parentElement;
			if (topWrapper.currentImage == topWrapper.sources.length-1) {
				topWrapper.currentImage = 0;
			} else {
				topWrapper.currentImage += 1;
			}
			adjustGalleryDisplay(topWrapper);
		});
		controlWrapper.appendChild(rightButton);

		imgDiv.appendChild(controlWrapper);

		var image = document.createElement('img');
		image.src = imgDiv.sources[0];
		image.title = 'drag to resize';
		addClass(image, 'RESImage');
		image.style.maxWidth = this.options.maxWidth.value + 'px';
		image.style.maxHeight = this.options.maxHeight.value + 'px';

		imageAnchor.appendChild(image);
		imgDiv.appendChild(imageAnchor);

		//Adjusts the images for the gallery navigation buttons as well as the "n of m" dispaly.
		function adjustGalleryDisplay(topLevel) {
			topLevel.querySelector('img.RESImage').src = topLevel.sources[topLevel.currentImage];
			topLevel.querySelector('.RESGalleryLabel').innerHTML = ((topLevel.currentImage+1)+" of "+topLevel.sources.length);
			if (topLevel.currentImage == 0) {
				leftButton.classList.add('end');
				rightButton.classList.remove('end');
			} else if (topLevel.currentImage == topLevel.sources.length-1) {
				leftButton.classList.remove('end');
				rightButton.classList.add('end');
			} else {
				leftButton.classList.remove('end');
				rightButton.classList.remove('end');
			}
		}

		if ('caption' in imageLink) {
			var captions = document.createElement('div');
			//TODO: style captions
//			captions.className = 'imgCaptions';
			captions.innerHTML = imageLink.caption;
			imgDiv.appendChild(captions);
		}

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			credits.innerHTML = imageLink.credits;
			imgDiv.appendChild(credits);
		}

		if (hasClass(expandoButton, 'commentImg')) {
			insertAfter(expandoButton, imgDiv);
		} else {
			expandoButton.parentNode.appendChild(imgDiv);
		}
		removeClass(expandoButton, 'collapsed');
		addClass(expandoButton, 'expanded');

		this.trackImageLoad(imageLink, image);
		this.makeImageZoomable(image);
	},
	trackImageLoad: function(link, image) {
		if (modules['showImages'].options.markVisited.value) {
			if ((typeof(chrome) != 'undefined') || (typeof(self.on) != 'undefined')) {
				var url = link.historyURL || link.href;
				addClass(link, 'visited');
				modules['showImages'].imageTrackStack.push(url);
				if (modules['showImages'].imageTrackStack.length == 1) setTimeout(modules['showImages'].imageTrackShift, 300);
			} else {
				image.addEventListener('load', function(e) {
					var url = link.historyURL || link.href;
					addClass(link, 'visited');
					modules['showImages'].imageTrackStack.push(url);
					if (modules['showImages'].imageTrackStack.length == 1) setTimeout(modules['showImages'].imageTrackShift, 300);
				}, false);
			}
		}
		// hide the sidebar if the image is bigger when it expands...
		image.addEventListener('load', function(e) {
			$(e.target).data('containerWidth',$(image).closest('.entry').width());
			if (parseInt(e.target.style.maxWidth) > $(e.target).data('containerWidth')) {
				$(e.target).closest('.md').css('max-width','100%');
				$('div.side').fadeOut();
			}
		}, false);
	},
	imageTrackShift: function() {
		var url = modules['showImages'].imageTrackStack.shift();
		if (typeof(url) == 'undefined') return;
		if (typeof(chrome) != 'undefined') {
			if (!chrome.extension.inIncognitoContext) {
				chrome.extension.sendRequest({
					requestType: 'addURLToHistory',
					url: url
				}, function(response) {
					//nothing to do here
				});
			}
			modules['showImages'].imageTrackShift();
		} else if (typeof(self.on) != 'undefined') {
			// update: using XPCOM we may can add URLs to Firefox history without the iframe hack!
			var thisJSON = {
				requestType: 'addURLToHistory',
				url: url
			}
			self.postMessage(thisJSON);
			modules['showImages'].imageTrackShift();
		} else if (typeof(modules['showImages'].imageTrackFrame.contentWindow) != 'undefined') {
			modules['showImages'].imageTrackFrame.contentWindow.location.replace(url);
		} else {
			modules['showImages'].imageTrackFrame.location.replace(url);
		}			
	},
	dragTargetData: {},
	getDragSize: function(e){
		var rc = e.target.getBoundingClientRect();
		var p = Math.pow;
		var dragSize = p(p(e.clientX-rc.left, 2)+p(e.clientY-rc.top, 2), .5);
		return Math.round(dragSize);
	},
	makeImageZoomable: function(imageTag) {
		//TODO: rewrite this sucker
		if (this.options.imageZoom.value) {
			// Add listeners for drag to resize functionality...
			imageTag.addEventListener('mousedown', function(e) {
				if (e.button == 0) {
					$(imageTag).data('containerWidth', $(imageTag).closest('.entry').width());
					modules['showImages'].dragTargetData.iw=e.target.width;
					modules['showImages'].dragTargetData.d=modules['showImages'].getDragSize(e);
					modules['showImages'].dragTargetData.dr=false;
					e.preventDefault();
				}
			}, true);
			imageTag.addEventListener('mousemove', function(e) {
				if (modules['showImages'].dragTargetData.d){
					e.target.style.maxWidth=e.target.style.width=((modules['showImages'].getDragSize(e))*modules['showImages'].dragTargetData.iw/modules['showImages'].dragTargetData.d)+"px";
					if (parseInt(e.target.style.maxWidth) > $(e.target).data('containerWidth')) {
						$(e.target).closest('.md').css('max-width','100%');
						$('div.side').fadeOut();
					} else {
						$('div.side').fadeIn();
					}
					e.target.style.maxHeight='';
					e.target.style.height='auto';
					modules['showImages'].dragTargetData.dr=true;
				}
			}, false);
			imageTag.addEventListener('mouseout', function(e) {
				modules['showImages'].dragTargetData.d=false;
				if (modules['showImages'].dragTargetData.dr) return false;
			}, false);
			imageTag.addEventListener('mouseup', function(e) {
				e.target.style.maxWidth=e.target.style.width=((modules['showImages'].getDragSize(e))*modules['showImages'].dragTargetData.iw/modules['showImages'].dragTargetData.d)+"px";
				if (parseInt(e.target.style.maxWidth) > $(e.target).data('containerWidth')) {
					$(e.target).closest('.md').css('max-width','100%');
					$('div.side').fadeOut();
				} else {
					$('div.side').fadeIn();
				}
				modules['showImages'].dragTargetData.d=false;
				if (modules['showImages'].dragTargetData.dr) return false;
			}, false);
			imageTag.addEventListener('click', function(e) {
				modules['showImages'].dragTargetData.d=false;
				if (modules['showImages'].dragTargetData.dr) {
					e.preventDefault();
					return false;
				}
			}, false);
		}
	},
	scrapeHTML: function(elem, url, selector) {
		GM_xmlhttpRequest({
			method:	"GET",
			url:	url,
			onload:	function(response) {
				var thisHTML = response.responseText;
				var tempDiv = document.createElement('div');
				tempDiv.innerHTML = thisHTML;
				var scrapedImg = tempDiv.querySelector(selector);
				// just in case the site (i.e. flickr) has an onload, kill it to avoid JS errors.
//				if (!scrapedImg) return;
				scrapedImg.onload = '';

				modules['showImages'].siteModules[elem.site].handleInfo(elem, {
					src: scrapedImg.src
				});
			}
		});

	},
	siteModules: {
		'default': {
			acceptRegex: /\.(gif|jpe?g|png)(?:[?&#_].*|$)/i,
			rejectRegex: /(wikipedia\.org\/wiki|photobucket\.com|gifsound\.com)/i,
			go: function(){},
			detect: function(elem) {
				var href = elem.href;
				return (this.acceptRegex.test(href) && !this.rejectRegex.test(href));
			},
			handleLink: function(elem) {
				var href = elem.href;
				this.handleInfo(elem, {
					type: 'IMAGE',
					src: elem.href
				});
			},
			handleInfo: function(elem, info) {
				elem.type = info.type;
				elem.src = info.src;
				elem.href = info.src;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				modules['showImages'].createImageExpando(elem);
			}
		},
		imgur: {
			APIKey: 'fe266bc9466fe69aa1cf0904e7298eda',
			hashRe:/^https?:\/\/(?:[i.]|[edge.]|[www.])*imgur.com\/(?:r\/[\w]+\/)?([\w]{5,})(\..+)?$/i,
			albumHashRe: /^https?:\/\/(?:i\.)?imgur.com\/a\/([\w]+)(\..+)?(?:#\d*)?$/i,
			apiPrefix: 'http://api.imgur.com/2/',
			calls: {},
			go: function(){},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('imgur.com/') >= 0;
			},
			handleLink: function(elem) {
				var href = elem.href.split('?')[0];
				var groups = this.hashRe.exec(href);
				if (!groups) var albumGroups = this.albumHashRe.exec(href);
				if (groups && !groups[2]) {
					if (modules['showImages'].options.displayImageCaptions.value) {
						var apiURL = this.apiPrefix + 'image/' + groups[1] + '.json';
						if (apiURL in this.calls) {
							this.handleInfo(elem, this.calls[apiURL]);
						} else {
							GM_xmlhttpRequest({
								method: 'GET',
								url: apiURL,
//								aggressiveCache: true,
								onload: function(response) {
									try {
										var json = JSON.parse(response.responseText);
									} catch (error) {
										var json = {};
									}
									modules['showImages'].siteModules['imgur'].calls[apiURL] = json;
									modules['showImages'].siteModules['imgur'].handleInfo(elem, json);
								}
							});
						}
					} else {
						//If we don't show captions, then we can skip the API call.
						modules['showImages'].siteModules['imgur'].handleInfo(elem, {image: {
							links: {
								//Imgur doesn't really care about the extension and the browsers don't seem to either.
								original: 'http://i.imgur.com/'+groups[1]+'.jpg'
							}, image: {}}});
					}
				} else if (albumGroups && !albumGroups[2]) {
					//TODO: handle multi captions
					//TODO: handle multi links
					var apiURL = this.apiPrefix + 'album/' + albumGroups[1] + '.json';
					if (apiURL in this.calls) {
						this.handleInfo(elem, this.calls[apiURL]);
					} else {
						GM_xmlhttpRequest({
							method: 'GET',
							url: apiURL,
//							aggressiveCache: true,
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
								} catch (error) {
									var json = {};
								}
								modules['showImages'].siteModules['imgur'].calls[apiURL] = json;
								modules['showImages'].siteModules['imgur'].handleInfo(elem, json);
							}
						});
					}
				}
			},
			handleInfo: function(elem, info) {
				if ('image' in info) {
					this.handleSingleImage(elem, info);
				} else if ('album' in info) {
					this.handleGallery(elem, info);
				} else {
					// console.log("ERROR", info);
					// console.log(arguments.callee.caller);
				}
			},
			handleSingleImage: function(elem, info) {
				elem.src = info.image.links.original;
				elem.href = info.image.links.original;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				elem.type = 'IMAGE';
				if (info.image.image.caption) elem.caption = info.image.image.caption;
				modules['showImages'].createImageExpando(elem);
			},
			handleGallery: function(elem, info) {
				elem.src = info.album.images.map(function(e) {
					return e.links.original;
				});
				elem.type = 'GALLERY';
				modules['showImages'].createImageExpando(elem);
			}
		},
		ehost: {
			hashRe: /^http:\/\/(?:i\.)?(?:\d+\.)?eho.st\/(\w+)\/?/i,
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('eho.st') >= 0 && href.substring(-1) != '+';
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, {
						src: 'http://i.eho.st/'+groups[1]+'.jpg'
					});
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				modules['showImages'].createImageExpando(elem);
			}
		},
		picsarus: {
			hashRe:/^https?:\/\/(?:[i.]|[edge.]|[www.])*picsarus.com\/(?:r\/[\w]+\/)?([\w]{6,})(\..+)?$/i,
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('picsarus.com') >= 0 && href.substring(-1) != '+';
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, {
						src: 'http://www.picsarus.com/'+groups[1]+'.jpg'
					});
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				modules['showImages'].createImageExpando(elem);
			}
		},
		snaggy: {
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('snag.gy/') >= 0;
			},
			handleLink: function(elem) {
				var href = elem.href;
				var extensions = ['.jpg','.png','.gif'];
				if (href.indexOf('i.snag') == -1) href = href.replace('snag.gy', 'i.snag.gy');
				if (extensions.indexOf(href.substr(-4)) == -1) href = href+'.jpg';
				this.handleInfo(elem, {src: href});
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				modules['showImages'].createImageExpando(elem);
			}
		},
		minus: {
			hashRe: /^http:\/\/min.us\/([\w]+)(?:#[\d+])?$/i,
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('min.us') >= 0 && href.indexOf('blog.') == -1;
			},
			handleLink: function(elem) {
				var href = elem.href.split('?')[0];
				//TODO: just make default run first and remove this
				var getExt = href.split('.');
				var ext = (getExt.length > 1?getExt[getExt.length - 1].toLowerCase():'');
				if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext)) {
					var groups = this.hashRe.exec(href);
					if (groups && !groups[2]) {
						var hash = groups[1];
						if (hash.substr(0, 1) == 'm') {
							var apiURL = 'http://min.us/api/GetItems/' + hash;
							if (apiURL in this.calls) {
								this.handleInfo(elem, this.calls[apiURL]);
							} else {
								GM_xmlhttpRequest({
									method: 'GET',
									url: apiURL,
									onload: function(response) {
										try {
											var json = JSON.parse(response.responseText);
										} catch (e) {
											var json = {};
										}
										modules['showImages'].siteModules['minus'].calls[apiURL] = json;
										modules['showImages'].siteModules['minus'].handleInfo(elem, json);
									}
								});
							}
						} // if not 'm', not a gallery, we can't do anything with the API.
					}
				}
			},
			handleInfo: function(elem, info) {
				//TODO: Handle titles
				//TODO: Handle possibility of flash items
				if ('ITEMS_GALLERY' in info) {
					//console.log(elem, info.GALLERY_TITLE, info.ITEMS_GALLERY.length, info);
					if (info.ITEMS_GALLERY.length > 1) {
						elem.type = 'GALLERY';
						elem.src = info.ITEMS_GALLERY;
					} else {
						elem.type = 'IMAGE';
						elem.href = info.ITEMS_GALLERY[0];
						$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
						elem.src = info.ITEMS_GALLERY[0];
					}
					modules['showImages'].createImageExpando(elem);
				}
			}
		},
		flickr: {
			deferred: true,
			go: function() {},
			detect: function(elem) {
				return ((elem.href.indexOf('flickr.com')>=0) && (elem.href.indexOf('/sets/') == -1));
			},
			handleLink: function(elem) {
				//Only do this here if deferred
				modules['showImages'].createImageExpando(elem);
			},
			deferredHandleLink: function(elem) {
				if (elem.href.indexOf('/sizes') != -1) {
					var selector = '#allsizes-photo > IMG';
				} else {
					var selector = '#photo > .photo-div > IMG';
				}
				modules['showImages'].scrapeHTML(elem, elem.href, selector)
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				// we don't overwrite the URL here since this is a deferred/scraped call.
				// elem.href = info.src;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				modules['showImages'].revealImageDeferred(elem);
			}
		},
		imgclean: {
			deferred: true,
			go: function() {},
			detect: function(elem) {
				return (elem.href.indexOf('imgclean.com/?p=')>=0);
			},
			handleLink: function(elem) {
				//Only do this here if deferred
				modules['showImages'].createImageExpando(elem);
			},
			deferredHandleLink: function(elem) {
				modules['showImages'].scrapeHTML(elem, elem.href, '.imgclear-entry-image > IMG')
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				// we don't overwrite the URL here since this is a deferred/scraped call.
				// elem.href = info.src;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				elem.src = info.src;
				modules['showImages'].revealImageDeferred(elem);
			}
		},
		steam: {
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('cloud.steampowered.com') >= 0;
			},
			handleLink: function(elem) {
				this.handleInfo(elem, elem.href);
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				modules['showImages'].createImageExpando(elem);
			}
		},
		quickmeme: {
			hashRe: /^http:\/\/(?:(?:www.)?quickmeme.com\/meme|qkme.me|i.qkme.me)\/([\w]+)\/?/i,
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('qkme.me') >= 0 || href.indexOf('quickmeme.com') >= 0;
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, 'http://i.qkme.me/'+groups[1]+'.jpg');
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				modules['showImages'].createImageExpando(elem);
			}
		},
		deviantart: {
			calls: {},
			matchRe: /^http:\/\/(?:fav.me\/.*|(?:.+\.)?deviantart.com\/(?:art\/.*|[^#]*#\/d.*))$/i,
			go: function() {},
			detect: function(elem) {
				return this.matchRe.test(elem.href);
			},
			handleLink: function(elem) {
				var apiURL = 'http://backend.deviantart.com/oembed?url=' + encodeURIComponent(elem.href);
				if (apiURL in this.calls) {
					this.handleInfo(elem, this.calls[apiURL]);
				} else {
					GM_xmlhttpRequest({
						method: 'GET',
						url: apiURL,
						aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
							} catch(error) {
								var json = {};
							}
							modules['showImages'].siteModules['deviantart'].calls[apiURL] = json;
							modules['showImages'].siteModules['deviantart'].handleInfo(elem, json);
						}
					});
				}
			},
			handleInfo: function(elem, info) {
				if ('url' in info) {
					elem.imageTitle = info.title;
					var original_url = elem.href;
					if(['jpg', 'jpeg', 'png', 'gif'].indexOf(info.url)) {
						elem.src = info.url;
						// elem.href = info.url;
					} else {
						elem.src = info.thumbnail_url;
						// elem.href = info.thumbnail_url;
					}
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
					// elem.credits = 'Original link: <a href="'+original_url+'">'+original_url+'</a><br>Art by: <a href="'+info.author_url+'">'+info.author_name+'</a> @ DeviantArt';
					elem.credits = 'Art by: <a href="'+info.author_url+'">'+info.author_name+'</a> @ DeviantArt';
					elem.type = 'IMAGE';
					modules['showImages'].createImageExpando(elem);
				}
			}
		},
		tumblr: {
			calls: {},
			APIKey: 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq',
			matchRE: /^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/post\/(\d+)(?:\/.*)?$/i,
			go: function() { },
			detect: function(elem) {
				return this.matchRE.test(elem.href);
			},
			handleLink: function(elem) {
				var groups = this.matchRE.exec(elem.href);
				if (groups) {
					var apiURL = 'http://api.tumblr.com/v2/blog/'+groups[1]+'/posts?api_key='+this.APIKey+'&id='+groups[2];
					if (apiURL in this.calls) {
						this.handleInfo(elem, this.calls[apiURL]);
					} else {
						GM_xmlhttpRequest({
							method:'GET',
							url: apiURL,
							aggressiveCache: true,
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
								} catch (error) {
									var json = {};
								}
								if ('meta' in json && json.meta.status == 200) {
									modules['showImages'].siteModules['tumblr'].calls[apiURL] = json;
									modules['showImages'].siteModules['tumblr'].handleInfo(elem, json);
								}
							}
						});
					}
				}
			},
			handleInfo: function(elem, info) {
				var original_url = elem.href;
				var post = info.response.posts[0];
				switch (post.type) {
					case 'photo':
						if (post.photos.length > 1) {
							elem.type = 'GALLERY';
							elem.src = post.photos.map(function(elem) {
								return elem.original_size.url;
							});
							// elem.href = post.photos[0].original_size.url;
						} else {
							elem.type = "IMAGE";
							elem.src = post.photos[0].original_size.url;
							// elem.href = post.photos[0].original_size.url;
						}
						break;
					default:
						return;
						break;
				}
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				elem.credits = 'Posted by: <a href="'+info.response.blog.url+'">'+info.response.blog.name+'</a> @ Tumblr';
				modules['showImages'].createImageExpando(elem);
			}
		},
		memecrunch: {
			hashRe: /^http:\/\/memecrunch.com\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i,
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('memecrunch.com') >= 0;
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups && typeof(groups[1]) != 'undefined') {
					this.handleInfo(elem, 'http://memecrunch.com/meme/'+groups[1]+'/'+(groups[2]||'null')+'/image.png');
				}
			},
			handleInfo: function(elem, info) {
					elem.type = 'IMAGE';
					elem.src = info;
					elem.href = info;
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
					modules['showImages'].createImageExpando(elem);
			}
		},
		livememe: {
			hashRe: /^http:\/\/(?:www.livememe.com|lvme.me)\/([\w]+)\/?/i,
			go: function() { },
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('livememe.com') >= 0;
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, 'http://www.livememe.com/'+groups[1]+'.jpg');
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				modules['showImages'].createImageExpando(elem);
			}
		}
	}
};
