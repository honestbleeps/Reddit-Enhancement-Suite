addModule('betteReddit', function(module, moduleID) {
	module.moduleName = 'betteReddit';
	module.category = ['Appearance'];
	module.description = 'Adds a number of interface enhancements to Reddit, such as "full comments" links, the ability to unhide accidentally hidden posts, and more';
	module.options = {
		fullCommentsLink: {
			type: 'boolean',
			value: true,
			description: 'Add "full comments" link to comment replies, etc.'
		},
		fullCommentsText: {
			type: 'text',
			value: 'full comments',
			description: 'Text of full comments link.',
			advanced: true,
			dependsOn: 'fullCommentsLink'
		},
		commentsLinksNewTabs: {
			type: 'boolean',
			value: false,
			description: 'Open links found in comments in a new tab.'
		},
		fixHideLinks: {
			type: 'boolean',
			value: true,
			description: 'Changes "hide" links to read as "hide" or "unhide" depending on the hide state. Also adds a 5 second delay prior to hiding the link.'
		},
		videoTimes: {
			type: 'boolean',
			value: true,
			description: 'Show lengths of videos when possible',
			advanced: true
		},
		videoUploaded: {
			type: 'boolean',
			value: false,
			description: 'Show upload date of videos when possible',
			advanced: true
		},
		videoViewed: {
			type: 'boolean',
			value: false,
			description: 'Show number of views for a video when possible',
			advanced: true
		},
		pinHeader: {
			type: 'enum',
			values: [{
				name: 'None',
				value: 'none'
			}, {
				name: 'Subreddit Bar only',
				value: 'sub'
			}, {
				name: 'User Bar',
				value: 'userbar'
			}, {
				name: 'Subreddit Bar and User bar',
				value: 'subanduser'
			}, {
				name: 'Full Header',
				value: 'header'
			}],
			value: 'none',
			description: 'Pin the subreddit bar, user menu, or header to top, floating down as you scroll.',
			bodyClass: 'pinHeader'
		},
		/*turboSelfText: {
			type: 'boolean',
			value: true,
			description: 'Preload selftext data to make selftext expandos faster (preloads after first expando)',
			advanced: true
		},*/
		showLastEditedTimestamp: {
			type: 'boolean',
			value: true,
			description: 'Show the time that a text post/comment was edited, without having to hover the timestamp.',
			bodyClass: true
		},
		scoreHiddenTimeLeft: {
			type: 'boolean',
			value: true,
			description: 'When hovering [score hidden] show time left instead of hide duration.'
		},
		showTimestampPosts: {
			type: 'boolean',
			value: false,
			description: 'Show the precise date (Sun Nov 16 20:14:56 2014 UTC) instead of a relative date (7 days ago), for posts.',
			bodyClass: true
		},
		showTimestampComments: {
			type: 'boolean',
			value: false,
			description: 'Show the precise date for comments / messages.',
			bodyClass: true
		},
		showTimestampSidebar: {
			type: 'boolean',
			value: false,
			description: 'Show the precise date in the sidebar.',
			bodyClass: true
		},
		showTimestampWiki: {
			type: 'boolean',
			value: false,
			description: 'Show the precise date in the wiki.',
			bodyClass: true
		},
		showTimestampModerationLog: {
			type: 'boolean',
			value: false,
			description: 'Show the precise date in the moderation log (/r/mod/about/log).',
			bodyClass: true
		},
		restoreSavedTab: {
			type: 'boolean',
			value: false,
			description: 'The saved tab is now located in the multireddit sidebar. This will restore a "saved" link to the header (next to the "hot", "new", etc. tabs).'
		},
		doNoCtrlF: {
			type: 'boolean',
			value: false,
			description: 'Modify reddit\'s comment/link buttons ("perma-link source save...") such that they don\'t show up in searches. Disabled by default due to a slight performance impact.'
		},
		truncateLongLinks: {
			type: 'boolean',
			value: false,
			description: 'Truncates long links (greater than 1 line) with an ellipsis.',
			bodyClass: true
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if ((RESUtils.pageType() === 'comments') && (this.options.commentsLinksNewTabs.value)) {
				commentsLinksNewTabs();
				RESUtils.watchForElement('newComments', commentsLinksNewTabs);
			}
			// if (((RESUtils.pageType() === 'inbox') || (RESUtils.pageType() === 'profile') || ((RESUtils.pageType() === 'comments') && (RESUtils.currentSubreddit('friends')))) && (this.options.fullCommentsLink.value)) {
			// removed profile pages since Reddit does this natively now for those...
			if ((RESUtils.pageType() === 'inbox') && (this.options.fullCommentsLink.value)) {
				fullComments();
				RESUtils.watchForElement('siteTable', fullComments);
			}

			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixHideLinks.value)) {
				fixHideLinks();
				RESUtils.watchForElement('siteTable', fixHideLinks);
			}
			// temporarily disabling turboselftext because it seems to cause occasional issues
			// with video autoplay (only on first, non-turbo expando)
			//
			// if ((this.options.turboSelfText.value) && (RESUtils.pageType() === 'linklist')) {
			//     setUpTurboSelfText();
			// }

			if (this.options.doNoCtrlF.value) {
				if ((RESUtils.pageType() === 'inbox') || (RESUtils.pageType() === 'profile') || (RESUtils.pageType() === 'linklist')) {
					applyNoCtrlF(document);
					RESUtils.watchForElement('siteTable', applyNoCtrlF);
				} else if (RESUtils.pageType() === 'comments') {
					applyNoCtrlF(document);
					RESUtils.watchForElement('newComments', applyNoCtrlF);
				}
			}

			if ((module.options.scoreHiddenTimeLeft.value) && (RESUtils.pageType() === 'comments')) {
				$('.tagline').on('mouseenter', 'span:contains([)', function() {
					var timeNode;
					if (this.nextSibling && ( timeNode = this.nextSibling.nextSibling) && this.nextSibling.nextSibling.tagName === 'TIME') { // avoid flair with [
						if (this.getAttribute('title').indexOf('revealed') === -1) {
							var scoreHiddenDuration = parseInt(this.getAttribute('title').match(/[0-9]+/)[0], 10);
							var postTime = new Date(timeNode.getAttribute('datetime')).getTime();
							var minutesLeft = Math.ceil((postTime + scoreHiddenDuration * 60000 - new Date().getTime()) / 60000);
							this.setAttribute('title', 'score will be revealed in ' + minutesLeft + ' minute' + (minutesLeft > 1 ? 's' : ''));
						}
					}
				});
			}
			if (this.options.showTimestampSidebar.value) {
				var subredditAge = document.body.querySelector('.side .age');
				if (subredditAge) {
					subredditAge.firstChild.data = 'a community since ';
				}
			}
			if ((module.options.restoreSavedTab.value) && (RESUtils.loggedInUser() !== null) && document.querySelector('.with-listing-chooser:not(.profile-page)')) {
				restoreSavedTab();
			}
			if ((this.options.videoTimes.value) && ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments'))) {
				getVideoTimes();
				RESUtils.watchForElement('siteTable', getVideoTimes);
			}
			switch (this.options.pinHeader.value) {
				case 'header':
					pinHeader();
					break;
				case 'sub':
					pinSubredditBar();
					break;
				case 'subanduser':
					pinSubredditBar();
					pinUserBar();
					break;
				case 'userbar':
					pinUserBar();
					break;
				default:
					break;
			}
		}
	};

	function commentsLinksNewTabs(ele) {
		ele = ele || document.body;
		var links = ele.querySelectorAll('.thing div.md a');
		Array.prototype.slice.call(links).forEach(function(link) {
			link.target = '_blank';
		});
	}

	// the following is only used by turboSelfText which is disabled.
	/*var selfTextHash = {};
	function setUpTurboSelfText() {
		// TODO: Turbo selftext seems a little wonky on NER pages
		$('body').on('click', '.expando-button.selftext:not(".twitter"):not(.toggleImage)', showSelfText);
		$('#siteTable').data('jsonURL', location.href + '.json');

		RESUtils.watchForElement('siteTable', setNextSelftextURL);
	}

	function setNextSelftextURL(ele) {
		if (modules['neverEndingReddit'].nextPageURL) {
			var jsonURL = modules['neverEndingReddit'].nextPageURL.replace('/?', '/.json?');
			$(ele).data('jsonURL', jsonURL);
		}
	}

	function showSelfText(event) {
		var thisID = $(event.target).parent().parent().data('fullname');
		if (typeof selfTextHash[thisID] === 'undefined') {
			// we haven't gotten JSON data for this set of links yet... get it, then replace the click listeners with our own...
			var jsonURL = $(event.target).closest('.sitetable.linklisting').data('jsonURL');
			getSelfTextData(jsonURL);
		} else {
			if (!$(event.target).hasClass('expanded')) {
				// the duplicate classes here unfortunately have to exist due to Reddit clobbering things with .collapsed
				// and no real elegant way that I've thought of to fix the fact that selfText expandos still have that class.
				$(event.target).removeClass('collapsed collapsedExpando');
				$(event.target).addClass('expanded');
				$(event.target).parent().find('.expando').html(
					'<form class="usertext"><div class="usertext-body">' +
					$('<div/>').html(selfTextHash[thisID]).text() +
					'</div></form>'
				).show();
			} else {
				$(event.target).removeClass('expanded');
				$(event.target).addClass('collapsedExpando');
				$(event.target).addClass('collapsed');
				$(event.target).parent().find('.expando').hide();
			}

		}
	}

	var gettingSelfTextData;

	function getSelfTextData(href) {
		if (!gettingSelfTextData) {
			gettingSelfTextData = true;
			$.getJSON(href, applyTurboSelfText);
		}
	}

	function applyTurboSelfText(data) {
		var linkList = data.data.children;

		gettingSelfTextData = undefined;
		linkList.forEach(function(ele, i) {
			var thisID = ele.data.name;
			if (i === 0) {
				var thisSiteTable = $('.id-' + thisID).closest('.sitetable.linklisting'),
					newEle;

				// clone the selftext expando button without events, so as to remove
				// conflicting event listeners.
				$(thisSiteTable).find('.expando-button.selftext:not(".twitter"):not(.toggleImage)').each(function() {
					this.removeAttribute('onclick');
					newEle = this.cloneNode(true);
					this.parentNode.replaceChild(newEle, this);
				});
			}
			selfTextHash[thisID] = ele.data.selftext_html;
		});
	}*/

	var deprecateFullComments;

	function fullComments(ele) {
		if (deprecateFullComments) {
			return;
		}
		var root = ele || document,
			entries = root.querySelectorAll('#siteTable .entry'),
			linkEle, thisCommentsLink, thisCommentsSplit, linkList, depTest,
			fullCommentsLinkContainer, fullCommentsLink;

		// check if reddit's new native full comments link exists, and if so, deprecate
		// so we no longer run this function.
		if (entries && entries[0]) {
			depTest = entries[0].querySelector('a.full-comments');
		}
		if (depTest) {
			deprecateFullComments = true;
			return;
		}

		Array.prototype.slice.call(entries).forEach(function(entry) {
			linkEle = entry.querySelector('a.bylink');
			thisCommentsLink = '';
			if ((typeof linkEle !== 'undefined') && (linkEle !== null)) {
				thisCommentsLink = linkEle.getAttribute('href');
			}
			if (thisCommentsLink !== '') {
				thisCommentsSplit = thisCommentsLink.split('/');
				thisCommentsSplit.pop();
				thisCommentsLink = thisCommentsSplit.join('/');
				linkList = entry.querySelector('.flat-list');
				fullCommentsLinkContainer = document.createElement('li');
				fullCommentsLink = RESUtils.createElement('a', null, 'redditFullComments');
				fullCommentsLink.href = thisCommentsLink;
				fullCommentsLink.textContent = module.options.fullCommentsText.value;
				fullCommentsLinkContainer.appendChild(fullCommentsLink);
				linkList.appendChild(fullCommentsLinkContainer);
			}
		});
	}

	function fixHideLinks(ele) {
		var root = ele || document,
			hideLinks = root.querySelectorAll('form.hide-button > span > a'),
			unhideLinks = document.querySelectorAll('form.unhide-button > span > a');

		Array.prototype.slice.call(hideLinks).forEach(function(link) {
			var newLink = RESUtils.createElement('a', null, null, 'hide');
			newLink.setAttribute('action', 'hide');
			newLink.setAttribute('href', '#');
			newLink.addEventListener('click', hideLinkEventHandler, false);
			var parent = link.parentNode;
			parent.removeChild(link);
			parent.appendChild(newLink);
		});

		Array.prototype.slice.call(unhideLinks).forEach(function(link) {
			var newLink = RESUtils.createElement('a', null, null, 'unhide');
			newLink.setAttribute('action', 'unhide');
			newLink.setAttribute('href', '#');
			newLink.addEventListener('click', hideLinkEventHandler, false);
			var parent = link.parentNode;
			parent.removeChild(link);
			parent.appendChild(newLink);
		});
	}

	function hideLinkEventHandler(e) {
		e.preventDefault();
		hideLink(e.target);
	}

	var modhash, hideTimer;

	function hideLink(clickedLink) {
		if (clickedLink.getAttribute('action') === 'unhide') {
			$(clickedLink).text('unhiding...');
		} else {
			$(clickedLink).text('hiding...');
		}
		if (modhash) {
			var action = clickedLink.getAttribute('action'),
				parentThing = clickedLink.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode,
				idRe = /id-([\w]+)/i,
				getLinkid = idRe.exec(parentThing.getAttribute('class')),
				linkid = getLinkid[1],
				executed, apiURL, params;

			if (action === 'unhide') {
				executed = 'unhidden';
				apiURL = location.protocol + '//' + location.hostname + '/api/unhide';
			} else {
				executed = 'hidden';
				apiURL = location.protocol + '//' + location.hostname + '/api/hide';
			}
			params = 'id=' + linkid + '&executed=' + executed + '&uh=' + modhash + '&renderstyle=html';

			RESEnvironment.ajax({
				method: 'POST',
				url: apiURL,
				data: params,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				onload: function(response) {
					if (response.status === 200) {
						if (clickedLink.getAttribute('action') === 'unhide') {
							$(clickedLink).text('hide');
							clickedLink.setAttribute('action', 'hide');
							if (typeof hideTimer !== 'undefined') {
								clearTimeout(hideTimer);
							}
						} else {
							$(clickedLink).text('unhide');
							clickedLink.setAttribute('action', 'unhide');
							hideTimer = setTimeout(function() {
								hideFader(clickedLink);
							}, 5000);
						}
					} else {
						modhash = undefined;
						alert('Sorry, there was an error trying to ' + clickedLink.getAttribute('action') + ' your submission. Try clicking again.');
					}
				}
			});
		} else {
			RESEnvironment.ajax({
				method: 'GET',
				url: location.protocol + '//' + location.hostname + '/api/me.json?app=res',
				onload: function(response) {
					var data = safeJSON.parse(response.responseText);
					if (typeof data.data === 'undefined') {
						alert('Sorry, there was an error trying to ' + clickedLink.getAttribute('action') + ' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
					} else if ((typeof data.data.modhash !== 'undefined') && (data.data.modhash)) {
						modhash = data.data.modhash;
						hideLink(clickedLink);
					}
				}
			});
		}
	}

	function hideFader(ele) {
		var parentThing = ele.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
		RESUtils.fadeElementOut(parentThing, 0.3);
	}

	var youtubeLinkIDs, youtubeLinkRefs;

	function getVideoTimes(obj) {
		obj = obj || document;
		var youtubeLinks = obj.querySelectorAll('a.title[href*="youtube.com"], a.title[href*="youtu.be"]'),
			titleHasTimeRegex = /[\[|\(][0-9]*:[0-9]*[\]|\)]/;
		if (youtubeLinks) {
			youtubeLinks = Array.prototype.slice.call(youtubeLinks).filter(function(link) {
				return !titleHasTimeRegex.test(link.textContent);
			});
			var getYoutubeIDRegex = /\/?[\&|\?]?v\/?=?([\w\-]{11})&?/i,
				getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i,
				getYoutubeStartTimeRegex = /\[[\d]+:[\d]+\]/i,
				tempIDs = [];
			youtubeLinkIDs = {};
			youtubeLinkRefs = [];
			youtubeLinks.forEach(function(link) {
				var match = getYoutubeIDRegex.exec(link.getAttribute('href')),
					shortened = /youtu\.be/i,
					isShortened = shortened.exec(link.getAttribute('href')),
					thisYTID;
				if (isShortened) {
					var smatch = getShortenedYoutubeIDRegex.exec(link.getAttribute('href'));
					if (smatch) {
						thisYTID = '"' + smatch[1] + '"';
						youtubeLinkIDs[thisYTID] = link;
						youtubeLinkRefs.push([thisYTID, link]);
					}
				} else if (match) {
					// add quotes so URL creation is doable with just a join...
					thisYTID = '"' + match[1] + '"';
					youtubeLinkIDs[thisYTID] = link;
					youtubeLinkRefs.push([thisYTID, link]);
				}
				var timeMatch = getYoutubeStartTimeRegex.exec(link.getAttribute('href'));
				var titleMatch = titleHasTimeRegex.test(link.textContent);
				if (timeMatch && !titleMatch) {
					link.textContent += ' (@' + timeMatch[1] + ')';
				}
			});
			for (var id in youtubeLinkIDs) {
				// for security since these will become URL parameters, encodeURIComponent:
				tempIDs.push(encodeURIComponent(id));
			}
			youtubeLinkIDs = tempIDs;
			getVideoJSON();
		}
	}

	function getVideoJSON() {
		var thisBatch = youtubeLinkIDs.splice(0, 8);
		if (thisBatch.length) {
			var thisIDString = thisBatch.join('%7C');
			// var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&fields=entry(id,media:group(yt:duration))&alt=json';

			// SECURITY NOTE:
			// youtubeLinkIDs list is already run through encodeURIComponent
			// so we don't want to double-run that in this request
			var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q=' + thisIDString + '&v=2&fields=entry(id,title,media:group(yt:duration,yt:videoid,yt:uploaded),yt:statistics)&alt=json';
			RESEnvironment.ajax({
				method: 'GET',
				url: jsonURL,
				onload: function(response) {
					var data = safeJSON.parse(response.responseText, null, true);
					if ((typeof data.feed !== 'undefined') && (typeof data.feed.entry !== 'undefined')) {
						data.feed.entry.forEach(function(entry) {
							var thisYTID = '"' + entry['media$group']['yt$videoid']['$t'] + '"',
								thisTotalSecs = entry['media$group']['yt$duration']['seconds'],
								thisTitle = entry['title']['$t'],
								thisMins = Math.floor(thisTotalSecs / 60),
								thisSecs = (thisTotalSecs % 60),
								thisUploaded, thisViewed, thisTime;

							if (thisSecs < 10) {
								thisSecs = '0' + thisSecs;
							}
							thisTime = ' - [' + thisMins + ':' + thisSecs + ']';
							if (module.options.videoUploaded.value) {
								thisUploaded = entry['media$group']['yt$uploaded']['$t'];
								thisUploaded = thisUploaded.match(/[^T]*/);
								thisTime += '[' + thisUploaded + ']';
							}
							if (module.options.videoViewed.value) {
								thisViewed = entry['yt$statistics']['viewCount'];
								thisTime += '[Views: ' + thisViewed + ']';
							}
							youtubeLinkRefs.forEach(function(linkRef) {
								if (linkRef[0] === thisYTID) {
									linkRef[1].textContent += ' ' + thisTime;
									linkRef[1].setAttribute('title', 'YouTube title: ' + thisTitle);
								}
							});
						});
						// wait a bit, make another request...
						setTimeout(getVideoJSON, 500);
					}
				}
			});
		}
	}

	function pinSubredditBar() {
		// Make the subreddit bar at the top of the page a fixed element
		// The subreddit manager code changes the document's structure
		var sm = modules['subredditManager'].isEnabled();

		var sb = document.getElementById('sr-header-area');
		if (sb === null) {
			return; // reddit is under heavy load
		}
		var header = document.getElementById('header');

		// add a dummy <div> inside the header to replace the subreddit bar (for spacing)
		var spacer = document.createElement('div');
		// null parameter is necessary for FF3.6 compatibility.
		spacer.style.paddingTop = window.getComputedStyle(sb, null).paddingTop;
		spacer.style.paddingBottom = window.getComputedStyle(sb, null).paddingBottom;

		// HACK: for some reason, if the SM is enabled, the SB gets squeezed horizontally,
		//       and takes up three rows of vertical space (even at low horizontal resolution).
		if (sm) {
			spacer.style.height = (parseInt(window.getComputedStyle(sb, null).height, 10) / 3 - 3) + 'px';
		} else {
			spacer.style.height = window.getComputedStyle(sb, null).height;
		}

		//window.setTimeout(function(){
		// add the spacer; take the subreddit bar out of the header and put it above
		header.insertBefore(spacer, sb);
		document.body.insertBefore(sb, header);

		// make it fixed
		// RESUtils.addCSS('div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; box-shadow: 0 2px 2px #AAA;}');
		// something changed on Reddit on 1/31/2012 that made this header-bottom-left margin break subreddit stylesheets... commenting out seems to fix it?
		// and now later on 1/31 they've changed it back and I need to add this line back in...
		RESUtils.addCSS('#header-bottom-left { margin-top: 19px; }');
		RESUtils.addCSS('div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; }');
		pinCommonElements(sm);
	}

	function pinUserBar() {
		// Make the user bar at the top of the page a fixed element
		var userBarElement = document.getElementById('header-bottom-right');
		var thisHeight = $('#header-bottom-right').height();
		RESUtils.addCSS('#header-bottom-right:hover { opacity: 1 !important;  }');
		RESUtils.addCSS('#header-bottom-right { height: ' + parseInt(thisHeight + 1, 10) + 'px; }');
		// make the account switcher menu fixed
		window.addEventListener('scroll', RESUtils.debounce.bind(RESUtils, 'scroll.betteReddit', 300, handleScroll, userBarElement), false);
		pinCommonElements();
	}

	function handleScroll(userBarElement, e) {
		if (RESUtils.elementInViewport(userBarElement)) {
			userBarElement.setAttribute('style', '');
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: absolute;');
			}
		} else if (module.options.pinHeader.value === 'subanduser') {
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: fixed;');
			}
			userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 19px !important; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		} else {
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: fixed;');
			}
			userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 0 !important; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		}
	}

	function pinHeader() {
		// Makes the Full header a fixed element

		// the subreddit manager code changes the document's structure
		var sm = modules['subredditManager'].isEnabled();

		var header = document.getElementById('header');
		if (header === null) {
			return; // reddit is under heavy load
		}

		// add a dummy <div> to the document for spacing
		var spacer = document.createElement('div');
		spacer.id = 'RESPinnedHeaderSpacer';

		// without the next line, the subreddit manager would make the subreddit bar three lines tall and very narrow
		RESUtils.addCSS('#sr-header-area {left: 0; right: 0;}');
		spacer.style.height = $('#header').outerHeight() + 'px';

		// insert the spacer
		document.body.insertBefore(spacer, header.nextSibling);

		// make the header fixed
		RESUtils.addCSS('#header, #RESAccountSwitcherDropdown {position:fixed;}');
		// RESUtils.addCSS('#header {left: 0; right: 0; box-shadow: 0 2px 2px #AAA;}');
		RESUtils.addCSS('#header {left: 0; right: 0; }');
		var headerHeight = $('#header').height() + 15;
		RESUtils.addCSS('#RESNotifications { top: ' + headerHeight + 'px } ');
		pinCommonElements(sm);

		// TODO Needs testing
		// Sometimes this gets executed before the subreddit logo has finished loading. When that
		// happens, the spacer gets created too short, so when the SR logo finally loads, the header
		// grows and overlaps the top of the page, potentially obscuring the first link. This checks
		// to see if the image is finished loading. If it is, then the spacer's height is set. Otherwise,
		// it pauses, then loops.
		// added a check that this element exists, so it doesn't error out RES.
		if (document.getElementById('header-img') && (!document.getElementById('header-img').complete)) {
			setTimeout(function() {
				if (document.getElementById('header-img').complete) {
					// null parameter is necessary for FF3.6 compatibility.
					document.getElementById('RESPinnedHeaderSpacer').style.height = window.getComputedStyle(document.getElementById('header'), null).height;
				} else {
					setTimeout(arguments.callee, 10);
				}
			}, 10);
		}
	}

	function pinCommonElements(sm) {
		// pin the elements common to both pinHeader() and pinSubredditBar()
		if (sm) {
			// RES's subreddit menu
			RESUtils.addCSS('#RESSubredditGroupDropdown, #srList, #RESShortcutsAddFormContainer, #editShortcutDialog {position: fixed !important;}');
		} else {
			RESUtils.addCSS('#sr-more-link: {position: fixed;}');
		}
	}

	function restoreSavedTab() {
		var tabmenu = document.querySelector('#header .tabmenu');

		if (!tabmenu) {
			return;
		}

		var	li = document.createElement('li'),
			a = document.createElement('a'),
			user = RESUtils.loggedInUser();
		a.textContent = 'saved';
		a.href = '/user/' + user + '/saved/';
		li.appendChild(a);
		tabmenu.appendChild(li);
	}

	function applyNoCtrlF(searchIn) {
		var elems = searchIn.querySelectorAll('ul.flat-list.buttons li a:not(.noCtrlF)');
		RESUtils.forEachChunked(elems, 25, 100, function(e) {
			e.classList.add('noCtrlF');
			e.setAttribute('data-text', e.textContent);
			e.textContent = '';
		});
	}
});
