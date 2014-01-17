modules['neverEndingReddit'] = {
	moduleID: 'neverEndingReddit',
	moduleName: 'Never Ending Reddit',
	category: 'UI',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		returnToPrevPage: {
			type: 'boolean',
			value: true,
			description: 'Return to the page you were last on when hitting "back" button?'
		},
		autoLoad: {
			type: 'boolean',
			value: true,
			description: 'Automatically load new page on scroll (if off, you click to load)'
		},
		notifyWhenPaused: {
			type: 'boolean',
			value: true,
			description: 'Show a reminder to unpause Never-Ending Reddit after pausing'
		},
		reversePauseIcon: {
			type: 'boolean',
			value: false,
			description: 'Show "paused" bars icon when auto-load is paused and "play" wedge icon when active'
		},
		showServerInfo: {
			type: 'boolean',
			value: false,
			description: 'Show the π server / debug details next to the floating Never-Ending Reddit tools'
		},
		pauseAfterEvery: {
			type: 'text',
			value: 0,
			description: 'After auto-loading a certain number of pages, pause the auto-loader' + '<br><br>0 or a negative number means Never-Ending Reddit will only pause when you click' + ' the play/pause button in the top right corner.'
		},
		hideDupes: {
			type: 'enum',
			value: 'fade',
			values: [{
				name: 'Fade',
				value: 'fade'
			}, {
				name: 'Hide',
				value: 'hide'
			}, {
				name: 'Do not hide',
				value: 'none'
			}],
			description: 'Fade or completely hide duplicate posts from previous pages.'
		}
	},
	description: 'Inspired by modules like River of Reddit and Auto Pager - gives you a never ending stream of reddit goodness.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\_\?=]*/i
	],
	exclude: [],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#NERModal { display: none; z-index: 999; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; opacity: 0.6; }');
			RESUtils.addCSS('#NERContent { display: none; position: fixed; top: 40px; z-index: 1000; width: 720px; background-color: #FFF; color: #000; padding: 10px; font-size: 12px; }');
			RESUtils.addCSS('#NERModalClose { position: absolute; top: 3px; right: 3px; }');
			RESUtils.addCSS('#NERFail { min-height: 30px; width: 95%; font-size: 14px; border: 1px solid #999; border-radius: 10px; padding: 5px; text-align: center; bgcolor: #f0f3fc; cursor: auto; }');
			RESUtils.addCSS('#NERFail .nextprev { font-size: smaller; display: block; }');
			RESUtils.addCSS('#NERFail .nextprev a + a { margin-left: 2em; }');
			RESUtils.addCSS('.NERdupe p.title:after { color: #000; font-size: 10px; content: \' (duplicate from previous page)\'; }');
			RESUtils.addCSS('.NERPageMarker { text-align: center; color: #7f7f7f; font-size: 14px; margin-top: 6px; margin-bottom: 6px; font-weight: normal; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px; padding: 3px 0; }');
			// hide next/prev page and random subreddit indicators
			RESUtils.addCSS('.content div.nav-buttons { display: none; } ');
			switch (this.options.hideDupes.value) {
				case 'fade':
					RESUtils.addCSS('.NERdupe { opacity: 0.3; }');
					break;
				case 'hide':
					RESUtils.addCSS('.NERdupe { display: none; }');
					break;
			}
			// set the style for our little loader widget
			RESUtils.addCSS('#progressIndicator { width: 95%; min-height: 20px; margin: 0 auto; font-size: 14px; border: 1px solid #999; border-radius: 10px; padding: 10px; text-align: center; background-color: #f0f3fc; cursor: pointer; } ');
			RESUtils.addCSS('#progressIndicator h2 { margin-bottom: .5em; }');
			RESUtils.addCSS('#progressIndicator .gearIcon { margin-left: 1em; }');
			RESUtils.addCSS('#NREMailCount { margin-left: 0; float: left; margin-top: 3px;}');
			RESUtils.addCSS('#NREPause { margin-left: 2px; width: 16px; height: 16px; float: left; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); cursor: pointer; }');
			RESUtils.addCSS('#NREPause, #NREPause.paused.reversePause { background-position: -16px -192px; }');
			RESUtils.addCSS('#NREPause.paused, #NREPause.reversePause {  background-position: 0 -192px; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			/*			if (RESUtils.pageType() !== 'linklist') {
				sessionStorage.NERpageURL = location.href;
			}
*/ // modified from a contribution by Peter Siewert, thanks Peter!
			if (typeof modules['neverEndingReddit'].dupeHash === 'undefined') modules['neverEndingReddit'].dupeHash = {};
			var entries = document.body.querySelectorAll('a.comments');
			for (var i = entries.length - 1; i > -1; i--) {
				modules['neverEndingReddit'].dupeHash[entries[i].href] = 1;
			}

			this.allLinks = document.body.querySelectorAll('#siteTable div.thing');

			// code inspired by River of Reddit, but rewritten from scratch to work across multiple browsers...
			// Original River of Reddit author: reddy kapil
			// Original link to Chrome extension: https://chrome.google.com/extensions/detail/bjiggjllfebckflfdjbimogjieeghcpp

			// store access to the siteTable div since that's where we'll append new data...
			var stMultiCheck = document.querySelectorAll('#siteTable');
			this.siteTable = stMultiCheck[0];
			// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
			if (stMultiCheck.length === 2) {
				// console.log('skipped first sitetable, stupid reddit.');
				this.siteTable = stMultiCheck[1];
			}
			// get the first link to the next page of reddit...
			var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks();
			if (nextPrevLinks) {
				var nextLink = nextPrevLinks.next;
				if (nextLink) {
					this.nextPageURL = nextLink.getAttribute('href');
					var nextXY = RESUtils.getXYpos(nextLink);
					this.nextPageScrollY = nextXY.y;

					this.attachLoaderWidget();
				}

				//Reset this info if the page is in a new tab
				// wait, this is always  tre... commenting out.
				/*
				if (window.history.length) {
					console.log('delete nerpage');
					delete sessionStorage['NERpage'];
				*/
				if (this.options.returnToPrevPage.value) {
					// if the user clicks any external links, save that link
					// get all external links and track clicks...
					/*
					$('body').on('click', 'a.title[href^="http://"]', function(e) {
						// if left click and not going to open in a new tab...
						if ((this.target !== '_blank') && (e.which === 1)) sessionStorage.lastPageURL = this.href;
					});
					*/
					this.returnToPrevPageCheck(location.hash);
				}

				// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
				if (this.options.autoLoad.value && nextLink) {
					window.addEventListener('scroll', modules['neverEndingReddit'].handleScroll, false);
				}
			}
			// check if the user has new mail...
			this.navMail = document.getElementById('mail');
			this.NREFloat = RESUtils.createElementWithID('div', 'NREFloat');
			this.NREPause = RESUtils.createElementWithID('div', 'NREPause');
			this.NREPause.setAttribute('title', 'Pause / Restart Never Ending Reddit');
			if (this.options.reversePauseIcon.value) this.NREPause.classList.add('reversePause');
			this.isPaused = (RESStorage.getItem('RESmodules.neverEndingReddit.isPaused') == true);
			if (this.isPaused) this.NREPause.classList.add('paused');
			this.NREPause.addEventListener('click', modules['neverEndingReddit'].togglePause, false);
			if ((modules['betteReddit'].options.pinHeader.value !== 'userbar') && (modules['betteReddit'].options.pinHeader.value !== 'header')) {
				this.NREMail = RESUtils.createElementWithID('a', 'NREMail');
				if (modules['betteReddit'].options.pinHeader.value === 'sub') {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 23px; right: 8px; display: none; }');
				} else if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 44px; right: 0; display: none; }');
					RESUtils.addCSS('#NREMail { display: none; }');
					RESUtils.addCSS('#NREMailCount { display: none; }');
				} else {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 10px; right: 10px; display: none; }');
				}
				RESUtils.addCSS('#NREMail { width: 16px; height: 12px; float: left; margin-top: 4px; background: center center no-repeat; }');
				RESUtils.addCSS('#NREMail.nohavemail { background-image: url(https://redditstatic.s3.amazonaws.com/mailgray.png); }');
				RESUtils.addCSS('#NREMail.havemail { background-image: url(https://redditstatic.s3.amazonaws.com/mail.png); }');
				RESUtils.addCSS('.res-colorblind #NREMail.havemail { background-image: url(http://thumbs.reddit.com/t5_2s10b_5.png); }');
				this.NREFloat.appendChild(this.NREMail);
				this.NREMailCount = RESUtils.createElementWithID('a', 'NREMailCount');
				this.NREMailCount.display = 'none';
				this.NREMailCount.setAttribute('href', modules['betteReddit'].getInboxLink(true));
				this.NREFloat.appendChild(this.NREMailCount);
				var hasNew = false;
				if ((typeof this.navMail !== 'undefined') && (this.navMail !== null)) {
					hasNew = this.navMail.classList.contains('havemail');
				}
				this.setMailIcon(hasNew);
			} else {
				this.NREMail = this.navMail;
				RESUtils.addCSS('#NREFloat { position: fixed; top: 30px; right: 8px; display: none; }');
			}
			this.NREFloat.appendChild(this.NREPause);
			document.body.appendChild(this.NREFloat);

			if (this.options.showServerInfo.value) {
				RESUtils.addCSS('.debuginfo { position: fixed; bottom: 5px; right: 5px; }');
				RESUtils.addCSS('.debuginfo { background: rgba(255,255,255,0.3); }');
				RESUtils.addCSS('.debuginfo:hover { background: rgba(255,255,255,0.8); }');
				RESUtils.addCSS('.res-nightmode .debuginfo { background: rgba(30,30,30,0.5); color: #ccc; }');
				RESUtils.addCSS('.res-nightmode .debuginfo:hover { background: rgba(30,30,30,0.8); }');
			}
		}
	},
	pageMarkers: [],
	pageURLs: [],
	togglePause: function() {
		modules['neverEndingReddit'].isPaused = !modules['neverEndingReddit'].isPaused;
		RESStorage.setItem('RESmodules.neverEndingReddit.isPaused', modules['neverEndingReddit'].isPaused);
		if (modules['neverEndingReddit'].isPaused) {
			modules['neverEndingReddit'].NREPause.classList.add('paused');
			if (modules['neverEndingReddit'].options.notifyWhenPaused.value) {
				var notification = [];
				notification.push('Never-Ending Reddit has been paused. Click the play/pause button to unpause it.');
				notification.push('To hide this message, disable Never-Ending Reddit\'s ' + modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', 'notifyWhenPaused', 'notifyWhenPaused option <span class="gearIcon" />') + '.');
				notification = notification.join('<br><br>');
				modules['notifications'].showNotification({
					moduleID: 'neverEndingReddit',
					message: notification
				});
			}
		} else {
			modules['neverEndingReddit'].NREPause.classList.remove('paused');
			modules['neverEndingReddit'].handleScroll();
		}
		modules['neverEndingReddit'].setWidgetActionText();
	},
	returnToPrevPageCheck: function(hash) {
		var pageRE = /page=(\d+)/,
			match = pageRE.exec(hash);
		// Set the current page to page 1...
		this.currPage = 1;
		if (match) {
			var backButtonPageNumber = match[1] || 1;
			if (backButtonPageNumber > 1) {
				this.attachModalWidget();
				this.currPage = backButtonPageNumber;
				this.loadNewPage(true);
			}
		}

		/*		
		if ((sessionStorage.NERpageURL) && (sessionStorage.NERpageURL != sessionStorage.lastPageURL)) {
			var backButtonPageNumber = sessionStorage.getItem('NERpage') || 1;
			if (backButtonPageNumber > 1) {
				this.currPage = backButtonPageNumber;
				this.loadNewPage(true);
			}
		}
		sessionStorage.lastPageURL = location.href;
		*/
	},
	handleScroll: function(e) {
		if (modules['neverEndingReddit'].scrollTimer) clearTimeout(modules['neverEndingReddit'].scrollTimer);
		modules['neverEndingReddit'].scrollTimer = setTimeout(modules['neverEndingReddit'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function(e) {
		var thisPageNum = 1,
			thisMarker;

		for (var i = 0, len = modules['neverEndingReddit'].pageMarkers.length; i < len; i++) {
			var thisXY = RESUtils.getXYpos(modules['neverEndingReddit'].pageMarkers[i]);
			if (thisXY.y < window.pageYOffset) {
				thisMarker = modules['neverEndingReddit'].pageMarkers[i];
				thisPageNum = thisMarker.getAttribute('id').replace('page-', '');
				modules['neverEndingReddit'].currPage = thisPageNum;
				if (thisMarker) {
					var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
					RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.' + thisPageType, thisMarker.getAttribute('url'));
				}
			} else {
				break;
			}
		}
		var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
		// RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.'+thisPageType, modules['neverEndingReddit'].pageURLs[thisPageNum]);
		if (thisPageNum != sessionStorage.NERpage) {
			if (thisPageNum > 1) {
				// sessionStorage.NERpageURL = location.href;
				sessionStorage.NERpage = thisPageNum;
				modules['neverEndingReddit'].pastFirstPage = true;
				location.hash = 'page=' + thisPageNum;
			} else {
				if (location.hash.indexOf('page=') !== -1) {
					location.hash = 'page=' + thisPageNum;
				}
				delete sessionStorage['NERpage'];
			}
		}
		if ((modules['neverEndingReddit'].fromBackButton != true) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
			for (var i = 0, len = modules['neverEndingReddit'].allLinks.length; i < len; i++) {
				if (RESUtils.elementInViewport(modules['neverEndingReddit'].allLinks[i])) {
					var thisClassString = modules['neverEndingReddit'].allLinks[i].getAttribute('class');
					var thisClass = thisClassString.match(/id-t[\d]_[\w]+/);
					if (thisClass) {
						var thisID = thisClass[0];
						var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
						RESStorage.setItem('RESmodules.neverEndingReddit.lastVisibleIndex.' + thisPageType, thisID);
						break;
					}
				}
			}
		}
		if ((RESUtils.elementInViewport(modules['neverEndingReddit'].progressIndicator)) && (modules['neverEndingReddit'].fromBackButton != true)) {
			if (modules['neverEndingReddit'].isPaused != true) {
				modules['neverEndingReddit'].loadNewPage();
				modules['neverEndingReddit'].pauseAfter(thisPageNum);
			}
		}
		if ($(window).scrollTop() > 30) {
			modules['neverEndingReddit'].showFloat(true);
		} else {
			modules['neverEndingReddit'].showFloat(false);
		}
	},
	pauseAfterPages: null,
	pauseAfter: function(currPageNum) {
		if (this.pauseAfterPages === null) {
			this.pauseAfterPages = parseInt(modules['neverEndingReddit'].options.pauseAfterEvery.value, 10);
		}

		if ((this.pauseAfterPages > 0) && (currPageNum % this.pauseAfterPages === 0)) {
			this.togglePause(true);
			var notification = [];
			notification.push('Time for a break!');
			notification.push('Never-Ending Reddit was paused automatically. ' + modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', 'pauseAfterEvery', '', 'gearIcon'));
			notification = notification.join('<br><br>');
			setTimeout(modules['notifications'].showNotification.bind(RESUtils, notification, 5000));
		}
	},
	duplicateCheck: function(newHTML) {
		var newLinks = newHTML.querySelectorAll('div.link');
		for (var i = newLinks.length - 1; i > -1; i--) {
			var newLink = newLinks[i];
			var thisCommentLink = newLink.querySelector('a.comments').href;
			if (modules['neverEndingReddit'].dupeHash[thisCommentLink]) {
				// let's not remove it altogether, but instead dim it...
				// newLink.parentElement.removeChild(newLink);
				newLink.classList.add('NERdupe');
			} else {
				modules['neverEndingReddit'].dupeHash[thisCommentLink] = 1;
			}
		}
		return newHTML;
	},
	setMailIcon: function(newmail) {
		if (RESUtils.loggedInUser() === null) return false;
		if (newmail) {
			modules['neverEndingReddit'].hasNewMail = true;
			this.NREMail.classList.remove('nohavemail');
			this.NREMail.setAttribute('href', modules['betteReddit'].getInboxLink(true));
			this.NREMail.setAttribute('title', 'new mail!');
			this.NREMail.classList.add('havemail');
			modules['betteReddit'].showUnreadCount();
		} else {
			modules['neverEndingReddit'].hasNewMail = false;
			this.NREMail.classList.add('nohavemail');
			this.NREMail.setAttribute('href', modules['betteReddit'].getInboxLink(false));
			this.NREMail.setAttribute('title', 'no new mail');
			this.NREMail.classList.remove('havemail');
			modules['betteReddit'].setUnreadCount(0);
		}
	},
	attachModalWidget: function() {
		this.modalWidget = RESUtils.createElementWithID('div', 'NERModal');
		$(this.modalWidget).html('&nbsp;');
		this.modalContent = RESUtils.createElementWithID('div', 'NERContent');
		$(this.modalContent).html('<div id="NERModalClose" class="RESCloseButton">&times;</div>Never Ending Reddit has detected that you are returning from a page that it loaded. Please give us a moment while we reload that content and return you to where you left off.<br><span class="RESThrobber"></span>');
		document.body.appendChild(this.modalWidget);
		document.body.appendChild(this.modalContent);
		$('#NERModalClose').click(function() {
			$(modules['neverEndingReddit'].modalWidget).hide();
			$(modules['neverEndingReddit'].modalContent).hide();
		});
	},
	attachLoaderWidget: function() {
		// add a widget at the bottom that will be used to detect that we've scrolled to the bottom, and will also serve as a "loading" bar...
		this.progressIndicator = document.createElement('div');
		this.setWidgetActionText();
		this.progressIndicator.id = 'progressIndicator';
		this.progressIndicator.className = 'neverEndingReddit';

		this.progressIndicator.addEventListener('click', function(e) {
			if (e.target.id !== 'NERStaticLink' && !e.target.classList.contains('gearIcon')) {
				e.preventDefault();
				modules['neverEndingReddit'].loadNewPage();
			}
		}, false);
		RESUtils.insertAfter(this.siteTable, this.progressIndicator);
	},
	getNextPrevLinks: function(ele) {
		ele = ele || document.body;
		var links = {
			next: ele.querySelector('.content .nextprev a[rel~=next]'),
			prev: ele.querySelector('.content .nextprev a[rel~=prev]')
		}

		if (!(links.next || links.prev)) links = false;

		return links;
	},
	setWidgetActionText: function() {
		$(this.progressIndicator).empty();
		$('<h2>Never Ending Reddit</h2>')
			.appendTo(this.progressIndicator)
			.append(modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', null, ' ', 'gearIcon'));

		var text = "Click to load the next page";
		if (this.options.autoLoad.value && !this.isPaused) {
			text = "scroll or click to load the next page";
		} else if (this.options.autoLoad.value && this.isPaused) {
			text = "click to load the next page; or click the 'pause' button in the top right corner"
		}

		$('<p class="NERWidgetText" />')
			.text(text)
			.appendTo(this.progressIndicator);

		var nextpage = $('<a id="NERStaticLink">or open next page</a>')
			.attr('href', this.nextPageURL);
		$('<p  class="NERWidgetText" />').append(nextpage)
			.append('&nbsp;(and clear Never-Ending stream)')
			.appendTo(this.progressIndicator);
	},
	loadNewPage: function(fromBackButton, reload) {
		var me = modules['neverEndingReddit'];
		if (me.isLoading != true) {
			me.isLoading = true;
			if (fromBackButton) {
				me.fromBackButton = true;
				var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
				var savePageURL = me.nextPageURL;
				me.nextPageURL = RESStorage.getItem('RESmodules.neverEndingReddit.lastPage.' + thisPageType);
				if ((me.nextPageURL === 'undefined') || (me.nextPageURL === null)) {
					// something went wrong, probably someone hit refresh. Just revert to the first page...
					modules['neverEndingReddit'].fromBackButton = false;
					me.nextPageURL = savePageURL;
					me.currPage = 1;
					me.isLoading = false;
					return false;
				}
				var leftCentered = Math.floor((window.innerWidth - 720) / 2);
				me.modalWidget.style.display = 'block';
				me.modalContent.style.display = 'block';
				me.modalContent.style.left = leftCentered + 'px';
				// remove the progress indicator early, as we don't want the user to scroll past it on accident, loading more content.
				me.progressIndicator.parentNode.removeChild(modules['neverEndingReddit'].progressIndicator);
			} else {
				me.fromBackButton = false;
			}


			me.progressIndicator.removeEventListener('click', modules['neverEndingReddit'].loadNewPage, false);
			$(me.progressIndicator).html('<span class="RESThrobber"></span>  <span class="NERWidgetText">Loading next page...</span>');
			// as a sanity check, which should NEVER register true, we'll make sure me.nextPageURL is on the same domain we're browsing...
			if (me.nextPageURL && me.nextPageURL.indexOf(location.hostname) === -1) {
				console.log('Next page URL mismatch. Something strange may be afoot.')
				me.isLoading = false;
				return false;
			}
			GM_xmlhttpRequest({
				method: "GET",
				url: me.nextPageURL,
				onload: function(response) {
					if ((typeof modules['neverEndingReddit'].progressIndicator.parentNode !== 'undefined') && (modules['neverEndingReddit'].progressIndicator.parentNode !== null)) {
						modules['neverEndingReddit'].progressIndicator.parentNode.removeChild(modules['neverEndingReddit'].progressIndicator);
					}
					// drop the HTML we got back into a div...
					var thisHTML = response.responseText;
					var tempDiv = document.createElement('div');
					// clear out any javascript so we don't render it again...
					$(tempDiv).html(thisHTML.replace(/<script(.|\s)*?\/script>/g, ''));
					// grab the siteTable out of there...
					var newHTML = tempDiv.querySelector('#siteTable');
					// did we find anything?
					if (newHTML !== null) {
						var firstLen, lastLen,
							stMultiCheck = tempDiv.querySelectorAll('#siteTable');
						// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
						if (stMultiCheck.length === 2) {
							// console.log('skipped first sitetable, stupid reddit.');
							newHTML = stMultiCheck[1];
						}
						newHTML.setAttribute('ID', 'siteTable-' + modules['neverEndingReddit'].currPage + 1);
						firstLen = $(newHTML).find('.link:first .rank').text().length;
						lastLen = $(newHTML).find('.link:last .rank').text().length;
						if (lastLen > firstLen) {
							lastLen = (lastLen * 1.1).toFixed(1);
							RESUtils.addCSS('body.res > .content .link .rank { width: ' + lastLen + 'ex; }');
						}
						modules['neverEndingReddit'].duplicateCheck(newHTML);
						// check for new mail
						var hasNewMail = tempDiv.querySelector('#mail');
						if ((typeof hasNewMail !== 'undefined') && (hasNewMail !== null) && (hasNewMail.classList.contains('havemail'))) {
							modules['neverEndingReddit'].setMailIcon(true);
						} else {
							modules['neverEndingReddit'].setMailIcon(false);
						}
						// load up uppers and downers, if enabled...
						// maybe not necessary anymore..
						/*
						if ((modules['uppersAndDowners'].isEnabled()) && (RESUtils.pageType() === 'comments')) {
							modules['uppersAndDowners'].applyUppersAndDownersToComments(modules['neverEndingReddit'].nextPageURL);
						}
						*/
						// get the new nextLink value for the next page...
						var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks(tempDiv);
						if (nextPrevLinks) {
							if (isNaN(modules['neverEndingReddit'].currPage)) modules['neverEndingReddit'].currPage = 1;
							if (!fromBackButton) modules['neverEndingReddit'].currPage++;
							if ((!(modules['neverEndingReddit'].fromBackButton)) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
								// modules['neverEndingReddit'].pageURLs[modules['neverEndingReddit'].currPage] = modules['neverEndingReddit'].nextPageURL;
								var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
								RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.' + thisPageType, modules['neverEndingReddit'].nextPageURL);
								// location.hash = 'page='+modules['neverEndingReddit'].currPage;
							}
							var nextLink = nextPrevLinks.next;
							var nextPage = modules['neverEndingReddit'].currPage;
							var pageMarker = RESUtils.createElementWithID('div', 'page-' + nextPage);
							pageMarker.classList.add('NERPageMarker');
							$(pageMarker).text('Page ' + nextPage);
							modules['neverEndingReddit'].siteTable.appendChild(pageMarker);
							modules['neverEndingReddit'].pageMarkers.push(pageMarker);
							modules['neverEndingReddit'].siteTable.appendChild(newHTML);
							modules['neverEndingReddit'].isLoading = false;
							if (nextLink) {
								// console.log(nextLink);
								pageMarker.setAttribute('url', me.nextPageURL);
								if (nextLink.getAttribute('rel').indexOf('prev') !== -1) {
									// remove the progress indicator from the DOM, it needs to go away.
									modules['neverEndingReddit'].progressIndicator.style.display = 'none';
									var endOfReddit = RESUtils.createElementWithID('div', 'endOfReddit');
									$(endOfReddit).text('You\'ve reached the last page available.  There are no more pages to load.');
									modules['neverEndingReddit'].siteTable.appendChild(endOfReddit);
									window.removeEventListener('scroll', modules['neverEndingReddit'].handleScroll, false);
								} else {
									// console.log('not over yet');
									modules['neverEndingReddit'].nextPageURL = nextLink.getAttribute('href');
									modules['neverEndingReddit'].attachLoaderWidget();
								}
							}
							modules['neverEndingReddit'].allLinks = document.body.querySelectorAll('#siteTable div.thing');
							if ((fromBackButton) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
								// TODO: it'd be great to figure out a better way than a timeout, but this
								// has considerably helped the accuracy of RES's ability to return you to where
								// you left off.
								setTimeout(modules['neverEndingReddit'].scrollToLastElement, 4000);
							}

							// If we're on the reddit-browsing page (/reddits or /subreddits), add +shortcut and -shortcut buttons...
							if (/^https?:\/\/www\.reddit\.com\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.href)) {
								modules['subredditManager'].browsingReddits();
							}
						}

						var nextPrevLinks = newHTML && modules['neverEndingReddit'].getNextPrevLinks(newHTML);
						if (!(nextPrevLinks && nextPrevLinks.next)) {
							var noresults = tempDiv.querySelector('#noresults');
							var noresultsfound = (noresults !== null);
							modules['neverEndingReddit'].NERFail(noresultsfound);
						}

						var e = document.createEvent("Events");
						e.initEvent("neverEndingLoad", true, true);
						window.dispatchEvent(e);
					}
				},
				onerror: function(err) {
					modules['neverEndingReddit'].NERFail();
				}
			});
		} else {
			// console.log('load new page ignored');
		}
	},
	scrollToLastElement: function() {
		modules['neverEndingReddit'].modalWidget.style.display = 'none';
		modules['neverEndingReddit'].modalContent.style.display = 'none';
		// window.scrollTo(0,0)
		// RESUtils.scrollTo(0,modules['neverEndingReddit'].nextPageScrollY);
		var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
		var lastTopScrolledID = RESStorage.getItem('RESmodules.neverEndingReddit.lastVisibleIndex.' + thisPageType);
		var lastTopScrolledEle = document.body.querySelector('.' + lastTopScrolledID);
		if (!lastTopScrolledEle) {
			var lastTopScrolledEle = newHTML.querySelector('#siteTable div.thing');
		}
		var thisXY = RESUtils.getXYpos(lastTopScrolledEle);
		RESUtils.scrollTo(0, thisXY.y);
		modules['neverEndingReddit'].fromBackButton = false;
	},
	NERFail: function(noresults) {
		modules['neverEndingReddit'].isLoading = false;
		var newHTML = RESUtils.createElementWithID('div', 'NERFail');
		var failureMessage = noresults ? 'There doesn\'t seem to be anything here!' : 'Couldn\'t load any more posts';
		var start = location.href.split('#')[0];
		var retry = modules['neverEndingReddit'].nextPageURL;
		$(newHTML).html('	\
			<h3>	\
				' + failureMessage + '	\
				<a target="_blank" href="http://www.reddit.com/r/Enhancement/comments/s72xt/never_ending_reddit_and_reddit_barfing_explained/">(Why not?)</a>	\
			</h3>	\
			<p class="nextprev">	\
				<a href="' + start + '">start over</a>	\
				<a href="' + retry + '">try again</a>	\
				<a href="/r/random">check out a random subreddit</a>	\
			</p>	\
			');
		newHTML.setAttribute('style', 'cursor: auto !important;');


		modules['neverEndingReddit'].siteTable.appendChild(newHTML);
		if (modules['neverEndingReddit'].modalWidget) {
			modules['neverEndingReddit'].modalWidget.style.display = 'none';
			modules['neverEndingReddit'].modalContent.style.display = 'none';
		}
	},
	showFloat: function(show) {
		if (show) {
			this.NREFloat.style.display = 'block';
		} else {
			this.NREFloat.style.display = 'none';
		}
	}
};
