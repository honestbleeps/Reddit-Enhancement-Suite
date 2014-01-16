modules['subredditManager'] = {
	moduleID: 'subredditManager',
	moduleName: 'Subreddit Manager',
	category: 'UI',
	options: {
		subredditShortcut: {
			type: 'boolean',
			value: true,
			description: 'Add +shortcut button in subreddit sidebar for easy addition of shortcuts.'
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
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/.*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.srOver { outline: 1px dashed black; }');
			RESUtils.addCSS('body { overflow-x: hidden; }');
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
			RESUtils.addCSS('#editShortcutDialog { display: none; z-index: 999; position: absolute; top: 25px; left: 5px; width: 230px; padding: 10px; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px; font-size: 12px; color: #000; }');
			RESUtils.addCSS('#editShortcutDialog h3 { display: inline-block; float: left; font-size: 13px; margin-top: 6px; }');
			RESUtils.addCSS('#editShortcutClose { float: right; margin-top: 2px; margin-right: 0; }');
			RESUtils.addCSS('#editShortcutDialog label { clear: both; float: left; width: 100px; margin-top: 12px; }');
			RESUtils.addCSS('#editShortcutDialog input { float: left; width: 126px; margin-top: 10px; }');
			RESUtils.addCSS('#editShortcutDialog input[type=button] { float: right; width: 45px; margin-left: 10px; cursor: pointer; padding: 3px 5px; font-size: 12px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; }');
			RESUtils.addCSS('#srLeftContainer { z-index: 4; padding-left: 4px; margin-right: 6px; }'); // RESUtils.addCSS('#RESShortcuts { position: absolute; left: '+ this.srLeftContainerWidth+'px;  z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; margin-top: -2px; padding-top: 2px; }');
			RESUtils.addCSS('#srLeftContainer { z-index: 4; padding-left: 4px; margin-right: 6px; }');
			RESUtils.addCSS('#RESShortcutsViewport { width: auto; max-height: 20px; overflow: hidden; } ');
			RESUtils.addCSS('#RESShortcuts { z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown { display: none; position: absolute; z-index: 99999; padding: 3px; background-color: #F0F0F0; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown li { padding-left: 3px; padding-right: 3px; margin-bottom: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown li:hover { background-color: #F0F0FC; }');

			RESUtils.addCSS('#RESShortcutsEditContainer { width: 69px; position: absolute; right: 0; top: 0; z-index: 999; background-color: #f0f0f0; height: 16px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('#RESShortcutsRight { right: 0; }');
			RESUtils.addCSS('#RESShortcutsAdd { right: 15px; }');
			RESUtils.addCSS('#RESShortcutsLeft { right: 31px; }');
			RESUtils.addCSS('#RESShortcutsSort { right: 47px; }');

			RESUtils.addCSS('#RESShortcutsSort, #RESShortcutsRight, #RESShortcutsLeft, #RESShortcutsAdd, #RESShortcutsTrash {  width: 16px; cursor: pointer; background: #F0F0F0; font-size: 20px; color: #369; height: 18px; line-height: 15px; position: absolute; top: 0; z-index: 999; background-color: #f0f0f0; user-select: none; -webkit-user-select: none; -moz-user-select: none;  } ');
			RESUtils.addCSS('#RESShortcutsSort { font-size: 14px; }')
			RESUtils.addCSS('#RESShortcutsTrash { display: none; font-size: 17px; width: 16px; cursor: pointer; right: 15px; height: 16px; position: absolute; top: 0; z-index: 1000; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.srSep { margin-left: 6px; }');
			RESUtils.addCSS('.RESshortcutside { margin-right: 5px; margin-top: 2px; color: white; background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444; padding: 1px 6px; border-radius: 3px 3px 3px 3px; }');
			RESUtils.addCSS('.RESshortcutside.remove { background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-remove.png) }');
			RESUtils.addCSS('.RESshortcutside:hover { background-color: #f0f0ff; }');
			// RESUtils.addCSS('h1.redditname > a { float: left; }');
			RESUtils.addCSS('h1.redditname { overflow: auto; }');
			RESUtils.addCSS('.sortAsc, .sortDesc { float: right; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 12px; height: 12px; background-repeat: no-repeat; }');
			RESUtils.addCSS('.sortAsc { background-position: 0 -149px; }');
			RESUtils.addCSS('.sortDesc { background-position: -12px -149px; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer { display: none; position: absolute; width: 290px; padding: 2px; right: 0; top: 21px; z-index: 10000; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px; font-size: 12px; color: #000; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer  a { font-weight: bold; }');
			RESUtils.addCSS('#newShortcut { width: 130px; }');
			RESUtils.addCSS('#displayName { width: 130px; }');
			RESUtils.addCSS('#shortCutsAddForm { padding: 5px; }');
			RESUtils.addCSS('#shortCutsAddForm div { font-size: 10px; margin-bottom: 10px; }');
			RESUtils.addCSS('#shortCutsAddForm label { display: inline-block; width: 100px; }');
			RESUtils.addCSS('#shortCutsAddForm input[type=text] { width: 170px; margin-bottom: 6px; }');
			RESUtils.addCSS('#addSubreddit { float: right; cursor: pointer; padding: 3px 5px; font-size: 12px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; }');
			RESUtils.addCSS('.RESShortcutsCurrentSub { color:orangered!important; font-weight:bold; }');
			RESUtils.addCSS('.RESShortcutsCurrentSub:visited { color:orangered!important; font-weight:bold; }');
			RESUtils.addCSS('#srLeftContainer, #RESShortcutsViewport, #RESShortcutsEditContainer{max-height:18px;}');

			// this shows the sr-header-area that we hid while rendering it (to curb opera's glitchy "jumping")...
			if (BrowserDetect.isOpera()) {
				RESUtils.addCSS('#sr-header-area { display: block !important; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if (this.options.linkMyRandom.value) {
				var originalMyRandom = document.querySelector('#sr-header-area a[href$="/r/myrandom/"]')
				if (originalMyRandom) {
					this.myRandomEnabled = true;
					if (originalMyRandom.classList.contains('gold')) {
						this.myRandomGold = true;
					}
				}
			}

			this.manageSubreddits();
			if (RESUtils.currentSubreddit() !== null) {
				this.setLastViewtime();
			}
		}
	},
	manageSubreddits: function() {
		// This is the init function for Manage Subreddits - it'll get your preferences and redraw the top bar.
		this.redrawSubredditBar();
		// Listen for subscriptions / unsubscriptions from reddits so we know to reload the JSON string...
		// also, add a +/- shortcut button...
		if ((RESUtils.currentSubreddit()) && (this.options.subredditShortcut.value == true)) {
			var subButtons = document.querySelectorAll('.fancy-toggle-button');
			// for (var h=0, len=currentSubreddits.length; h<len; h++) {
			for (var h = 0, len = subButtons.length; h < len; h++) {
				var subButton = subButtons[h];
				if ((RESUtils.currentSubreddit().indexOf('+') === -1) && (RESUtils.currentSubreddit() !== 'mod')) {
					var thisSubredditFragment = RESUtils.currentSubreddit();
					var isMulti = false;
				} else if ($(subButton).parent().hasClass('subButtons')) {
					var isMulti = true;
					var thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
				} else {
					var isMulti = true;
					var thisSubredditFragment = $(subButton).next().text();
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
				theSC.setAttribute('style', 'display: inline-block !important;');
				theSC.setAttribute('class', 'RESshortcut RESshortcutside');
				theSC.setAttribute('data-subreddit', thisSubredditFragment);
				var idx = -1;
				for (var i = 0, sublen = modules['subredditManager'].mySubredditShortcuts.length; i < sublen; i++) {
					if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() === thisSubredditFragment.toLowerCase()) {
						idx = i;
						break;
					}
				}
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
			}
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
					.css({
						display: 'inline-block',
						'margin-right': '0'
					})
					.addClass('RESshortcut RESshortcutside')
					.data('subreddit', subreddit),
				isShortcut = false;

			for (var j = 0, shortcutsLength = modules['subredditManager'].mySubredditShortcuts.length; j < shortcutsLength; j++) {
				if (modules['subredditManager'].mySubredditShortcuts[j].subreddit === subreddit) {
					isShortcut = true;
					break;
				}
			}

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
			for (var i = 0, len = this.mySubredditShortcuts.length; i < len; i++) {
				if (typeof this.mySubredditShortcuts[i] === 'string') {
					this.mySubredditShortcuts[i] = {
						subreddit: this.mySubredditShortcuts[i],
						displayName: this.mySubredditShortcuts[i],
						addedDate: Date.now()
					}
				}

				var thisShortCut = document.createElement('a');
				thisShortCut.setAttribute('draggable', 'true');
				thisShortCut.setAttribute('orderIndex', i);
				thisShortCut.setAttribute('data-subreddit', this.mySubredditShortcuts[i].subreddit);
				thisShortCut.classList.add('subbarlink');

				if ((RESUtils.currentSubreddit() !== null) && (RESUtils.currentSubreddit().toLowerCase() === this.mySubredditShortcuts[i].subreddit.toLowerCase())) {
					thisShortCut.classList.add('RESShortcutsCurrentSub');
				}

				thisShortCut.setAttribute('href', '/r/' + this.mySubredditShortcuts[i].subreddit);
				thisShortCut.textContent = this.mySubredditShortcuts[i].displayName;
				thisShortCut.addEventListener('click', function(e) {
					if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey) {
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
					modules['subredditManager'].editSubredditShortcut(e.target);
				}, false);

				thisShortCut.addEventListener('mouseover', function(e) {
					clearTimeout(modules['subredditManager'].hideSubredditGroupDropdownTimer);
					if ((typeof e.target.getAttribute !== 'undefined') && (e.target.getAttribute('href').indexOf('+') !== -1)) {
						var subreddits = e.target.getAttribute('href').replace('/r/', '').split('+');
						modules['subredditManager'].showSubredditGroupDropdown(subreddits, e.target);
					}
				}, false);

				thisShortCut.addEventListener('mouseout', function(e) {
					modules['subredditManager'].hideSubredditGroupDropdownTimer = setTimeout(function() {
						modules['subredditManager'].hideSubredditGroupDropdown();
					}, 500);
				}, false);

				thisShortCut.addEventListener('dragstart', modules['subredditManager'].subredditDragStart, false);
				thisShortCut.addEventListener('dragenter', modules['subredditManager'].subredditDragEnter, false)
				thisShortCut.addEventListener('dragover', modules['subredditManager'].subredditDragOver, false);
				thisShortCut.addEventListener('dragleave', modules['subredditManager'].subredditDragLeave, false);
				thisShortCut.addEventListener('drop', modules['subredditManager'].subredditDrop, false);
				thisShortCut.addEventListener('dragend', modules['subredditManager'].subredditDragEnd, false);
				this.shortCutsContainer.appendChild(thisShortCut);

				if (i < len - 1) {
					var sep = document.createElement('span');
					sep.setAttribute('class', 'separator');
					sep.textContent = '-';
					this.shortCutsContainer.appendChild(sep);
				}
			}
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
	showSubredditGroupDropdown: function(subreddits, obj) {
		if (typeof this.subredditGroupDropdown === 'undefined') {
			this.subredditGroupDropdown = RESUtils.createElementWithID('div', 'RESSubredditGroupDropdown');
			this.subredditGroupDropdownUL = document.createElement('ul');
			this.subredditGroupDropdown.appendChild(this.subredditGroupDropdownUL);
			document.body.appendChild(this.subredditGroupDropdown);

			this.subredditGroupDropdown.addEventListener('mouseout', function(e) {
				modules['subredditManager'].hideSubredditGroupDropdownTimer = setTimeout(function() {
					modules['subredditManager'].hideSubredditGroupDropdown();
				}, 500);
			}, false);

			this.subredditGroupDropdown.addEventListener('mouseover', function(e) {
				clearTimeout(modules['subredditManager'].hideSubredditGroupDropdownTimer);
			}, false);
		}
		this.groupDropdownVisible = true;

		if (subreddits) {
			$(this.subredditGroupDropdownUL).html('');

			for (var i = 0, len = subreddits.length; i < len; i++) {
				var thisLI = $('<li><a href="/r/' + subreddits[i] + '">' + subreddits[i] + '</a></li>');
				$(this.subredditGroupDropdownUL).append(thisLI);
			}

			var thisXY = RESUtils.getXYpos(obj);
			this.subredditGroupDropdown.style.top = (thisXY.y + 16) + 'px';
			// if fixed, override y to just be the height of the subreddit bar...
			// this.subredditGroupDropdown.style.position = 'fixed';
			// this.subredditGroupDropdown.style.top = '20px';
			this.subredditGroupDropdown.style.left = thisXY.x + 'px';
			this.subredditGroupDropdown.style.display = 'block';

			modules['styleTweaks'].setSRStyleToggleVisibility(false, "subredditGroupDropdown");
		}
	},
	hideSubredditGroupDropdown: function() {
		delete modules['subredditManager'].hideSubredditGroupDropdownTimer;
		if (this.subredditGroupDropdown) {
			this.subredditGroupDropdown.style.display = 'none';
			modules['styleTweaks'].setSRStyleToggleVisibility(true, "subredditGroupDropdown")
		}
	},
	editSubredditShortcut: function(ele) {
		var subreddit = ele.getAttribute('href').slice(3);

		var idx;
		for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == subreddit) {
				idx = i;
				break;
			}
		}

		if (typeof this.editShortcutDialog === 'undefined') {
			this.editShortcutDialog = RESUtils.createElementWithID('div', 'editShortcutDialog');
			document.body.appendChild(this.editShortcutDialog);
		}

		var thisForm = '<form name="editSubredditShortcut"> \
		                    <h3>Edit Shortcut</h3> \
		                    <div id="editShortcutClose" class="RESCloseButton">&times;</div> \
		                    <label for="subreddit">Subreddit:</label> \
		                    <input type="text" name="subreddit" value="' + subreddit + '" id="shortcut-subreddit"> \
		                    <br> \
		                    <label for="displayName">Display Name:</label> \
		                    <input type="text" name="displayName" value="' + ele.textContent + '" id="shortcut-displayname"> \
		                    <input type="hidden" name="idx" value="' + idx + '"> \
		                    <input type="button" name="shortcut-save" value="save" id="shortcut-save"> \
						</form>';
		$(this.editShortcutDialog).html(thisForm);

		this.subredditInput = this.editShortcutDialog.querySelector('input[name=subreddit]');
		this.displayNameInput = this.editShortcutDialog.querySelector('input[name=displayName]');

		this.subredditForm = this.editShortcutDialog.querySelector('FORM');
		this.subredditForm.addEventListener('submit', function(e) {
			e.preventDefault();
		}, false);

		this.saveButton = this.editShortcutDialog.querySelector('input[name=shortcut-save]');
		this.saveButton.addEventListener('click', function(e) {
			var idx = modules['subredditManager'].editShortcutDialog.querySelector('input[name=idx]').value;
			var subreddit = modules['subredditManager'].editShortcutDialog.querySelector('input[name=subreddit]').value;
			var displayName = modules['subredditManager'].editShortcutDialog.querySelector('input[name=displayName]').value;

			if ((subreddit === '') || (displayName === '')) {
				// modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
				subreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
				modules['subredditManager'].removeSubredditShortcut(subreddit);
			} else {
				if (RESUtils.proEnabled()) {
					// store a delete for the old subreddit, and an add for the new.
					var oldsubreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
					if (typeof modules['subredditManager'].RESPro === 'undefined') {
						if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()) !== null) {
							var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
						} else {
							var temp = {
								add: {},
								del: {}
							};
						}
						modules['subredditManager'].RESPro = temp;
					}
					if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
						modules['subredditManager'].RESPro.add = {}
					}
					if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
						modules['subredditManager'].RESPro.del = {}
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
				}

				modules['subredditManager'].saveLatestShortcuts();

				if (RESUtils.proEnabled()) {
					modules['RESPro'].saveModuleData('subredditManager');
				}
			}

			modules['subredditManager'].editShortcutDialog.style.display = 'none';
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();
		}, false);

		// handle enter and escape keys in the dialog box...
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
		var thisLeft = Math.min(RESUtils.mouseX, window.innerWidth - 300);
		this.editShortcutDialog.style.left = thisLeft + 'px';

		setTimeout(function() {
			modules['subredditManager'].subredditInput.focus()
		}, 200);
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
			if (e.target.getAttribute('id') !== 'RESShortcutsTrash') {
				// get the order index of the src and destination to swap...
				// var theData = e.dataTransfer.getData('text/html').split(',');
				var theData = modules['subredditManager'].srDataTransfer.split(',');
				var srcOrderIndex = parseInt(theData[0], 10);
				var srcSubreddit = modules['subredditManager'].mySubredditShortcuts[srcOrderIndex];
				var destOrderIndex = parseInt(this.getAttribute('orderIndex'), 10);
				var destSubreddit = modules['subredditManager'].mySubredditShortcuts[destOrderIndex];
				var rearranged = [];
				var rearrangedI = 0;

				for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
					if ((i !== srcOrderIndex) && (i !== destOrderIndex)) {
						rearranged[rearrangedI] = modules['subredditManager'].mySubredditShortcuts[i];
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
				}

				// save the updated order...
				modules['subredditManager'].mySubredditShortcuts = rearranged;
				modules['subredditManager'].saveLatestShortcuts();
				// redraw the shortcut bar...
				modules['subredditManager'].redrawShortcuts();
				this.classList.remove('srOver');
			} else {
				var theData = modules['subredditManager'].srDataTransfer.split(',');
				var srcOrderIndex = parseInt(theData[0], 10);
				var srcSubreddit = theData[1];
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

			this.srLeftContainer = RESUtils.createElementWithID('div', 'srLeftContainer');
			this.srLeftContainer.setAttribute('class', 'sr-bar');

			this.srDropdown = RESUtils.createElementWithID('div', 'srDropdown');
			this.srDropdownContainer = RESUtils.createElementWithID('div', 'srDropdownContainer');
			$(this.srDropdownContainer).html('<a href="javascript:void(0)">My Subreddits</a>');
			this.srDropdownContainer.addEventListener('click', modules['subredditManager'].toggleSubredditDropdown, false);
			this.srDropdown.appendChild(this.srDropdownContainer);

			this.srList = RESUtils.createElementWithID('table', 'srList');
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

			if (this.options.linkDashboard.value) shortCutsHTML += '<span class="separator">-</span><a id="RESDashboardLink" class="subbarlink ' + specialButtonSelected['dashboard'] + '" href="/r/Dashboard/">DASHBOARD</a>';
			if (this.options.linkFront.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['home'] + '" href="/">FRONT</a>';
			if (this.options.linkAll.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['all'] + '" href="/r/all/">ALL</a>';
			if (this.options.linkRandom.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/random/">RANDOM</a>';
			if (this.options.linkMyRandom.value && this.myRandomEnabled) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + (this.myRandomGold ? 'gold' : '') + '" href="/r/myrandom/">MYRANDOM</a>';
			if (this.options.linkRandNSFW.value) shortCutsHTML += '<span class="separator over18">-</span><a class="subbarlink over18" href="/r/randnsfw/">RANDNSFW</a>';

			if (RESUtils.loggedInUser()) {
				if (this.options.linkFriends.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['friends'] + '" href="/r/friends/">FRIENDS</a>';

				var modmail = document.getElementById('modmail');
				if (modmail) {
					if (this.options.linkMod.value) shortCutsHTML += '<span class="separator">-</span><a class=" ' + specialButtonSelected['mod'] + '" href="/r/mod/">MOD</a>';
					if (this.options.linkModqueue.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/mod/about/modqueue">MODQUEUE</a>';
				}
			}
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
			this.shortCutsAdd = document.createElement('div');
			this.shortCutsAdd.setAttribute('id', 'RESShortcutsAdd');
			this.shortCutsAdd.textContent = '+';
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
			this.shortCutsTrash = document.createElement('div');
			this.shortCutsTrash.setAttribute('id', 'RESShortcutsTrash');
			this.shortCutsTrash.textContent = '×';
			this.shortCutsTrash.addEventListener('dragenter', modules['subredditManager'].subredditDragEnter, false)
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
					'<a class="choice" data-field="displayName" href="javascript:void(0);">display name</a>' +
					'<a class="choice" data-field="addedDate" href="javascript:void(0);">added date</a>' +
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

		modules['subredditManager'].mySubredditShortcuts = modules['subredditManager'].mySubredditShortcuts.sort(function(a, b) {
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
		GM_xmlhttpRequest({
			method: "GET",
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
						}
						modules['subredditManager'].mySubreddits.push(srObj);
					}

					if (thisResponse.data.after) {
						modules['subredditManager'].getSubredditJSON(thisResponse.data.after);
					} else {
						modules['subredditManager'].mySubreddits.sort(function(a, b) {
							var adisp = a.display_name.toLowerCase();
							var bdisp = b.display_name.toLowerCase();
							if (adisp > bdisp) return 1;
							if (adisp == bdisp) return 0;
							return -1;
						});

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

		var theHead = document.createElement('thead');
		var theRow = document.createElement('tr');

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
		theRow.appendChild(modules['subredditManager'].srHeader);
		theRow.appendChild(modules['subredditManager'].lvHeader);
		theRow.appendChild(scHeader);
		theHead.appendChild(theRow);
		modules['subredditManager'].srList.appendChild(theHead);

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

					(typeof modules['subredditManager'].subredditsLastViewed[adisp] === 'undefined') ? alv = 0 : alv = parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited, 10);
					(typeof modules['subredditManager'].subredditsLastViewed[bdisp] === 'undefined') ? blv = 0 : blv = parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited, 10);

					if (alv < blv) return 1;
					if (alv == blv) {
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

					(typeof modules['subredditManager'].subredditsLastViewed[adisp] === 'undefined') ? alv = 0 : alv = parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited, 10);
					(typeof modules['subredditManager'].subredditsLastViewed[bdisp] === 'undefined') ? blv = 0 : blv = parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited, 10);

					if (alv > blv) return 1;
					if (alv == blv) {
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
					if (adisp == bdisp) return 0;
					return -1;
				});
			} else {
				modules['subredditManager'].lvHeader.textContent = 'Last Visited';
				$(modules['subredditManager'].srHeader).html('subreddit <div class="sortAsc"></div>');

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					if (adisp > bdisp) return 1;
					if (adisp == bdisp) return 0;
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

				var idx = -1;
				for (var j = 0, len = modules['subredditManager'].mySubredditShortcuts.length; j < len; j++) {
					if (modules['subredditManager'].mySubredditShortcuts[j].subreddit === modules['subredditManager'].mySubreddits[i].display_name) {
						idx = j;
						break;
					}
				}

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
			var theTD = document.createElement('td');
			theTD.textContent = 'There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com';
			theTD.setAttribute('colspan', '3');

			var theRow = document.createElement('tr');
			theRow.appendChild(theTD);
			theBody.appendChild(theRow);
		}

		modules['subredditManager'].srList.appendChild(theBody);
	},
	toggleSubredditShortcut: function(e) {
		e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...

		var isShortcut = false;
		for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() === $(this).data('subreddit').toLowerCase()) {
				isShortcut = true;
				break;
			}
		}

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
	getLatestShortcuts: function() {
		// re-retreive the latest data to ensure we're not losing info between tab changes...
		var shortCuts = RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.' + RESUtils.loggedInUser());
		if (!shortCuts) {
			shortCuts = '[]';
		}

		this.mySubredditShortcuts = safeJSON.parse(shortCuts, 'RESmodules.subredditManager.subredditShortcuts.' + RESUtils.loggedInUser());
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

		RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
	},
	addSubredditShortcut: function(subreddit, displayname) {
		modules['subredditManager'].getLatestShortcuts();

		var idx = -1;
		for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() === subreddit.toLowerCase()) {
				idx = i;
				break;
			}
		}

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
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser())) {
						var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
					} else {
						var temp = {
							add: {},
							del: {}
						};
					}

					modules['subredditManager'].RESPro = temp;
				}

				if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
					modules['subredditManager'].RESPro.add = {}
				}

				if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
					modules['subredditManager'].RESPro.del = {}
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

		var idx = -1;
		for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() === subreddit.toLowerCase()) {
				idx = i;
				break;
			}
		}

		if (idx !== -1) {
			modules['subredditManager'].mySubredditShortcuts.splice(idx, 1);

			if (RESUtils.proEnabled()) {
				if (typeof modules['subredditManager'].RESPro === 'undefined') {
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser())) {
						var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
					} else {
						var temp = {
							add: {},
							del: {}
						};
					}

					modules['subredditManager'].RESPro = temp;
				}
				if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
					modules['subredditManager'].RESPro.add = {}
				}
				if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
					modules['subredditManager'].RESPro.del = {}
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

		GM_xmlhttpRequest({
			method: "POST",
			url: location.protocol + "//" + location.hostname + "/api/subscribe?app=res",
			data: formData
		});

	}

};