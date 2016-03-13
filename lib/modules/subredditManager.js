addModule('subredditManager', {
	moduleID: 'subredditManager',
	moduleName: 'Subreddit Manager',
	category: ['Subreddits'],
	options: {
		subredditShortcut: {
			type: 'boolean',
			value: true,
			description: 'Add +shortcut button in subreddit sidebar for easy addition of shortcuts.'
		},
		shortcutsPerAccount: {
			type: 'boolean',
			value: true,
			description: 'Show personalized shortcuts for each account'
		},
		alwaysApplySuffixToMulti: {
			type: 'boolean',
			value: false,
			description: 'For multi-subreddit shortcuts like a+b+c/x, show a dropdown like a/x, b/x, c/x'
		},
		dropdownEditButton: {
			type: 'boolean',
			value: true,
			description: 'Show "edit" and "delete" buttons in dropdown menu on subreddit shortcut bar'
		},
		shortcutDropdownDelay: {
			type: 'text',
			value: 200,
			description: 'How long (in milliseconds) to wait after moving your mouse over a shortcut to show its dropdown. (This particularly applies for shortcuts to multi-subreddits like sub1+sub2+sub3.)'
		},
		shortcutEditDropdownDelay: {
			dependsOn: 'dropdownEditButton',
			type: 'text',
			value: 3000,
			description: 'How long (in milliseconds) to wait after moving your mouse over a shortcut to show its dropdown edit buttons. (This particularly applies to just the edit/delete button dropdown.)'
		},
		allowLowercase: {
			type: 'boolean',
			value: false,
			description: 'Allow lowercase letters in shortcuts instead of forcing uppercase'
		},
		linkDashboard: {
			type: 'boolean',
			value: true,
			description: 'Show "DASHBOARD" link in subreddit manager'
		},
		linkAll: {
			type: 'boolean',
			value: true,
			description: 'Show "ALL" link in subreddit manager'
		},
		linkFront: {
			type: 'boolean',
			value: true,
			description: 'show "FRONT" link in subreddit manager'
		},
		linkRandom: {
			type: 'boolean',
			value: true,
			description: 'Show "RANDOM" link in subreddit manager'
		},
		linkMyRandom: {
			type: 'boolean',
			value: true,
			description: 'Show "MYRANDOM" link in subreddit manager (reddit gold only)'
		},
		linkRandNSFW: {
			type: 'boolean',
			value: false,
			description: 'Show "RANDNSFW" link in subreddit manager'
		},
		linkFriends: {
			type: 'boolean',
			value: true,
			description: 'Show "FRIENDS" link in subreddit manager'
		},
		linkMod: {
			type: 'boolean',
			value: true,
			description: 'Show "MOD" link in subreddit manager'
		},
		linkModqueue: {
			type: 'boolean',
			value: true,
			description: 'Show "MODQUEUE" link in subreddit manager'
		},
		buttonEdit: {
			type: 'boolean',
			value: true,
			description: 'Show "EDIT" button in subreddit manager'
		},
		lastUpdate: {
			type: 'boolean',
			value: true,
			description: 'Show last update information on the front page (work only if you have at least 50/100 subscription, see <a href="/r/help/wiki/faq#wiki_some_of_my_subreddits_keep_disappearing.__why.3F">here</a> for more info).'
		}
		/*		sortingField: {
			type: 'enum',
			values: [
				{ name: 'Subreddit Name', value: 'displayName' },
				{ name: 'Added date', value: 'addedDate' }
			],
			value : 'displayName',
			description: 'Field to sort subreddit shortcuts by'
		},
		sortingDirection: {
			type: 'enum',
			values: [
				{ name: 'Ascending', value: 'asc' },
				{ name: 'Descending', value: 'desc' }
			],
			value : 'asc',
			description: 'Field to sort subreddit shortcuts by'
		}
*/
	},
	description: 'Allows you to customize the top bar with your own subreddit shortcuts, including dropdown menus of multi-reddits and more.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.srOver { outline: 1px dashed black; }');
			RESUtils.addCSS('#sr-header-area { overflow: hidden; }');
			RESUtils.addCSS('#sr-header-area a { font-size: 100% !important; }');
			RESUtils.addCSS('#srList { position: absolute; top: 18px; left: 0; z-index: 9999; display: none; border: 1px solid black; background-color: #FAFAFA; width: auto; overflow-y: auto; }');
			RESUtils.addCSS('#srList tr { border-bottom: 1px solid gray; }');
			RESUtils.addCSS('#srList thead td { cursor: pointer; }');
			RESUtils.addCSS('#srList td { padding: 3px 8px; }');
			RESUtils.addCSS('#srList td.RESvisited, #srList td.RESshortcut { text-transform: none; }');
			RESUtils.addCSS('#srList td.RESshortcut {cursor: pointer;}');
			RESUtils.addCSS('#srList td a { width: 100%; display: block; }');
			RESUtils.addCSS('#srList tr:hover { background-color: #eef; }');
			RESUtils.addCSS('#srLeftContainer, #RESStaticShortcuts, #RESShortcuts, #srDropdown { display: inline; float: left; position: relative; z-index: 5; }');

			// Edit shortcut dialog.
			RESUtils.addCSS('#editShortcutDialog { display: none; z-index: 999; position: absolute; top: 25px; left: 5px; width: auto; padding: 10px; background: #f0f3fc; border: 1px solid #aaa; border-radius: 7px; font-size: 12px; color: #000; box-shadow: 2px 2px 7px rgba(0,0,0,.1); }');
			RESUtils.addCSS('#editShortcutDialog h3 { margin: 0 0 1em 0; }');
			RESUtils.addCSS('#editShortcutDialog .RESFormItem { clear: both; margin: 0 0 1em 0; }');
			RESUtils.addCSS('#editShortcutDialog .RESFieldItem { margin: 0 0 0 8em; }');
			RESUtils.addCSS('#editShortcutDialog label { clear: both; float: left; width: 8em; padding: 4px 0; }');
			RESUtils.addCSS('#editShortcutDialog input[type=text] { width: 270px; border: 1px solid #aaa; margin: 0; padding: 2px 0 2px 3px; font-size: 100% !important; box-sizing: border-box; }');
			RESUtils.addCSS('#editShortcutDialog input#shortcut-subreddit { width: 240px; }');
			RESUtils.addCSS('#editShortcutDialog #sortButton { border: 1px solid #aaa !important; border-right: none !important; border-radius: 3px 0 0 3px; background: rgb(230,230,230); color: #333 !important; margin: 0; padding: 2px 0 !important; text-align: center; cursor: pointer; display: inline-block !important; width: 30px !important; line-height: normal; box-shadow: none; font-size: 100% !important; }');
			RESUtils.addCSS('#editShortcutDialog .RESDescription { font-size: smaller; color: #666; width: 270px; }');
			// Fix a Firefox alignment quirk with -moz-focus-inner
			RESUtils.addCSS('#editShortcutDialog #sortButton::-moz-focus-inner, #editShortcutDialog input#shortcut-subreddit::-moz-focus-inner { border: 0; padding: 0; }');
			RESUtils.addCSS('#editShortcutDialog [name=shortcut-save] { float: right; padding: 1px 6px; }');

			RESUtils.addCSS('#srLeftContainer { z-index: 4; padding-left: 4px; margin-right: 6px; }');
			// RESUtils.addCSS('#RESShortcuts { position: absolute; left: '+ this.srLeftContainerWidth+'px;  z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; margin-top: -2px; padding-top: 2px; }');
			RESUtils.addCSS('#srLeftContainer { z-index: 4; padding-left: 4px; margin-right: 6px; }');
			RESUtils.addCSS('#RESShortcutsViewport { width: auto; max-height: 20px; overflow: hidden; }');
			RESUtils.addCSS('#RESShortcuts { z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown { display: none; position: absolute; z-index: 99999; background-color: #F0F0F0; border: 1px solid black; border-top-width: 0; font: 12px/1.5 verdana, sans-serif; padding: 0 !important; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown ul { padding: 15px 0; overflow-x: hidden; overflow-y: auto; max-width: 300px; max-height: 500px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown ul li { padding: 0; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown ul a { display: block; padding: 1px 15px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown ul a:hover { background-color: rgba(255,255,255,.6); }');
			RESUtils.addCSS('#RESShortcutsEditContainer { width: 69px; position: absolute; right: 0; top: 0; z-index: 999; background-color: #f0f0f0; height: 16px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('#RESShortcutsRight { right: 0; }');
			RESUtils.addCSS('#RESShortcutsEditContainer .res-icon { font-size: 14px; }');
			RESUtils.addCSS('#RESShortcutsAdd { right: 15px; }');
			RESUtils.addCSS('#RESShortcutsLeft { right: 31px; }');
			RESUtils.addCSS('#RESShortcutsSort { right: 47px; }');

			RESUtils.addCSS('#RESShortcutsSort, #RESShortcutsRight, #RESShortcutsLeft, #RESShortcutsAdd, #RESShortcutsTrash { width: 16px; cursor: pointer; background: #F0F0F0; font-size: 20px; color: #369; height: 18px; line-height: 15px; position: absolute; top: 0; z-index: 999; background-color: #f0f0f0; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('#RESShortcutsSort { font-size: 14px; }');
			RESUtils.addCSS('#RESShortcutsTrash { display: none; font-size: 17px; width: 16px; cursor: pointer; right: 15px; height: 16px; position: absolute; top: 0; z-index: 1000; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.srSep { margin-left: 6px; }');
			// RESUtils.addCSS('h1.redditname > a { float: left; }');
			RESUtils.addCSS('h1.redditname { overflow: auto; }');
			RESUtils.addCSS('.sortAsc, .sortDesc { float: right; }');
			RESUtils.addCSS('.sortAsc::after, .sortDesc::after { width: 12px; line-height: 12px; font-size: 12px; color: #82a3c0 }');
			RESUtils.addCSS('.sortAsc::after { content: "\\25B2" }');
			RESUtils.addCSS('.sortDesc::after { content: "\\25BC" }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer { display: none; position: absolute; width: 290px; padding: 2px; right: 0; top: 21px; z-index: 10000; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px; font-size: 12px; color: #000; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer  a { font-weight: bold; }');
			RESUtils.addCSS('#newShortcut { width: 130px; }');
			RESUtils.addCSS('#displayName { width: 130px; }');
			RESUtils.addCSS('#shortCutsAddForm { padding: 5px; }');
			RESUtils.addCSS('#shortCutsAddForm div { font-size: 10px; margin-bottom: 10px; }');
			RESUtils.addCSS('#shortCutsAddForm label { display: inline-block; width: 100px; }');
			RESUtils.addCSS('#shortCutsAddForm input[type=text] { width: 170px; margin-bottom: 6px; }');
			RESUtils.addCSS('#addSubreddit { float: right; cursor: pointer; padding: 3px 5px; font-size: 12px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; }');
			RESUtils.addCSS('#sr-header-area a.RESShortcutsCurrentSub, #RESSubredditGroupDropdown .RESShortcutsCurrentSub a { color: orangered !important; font-weight: bold; }');
			RESUtils.addCSS('#srLeftContainer, #RESShortcutsViewport, #RESShortcutsEditContainer{max-height:18px;}');
			RESUtils.addCSS('#RESSubredditGroupDropdown { margin-left: -5px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown > .RESShortcutsEditButtons { border-top: 1px rgba(0,0,0,.5) solid; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown > .RESShortcutsEditButtons .res-icon { color: black; font-size: 12px; padding: 5px; margin: 0 !important; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown > .RESShortcutsEditButtons .delete { float: right; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown .shortcutSuffix { opacity:0.4; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown a:hover .shortcutSuffix { opacity:0.6; }');

			// this shows the sr-header-area that we hid while rendering it (to curb opera's glitchy "jumping")...
			if (BrowserDetect.isOpera()) {
				RESUtils.addCSS('#sr-header-area { display: block !important; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if (this.options.linkMyRandom.value) {
				var originalMyRandom = document.querySelector('#sr-header-area a[href$="/r/myrandom/"]');
				if (originalMyRandom) {
					this.myRandomEnabled = true;
					if (originalMyRandom.classList.contains('gold')) {
						this.myRandomGold = true;
					}
				}
			}

			if (this.options.lastUpdate.value && document.getElementsByClassName('listing-chooser').length) {
				this.lastUpdate();
			}

			this.manageSubreddits();
			if (RESUtils.currentSubreddit() !== null) {
				this.setLastViewtime();
			}

			if (this.options.allowLowercase.value) {
				RESUtils.addCSS('#sr-header-area { text-transform: none; }');
			}
		}
	},
	manageSubreddits: function() {
		// This is the init function for Manage Subreddits - it'll get your preferences and redraw the top bar.
		this.redrawSubredditBar();
		// Listen for subscriptions / unsubscriptions from reddits so we know to reload the JSON string...
		// also, add a +/- shortcut button...
		if (RESUtils.currentSubreddit() && this.options.subredditShortcut.value) {
			var subButtons = document.querySelectorAll('.side .fancy-toggle-button');
			Array.prototype.slice.call(subButtons).forEach(function(subButton) {
				var thisSubredditFragment, isMulti;
				if ((RESUtils.currentSubreddit().indexOf('+') === -1) && (RESUtils.currentSubreddit() !== 'mod')) {
					thisSubredditFragment = RESUtils.currentSubreddit();
					isMulti = false;
				} else if ($(subButton).parent().hasClass('subButtons')) {
					thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
					isMulti = true;
				} else {
					thisSubredditFragment = $(subButton).next().text();
					isMulti = true;
				}
				if ($('#subButtons-' + thisSubredditFragment).length === 0) {
					var subButtonsWrapper = $('<div id="subButtons-' + thisSubredditFragment + '" class="subButtons" style="margin: 0 !important; top: 0 !important; z-index: 1 !important;"></div>');
					$(subButton).wrap(subButtonsWrapper);
					// move this wrapper to the end (after any icons that may exist...)
					if (isMulti) {
						var theWrap = $(subButton).parent();
						$(theWrap).appendTo($(theWrap).parent());
					}
				}
				subButton.addEventListener('click', function() {
					// reset the last checked time for the subreddit list so that we refresh it anew no matter what.
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser(), 0);
				}, false);
				var theSC = document.createElement('span');
				theSC.setAttribute('class', 'res-fancy-toggle-button RESshortcut RESshortcutside');
				theSC.setAttribute('data-subreddit', thisSubredditFragment);
				var idx = modules['subredditManager'].mySubredditShortcuts.findIndex(function(shortcut) {
					return shortcut.subreddit.toLowerCase() === thisSubredditFragment.toLowerCase();
				});
				if (idx !== -1) {
					theSC.textContent = '-shortcut';
					theSC.setAttribute('title', 'Remove this subreddit from your shortcut bar');
					theSC.classList.add('remove');
				} else {
					theSC.textContent = '+shortcut';
					theSC.setAttribute('title', 'Add this subreddit to your shortcut bar');
				}
				theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);
				// subButton.parentNode.insertBefore(theSC, subButton);
				// theSubredditLink.appendChild(theSC);
				$('#subButtons-' + thisSubredditFragment).append(theSC);
				var next = $('#subButtons-' + thisSubredditFragment).next();
				if ($(next).hasClass('title') && (!$('#subButtons-' + thisSubredditFragment).hasClass('swapped'))) {
					$('#subButtons-' + thisSubredditFragment).before($(next));
					$('#subButtons-' + thisSubredditFragment).addClass('swapped');
				}
			});
		}

		// If we're on the reddit-browsing page (/reddits or /subreddits), add +shortcut and -shortcut buttons...
		if (/^https?:\/\/www\.reddit\.com\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.href)) {
			this.browsingReddits();
		}
	},
	browsingReddits: function() {
		$('.subreddit').each(function() {
			// Skip subreddit links that already have a shortcut button
			if (typeof $(this).data('hasShortcutButton') !== 'undefined' && $(this).data('hasShortcutButton')) {
				return;
			}

			// Otherwise, indicate that this link now has a shortcut button
			$(this).data('hasShortcutButton', true);

			var subreddit = $(this).find('a.title').attr('href').match(/^https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w]+).*/i)[1],
				$theSC = $('<span>')
					.css({'margin-right': '0'})
					.addClass('res-fancy-toggle-button')
					.data('subreddit', subreddit),
				isShortcut = modules['subredditManager'].mySubredditShortcuts.some(function(shortcut) {
					return shortcut.subreddit === subreddit;
				});

			if (isShortcut) {
				$theSC
					.attr('title', 'Remove this subreddit from your shortcut bar')
					.text('-shortcut')
					.addClass('remove');
			} else {
				$theSC
					.attr('title', 'Add this subreddit to your shortcut bar')
					.text('+shortcut')
					.removeClass('remove');
			}

			$theSC
				.on('click', modules['subredditManager'].toggleSubredditShortcut)
				.appendTo($(this).find('.midcol'));
		});
	},
	redrawShortcuts: function() {
		this.shortCutsContainer.textContent = '';
		// Try Refresh subreddit shortcuts
		if (this.mySubredditShortcuts.length === 0) {
			this.getLatestShortcuts();
		}
		if (this.mySubredditShortcuts.length > 0) {
			// go through the list of shortcuts and print them out...
			this.mySubredditShortcuts = this.mySubredditShortcuts.map(function(shortcut, i) {
				if (typeof shortcut === 'string') {
					shortcut = {
						subreddit: shortcut,
						displayName: shortcut,
						addedDate: Date.now()
					};
				}

				var thisShortCut = document.createElement('a');
				thisShortCut.setAttribute('draggable', 'true');
				thisShortCut.setAttribute('orderIndex', i);
				thisShortCut.setAttribute('data-subreddit', shortcut.subreddit);
				thisShortCut.classList.add('subbarlink');

				if ((RESUtils.currentSubreddit() !== null) && (RESUtils.currentSubreddit().toLowerCase() === shortcut.subreddit.toLowerCase())) {
					thisShortCut.classList.add('RESShortcutsCurrentSub');
				}

				thisShortCut.setAttribute('href', '/r/' + shortcut.subreddit);
				thisShortCut.textContent = shortcut.displayName;
				thisShortCut.addEventListener('click', function(e) {
					if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
						// open in new tab, let the browser handle it
						return true;
					} else {
						e.preventDefault();
						// use to open links in new tabs... work on this later...
						modules['subredditManager'].clickedShortcut = e.target.getAttribute('href');
						if (typeof modules['subredditManager'].clickTimer === 'undefined') {
							modules['subredditManager'].clickTimer = setTimeout(modules['subredditManager'].followSubredditShortcut, 300);
						}
					}
				}, false);

				thisShortCut.addEventListener('dblclick', function(e) {
					e.preventDefault();
					clearTimeout(modules['subredditManager'].clickTimer);
					delete modules['subredditManager'].clickTimer;
					modules['subredditManager'].hideSubredditGroupDropdown();
					modules['subredditManager'].editSubredditShortcut(e.target);
				}, false);

				thisShortCut.addEventListener('mouseover', function(e) {
					clearTimeout(modules['subredditManager'].hideSubredditGroupDropdownTimer);
					modules['subredditManager'].showSubredditGroupDropdown(e.target);
				}, false);

				thisShortCut.addEventListener('mouseout', function(e) {
					clearTimeout(modules['subredditManager'].showSubredditGroupDropdownTimer);
					modules['subredditManager'].hideSubredditGroupDropdownTimer = setTimeout(function() {
						modules['subredditManager'].hideSubredditGroupDropdown();
					}, 500);
				}, false);

				thisShortCut.addEventListener('dragstart', modules['subredditManager'].subredditDragStart, false);
				thisShortCut.addEventListener('dragenter', modules['subredditManager'].subredditDragEnter, false);
				thisShortCut.addEventListener('dragover', modules['subredditManager'].subredditDragOver, false);
				thisShortCut.addEventListener('dragleave', modules['subredditManager'].subredditDragLeave, false);
				thisShortCut.addEventListener('drop', modules['subredditManager'].subredditDrop, false);
				thisShortCut.addEventListener('dragend', modules['subredditManager'].subredditDragEnd, false);
				this.shortCutsContainer.appendChild(thisShortCut);

				if (i < this.mySubredditShortcuts.length - 1) {
					var sep = document.createElement('span');
					sep.setAttribute('class', 'separator');
					sep.textContent = '-';
					this.shortCutsContainer.appendChild(sep);
				}

				return shortcut;
			}, this);
			if (this.mySubredditShortcuts.length === 0) {
				this.shortCutsContainer.style.textTransform = 'none';
				this.shortCutsContainer.textContent = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			} else {
				this.shortCutsContainer.style.textTransform = '';
			}
		} else {
			this.shortCutsContainer.style.textTransform = 'none';
			this.shortCutsContainer.textContent = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			this.mySubredditShortcuts = [];
		}
	},
	showSubredditGroupDropdown: function(obj) {
		var subreddits = [];
		var suffix = '';

		if ((typeof obj.getAttribute !== 'undefined') && (obj.getAttribute('href').indexOf('+') !== -1)) {
			var cleanSubreddits = obj.getAttribute('href').replace('/r/', '').replace('/r/', '');

			if (cleanSubreddits.indexOf('/') > cleanSubreddits.lastIndexOf('+') || modules['subredditManager'].options.alwaysApplySuffixToMulti.value) {
				// for shortcuts like a+b/x, use subreddits=a+b ; suffix = x
				// for shortcuts like a/x+b/y, just split them a la pre-4.5.0
				var pos;
				if ((pos = cleanSubreddits.lastIndexOf('?')) > cleanSubreddits.lastIndexOf('+')) {
					suffix = cleanSubreddits.substr(pos);
					cleanSubreddits = cleanSubreddits.substr(0,pos);
				}
				if ((pos = cleanSubreddits.lastIndexOf('/')) > cleanSubreddits.lastIndexOf('+')) { // check both existance and correct form (i.e. not foo/new+bar)
					suffix = cleanSubreddits.substr(pos) + suffix;
					cleanSubreddits = cleanSubreddits.substr(0,pos);
				}
			}
			subreddits = cleanSubreddits.split('+');
		}

		if (!(subreddits.length || modules['subredditManager'].options.dropdownEditButton.value)) {
			return;
		}

		var delay;

		if (subreddits.length) {
			delay = parseInt(modules['subredditManager'].options.shortcutDropdownDelay.value, 10);
		} else {
			delay = parseInt(modules['subredditManager'].options.shortcutEditDropdownDelay.value, 10);
		}

		if (typeof delay !== 'number') {
			delay = parseInt(modules['subredditManager'].options.subredditShortcutDropdownDelay.default, 10);
		}

		clearTimeout(modules['subredditManager'].showSubredditGroupDropdownTimer);
		modules['subredditManager'].showSubredditGroupDropdownTimer = setTimeout(
			modules['subredditManager']._showSubredditGroupDropdown.bind(modules['subredditManager'], obj, subreddits, suffix),
			delay);
	},

	_showSubredditGroupDropdown: function(obj, subreddits, suffix) {
		this.hoveredSubredditShortcut = obj;

		// Show dropdown after an appropriate delay
		if (typeof this.subredditGroupDropdown === 'undefined') {
			this.subredditGroupDropdown = RESUtils.createElement('div', 'RESSubredditGroupDropdown');
			this.subredditGroupDropdownUL = document.createElement('ul');
			this.subredditGroupDropdown.appendChild(this.subredditGroupDropdownUL);

			if (modules['subredditManager'].options.dropdownEditButton.value) {
				$('	\
					<div class="RESShortcutsEditButtons">	\
						<a href="#"  class="delete res-icon" title="delete">&#xF056;</a>	\
						<a href="#" class="edit res-icon" title="edit">&#xF139;</a>	\
					</div>	\
					').appendTo(this.subredditGroupDropdown);
			}
			document.body.appendChild(this.subredditGroupDropdown);

			this.subredditGroupDropdown.addEventListener('mouseout', function(e) {
				modules['subredditManager'].hideSubredditGroupDropdownTimer = setTimeout(function() {
					modules['subredditManager'].hideSubredditGroupDropdown();
				}, 500);
			}, false);

			this.subredditGroupDropdown.addEventListener('mouseover', function(e) {
				clearTimeout(modules['subredditManager'].hideSubredditGroupDropdownTimer);
			}, false);

			$(this.subredditGroupDropdown).on('click', '.edit', function(e) {
				e.preventDefault();
				modules['subredditManager'].hideSubredditGroupDropdown();
				modules['subredditManager'].editSubredditShortcut(modules['subredditManager'].hoveredSubredditShortcut);
			});

			$(this.subredditGroupDropdown).on('click', '.delete', function(e) {
				e.preventDefault();
				modules['subredditManager'].hideSubredditGroupDropdown();
				modules['subredditManager'].editSubredditShortcut(modules['subredditManager'].hoveredSubredditShortcut);
				modules['subredditManager'].deleteButton.click();
			});

		}
		this.groupDropdownVisible = true;

		$(this.subredditGroupDropdownUL).find('li:not(.RESShortcutsEditButtons)').remove();

		if (subreddits) {
			var $rows = $();
			subreddits.forEach(function(subreddit) {
				var thisLI = $('<li><a href="/r/' + subreddit + suffix + '">' + subreddit + '<span class="shortcutSuffix">' + suffix + '</span>' + '</a></li>');
				$rows = $rows.add(thisLI);
				if (RESUtils.currentSubreddit() === subreddit) {
					thisLI.addClass('RESShortcutsCurrentSub');
				}
			});

			$(this.subredditGroupDropdownUL).prepend($rows);

		}

		var thisXY = RESUtils.getXYpos(obj);
		this.subredditGroupDropdown.style.top = (thisXY.y + 16) + 'px';
		// if fixed, override y to just be the height of the subreddit bar...
		// this.subredditGroupDropdown.style.position = 'fixed';
		// this.subredditGroupDropdown.style.top = '20px';
		this.subredditGroupDropdown.style.left = thisXY.x + 'px';
		this.subredditGroupDropdown.style.display = 'block';
	},
	hideSubredditGroupDropdown: function() {
		delete modules['subredditManager'].hideSubredditGroupDropdownTimer;
		if (this.subredditGroupDropdown) {
			this.subredditGroupDropdown.style.display = 'none';
		}
	},
	editSubredditShortcut: function(ele) {
		var subreddit = ele.getAttribute('href').slice(3);

		var idx = modules['subredditManager'].mySubredditShortcuts.findIndex(function(shortcut) {
			return shortcut.subreddit === subreddit;
		});

		if (typeof this.editShortcutDialog === 'undefined') {
			this.editShortcutDialog = RESUtils.createElement('div', 'editShortcutDialog');
			document.body.appendChild(this.editShortcutDialog);
		}

		var thisForm = '<form name="editSubredditShortcut"> \
			<h3>Edit Shortcut</h3> \
			<div id="editShortcutClose" class="RESCloseButton">&times;</div> \
			<div class="RESFormItem"> \
				<label for="subreddit">Subreddit:</label> \
				<div class="RESFieldItem"> \
					<button type="submit" id="sortButton" title="Sort subreddits">A-Z</button><!-- no whitespace \
					--><input type="text" name="subreddit" value="' + subreddit + '" id="shortcut-subreddit"> \
					<div class="RESDescription">Put a + between subreddits to make a drop-down menu.</div> \
				</div> \
			</div> \
			<div class="RESFormItem"> \
				<label for="displayName">Display Name:</label> \
				<div class="RESFieldItem"> \
					<input type="text" name="displayName" value="' + ele.textContent + '" id="shortcut-displayname"> \
				</div> \
			</div> \
			<input type="hidden" name="idx" value="' + idx + '"> \
			<button type="button" name="shortcut-save" id="shortcut-save">save</button> \
			<button type="button" name="shortcut-delete" id="shortcut-delete">delete</button> \
		</form>';
		$(this.editShortcutDialog).html(thisForm);

		this.subredditInput = this.editShortcutDialog.querySelector('input[name=subreddit]');
		this.displayNameInput = this.editShortcutDialog.querySelector('input[name=displayName]');

		this.subredditForm = this.editShortcutDialog.querySelector('FORM');
		this.subredditForm.addEventListener('submit', function(e) {
			e.preventDefault();
		}, false);

		this.saveButton = this.editShortcutDialog.querySelector('button[name=shortcut-save]');
		this.saveButton.addEventListener('click', function(e) {
			var idx = modules['subredditManager'].editShortcutDialog.querySelector('input[name=idx]').value;
			var subreddit = modules['subredditManager'].editShortcutDialog.querySelector('input[name=subreddit]').value;
			var displayName = modules['subredditManager'].editShortcutDialog.querySelector('input[name=displayName]').value;

			modules['subredditManager'].saveSubredditShortcut(subreddit, displayName, idx);
			modules['subredditManager'].editShortcutDialog.style.display = 'none';
		}, false);

		this.deleteButton = this.editShortcutDialog.querySelector('button[name=shortcut-delete]');
		this.deleteButton.addEventListener('click', function(e) {
			var idx = modules['subredditManager'].editShortcutDialog.querySelector('input[name=idx]').value;

			if (confirm('Are you sure you want to delete this shortcut?')) {
				modules['subredditManager'].saveSubredditShortcut('', '', idx);
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
			}
		}, false);

		// Allow the shortcut dropdown menu to be sorted
		function sortSubmenu(e) {
			var inputEl = modules['subredditManager'].editShortcutDialog.querySelector('input[name=subreddit]');
			var currStr = inputEl.value;
			var ascStr, descStr, ascArr, descArr;
			// sort ASC
			ascArr = currStr.split('+');
			ascArr.sort();
			ascStr = ascArr.join('+');
			// sort DESC
			descArr = ascArr;
			descArr.reverse();
			descStr = descArr.join('+');
			var btnTxt = $('#sortButton').text();
			if (e.target.type === 'submit') {
				// if sorted ASC, sort DESC. If unsorted or sorted DESC, sort ASC
				inputEl.value = (currStr === ascStr ? descStr : ascStr);
				btnTxt = (currStr === ascStr ? 'A-Z' : 'Z-A');
			} else {
				btnTxt = (currStr === ascStr ? 'Z-A' : 'A-Z');
			}
			$('#sortButton').text(btnTxt);
		}

		// handle the sort button
		var sortButton = this.editShortcutDialog.querySelector('#sortButton');
		sortButton.addEventListener('click', function(e) {
			sortSubmenu(e);
		}, false);

		// handle the subreddit textfield
		var inputSubreddit = this.editShortcutDialog.querySelector('input[name=subreddit]');
		inputSubreddit.addEventListener('change', function(e) {
			sortSubmenu(e);
		});

		// handle enter and escape keys in the dialog box...
		this.subredditInput.addEventListener('keydown', function(e) {
			if (e.keyCode === 13) {
				e.preventDefault();
				e.stopPropagation();
			}
		});
		this.subredditInput.addEventListener('keyup', function(e) {
			if (e.keyCode === 27) {
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
				modules['subredditManager'].editShortcutDialog.blur();
			} else if (e.keyCode === 13) {
				RESUtils.click(modules['subredditManager'].saveButton);
			}
		}, false);
		this.displayNameInput.addEventListener('keyup', function(e) {
			if (e.keyCode === 27) {
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
				modules['subredditManager'].editShortcutDialog.blur();
			} else if (e.keyCode === 13) {
				RESUtils.click(modules['subredditManager'].saveButton);
			}
		}, false);

		var cancelButton = this.editShortcutDialog.querySelector('#editShortcutClose');
		cancelButton.addEventListener('click', function(e) {
			modules['subredditManager'].editShortcutDialog.style.display = 'none';
		}, false);

		this.editShortcutDialog.style.display = 'block';
		// add 20px to compensate for scrollbar
		var thisLeft = Math.min(RESUtils.mouseX, window.innerWidth - (this.editShortcutDialog.offsetWidth + 20));
		this.editShortcutDialog.style.left = thisLeft + 'px';

		setTimeout(function() {
			modules['subredditManager'].subredditInput.focus();
		}, 200);
	},
	saveSubredditShortcut: function(subreddit, displayName, idx) {
		if (subreddit === '' || displayName === '') {
			// modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
			subreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
			modules['subredditManager'].removeSubredditShortcut(subreddit);
		} else {
			if (RESUtils.proEnabled()) {
				// store a delete for the old subreddit, and an add for the new.
				var oldsubreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
				if (typeof modules['subredditManager'].RESPro === 'undefined') {
					var temp;
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()) !== null) {
						temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
					} else {
						temp = {
							add: {},
							del: {}
						};
					}
					modules['subredditManager'].RESPro = temp;
				}
				if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
					modules['subredditManager'].RESPro.add = {};
				}
				if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
					modules['subredditManager'].RESPro.del = {};
				}
				// add modules['subredditManager'] new subreddit next time we sync...
				modules['subredditManager'].RESPro.add[subreddit] = true;
				// delete the old one
				modules['subredditManager'].RESPro.del[oldsubreddit] = true;
				// make sure we don't run an add on the old subreddit next time we sync...
				if (typeof modules['subredditManager'].RESPro.add[oldsubreddit] !== 'undefined') delete modules['subredditManager'].RESPro.add[oldsubreddit];
				// make sure we don't run a delete on the new subreddit next time we sync...
				if (typeof modules['subredditManager'].RESPro.del[subreddit] !== 'undefined') delete modules['subredditManager'].RESPro.del[subreddit];
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}
			modules['subredditManager'].mySubredditShortcuts[idx] = {
				subreddit: subreddit,
				displayName: displayName,
				addedDate: Date.now()
			};

			modules['subredditManager'].saveLatestShortcuts();

			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}
		}

		modules['subredditManager'].redrawShortcuts();
		modules['subredditManager'].populateSubredditDropdown();
	},
	followSubredditShortcut: function() {
		if (BrowserDetect.isFirefox()) {
			// stupid firefox... sigh...
			location.href = location.protocol + '//' + location.hostname + modules['subredditManager'].clickedShortcut;
		} else {
			location.href = modules['subredditManager'].clickedShortcut;
		}
	},
	subredditDragStart: function(e) {
		clearTimeout(modules['subredditManager'].clickTimer);
		// Target (this) element is the source node.
		this.style.opacity = '0.4';
		modules['subredditManager'].shortCutsTrash.style.display = 'block';
		modules['subredditManager'].dragSrcEl = this;

		e.dataTransfer.effectAllowed = 'move';
		// because Safari is stupid, we have to do this.
		modules['subredditManager'].srDataTransfer = this.getAttribute('orderIndex') + ',' + $(this).data('subreddit');
	},
	subredditDragEnter: function(e) {
		this.classList.add('srOver');
		return false;
	},
	subredditDragOver: function(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}

		// See the section on the DataTransfer object.
		e.dataTransfer.dropEffect = 'move';
		return false;
	},
	subredditDragLeave: function(e) {
		this.classList.remove('srOver');
		return false;
	},
	subredditDrop: function(e) {
		// this/e.target is current target element.
		if (e.stopPropagation) {
			e.stopPropagation(); // Stops some browsers from redirecting.
		}

		// Stops other browsers from redirecting.
		e.preventDefault();

		modules['subredditManager'].shortCutsTrash.style.display = 'none';
		// Don't do anything if dropping the same column we're dragging.
		if (modules['subredditManager'].dragSrcEl !== this) {
			var theData, srcOrderIndex, srcSubreddit;
			if (e.target.getAttribute('id') !== 'RESShortcutsTrash') {
				// get the order index of the src and destination to swap...
				// var theData = e.dataTransfer.getData('text/html').split(',');
				theData = modules['subredditManager'].srDataTransfer.split(',');
				srcOrderIndex = parseInt(theData[0], 10);
				srcSubreddit = modules['subredditManager'].mySubredditShortcuts[srcOrderIndex];
				var destOrderIndex = parseInt(this.getAttribute('orderIndex'), 10);
				var destSubreddit = modules['subredditManager'].mySubredditShortcuts[destOrderIndex];
				var rearranged = [];
				var rearrangedI = 0;

				modules['subredditManager'].mySubredditShortcuts.forEach(function(shortcut, i) {
					if ((i !== srcOrderIndex) && (i !== destOrderIndex)) {
						rearranged[rearrangedI] = shortcut;
						rearrangedI++;
					} else if (i === destOrderIndex) {
						if (destOrderIndex > srcOrderIndex) {
							// if dragging right, order dest first, src next.
							rearranged[rearrangedI] = destSubreddit;
							rearrangedI++;
							rearranged[rearrangedI] = srcSubreddit;
							rearrangedI++;
						} else {
							// if dragging left, order src first, dest next.
							rearranged[rearrangedI] = srcSubreddit;
							rearrangedI++;
							rearranged[rearrangedI] = destSubreddit;
							rearrangedI++;
						}
					}
				});

				// save the updated order...
				modules['subredditManager'].mySubredditShortcuts = rearranged;
				modules['subredditManager'].saveLatestShortcuts();
				// redraw the shortcut bar...
				modules['subredditManager'].redrawShortcuts();
				this.classList.remove('srOver');
			} else {
				theData = modules['subredditManager'].srDataTransfer.split(',');
				srcOrderIndex = parseInt(theData[0], 10);
				srcSubreddit = theData[1];
				modules['subredditManager'].removeSubredditShortcut(srcSubreddit);
			}
		}
		return false;
	},
	subredditDragEnd: function(e) {
		modules['subredditManager'].shortCutsTrash.style.display = 'none';
		this.style.opacity = '1';
		return false;
	},
	redrawSubredditBar: function() {
		this.headerContents = document.querySelector('#sr-header-area');
		if (this.headerContents) {
			// for opera, because it renders progressively and makes it look "glitchy", hide the header bar, then show it all at once with CSS.
			// if (BrowserDetect.isOpera()) this.headerContents.style.display = 'none';
			// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
			$(this.headerContents).html('');

			this.srLeftContainer = RESUtils.createElement('div', 'srLeftContainer');
			this.srLeftContainer.setAttribute('class', 'sr-bar');

			this.srDropdown = RESUtils.createElement('div', 'srDropdown');
			this.srDropdownContainer = RESUtils.createElement('div', 'srDropdownContainer');
			$(this.srDropdownContainer).html('<a href="javascript:void 0">My Subreddits</a>');
			this.srDropdownContainer.addEventListener('click', modules['subredditManager'].toggleSubredditDropdown, false);
			this.srDropdown.appendChild(this.srDropdownContainer);

			this.srList = RESUtils.createElement('table', 'srList');
			var maxHeight = $(window).height() - 40;
			$(this.srList).css('max-height', maxHeight + 'px');
			// this.srDropdownContainer.appendChild(this.srList);
			document.body.appendChild(this.srList);

			this.srLeftContainer.appendChild(this.srDropdown);
			var sep = document.createElement('span');
			sep.setAttribute('class', 'srSep');
			sep.textContent = '|';
			this.srLeftContainer.appendChild(sep);

			// now put in the shortcuts...
			this.staticShortCutsContainer = document.createElement('div');
			this.staticShortCutsContainer.setAttribute('id', 'RESStaticShortcuts');
			/* this probably isn't the best way to give the option, since the mechanic is drag/drop for other stuff..  but it's much easier for now... */
			$(this.staticShortCutsContainer).html('');
			var specialButtonSelected = {};
			var subLower = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : 'home';
			specialButtonSelected[subLower] = 'RESShortcutsCurrentSub';

			var shortCutsHTML = '';

			if (this.options.linkDashboard.value) shortCutsHTML += '<span class="separator">-</span><a id="RESDashboardLink" class="subbarlink ' + specialButtonSelected['dashboard'] + '" href="/r/Dashboard/">Dashboard</a>';
			if (this.options.linkFront.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['home'] + '" href="/">Front</a>';
			if (this.options.linkAll.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['all'] + '" href="/r/all/">All</a>';
			if (this.options.linkRandom.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/random/">Random</a>';
			if (this.options.linkMyRandom.value && this.myRandomEnabled) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + (this.myRandomGold ? 'gold' : '') + '" href="/r/myrandom/">MyRandom</a>';
			if (this.options.linkRandNSFW.value) shortCutsHTML += '<span class="separator over18">-</span><a class="subbarlink over18" href="/r/randnsfw/">RandNSFW</a>';

			if (RESUtils.loggedInUser()) {
				if (this.options.linkFriends.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['friends'] + '" href="/r/friends/">Friends</a>';

				if (RESUtils.isModeratorAnywhere()) {
					if (this.options.linkMod.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['mod'] + '" href="/r/mod/">Mod</a>';
					if (this.options.linkModqueue.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/mod/about/modqueue">Modqueue</a>';
				}
			}
			if (this.options.buttonEdit.value) shortCutsHTML += '<span class="separator">-</span>' + modules['settingsNavigation'].makeUrlHashLink('subredditManager', '', 'edit', 'subbarlink');

			$(this.staticShortCutsContainer).append(shortCutsHTML);

			this.srLeftContainer.appendChild(this.staticShortCutsContainer);
			this.srLeftContainer.appendChild(sep);
			this.headerContents.appendChild(this.srLeftContainer);

			this.shortCutsViewport = document.createElement('div');
			this.shortCutsViewport.setAttribute('id', 'RESShortcutsViewport');
			this.headerContents.appendChild(this.shortCutsViewport);

			this.shortCutsContainer = document.createElement('div');
			this.shortCutsContainer.setAttribute('id', 'RESShortcuts');
			this.shortCutsContainer.setAttribute('class', 'sr-bar');
			this.shortCutsViewport.appendChild(this.shortCutsContainer);

			this.shortCutsEditContainer = document.createElement('div');
			this.shortCutsEditContainer.setAttribute('id', 'RESShortcutsEditContainer');
			this.headerContents.appendChild(this.shortCutsEditContainer);

			// Add shortcut sorting arrow
			this.sortShortcutsButton = document.createElement('div');
			this.sortShortcutsButton.setAttribute('id', 'RESShortcutsSort');
			this.sortShortcutsButton.setAttribute('title', 'sort subreddit shortcuts');
			this.sortShortcutsButton.innerHTML = '&uarr;&darr;';
			this.sortShortcutsButton.addEventListener('click', modules['subredditManager'].showSortMenu, false);
			this.shortCutsEditContainer.appendChild(this.sortShortcutsButton);

			// add right scroll arrow...
			this.shortCutsRight = document.createElement('div');
			this.shortCutsRight.setAttribute('id', 'RESShortcutsRight');
			this.shortCutsRight.textContent = '>';
			this.shortCutsRight.addEventListener('click', function(e) {
				modules['subredditManager'].containerWidth = modules['subredditManager'].shortCutsContainer.offsetWidth;
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px', ''), 10);

				if (isNaN(marginLeft)) marginLeft = 0;

				var shiftWidth = $('#RESShortcutsViewport').width() - 80;
				if (modules['subredditManager'].containerWidth > (shiftWidth)) {
					marginLeft -= shiftWidth;
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsRight);

			// add an "add shortcut" button...
			this.shortCutsAdd = RESUtils.createElement('div', 'RESShortcutsAdd', 'res-icon');
			this.shortCutsAdd.innerHTML = '&#xF139;';
			this.shortCutsAdd.title = 'add shortcut';
			this.shortCutsAddFormContainer = document.createElement('div');
			this.shortCutsAddFormContainer.setAttribute('id', 'RESShortcutsAddFormContainer');
			this.shortCutsAddFormContainer.style.display = 'none';
			var thisForm = ' \
				<form id="shortCutsAddForm"> \
					<div>Add shortcut or multi-reddit (i.e. foo+bar+baz):</div> \
					<label for="newShortcut">Subreddit:</label> <input type="text" id="newShortcut"><br> \
					<label for="displayName">Display Name:</label> <input type="text" id="displayName"><br> \
					<input type="submit" name="submit" value="add" id="addSubreddit"> \
					<div style="clear: both; float: right; margin-top: 5px;"><a style="font-size: 9px;" href="/subreddits/">Edit frontpage subscriptions</a></div> \
				</form> \
			';
			$(this.shortCutsAddFormContainer).html(thisForm);
			this.shortCutsAddFormField = this.shortCutsAddFormContainer.querySelector('#newShortcut');
			this.shortCutsAddFormFieldDisplayName = this.shortCutsAddFormContainer.querySelector('#displayName');

			modules['subredditManager'].shortCutsAddFormField.addEventListener('keyup', function(e) {
				if (e.keyCode === 27) {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
					modules['subredditManager'].shortCutsAddFormField.blur();
				}
			}, false);

			modules['subredditManager'].shortCutsAddFormFieldDisplayName.addEventListener('keyup', function(e) {
				if (e.keyCode === 27) {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
					modules['subredditManager'].shortCutsAddFormFieldDisplayName.blur();
				}
			}, false);

			// add the "add shortcut" form...
			this.shortCutsAddForm = this.shortCutsAddFormContainer.querySelector('#shortCutsAddForm');
			this.shortCutsAddForm.addEventListener('submit', function(e) {
				e.preventDefault();
				var subreddit = modules['subredditManager'].shortCutsAddFormField.value;
				var displayname = modules['subredditManager'].shortCutsAddFormFieldDisplayName.value;
				if (displayname === '') displayname = subreddit;

				var r_match_regex = /^(\/r\/|r\/)(.*)/i;
				if (r_match_regex.test(subreddit)) {
					subreddit = subreddit.match(r_match_regex)[2];
				}

				modules['subredditManager'].shortCutsAddFormField.value = '';
				modules['subredditManager'].shortCutsAddFormFieldDisplayName.value = '';
				modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';

				if (subreddit) {
					modules['subredditManager'].addSubredditShortcut(subreddit, displayname);
				}
			}, false);
			this.shortCutsAdd.addEventListener('click', function(e) {
				if (modules['subredditManager'].shortCutsAddFormContainer.style.display === 'none') {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'block';
					modules['subredditManager'].shortCutsAddFormField.focus();
				} else {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
					modules['subredditManager'].shortCutsAddFormField.blur();
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsAdd);
			document.body.appendChild(this.shortCutsAddFormContainer);

			// add the "trash bin"...
			this.shortCutsTrash = RESUtils.createElement('div', 'RESShortcutsTrash', 'res-icon');
			this.shortCutsTrash.innerHTML = '&#xF056;';
			this.shortCutsTrash.addEventListener('dragenter', modules['subredditManager'].subredditDragEnter, false);
			this.shortCutsTrash.addEventListener('dragleave', modules['subredditManager'].subredditDragLeave, false);
			this.shortCutsTrash.addEventListener('dragover', modules['subredditManager'].subredditDragOver, false);
			this.shortCutsTrash.addEventListener('drop', modules['subredditManager'].subredditDrop, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsTrash);

			// add left scroll arrow...
			this.shortCutsLeft = document.createElement('div');
			this.shortCutsLeft.setAttribute('id', 'RESShortcutsLeft');
			this.shortCutsLeft.textContent = '<';
			this.shortCutsLeft.addEventListener('click', function(e) {
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px', ''), 10);

				if (isNaN(marginLeft)) marginLeft = 0;

				var shiftWidth = $('#RESShortcutsViewport').width() - 80;
				marginLeft += shiftWidth;
				if (marginLeft <= 0) {
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsLeft);

			this.redrawShortcuts();
		}
	},
	showSortMenu: function() {
		// Add shortcut sorting menu if it doesn't exist in the DOM yet...
		if (!modules['subredditManager'].sortMenu) {
			modules['subredditManager'].sortMenu =
				$('<div id="sort-menu" class="drop-choices">' +
					'<p>&nbsp;sort by:</p>' +
					'<a class="choice" data-field="displayName" href="javascript:void 0">display name</a>' +
					'<a class="choice" data-field="addedDate" href="javascript:void 0">added date</a>' +
					'</div>');

			$(modules['subredditManager'].sortMenu).find('a').click(modules['subredditManager'].sortShortcuts);

			$(document.body).append(modules['subredditManager'].sortMenu);
		}
		var menu = modules['subredditManager'].sortMenu;
		if ($(menu).is(':visible')) {
			$(menu).hide();
			return;
		}
		var thisXY = $(modules['subredditManager'].sortShortcutsButton).offset();
		thisXY.left = thisXY.left - $(menu).width() + $(modules['subredditManager'].sortShortcutsButton).width();
		var thisHeight = $(modules['subredditManager'].sortShortcutsButton).height();

		$(menu).css({
			top: thisXY.top + thisHeight,
			left: thisXY.left
		}).show();
	},
	hideSortMenu: function() {
		var menu = modules['subredditManager'].sortMenu;
		$(menu).hide();
	},
	sortShortcuts: function(e) {
		modules['subredditManager'].hideSortMenu();

		var sortingField = $(this).data('field');
		var asc = !modules['subredditManager'].currentSort;
		// toggle sort method...
		modules['subredditManager'].currentSort = !modules['subredditManager'].currentSort;
		// Make sure we have a valid list of shortucts
		if (!modules['subredditManager'].mySubredditShortcuts) {
			modules['subredditManager'].getLatestShortcuts();
		}

		modules['subredditManager'].mySubredditShortcuts.sort(function(a, b) {
			// var sortingField = field; // modules['subredditManager'].options.sortingField.value;
			// var asc = order === 'asc'; // (modules['subredditManager'].options.sortingDirection.value === 'asc');
			var aField = a[sortingField];
			var bField = b[sortingField];
			if (typeof aField === 'string' && typeof bField === 'string') {
				aField = aField.toLowerCase();
				bField = bField.toLowerCase();
			}

			if (aField === bField) {
				return 0;
			} else if (aField > bField) {
				return (asc) ? 1 : -1;
			} else {
				return (asc) ? -1 : 1;
			}
		});

		// Save shortcuts sort order
		modules['subredditManager'].saveLatestShortcuts();

		// Refresh shortcuts
		modules['subredditManager'].redrawShortcuts();
	},
	toggleSubredditDropdown: function(e) {
		e.stopPropagation();
		if (modules['subredditManager'].srList.style.display === 'block') {
			modules['subredditManager'].srList.style.display = 'none';
			document.body.removeEventListener('click', modules['subredditManager'].toggleSubredditDropdown, false);
		} else {
			if (RESUtils.loggedInUser()) {
				$(modules['subredditManager'].srList).html('<tr><td width="360">Loading subreddits (may take a moment)...<div id="subredditPagesLoaded"></div></td></tr>');
				if (!modules['subredditManager'].subredditPagesLoaded) {
					modules['subredditManager'].subredditPagesLoaded = modules['subredditManager'].srList.querySelector('#subredditPagesLoaded');
				}
				modules['subredditManager'].srList.style.display = 'block';
				modules['subredditManager'].getSubreddits();
			} else {
				$(modules['subredditManager'].srList).html('<tr><td width="360">You must be logged in to load your own list of subreddits. <a style="display: inline; float: left;" href="/subreddits/">browse them all</a></td></tr>');
				modules['subredditManager'].srList.style.display = 'block';
			}
			modules['subredditManager'].srList.addEventListener('click', modules['subredditManager'].stopDropDownPropagation, false);
			document.body.addEventListener('click', modules['subredditManager'].toggleSubredditDropdown, false);
		}
	},
	stopDropDownPropagation: function(e) {
		e.stopPropagation();
	},
	mySubreddits: [],
	mySubredditShortcuts: [],
	getSubredditJSON: function(after) {
		var jsonURL = location.protocol + '//' + location.hostname + '/subreddits/mine/.json?app=res';
		if (after) jsonURL += '&after=' + after;
		RESEnvironment.ajax({
			method: 'GET',
			url: jsonURL,
			onload: function(response) {
				var thisResponse = JSON.parse(response.responseText);
				if ((typeof thisResponse.data !== 'undefined') && (typeof thisResponse.data.children !== 'undefined')) {
					if (modules['subredditManager'].subredditPagesLoaded.innerHTML === '') {
						modules['subredditManager'].subredditPagesLoaded.textContent = 'Pages loaded: 1';
					} else {
						var pages = modules['subredditManager'].subredditPagesLoaded.innerHTML.match(/:\ ([\d]+)/);
						modules['subredditManager'].subredditPagesLoaded.textContent = 'Pages loaded: ' + (parseInt(pages[1], 10) + 1);
					}

					var now = Date.now();
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser(), now);

					var subreddits = thisResponse.data.children;
					for (var i = 0, len = subreddits.length; i < len; i++) {
						var srObj = {
							display_name: subreddits[i].data.display_name,
							url: subreddits[i].data.url,
							over18: subreddits[i].data.over18,
							id: subreddits[i].data.id,
							created: subreddits[i].data.created,
							description: subreddits[i].data.description
						};
						modules['subredditManager'].mySubreddits.push(srObj);
					}

					if (thisResponse.data.after) {
						modules['subredditManager'].getSubredditJSON(thisResponse.data.after);
					} else {
						modules['subredditManager'].mySubreddits.sort(function(a, b) {
							var adisp = a.display_name.toLowerCase();
							var bdisp = b.display_name.toLowerCase();
							if (adisp > bdisp) return 1;
							if (adisp === bdisp) return 0;
							return -1;
						});

						// Remove duplicate subreddits
						(function() {
							var id = {};
							modules['subredditManager'].mySubreddits = modules['subredditManager'].mySubreddits.filter(function(sr) {
								if (id[sr.id]) return false;
								id[sr.id] = true;
								return true;
							});
						})();

						RESStorage.setItem('RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].mySubreddits));
						this.gettingSubreddits = false;
						modules['subredditManager'].populateSubredditDropdown();
					}
				} else {
					// User is probably not logged in.. no subreddits found.
					modules['subredditManager'].populateSubredditDropdown(null, true);
				}
			}
		});

	},
	getSubreddits: function() {
		modules['subredditManager'].mySubreddits = [];
		var lastCheck = parseInt(RESStorage.getItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser()), 10) || 0;
		var now = Date.now();
		var check = RESStorage.getItem('RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser());

		// 86400000 = 1 day
		if (((now - lastCheck) > 86400000) || !check || (check.length === 0)) {
			if (!this.gettingSubreddits) {
				this.gettingSubreddits = true;
				this.getSubredditJSON();
			}
		} else {
			modules['subredditManager'].mySubreddits = safeJSON.parse(check, 'RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser());
			this.populateSubredditDropdown();
		}
	},
	// if badJSON is true, then getSubredditJSON ran into an error...
	populateSubredditDropdown: function(sortBy, badJSON) {
		modules['subredditManager'].sortBy = sortBy || 'subreddit';
		$(modules['subredditManager'].srList).html('');
		// NOTE WE NEED TO CHECK LAST TIME THEY UPDATED THEIR SUBREDDIT LIST AND REPOPULATE...

		var tableHead = document.createElement('thead');
		var tableRow = document.createElement('tr');

		modules['subredditManager'].srHeader = document.createElement('td');
		modules['subredditManager'].srHeader.addEventListener('click', function() {
			if (modules['subredditManager'].sortBy === 'subreddit') {
				modules['subredditManager'].populateSubredditDropdown('subredditDesc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('subreddit');
			}
		}, false);
		modules['subredditManager'].srHeader.textContent = 'subreddit';
		modules['subredditManager'].srHeader.setAttribute('width', '200');

		modules['subredditManager'].lvHeader = document.createElement('td');
		modules['subredditManager'].lvHeader.addEventListener('click', function() {
			if (modules['subredditManager'].sortBy === 'lastVisited') {
				modules['subredditManager'].populateSubredditDropdown('lastVisitedAsc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('lastVisited');
			}
		}, false);
		modules['subredditManager'].lvHeader.textContent = 'Last Visited';
		modules['subredditManager'].lvHeader.setAttribute('width', '120');

		var scHeader = document.createElement('td');
		$(scHeader).width(50);
		$(scHeader).html('<a style="float: right;" href="/subreddits/">View all &raquo;</a>');
		tableRow.appendChild(modules['subredditManager'].srHeader);
		tableRow.appendChild(modules['subredditManager'].lvHeader);
		tableRow.appendChild(scHeader);
		tableHead.appendChild(tableRow);
		modules['subredditManager'].srList.appendChild(tableHead);

		var theBody = document.createElement('tbody');
		if (!badJSON) {
			var subredditCount = modules['subredditManager'].mySubreddits.length;

			if (typeof this.subredditsLastViewed === 'undefined') {
				var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
				if (check) {
					this.subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
				} else {
					this.subredditsLastViewed = {};
				}
			}

			// copy modules['subredditManager'].mySubreddits to a placeholder array so we can sort without modifying it...
			var sortableSubreddits = modules['subredditManager'].mySubreddits;
			if (sortBy === 'lastVisited') {
				$(modules['subredditManager'].lvHeader).html('Last Visited <div class="sortAsc"></div>');
				modules['subredditManager'].srHeader.textContent = 'subreddit';

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					var alv = (typeof modules['subredditManager'].subredditsLastViewed[adisp] === 'undefined') ? 0 : parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited, 10);
					var blv = (typeof modules['subredditManager'].subredditsLastViewed[bdisp] === 'undefined') ? 0 : parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited, 10);

					if (alv < blv) return 1;
					if (alv === blv) {
						if (adisp > bdisp) return 1;
						return -1;
					}
					return -1;
				});
			} else if (sortBy === 'lastVisitedAsc') {
				$(modules['subredditManager'].lvHeader).html('Last Visited <div class="sortDesc"></div>');
				modules['subredditManager'].srHeader.textContent = 'subreddit';

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					var alv = (typeof modules['subredditManager'].subredditsLastViewed[adisp] === 'undefined') ? 0 : parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited, 10);
					var blv = (typeof modules['subredditManager'].subredditsLastViewed[bdisp] === 'undefined') ? 0 : parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited, 10);

					if (alv > blv) return 1;
					if (alv === blv) {
						if (adisp > bdisp) return 1;
						return -1;
					}
					return -1;
				});
			} else if (sortBy === 'subredditDesc') {
				modules['subredditManager'].lvHeader.textContent = 'Last Visited';
				$(modules['subredditManager'].srHeader).html('subreddit <div class="sortDesc"></div>');

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					if (adisp < bdisp) return 1;
					if (adisp === bdisp) return 0;
					return -1;
				});
			} else {
				modules['subredditManager'].lvHeader.textContent = 'Last Visited';
				$(modules['subredditManager'].srHeader).html('subreddit <div class="sortAsc"></div>');

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					if (adisp > bdisp) return 1;
					if (adisp === bdisp) return 0;
					return -1;
				});
			}
			for (var i = 0; i < subredditCount; i++) {
				var dateString = 'Never';
				var thisReddit = sortableSubreddits[i].display_name.toLowerCase();
				if (typeof this.subredditsLastViewed[thisReddit] !== 'undefined') {
					var ts = parseInt(this.subredditsLastViewed[thisReddit].last_visited, 10);
					var dateVisited = new Date(ts);
					dateString = RESUtils.niceDate(dateVisited);
				}

				var theRow = document.createElement('tr');
				var theSR = document.createElement('td');
				$(theSR).html('<a href="' + escapeHTML(modules['subredditManager'].mySubreddits[i].url) + '">' + escapeHTML(modules['subredditManager'].mySubreddits[i].display_name) + '</a>');
				theRow.appendChild(theSR);

				var theLV = document.createElement('td');
				theLV.textContent = dateString;
				theLV.setAttribute('class', 'RESvisited');
				theRow.appendChild(theLV);

				var theSC = document.createElement('td');
				theSC.setAttribute('class', 'RESshortcut');
				theSC.setAttribute('data-subreddit', modules['subredditManager'].mySubreddits[i].display_name);

				var idx = modules['subredditManager'].mySubredditShortcuts.findIndex(function(shortcut) {
					return shortcut.subreddit === shortcut.display_name;
				});

				if (idx !== -1) {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}

						var subreddit = $(e.target).data('subreddit');
						modules['subredditManager'].removeSubredditShortcut(subreddit);
					}, false);

					theSC.textContent = '-shortcut';
				} else {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}

						var subreddit = $(e.target).data('subreddit');
						modules['subredditManager'].addSubredditShortcut(subreddit);
					}, false);

					theSC.textContent = '+shortcut';
				}

				theRow.appendChild(theSC);
				theBody.appendChild(theRow);
			}
		} else {
			var errorTD = document.createElement('td');
			errorTD.textContent = 'There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com';
			errorTD.setAttribute('colspan', '3');

			var errorRow = document.createElement('tr');
			errorRow.appendChild(errorTD);
			theBody.appendChild(errorRow);
		}

		modules['subredditManager'].srList.appendChild(theBody);
	},
	toggleSubredditShortcut: function(e) {
		e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...

		var isShortcut = modules['subredditManager'].mySubredditShortcuts.some(function(shortcut) {
			return shortcut.subreddit.toLowerCase() === $(this).data('subreddit').toLowerCase();
		}, this);

		if (isShortcut) {
			modules['subredditManager'].removeSubredditShortcut($(this).data('subreddit'));
			$(this)
				.attr('title', 'Add this subreddit to your shortcut bar')
				.text('+shortcut')
				.removeClass('remove');
		} else {
			modules['subredditManager'].addSubredditShortcut($(this).data('subreddit'));
			$(this)
				.attr('title', 'Remove this subreddit from your shortcut bar')
				.text('-shortcut')
				.addClass('remove');
		}

		modules['subredditManager'].redrawShortcuts();
	},
	getShortcutsStorageKey: function() {
		var username = modules['subredditManager'].options.shortcutsPerAccount.value ? RESUtils.loggedInUser() : null;
		var key = 'RESmodules.subredditManager.subredditShortcuts.' + username;
		return key;
	},
	getLatestShortcuts: function() {
		// re-retreive the latest data to ensure we're not losing info between tab changes...
		var key = modules['subredditManager'].getShortcutsStorageKey();
		var shortCuts = RESStorage.getItem(key);
		if (!shortCuts) {
			shortCuts = '[]';
		}

		this.mySubredditShortcuts = safeJSON.parse(shortCuts, key);
		this.parseDates();
	},
	// JSON specification doesn't specify what to do with dates - so unstringify here
	parseDates: function() {
		for (var i = 0, len = this.mySubredditShortcuts.length; i < len; i++) {
			this.mySubredditShortcuts[i].addedDate = this.mySubredditShortcuts[i].addedDate ? new Date(this.mySubredditShortcuts[i].addedDate) : new Date(0);
		}
	},
	saveLatestShortcuts: function() {
		// Retreive the latest data to ensure we're not losing info
		if (!modules['subredditManager'].mySubredditShortcuts) {
			modules['subredditManager'].mySubredditShortcuts = [];
		}

		var key = modules['subredditManager'].getShortcutsStorageKey();
		RESStorage.setItem(key, JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
	},
	addSubredditShortcut: function(subreddit, displayname) {
		modules['subredditManager'].getLatestShortcuts();

		var idx = modules['subredditManager'].mySubredditShortcuts.findIndex(function(shortcut) {
			return shortcut.subreddit.toLowerCase() === subreddit.toLowerCase();
		});

		if (idx !== -1) {
			alert('Whoops, you already have a shortcut for that subreddit');
		} else {
			displayname = displayname || subreddit;
			var subredditObj = {
				subreddit: subreddit,
				displayName: displayname.toLowerCase(),
				addedDate: Date.now()
			};

			modules['subredditManager'].mySubredditShortcuts.push(subredditObj);
			if (RESUtils.proEnabled()) {
				if (typeof modules['subredditManager'].RESPro === 'undefined') {
					var temp;
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser())) {
						temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
					} else {
						temp = {
							add: {},
							del: {}
						};
					}

					modules['subredditManager'].RESPro = temp;
				}

				if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
					modules['subredditManager'].RESPro.add = {};
				}

				if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
					modules['subredditManager'].RESPro.del = {};
				}

				// add this subreddit next time we sync...
				modules['subredditManager'].RESPro.add[subreddit] = true;

				// make sure we don't run a delete on this subreddit next time we sync...
				if (typeof modules['subredditManager'].RESPro.del[subreddit] !== 'undefined') delete modules['subredditManager'].RESPro.del[subreddit];

				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}

			modules['subredditManager'].saveLatestShortcuts();
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();

			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}

			modules['notifications'].showNotification({
				moduleID: 'subredditManager',
				message: 'Subreddit shortcut added. You can edit by double clicking, or trash by dragging to the trash can.'
			});
		}
	},
	removeSubredditShortcut: function(subreddit) {
		this.getLatestShortcuts();

		var idx = modules['subredditManager'].mySubredditShortcuts.findIndex(function(shortcut) {
			return shortcut.subreddit.toLowerCase() === subreddit.toLowerCase();
		});

		if (idx !== -1) {
			modules['subredditManager'].mySubredditShortcuts.splice(idx, 1);

			if (RESUtils.proEnabled()) {
				if (typeof modules['subredditManager'].RESPro === 'undefined') {
					var temp;
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser())) {
						temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
					} else {
						temp = {
							add: {},
							del: {}
						};
					}

					modules['subredditManager'].RESPro = temp;
				}
				if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
					modules['subredditManager'].RESPro.add = {};
				}
				if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
					modules['subredditManager'].RESPro.del = {};
				}

				// delete this subreddit next time we sync...
				modules['subredditManager'].RESPro.del[subreddit] = true;

				// make sure we don't run an add on this subreddit
				if (typeof modules['subredditManager'].RESPro.add[subreddit] !== 'undefined') delete modules['subredditManager'].RESPro.add[subreddit];

				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}

			modules['subredditManager'].saveLatestShortcuts();
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();

			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}
		}
	},
	setLastViewtime: function() {
		var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());

		if (!check) {
			this.subredditsLastViewed = {};
		} else {
			this.subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
		}

		var now = Date.now();
		var thisReddit = RESUtils.currentSubreddit().toLowerCase();
		this.subredditsLastViewed[thisReddit] = {
			last_visited: now
		};

		RESStorage.setItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser(), JSON.stringify(this.subredditsLastViewed));
	},
	subscribeToSubreddit: function(subredditName, subscribe) {
		// subredditName should look like t5_123asd
		subscribe = subscribe !== false; // default to true
		var userHash = RESUtils.loggedInUserHash();

		var formData = new FormData();
		formData.append('sr', subredditName);
		formData.append('action', subscribe ? 'sub' : 'unsub');
		formData.append('uh', userHash);

		RESEnvironment.ajax({
			method: 'POST',
			url: location.protocol + '//' + location.hostname + '/api/subscribe?app=res',
			data: formData
		});
	},
	lastUpdate: function() {
		var mySubredditList = $('.drop-choices.srdrop a').map(function(){return this.textContent;}).toArray().join();
		var mySubredditListCachedObject = RESStorage.getItem('RESmodules.subredditManager.mySubredditList');
		if (mySubredditListCachedObject) {
			mySubredditListCachedObject = JSON.parse(mySubredditListCachedObject); // contain last saved subreddit list + time for each user
		} else {
			mySubredditListCachedObject = {};
		}
		var mySubredditListCached = mySubredditListCachedObject[RESUtils.loggedInUser()], // last saved subreddit lsit + time for current user
			lastUpdate;
		if (mySubredditListCached && mySubredditListCached.list === mySubredditList) {
			lastUpdate = parseInt((new Date().getTime() - mySubredditListCached.time)/60000, 10);
			if (lastUpdate > 31) {
				lastUpdate = false; // the user have probably less than 50/100 subscription, this module doesn't concern him
				mySubredditListCached.time = new Date().getTime()-32*60000; // we change time to avoid deleting it just after (to don't show him again the last update)
			} else {
				lastUpdate += lastUpdate > 1 ? ' minutes ago' : ' minute ago';
			}
		} else { // the mySubreddit list is different than the cached version, subreddit have reloaded them. We reset the cache. (Or there is no cached version)
			mySubredditListCachedObject[RESUtils.loggedInUser()] = {
				list: mySubredditList,
				time: new Date().getTime()
			};
			lastUpdate = 'just now';
		}
		if (lastUpdate !== false && mySubredditListCached !== null) { // Show only if there is cached version and the user have enough subscription
			$('.listing-chooser a:first .description').after('<br /><span class="description"><b>last update:</b><br />' + lastUpdate + '</span>');
		}
		// we now remove inactive user
		var inactiveThreshold = new Date().getTime() - 2592000000; // one month
		for (var user in mySubredditListCachedObject) {
			if (mySubredditListCachedObject[user].time < inactiveThreshold) {
				delete mySubredditListCachedObject[user];
			}
		}
		RESStorage.setItem('RESmodules.subredditManager.mySubredditList', JSON.stringify(mySubredditListCachedObject));
	}
});
