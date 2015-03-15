modules['neverEndingReddit'] = {
	moduleID: 'neverEndingReddit',
	moduleName: 'Never Ending Reddit',
	category: 'Posts',
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
			description: 'Show a reminder to unpause Never-Ending Reddit after pausing',
			advanced: true
		},
		reversePauseIcon: {
			type: 'boolean',
			value: false,
			description: 'Show "paused" bars icon when auto-load is paused and "play" wedge icon when active',
			advanced: true
		},
		showServerInfo: {
			type: 'boolean',
			value: false,
			description: 'Show the π server / debug details next to the floating Never-Ending Reddit tools',
			advanced: true
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
			description: 'Fade or completely hide duplicate posts already showing on the page.'
		}
	},
	description: 'Inspired by modules like River of Reddit and Auto Pager - gives you a never ending stream of reddit goodness.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	exclude: [
		'wiki',
		'comments'
	],
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
			RESUtils.addCSS('.NERPageMarker { text-align: center; color: #7f7f7f; font-size: 14px; margin-top: 6px; margin-bottom: 6px; overflow: hidden; font-weight: normal; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px; padding: 3px 0; }');
			// hide next/prev page and random subreddit indicators
			RESUtils.addCSS('.content div.nav-buttons { display: none; } ');
			RESUtils.addCSS('.content .nav-buttons .nextprev { display: none; } ');
			switch (this.options.hideDupes.value) {
				case 'fade':
					RESUtils.addCSS('.NERdupe { opacity: 0.3; }');
					break;
				case 'hide':
					RESUtils.addCSS('.NERdupe { display: none; }');
					break;
			}
			// set the style for our little loader widget
			RESUtils.addCSS('#progressIndicator { height: 60px; 	\
					display: -webkit-flex; -webkit-align-items: center; -webkit-justify-content: center; -webkit-flex-direction: column; 	\
					display: flex; align-items: center; justify-content: center; flex-direction: column; 	\
					font-size: 14px; border: 1px solid #999; border-radius: 10px; padding: 10px; background-color: #f0f3fc; cursor: pointer; } ');
			RESUtils.addCSS('#progressIndicator h2 { margin-bottom: .5em; }');
			RESUtils.addCSS('#progressIndicator .gearIcon { margin-left: 1em; }');
			RESUtils.addCSS('#progressIndicator .RESThrobber { margin-top: 10px; margin-bottom: 0; }');
			RESUtils.addCSS('#NREMailCount { margin-left: 0; float: left; margin-top: 3px;}');
			RESUtils.addCSS('#NREPause { margin-left: 2px; width: 16px; height: 16px; float: left; cursor: pointer; }');
			RESUtils.addCSS('#NREPause::after { font-family: Batch; color: #888; display: block; width: 10px; height: 10px; padding: 0 2px 4px; margin: 2px; border: 1px solid #888; border-radius: 50%; }');
			RESUtils.addCSS('#NREPause::after, #NREPause.paused.reversePause::after { content: "\\F16C"; }');
			RESUtils.addCSS('#NREPause.paused::after, #NREPause.reversePause::after { content: "\\F16B"; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// modified from a contribution by Peter Siewert, thanks Peter!
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

				if (this.options.returnToPrevPage.value) {
					this.returnToPrevPageCheck(location.hash);
				}

				// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
				if (this.options.autoLoad.value && nextLink) {
					window.addEventListener('scroll',
						RESUtils.debounce.bind(RESUtils, 'scroll.neverEndingReddit', 300, modules['neverEndingReddit'].handleScroll),
						false);
				}
			}
			// check if the user has new mail...
			this.NREPause = RESUtils.createElementWithID('div', 'NREPause');
			this.NREPause.setAttribute('title', 'Pause / Restart Never Ending Reddit');
			if (this.options.reversePauseIcon.value) this.NREPause.classList.add('reversePause');
			this.isPaused = !!RESStorage.getItem('RESmodules.neverEndingReddit.isPaused');
			if (this.isPaused) this.NREPause.classList.add('paused');
			this.NREPause.addEventListener('click', modules['neverEndingReddit'].togglePause, false);
			modules['floater'].addElement(this.NREPause);

			if (this.options.showServerInfo.value) {
				RESUtils.addCSS('	\
					.debuginfo { position: fixed; bottom: 5px; right: 5px; }	\
					.debuginfo { background: rgba(255,255,255,0.3); }	\
					.debuginfo:hover { background: rgba(255,255,255,0.8); }	\
					.res-nightmode .debuginfo { background: rgba(30,30,30,0.5); color: #ccc; }	\
					.res-nightmode .debuginfo:hover { background: rgba(30,30,30,0.8); }	\
					');
			}
		}
	},
	pageMarkers: [],
	pageURLs: [],
	togglePause: function() {
		modules['neverEndingReddit'].isPaused = !modules['neverEndingReddit'].isPaused;
		if (modules['neverEndingReddit'].isPaused) {
			RESStorage.setItem('RESmodules.neverEndingReddit.isPaused', modules['neverEndingReddit'].isPaused);
		} else {
			RESStorage.removeItem('RESmodules.neverEndingReddit.isPaused');
		}
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
	},
	handleScroll: function(e) {
		if (modules['settingsConsole'].isOpen) { // avoid console to close when scrolling
			return;
		}
		var thisPageNum = 1,
			thisMarker, i, len,
			thisXY, thisPageType;

		for (i = 0, len = modules['neverEndingReddit'].pageMarkers.length; i < len; i++) {
			thisXY = RESUtils.getXYpos(modules['neverEndingReddit'].pageMarkers[i]);
			if (thisXY.y < window.pageYOffset) {
				thisMarker = modules['neverEndingReddit'].pageMarkers[i];
				thisPageNum = thisMarker.getAttribute('id').replace('page-', '');
				modules['neverEndingReddit'].currPage = thisPageNum;
				if (thisMarker) {
					thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
					RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.' + thisPageType, thisMarker.getAttribute('url'));
				}
			} else {
				break;
			}
		}
		thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
		if (thisPageNum !== sessionStorage.NERpage) {
			if (thisPageNum > 1) {
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
		if (!modules['neverEndingReddit'].fromBackButton && modules['neverEndingReddit'].options.returnToPrevPage.value) {
			for (i = 0, len = modules['neverEndingReddit'].allLinks.length; i < len; i++) {
				if (RESUtils.elementInViewport(modules['neverEndingReddit'].allLinks[i])) {
					var thisClassString = modules['neverEndingReddit'].allLinks[i].getAttribute('class'),
						thisClass = thisClassString.match(/id-t[\d]_[\w]+/),
						thisID;

					if (thisClass) {
						thisID = thisClass[0];
						thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
						RESStorage.setItem('RESmodules.neverEndingReddit.lastVisibleIndex.' + thisPageType, thisID);
						break;
					}
				}
			}
		}
		if (RESUtils.elementInViewport(modules['neverEndingReddit'].progressIndicator) && !modules['neverEndingReddit'].fromBackButton) {
			if (!modules['neverEndingReddit'].isPaused) {
				modules['neverEndingReddit'].loadNewPage();
				modules['neverEndingReddit'].pauseAfter(thisPageNum);
			}
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
			this.NREMail.setAttribute('href', modules['orangered'].getInboxLink(true));
			this.NREMail.setAttribute('title', 'new mail!');
			this.NREMail.classList.add('havemail');
			modules['orangered'].showUnreadCount();
		} else {
			modules['neverEndingReddit'].hasNewMail = false;
			this.NREMail.classList.add('nohavemail');
			this.NREMail.setAttribute('href', modules['orangered'].getInboxLink(false));
			this.NREMail.setAttribute('title', 'no new mail');
			this.NREMail.classList.remove('havemail');
			modules['orangered'].setUnreadCount(0);
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
		};

		if (!(links.next || links.prev)) links = false;

		return links;
	},
	setWidgetActionText: function() {
		$(this.progressIndicator).empty();
		$('<h2>Never Ending Reddit</h2>')
			.appendTo(this.progressIndicator)
			.append(modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', null, ' ', 'gearIcon'));

		var text = 'Click to load the next page';
		if (this.options.autoLoad.value && !this.isPaused) {
			text = 'scroll or click to load the next page';
		} else if (this.options.autoLoad.value && this.isPaused) {
			text = 'click to load the next page; or click the "pause" button in the top right corner';
		}

		$('<p class="NERWidgetText" />')
			.text(text)
			.appendTo(this.progressIndicator);

		var nextpage = $('<a id="NERStaticLink">or open next page</a>')
			.attr('href', this.nextPageURL);
		$('<p class="NERWidgetText" />').append(nextpage)
			.append('&nbsp;(and clear Never-Ending stream)')
			.appendTo(this.progressIndicator);
	},
	loadNewPage: function(fromBackButton, reload) {
		var me = modules['neverEndingReddit'];
		if (!me.isLoading) {
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
			$(me.progressIndicator).html('<span class="NERWidgetText">Loading next page...</span><span class="RESThrobber"></span>');
			// as a sanity check, which should NEVER register true, we'll make sure me.nextPageURL is on the same domain we're browsing...
			if (me.nextPageURL && me.nextPageURL.indexOf(location.hostname) === -1) {
				console.log('Next page URL mismatch. Something strange may be afoot.');
				me.isLoading = false;
				return false;
			}
			RESUtils.runtime.ajax({
				method: 'GET',
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
							newHTML = stMultiCheck[1];
						}
						newHTML.setAttribute('ID', 'siteTable-' + modules['neverEndingReddit'].currPage + 1);
						firstLen = $('body').find('.link:last .rank').text().length;
						lastLen = $(newHTML).find('.link:last .rank').text().length;
						if (lastLen > firstLen) {
							lastLen = (lastLen * 1.1).toFixed(1);
							RESUtils.addCSS('body.res > .content .link .rank { width: ' + lastLen + 'ex; }');
						}
						modules['neverEndingReddit'].duplicateCheck(newHTML);
						// check for new mail
						modules['orangered'].updateFromPage(tempDiv);

						// get the new nextLink value for the next page...
						var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks(tempDiv);
						if (nextPrevLinks) {
							if (isNaN(modules['neverEndingReddit'].currPage)) modules['neverEndingReddit'].currPage = 1;
							if (!fromBackButton) modules['neverEndingReddit'].currPage++;
							if ((!(modules['neverEndingReddit'].fromBackButton)) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
								var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
								RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.' + thisPageType, modules['neverEndingReddit'].nextPageURL);
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
								pageMarker.setAttribute('url', me.nextPageURL);
								if (nextLink.getAttribute('rel').indexOf('prev') !== -1) {
									// remove the progress indicator from the DOM, it needs to go away.
									modules['neverEndingReddit'].progressIndicator.style.display = 'none';
									var endOfReddit = RESUtils.createElementWithID('div', 'endOfReddit');
									$(endOfReddit).text('You\'ve reached the last page available.  There are no more pages to load.');
									modules['neverEndingReddit'].siteTable.appendChild(endOfReddit);
									window.removeEventListener('scroll', modules['neverEndingReddit'].handleScroll, false);
								} else {
									modules['neverEndingReddit'].nextPageURL = nextLink.getAttribute('href');
									modules['neverEndingReddit'].attachLoaderWidget();
								}
							}
							modules['neverEndingReddit'].allLinks = document.body.querySelectorAll('#siteTable div.thing');
							if ((fromBackButton) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
								// TODO: it'd be great to figure out a better way than a timeout, but this
								// has considerably helped the accuracy of RES's ability to return you to where
								// you left off.
								setTimeout(modules['neverEndingReddit'].scrollToLastElement, 4000, newHTML);
							}

							// If we're on the reddit-browsing page (/reddits or /subreddits), add +shortcut and -shortcut buttons...
							if (/^https?:\/\/www\.reddit\.com\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.href)) {
								modules['subredditManager'].browsingReddits();
							}
						}

						if (!(nextPrevLinks && nextPrevLinks.next)) {
							var noresults = tempDiv.querySelector('#noresults');
							var noresultsfound = (noresults !== null);
							modules['neverEndingReddit'].NERFail(noresultsfound);
						}

						var e = document.createEvent('Events');
						e.initEvent('neverEndingLoad', true, true);
						window.dispatchEvent(e);
					}
				},
				onerror: function(err) {
					modules['neverEndingReddit'].NERFail();
				}
			});
		}
	},
	scrollToLastElement: function(newHTML) {
		modules['neverEndingReddit'].modalWidget.style.display = 'none';
		modules['neverEndingReddit'].modalContent.style.display = 'none';
		var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
		var lastTopScrolledID = RESStorage.getItem('RESmodules.neverEndingReddit.lastVisibleIndex.' + thisPageType);
		var lastTopScrolledEle = document.body.querySelector('.' + lastTopScrolledID);
		if (!lastTopScrolledEle) {
			lastTopScrolledEle = newHTML.querySelector('#siteTable div.thing');
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
				<a target="_blank" href="/r/Enhancement/comments/s72xt/never_ending_reddit_and_reddit_barfing_explained/">(Why not?)</a>	\
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
	}
};
