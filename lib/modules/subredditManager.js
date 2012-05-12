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
	},
	description: 'Allows you to customize the top bar with your own subreddit shortcuts, including dropdown menus of multi-reddits and more.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/.*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.srOver { outline: 1px dashed black; }');
			RESUtils.addCSS('body { overflow-x: hidden; }');
			RESUtils.addCSS('#sr-header-area a { font-size: 100% !important; }');
			RESUtils.addCSS('#srList { position: absolute; top: 18px; left: 0px; z-index: 9999; display: none; border: 1px solid black; background-color: #FAFAFA; max-height: 92%; width: auto; overflow-y: auto; }');
			RESUtils.addCSS('#srList tr { border-bottom: 1px solid gray; }');
			RESUtils.addCSS('#srList thead td { cursor: pointer; }');
			RESUtils.addCSS('#srList td { padding-left: 8px; padding-right: 8px; padding-top: 3px; padding-bottom: 3px; }');
			RESUtils.addCSS('#srList td.RESvisited, #srList td.RESshortcut { text-transform: none; }');
			RESUtils.addCSS('#srList td.RESshortcut {cursor: pointer;}');
			RESUtils.addCSS('#srList td a { width: 100%; display: block; }');
			RESUtils.addCSS('#srList tr:hover { background-color: #eeeeff; }');
			RESUtils.addCSS('#srLeftContainer, #RESStaticShortcuts, #RESShortcuts, #srDropdown { display: inline; float: left; position: relative; z-index: 5; }');
			RESUtils.addCSS('#editShortcutDialog { display: none; z-index: 999; position: absolute; top: 25px; left: 5px; width: 230px; padding: 10px; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; font-size: 12px; color: #000000; }');
			RESUtils.addCSS('#editShortcutDialog h3 { display: inline-block; float: left; font-size: 13px; margin-top: 6px; }');
			RESUtils.addCSS('#editShortcutClose { float: right; margin-top: 2px; margin-right: 0px; }');
			RESUtils.addCSS('#editShortcutDialog label { clear: both; float: left; width: 100px; margin-top: 12px; }');
			RESUtils.addCSS('#editShortcutDialog input { float: left; width: 126px; margin-top: 10px; }');
			RESUtils.addCSS('#editShortcutDialog input[type=button] { float: right; width: 45px; margin-left: 10px; cursor: pointer; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; }');
			if ((typeof(chrome) != 'undefined') || (typeof(safari) != 'undefined')) {
				RESUtils.addCSS('#srLeftContainer { margin-right: 14px; }');
			} else {
				RESUtils.addCSS('#srLeftContainer { margin-right: 6px; }');
			}
			RESUtils.addCSS('#srLeftContainer { z-index: 4; padding-left: 4px; }');
			
			// RESUtils.addCSS('#RESShortcuts { position: absolute; left: '+ this.srLeftContainerWidth+'px;  z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; margin-top: -2px; padding-top: 2px; }');
			RESUtils.addCSS('#RESShortcutsViewport { width: auto; max-height: 20px; overflow: hidden; } ');
			RESUtils.addCSS('#RESShortcuts { z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown { display: none; position: absolute; z-index: 99999; padding: 3px; background-color: #F0F0F0; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown li { padding-left: 3px; padding-right: 3px; margin-bottom: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown li:hover { background-color: #F0F0FC; }');

			RESUtils.addCSS('#RESShortcutsEditContainer { width: 52px; position: absolute; right: 0px; top: 0px; z-index: 999; background-color: #f0f0f0; height: 16px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('#RESShortcutsRight { right: 0px; }');
			RESUtils.addCSS('#RESShortcutsAdd { right: 15px; }');
			RESUtils.addCSS('#RESShortcutsLeft { right: 31px; }');
			RESUtils.addCSS('#RESShortcutsRight, #RESShortcutsLeft, #RESShortcutsAdd, #RESShortcutsTrash {  width: 16px; cursor: pointer; background: #F0F0F0; font-size: 20px; color: #369; height: 18px; line-height: 15px; position: absolute; top: 0px; z-index: 999; background-color: #f0f0f0; user-select: none; -webkit-user-select: none; -moz-user-select: none;  } ');
			RESUtils.addCSS('#RESShortcutsTrash { display: none; font-size: 17px; width: 16px; cursor: pointer; right: 15px; height: 16px; position: absolute; top: 0px; z-index: 1000; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.srSep { margin-left: 6px; }');
			RESUtils.addCSS('.RESshortcutside { margin-right: 5px; margin-top: 2px; color: white; background-image: url(/static/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444444; padding: 1px 6px; border-radius: 3px 3px 3px 3px; }');
			RESUtils.addCSS('.RESshortcutside.remove { background-image: url(/static/bg-button-remove.png) }');
			RESUtils.addCSS('.RESshortcutside:hover { background-color: #f0f0ff; }');
			// RESUtils.addCSS('h1.redditname > a { float: left; }');
			RESUtils.addCSS('h1.redditname { overflow: auto; }');
			RESUtils.addCSS('.sortAsc, .sortDesc { float: right; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 12px; height: 12px; background-repeat: no-repeat; }');
			RESUtils.addCSS('.sortAsc { background-position: 0px -149px; }');
			RESUtils.addCSS('.sortDesc { background-position: -12px -149px; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer { display: none; position: absolute; width: 290px; padding: 2px; right: 0px; top: 21px; z-index: 10000; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; font-size: 12px; color: #000000; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer  a { font-weight: bold; }');
			RESUtils.addCSS('#newShortcut { width: 130px; }');
			RESUtils.addCSS('#displayName { width: 130px; }');
			RESUtils.addCSS('#shortCutsAddForm { padding: 5px; }');
			RESUtils.addCSS('#shortCutsAddForm div { font-size: 10px; margin-bottom: 10px; }');
			RESUtils.addCSS('#shortCutsAddForm label { display: inline-block; width: 100px; }');
			RESUtils.addCSS('#shortCutsAddForm input[type=text] { width: 170px; margin-bottom: 6px; }');
			RESUtils.addCSS('#addSubreddit { float: right; cursor: pointer; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; }');
			RESUtils.addCSS('.RESShortcutsCurrentSub { color:orangered!important; font-weight:bold; }');
			RESUtils.addCSS('.RESShortcutsCurrentSub:visited { color:orangered!important; font-weight:bold; }');
			RESUtils.addCSS('#srLeftContainer, #RESShortcutsViewport, #RESShortcutsEditContainer{max-height:18px;}');
			
			// this shows the sr-header-area that we hid while rendering it (to curb opera's glitchy "jumping")...
			if (typeof(opera) != 'undefined') {
				RESUtils.addCSS('#sr-header-area { display: block !important; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.manageSubreddits();
			if (RESUtils.currentSubreddit() != null) {
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
			for (var h=0, len=subButtons.length; h<len; h++) {
				var subButton = subButtons[h];
				if ((RESUtils.currentSubreddit().indexOf('+') == -1) && (RESUtils.currentSubreddit() != 'mod')) {
					var thisSubredditFragment = RESUtils.currentSubreddit();
					var isMulti = false;
				} else if ($(subButton).parent().hasClass('subButtons')) {
					var isMulti = true;
					var thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
				} else {
					var isMulti = true;
					var thisSubredditFragment = $(subButton).next().text();
				}
				if (! ($('#subButtons-'+thisSubredditFragment).length>0)) {
					var subButtonsWrapper = $('<div id="subButtons-'+thisSubredditFragment+'" class="subButtons" style="margin: 0 !important;"></div>');
					$(subButton).wrap(subButtonsWrapper);
					// move this wrapper to the end (after any icons that may exist...)
					if (isMulti) {
						var theWrap = $(subButton).parent();
						$(theWrap).appendTo($(theWrap).parent());
					}
				}
				subButton.addEventListener('click',function() {
					// reset the last checked time for the subreddit list so that we refresh it anew no matter what.
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.'+RESUtils.loggedInUser(),0);
				},false);
				var theSC = document.createElement('span');
				theSC.setAttribute('style','display: inline-block !important;');
				theSC.setAttribute('class','RESshortcut RESshortcutside');
				theSC.setAttribute('subreddit',thisSubredditFragment);
				var idx = -1;
				for (var i=0, sublen=modules['subredditManager'].mySubredditShortcuts.length; i<sublen; i++) {
					if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == thisSubredditFragment) {
						idx=i;
						break;
					}
				}
				if (idx != -1) {
					theSC.innerHTML = '-shortcut';
					theSC.setAttribute('title','Remove this subreddit from your shortcut bar');
					addClass(theSC,'remove');
				} else {
					theSC.innerHTML = '+shortcut';
					theSC.setAttribute('title','Add this subreddit to your shortcut bar');
				}
				theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);
				// subButton.parentNode.insertBefore(theSC, subButton);
				// theSubredditLink.appendChild(theSC);
				$('#subButtons-'+thisSubredditFragment).append(theSC);
				var next = $('#subButtons-'+thisSubredditFragment).next();
				if ($(next).hasClass('title') && (! $('#subButtons-'+thisSubredditFragment).hasClass('swapped'))) {
					$('#subButtons-'+thisSubredditFragment).before($(next));
					$('#subButtons-'+thisSubredditFragment).addClass('swapped');
				}
			}
		}
		// If we're on the reddit-browsing page (/reddits), add +shortcut and -shortcut buttons...
		if (location.href.match(/https?:\/\/www.reddit.com\/reddits\/?(\?[\w=&]+)*/)) {
			this.browsingReddits();
		}
	},
	browsingReddits: function() {
		var subredditLinks = document.body.querySelectorAll('p.titlerow > a');
		if (subredditLinks) {
			for (var i=0, len=subredditLinks.length; i<len; i++) {
				if (typeof(subredditLinks[i]) == 'undefined') break;
				var match = subredditLinks[i].getAttribute('href').match(/https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w]+).*/i);
				if (match != null) {
					var theSC = document.createElement('span');
					theSC.setAttribute('class','RESshortcut RESshortcutside');
					theSC.setAttribute('subreddit',match[1]);
					var idx = -1;
					for (var j=0, len=modules['subredditManager'].mySubredditShortcuts.length; j<len; j++) {
						if (modules['subredditManager'].mySubredditShortcuts[j].subreddit == RESUtils.currentSubreddit()) {
							idx=j;
							break;
						}
					}
					if (idx != -1) {
						theSC.innerHTML = '-shortcut';
						theSC.setAttribute('title','Remove this subreddit from your shortcut bar');
					} else {
						theSC.innerHTML = '+shortcut';
						theSC.setAttribute('title','Add this subreddit to your shortcut bar');
					}
					theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);
					// subButton.parentNode.insertBefore(theSC, subButton);
					subredditLinks[i].parentNode.parentNode.previousSibling.appendChild(theSC);
				} else {
					// uh oh...
				}
			}
		}
	},
	redrawShortcuts: function() {
		this.shortCutsContainer.innerHTML = '';
		var shortCuts = RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser());
		if (shortCuts == null) {
			shortCuts = RESStorage.getItem('RESmodules.betteReddit.subredditShortcuts.'+RESUtils.loggedInUser());
			// if we used to have these settings in betteReddit, clean them up.
			if (shortCuts != null) {
				var betteRedditOptions = JSON.parse(RESStorage.getItem('RESoptions.betteReddit'));
				delete betteRedditOptions.manageSubreddits;
				delete betteRedditOptions.linkDashboard;
				delete betteRedditOptions.linkAll;
				delete betteRedditOptions.linkFriends;
				delete betteRedditOptions.linkMod;
				delete betteRedditOptions.linkRandom;
				delete betteRedditOptions.linkHome;
				RESStorage.setItem('RESoptions.betteReddit', JSON.stringify(betteRedditOptions));
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(), shortCuts);
				RESStorage.removeItem('RESmodules.betteReddit.subredditShortcuts.'+RESUtils.loggedInUser());
				RESUtils.notification({
					header: 'RES Notification', 
					message: 'Subreddit Manager is now a separate module (removed from betteReddit) to avoid confusion. If you dislike this feature, you may disable the module in the RES console' 
				});
			}
		}
		if ((shortCuts != null) && (shortCuts != '') && (shortCuts != [])) {
			this.mySubredditShortcuts = safeJSON.parse(shortCuts, 'RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser())
			// go through the list of shortcuts and print them out...
			for (var i=0, len=this.mySubredditShortcuts.length; i<len; i++) {
				if (typeof(this.mySubredditShortcuts[i]) == 'string') {
					this.mySubredditShortcuts[i] = {
						subreddit: this.mySubredditShortcuts[i],
						displayName: this.mySubredditShortcuts[i]
					}
				} 
				var thisShortCut = document.createElement('a');
				thisShortCut.setAttribute('draggable','true');
				thisShortCut.setAttribute('orderIndex',i);
				addClass(thisShortCut, 'subbarlink');
				if ((RESUtils.currentSubreddit() != null) && (RESUtils.currentSubreddit().toLowerCase() == this.mySubredditShortcuts[i].subreddit.toLowerCase())) {
					addClass(thisShortCut, 'RESShortcutsCurrentSub');
				}
				thisShortCut.setAttribute('href','/r/'+this.mySubredditShortcuts[i].subreddit);
				thisShortCut.innerHTML = this.mySubredditShortcuts[i].displayName;
				thisShortCut.addEventListener('click', function(e) {
					if (e.button != 0 || e.ctrlKey || e.metaKey || e.altKey) {
						// open in new tab, let the browser handle it
						return true;
					} else {
						e.preventDefault();
						// use to open links in new tabs... work on this later...
						modules['subredditManager'].clickedShortcut = e.target.getAttribute('href');
						if (typeof(modules['subredditManager'].clickTimer) == 'undefined') {
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
					if ((typeof(e.target.getAttribute) != 'undefined') && (e.target.getAttribute('href').indexOf('+') != -1)) {
						var subreddits = e.target.getAttribute('href').replace('/r/','').split('+');
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
				if (i < len-1) {
					var sep = document.createElement('span');
					sep.setAttribute('class','separator');
					sep.innerHTML = '-';
					this.shortCutsContainer.appendChild(sep);
				} 
			}
			if (this.mySubredditShortcuts.length == 0) {
				this.shortCutsContainer.style.textTransform = 'none';
				this.shortCutsContainer.innerHTML = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			} else {
				this.shortCutsContainer.style.textTransform = '';
			}
		} else {
			this.shortCutsContainer.style.textTransform = 'none';
			this.shortCutsContainer.innerHTML = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			this.mySubredditShortcuts = [];
		}
		// clip the width of the container to the remaining area...
		// this.shortCutsContainer.style.width = parseInt(window.innerWidth - this.srLeftContainerWidth - 40) + 'px';
	},
	showSubredditGroupDropdown: function(subreddits, obj) {
		if (typeof(this.subredditGroupDropdown) == 'undefined') {
			this.subredditGroupDropdown = createElementWithID('div','RESSubredditGroupDropdown');
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
			this.subredditGroupDropdownUL.innerHTML = '';
			for (var i=0, len=subreddits.length; i<len; i++) {
				this.subredditGroupDropdownUL.innerHTML += '<li><a href="/r/'+subreddits[i]+'">'+subreddits[i]+'</a></li>';
			}
			var thisXY = RESUtils.getXYpos(obj);
			this.subredditGroupDropdown.style.top = (thisXY.y + 16) + 'px';
			// if fixed, override y to just be the height of the subreddit bar...
			// this.subredditGroupDropdown.style.position = 'fixed';
			// this.subredditGroupDropdown.style.top = '20px';
			this.subredditGroupDropdown.style.left = thisXY.x + 'px';
			this.subredditGroupDropdown.style.display = 'block';
		}
	},
	hideSubredditGroupDropdown: function() {
		delete modules['subredditManager'].hideSubredditGroupDropdownTimer;
		if (this.subredditGroupDropdown) this.subredditGroupDropdown.style.display = 'none';
	},
	editSubredditShortcut: function(ele) {
		var subreddit = ele.getAttribute('href').slice(3);
		var idx;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == subreddit) {
				idx = i;
				break;
			}
		}
		if (typeof(this.editShortcutDialog) == 'undefined') {
			this.editShortcutDialog = createElementWithID('div','editShortcutDialog');
			document.body.appendChild(this.editShortcutDialog);
		}
		this.editShortcutDialog.innerHTML = '<form name="editSubredditShortcut"><h3>Edit Shortcut</h3><div id="editShortcutClose" class="RESCloseButton">X</div><label for="subreddit">Subreddit:</label> <input type="text" name="subreddit" value="'+subreddit+'" id="shortcut-subreddit"><br>';
		this.editShortcutDialog.innerHTML += '<label for="displayName">Display Name:</label><input type="text" name="displayName" value="'+ele.innerHTML+'" id="shortcut-displayname">';
		this.editShortcutDialog.innerHTML += '<input type="hidden" name="idx" value="'+idx+'"><input type="button" name="shortcut-save" value="save" id="shortcut-save"></form>';
		
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
			if ((subreddit == '') || (displayName == '')) {
				// modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
				subreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
				modules['subredditManager'].removeSubredditShortcut(subreddit);
			} else {
				if (RESUtils.proEnabled()) {
					// store a delete for the old subreddit, and an add for the new.
					var oldsubreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
					if (typeof(modules['subredditManager'].RESPro) == 'undefined') {
						if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()) != null) {
							var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser());
						} else {
							var temp = { add: {}, del: {} };
						}
						modules['subredditManager'].RESPro = temp;
					}
					if (typeof(modules['subredditManager'].RESPro.add) == 'undefined') {
						modules['subredditManager'].RESPro.add = {}
					}
					if (typeof(modules['subredditManager'].RESPro.del) == 'undefined') {
						modules['subredditManager'].RESPro.del = {}
					}
					// add modules['subredditManager'] new subreddit next time we sync...
					modules['subredditManager'].RESPro.add[subreddit] = true;
					// delete the old one
					modules['subredditManager'].RESPro.del[oldsubreddit] = true;
					// make sure we don't run an add on the old subreddit next time we sync...
					if (typeof(modules['subredditManager'].RESPro.add[oldsubreddit]) != 'undefined') delete modules['subredditManager'].RESPro.add[oldsubreddit];
					// make sure we don't run a delete on the new subreddit next time we sync...
					if (typeof(modules['subredditManager'].RESPro.del[subreddit]) != 'undefined') delete modules['subredditManager'].RESPro.del[subreddit];
					RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
				}
				modules['subredditManager'].mySubredditShortcuts[idx] = {
					subreddit: subreddit,
					displayName: displayName
				}
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(),JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
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
			if (e.keyCode == 27) {
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
				modules['subredditManager'].editShortcutDialog.blur();
			} else if (e.keyCode == 13) {
				RESUtils.click(modules['subredditManager'].saveButton);
			}
		}, false);
		this.displayNameInput.addEventListener('keyup', function(e) {
			if (e.keyCode == 27) {
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
				modules['subredditManager'].editShortcutDialog.blur();
			} else if (e.keyCode == 13) {
				RESUtils.click(modules['subredditManager'].saveButton);
			}
		}, false);

		var cancelButton = this.editShortcutDialog.querySelector('#editShortcutClose');
		cancelButton.addEventListener('click', function(e) {
			modules['subredditManager'].editShortcutDialog.style.display = 'none';
		}, false);
		this.editShortcutDialog.style.display = 'block';
		var thisLeft = Math.min(RESUtils.mouseX, window.innerWidth-300);
		this.editShortcutDialog.style.left = thisLeft + 'px';
		setTimeout(function() {
			modules['subredditManager'].subredditInput.focus()
		}, 200);
	},
	followSubredditShortcut: function() {
		if (typeof(self.on) == 'function') {
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
		modules['subredditManager'].srDataTransfer = this.getAttribute('orderIndex') + ',' + this.innerHTML;
		// e.dataTransfer.setData('text/html', this.getAttribute('orderIndex') + ',' + this.innerHTML);
	},
	subredditDragEnter: function(e) {
		addClass(this,'srOver');
		return false;
	},
	subredditDragOver: function(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
		// addClass(this,'srOver');

		return false;
	},
	subredditDragLeave: function(e) {
		removeClass(this,'srOver');
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
		if (modules['subredditManager'].dragSrcEl != this) {
			if (e.target.getAttribute('id') != 'RESShortcutsTrash') {
				// get the order index of the src and destination to swap...
				// var theData = e.dataTransfer.getData('text/html').split(',');
				var theData = modules['subredditManager'].srDataTransfer.split(',');
				var srcOrderIndex = parseInt(theData[0]);
				// var srcSubreddit = theData[1];
				var srcSubreddit = modules['subredditManager'].mySubredditShortcuts[srcOrderIndex];
				var destOrderIndex = parseInt(this.getAttribute('orderIndex'));
				var destSubreddit = modules['subredditManager'].mySubredditShortcuts[destOrderIndex];
				var rearranged = [];
				var rearrangedI = 0;
				for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
					if ((i != srcOrderIndex) && (i != destOrderIndex)) {
						rearranged[rearrangedI] = modules['subredditManager'].mySubredditShortcuts[i];
						rearrangedI++;
					} else if (i == destOrderIndex) {
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
				modules['subredditManager'].mySubredditShortcuts = rearranged;
				// save the updated order...
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(),JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
				// redraw the shortcut bar...
				modules['subredditManager'].redrawShortcuts();
				removeClass(this,'srOver');
			} else {
				// var theData = e.dataTransfer.getData('text/html').split(',');
				var theData = modules['subredditManager'].srDataTransfer.split(',');
				// console.log(theData);
				var srcOrderIndex = parseInt(theData[0]);
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
			// if (typeof(opera) != 'undefined') this.headerContents.style.display = 'none';
			// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
			this.headerContents.innerHTML = '';
			this.srLeftContainer = createElementWithID('div','srLeftContainer');
			this.srLeftContainer.setAttribute('class','sr-bar');
			this.srDropdown = createElementWithID('div','srDropdown');
			this.srDropdownContainer = createElementWithID('div','srDropdownContainer');
			this.srDropdownContainer.innerHTML = '<a href="javascript:void(0)">My Subreddits</a>';
			this.srDropdownContainer.addEventListener('click',modules['subredditManager'].toggleSubredditDropdown, false);
			this.srDropdown.appendChild(this.srDropdownContainer);
			this.srList = createElementWithID('table','srList');
			// this.srDropdownContainer.appendChild(this.srList);
			document.body.appendChild(this.srList);
			this.srLeftContainer.appendChild(this.srDropdown);
			var sep = document.createElement('span');
			sep.setAttribute('class','srSep');
			sep.innerHTML = '|';
			this.srLeftContainer.appendChild(sep);
			// now put in the shortcuts...
			this.staticShortCutsContainer = document.createElement('div');
			this.staticShortCutsContainer.setAttribute('id','RESStaticShortcuts');
			/* this probably isn't the best way to give the option, since the mechanic is drag/drop for other stuff..  but it's much easier for now... */
			this.staticShortCutsContainer.innerHTML = '';
			var specialButtonSelected = {};
			var subLower = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : 'home';
			specialButtonSelected[subLower] = 'RESShortcutsCurrentSub';
			if (this.options.linkDashboard.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a id="RESDashboardLink" class="subbarlink '+specialButtonSelected['dashboard']+'" href="/r/Dashboard/">DASHBOARD</a>';
			if (this.options.linkFront.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a class="subbarlink '+specialButtonSelected['home']+'" href="/">FRONT</a>';
			if (this.options.linkAll.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a class="subbarlink '+specialButtonSelected['all']+'" href="/r/all/">ALL</a>';
			if (this.options.linkRandom.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/random/">RANDOM</a>';
			if (this.options.linkRandNSFW.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/randnsfw/">RANDNSFW</a>';
			if (RESUtils.loggedInUser() != null) {
				if (this.options.linkFriends.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a class="subbarlink '+specialButtonSelected['friends']+'" href="/r/friends/">FRIENDS</a>';
				var modmail = document.getElementById('modmail');
				if (modmail) {
					if (this.options.linkMod.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a class=" '+specialButtonSelected['mod']+'" href="/r/mod/">MOD</a>';
					if (this.options.linkModqueue.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/mod/about/modqueue">MODQUEUE</a>';
				}
			}
			
			/*
			this.staticShortCutsContainer.innerHTML = ' <span class="separator">|</span><a href="/r/all/">ALL</a><span class="separator">-</span><a href="/r/random/">RANDOM</a>';
			if (RESUtils.loggedInUser() != null) {
				this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a href="/r/friends/">FRIENDS</a><span class="separator">-</span><a href="/r/mod/">MOD</a>';
			}
			*/
			this.srLeftContainer.appendChild(this.staticShortCutsContainer);
			this.srLeftContainer.appendChild(sep);
			this.headerContents.appendChild(this.srLeftContainer);			
						
			this.shortCutsViewport = document.createElement('div');
			this.shortCutsViewport.setAttribute('id','RESShortcutsViewport');
			this.headerContents.appendChild(this.shortCutsViewport);

			this.shortCutsContainer = document.createElement('div');
			this.shortCutsContainer.setAttribute('id','RESShortcuts');
			this.shortCutsContainer.setAttribute('class','sr-bar');
			this.shortCutsViewport.appendChild(this.shortCutsContainer);

			this.shortCutsEditContainer = document.createElement('div');
			this.shortCutsEditContainer.setAttribute('id','RESShortcutsEditContainer');
			this.headerContents.appendChild(this.shortCutsEditContainer);
			
			// now add an event listener to show the edit bar on hover...
			/* not working so great, too much glitchiness... maybe we'll address this later when we have more time...
			this.headerContents.addEventListener('mouseover', modules['subredditManager'].showShortcutButtons, false);
			this.headerContents.addEventListener('mouseout', modules['subredditManager'].hideShortcutButtons, false);
			*/

			// add right scroll arrow...
			this.shortCutsRight = document.createElement('div');
			this.shortCutsRight.setAttribute('id','RESShortcutsRight');
			this.shortCutsRight.innerHTML = '>';
			// this.containerWidth = this.shortCutsContainer.scrollWidth;
			this.shortCutsRight.addEventListener('click', function(e) {
				modules['subredditManager'].containerWidth = modules['subredditManager'].shortCutsContainer.offsetWidth;
				// var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				// width of browser minus width of left container plus a bit extra for padding...
				// var containerWidth = window.innerWidth + 20 - modules['subredditManager'].srLeftContainer.scrollWidth;
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px',''));
				if (isNaN(marginLeft)) marginLeft = 0;
				if (modules['subredditManager'].containerWidth > (window.innerWidth-380)) {
					marginLeft -= (window.innerWidth - 380);
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				} else {
					// console.log('already all the way over.');
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsRight);

			// add an "add shortcut" button...
			this.shortCutsAdd = document.createElement('div');
			this.shortCutsAdd.setAttribute('id','RESShortcutsAdd');
			this.shortCutsAdd.innerHTML = '+';
			this.shortCutsAdd.title = 'add shortcut';
			this.shortCutsAddFormContainer = document.createElement('div');
			this.shortCutsAddFormContainer.setAttribute('id','RESShortcutsAddFormContainer');
			this.shortCutsAddFormContainer.style.display = 'none';
			this.shortCutsAddFormContainer.innerHTML = ' \
				<form id="shortCutsAddForm"> \
					<div>Add shortcut or multi-reddit (i.e. foo+bar+baz):</div> \
					<label for="newShortcut">Subreddit:</label> <input type="text" id="newShortcut"><br> \
					<label for="displayName">Display Name:</label> <input type="text" id="displayName"><br> \
					<input type="submit" name="submit" value="add" id="addSubreddit"> \
					<div style="clear: both; float: right; margin-top: 5px;"><a style="font-size: 9px;" href="/reddits">Edit frontpage subscriptions</a></div> \
				</form> \
			';			
			this.shortCutsAddFormField = this.shortCutsAddFormContainer.querySelector('#newShortcut');
			this.shortCutsAddFormFieldDisplayName = this.shortCutsAddFormContainer.querySelector('#displayName');
			modules['subredditManager'].shortCutsAddFormField.addEventListener('keyup', function(e) {
				if (e.keyCode == 27) {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
					modules['subredditManager'].shortCutsAddFormField.blur();
				}
			}, false);
			modules['subredditManager'].shortCutsAddFormFieldDisplayName.addEventListener('keyup', function(e) {
				if (e.keyCode == 27) {
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
				if (displayname == '') displayname = subreddit;
				subreddit = subreddit.replace('/r/','').replace('r/','');
				modules['subredditManager'].shortCutsAddFormField.value = '';
				modules['subredditManager'].shortCutsAddFormFieldDisplayName.value = '';
				modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
				if (subreddit) {
					modules['subredditManager'].addSubredditShortcut(subreddit, displayname);
				}
			}, false);
			this.shortCutsAdd.addEventListener('click', function(e) {
				if (modules['subredditManager'].shortCutsAddFormContainer.style.display == 'none') {
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
			// thisShortCut.setAttribute('draggable','true');
			// thisShortCut.setAttribute('orderIndex',i);
			this.shortCutsTrash.setAttribute('id','RESShortcutsTrash');
			this.shortCutsTrash.innerHTML = 'X';
			// thisShortCut.addEventListener('dragstart', modules['subredditManager'].subredditDragStart, false);
			this.shortCutsTrash.addEventListener('dragenter', modules['subredditManager'].subredditDragEnter, false)
			this.shortCutsTrash.addEventListener('dragleave', modules['subredditManager'].subredditDragLeave, false);
			// thisShortCut.addEventListener('dragend', modules['subredditManager'].subredditDragEnd, false);
			this.shortCutsTrash.addEventListener('dragover', modules['subredditManager'].subredditDragOver, false);
			this.shortCutsTrash.addEventListener('drop', modules['subredditManager'].subredditDrop, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsTrash);
			
			// add left scroll arrow...
			this.shortCutsLeft = document.createElement('div');
			this.shortCutsLeft.setAttribute('id','RESShortcutsLeft');
			this.shortCutsLeft.innerHTML = '<';
			this.shortCutsLeft.addEventListener('click', function(e) {
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px',''));
				if (isNaN(marginLeft)) marginLeft = 0;
				marginLeft += (window.innerWidth - 380);
				if (marginLeft <= 0) {
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsLeft);
			
			this.redrawShortcuts();
		}
	},
	/* not working so great, too much glitchiness... maybe we'll address this later when we have more time...
	showShortcutButtons: function() {
			RESUtils.fadeElementIn(modules['subredditManager'].shortCutsEditContainer, 0.3);
	},
	hideShortcutButtons: function() {
			RESUtils.fadeElementOut(modules['subredditManager'].shortCutsEditContainer, 0.3);
	}, */
	toggleSubredditDropdown: function() {
		if (modules['subredditManager'].srList.style.display == 'block') {
			modules['subredditManager'].srList.style.display = 'none';
		} else {
			if (RESUtils.loggedInUser()) {
				modules['subredditManager'].srList.innerHTML = '<tr><td width="360">Loading subreddits (may take a moment)...<div id="subredditPagesLoaded"></div></td></tr>';
				modules['subredditManager'].subredditPagesLoaded = modules['subredditManager'].srList.querySelector('#subredditPagesLoaded');
				modules['subredditManager'].srList.style.display = 'block';
				modules['subredditManager'].getSubreddits();
			} else {
				modules['subredditManager'].srList.innerHTML = '<tr><td width="360">You must be logged in to load your own list of subreddits. <a style="display: inline; float: left;" href="/reddits">browse them all</a></td></tr>';
				modules['subredditManager'].srList.style.display = 'block';
			}
		}
	},
	mySubreddits: [
	],
	mySubredditShortcuts: [
	],
	getSubredditJSON: function(after) {
		var jsonURL = location.protocol + '//' + location.hostname + '/reddits/mine/.json?app=res';
		if (after) jsonURL += '&after='+after;
		GM_xmlhttpRequest({
			method:	"GET",
			url:	jsonURL,
			onload:	function(response) {
				var thisResponse = JSON.parse(response.responseText);
				if ((typeof(thisResponse.data) != 'undefined') && (typeof(thisResponse.data.children) != 'undefined')) {
					if (modules['subredditManager'].subredditPagesLoaded.innerHTML == '') {
						modules['subredditManager'].subredditPagesLoaded.innerHTML = 'Pages loaded: 1';
					} else {
						var pages = modules['subredditManager'].subredditPagesLoaded.innerHTML.match(/:\ ([\d]+)/);
						modules['subredditManager'].subredditPagesLoaded.innerHTML = 'Pages loaded: ' + (parseInt(pages[1])+1);
					}
					var now = new Date();
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.'+RESUtils.loggedInUser(),now.getTime());
					var subreddits = thisResponse.data.children;
					for (var i=0, len=subreddits.length; i<len; i++) {
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
					if (thisResponse.data.after != null) {
						modules['subredditManager'].getSubredditJSON(thisResponse.data.after);
					} else {
						modules['subredditManager'].mySubreddits.sort(function(a,b) {
							var adisp = a.display_name.toLowerCase();
							var bdisp = b.display_name.toLowerCase();
							if (adisp > bdisp) return 1;
							if (adisp == bdisp) return 0;
							return -1;
						});
						RESStorage.setItem('RESmodules.subredditManager.subreddits.'+RESUtils.loggedInUser(),JSON.stringify(modules['subredditManager'].mySubreddits));
						this.gettingSubreddits = false;
						modules['subredditManager'].populateSubredditDropdown();
					}
				} else {
					// user is probably not logged in.. no subreddits found.
					modules['subredditManager'].populateSubredditDropdown(null, true);
				}
			}
		});
	
	},
	getSubreddits: function() {
		modules['subredditManager'].mySubreddits = [];
		var lastCheck = parseInt(RESStorage.getItem('RESmodules.subredditManager.subreddits.lastCheck.'+RESUtils.loggedInUser())) || 0;
		var now = new Date();
		var check = RESStorage.getItem('RESmodules.subredditManager.subreddits.'+RESUtils.loggedInUser());
		// 86400000 = 1 day
		if (((now.getTime() - lastCheck) > 86400000) || (check == null) || (check == '') || (check.length == 0)) {
			if (!this.gettingSubreddits) {
				this.gettingSubreddits = true;
				this.getSubredditJSON();
			} 
		} else {
			modules['subredditManager'].mySubreddits = safeJSON.parse(check, 'RESmodules.subredditManager.subreddits.'+RESUtils.loggedInUser());
			this.populateSubredditDropdown();
		}
	},
	// if badJSON is true, then getSubredditJSON ran into an error...
	populateSubredditDropdown: function(sortBy, badJSON) {
		modules['subredditManager'].sortBy = sortBy || 'subreddit';
		modules['subredditManager'].srList.innerHTML = '';
		// NOTE WE NEED TO CHECK LAST TIME THEY UPDATED THEIR SUBREDDIT LIST AND REPOPULATE...
		var theHead = document.createElement('thead');
		var theRow = document.createElement('tr');
		modules['subredditManager'].srHeader = document.createElement('td');
		modules['subredditManager'].srHeader.addEventListener('click', function() {
			if (modules['subredditManager'].sortBy == 'subreddit') {
				modules['subredditManager'].populateSubredditDropdown('subredditDesc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('subreddit');
			}
		}, false);
		modules['subredditManager'].srHeader.innerHTML = 'subreddit';
		modules['subredditManager'].srHeader.setAttribute('width','200');
		modules['subredditManager'].lvHeader = document.createElement('td');
		modules['subredditManager'].lvHeader.addEventListener('click', function() {
			if (modules['subredditManager'].sortBy == 'lastVisited') {
				modules['subredditManager'].populateSubredditDropdown('lastVisitedAsc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('lastVisited');
			}
		}, false);
		modules['subredditManager'].lvHeader.innerHTML = 'Last Visited';
		modules['subredditManager'].lvHeader.setAttribute('width','120');
		var scHeader = document.createElement('td');
		// scHeader.innerHTML = '&nbsp;';
		scHeader.innerHTML = '<a style="float: right;" href="/reddits">View all &raquo;</a>';
		theRow.appendChild(modules['subredditManager'].srHeader);
		theRow.appendChild(modules['subredditManager'].lvHeader);
		theRow.appendChild(scHeader);
		theHead.appendChild(theRow);
		// theRow.innerHTML = '<td width="120">subreddit</td><td width="100">Last Visited</td><td></td>';
		modules['subredditManager'].srList.appendChild(theHead);
		var theBody = document.createElement('tbody');
		if (!(badJSON)) {
			var subredditCount = modules['subredditManager'].mySubreddits.length;
			if (typeof(this.subredditsLastViewed) == 'undefined') {
				var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser());
				if (check) {
					this.subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser());
				} else {
					this.subredditsLastViewed = {};
				}
			}
			// copy modules['subredditManager'].mySubreddits to a placeholder array so we can sort without modifying it...
			var sortableSubreddits = modules['subredditManager'].mySubreddits;
			if (sortBy == 'lastVisited') {
				modules['subredditManager'].lvHeader.innerHTML = 'Last Visited <div class="sortAsc"></div>';
				modules['subredditManager'].srHeader.innerHTML = 'subreddit';
				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					(typeof(modules['subredditManager'].subredditsLastViewed[adisp]) == 'undefined') ? alv = 0 : alv = parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited);
					(typeof(modules['subredditManager'].subredditsLastViewed[bdisp]) == 'undefined') ? blv = 0 : blv = parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited);
					if (alv < blv) return 1;
					if (alv == blv) {
						if (adisp > bdisp) return 1;
						return -1;
					}
					return -1;
				});
			} else if (sortBy == 'lastVisitedAsc') {
				modules['subredditManager'].lvHeader.innerHTML = 'Last Visited <div class="sortDesc"></div>';
				modules['subredditManager'].srHeader.innerHTML = 'subreddit';
				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					(typeof(modules['subredditManager'].subredditsLastViewed[adisp]) == 'undefined') ? alv = 0 : alv = parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited);
					(typeof(modules['subredditManager'].subredditsLastViewed[bdisp]) == 'undefined') ? blv = 0 : blv = parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited);
					if (alv > blv) return 1;
					if (alv == blv) {
						if (adisp > bdisp) return 1;
						return -1;
					}
					return -1;
				});
			} else if (sortBy == 'subredditDesc') {
				modules['subredditManager'].lvHeader.innerHTML = 'Last Visited';
				modules['subredditManager'].srHeader.innerHTML = 'subreddit <div class="sortDesc"></div>';
				sortableSubreddits.sort(function(a,b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					if (adisp < bdisp) return 1;
					if (adisp == bdisp) return 0;
					return -1;
				});		
			} else {
				modules['subredditManager'].lvHeader.innerHTML = 'Last Visited';
				modules['subredditManager'].srHeader.innerHTML = 'subreddit <div class="sortAsc"></div>';
				sortableSubreddits.sort(function(a,b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					if (adisp > bdisp) return 1;
					if (adisp == bdisp) return 0;
					return -1;
				});
			}
			for (var i=0; i<subredditCount; i++) {
				var dateString = 'Never';
				var thisReddit = sortableSubreddits[i].display_name.toLowerCase();
				if (typeof(this.subredditsLastViewed[thisReddit]) != 'undefined') {
					var ts = parseInt(this.subredditsLastViewed[thisReddit].last_visited);
					var dateVisited = new Date(ts);
					dateString = RESUtils.niceDate(dateVisited);
				}
				var theRow = document.createElement('tr');
				var theSR = document.createElement('td');
				theSR.innerHTML = '<a href="'+modules['subredditManager'].mySubreddits[i].url+'">'+modules['subredditManager'].mySubreddits[i].display_name+'</a>';
				theRow.appendChild(theSR);
				var theLV = document.createElement('td');
				theLV.innerHTML = dateString;
				theLV.setAttribute('class','RESvisited');
				theRow.appendChild(theLV);
				var theSC = document.createElement('td');
				theSC.setAttribute('class','RESshortcut');
				theSC.setAttribute('subreddit',modules['subredditManager'].mySubreddits[i].display_name);
				var idx = -1;
				for (var j=0, len=modules['subredditManager'].mySubredditShortcuts.length; j<len; j++) {
					if (modules['subredditManager'].mySubredditShortcuts[j].subreddit == modules['subredditManager'].mySubreddits[i].display_name) {
						idx=j;
						break;
					}
				}
				if (idx != -1) {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}
						var subreddit = e.target.getAttribute('subreddit');
						modules['subredditManager'].removeSubredditShortcut(subreddit);
					}, false);
					theSC.innerHTML = '-shortcut';
				} else {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}
						var subreddit = e.target.getAttribute('subreddit');
						modules['subredditManager'].addSubredditShortcut(subreddit);
					}, false);
					theSC.innerHTML = '+shortcut';
				}
				theRow.appendChild(theSC);
				theBody.appendChild(theRow);
			}
		} else {
			var theRow = document.createElement('tr');
			var theTD = document.createElement('td');
			theTD.innerHTML = 'There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com<';
			theTD.setAttribute('colspan','3');
			theRow.appendChild(theTD);
			theBody.appendChild(theRow);
		}
		modules['subredditManager'].srList.appendChild(theBody);
	},
	toggleSubredditShortcut: function(e) {
		if (e.stopPropagation) {
			e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
		}
		var idx = -1;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == e.target.getAttribute('subreddit')) {
				idx=i;
				break;
			}
		}
		if (idx != -1) {
			// modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
			modules['subredditManager'].removeSubredditShortcut(e.target.getAttribute('subreddit'));
			e.target.setAttribute('title','Add this subreddit to your shortcut bar');
			e.target.innerHTML = '+shortcut';
			removeClass(e.target,'remove');
		} else {
			// modules['subredditManager'].mySubredditShortcuts.push(e.target.getAttribute('subreddit'));
			modules['subredditManager'].addSubredditShortcut(e.target.getAttribute('subreddit'));
			e.target.setAttribute('title','Remove this subreddit from your shortcut bar');
			e.target.innerHTML = '-shortcut';
			addClass(e.target,'remove');
		}
		modules['subredditManager'].redrawShortcuts();
	},
	getLatestShortcuts: function() {
		// re-retreive the latest data to ensure we're not losing info between tab changes...
		var shortCuts = RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser());
		if (!shortCuts) {
			shortCuts = '[]';
		} 
		modules['subredditManager'].mySubredditShortcuts = safeJSON.parse(shortCuts, 'RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser());
	},
	addSubredditShortcut: function(subreddit, displayname) {
		this.getLatestShortcuts();
		var idx = -1;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == subreddit) {
				idx = i;
				break;
			}
		}
		if (idx != -1) {
			alert('Whoops, you already have a shortcut for that subreddit');
		} else {
			displayname = displayname || subreddit;
			subredditObj = {
				subreddit: subreddit,
				displayName: displayname
			}
			modules['subredditManager'].mySubredditShortcuts.push(subredditObj);
			if (RESUtils.proEnabled()) {
				if (typeof(modules['subredditManager'].RESPro) == 'undefined') {
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()) != null) {
						var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser());
					} else {
						var temp = { add: {}, del: {} };
					}
					modules['subredditManager'].RESPro = temp;
				}
				if (typeof(modules['subredditManager'].RESPro.add) == 'undefined') {
					modules['subredditManager'].RESPro.add = {}
				}
				if (typeof(modules['subredditManager'].RESPro.del) == 'undefined') {
					modules['subredditManager'].RESPro.del = {}
				}
				// add this subreddit next time we sync...
				modules['subredditManager'].RESPro.add[subreddit] = true;
				// make sure we don't run a delete on this subreddit next time we sync...
				if (typeof(modules['subredditManager'].RESPro.del[subreddit]) != 'undefined') delete modules['subredditManager'].RESPro.del[subreddit];
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}
			RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();
			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}
			RESUtils.notification({ 
				header: 'Subreddit Manager Notification', 
				message: 'Subreddit shortcut added. You can edit by double clicking, or trash by dragging to the trash can.'
			});
		}
	},
	removeSubredditShortcut: function(subreddit) {
		this.getLatestShortcuts();
		console.log('remove: '+subreddit);
		var idx = -1;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			console.log(modules['subredditManager'].mySubredditShortcuts[i].subreddit);
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == subreddit) {
				idx = i;
				break;
			}
		}
		if (idx != -1) {
			modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
			if (RESUtils.proEnabled()) {
				if (typeof(modules['subredditManager'].RESPro) == 'undefined') {
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()) != null) {
						var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser());
					} else {
						var temp = { add: {}, del: {} };
					}
					modules['subredditManager'].RESPro = temp;
				}
				if (typeof(modules['subredditManager'].RESPro.add) == 'undefined') {
					modules['subredditManager'].RESPro.add = {}
				}
				if (typeof(modules['subredditManager'].RESPro.del) == 'undefined') {
					modules['subredditManager'].RESPro.del = {}
				}
				// delete this subreddit next time we sync...
				modules['subredditManager'].RESPro.del[subreddit] = true;
				// make sure we don't run an add on this subreddit
				if (typeof(modules['subredditManager'].RESPro.add[subreddit]) != 'undefined') delete modules['subredditManager'].RESPro.add[subreddit];
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}
			RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();
			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}
		}
	},
	setLastViewtime: function() {
		var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser());
		if (check == null) {
			this.subredditsLastViewed = {};
		} else {
			this.subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser());
		}
		var now = new Date();
		var thisReddit = RESUtils.currentSubreddit().toLowerCase();
		this.subredditsLastViewed[thisReddit] = {
			last_visited: now.getTime()
		}
		RESStorage.setItem('RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser(),JSON.stringify(this.subredditsLastViewed));
	}
};
