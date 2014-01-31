modules['keyboardNav'] = {
	moduleID: 'keyboardNav',
	moduleName: 'Keyboard Navigation',
	category: 'UI',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		focusBGColor: {
			type: 'text',
			value: '#F0F3FC',
			description: 'Background color of focused element'
		},
		focusBorder: {
			type: 'text',
			value: '',
			description: 'border style (e.g. 1px dashed gray) for focused element'
		},
		focusBGColorNight: {
			type: 'text',
			value: 'rgba(66,66,66,0.5)',
			description: 'Background color of focused element in Night Mode'
		},
		focusFGColorNight: {
			type: 'text',
			value: '#DDD',
			description: 'Foreground color of focused element in Night Mode'
		},
		focusBorderNight: {
			type: 'text',
			value: '',
			description: 'border style (e.g. 1px dashed gray) for focused element'
		},
		autoSelectOnScroll: {
			type: 'boolean',
			value: false,
			description: 'Automatically select the topmost element for keyboard navigation on window scroll'
		},
		mediaBrowseMode: {
			type: 'boolean',
			value: true,
			description: 'If media is open on the currently selected post when moving up/down one post, open media on the next post.'
		},
		scrollOnExpando: {
			type: 'boolean',
			value: true,
			description: 'Scroll window to top of link when expando key is used (to keep pics etc in view)'
		},
		scrollStyle: {
			type: 'enum',
			values: [{
				name: 'directional',
				value: 'directional'
			}, {
				name: 'page up/down',
				value: 'page'
			}, {
				name: 'lock to top',
				value: 'top'
			}],
			value: 'directional',
			description: 'When moving up/down with keynav, when and how should RES scroll the window?'
		},
		commentsLinkNumbers: {
			type: 'boolean',
			value: true,
			description: 'Assign number keys (e.g. [1]) to links within selected comment'
		},
		commentsLinkNumberPosition: {
			type: 'enum',
			values: [{
				name: 'Place on right',
				value: 'right'
			}, {
				name: 'Place on left',
				value: 'left'
			}],
			value: 'right',
			description: 'Which side commentsLinkNumbers are displayed'
		},
		commentsLinkNewTab: {
			type: 'boolean',
			value: true,
			description: 'Open number key links in a new tab'
		},
		clickFocus: {
			type: 'boolean',
			value: true,
			description: 'Move keyboard focus to a link or comment when clicked with the mouse'
		},
		onHideMoveDown: {
			type: 'boolean',
			value: true,
			description: 'After hiding a link, automatically select the next link'
		},
		onVoteMoveDown: {
			type: 'boolean',
			value: false,
			description: 'After voting on a link, automatically select the next link'
		},
		toggleHelp: {
			type: 'keycode',
			value: [191, false, false, true], // ? (note the true in the shift slot)
			description: 'Show help for keyboard shortcuts'
		},
		useGoMode: {
			type: 'boolean',
			value: true,
			description: 'Use go mode (require go mode before "go to" shortcuts are used, e.g. frontpage)'
		},
		goMode: {
			type: 'keycode',
			value: [71, false, false, false], // g
			description: 'Enter "go mode" (next keypress goes to a location, e.g. frontpage)'
		},
		toggleCmdLine: {
			type: 'keycode',
			value: [190, false, false, false], // .
			description: 'Show/hide commandline box'
		},
		hide: {
			type: 'keycode',
			value: [72, false, false, false], // h
			description: 'Hide link'
		},
		moveUp: {
			type: 'keycode',
			value: [75, false, false, false], // k
			description: 'Move up (previous link or comment)'
		},
		moveDown: {
			type: 'keycode',
			value: [74, false, false, false], // j
			description: 'Move down (next link or comment)'
		},
		moveTop: {
			type: 'keycode',
			value: [75, false, false, true], // shift-k
			description: 'Move to top of list (on link pages)'
		},
		moveBottom: {
			type: 'keycode',
			value: [74, false, false, true], // shift-j
			description: 'Move to bottom of list (on link pages)'
		},
		moveUpSibling: {
			type: 'keycode',
			value: [75, false, false, true], // shift-k
			description: 'Move to previous sibling (in comments) - skips to previous sibling at the same depth.'
		},
		moveDownSibling: {
			type: 'keycode',
			value: [74, false, false, true], // shift-j
			description: 'Move to next sibling (in comments) - skips to next sibling at the same depth.'
		},
		moveUpThread: {
			type: 'keycode',
			value: [75, true, false, true], // shift-alt-k
			description: 'Move to the topmost comment of the previous thread (in comments).'
		},
		moveDownThread: {
			type: 'keycode',
			value: [74, true, false, true], // shift-alt-j
			description: 'Move to the topmost comment of the next thread (in comments).'
		},
		moveToTopComment: {
			type: 'keycode',
			value: [84, false, false, false], // t
			description: 'Move to the topmost comment of the current thread (in comments).'
		},
		moveToParent: {
			type: 'keycode',
			value: [80, false, false, false], // p
			description: 'Move to parent (in comments).'
		},
		showParents: {
			type: 'keycode',
			value: [80, false, false, true], // p
			description: 'Display parent comments.'
		},
		followLink: {
			type: 'keycode',
			value: [13, false, false, false], // enter
			description: 'Follow link (hold shift to open it in a new tab) (link pages only)'
		},
		followLinkNewTab: {
			type: 'keycode',
			value: [13, false, false, true], // shift-enter
			description: 'Follow link in new tab (link pages only)'
		},
		followLinkNewTabFocus: {
			type: 'boolean',
			value: true,
			description: 'When following a link in new tab - focus the tab?'
		},
		toggleExpando: {
			type: 'keycode',
			value: [88, false, false, false], // x
			description: 'Toggle expando (image/text/video) (link pages only)'
		},
		imageSizeUp: {
			type: 'keycode',
			value: [187, false, false, false], // =
			description: 'Increase the size of image(s) in the highlighted post area'
		},
		imageSizeDown: {
			type: 'keycode',
			value: [189, false, false, false], // -
			description: 'Increase the size of image(s) in the highlighted post area'
		},
		imageSizeUpFine: {
			type: 'keycode',
			value: [187, false, false, true], // shift-=
			description: 'Increase the size of image(s) in the highlighted post area (finer control)'
		},
		imageSizeDownFine: {
			type: 'keycode',
			value: [189, false, false, true], // shift--
			description: 'Increase the size of image(s) in the highlighted post area (finer control)'
		},
		previousGalleryImage: {
			type: 'keycode',
			value: [219, false, false, false], // [
			description: 'View the previous image of an inline gallery.'
		},
		nextGalleryImage: {
			type: 'keycode',
			value: [221, false, false, false], // ]
			description: 'View the next image of an inline gallery.'
		},
		toggleViewImages: {
			type: 'keycode',
			value: [88, false, false, true], // shift-x
			description: 'Toggle "view images" button'
		},
		toggleChildren: {
			type: 'keycode',
			value: [13, false, false, false], // enter
			description: 'Expand/collapse comments (comments pages only)'
		},
		followComments: {
			type: 'keycode',
			value: [67, false, false, false], // c
			description: 'View comments for link (shift opens them in a new tab)'
		},
		followCommentsNewTab: {
			type: 'keycode',
			value: [67, false, false, true], // shift-c
			description: 'View comments for link in a new tab'
		},
		followLinkAndCommentsNewTab: {
			type: 'keycode',
			value: [76, false, false, false], // l
			description: 'View link and comments in new tabs'
		},
		followLinkAndCommentsNewTabBG: {
			type: 'keycode',
			value: [76, false, false, true], // shift-l
			description: 'View link and comments in new background tabs'
		},
		upVote: {
			type: 'keycode',
			value: [65, false, false, false], // a
			description: 'Upvote selected link or comment'
		},
		downVote: {
			type: 'keycode',
			value: [90, false, false, false], // z
			description: 'Downvote selected link or comment'
		},
		save: {
			type: 'keycode',
			value: [83, false, false, false], // s
			description: 'Save the current link'
		},
		reply: {
			type: 'keycode',
			value: [82, false, false, false], // r
			description: 'Reply to current comment (comment pages only)'
		},
		openBigEditor: {
			type: 'keycode',
			value: [69, false, true, false], // control-e
			description: 'Open the current markdown field in the big editor. (Only when a markdown form is focused)'
		},
		followSubreddit: {
			type: 'keycode',
			value: [82, false, false, false], // r
			description: 'Go to subreddit of selected link (link pages only)'
		},
		followSubredditNewTab: {
			type: 'keycode',
			value: [82, false, false, true], // shift-r
			description: 'Go to subreddit of selected link in a new tab (link pages only)'
		},
		inbox: {
			type: 'keycode',
			value: [73, false, false, false], // i
			description: 'Go to inbox',
			isGoTo: true
		},
		inboxNewTab: {
			type: 'keycode',
			value: [73, false, false, true], // shift+i
			description: 'Go to inbox in a new tab',
			isGoTo: true
		},
		profile: {
			type: 'keycode',
			value: [85, false, false, false], // u
			description: 'Go to profile',
			isGoTo: true
		},
		profileNewTab: {
			type: 'keycode',
			value: [85, false, false, true], // shift+u
			description: 'Go to profile in a new tab',
			isGoTo: true
		},
		frontPage: {
			type: 'keycode',
			value: [70, false, false, false], // f
			description: 'Go to front page',
			isGoTo: true
		},
		subredditFrontPage: {
			type: 'keycode',
			value: [70, false, false, true], // shift-f
			description: 'Go to subreddit front page',
			isGoTo: true
		},
		nextPage: {
			type: 'keycode',
			value: [78, false, false, false], // n
			description: 'Go to next page (link list pages only)',
			isGoTo: true
		},
		prevPage: {
			type: 'keycode',
			value: [80, false, false, false], // p
			description: 'Go to prev page (link list pages only)',
			isGoTo: true
		},
		link1: {
			type: 'keycode',
			value: [49, false, false, false], // 1
			description: 'Open first link within comment.',
			noconfig: true
		},
		link2: {
			type: 'keycode',
			value: [50, false, false, false], // 2
			description: 'Open link #2 within comment.',
			noconfig: true
		},
		link3: {
			type: 'keycode',
			value: [51, false, false, false], // 3
			description: 'Open link #3 within comment.',
			noconfig: true
		},
		link4: {
			type: 'keycode',
			value: [52, false, false, false], // 4
			description: 'Open link #4 within comment.',
			noconfig: true
		},
		link5: {
			type: 'keycode',
			value: [53, false, false, false], // 5
			description: 'Open link #5 within comment.',
			noconfig: true
		},
		link6: {
			type: 'keycode',
			value: [54, false, false, false], // 6
			description: 'Open link #6 within comment.',
			noconfig: true
		},
		link7: {
			type: 'keycode',
			value: [55, false, false, false], // 7
			description: 'Open link #7 within comment.',
			noconfig: true
		},
		link8: {
			type: 'keycode',
			value: [56, false, false, false], // 8
			description: 'Open link #8 within comment.',
			noconfig: true
		},
		link9: {
			type: 'keycode',
			value: [57, false, false, false], // 9
			description: 'Open link #9 within comment.',
			noconfig: true
		},
		link10: {
			type: 'keycode',
			value: [48, false, false, false], // 0
			description: 'Open link #10 within comment.',
			noconfig: true
		}
	},
	description: 'Keyboard navigation for reddit!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var focusFGColorNight, focusBGColor, focusBGColorNight;
			if (typeof this.options.focusBGColor === 'undefined') {
				focusBGColor = '#F0F3FC';
			} else {
				focusBGColor = this.options.focusBGColor.value;
			}
			var borderType = 'outline';
			if (BrowserDetect.isOpera()) {
				borderType = 'border';
			}
			if (typeof this.options.focusBorder === 'undefined') {
				focusBorder = '';
			} else {
				focusBorder = borderType + ': ' + this.options.focusBorder.value + ';';
			}
			if (!(this.options.focusBGColorNight.value)) {
				focusBGColorNight = '#666';
			} else {
				focusBGColorNight = this.options.focusBGColorNight.value;
			}
			if (!(this.options.focusFGColorNight.value)) {
				focusFGColorNight = '#DDD';
			} else {
				focusFGColorNight = this.options.focusFGColorNight.value;
			}
			if (typeof this.options.focusBorderNight === 'undefined') {
				focusBorderNight = '';
			} else {
				focusBorderNight = borderType + ': ' + this.options.focusBorderNight.value + ';';
			}
			// old style: .RES-keyNav-activeElement { '+borderType+': '+focusBorder+'; background-color: '+focusBGColor+'; } \
			// this new pure CSS arrow will not work because to position it we must have .RES-keyNav-activeElement position relative, but that screws up image viewer's absolute positioning to
			// overlay over the sidebar... yikes.
			// .RES-keyNav-activeElement:after { content: ""; float: right; margin-right: -5px; border-color: transparent '+focusBorderColor+' transparent transparent; border-style: solid; border-width: 3px 4px 3px 0; } \

			// why !important on .RES-keyNav-activeElement?  Because some subreddits are unfortunately using !important for no good reason on .entry divs... 
			RESUtils.addCSS(' \
				.entry { padding-right: 5px; } \
				.RES-keyNav-activeElement, .commentarea .RES-keyNav-activeElement .md, .commentarea .RES-keyNav-activeElement.entry .noncollapsed { background-color: ' + focusBGColor + ' !important; } \
				.RES-keyNav-activeElement { ' + focusBorder + ' } \
				.res-nightmode .RES-keyNav-activeElement { ' + focusBorderNight + ' } \
				.res-nightmode .RES-keyNav-activeElement, .res-nightmode .RES-keyNav-activeElement .usertext-body, .res-nightmode .RES-keyNav-activeElement .usertext-body .md, .res-nightmode .RES-keyNav-activeElement .usertext-body .md p, .res-nightmode .commentarea .RES-keyNav-activeElement .noncollapsed, .res-nightmode .RES-keyNav-activeElement .noncollapsed .md, .res-nightmode .RES-keyNav-activeElement .noncollapsed .md p { background-color: ' + focusBGColorNight + ' !important; color: ' + focusFGColorNight + ' !important;} \
				.res-nightmode .RES-keyNav-activeElement a.title:first-of-type {color: ' + focusFGColorNight + ' !important; } \
				#keyHelp { display: none; position: fixed; height: 90%; overflow-y: auto; right: 20px; top: 20px; z-index: 1000; border: 2px solid #aaa; border-radius: 5px; width: 300px; padding: 5px; background-color: #fff; } \
				#keyHelp th { font-weight: bold; padding: 2px; border-bottom: 1px dashed #ddd; } \
				#keyHelp td { padding: 2px; border-bottom: 1px dashed #ddd; } \
				#keyHelp td:first-child { width: 70px; } \
				.keyNavAnnotation { font-size: 9px; position: relative; top: -6px; } \
			');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get rid of antequated option we've removed
			this.keyboardNavLastIndexCache = safeJSON.parse(RESStorage.getItem('RESmodules.keyboardNavLastIndex'), false, true);
			var idx, now = Date.now();
			if (!this.keyboardNavLastIndexCache) {
				// this is a one time function to delete old keyboardNavLastIndex junk.
				this.keyboardNavLastIndexCache = {};
				for (idx in RESStorage) {
					if (/keyboardNavLastIndex/.test(idx)) {
						var url = idx.replace('RESmodules.keyboardNavLastIndex.', '');
						this.keyboardNavLastIndexCache[url] = {
							index: RESStorage[idx],
							updated: now
						};
						RESStorage.removeItem(idx);
					}
				}
				this.keyboardNavLastIndexCache.lastScan = now;
				RESStorage.setItem('RESmodules.keyboardNavLastIndex', JSON.stringify(this.keyboardNavLastIndexCache));
			} else {
				// clean cache every 6 hours - delete any urls that haven't been visited in an hour.
				if ((typeof this.keyboardNavLastIndexCache.lastScan === 'undefined') || (now - this.keyboardNavLastIndexCache.lastScan > 21600000)) {
					for (idx in this.keyboardNavLastIndexCache) {
						if ((typeof this.keyboardNavLastIndexCache[idx] === 'object') && (now - this.keyboardNavLastIndexCache[idx].updated > 3600000)) {
							delete this.keyboardNavLastIndexCache[idx];
						}
					}
					this.keyboardNavLastIndexCache.lastScan = now;
					RESStorage.setItem('RESmodules.keyboardNavLastIndex', JSON.stringify(this.keyboardNavLastIndexCache));
				}
			}

			if (this.options.autoSelectOnScroll.value) {
				window.addEventListener('scroll', modules['keyboardNav'].handleScroll, false);
			}
			if (typeof this.options.scrollTop !== 'undefined') {
				if (this.options.scrollTop.value) {
					this.options.scrollStyle.value = 'top';
				}
				delete this.options.scrollTop;
				RESStorage.setItem('RESoptions.keyboardNav', JSON.stringify(modules['keyboardNav'].options));
			}
			this.drawHelp();
			window.addEventListener('keydown', function(e) {
				modules['keyboardNav'].handleKeyPress(e);
			}, true);
			this.scanPageForKeyboardLinks();
			// listen for new DOM nodes so that modules like autopager, never ending reddit, "load more comments" etc still get keyboard nav.
			if (RESUtils.pageType() === 'comments') {
				RESUtils.watchForElement('newComments', modules['keyboardNav'].scanPageForNewKeyboardLinks);
			} else {
				RESUtils.watchForElement('siteTable', modules['keyboardNav'].scanPageForNewKeyboardLinks);
			}
		}
	},
	scanPageForNewKeyboardLinks: function() {
		modules['keyboardNav'].scanPageForKeyboardLinks(true);
	},
	setKeyIndex: function() {
		var trimLoc = location.href;
		// remove any trailing slash from the URL
		if (trimLoc.substr(-1) === '/') {
			trimLoc = trimLoc.substr(0, trimLoc.length - 1);
		}
		if (typeof this.keyboardNavLastIndexCache[trimLoc] === 'undefined') {
			this.keyboardNavLastIndexCache[trimLoc] = {};
		}
		var now = Date.now();
		this.keyboardNavLastIndexCache[trimLoc] = {
			index: this.activeIndex,
			updated: now
		};
		RESStorage.setItem('RESmodules.keyboardNavLastIndex', JSON.stringify(this.keyboardNavLastIndexCache));
	},
	handleScroll: function(e) {
		if (modules['keyboardNav'].scrollTimer) {
			clearTimeout(modules['keyboardNav'].scrollTimer);
		}
		modules['keyboardNav'].scrollTimer = setTimeout(modules['keyboardNav'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function() {
		if ((!modules['keyboardNav'].recentKeyPress) && (!RESUtils.elementInViewport(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]))) {
			for (var i = 0, len = modules['keyboardNav'].keyboardLinks.length; i < len; i++) {
				if (RESUtils.elementInViewport(modules['keyboardNav'].keyboardLinks[i])) {
					modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
					modules['keyboardNav'].activeIndex = i;
					modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
					break;
				}
			}
		}
	},
	
	scanPageForKeyboardLinks: function(isNew) {
		if (typeof isNew === 'undefined') {
			isNew = false;
		}
		// check if we're on a link listing (regular page, subreddit page, etc) or comments listing...
		this.pageType = RESUtils.pageType();
		switch (this.pageType) {
			case 'linklist':
			case 'profile':
				// get all links into an array...
				var siteTable = document.getElementById('siteTable');
				var stMultiCheck = document.querySelectorAll('#siteTable');
				// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
				if (stMultiCheck.length === 2) {
					siteTable = stMultiCheck[1];
				}
				if (siteTable) {
					this.keyboardLinks = document.body.querySelectorAll('div.linklisting .entry');
					if (!isNew) {
						if ((this.keyboardNavLastIndexCache[location.href]) && (this.keyboardNavLastIndexCache[location.href].index > 0)) {
							this.activeIndex = this.keyboardNavLastIndexCache[location.href].index;
						} else {
							this.activeIndex = 0;
						}
						if ((this.keyboardNavLastIndexCache[location.href]) && (this.keyboardNavLastIndexCache[location.href].index >= this.keyboardLinks.length)) {
							this.activeIndex = 0;
						}
					}
				}
				break;
			case 'comments':
				// get all links into an array...
				this.keyboardLinks = document.body.querySelectorAll('#siteTable .entry, div.content > div.commentarea .entry');
				if (!isNew) {
					this.activeIndex = 0;
				}
				break;
			case 'inbox':
				var siteTable = document.getElementById('siteTable');
				if (siteTable) {
					this.keyboardLinks = siteTable.querySelectorAll('.entry');
					this.activeIndex = 0;
				}
				break;
		}
		// wire up keyboard links for mouse clicky selecty goodness...
		if ((typeof this.keyboardLinks !== 'undefined') && (this.options.clickFocus.value)) {
			for (var i = 0, len = this.keyboardLinks.length; i < len; i++) {
				$(this.keyboardLinks[i]).parent().data('keyIndex', i)
					.on('click', modules['keyboardNav'].updateKeyFocus);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
		}
	},
	updateKeyFocus: function(event) {
		// we can't stop propagation because it breaks other buttons, so instead
		// we will throttle this to only run once every 100ms. This prevents the
		// issue where clicking a key highlight element also triggers click events
		// on the parents, grandparents, etc due to event bubbling.
		if (!modules['keyboardNav'].updateKeyFocusThrottle) {
			modules['keyboardNav'].updateKeyFocusThrottle = setTimeout(function() {
				delete modules['keyboardNav'].updateKeyFocusThrottle;
			},100);
			modules['keyboardNav'].doUpdateKeyFocus(event);
		}
	},
	doUpdateKeyFocus: function(event) {
		var thisIndex = parseInt($(event.currentTarget).data('keyIndex'), 10);
		if (isNaN(thisIndex)) {
			return;
		}

		if (modules['keyboardNav'].activeIndex !== thisIndex) {
			modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
			modules['keyboardNav'].activeIndex = thisIndex;
			modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
		}
	},
	recentKey: function() {
		modules['keyboardNav'].recentKeyPress = true;
		clearTimeout(modules['keyboardNav'].recentKey);
		modules['keyboardNav'].recentKeyTimer = setTimeout(function() {
			modules['keyboardNav'].recentKeyPress = false;
		}, 1000);
	},
	keyFocus: function(obj) {
		if ((typeof obj !== 'undefined') && (obj.classList.contains('RES-keyNav-activeElement'))) {
			return false;
		} else if (typeof obj !== 'undefined') {
			if (this.options.mediaBrowseMode.value && this.fromKey) {
				if (this.lastLinkExpanded === true) {
					var $expando = $(obj).find('.expando-button.collapsed');
					if ($expando.length > 0) {
						this.toggleExpando();
					}
				}
			}
			delete this.fromKey;

			obj.classList.add('RES-keyNav-activeElement');
			this.activeElement = obj;
			if ((this.pageType === 'linklist') || (this.pageType === 'profile')) {
				this.setKeyIndex();
			}
			if ((this.pageType === 'comments') && (this.options.commentsLinkNumbers.value)) {
				var links = this.getCommentLinks(obj);
				var annotationCount = 0;
				for (var i = 0, len = links.length; i < len; i++) {
					if (!(links[i].classList.contains('madeVisible') ||
						links[i].classList.contains('toggleImage') ||
						links[i].classList.contains('noKeyNav') ||
						RESUtils.isCommentCode(links[i]))) {
						var annotation = document.createElement('span');
						annotationCount++;
						$(annotation).text('[' + annotationCount + '] ');
						annotation.title = 'press ' + annotationCount + ' to open link';
						annotation.classList.add('keyNavAnnotation');
						/*
						if (!(hasClass(links[i],'hasListener'))) {
							addClass(links[i],'hasListener');
							links[i].addEventListener('click', modules['keyboardNav'].handleKeyLink, true);
						}
						*/
						if (modules['keyboardNav'].options.commentsLinkNumberPosition.value === 'right') {
							RESUtils.insertAfter(links[i], annotation);
						} else {
							links[i].parentNode.insertBefore(annotation, links[i]);
						}
					}
				}
			}
		}
	},
	handleKeyLink: function(link) {
		var button = 0;
		if ((modules['keyboardNav'].options.commentsLinkNewTab.value) || e.ctrlKey) {
			button = 1;
		}
		if (link.classList.contains('toggleImage')) {
			RESUtils.click(link);
			return false;
		}
		var thisURL = link.getAttribute('href'),
			isLocalToPage = (thisURL.indexOf('reddit') !== -1) && (thisURL.indexOf('comments') !== -1) && (thisURL.indexOf('#') !== -1);
		if ((!isLocalToPage) && (button === 1)) {
			var thisJSON = {
				requestType: 'keyboardNav',
				linkURL: thisURL,
				button: button
			};

			RESUtils.sendMessage(thisJSON);
		} else {
			location.href = this.getAttribute('href');
		}
	},
	keyUnfocus: function(obj) {
		if (this.options.mediaBrowseMode.value && this.fromKey) {
			var $expando = $(obj).children('.expando-button');
			if ($expando.length > 0) {
				if ($expando.hasClass('expanded')) {
					this.lastLinkExpanded = true;
					this.toggleExpando();
				} else {
					this.lastLinkExpanded = false;
				}
			}
		}
		obj.classList.remove('RES-keyNav-activeElement');
		if (this.pageType === 'comments') {
			var annotations = obj.querySelectorAll('div.md .keyNavAnnotation');
			for (var i = 0, len = annotations.length; i < len; i++) {
				annotations[i].parentNode.removeChild(annotations[i]);
			}
		}
		modules['hover'].close(false);
	},
	drawHelp: function() {
		var thisHelp = RESUtils.createElementWithID('div', 'keyHelp');
		var helpTable = document.createElement('table');
		thisHelp.appendChild(helpTable);
		var helpTableHeader = document.createElement('thead');
		var helpTableHeaderRow = document.createElement('tr');
		var helpTableHeaderKey = document.createElement('th');
		$(helpTableHeaderKey).text('Key');
		helpTableHeaderRow.appendChild(helpTableHeaderKey);
		var helpTableHeaderFunction = document.createElement('th');
		$(helpTableHeaderFunction).text('Function');
		helpTableHeaderRow.appendChild(helpTableHeaderFunction);
		helpTableHeader.appendChild(helpTableHeaderRow);
		helpTable.appendChild(helpTableHeader);
		var helpTableBody = document.createElement('tbody');
		var isLink = /^link[\d]+$/i;
		for (var i in this.options) {
			if ((this.options[i].type === 'keycode') && (!isLink.test(i))) {
				var thisRow = document.createElement('tr');
				var thisRowKey = document.createElement('td');
				var thisKeyCode = this.getNiceKeyCode(i);
				$(thisRowKey).html(thisKeyCode);
				thisRow.appendChild(thisRowKey);
				var thisRowDesc = document.createElement('td');
				$(thisRowDesc).html(this.options[i].description);
				thisRow.appendChild(thisRowDesc);
				helpTableBody.appendChild(thisRow);
			}
		}
		helpTable.appendChild(helpTableBody);
		document.body.appendChild(thisHelp);
	},
	getNiceKeyCode: function(optionKey) {
		var keyCodeArray = this.options[optionKey].value;
		if (!keyCodeArray) {
			return;
		}

		if (typeof keyCodeArray === 'string') {
			keyCodeArray = parseInt(keyCodeArray, 10);
		}
		if (typeof keyCodeArray === 'number') {
			keyCodeArray = [keyCodeArray, false, false, false, false];
		}
		var niceKeyCode = RESUtils.niceKeyCode(keyCodeArray);
		return niceKeyCode;
	},
	handleKeyPress: function(e) {
		var konamitest = (typeof konami === 'undefined') || (!konami.almostThere);
		if ((document.activeElement.tagName === 'BODY') && (konamitest)) {
			// comments page, or link list?
			var keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
			switch (this.pageType) {
				case 'linklist':
				case 'profile':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveTop.value):
							this.moveTop();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveBottom.value):
							this.moveBottom();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLink.value):
							this.followLink();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkNewTab.value):
							e.preventDefault();
							this.followLink(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followComments.value):
							this.followComments();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followCommentsNewTab.value):
							e.preventDefault();
							this.followComments(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleExpando.value):
							this.toggleExpando();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUp.value):
							this.imageSizeUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDown.value):
							this.imageSizeDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUpFine.value):
							this.imageSizeUp(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDownFine.value):
							this.imageSizeDown(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleViewImages.value):
							this.toggleViewImages();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkAndCommentsNewTab.value):
							e.preventDefault();
							this.followLinkAndComments();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkAndCommentsNewTabBG.value):
							e.preventDefault();
							this.followLinkAndComments(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.save.value):
							this.saveLink();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							e.preventDefault();
							this.goMode();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							e.preventDefault();
							this.inbox(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							e.preventDefault();
							this.profile();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							e.preventDefault();
							this.profile(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							e.preventDefault();
							this.frontPage(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextPage.value):
							e.preventDefault();
							this.nextPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.prevPage.value):
							e.preventDefault();
							this.prevPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							modules['commandLine'].toggleCmdLine();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.hide.value):
							this.hide();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followSubreddit.value):
							this.followSubreddit();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followSubredditNewTab.value):
							this.followSubreddit(true);
							break;
						default:
							// do nothing. unrecognized key.
							break;
					}
					break;
				case 'comments':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							modules['commandLine'].toggleCmdLine();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveUpSibling.value):
							this.moveUpSibling();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDownSibling.value):
							this.moveDownSibling();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveUpThread.value):
							this.moveUpThread();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDownThread.value):
							this.moveDownThread();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveToTopComment.value):
							this.moveToTopComment();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveToParent.value):
							this.moveToParent();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.showParents.value):
							this.showParents();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleChildren.value):
							this.toggleChildren();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkNewTab.value):
							// only execute if the link is selected on a comments page...
							if (this.activeIndex === 0) {
								e.preventDefault();
								this.followLink(true);
							}
							break;
						case RESUtils.checkKeysForEvent(e, this.options.save.value):
							if (this.activeIndex === 0) {
								this.saveLink();
							} else {
								this.saveComment();
							}
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleExpando.value):
							this.toggleAllExpandos();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUp.value):
							this.imageSizeUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDown.value):
							this.imageSizeDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUpFine.value):
							this.imageSizeUp(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDownFine.value):
							this.imageSizeDown(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleViewImages.value):
							this.toggleViewImages();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.reply.value):
							e.preventDefault();
							this.reply();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							e.preventDefault();
							this.goMode();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							e.preventDefault();
							this.inbox(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							e.preventDefault();
							this.profile();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							e.preventDefault();
							this.profile(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							e.preventDefault();
							this.frontPage(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextPage.value):
							e.preventDefault();
							this.nextPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.prevPage.value):
							e.preventDefault();
							this.prevPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link1.value):
							e.preventDefault();
							this.commentLink(0);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link2.value):
							e.preventDefault();
							this.commentLink(1);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link3.value):
							e.preventDefault();
							this.commentLink(2);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link4.value):
							e.preventDefault();
							this.commentLink(3);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link5.value):
							e.preventDefault();
							this.commentLink(4);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link6.value):
							e.preventDefault();
							this.commentLink(5);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link7.value):
							e.preventDefault();
							this.commentLink(6);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link8.value):
							e.preventDefault();
							this.commentLink(7);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link9.value):
							e.preventDefault();
							this.commentLink(8);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link10.value):
							e.preventDefault();
							this.commentLink(9);
							break;
						default:
							// do nothing. unrecognized key.
							break;
					}
					break;
				case 'inbox':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							modules['commandLine'].toggleCmdLine();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleChildren.value):
							this.toggleChildren();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.reply.value):
							e.preventDefault();
							this.reply();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							e.preventDefault();
							this.goMode();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							e.preventDefault();
							this.inbox(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							e.preventDefault();
							this.profile();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							e.preventDefault();
							this.profile(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							e.preventDefault();
							this.frontPage(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextPage.value):
							e.preventDefault();
							this.nextPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.prevPage.value):
							e.preventDefault();
							this.prevPage();
							break;
						default:
							// do nothing. unrecognized key.
							break;
					}
					break;
			}
		}
	},
	toggleHelp: function() {
		if (document.getElementById('keyHelp').style.display === 'block') {
			this.hideHelp();
		} else {
			this.showHelp();
		}
	},
	showHelp: function() {
		// show help!
		RESUtils.fadeElementIn(document.getElementById('keyHelp'), 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'keyboardnavhelp');
	},
	hideHelp: function() {
		// hide help!
		RESUtils.fadeElementOut(document.getElementById('keyHelp'), 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'keyboardnavhelp');
	},
	hide: function() {
		// find the hide link and click it...
		var hideLink = this.keyboardLinks[this.activeIndex].querySelector('form.hide-button > span > a');
		RESUtils.click(hideLink);
		// if ((this.options.onHideMoveDown.value) && (!modules['betteReddit'].options.fixHideLink.value)) {
		if (this.options.onHideMoveDown.value) {
			this.moveDown();
		}
	},
	followSubreddit: function(newWindow) {
		// find the subreddit link and click it...
		var srLink = this.keyboardLinks[this.activeIndex].querySelector('A.subreddit');
		if (srLink) {
			var thisHREF = srLink.getAttribute('href');
			if (newWindow) {
				var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1,
					thisJSON = {
						requestType: 'keyboardNav',
						linkURL: thisHREF,
						button: button
					};

				RESUtils.sendMessage(thisJSON);
			} else {
				location.href = thisHREF;
			}
		}
	},
	moveUp: function() {
		if (this.activeIndex > 0) {
			this.fromKey = true;
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex--;
			var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			// skip over hidden elements...
			while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex > 0)) {
				this.activeIndex--;
				thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) || (this.options.scrollStyle.value === 'top')) {
				RESUtils.scrollTo(0, thisXY.y);
			}

			modules['keyboardNav'].recentKey();
		}
	},
	moveDown: function() {
		if (this.activeIndex < this.keyboardLinks.length - 1) {
			this.fromKey = true;
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex++;
			var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			// skip over hidden elements...
			while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length - 1)) {
				this.activeIndex++;
				thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			/*
			if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) || (this.options.scrollTop.value)) {
				RESUtils.scrollTo(0,thisXY.y);
			}
			*/
			if (this.options.scrollStyle.value === 'top') {
				RESUtils.scrollTo(0, thisXY.y);
			} else if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex])))) {
				var thisHeight = this.keyboardLinks[this.activeIndex].offsetHeight;
				if (this.options.scrollStyle.value === 'page') {
					RESUtils.scrollTo(0, thisXY.y);
				} else {
					RESUtils.scrollTo(0, thisXY.y - window.innerHeight + thisHeight + 5);
				}
			}
			// note: we don't want to go to the next page if we're on the dashboard...
			if ((!RESUtils.currentSubreddit('dashboard')) && (RESUtils.pageType() === 'linklist') && (this.activeIndex == (this.keyboardLinks.length - 1) && (modules['neverEndingReddit'].isEnabled() && modules['neverEndingReddit'].options.autoLoad.value))) {
				this.nextPage();
			}
			modules['keyboardNav'].recentKey();
		}
	},
	moveTop: function() {
		this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
		this.activeIndex = 0;
		this.keyFocus(this.keyboardLinks[this.activeIndex]);
		var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
		if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
			RESUtils.scrollTo(0, thisXY.y);
		}
		modules['keyboardNav'].recentKey();
	},
	moveBottom: function() {
		this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
		this.activeIndex = this.keyboardLinks.length - 1;
		this.keyFocus(this.keyboardLinks[this.activeIndex]);
		var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
		if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
			RESUtils.scrollTo(0, thisXY.y);
		}
		modules['keyboardNav'].recentKey();
	},
	moveDownSibling: function() {
		if (this.activeIndex < this.keyboardLinks.length - 1) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			var thisParent = this.keyboardLinks[this.activeIndex].parentNode;
			var childCount = thisParent.querySelectorAll('.entry').length;
			this.activeIndex += childCount;
			// skip over hidden elements...
			var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length - 1)) {
				this.activeIndex++;
				thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			if ((this.pageType === 'linklist') || (this.pageType === 'profile')) {
				this.setKeyIndex();
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0, thisXY.y);
			}
		}
		modules['keyboardNav'].recentKey();
	},
	moveUpSibling: function() {
		if (this.activeIndex < this.keyboardLinks.length - 1) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			var thisParent = this.keyboardLinks[this.activeIndex].parentNode,
				childCount;
			if (thisParent.previousSibling !== null) {
				childCount = thisParent.previousSibling.previousSibling.querySelectorAll('.entry').length;
			} else {
				childCount = 1;
			}
			this.activeIndex -= childCount;
			// skip over hidden elements...
			var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length - 1)) {
				this.activeIndex++;
				thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			if ((this.pageType === 'linklist') || (this.pageType === 'profile')) {
				this.setKeyIndex();
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0, thisXY.y);
			}
		}
		modules['keyboardNav'].recentKey();
	},
	moveUpThread: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			this.moveToTopComment();
		}
		this.moveUpSibling();
	},
	moveDownThread: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			this.moveToTopComment();
		}
		this.moveDownSibling();
	},
	moveToTopComment: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			//goes up to the root of the current thread
			while (!firstParent.parentNode.parentNode.parentNode.classList.contains('content') && (firstParent !== null)) {
				this.moveToParent();
				firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			}
		}
	},
	moveToParent: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			// check if we're at the top parent, first... if the great grandparent has a class of content, do nothing.
			if (!firstParent.parentNode.parentNode.parentNode.classList.contains('content')) {
				if (firstParent !== null) {
					this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
					var $thisParent = $(firstParent).parent().parent().prev().parent();
					var newKeyIndex = parseInt($thisParent.data('keyIndex'), 10);
					this.activeIndex = newKeyIndex;
					this.keyFocus(this.keyboardLinks[this.activeIndex]);
					var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
					if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
						RESUtils.scrollTo(0, thisXY.y);
					}
				}
			}
		}
		modules['keyboardNav'].recentKey();
	},
	showParents: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			if (firstParent != null) {
				var button = $(this.keyboardLinks[this.activeIndex]).find('.buttons :not(:first-child) .bylink:first').get(0);
				modules['hover'].begin(button, {}, modules['showParent'].showCommentHover, {});
			}
		}
	},
	toggleChildren: function() {
		if (this.activeIndex === 0) {
			// Ahh, we're not in a comment, but in the main story... that key should follow the link.
			this.followLink();
		} else {
			// find out if this is a collapsed or uncollapsed view...
			var thisCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.collapsed');
			var thisNonCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.noncollapsed');
			if (thisCollapsed.style.display !== 'none') {
				thisToggle = thisCollapsed.querySelector('a.expand');
			} else {
				// check if this is a "show more comments" box, or just contracted content...
				moreComments = thisNonCollapsed.querySelector('span.morecomments > a');
				if (moreComments) {
					thisToggle = moreComments;
				} else {
					thisToggle = thisNonCollapsed.querySelector('a.expand');
				}
				// 'continue this thread' links
				contThread = thisNonCollapsed.querySelector('span.deepthread > a');
				if (contThread) {
					thisToggle = contThread;
				}
			}
			RESUtils.click(thisToggle);
		}
	},
	toggleExpando: function() {
		var thisExpando = this.keyboardLinks[this.activeIndex].querySelector('.expando-button');
		if (thisExpando) {
			RESUtils.click(thisExpando);
			if (this.options.scrollOnExpando.value) {
				var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
				RESUtils.scrollTo(0, thisXY.y);
			}
		}
	},
	imageResize: function(factor) {
		var images = $(this.activeElement).find('.RESImage.loaded, .madeVisible video'),
			thisWidth;

		for (var i = 0, len = images.length; i < len; i++) {
			thisWidth = $(images[i]).width();
			modules['showImages'].resizeImage(images[i], thisWidth + factor);
		}
	},
	imageSizeUp: function(fineControl) {
		var factor = (fineControl) ? 50 : 150;
		this.imageResize(factor);
	},
	imageSizeDown: function(fineControl) {
		var factor = (fineControl) ? -50 : -150;
		this.imageResize(factor);
	},
	previousGalleryImage: function() {
		var previousButton = this.keyboardLinks[this.activeIndex].querySelector('.RESGalleryControls .previous');
		if (previousButton) {
			RESUtils.click(previousButton);
		}
	},
	nextGalleryImage: function() {
		var nextButton = this.keyboardLinks[this.activeIndex].querySelector('.RESGalleryControls .next');
		if (nextButton) {
			RESUtils.click(nextButton);
		}
	},
	toggleViewImages: function() {
		var thisViewImages = document.getElementById('viewImagesButton');
		if (thisViewImages) {
			RESUtils.click(thisViewImages);
		}
	},
	toggleAllExpandos: function() {
		var thisExpandos = this.keyboardLinks[this.activeIndex].querySelectorAll('.expando-button');
		if (thisExpandos) {
			for (var i = 0, len = thisExpandos.length; i < len; i++) {
				RESUtils.click(thisExpandos[i]);
			}
		}
	},
	followLink: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.title');
		var thisHREF = thisA.getAttribute('href');
		if (newWindow) {
			var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1,
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				};

			RESUtils.sendMessage(thisJSON);
		} else {
			location.href = thisHREF;
		}
	},
	followComments: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.comments'),
			thisHREF = thisA.getAttribute('href');
		if (newWindow) {
			var thisJSON = {
				requestType: 'keyboardNav',
				linkURL: thisHREF
			};

			RESUtils.sendMessage(thisJSON);
		} else {
			location.href = thisHREF;
		}
	},
	followLinkAndComments: function(background) {
		// find the [l+c] link and click it...
		var lcLink = this.keyboardLinks[this.activeIndex].querySelector('.redditSingleClick');
		RESUtils.mousedown(lcLink, background);
	},
	upVote: function(link) {
		if (typeof this.keyboardLinks[this.activeIndex] === 'undefined') {
			return false;
		}

		var upVoteButton;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName === 'A') {
			upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.upmod');
		} else {
			upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.upmod');
		}

		RESUtils.click(upVoteButton);

		if (link && this.options.onVoteMoveDown.value) {
			this.moveDown();
		}
	},
	downVote: function(link) {
		if (typeof this.keyboardLinks[this.activeIndex] === 'undefined') {
			return false;
		}

		var downVoteButton;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName === 'A') {
			downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.downmod');
		} else {
			downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.downmod');
		}

		RESUtils.click(downVoteButton);

		if (link && this.options.onVoteMoveDown.value) {
			this.moveDown();
		}
	},
	saveLink: function() {
		var saveLink = this.keyboardLinks[this.activeIndex].querySelector('form.save-button a') || this.keyboardLinks[this.activeIndex].querySelector('form.unsave-button a');
		if (saveLink) {
			RESUtils.click(saveLink);
		}
	},
	saveComment: function() {
		var saveComment = this.keyboardLinks[this.activeIndex].querySelector('.saveComments');
		if (saveComment) {
			RESUtils.click(saveComment);
		}
	},
	reply: function() {
		// activeIndex = 0 means we're at the original post, not a comment
		if ((this.activeIndex > 0) || (RESUtils.pageType() !== 'comments')) {
			if ((RESUtils.pageType() === 'comments') && (this.activeIndex === 0) && (location.href.indexOf('/message/') === -1)) {
				$('.usertext-edit textarea:first').focus();
			} else {
				var commentButtons = this.keyboardLinks[this.activeIndex].querySelectorAll('ul.buttons > li > a');
				for (var i = 0, len = commentButtons.length; i < len; i++) {
					if (commentButtons[i].innerHTML === 'reply') {
						RESUtils.click(commentButtons[i]);
					}
				}
			}
		} else {
			var firstCommentBox = document.querySelector('.commentarea textarea[name=text]');
			if (firstCommentBox && $(firstCommentBox).is(':visible')) {
				firstCommentBox.focus();
			} else {
				// uh oh, we must be in a subpage, there is no first comment box. The user probably wants to reply to the OP. Let's take them to the comments page.
				var commentButton = this.keyboardLinks[this.activeIndex].querySelector('ul.buttons > li > a.comments');
				location.href = commentButton.getAttribute('href');
			}
		}
	},
	navigateTo: function(newWindow, thisHREF) {
		if (newWindow) {
			var thisJSON;
			if (BrowserDetect.isChrome()) {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				};
				chrome.runtime.sendMessage(thisJSON);
			} else if (BrowserDetect.isSafari()) {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				};
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (BrowserDetect.isOpera()) {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				};
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else {
				window.open(thisHREF);
			}
		} else {
			location.href = thisHREF;
		}
	},
	goMode: function() {
		if (!modules['keyboardNav'].options.useGoMode.value) {
			return;
		}
		modules['keyboardNav'].goModeActive = !modules['keyboardNav'].goModeActive;
		if (modules['keyboardNav'].goModeActive) {
			if (!modules['keyboardNav'].goModePanel) {
				var $shortCutList, $contents, niceKeyCode;

				modules['keyboardNav'].goModePanel = $('<div id="goModePanel" class="RESDialogSmall">')
					.append('<h3>Press a key to go:</h3><div id="goModeCloseButton" class="RESCloseButton">&times;</div>');

				// add the keyboard shortcuts...
				$contents = $('<div class="RESDialogContents"></div>');
				$shortCutList = $('<table>');
				for (var key in modules['keyboardNav'].options) {
					if (modules['keyboardNav'].options[key].isGoTo) {
						niceKeyCode = modules['keyboardNav'].getNiceKeyCode(key);
						$shortCutList.append('<tr><td>'+niceKeyCode+'</td><td class="arrow">&rarr;</td><td>'+key+'</td></tr>');
					}
				}
				$contents.append($shortCutList);
				modules['keyboardNav'].goModePanel.append($contents);
				modules['keyboardNav'].goModePanel.on('click', '.RESCloseButton', modules['keyboardNav'].goMode);
			}
			$('body').on('keyup', modules['keyboardNav'].handleGoModeEscapeKey);
			$(document.body).append(modules['keyboardNav'].goModePanel);
			modules['keyboardNav'].goModePanel.fadeIn();
		} else {
			modules['keyboardNav'].hideGoModePanel();
		}
	},
	hideGoModePanel: function() {
		modules['keyboardNav'].goModeActive = false;
		modules['keyboardNav'].goModePanel.fadeOut();
		$('body').off('keyup', modules['keyboardNav'].handleGoModeEscapeKey);
	},
	handleGoModeEscapeKey: function(event) {
		if (event.which === 27) {
			modules['keyboardNav'].hideGoModePanel();
		}
	},
	inbox: function(newWindow) {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		var thisHREF = location.protocol + '//' + location.hostname + '/message/inbox/';
		modules['keyboardNav'].navigateTo(newWindow, thisHREF);
	},
	profile: function(newWindow) {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		var thisHREF = location.protocol + '//' + location.hostname + '/user/' + RESUtils.loggedInUser();
		modules['keyboardNav'].navigateTo(newWindow, thisHREF);
	},
	frontPage: function(subreddit) {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();

		if (subreddit && !RESUtils.currentSubreddit()) {
			return;
		}
		
		var newhref = location.protocol + '//' + location.hostname + '/';
		if (subreddit) {
			newhref += 'r/' + RESUtils.currentSubreddit();
		}
		location.href = newhref;
	},
	nextPage: function() {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		// if Never Ending Reddit is enabled, just scroll to the bottom.  Otherwise, click the 'next' link.
		if ((modules['neverEndingReddit'].isEnabled()) && (modules['neverEndingReddit'].progressIndicator)) {
			RESUtils.click(modules['neverEndingReddit'].progressIndicator);
			this.moveBottom();
		} else {
			// get the first link to the next page of reddit...
			var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks();
			var link = nextPrevLinks.next;
			if (link) {
				// RESUtils.click(nextLink);
				location.href = link.getAttribute('href');
			}
		}
	},
	prevPage: function() {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		// if Never Ending Reddit is enabled, do nothing.  Otherwise, click the 'prev' link.
		if (modules['neverEndingReddit'].isEnabled()) {
			return false;
		} else {
			var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks();
			var link = nextPrevLinks.prev;
			if (link) {
				// RESUtils.click(prevLink);
				location.href = link.getAttribute('href');
			}
		}
	},
	getCommentLinks: function(obj) {
		if (!obj) {
			obj = this.keyboardLinks[this.activeIndex];
		}
		return obj.querySelectorAll('div.md a:not(.expando-button):not(.madeVisible):not([href^="javascript:"])');
	},
	commentLink: function(num) {
		if (this.options.commentsLinkNumbers.value) {
			var links = this.getCommentLinks();
			if (typeof links[num] !== 'undefined') {
				var thisLink = links[num];
				if ((thisLink.nextSibling) && (typeof thisLink.nextSibling.tagName !== 'undefined') && (thisLink.nextSibling.classList.contains('expando-button'))) {
					thisLink = thisLink.nextSibling;
				}
				// RESUtils.click(thisLink);
				this.handleKeyLink(thisLink);
			}
		}
	}
};
