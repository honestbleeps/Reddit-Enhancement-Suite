modules['styleTweaks'] = {
	moduleID: 'styleTweaks',
	moduleName: 'Style Tweaks',
	category: 'UI',
	description: 'Provides a number of style tweaks to the Reddit interface',
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
			description: 'Round corners of comment boxes'
		},
		commentHoverBorder: {
			type: 'boolean',
			value: false,
			description: 'Highlight comment box hierarchy on hover (turn off for faster performance)'
		},
		commentIndent: {
			type: 'text',
			value: 10,
			description: 'Indent comments by [x] pixels (only enter the number, no \'px\')'
		},
		continuity: {
			type: 'boolean',
			value: false,
			description: 'Show comment continuity lines'
		},
		lightSwitch: {
			type: 'boolean',
			value: true,
			description: 'Enable lightswitch (toggle between light / dark reddit)'
		},
		lightOrDark: {
			type: 'enum',
			values: [{
				name: 'Light',
				value: 'light'
			}, {
				name: 'Dark',
				value: 'dark'
			}],
			value: 'light',
			description: 'Light, or dark?'
		},
		useSubredditStyleInDarkMode: {
			type: 'boolean',
			value: false,
			description: "Don't disable subreddit styles by default when using dark mode (night mode).\
				<br><br>When using dark mode, subreddit styles are automatically disabled unless <a href='http://www.reddit.com/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit'>the subreddit indicates it is dark mode-friendly</a>. you must tick the 'Use subreddit stylesheet' in a subreddit's sidebar to enable subreddit styles in that subreddit. This is because most subreddits are not dark mode-friendly.\
				<br><br>If you choose to show subreddit styles, you will see flair images and spoiler tags, but be warned: <em>you may see bright images, comment highlighting, etc.</em>  If you do, please message the mods for that subreddit."		},
		visitedStyle: {
			type: 'boolean',
			value: false,
			description: 'Reddit makes it so no links on comment pages appear as "visited" - including user profiles. This option undoes that.'
		},
		showExpandos: {
			type: 'boolean',
			value: true,
			description: 'Bring back video and text expando buttons for users with compressed link display'
		},
		hideUnvotable: {
			type: 'boolean',
			value: false,
			description: 'Hide vote arrows on threads where you cannot vote (e.g. archived due to age)'
		},
		colorBlindFriendly: {
			type: 'boolean',
			value: false,
			description: 'Use colorblind friendly styles when possible'
		},
		scrollSubredditDropdown: {
			type: 'boolean',
			value: true,
			description: 'Scroll the standard subreddit dropdown (useful for pinned header and disabled Subreddit Manager)'
		}
	},
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
				document.html.classList.add('res-colorblind');
			}

			// if night mode is enabled, set a localstorage token so that in the future,
			// we can add the res-nightmode class to the page prior to page load.
			if (this.isDark()) {
				this.enableNightMode();
			} else {
				this.disableNightMode();
			}

			// wow, Reddit doesn't define a visited class for any links on comments pages...
			// let's put that back if users want it back.
			// If not, we still need a visited class for links in comments, like imgur photos for example, or inline image viewer can't make them look different when expanded!
			if (this.options.visitedStyle.value) {
				RESUtils.addCSS(".comment a:visited { color:#551a8b }");
			} else {
				RESUtils.addCSS(".comment .md p > a:visited { color:#551a8b }");
			}
			if (this.options.showExpandos.value) {
				RESUtils.addCSS('.compressed .expando-button { display: block !important; }');
			}
			if ((this.options.commentBoxes.value) && (RESUtils.pageType() === 'comments')) {
				this.commentBoxes();
			}
			if (this.options.hideUnvotable.value) {
				RESUtils.addCSS('.unvoted .arrow[onclick*=unvotable] { visibility: hidden }');
				RESUtils.addCSS('.voted .arrow[onclick*=unvotable] { cursor: normal; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			// get the head ASAP!
			this.head = document.getElementsByTagName("head")[0];

			// handle night mode scenarios (check if subreddit is compatible, etc)
			this.handleNightModeAtStart();

			// get rid of antequated option we've removed (err, renamed) due to performance issues.
			if (typeof this.options.commentBoxHover !== 'undefined') {
				delete this.options.commentBoxHover;
				RESStorage.setItem('RESoptions.styleTweaks', JSON.stringify(modules['styleTweaks'].options));
			}
			if (this.isDark()) {
				// still add .res-nightmode to body just in case subreddit stylesheets specified body.res-nightmode instead of just .res-nightmode
				document.body.classList.add('res-nightmode');
			}
			if (this.options.navTop.value) {
				this.navTop();
			}
			if (this.options.lightSwitch.value) {
				this.lightSwitch();
			}
			if (this.options.colorBlindFriendly.value) {
				var orangered = document.getElementById('mail');
				if ((orangered) && (orangered.classList.contains('havemail'))) {
					orangered.setAttribute('style', 'background-image: url(http://thumbs.reddit.com/t5_2s10b_5.png); background-position: 0 0;');
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
				RESUtils.addCSS('.compressed .expando-button { display: block !important; }');
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
			this.userbarHider();
			this.subredditStyles();
		}
	},
	isDark: function() {
		return this.options.lightOrDark.value === 'dark';
	},
	handleNightModeAtStart: function() {
		this.nightModeWhitelist = [];
		var getWhitelist = RESStorage.getItem('RESmodules.styleTweaks.nightModeWhitelist');
		if (getWhitelist) {
			this.nightModeWhitelist = safeJSON.parse(getWhitelist, 'RESmodules.styleTweaks.nightModeWhitelist');
		}
		var idx = this.nightModeWhitelist.indexOf(this.curSubReddit);
		if (idx !== -1) {
			// go no further. this subreddit is whitelisted.
			return;
		}

		// check the sidebar for a link [](#/RES_SR_Config/NightModeCompatible) that indicates the sub is night mode compatible.
		this.isNightmodeCompatible = (document.querySelector('.side a[href="#/RES_SR_Config/NightModeCompatible"]') !== null);
		this.isNightmodeCompatible = this.isNightmodeCompatible || this.options.useSubredditStyleInDarkMode.value;

		// if night mode is on and the sub isn't compatible, disable its stylesheet.
		if (this.isDark() && !this.isNightmodeCompatible) {
			this.disableSubredditStyle();
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
					chrome.permissions.request({
						origins: ['https://api.twitter.com/*']
					}, function(granted) {
						// The callback argument will be true if the user granted the permissions.
						if (granted) {
							chrome.runtime.sendMessage(thisJSON, function(response) {
								// send message to background.html 
								var tweet = response;
								$(thisExpando).html(tweet.html);
								thisExpando.style.display = 'block';
								thisExpando.classList.add('twitterLoaded');
							});
						} else {
							modules['notifications'].showNotification("Without permission to access https://api.twitter.com/*, RES's twitter expandos (to show twitter posts in-line) will not work.");
						}
					});
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
		$('body, #header-bottom-right').addClass('res-navTop');
	},
	userbarHider: function() {
		RESUtils.addCSS("#userbarToggle { min-height: 22px; position: absolute; top: auto; bottom: 0; left: -5px; width: 16px; padding-right: 3px; height: 100%; font-size: 15px; border-radius: 4px 0; color: #a1bcd6; display: inline-block; background-color: #dfecf9; border-right: 1px solid #cee3f8; cursor: pointer; text-align: right; line-height: 24px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { min-height: 26px; }");
		RESUtils.addCSS("#header-bottom-right .user { margin-left: 16px; }");
		// RESUtils.addCSS(".userbarHide { background-position: 0 -137px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { left: -12px; }");
		RESUtils.addCSS(".res-navTop #userbarToggle.userbarShow { top: 0; bottom: auto; }");
		this.userbar = document.getElementById('header-bottom-right');
		if (this.userbar) {
			this.userbarToggle = RESUtils.createElementWithID('div', 'userbarToggle');
			$(this.userbarToggle).html('&raquo;');
			this.userbarToggle.setAttribute('title', 'Toggle Userbar');
			this.userbarToggle.classList.add('userbarHide');
			this.userbarToggle.addEventListener('click', function(e) {
				modules['styleTweaks'].toggleUserBar();
			}, false);
			this.userbar.insertBefore(this.userbarToggle, this.userbar.firstChild);
			// var currHeight = $(this.userbar).height();
			// $(this.userbarToggle).css('height',currHeight+'px');
			if (RESStorage.getItem('RESmodules.styleTweaks.userbarState') === 'hidden') {
				this.toggleUserBar();
			}
		}
	},
	toggleUserBar: function() {
		var nextEle = this.userbarToggle.nextSibling;
		// hide userbar.
		if (this.userbarToggle.classList.contains('userbarHide')) {
			this.userbarToggle.classList.remove('userbarHide');
			this.userbarToggle.classList.add('userbarShow');
			$(this.userbarToggle).html('&laquo;');
			RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'hidden');
			modules['accountSwitcher'].closeAccountMenu();
			while ((typeof nextEle !== 'undefined') && (nextEle !== null)) {
				nextEle.style.display = 'none';
				nextEle = nextEle.nextSibling;
			}
			// show userbar.
		} else {
			this.userbarToggle.classList.remove('userbarShow');
			this.userbarToggle.classList.add('userbarHide');
			$(this.userbarToggle).html('&raquo;');
			RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'visible');
			while ((typeof nextEle !== 'undefined') && (nextEle !== null)) {
				if ((/mail/.test(nextEle.className)) || (nextEle.id === 'openRESPrefs')) {
					nextEle.style.display = 'inline-block';
				} else {
					nextEle.style.display = 'inline';
				}
				nextEle = nextEle.nextSibling;
			}
		}
	},
	commentBoxes: function() {
		document.html.classList.add('res-commentBoxes');
		if (this.options.commentRounded.value) {
			document.html.classList.add('res-commentBoxes-rounded');
		}
		if (this.options.continuity.value) {
			document.html.classList.add('res-continuity');
		}
		if (this.options.commentHoverBorder.value) {
			document.html.classList.add('res-commentHoverBorder');
		}
		if (this.options.commentIndent.value) {
			// this should override the default of 10px in commentboxes.css because it's added later.
			RESUtils.addCSS('.res-commentBoxes .comment { margin-left:' + this.options.commentIndent.value + 'px !important; }');
		}
	},
	lightSwitch: function() {
		RESUtils.addCSS(".lightOn { background-position: 0 -96px; } ");
		RESUtils.addCSS(".lightOff { background-position: 0 -108px; } ");
		var thisFrag = document.createDocumentFragment();
		this.lightSwitch = document.createElement('li');
		this.lightSwitch.setAttribute('title', "Toggle night and day");
		this.lightSwitch.addEventListener('click', function(e) {
			e.preventDefault();
			if (modules['styleTweaks'].isDark()) {
				modules['styleTweaks'].lightSwitchToggle.classList.remove('enabled');
				modules['styleTweaks'].disableNightMode();
			} else {
				modules['styleTweaks'].lightSwitchToggle.classList.add('enabled');
				modules['styleTweaks'].enableNightMode();
			}
		}, true);
		// this.lightSwitch.setAttribute('id','lightSwitch');
		this.lightSwitch.textContent = 'night mode';
		this.lightSwitchToggle = RESUtils.createElementWithID('div', 'lightSwitchToggle', 'toggleButton');
		$(this.lightSwitchToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
		this.lightSwitch.appendChild(this.lightSwitchToggle);
		if (this.isDark()) {
			this.lightSwitchToggle.classList.add('enabled')
		} else {
			this.lightSwitchToggle.classList.remove('enabled');
		}
		// thisFrag.appendChild(separator);
		thisFrag.appendChild(this.lightSwitch);
		// if (RESConsole.RESPrefsLink) insertAfter(RESConsole.RESPrefsLink, thisFrag);
		$('#RESDropdownOptions').append(this.lightSwitch);
	},
	subredditStyles: function() {
		if (!RESUtils.currentSubreddit()) return;
		this.ignoredSubReddits = [];
		var getIgnored = RESStorage.getItem('RESmodules.styleTweaks.ignoredSubredditStyles');
		if (getIgnored) {
			this.ignoredSubReddits = safeJSON.parse(getIgnored, 'RESmodules.styleTweaks.ignoredSubredditStyles');
		}
		var subredditTitle = document.querySelector('.titlebox h1');
		this.styleToggleContainer = document.createElement('div');
		this.styleToggleLabel = document.createElement('label');
		this.styleToggleCheckbox = document.createElement('input');
		this.styleToggleCheckbox.setAttribute('type', 'checkbox');
		this.styleToggleCheckbox.setAttribute('id', this.styleCBName);
		this.styleToggleCheckbox.setAttribute('name', this.styleCBName);

		// are we blacklisting, or whitelisting subreddits?  If we're in night mode on a sub that's
		// incompatible with it, we want to check the whitelist. Otherwise, check the blacklist.

		if ((this.curSubReddit !== null) && (subredditTitle !== null)) {

			if (this.isDark() && !this.isNightmodeCompatible) {
				var idx = this.nightModeWhitelist.indexOf(this.curSubReddit);
				if (idx !== -1) {
					this.styleToggleCheckbox.checked = true;
				}
			} else {
				var idx = this.ignoredSubReddits.indexOf(this.curSubReddit);
				if (idx === -1) {
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

		if (typeof source !== "undefined") {
			if (visible) {
				self.srstyleHideLock.unlock(source);
			} else {
				self.srstyleHideLock.lock(source);
			}
		}

		if (visible && self.srstyleHideLock.locked()) {
			visible = false;
		}

		// great, now people are still finding ways to hide this.. these extra declarations are to try and fight that.
		// Sorry, subreddit moderators, but users can disable all subreddit stylesheets if they want - this is a convenience 
		// for them and I think taking this functionality away from them is unacceptable.

		var zIndex = 'z-index: ' + (visible ? ' 2147483647' : 'auto') + ' !important;';

		self.styleToggleContainer.setAttribute('style', 'margin: 0 !important; background-color: inherit !important; color: inherit !important; display: block !important; position: relative !important; left: 0 !important; top: 0 !important; max-height: none!important; max-width: none!important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0 !important; font-size: 12px !important; float: none !important; opacity: 1 !important;' + zIndex);
		self.styleToggleCheckbox.setAttribute('style', 'margin: 0 !important; background-color: inherit !important; color: inherit !important; display: inline-block !important; position: relative !important; left: 0 !important; top: 0 !important; max-height: none!important; max-width: none!important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0 !important; font-size: 12px !important; float: none !important; opacity: 1 !important;' + zIndex);
		self.styleToggleLabel.setAttribute('style', 'margin: 0 !important; background-color: inherit !important; color: inherit !important; display: inline-block !important; position: relative !important; left: 0 !important; top: 0 !important; max-height: none!important; max-width: none!important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0 !important; font-size: 12px !important; margin-left: 4px !important; float: none !important; opacity: 1 !important;' + zIndex);
	},
	toggleSubredditStyle: function(toggle, subreddit) {
		var togglesr = (subreddit) ? subreddit.toLowerCase() : this.curSubReddit;
		if (toggle) {
			this.enableSubredditStyle(subreddit);
		} else {
			this.disableSubredditStyle(subreddit);
		}
	},
	enableSubredditStyle: function(subreddit) {
		var togglesr = (subreddit) ? subreddit.toLowerCase() : this.curSubReddit;

		if (this.isDark() && !this.isNightmodeCompatible) {
			var idx = this.nightModeWhitelist.indexOf(togglesr);
			if (idx === -1) this.nightModeWhitelist.push(togglesr); // add if not found
			RESStorage.setItem('RESmodules.styleTweaks.nightModeWhitelist', JSON.stringify(this.nightModeWhitelist));
		} else if (this.ignoredSubReddits) {
			var idx = this.ignoredSubReddits.indexOf(togglesr);
			if (idx !== -1) this.ignoredSubReddits.splice(idx, 1); // Remove it if found...
			RESStorage.setItem('RESmodules.styleTweaks.ignoredSubredditStyles', JSON.stringify(this.ignoredSubReddits));
		}

		var subredditStyleSheet = document.createElement('link');
		subredditStyleSheet.setAttribute('title', 'applied_subreddit_stylesheet');
		subredditStyleSheet.setAttribute('rel', 'stylesheet');
		subredditStyleSheet.setAttribute('href', 'http://www.reddit.com/r/' + togglesr + '/stylesheet.css');
		if (!subreddit || (subreddit == this.curSubReddit)) this.head.appendChild(subredditStyleSheet);
	},
	disableSubredditStyle: function(subreddit) {
		var togglesr = (subreddit) ? subreddit.toLowerCase() : this.curSubReddit;

		if (this.isDark() && !this.isNightmodeCompatible) {
			var idx = this.nightModeWhitelist.indexOf(togglesr);
			if (idx !== -1) this.nightModeWhitelist.splice(idx, 1); // Remove it if found...
			RESStorage.setItem('RESmodules.styleTweaks.nightModeWhitelist', JSON.stringify(this.nightModeWhitelist));
		} else if (this.ignoredSubReddits) {
			var idx = this.ignoredSubReddits.indexOf(togglesr); // Find the index
			if (idx === -1) this.ignoredSubReddits.push(togglesr);
			RESStorage.setItem('RESmodules.styleTweaks.ignoredSubredditStyles', JSON.stringify(this.ignoredSubReddits));
		}

		var subredditStyleSheet = this.head.querySelector('link[title=applied_subreddit_stylesheet]');
		if (!subredditStyleSheet) subredditStyleSheet = this.head.querySelector('style[title=applied_subreddit_stylesheet]');
		if ((subredditStyleSheet) && (!subreddit || (subreddit == this.curSubReddit))) {
			subredditStyleSheet.parentNode.removeChild(subredditStyleSheet);
		}
	},
	enableNightMode: function() {
		// Set the user preference, if possible (which is not at page load)
		if (RESStorage.getItem) {
			RESUtils.setOption('styleTweaks', 'lightOrDark', 'dark');
		}

		localStorage.setItem('RES_nightMode', true);
		document.html.classList.add('res-nightmode');

		if (document.body) {
			document.body.classList.add('res-nightmode');
		}
	},
	disableNightMode: function() {
		// Set the user preference, if possible (which is not at page load)
		if (RESStorage.getItem) {
			RESUtils.setOption('styleTweaks', 'lightOrDark', 'light');
		}

		localStorage.removeItem('RES_nightMode');
		document.html.classList.remove('res-nightmode');

		if (document.body) {
			document.body.classList.remove('res-nightmode');
		}
	}
};
