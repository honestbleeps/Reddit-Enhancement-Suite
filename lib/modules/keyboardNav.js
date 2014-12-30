modules['keyboardNav'] = {
	moduleID: 'keyboardNav',
	moduleName: 'Keyboard Navigation',
	category: 'UI',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value..
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		addFocusBGColor: {
			type: 'boolean',
			value: true,
			description: 'Set a background color to highlight the currently focused element'
		},
		focusBGColor: {
			type: 'color',
			value: '#F0F3FC',
			description: 'Background color of focused element',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		focusBGColorNight: {
			type: 'color',
			value: '#373737',
			description: 'Background color of focused element in Night Mode',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		focusFGColorNight: {
			type: 'color',
			value: '#DDDDDD',
			description: 'Foreground color of focused element in Night Mode',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		addFocusBorder: {
			type: 'boolean',
			value: true,
			description: 'Set a border to highlight the currently focused element'
		},
		focusBorder: {
			type: 'text',
			value: '',
			description: 'border style (e.g. 1px dashed gray) for focused element',
			advanced: true,
			dependsOn: 'addFocusBorder'
		},
		focusBorderNight: {
			type: 'text',
			value: '',
			description: 'border style (e.g. 1px dashed gray) for focused element in Night Mode',
			advanced: true,
			dependsOn: 'addFocusBorder'
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
			description: 'Scroll window to top of link when expando key is used (to keep pics etc in view)',
			advanced: true
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
			description: 'When moving up/down with keynav, when and how should RES scroll the window?',
			advanced: true
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
			description: 'Which side commentsLinkNumbers are displayed',
			advanced: true
		},
		commentsLinkNewTab: {
			type: 'boolean',
			value: true,
			description: 'Open number key links in a new tab',
			advanced: true
		},
		clickFocus: {
			type: 'boolean',
			value: true,
			description: 'Move keyboard focus to a link or comment when clicked with the mouse',
			advanced: true
		},
		onHideMoveDown: {
			type: 'boolean',
			value: true,
			description: 'After hiding a link, automatically select the next link',
			advanced: true
		},
		onVoteMoveDown: {
			type: 'boolean',
			value: false,
			description: 'After voting on a link, automatically select the next link',
			advanced: true
		},
		onVoteCommentMoveDown: {
			type: 'boolean',
			value: false,
			description: 'After voting on a comment, automatically select the next comment',
			advanced: true
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
			description: 'When following a link in new tab - focus the tab?',
			advanced: true
		},
		toggleExpando: {
			type: 'keycode',
			value: [88, false, false, false], // x
			description: 'Toggle expando (image/text/video) (link pages only)'
		},
		imageSizeUp: {
			type: 'keycode',
			value: [187, false, false, false], // = -- 61 in firefox
			description: 'Increase the size of image(s) in the highlighted post area'
		},
		imageSizeDown: {
			type: 'keycode',
			value: [189, false, false, false], // - -- 173 in firefox
			description: 'Decrease the size of image(s) in the highlighted post area'
		},
		imageSizeUpFine: {
			type: 'keycode',
			value: [187, false, false, true], // shift-=
			description: 'Increase the size of image(s) in the highlighted post area (finer control)'
		},
		imageSizeDownFine: {
			type: 'keycode',
			value: [189, false, false, true], // shift--
			description: 'Decrease the size of image(s) in the highlighted post area (finer control)'
		},
		imageMoveUp: {
			type: 'keycode',
			value: [38, false, true, false], // ctrl-up
			description: 'Move the image(s) in the highlighted post area up'
		},
		imageMoveDown: {
			type: 'keycode',
			value: [40, false, true, false], // ctrl-down
			description: 'Move the image(s) in the highlighted post area down'
		},
		imageMoveLeft: {
			type: 'keycode',
			value: [37, false, true, false], // ctrl-left
			description: 'Move the image(s) in the highlighted post area left'
		},
		imageMoveRight: {
			type: 'keycode',
			value: [39, false, true, false], // ctrl-right
			description: 'Move the image(s) in the highlighted post area right'
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
			description: 'Upvote selected link or comment (or remove the upvote)'
		},
		downVote: {
			type: 'keycode',
			value: [90, false, false, false], // z
			description: 'Downvote selected link or comment (or remove the downvote)'
		},
		upVoteWithoutToggling: {
			type: 'keycode',
			value: [65, false, false, true], // a
			description: 'Upvote selected link or comment (but don\'t remove the upvote)'
		},
		downVoteWithoutToggling: {
			type: 'keycode',
			value: [90, false, false, true], // z
			description: 'Downvote selected link or comment (but don\'t remove the downvote)'
		},
		savePost: {
			type: 'keycode',
			value: [83, false, false, false], // s
			description: 'Save the current post to your reddit account. This is accessible from anywhere that you\'re logged in, but does not preserve the original text if it\'s edited or deleted.'
		},
		saveComment: {
			type: 'keycode',
			value: [83, false, false, true], // shift-s
			description: 'Save the current comment to your reddit account. This is accessible from anywhere that you\'re logged in, but does not preserve the original text if it\'s edited or deleted.'
		},
		saveRES: {
			type: 'keycode',
			value: [83, false, false, false], // s
			description: 'Save the current comment with RES. This does preserve the original text of the comment, but is only saved locally.'
		},
		reply: {
			type: 'keycode',
			value: [82, false, false, false], // r
			description: 'Reply to current comment (comment pages only)'
		},
		followPermalink: {
			type: 'keycode',
			value: [89, false, false, false], // y
			description: 'Open the current comment\'s permalink (comment pages only)'
		},
		followPermalinkNewTab: {
			type: 'keycode',
			value: [89, false, false, true], // shift-y
			description: 'Open the current comment\'s permalink in a new tab (comment pages only)'
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
		modmail: {
			type: 'keycode',
			value: [77, false, false, false], // m
			description: 'Go to modmail',
			isGoTo: true
		},
		modmailNewTab: {
			type: 'keycode',
			value: [77, false, false, true], // shift+m
			description: 'Go to modmail in a new tab',
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
		random: {
			type: 'keycode',
			value: [89, true, false, false], // alt-y   SO RANDOM
			description: 'Go to a random subreddit',
			isGoTo : true
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
		},
		link1NumPad: {
			type: 'keycode',
			value: [97, false, false, false], // 1
			description: 'Open first link within comment.',
			noconfig: true
		},
		link2NumPad: {
			type: 'keycode',
			value: [98, false, false, false], // 2
			description: 'Open link #2 within comment.',
			noconfig: true
		},
		link3NumPad: {
			type: 'keycode',
			value: [99, false, false, false], // 3
			description: 'Open link #3 within comment.',
			noconfig: true
		},
		link4NumPad: {
			type: 'keycode',
			value: [100, false, false, false], // 4
			description: 'Open link #4 within comment.',
			noconfig: true
		},
		link5NumPad: {
			type: 'keycode',
			value: [101, false, false, false], // 5
			description: 'Open link #5 within comment.',
			noconfig: true
		},
		link6NumPad: {
			type: 'keycode',
			value: [102, false, false, false], // 6
			description: 'Open link #6 within comment.',
			noconfig: true
		},
		link7NumPad: {
			type: 'keycode',
			value: [103, false, false, false], // 7
			description: 'Open link #7 within comment.',
			noconfig: true
		},
		link8NumPad: {
			type: 'keycode',
			value: [104, false, false, false], // 8
			description: 'Open link #8 within comment.',
			noconfig: true
		},
		link9NumPad: {
			type: 'keycode',
			value: [105, false, false, false], // 9
			description: 'Open link #9 within comment.',
			noconfig: true
		},
		link10NumPad: {
			type: 'keycode',
			value: [96, false, false, false], // 0
			description: 'Open link #10 within comment.',
			noconfig: true
		},
		toggleCommentNavigator: {
			type: 'keycode',
			value: [78, false, false, false], // N
			description: 'Open Comment Navigator'
		},
		commentNavigatorMoveUp: {
			type: 'keycode',
			value: [38, false, false, true], // shift+up arrow
			description: 'Move up using Comment Navigator'
		},
		commentNavigatorMoveDown: {
			type: 'keycode',
			value: [40, false, false, true], // shift+down arrow
			description: 'Move down using Comment Navigator'
		}
	},
	description: 'Keyboard navigation for reddit!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (modules['keyboardNav'].options.addFocusBGColor.value) {
				modules['keyboardNav'].addFocusBGColor();
			}
			if (modules['keyboardNav'].options.addFocusBorder.value) {
				modules['keyboardNav'].addFocusBorder();
			}

			RESUtils.addCSS(' \
				.entry { padding-right: 5px; } \
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
			window.addEventListener('keydown', function(e) {
				if (modules['keyboardNav'].handleKeyPress(e)) {
					e.preventDefault();
				}
			}, true);
			this.scanPageForKeyboardLinks();
			// listen for new DOM nodes so that modules like autopager, never ending reddit, "load more comments" etc still get keyboard nav.
			if (RESUtils.pageType() === 'comments') {
				RESUtils.watchForElement('newComments', modules['keyboardNav'].scanPageForNewKeyboardLinks);
			} else {
				RESUtils.watchForElement('siteTable', modules['keyboardNav'].scanPageForNewKeyboardLinks);
			}

			this.registerCommandLine();
		}
	},

	registerCommandLine: function() {
		modules['commandLine'].registerCommand(/\d+/, '[number] - navigates to the link with that number (comments pages) or rank (link pages)',
			function(command, val, match) {},
			function(command, val, match, e) {
				if (RESUtils.pageType() === 'comments') {
					// comment link number? (integer)
					modules['keyboardNav'].commentLink(parseInt(command, 10) - 1);
				} else if (RESUtils.pageType() === 'linklist') {
					modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
					modules['keyboardNav'].activeIndex = parseInt(command, 10) - 1;
					modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
					modules['keyboardNav'].followLink();
				}
			}
		);

	},

	// old style: .RES-keyNav-activeElement { '+borderType+': '+focusBorder+'; background-color: '+focusBGColor+'; } \
	// this new pure CSS arrow will not work because to position it we must have .RES-keyNav-activeElement position relative, but that screws up image viewer's absolute positioning to
	// overlay over the sidebar... yikes.
	// .RES-keyNav-activeElement:after { content: ""; float: right; margin-right: -5px; border-color: transparent '+focusBorderColor+' transparent transparent; border-style: solid; border-width: 3px 4px 3px 0; } \

	// why !important on .RES-keyNav-activeElement?  Because some subreddits are unfortunately using !important for no good reason on .entry divs...

	addFocusBGColor: function() {
		var focusFGColorNight, focusBGColor, focusBGColorNight;

		if (typeof this.options.focusBGColor === 'undefined') {
			focusBGColor = '#F0F3FC';
		} else {
			focusBGColor = this.options.focusBGColor.value;
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

		RESUtils.addCSS('	\
			.RES-keyNav-activeElement, .commentarea .RES-keyNav-activeElement .md, .commentarea .RES-keyNav-activeElement.entry .noncollapsed { background-color: ' + focusBGColor + ' !important; } \
			.res-nightmode .RES-keyNav-activeElement, .res-nightmode .RES-keyNav-activeElement .usertext-body, .res-nightmode .RES-keyNav-activeElement .usertext-body .md, .res-nightmode .RES-keyNav-activeElement .usertext-body .md p, .res-nightmode .commentarea .RES-keyNav-activeElement .noncollapsed, .res-nightmode .RES-keyNav-activeElement .noncollapsed .md, .res-nightmode .RES-keyNav-activeElement .noncollapsed .md p { background-color: ' + focusBGColorNight + ' !important; color: ' + focusFGColorNight + ' !important;} \
			.res-nightmode .RES-keyNav-activeElement a.title:first-of-type {color: ' + focusFGColorNight + ' !important; } \
			');

	},
	addFocusBorder: function() {
		var focusBorder, focusBorderNight;
		var borderType = BrowserStrategy.getOutlineProperty() || 'outline';

		if (typeof this.options.focusBorder === 'undefined') {
			focusBorder = '';
		} else {
			focusBorder = borderType + ': ' + this.options.focusBorder.value + ';';
		}
		if (typeof this.options.focusBorderNight === 'undefined') {
			focusBorderNight = '';
		} else {
			focusBorderNight = borderType + ': ' + this.options.focusBorderNight.value + ';';
		}

		RESUtils.addCSS('	\
			.RES-keyNav-activeElement { ' + focusBorder + ' } \
			.res-nightmode .RES-keyNav-activeElement { ' + focusBorderNight + ' } \
			');
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
			if (this.options.mediaBrowseMode.value && this.fromKey && !modules['showImages'].haltMediaBrowseMode) {
				if (this.lastLinkExpanded === true) {
					var $expando = $(obj).find('.expando-button:not(.expanded)');
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

					var annotation = document.createElement('span');
					annotationCount++;
					$(annotation).text('[' + annotationCount + '] ');
					if (annotationCount <= 9) {
						annotation.title = 'press ' + annotationCount + ' to open link';
					}
					else if (annotationCount === 10) {
						annotation.title = 'press 0 to open link';
					}
					else {
						annotation.title = 'press ' + this.getNiceKeyCode('toggleCmdLine') + ' then ' +annotationCount + ' and Enter to open link';
					}
					annotation.classList.add('keyNavAnnotation');
					if (modules['keyboardNav'].options.commentsLinkNumberPosition.value === 'right') {
						RESUtils.insertAfter(links[i], annotation);
					} else {
						links[i].parentNode.insertBefore(annotation, links[i]);
					}
				}
			}
		}
	},
	handleKeyLink: function(link) {
		var button = 0;
		if (modules['keyboardNav'].options.commentsLinkNewTab.value) {
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

			BrowserStrategy.sendMessage(thisJSON);
		} else {
			location.href = this.getAttribute('href');
		}
	},
	keyUnfocus: function(obj) {
		if (this.options.mediaBrowseMode.value && this.fromKey && !modules['showImages'].haltMediaBrowseMode) {
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
		this.keyHelp = RESUtils.createElementWithID('div', 'keyHelp');
		var helpTable = document.createElement('table');
		this.keyHelp.appendChild(helpTable);
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
				$(thisRowKey).text(thisKeyCode);
				thisRow.appendChild(thisRowKey);
				var thisRowDesc = document.createElement('td');
				$(thisRowDesc).text(this.options[i].description);
				thisRow.appendChild(thisRowDesc);
				helpTableBody.appendChild(thisRow);
			}
		}
		helpTable.appendChild(helpTableBody);
		document.body.appendChild(this.keyHelp);
		this.helpDrawn = true;
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
			switch (this.pageType) {
				case 'linklist':
				case 'profile':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveTop.value):
							this.moveTop();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveBottom.value):
							this.moveBottom();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followLink.value):
							this.followLink();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkNewTab.value):
							this.followLink(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followComments.value):
							this.followComments();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followCommentsNewTab.value):
							e.preventDefault();
							this.followComments(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleExpando.value):
							this.toggleExpando();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUp.value):
							this.imageSizeUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDown.value):
							this.imageSizeDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUpFine.value):
							this.imageSizeUp(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDownFine.value):
							this.imageSizeDown(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveUp.value):
							this.imageMoveUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveDown.value):
							this.imageMoveDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveLeft.value):
							this.imageMoveLeft();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveRight.value):
							this.imageMoveRight();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleViewImages.value):
							this.toggleViewImages();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkAndCommentsNewTab.value):
							this.followLinkAndComments();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkAndCommentsNewTabBG.value):
							this.followLinkAndComments(true);
							return true;
						// don't-remove voting must precede regular voting
						case RESUtils.checkKeysForEvent(e, this.options.upVoteWithoutToggling.value):
							this.upVote(true, true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.downVoteWithoutToggling.value):
							this.downVote(true, true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.savePost.value):
							this.saveLink();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							this.goMode();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							this.inbox();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							this.inbox(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.modmail.value):
							this.modmail();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.modmailNewTab.value):
							this.modmail(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							this.profile();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							this.profile(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							this.frontPage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							this.frontPage(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.random.value):
							this.random();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.nextPage.value):
							this.nextPage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.prevPage.value):
							this.prevPage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							modules['commandLine'].toggleCmdLine();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.hide.value):
							this.hide();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followSubreddit.value):
							this.followSubreddit();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followSubredditNewTab.value):
							this.followSubreddit(true);
							return true;
						default:
							// do nothing. unrecognized key.
							return false;
					}
					return false;
				case 'comments':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							modules['commandLine'].toggleCmdLine();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveUpSibling.value):
							this.moveUpSibling();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveDownSibling.value):
							this.moveDownSibling();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveUpThread.value):
							this.moveUpThread();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveDownThread.value):
							this.moveDownThread();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveToTopComment.value):
							this.moveToTopComment();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveToParent.value):
							this.moveToParent();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.showParents.value):
							this.showParents();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleChildren.value):
							this.toggleChildren();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkNewTab.value):
							// only execute if the link is selected on a comments page...
							if (this.activeIndex === 0) {
								this.followLink(true);
								return true;
							}
							return false;
						case RESUtils.checkKeysForEvent(e, this.options.savePost.value) && this.activeIndex === 0:
							this.saveLink();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.saveComment.value) && this.activeIndex !== 0:
							this.saveComment();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.saveRES.value) && this.activeIndex !== 0:
							this.saveCommentRES();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleExpando.value):
							this.toggleAllExpandos();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUp.value):
							this.imageSizeUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDown.value):
							this.imageSizeDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUpFine.value):
							this.imageSizeUp(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDownFine.value):
							this.imageSizeDown(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveUp.value):
							this.imageMoveUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveDown.value):
							this.imageMoveDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveLeft.value):
							this.imageMoveLeft();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveRight.value):
							this.imageMoveRight();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleViewImages.value):
							this.toggleViewImages();
							return true;
						// don't-remove voting must precede regular voting
						case RESUtils.checkKeysForEvent(e, this.options.upVoteWithoutToggling.value):
							this.upVote(false, true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.downVoteWithoutToggling.value):
							this.downVote(false, true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.reply.value):
							this.reply();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followPermalink.value):
							this.followPermalink();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.followPermalinkNewTab.value):
							this.followPermalink(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							this.goMode();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							this.inbox();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							this.inbox(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.modmail.value):
							this.modmail();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.modmailNewTab.value):
							this.modmail(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							this.profile();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							this.profile(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							this.frontPage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							this.frontPage(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link1.value):
						case RESUtils.checkKeysForEvent(e, this.options.link1NumPad.value):
							this.commentLink(0);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link2.value):
						case RESUtils.checkKeysForEvent(e, this.options.link2NumPad.value):
							this.commentLink(1);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link3.value):
						case RESUtils.checkKeysForEvent(e, this.options.link3NumPad.value):
							this.commentLink(2);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link4.value):
						case RESUtils.checkKeysForEvent(e, this.options.link4NumPad.value):
							this.commentLink(3);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link5.value):
						case RESUtils.checkKeysForEvent(e, this.options.link5NumPad.value):
							this.commentLink(4);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link6.value):
						case RESUtils.checkKeysForEvent(e, this.options.link6NumPad.value):
							this.commentLink(5);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link7.value):
						case RESUtils.checkKeysForEvent(e, this.options.link7NumPad.value):
							this.commentLink(6);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link8.value):
						case RESUtils.checkKeysForEvent(e, this.options.link8NumPad.value):
							this.commentLink(7);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link9.value):
						case RESUtils.checkKeysForEvent(e, this.options.link9NumPad.value):
							this.commentLink(8);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.link10.value):
						case RESUtils.checkKeysForEvent(e, this.options.link10NumPad.value):
							this.commentLink(9);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCommentNavigator.value):
							this.toggleCommentNavigator();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.commentNavigatorMoveUp.value):
							this.commentNavigatorMoveUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.commentNavigatorMoveDown.value):
							this.commentNavigatorMoveDown();
							return true;
						default:
							// do nothing. unrecognized key.
							return false;
					}
					return false;
				case 'inbox':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							modules['commandLine'].toggleCmdLine();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleExpando.value):
							this.toggleExpando();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.toggleChildren.value):
							this.toggleChildren();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.reply.value):
							this.reply();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							this.goMode();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							this.inbox();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							this.inbox(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.modmail.value):
							this.modmail();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.modmailNewTab.value):
							this.modmail(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							this.profile();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							this.profile(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							this.frontPage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							this.frontPage(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.random.value):
							this.random();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.nextPage.value):
							this.nextPage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.prevPage.value):
							this.prevPage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUp.value):
							this.imageSizeUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDown.value):
							this.imageSizeDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUpFine.value):
							this.imageSizeUp(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDownFine.value):
							this.imageSizeDown(true);
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveUp.value):
							this.imageMoveUp();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveDown.value):
							this.imageMoveDown();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveLeft.value):
							this.imageMoveLeft();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.imageMoveRight.value):
							this.imageMoveRight();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							return true;
						case RESUtils.checkKeysForEvent(e, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							return true;
						default:
							// do nothing. unrecognized key.
							return false;
					}
					return false;
			}
		}
		return false;
	},
	toggleHelp: function() {
		if (this.keyHelp && this.keyHelp.style.display === 'block') {
			this.hideHelp();
		} else {
			this.showHelp();
		}
	},
	showHelp: function() {
		// show help!
		if (!this.helpDrawn) {
			this.drawHelp();
		}
		RESUtils.fadeElementIn(this.keyHelp, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'keyboardnavhelp');
	},
	hideHelp: function() {
		// hide help!
		RESUtils.fadeElementOut(this.keyHelp, 0.3);
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

				BrowserStrategy.sendMessage(thisJSON);
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
			if (
				(!RESUtils.currentSubreddit('dashboard')) &&
				(RESUtils.pageType() === 'linklist') &&
				(this.activeIndex === (this.keyboardLinks.length - 1) &&
				modules['neverEndingReddit'].isEnabled() &&
				modules['neverEndingReddit'].options.autoLoad.value)
			) {
				this.nextPage(true);
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
			if (firstParent !== null) {
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
			var thisCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.collapsed'),
				thisNonCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.noncollapsed'),
				thisToggle, moreComments, contThread;

			// Detecting and logic for new version of comment threads
			if (!thisCollapsed && !thisNonCollapsed) {
				var currentLink = this.keyboardLinks[this.activeIndex];
				var comment = this.keyboardLinks[this.activeIndex].parentNode;

				thisToggle = comment.querySelector('a.expand');

				// check if this is a "show more comments" box, or just contracted content...
				moreComments = currentLink.querySelector('span.morecomments > a');
				if (moreComments) {
					thisToggle = moreComments;
				}

				// 'continue this thread' links
				contThread = currentLink.querySelector('span.deepthread > a');
				if (contThread) {
					thisToggle = contThread;
				}

				RESUtils.click(thisToggle);
				return;
			}

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
		var images = $(this.activeElement).find('.RESImage, .madeVisible video'),
			thisWidth;

		for (var i = 0, len = images.length; i < len; i++) {
			thisWidth = $(images[i]).width();
			modules['showImages'].resizeMedia(images[i], thisWidth + factor);
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
	imageMoveUp: function() {
		this.imageMove(0, -50);
	},
	imageMoveDown: function() {
		this.imageMove(0, 50);
	},
	imageMoveLeft: function() {
		this.imageMove(-50, 0);
	},
	imageMoveRight: function() {
		this.imageMove(50, 0);
	},
	imageMove: function(deltaX, deltaY) {
		var images = $(document).find('.RESImage');
		if (images.length === 0) {
			return;
		}
		var mostVisible = -1;
		var mostVisiblePercentage = 0;
		for (var i = 0; i < images.length; i++) {
			var percentageVisible = RESUtils.getPercentageVisibleYAxis(images[i]);
			if (percentageVisible > mostVisiblePercentage) {
				mostVisible = i;
				mostVisiblePercentage = percentageVisible;
			}
		}
		// Don't move any images if none are visible
		if (mostVisible === -1) {
			return false;
		}
		modules['showImages'].moveMedia(images[mostVisible], deltaX, deltaY);
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
		var thisHREF = thisA.href;
		if (thisHREF.substring(0, 2) === '//') {
			thisHREF = location.protocol + thisHREF;
		}
		if (newWindow) {
			var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1,
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				};

			BrowserStrategy.sendMessage(thisJSON);
		} else {
			location.href = thisHREF;
		}
	},
	followPermalink: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.bylink');
		var thisHREF = thisA.getAttribute('href');
		if (newWindow) {
			var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1,
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				};

			BrowserStrategy.sendMessage(thisJSON);
		} else {
			location.href = thisHREF;
		}
	},
	followComments: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.comments'),
			thisHREF = thisA.getAttribute('href');
		if (newWindow) {
			var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1,
				thisJSON = {
				requestType: 'keyboardNav',
				linkURL: thisHREF,
				button: button
			};

			BrowserStrategy.sendMessage(thisJSON);
		} else {
			location.href = thisHREF;
		}
	},
	followLinkAndComments: function(background) {
		// find the [l+c] link and click it...
		var lcLink = this.keyboardLinks[this.activeIndex].querySelector('.redditSingleClick');
		RESUtils.mousedown(lcLink, background);
	},
	upVote: function(link, preventToggle) {
		if (typeof this.keyboardLinks[this.activeIndex] === 'undefined') {
			return false;
		}

		var upVoteButton;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName === 'A') {
			upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.upmod');
		} else {
			upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.upmod');
		}

		if (!upVoteButton) {
			return;
		}

		if (modules['noParticipation'].isVotingBlocked()) {
			modules['noParticipation'].notifyNoVote();
		} else {
			if (!preventToggle || !upVoteButton.classList.contains('upmod')) {
				RESUtils.click(upVoteButton);
			}
		}

		if (link && this.options.onVoteMoveDown.value || !link && this.options.onVoteCommentMoveDown.value) {
			this.moveDown();
		}
	},
	downVote: function(link, preventToggle) {
		if (typeof this.keyboardLinks[this.activeIndex] === 'undefined') {
			return false;
		}

		var downVoteButton;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName === 'A') {
			downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.downmod');
		} else {
			downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.downmod');
		}

		if (!downVoteButton) {
			return;
		}

		if (modules['noParticipation'].isVotingBlocked()) {
			modules['noParticipation'].notifyNoVote();
		} else {
			if (!preventToggle || !downVoteButton.classList.contains('downmod')) {
				RESUtils.click(downVoteButton);
			}
		}

		if (link && this.options.onVoteMoveDown.value || !link && this.options.onVoteCommentMoveDown.value) {
			this.moveDown();
		}
	},
	saveLink: function() {
		var saveLink = this.keyboardLinks[this.activeIndex].querySelector('.link-save-button a') || this.keyboardLinks[this.activeIndex].querySelector('.link-unsave-button a');
		if (saveLink) {
			RESUtils.click(saveLink);
		}
	},
	saveComment: function() {
		var saveComment = this.keyboardLinks[this.activeIndex].querySelector('.comment-save-button > a');
		if (saveComment) {
			RESUtils.click(saveComment);
		}
	},
	saveCommentRES: function() {
		var saveComment = this.keyboardLinks[this.activeIndex].querySelector('.saveComments, .unsaveComments');
		if (saveComment) {
			RESUtils.click(saveComment);
			modules['saveComments'].showEducationalNotification();
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
					if (commentButtons[i].textContent === 'reply') {
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
			BrowserStrategy.openInNewWindow(thisHREF);
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
		if (modules['keyboardNav'].goModePanel) {
			modules['keyboardNav'].goModePanel.fadeOut();
			$('body').off('keyup', modules['keyboardNav'].handleGoModeEscapeKey);
		}
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
	modmail: function(newWindow) {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		var thisHREF = location.protocol + '//' + location.hostname + '/message/moderator/';
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
	nextPage: function(override) {
		if (!override && this.options.useGoMode.value && !this.goModeActive) {
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
		var links = obj.querySelectorAll('div.md a:not(.expando-button):not(.madeVisible):not(.toggleImage):not(.noKeyNav):not([href^="javascript:"])');

		links = [].filter.call(links, function(link) { return !RESUtils.isCommentCode(link); });

		return links;
	},
	commentLink: function(num) {
		if (this.options.commentsLinkNumbers.value) {
			var links = this.getCommentLinks();
			if (typeof links[num] !== 'undefined') {
				var thisLink = links[num];
				if ((thisLink.nextSibling) && (typeof thisLink.nextSibling.tagName !== 'undefined') && (thisLink.nextSibling.classList.contains('expando-button'))) {
					thisLink = thisLink.nextSibling;
				}
				this.handleKeyLink(thisLink);
			}
		}
	},
	toggleCommentNavigator: function() {
		var cNav = modules['commentNavigator'];
		if (cNav.isEnabled()) {
			if (cNav.isOpen) {
				cNav.hideNavigator();
			} else {
				cNav.showNavigator();
			}
		}
	},
	commentNavigatorMoveUp: function() {
		modules['commentNavigator'].moveUp();
	},
	commentNavigatorMoveDown: function() {
		modules['commentNavigator'].moveDown();
	},
	random: function() {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();

		location.href = '/r/random';
	}
};
