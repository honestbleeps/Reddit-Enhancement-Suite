modules['styleTweaks'] = {
	moduleID: 'styleTweaks',
	moduleName: 'Style Tweaks',
	category: 'UI',
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
			description: 'Add an icon in the omnibar (where the page adress is written) to disable/enable current subreddit style.',
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
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
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
				RESUtils.bodyClasses.push('res-navTop');
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
				RESUtils.htmlClasses.push('res-colorblind');
			}

			if (this.options.disableAnimations.value) {
				this.disableAnimations();
			}

			// wow, Reddit doesn't define a visited class for any links on comments pages...
			// let's put that back if users want it back.
			// If not, we still need a visited class for links in comments, like imgur photos for example, or inline image viewer can't make them look different when expanded!
			if (this.options.visitedStyle.value) {
				RESUtils.addCSS('.comment a:visited { color:#551a8b }');
			} else {
				RESUtils.addCSS('.comment .md p > a:visited { color:#551a8b }');
			}
			if (this.options.showExpandos.value) {
				RESUtils.addCSS('.res .compressed .expando-button { display: block; }');
			}
			if (this.options.hideUnvotable.value) {
				RESUtils.addCSS('.unvoted .arrow[onclick*=unvotable] { visibility: hidden }');
				RESUtils.addCSS('.voted .arrow[onclick*=unvotable] { cursor: normal; }');
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
				RESUtils.addCSS('.nestedlisting > .comment + .clearleft:after { content: "" !important; display: block !important; position: relative !important; top: -5px !important; width: 100% !important; height: ' + highlightTopLevelSize + 'px !important; background: ' + highlightTopLevelColor + ' !important; }');
			}
		}
	},
	afterLoad: function() {
		// Chrome pageAction
		var me = this;
		if (BrowserDetect.isChrome()) {
			if (!RESUtils.currentSubreddit() || !modules['styleTweaks'].options.subredditStyleBrowserToolbarButton.value) {
					BrowserStrategy.sendMessage({
						requestType: 'pageAction',
						action: 'hide'
					});
				// }, 1);
			} else {
				// because this is run off of a separate async event, check if the checkbox
				// has been created yet, and if not, wait a bit and try again. There is a miniscule
				// likelihood of ever having to wait, but it is nonzero.
				if (me.styleToggleCheckbox) {
					BrowserStrategy.sendMessage({
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

			// get rid of antequated option we've removed (err, renamed) due to performance issues.
			if (typeof this.options.commentBoxHover !== 'undefined') {
				delete this.options.commentBoxHover;
				RESStorage.setItem('RESoptions.styleTweaks', JSON.stringify(modules['styleTweaks'].options));
			}

			if (this.options.navTop.value) {
				this.navTop();
			}

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
			if (this.options.showExpandos.value) {
				var twitterLinks = document.body.querySelectorAll('.entry > p.title > a.title');
				var isTwitterLink = /twitter.com\/(?:#!\/)?([\w]+)\/(status|statuses)\/([\d]+)/i;
				for (var i = 0, len = twitterLinks.length; i < len; i++) {
					var thisHref = twitterLinks[i].getAttribute('href');
					thisHref = thisHref.replace('/#!', '');
					if (isTwitterLink.test(thisHref)) {
						var thisExpandoButton = document.createElement('div');
						thisExpandoButton.setAttribute('class', 'expando-button collapsed collapsedExpando selftext twitter');
						thisExpandoButton.addEventListener('click', modules['styleTweaks'].toggleTweetExpando, false);
						RESUtils.insertAfter(twitterLinks[i].parentNode, thisExpandoButton);
					}
				}
			}
			if (this.options.floatingSideBar.value) {
				this.floatSideBar();
			}
			this.subredditStyles();
			this.setupProtectProtectedElements();
			this.setupElementToggleObservers();

			if ($('#show_stylesheets').length) {
				$('label[for=show_stylesheets]').after(' <span class="little gray">(RES allows you to disable specific subreddit styles!  <a href="/r/Enhancement/wiki/srstyle">Click here to learn more</a>)</span>');
			}
			if (BrowserDetect.isFirefox()) {
				if (!modules['styleTweaks'].options.subredditStyleBrowserToolbarButton.value) {
					BrowserStrategy.sendMessage({
						requestType: 'pageAction',
						action: 'hide'
					});
				} else if (!RESUtils.currentSubreddit()) {
					BrowserStrategy.sendMessage({
						requestType: 'pageAction',
						action: 'disable'
					});
				} else {
					// because this is run off of a separate async event, check if the checkbox
					// has been created yet, and if not, wait a bit and try again. There is a miniscule
					// likelihood of ever having to wait, but it is nonzero.
					if (this.styleToggleCheckbox) {
						BrowserStrategy.sendMessage({
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
			function (command, val, match, e) {
				// toggle subreddit style
				var options = getSrstyleOptions(val);

				if (!options.sr) {
					return 'No subreddit specified.';
				}
				if (options.toggleText === 'on') {
					toggle = true;
				} else if (options.toggleText === 'off') {
					toggle = false;
				} else {
					return 'You must specify "on" or "off".';
				}
				var action = (toggle) ? 'enabled' : 'disabled';
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
			}
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
	toggleTweetExpando: function(e) {
		var thisExpando = e.target.nextSibling.nextSibling.nextSibling;
		if (e.target.classList.contains('collapsedExpando')) {
			$(e.target).removeClass('collapsedExpando collapsed').addClass('expanded');
			if (thisExpando.classList.contains('twitterLoaded')) {
				thisExpando.style.display = 'block';
				return;
			}
			var twitterLink = e.target.previousSibling.querySelector('.title');
			if (twitterLink) twitterLink = twitterLink.getAttribute('href').replace('/#!', '');
			var match = twitterLink.match(/twitter.com\/[^\/]+\/(?:status|statuses)\/([\d]+)/i);
			if (match !== null) {
				// var jsonURL = 'http://api.twitter.com/1/statuses/show/'+match[1]+'.json';
				var jsonURL = 'https://api.twitter.com/1/statuses/oembed.json?id=' + match[1],
					thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					};
				if (BrowserDetect.isChrome()) {
					// we've got chrome, so we need to hit up the background page to do cross domain XHR

					// first, we need to see if we have permissions for the twitter API...
					var permissionsJSON = {
						requestType: 'permissions',
						callbackID: permissionQueue.count,
						data: {
							origins: ['https://api.twitter.com/*'],
						}
					}
					// save a function call that'll run the expando if our permissions request
					// comes back with a result of true
					permissionQueue.onloads[permissionQueue.count] = function(hasPermission) {
						if (hasPermission) {
							chrome.runtime.sendMessage(thisJSON, function(response) {
								// send message to background.html
								var tweet = response;
								$(thisExpando).html(tweet.html);
								thisExpando.style.display = 'block';
								thisExpando.classList.add('twitterLoaded');
							});
						} else {
							// close the expando since we don't have permission.
							$(e.target).removeClass('expanded').addClass('collapsed collapsedExpando');
						}
					}
					permissionQueue.count++;

					// we do a noop in the callback here because we can't actually get a
					// response - there's multiple async calls going on...
					chrome.runtime.sendMessage(permissionsJSON, function(response) {});

				} else if (BrowserDetect.isSafari()) {
					// we've got safari, so we need to hit up the background page to do cross domain XHR
					modules['styleTweaks'].tweetExpando = thisExpando;
					safari.self.tab.dispatchMessage(thisJSON.requestType, thisJSON);
				} else if (BrowserDetect.isOpera()) {
					// we've got opera, so we need to hit up the background page to do cross domain XHR
					modules['styleTweaks'].tweetExpando = thisExpando;
					opera.extension.postMessage(JSON.stringify(thisJSON));
				} else if (BrowserDetect.isFirefox()) {
					// we've got a jetpack extension, hit up the background page...
					// we have to omit the script tag and all of the nice formatting it brings us in Firefox
					// because AMO does not permit externally hosted script tags being pulled in from
					// oEmbed like this...
					jsonURL += '&omit_script=true';
					modules['styleTweaks'].tweetExpando = thisExpando;
					self.postMessage(thisJSON);
				}
			}
		} else {
			$(e.target).removeClass('expanded').addClass('collapsedExpando').addClass('collapsed');
			thisExpando.style.display = 'none';
		}

	},
	navTop: function() {
		RESUtils.addCSS('#header-bottom-right { top: 19px; border-radius: 0 0 0 3px; bottom: auto;  }');
		RESUtils.addCSS('.beta-notice { top: 48px; }');
		$('#header-bottom-right').addClass('res-navTop');
	},
	commentBoxes: function() {
		RESUtils.htmlClasses.push('res-commentBoxes');
		if (this.options.commentRounded.value) {
			RESUtils.htmlClasses.push('res-commentBoxes-rounded');
		}
		if (this.options.continuity.value) {
			RESUtils.htmlClasses.push('res-continuity');
		}
		if (this.options.commentHoverBorder.value) {
			RESUtils.htmlClasses.push('res-commentHoverBorder');
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
		this.styleToggleContainer = document.createElement('div');
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

		this.protectElement(this.styleToggleContainer, 'display: block !important;');
		this.protectElement(this.styleToggleCheckbox, 'display: inline-block !important;');
		this.protectElement(this.styleToggleLabel, 'display: inline-block !important; margin-left: 4px !important;');

		this.setSRStyleToggleVisibility(true); // no source
	},
	srstyleHideLock: RESUtils.createMultiLock(),
	setSRStyleToggleVisibility: function(visible, source) {
		/// When showing/hiding popups which could overlay the "Use subreddit style" checkbox,
		/// set the checkbox's styling to "less visible" or "more visible"
		/// @param 	visible 		bool	make checkbox "more visible" (true) or less (false)
		/// @param 	source 	string 	popup ID, so checkbox stays less visible until that popup's lock is released
		var self = modules['styleTweaks'];
		if (!self.styleToggleContainer) return;

		if (typeof source !== 'undefined') {
			if (visible) {
				self.srstyleHideLock.unlock(source);
			} else {
				self.srstyleHideLock.lock(source);
			}
		}

		modules['styleTweaks'].applyTopmostElementProtection(visible);
	},
	setupElementToggleObservers: function() {
		var elems = document.querySelectorAll('.cover-overlay'),
			observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					if (mutation.attributeName === 'style') {
						var mutationID = $(mutation.target).data('mutation-id');
						if (typeof mutationID === 'undefined') {
							mutationID = Math.random();
							$(mutation.target).data('mutation-id', mutationID);
						}
						if (mutation.target.style.display === 'none') {
							modules['styleTweaks'].setSRStyleToggleVisibility(true, mutationID);
						} else {
							modules['styleTweaks'].setSRStyleToggleVisibility(false, mutationID);
						}
					}
				});
			});
		for(var i = 0, len = elems.length; i < len; i++) {
			observer.observe(elems[i], { attributes : true, attributeFilter : ['style'] });
		}
	},
	applyTopmostElementProtection: function(visible) {
		var self = modules['styleTweaks'];
		if (typeof visible === 'undefined') {
			visible = true;
		}
		if (visible && self.srstyleHideLock.locked()) {
			visible = false;
		}

		// great, now people are still finding ways to hide this.. these extra declarations are to try and fight that.
		// Sorry, subreddit moderators, but users can disable all subreddit stylesheets if they want - this is a convenience
		// for them and I think taking this functionality away from them is unacceptable.

		var zIndex = 'z-index: ' + (visible ? ' 2147483646' : 'auto') + ' !important;';

		self.protectedElements.each(function(index, element) {
			var elementCss = element.getAttribute('data-res-css') || '';
			var css = RESUtils.baseStyleProtection + zIndex + elementCss;
			element.setAttribute('style', css);
		});
	},
	protectElement: function(element, css) {
		var elements = modules['styleTweaks'].protectedElements || $();
		modules['styleTweaks'].protectedElements = elements.add(element);

		if (css) {
			$(element).attr('data-res-css', css);
		}

		modules['styleTweaks'].applyTopmostElementProtection();
		modules['styleTweaks'].setupProtectProtectedElements();
	},
	protectedElements: undefined,
	protectProtectedElements: function() {
		return; // too many dragons
		if (RESUtils.currentSubreddit() === null || RESUtils.currentSubreddit() === void 0) return;
		if (!document.body) {
			modules['styleTweaks'].setupProtectProtectedElements();
			return;
		}
		if (document.body.classList.contains('multi-page')) return;
		if (!(modules['styleTweaks'].protectedElements && modules['styleTweaks'].protectedElements.length)) return;
		if (!modules['styleTweaks'].options.protectRESElements.value) return;

		var self = modules['styleTweaks'],
			$window = $(window),
			windowScroll = {
				left: $window.scrollLeft(),
				top: $window.scrollTop(),
				width: $window.width(),
				height: $window.height()
			},
			protectedElements = self.protectedElements.filter(':not([data-res-protect-checked])'),
			someElementNotVisible = false;

		protectedElements.each(function(index, element) {
			var $element = $(element);
			var insideHiddenContainer = [].some.call($element.parentsUntil('html'), function(elem) { return window.getComputedStyle(elem).display === 'none'; });

			if (!insideHiddenContainer) {
				//do {
					var offset = $element.offset();
					var checkPosition = { x: offset.left, y: offset.top };
					if (!isPositionInViewport(checkPosition)) {
						someElementNotVisible = true;
						return;
					} else {
						var elementAtProtectedPosition = document.elementFromPoint(checkPosition.x - windowScroll.left, checkPosition.y - windowScroll.top);
						var elementIsTopmost = !elementAtProtectedPosition || $element.is(elementAtProtectedPosition) || $element.has(elementAtProtectedPosition).length;
						if (!elementIsTopmost && !$(elementAtProtectedPosition).is('html, body')) {
							$(elementAtProtectedPosition).remove();
						}
					}
				//} while (!elementIsTopmost);
			}

			element.setAttribute('data-res-protect-checked', true);  // don't use .attr('data-foo', 'bar') because jQuery converts that to .data('foo', 'bar'), and RES doesn't include :data() selector
		});

		if (someElementNotVisible) {
			// Some elements were not checked, try again later
			$(window).on('scroll', self.setupProtectProtectedElements);
		} else {
			$(window).off('scroll', self.setupProtectProtectedElements);
		}

		function isPositionInViewport(position) {
			if (position.x < windowScroll.left)
				return false;

			if (windowScroll.left + windowScroll.width < position.x)
				return false;

			if (position.y < windowScroll.top)
				return false;

			if (windowScroll.top + windowScroll.height < position.y)
				return false;

			return true;
		}
	},
	setupProtectProtectedElements: function() {
		var self = modules['styleTweaks'];

		clearTimeout(self.scrollListener);
		self.scrollListener = setTimeout(self.protectProtectedElements, 200);
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
			BrowserStrategy.sendMessage({
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
			BrowserStrategy.sendMessage({
				requestType: 'pageAction',
				action: 'stateChange',
				visible: false
			});
		}

	},
	addDisableAnimationsClass: function() {
		if (!document.body) {
			setTimeout(modules['styleTweaks'].addDisableAnimationsClass, 200);
			return;
		}
		document.body.classList.add('res-animations-disabled');
	},
	disableAnimations: function() {
		var selectors = [];

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
	}
};
