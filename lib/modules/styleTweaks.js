addModule('styleTweaks', (module, moduleID) => {
	module.moduleName = 'Style Tweaks';
	module.category = ['Appearance', 'Comments'];
	module.description = 'Provides a number of style tweaks to the Reddit interface. Also allow you to disable specific subreddit style (the <a href="/prefs/#show_stylesheets">global setting</a> must be on).';
	module.options = {
		navTop: {
			type: 'boolean',
			value: true,
			description: 'Moves the username navbar to the top (great on netbooks!)',
			bodyClass: 'res-navTop'
		},
		commentBoxes: {
			type: 'boolean',
			value: true,
			description: 'Highlights comment boxes for easier reading / placefinding in large threads.',
			bodyClass: 'res-commentBoxes'
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
			dependsOn: 'commentBoxes',
			bodyClass: 'res-commentBoxes-rounded'
		},
		commentHoverBorder: {
			type: 'boolean',
			value: false,
			description: 'Highlight comment box hierarchy on hover (turn off for faster performance)',
			advanced: true,
			dependsOn: 'commentBoxes',
			bodyClass: 'res-commentHoverBorder'
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
			dependsOn: 'commentBoxes',
			bodyClass: 'res-continuity'
		},
		disableAnimations: {
			type: 'boolean',
			value: false,
			description: 'Discourage CSS3 animations. (This will apply to all of reddit, every subreddit, and RES functionality. However, subreddits might still have some animations.)',
			bodyClass: true
		},
		visitedStyle: {
			type: 'boolean',
			value: false,
			description: 'Reddit makes it so no links on comment pages appear as "visited" - including user profiles. This option undoes that.',
			advanced: true,
			bodyClass: true
		},
		showExpandos: {
			type: 'boolean',
			value: true,
			description: 'Bring back video and text expando buttons for users with compressed link display',
			advanced: true,
			bodyClass: true
		},
		hideUnvotable: {
			type: 'boolean',
			value: false,
			description: 'Hide vote arrows on threads where you cannot vote (e.g. archived due to age)',
			bodyClass: true
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
			description: 'Choose when full link flair should be shown',
			bodyClass: true
		},
		highlightEditedTime: {
			type: 'boolean',
			value: false,
			description: 'Make edited timestamps bold (e.g. "last edited 50 minutes ago")',
			bodyClass: true
		},
		colorBlindFriendly: {
			type: 'boolean',
			value: false,
			description: 'Use colorblind friendly styles when possible',
			advanced: true,
			bodyClass: 'res-colorblind'
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
			}],
			bodyClass: true
		}
	};
	module.loadDynamicOptions = function() {
		if (BrowserDetect.isChrome() || BrowserDetect.isFirefox()) {
			this.options.subredditStyleBrowserToolbarButton.noconfig = false;
		}
	};

	const styleCBName = RESUtils.randomHash();
	let curSubReddit;

	module.beforeLoad = async function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.commentBoxes.value && this.options.commentIndent.value && RESUtils.pageType('comments')) {
				// this should override the default of 10px in commentboxes.css because it's added later.
				RESUtils.addCSS(`.res-commentBoxes .comment { margin-left:${this.options.commentIndent.value}px !important; }`);
			}
			if (RESUtils.currentSubreddit()) {
				curSubReddit = RESUtils.currentSubreddit().toLowerCase();
			}


			RESUtils.addCSS(`
				body.res .side .spacer .titlebox div #${styleCBName}:before { display: none !important; }
				body.res .side .spacer .titlebox div #label-${styleCBName}:before { display: none !important; }
				body.res .side .spacer .titlebox div #${styleCBName}:after { display: none !important; }
				body.res .side .spacer .titlebox div #label-${styleCBName}:after { display: none !important; }
			`);

			if (this.options.highlightTopLevel.value) {
				const highlightTopLevelColor = this.options.highlightTopLevelColor.value || this.options.highlightTopLevelColor.default;
				const highlightTopLevelSize = parseInt(this.options.highlightTopLevelSize.value || this.options.highlightTopLevelSize.default, 10);
				RESUtils.addCSS(`.nestedlisting > .comment + .clearleft { height: ${highlightTopLevelSize}px !important; margin-bottom: 5px; background: ${highlightTopLevelColor} !important; }`);
			}

			await loadIgnoredSubreddits();
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.colorBlindFriendly.value) {
				const orangered = document.getElementById('mail');
				if ((orangered) && (orangered.classList.contains('havemail'))) {
					orangered.setAttribute('style', 'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAKAgMAAAAWdexqAAAACVBMVEX/VwD/hgD///9PE9e4AAAAL0lEQVQI12MIDQ0NYUhgYFBh8GBgaGFwYmBiYXBo4AASCSosDE5cTSwQCbASkGIAxJMH9f3+nCsAAAAASUVORK5CYII=); background-position: 0 0;');
				}
			}
			if (this.options.scrollSubredditDropdown.value) {
				const calcedHeight = Math.floor(window.innerHeight * 0.95);
				if ($('.drop-choices.srdrop').height() > calcedHeight) {
					RESUtils.addCSS(`
						.drop-choices.srdrop {
							overflow-y: scroll;
							max-height: ${calcedHeight} px;
						}
					`);
				}
			}
			if (this.options.floatingSideBar.value) {
				floatSideBar();
			}
			subredditStyles();
			setupElementToggleObservers();
			module.updatePageAction();

			if ($('#show_stylesheets').length) {
				$('label[for=show_stylesheets]').after(' <span class="little gray">(RES allows you to disable specific subreddit styles!  <a href="/r/Enhancement/wiki/srstyle">Click here to learn more</a>)</span>');
			}

			registerCommandLine();
		}
	};

	module.updatePageAction = function() {
		if (!module.options.subredditStyleBrowserToolbarButton.value) {
			RESEnvironment.pageAction.destroy();
		} else if (!RESUtils.currentSubreddit()) {
			RESEnvironment.pageAction.hide();
		} else {
			RESEnvironment.pageAction.show(module.styleToggleCheckbox.checked);
		}
	};

	function registerCommandLine() {
		modules['commandLine'].registerCommand('srstyle', 'srstyle [subreddit] [on|off] - toggle subreddit style on/off (if no subreddit is specified, uses current subreddit)',
			(command, val) => {
				const options = getSrstyleOptions(val);
				let str = 'toggle subreddit style';
				if (options.toggleText) {
					str += ` ${options.toggleText}`;

					if (options.sr) {
						str += ` for: ${options.sr}`;
					}
				}

				return str;
			},
			(command, val) => {
				// toggle subreddit style
				const options = getSrstyleOptions(val);

				if (!options.sr) {
					return 'No subreddit specified.';
				}

				let toggle;
				if (options.toggleText === 'on') {
					toggle = true;
				} else if (options.toggleText === 'off') {
					toggle = false;
				} else {
					return 'You must specify "on" or "off".';
				}
				const action = toggle ? 'enabled' : 'disabled';
				module.toggleSubredditStyle(toggle, options.sr);
				modules['notifications'].showNotification({
					header: 'Subreddit Style',
					moduleID: 'styleTweaks',
					message: `Subreddit style ${action} for subreddit: ${options.sr}`
				}, 4000);
			}
		);

		function getSrstyleOptions(val) {
			const splitWords = val.split(' ');
			let sr, toggleText;
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
				sr,
				toggleText
			};
		}
	}

	function floatSideBar() {
		const sideBarElement = document.querySelector('.listing-chooser');
		if (sideBarElement) {
			window.addEventListener('scroll', RESUtils.debounce(() => handleScroll(sideBarElement), 300), false);
		}
	}

	function handleScroll(sideBarElement) {
		if (RESUtils.elementInViewport(sideBarElement)) {
			sideBarElement.setAttribute('style', '');
		} else {
			sideBarElement.setAttribute('style', 'position: fixed; top: 0; z-index: 100; height: 100%; overflow-y: auto;');
		}
	}

	let ignoredSubReddits = [];

	async function loadIgnoredSubreddits() {
		ignoredSubReddits = await RESEnvironment.storage.get('RESmodules.styleTweaks.ignoredSubredditStyles') || [];
	}

	function subredditStyles() {
		if (!RESUtils.currentSubreddit()) {
			return;
		}

		const subredditTitle = document.querySelector('.titlebox h1');
		module.styleToggleContainer = document.createElement('div');
		module.styleToggleLabel = document.createElement('label');
		module.styleToggleCheckbox = document.createElement('input');
		module.styleToggleCheckbox.setAttribute('type', 'checkbox');
		module.styleToggleCheckbox.setAttribute('id', styleCBName);
		module.styleToggleCheckbox.setAttribute('name', styleCBName);

		// are we blacklisting, or whitelisting subreddits?  If we're in night mode on a sub that's
		// incompatible with it, we want to check the whitelist. Otherwise, check the blacklist.

		if (curSubReddit && subredditTitle) {
			if (modules['nightMode'].isNightModeOn() &&
					!modules['nightMode'].isNightmodeCompatible) {
				const subredditStylesWhitelist = modules['nightMode'].options.subredditStylesWhitelist.value.split(',');
				const index = subredditStylesWhitelist.indexOf(curSubReddit);

				if (index !== -1) {
					module.styleToggleCheckbox.checked = true;
				}
			} else {
				const index = ignoredSubReddits.indexOf(curSubReddit);

				if (index === -1) {
					module.styleToggleCheckbox.checked = true;
				} else {
					module.toggleSubredditStyle(false);
				}
			}
			module.styleToggleCheckbox.addEventListener('change', function() {
				module.toggleSubredditStyle(this.checked);
			}, false);
			module.styleToggleContainer.appendChild(module.styleToggleCheckbox);
			RESUtils.insertAfter(subredditTitle, module.styleToggleContainer);
		}

		module.styleToggleLabel.setAttribute('for', styleCBName);
		module.styleToggleLabel.setAttribute('id', `label-${styleCBName}`);
		module.styleToggleLabel.textContent = 'Use subreddit style ';
		module.styleToggleContainer.appendChild(module.styleToggleLabel);

		module.styleToggleContainer.style = 'display: block !important;';
		module.styleToggleCheckbox.style = 'display: inline-block !important;';
		module.styleToggleLabel.style = 'display: inline-block !important; margin-left: 4px !important;';
	}

	function setupElementToggleObservers() {
		if (!window.MutationObserver) return;
		const elems = document.querySelectorAll('.cover-overlay');
		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.attributeName === 'style') {
					let mutationID = $(mutation.target).data('mutation-id');
					if (typeof mutationID === 'undefined') {
						mutationID = Math.random();
						$(mutation.target).data('mutation-id', mutationID);
					}
				}
			});
		});

		Array.from(elems).forEach(elem =>
			observer.observe(elem, { attributes: true, attributeFilter: ['style'] })
		);
	}

	module.toggleSubredditStyle = function(toggle, subreddit) {
		if (toggle) {
			enableSubredditStyle(subreddit);
		} else {
			disableSubredditStyle(subreddit);
		}
	};

	let stylesheetURL;

	function enableSubredditStyle(subreddit) {
		const togglesr = subreddit ? subreddit.toLowerCase() : curSubReddit;

		if (modules['nightMode'].isNightModeOn() &&
				!modules['nightMode'].isNightmodeCompatible) {
			modules['nightMode'].addSubredditToWhitelist(togglesr);
		} else if (ignoredSubReddits) {
			const index = ignoredSubReddits.indexOf(togglesr);

			if (index !== -1) {
				// Remove if found
				ignoredSubReddits.splice(index, 1);
			}

			RESEnvironment.storage.set('RESmodules.styleTweaks.ignoredSubredditStyles', ignoredSubReddits);
		}

		const subredditStyleSheet = document.createElement('link');
		subredditStyleSheet.setAttribute('title', 'applied_subreddit_stylesheet');
		subredditStyleSheet.setAttribute('rel', 'stylesheet');
		if (stylesheetURL) {
			subredditStyleSheet.setAttribute('href', stylesheetURL);
		} else {
			subredditStyleSheet.setAttribute('href', `/r/${togglesr}/stylesheet.css`);
		}
		if (!subreddit || (subreddit.toLowerCase() === curSubReddit)) document.head.appendChild(subredditStyleSheet);

		// in case it was set by the pageAction, be sure to check the checkbox.
		if (module.styleToggleCheckbox) {
			module.styleToggleCheckbox.checked = true;
		}
		RESEnvironment.pageAction.show(true);
	}

	function disableSubredditStyle(subreddit) {
		const togglesr = subreddit ? subreddit.toLowerCase() : curSubReddit;
		if (modules['nightMode'].isNightModeOn() &&
				!modules['nightMode'].isNightmodeCompatible) {
			modules['nightMode'].removeSubredditFromWhitelist(togglesr);
		} else if (ignoredSubReddits) {
			const index = ignoredSubReddits.indexOf(togglesr);

			if (index === -1) {
				// Add if found
				ignoredSubReddits.push(togglesr);
			}

			RESEnvironment.storage.set('RESmodules.styleTweaks.ignoredSubredditStyles', ignoredSubReddits);
		}

		const subredditStyleSheet = (
			document.head.querySelector('link[title=applied_subreddit_stylesheet]') ||
			document.head.querySelector('style[title=applied_subreddit_stylesheet]') ||
			document.head.querySelector('style[data-apng-original-href]') // apng extension fix (see #1076)
		);

		if (subredditStyleSheet && (!subreddit || (subreddit.toLowerCase() === curSubReddit))) {
			stylesheetURL = subredditStyleSheet.href;
			subredditStyleSheet.parentNode.removeChild(subredditStyleSheet);
		}

		// in case it was set by the pageAction, be sure to uncheck the checkbox
		if (module.styleToggleCheckbox) {
			module.styleToggleCheckbox.checked = false;
		}
		RESEnvironment.pageAction.show(false);
	}

	module.isSubredditStyleEnabled = function() {
		// TODO: detect if srstyle is disabled by reddit account preference

		if (module.styleToggleCheckbox) {
			return module.styleToggleCheckbox.checked;
		}

		// RES didn't disable it, at least
		return true;
	};
});
