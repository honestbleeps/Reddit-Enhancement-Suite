addModule('styleTweaks', {
	moduleID: 'styleTweaks',
	moduleName: 'Style Tweaks',
	category: ['Appearance', 'Comments'],
	description: 'Provides a number of style tweaks to the Reddit interface. Also allow you to disable specific subreddit style (the <a href="/prefs/#show_stylesheets">global setting</a> must be on).',
	options: {
		navTop: {
			type: 'boolean',
			value: true,
			description: 'Moves the username navbar to the top (great on netbooks!)'
		},
		commentBoxes: {
			type: 'boolean',
			value: true,
			description: 'Highlights comment boxes for easier reading / placefinding in large threads.'
		},
		/* REMOVED for performance reasons...
		commentBoxShadows: {
			type: 'boolean',
			value: false,
			description: 'Drop shadows on comment boxes (turn off for faster performance)'
		},
		*/
		commentRounded: {
			type: 'boolean',
			value: true,
			description: 'Round corners of comment boxes',
			advanced: true,
			dependsOn: 'commentBoxes'
		},
		commentHoverBorder: {
			type: 'boolean',
			value: false,
			description: 'Highlight comment box hierarchy on hover (turn off for faster performance)',
			advanced: true,
			dependsOn: 'commentBoxes'
		},
		commentIndent: {
			type: 'text',
			value: 10,
			description: 'Indent comments by [x] pixels (only enter the number, no \'px\')',
			advanced: true,
			dependsOn: 'commentBoxes'
		},
		continuity: {
			type: 'boolean',
			value: false,
			description: 'Show comment continuity lines',
			advanced: true,
			dependsOn: 'commentBoxes'
		},
		disableAnimations: {
			type: 'boolean',
			value: false,
			description: 'Discourage CSS3 animations. (This will apply to all of reddit, every subreddit, and RES functionality. However, subreddits might still have some animations.)'
		},
		visitedStyle: {
			type: 'boolean',
			value: false,
			description: 'Reddit makes it so no links on comment pages appear as "visited" - including user profiles. This option undoes that.',
			advanced: true
		},
		showExpandos: {
			type: 'boolean',
			value: true,
			description: 'Bring back video and text expando buttons for users with compressed link display',
			advanced: true
		},
		hideUnvotable: {
			type: 'boolean',
			value: false,
			description: 'Hide vote arrows on threads where you cannot vote (e.g. archived due to age)'
		},
		showFullLinkFlair: {
			type: 'enum',
			values: [{
				name: 'Never',
				value: 'never'
			}, {
				name: 'On hover',
				value: 'hover'
			}, {
				name: 'Always',
				value: 'always'
			}],
			value: 'never',
			description: 'Choose when full link flair should be shown'
		},
		highlightEditedTime: {
			type: 'boolean',
			value: false,
			description: 'Make edited timestamps bold (e.g. "last edited 50 minutes ago")'
		},
		colorBlindFriendly: {
			type: 'boolean',
			value: false,
			description: 'Use colorblind friendly styles when possible',
			advanced: true
		},
/* DISABLED: too many dragons
		protectRESElements: {
			advanced: true,
			type: 'boolean',
			value: true,
			description: 'Ensure that certain RES elements are visible despite subreddit styles. Disable this if elements of subreddits disappear unexpectedly.'
		},
*/
		subredditStyleBrowserToolbarButton: {
			type: 'boolean',
			value: true,
			description: 'Add an icon in the omnibar (where the page address is written) to disable/enable current subreddit style.',
			noconfig: true // only show for chrome
		},
		scrollSubredditDropdown: {
			type: 'boolean',
			value: true,
			description: 'Scroll the standard subreddit dropdown (useful for pinned header and disabled Subreddit Manager)',
			advanced: true
		},
		highlightTopLevel: {
			type: 'boolean',
			value: false,
			description: 'Draws a line to separate top-level comments for easier distinction.'
		},
		highlightTopLevelColor: {
			type: 'color',
			dependsOn: 'highlightTopLevel',
			description: 'Specify the color to separate top-level comments',
			value: '#8B0000'
		},
		highlightTopLevelSize: {
			type: 'text',
			dependsOn: 'highlightTopLevel',
			description: 'Specify how thick (in pixels) of a bar is used to separate top-level comments',
			value: 2
		},
		floatingSideBar: {
			type: 'boolean',
			value: false,
			description: 'Makes the left sidebar (with multireddits) float as you scroll down so you can always see it.',
			advanced: true
		},
		postTitleCapitalization: {
			description: 'Force a particular style of capitalization on post titles',
			type: 'enum',
			value: 'none',
			values: [{
				name: 'do nothing',
				value: 'none'
			}, {
				name: 'Title Case',
				value: 'title'
			}, {
				name: 'Sentence case',
				value: 'sentence'
			}, {
				name: 'lowercase',
				value: 'lowercase'
			}]
		}
	},
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadDynamicOptions: function() {
		if (BrowserDetect.isChrome() || BrowserDetect.isFirefox()) {
			modules['styleTweaks'].options.subredditStyleBrowserToolbarButton.noconfig = false;
		}
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if ((this.options.commentBoxes.value) && (RESUtils.pageType() === 'comments')) {
				this.commentBoxes();
			}
			if (this.options.navTop.value) {
				this.navTop();
			}
			if (RESUtils.currentSubreddit()) {
				this.curSubReddit = RESUtils.currentSubreddit().toLowerCase();
			}

			this.styleCBName = RESUtils.randomHash();

			RESUtils.addCSS('body.res .side .spacer .titlebox div #' + this.styleCBName + ':before { display: none !important;  }');
			RESUtils.addCSS('body.res .side .spacer .titlebox div #label-' + this.styleCBName + ':before { display: none !important; }');
			RESUtils.addCSS('body.res .side .spacer .titlebox div #' + this.styleCBName + ':after { display: none !important;  }');
			RESUtils.addCSS('body.res .side .spacer .titlebox div #label-' + this.styleCBName + ':after { display: none !important; }');

			// In firefox, we need to style tweet expandos because they can't take advantage of twitter.com's widget.js
			if (BrowserDetect.isFirefox()) {
				RESUtils.addCSS('.res blockquote.twitter-tweet { padding: 15px; border-left: 5px solid #ccc; font-size: 14px; line-height: 20px; }');
				RESUtils.addCSS('.res blockquote.twitter-tweet p { margin-bottom: 15px; }');
			}

			if (this.options.colorBlindFriendly.value) {
				RESUtils.bodyClasses.add('res-colorblind');
			}

			if (this.options.disableAnimations.value) {
				this.disableAnimations();
			}

			// wow, Reddit doesn't define a visited class for any links on comments pages...
			// let's put that back if users want it back.
			// If not, we still need a visited class for links in comments, like imgur photos for example, or inline image viewer can't make them look different when expanded!
			if (this.options.visitedStyle.value) {
				RESUtils.addCSS('.comment a:visited { color:#551a8b }');
				RESUtils.addCSS('.res-nightmode .comment a:visited { color: hsl(0,0%,65%); }');
				RESUtils.addCSS('.res-nightmode.res-nightMode-coloredLinks .comment a:visited { color: hsl(270,50%,65%); }');
			} else {
				RESUtils.addCSS('.comment .md p > a:visited { color:#551a8b }');
				RESUtils.addCSS('.res-nightmode .comment .md p > a:visited { color: hsl(270,50%,65%); }');
			}
			if (this.options.showExpandos.value) {
				RESUtils.addCSS('.res .compressed .expando-button { display: block; }');
			}
			if (this.options.hideUnvotable.value) {
				RESUtils.addCSS('.unvoted .arrow.archived { visibility: hidden }');
				RESUtils.addCSS('.voted .arrow.archived { cursor: normal; }');
			}

			if (this.options.showFullLinkFlair.value !== 'never') {
				RESUtils.addCSS('.linkflairlabel' + (this.options.showFullLinkFlair.value === 'hover' ? ':hover' : '') + ' { max-width: none; }');
			}

			if (this.options.highlightEditedTime.value) {
				RESUtils.addCSS('.edited-timestamp { font-weight: bolder; }');
			}

			if (this.options.highlightTopLevel.value) {
				var highlightTopLevelColor = this.options.highlightTopLevelColor.value || this.options.highlightTopLevelColor.default;
				var highlightTopLevelSize = parseInt(this.options.highlightTopLevelSize.value || this.options.highlightTopLevelSize.default, 10);
				RESUtils.addCSS('.nestedlisting > .comment + .clearleft { height: ' + highlightTopLevelSize + 'px !important; margin-bottom: 5px; background: ' + highlightTopLevelColor + ' !important; }');
			}
		}
	},
	afterLoad: function() {
		// Chrome pageAction
		var me = this;
		if (BrowserDetect.isChrome()) {
			if (!RESUtils.currentSubreddit() || !modules['styleTweaks'].options.subredditStyleBrowserToolbarButton.value) {
					RESEnvironment.sendMessage({
						requestType: 'pageAction',
						action: 'hide'
					});
				// }, 1);
			} else {
				// because this is run off of a separate async event, check if the checkbox
				// has been created yet, and if not, wait a bit and try again. There is a miniscule
				// likelihood of ever having to wait, but it is nonzero.
				if (me.styleToggleCheckbox) {
					RESEnvironment.sendMessage({
						requestType: 'pageAction',
						action: 'show',
						visible: me.styleToggleCheckbox.checked
					});
				} else {
					setTimeout(me.afterLoad, 10);
				}
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get the head ASAP!
			this.head = this.head || document.getElementsByTagName('head')[0];

			if (this.options.colorBlindFriendly.value) {
				var orangered = document.getElementById('mail');
				if ((orangered) && (orangered.classList.contains('havemail'))) {
					orangered.setAttribute('style', 'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAKAgMAAAAWdexqAAAACVBMVEX/VwD/hgD///9PE9e4AAAAL0lEQVQI12MIDQ0NYUhgYFBh8GBgaGFwYmBiYXBo4AASCSosDE5cTSwQCbASkGIAxJMH9f3+nCsAAAAASUVORK5CYII=); background-position: 0 0;');
				}
			}
			if (this.options.scrollSubredditDropdown.value) {
				var calcedHeight = Math.floor(window.innerHeight * 0.95);
				if ($('.drop-choices.srdrop').height() > calcedHeight) {
					RESUtils.addCSS('.drop-choices.srdrop { \
						overflow-y: scroll; \
						max-height: ' + calcedHeight + 'px; \
					}');
				}
			}
			if (this.options.floatingSideBar.value) {
				this.floatSideBar();
			}
			this.subredditStyles();
			this.setupElementToggleObservers();

			if ($('#show_stylesheets').length) {
				$('label[for=show_stylesheets]').after(' <span class="little gray">(RES allows you to disable specific subreddit styles!  <a href="/r/Enhancement/wiki/srstyle">Click here to learn more</a>)</span>');
			}
			if (BrowserDetect.isFirefox()) {
				if (!modules['styleTweaks'].options.subredditStyleBrowserToolbarButton.value) {
					RESEnvironment.sendMessage({
						requestType: 'pageAction',
						action: 'hide'
					});
				} else if (!RESUtils.currentSubreddit()) {
					RESEnvironment.sendMessage({
						requestType: 'pageAction',
						action: 'disable'
					});
				} else {
					// because this is run off of a separate async event, check if the checkbox
					// has been created yet, and if not, wait a bit and try again. There is a miniscule
					// likelihood of ever having to wait, but it is nonzero.
					if (this.styleToggleCheckbox) {
						RESEnvironment.sendMessage({
							requestType: 'pageAction',
							action: 'show',
							visible: this.styleToggleCheckbox.checked
						});
					} else {
						setTimeout(this.afterLoad, 10);
					}
				}
			}

			this.registerCommandLine();
			this.postTitleCapitalization();
		}
	},
	registerCommandLine: function() {
		modules['commandLine'].registerCommand('srstyle', 'srstyle [subreddit] [on|off] - toggle subreddit style on/off (if no subreddit is specified, uses current subreddit)',
			function(command, val) {
				var options = getSrstyleOptions(val);
				var str = 'toggle subreddit style';
				if (options.toggleText) {
					str += ' ' + options.toggleText;

					if (options.sr) {
						str += ' for: ' + options.sr;
					}
				}

				return str;
			},
			function(command, val, match, e) {
				// toggle subreddit style
				var options = getSrstyleOptions(val);

				if (!options.sr) {
					return 'No subreddit specified.';
				}

				var toggle;
				if (options.toggleText === 'on') {
					toggle = true;
				} else if (options.toggleText === 'off') {
					toggle = false;
				} else {
					return 'You must specify "on" or "off".';
				}
				var action = toggle ? 'enabled' : 'disabled';
				modules['styleTweaks'].toggleSubredditStyle(toggle, options.sr);
				modules['notifications'].showNotification({
					header: 'Subreddit Style',
					moduleID: 'styleTweaks',
					message: 'Subreddit style ' + action + ' for subreddit: ' + options.sr
				}, 4000);
			}
		);

		function getSrstyleOptions(val) {
			var sr;
			var toggleText;
			var splitWords = val.split(' ');
			if (splitWords.length === 2) {
				sr = splitWords[0];
				toggleText = splitWords[1];
			} else {
				sr = RESUtils.currentSubreddit();
				toggleText = splitWords[0];
			}

			if (toggleText !== 'on' && toggleText !== 'off') {
				toggleText = false;
			}

			return {
				sr: sr,
				toggleText: toggleText
			};
		}
	},

	floatSideBar: function() {
		this.sideBarElement = document.querySelector('.listing-chooser');
		if (this.sideBarElement) {
			window.addEventListener('scroll', modules['styleTweaks'].handleScroll, false);
		}
	},
	handleScroll: function(e) {
		if (modules['styleTweaks'].scrollTimer) {
			clearTimeout(modules['styleTweaks'].scrollTimer);
		}
		modules['styleTweaks'].scrollTimer = setTimeout(modules['styleTweaks'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function(e) {
		if (RESUtils.elementInViewport(modules['styleTweaks'].sideBarElement)) {
			modules['styleTweaks'].sideBarElement.setAttribute('style', '');
		} else {
			modules['styleTweaks'].sideBarElement.setAttribute('style', 'position: fixed; top: 0; z-index: 100; height: 100%; overflow-y: auto;');
		}
	},
	navTop: function() {
		RESUtils.bodyClasses.add('res-navTop');
		RESUtils.addCSS('#header-bottom-right { top: 19px; border-radius: 0 0 0 3px; bottom: auto;  }');
		RESUtils.addCSS('.beta-notice { top: 48px; }');
		RESUtils.init.await.bodyReady().done(function() {
			$('#header-bottom-right').addClass('res-navTop');
		});
	},
	commentBoxes: function() {
		RESUtils.bodyClasses.add('res-commentBoxes');
		if (this.options.commentRounded.value) {
			RESUtils.bodyClasses.add('res-commentBoxes-rounded');
		}
		if (this.options.continuity.value) {
			RESUtils.bodyClasses.add('res-continuity');
		}
		if (this.options.commentHoverBorder.value) {
			RESUtils.bodyClasses.add('res-commentHoverBorder');
		}
		if (this.options.commentIndent.value) {
			// this should override the default of 10px in commentboxes.css because it's added later.
			RESUtils.addCSS('.res-commentBoxes .comment { margin-left:' + this.options.commentIndent.value + 'px !important; }');
		}
	},
	subredditStyles: function() {
		if (!RESUtils.currentSubreddit()) {
			return;
		}
		this.ignoredSubReddits = [];
		var getIgnored = RESStorage.getItem('RESmodules.styleTweaks.ignoredSubredditStyles'),
			subredditTitle, subredditStylesWhitelist, index;

		if (getIgnored) {
			this.ignoredSubReddits = safeJSON.parse(getIgnored, 'RESmodules.styleTweaks.ignoredSubredditStyles');
		}
		subredditTitle = document.querySelector('.titlebox h1');
		this.styleToggleContainer = RESUtils.createElement('form', null, 'toggle res-sr-style-toggle');
		this.styleToggleLabel = document.createElement('label');
		this.styleToggleCheckbox = document.createElement('input');
		this.styleToggleCheckbox.setAttribute('type', 'checkbox');
		this.styleToggleCheckbox.setAttribute('id', this.styleCBName);
		this.styleToggleCheckbox.setAttribute('name', this.styleCBName);

		// are we blacklisting, or whitelisting subreddits?  If we're in night mode on a sub that's
		// incompatible with it, we want to check the whitelist. Otherwise, check the blacklist.

		if ((this.curSubReddit !== null) && (subredditTitle !== null)) {
			if (modules['nightMode'].isNightModeOn() &&
					!modules['nightMode'].isNightmodeCompatible) {
				subredditStylesWhitelist = modules['nightMode'].options.subredditStylesWhitelist.value.split(',');
				index = subredditStylesWhitelist.indexOf(this.curSubReddit);

				if (index !== -1) {
					this.styleToggleCheckbox.checked = true;
				}
			} else {
				index = this.ignoredSubReddits.indexOf(this.curSubReddit);

				if (index === -1) {
					this.styleToggleCheckbox.checked = true;
				} else {
					this.toggleSubredditStyle(false);
				}
			}
			this.styleToggleCheckbox.addEventListener('change', function(e) {
				modules['styleTweaks'].toggleSubredditStyle(this.checked);
			}, false);
			this.styleToggleContainer.appendChild(this.styleToggleCheckbox);
			RESUtils.insertAfter(subredditTitle, this.styleToggleContainer);
		}

		this.styleToggleLabel.setAttribute('for', this.styleCBName);
		this.styleToggleLabel.setAttribute('id', 'label-' + this.styleCBName);
		this.styleToggleLabel.textContent = 'Use subreddit style ';
		this.styleToggleContainer.appendChild(this.styleToggleLabel);
	},
	setupElementToggleObservers: function() {
		if (!window.MutationObserver) return;
		var elems = document.querySelectorAll('.cover-overlay'),
			observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					if (mutation.attributeName === 'style') {
						var mutationID = $(mutation.target).data('mutation-id');
						if (typeof mutationID === 'undefined') {
							mutationID = Math.random();
							$(mutation.target).data('mutation-id', mutationID);
						}
					}
				});
			});

		Array.prototype.slice.call(elems).forEach(function(elem) {
			observer.observe(elem, { attributes : true, attributeFilter : ['style'] });
		});
	},
	toggleSubredditStyle: function(toggle, subreddit) {
		if (toggle) {
			this.enableSubredditStyle(subreddit);
		} else {
			this.disableSubredditStyle(subreddit);
		}
	},
	enableSubredditStyle: function(subreddit) {
		var togglesr = subreddit ? subreddit.toLowerCase() : this.curSubReddit;
		this.head = this.head || document.getElementsByTagName('head')[0];

		if (modules['nightMode'].isNightModeOn() &&
				!modules['nightMode'].isNightmodeCompatible) {
			modules['nightMode'].addSubredditToWhitelist(togglesr);
		} else if (this.ignoredSubReddits) {
			var index = this.ignoredSubReddits.indexOf(togglesr);

			if (index !== -1) {
				// Remove if found
				this.ignoredSubReddits.splice(index, 1);
			}

			RESStorage.setItem('RESmodules.styleTweaks.ignoredSubredditStyles', JSON.stringify(this.ignoredSubReddits));
		}

		var subredditStyleSheet = document.createElement('link');
		subredditStyleSheet.setAttribute('title', 'applied_subreddit_stylesheet');
		subredditStyleSheet.setAttribute('rel', 'stylesheet');
		if (this.stylesheetURL) {
			subredditStyleSheet.setAttribute('href', this.stylesheetURL);
		} else {
			subredditStyleSheet.setAttribute('href', '/r/' + togglesr + '/stylesheet.css');
		}
		if (!subreddit || (subreddit.toLowerCase() === this.curSubReddit)) this.head.appendChild(subredditStyleSheet);

		if (BrowserDetect.isChrome() || BrowserDetect.isFirefox()) {
			// in case it was set by the pageAction, be sure to check the checkbox.
			if (this.styleToggleCheckbox) {
				this.styleToggleCheckbox.checked = true;
			}
			RESEnvironment.sendMessage({
				requestType: 'pageAction',
				action: 'stateChange',
				visible: true
			});
		}
	},
	disableSubredditStyle: function(subreddit) {
		var togglesr = subreddit ? subreddit.toLowerCase() : this.curSubReddit;
		this.head = this.head || document.getElementsByTagName('head')[0];
		if (modules['nightMode'].isNightModeOn() &&
				!modules['nightMode'].isNightmodeCompatible) {
			modules['nightMode'].removeSubredditFromWhitelist(togglesr);
		} else if (this.ignoredSubReddits) {
			var index = this.ignoredSubReddits.indexOf(togglesr);

			if (index === -1) {
				// Add if found
				this.ignoredSubReddits.push(togglesr);
			}

			RESStorage.setItem('RESmodules.styleTweaks.ignoredSubredditStyles', JSON.stringify(this.ignoredSubReddits));
		}

		var subredditStyleSheet = this.head.querySelector('link[title=applied_subreddit_stylesheet]');
		if (!subredditStyleSheet) subredditStyleSheet = this.head.querySelector('style[title=applied_subreddit_stylesheet]');
		if (!subredditStyleSheet) subredditStyleSheet = this.head.querySelector('style[data-apng-original-href]'); // apng extension fix (see #1076)
		if ((subredditStyleSheet) && (!subreddit || (subreddit.toLowerCase() === this.curSubReddit))) {
			this.stylesheetURL = subredditStyleSheet.href;
			subredditStyleSheet.parentNode.removeChild(subredditStyleSheet);
		}

		if (BrowserDetect.isChrome() || BrowserDetect.isFirefox()) {
			// in case it was set by the pageAction, be sure to uncheck the checkbox
			if (this.styleToggleCheckbox) {
				this.styleToggleCheckbox.checked = false;
			}
			RESEnvironment.sendMessage({
				requestType: 'pageAction',
				action: 'stateChange',
				visible: false
			});
		}
	},
	isSubredditStyleEnabled: function() {
		// TODO: detect if srstyle is disabled by reddit account preference

		if (this.styleToggleCheckbox) {
			return this.styleToggleCheckbox.checked;
		}

		// RES didn't disable it, at least
		return true;
	},
	addDisableAnimationsClass: function() {
		if (!document.body) {
			setTimeout(modules['styleTweaks'].addDisableAnimationsClass, 200);
			return;
		}
		document.body.classList.add('res-animations-disabled');
	},
	disableAnimations: function() {
		modules['styleTweaks'].addDisableAnimationsClass();
		// This CSS is engineered to disable most animations without making the selector completely ridiculous.
		// If they get too obnoxious, then use the "disable subreddit style" hammer.
		RESUtils.addCSS('\
			html body.res #header:before,   \
			html body.res #header:after,   \
			html body.res #header *,	\
			html body.res #header *:before,   \
			html body.res #header *:after,   \
			html body.res #header ~ *,	\
			html body.res #header ~ *:before,	\
			html body.res #header ~ *:after,	\
			html body.res #header ~ * *,	\
			html body.res #header ~ * *:before,	\
			html body.res #header ~ * *:after,	\
			html body.res #header ~ * #siteTable *,	\
			html body.res #header ~ * #siteTable *:before,	\
			html body.res #header ~ * #siteTable *:after {	\
				-o-transition-property: none !important;	\
				-moz-transition-property: none !important;	\
				-ms-transition-property: none !important;	\
				-webkit-transition-property: none !important;	\
				transition-property: none !important;	\
				-webkit-animation: none !important;	\
				-moz-animation: none !important;	\
				-o-animation: none !important;	\
				-ms-animation: none !important;	\
				animation: none !important;	\
			}	\
			');
	},
	postTitleCapitalization: function() {
		switch (this.options.postTitleCapitalization.value) {
			case 'title':
				RESUtils.addCSS('.entry a.title { text-transform: capitalize; }');
				break;
			case 'sentence':
				RESUtils.addCSS('\
					.entry a.title { text-transform: lowercase; display: inline-block; }	\
					.entry a.title::first-letter { text-transform: uppercase; }	\
					');
				break;
			case 'lowercase':
				RESUtils.addCSS('.entry a.title { text-transform: lowercase; }');
				break;
			// case 'none':
			default:
				// do nothing
		}

		if (this.options.postTitleCapitalization.value === 'sentence') {
			RESUtils.watchForElement('siteTable', modules['showImages'].findAllImages);
		}
	},
});
