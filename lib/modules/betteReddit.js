// betteReddit
modules['betteReddit'] = {
	moduleID: 'betteReddit',
	moduleName: 'betteReddit',
	category: 'UI',
	options: {
		fullCommentsLink: {
			type: 'boolean',
			value: true,
			description: 'add "full comments" link to comment replies, etc'
		},
		fullCommentsText: {
			type: 'text',
			value: 'full comments',
			description: 'text of full comments link'
		},
		commentsLinksNewTabs: {
			type: 'boolean',
			value: false,
			description: 'Open links found in comments in a new tab'
		},
		fixSaveLinks: {
			type: 'boolean',
			value: true,
			description: 'Make "save" links change to "unsave" links when clicked'
		},
		fixHideLinks: {
			type: 'boolean',
			value: true,
			description: 'Make "hide" links change to "unhide" links when clicked, and provide a 5 second delay prior to hiding the link'
		},
		searchSubredditByDefault: {
			type: 'boolean',
			value: true,
			description: 'Search the current subreddit by default when using the search box, instead of all of reddit.'
		},
		showUnreadCount: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count next to orangered?'
		},
		showUnreadCountInTitle: {
			type: 'boolean',
			value: false,
			description: 'Show unread message count in page/tab title?'
		},
		showUnreadCountInFavicon: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count in favicon?'
		},
		unreadLinksToInbox: {
			type: 'boolean',
			value: false,
			description: 'Always go to the inbox, not unread messages, when clicking on orangered'
		},
		videoTimes: {
			type: 'boolean',
			value: true,
			description: 'Show lengths of videos when possible'
		},
		videoUploaded: {
			type: 'boolean',
			value: false,
			description: 'Show upload date of videos when possible'
		},
		videoViewed: {
			type: 'boolean',
			value: false,
			description: 'Show number of views for a video when possible'
		},
		toolbarFix: {
			type: 'boolean',
			value: true,
			description: 'Don\'t use Reddit Toolbar when linking to sites that may not function (twitter, youtube and others)'
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
			description: 'Pin the subreddit bar or header to the top, even when you scroll.'
		},
		turboSelfText: {
			type: 'boolean',
			value: true,
			description: 'Preload selftext data to make selftext expandos faster (preloads after first expando)'
		},
		showLastEditedTimestamp: {
			type: 'boolean',
			value: true,
			description: 'Show the time that a text post/comment was edited, without having to hover the timestamp.'
		},
		restoreSavedTab: {
			type: 'boolean',
			value: false,
			description: 'The saved tab on pages with the multireddit side bar is now located in that collapsible bar. This will restore it to the header. If you have the \'Save Comments\' module enabled then you\'ll see both the links <em>and</em> comments tabs.'
		}
	},
	description: 'Adds a number of interface enhancements to Reddit, such as "full comments" links, the ability to unhide accidentally hidden posts, and more',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/.*/i
	],
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if ((this.options.toolbarFix.value) && ((RESUtils.pageType() === 'linklist') || RESUtils.pageType() === 'comments')) {
				this.toolbarFix();
			}
			if ((RESUtils.pageType() === 'comments') && (this.options.commentsLinksNewTabs.value)) {
				this.commentsLinksNewTabs();
			}
			// if (((RESUtils.pageType() === 'inbox') || (RESUtils.pageType() === 'profile') || ((RESUtils.pageType() === 'comments') && (RESUtils.currentSubreddit('friends')))) && (this.options.fullCommentsLink.value)) {
			// removed profile pages since Reddit does this natively now for those...
			if (((RESUtils.pageType() === 'inbox') || ((RESUtils.pageType() === 'comments') && (RESUtils.currentSubreddit('friends') === false))) && (this.options.fullCommentsLink.value)) {
				// RESUtils.addCSS('a.redditFullCommentsSub { font-size: 9px !important; color: #BBB !important; }');
				this.fullComments();
			}
			if ((RESUtils.pageType() === 'profile') && (location.href.split('/').indexOf(RESUtils.loggedInUser()) !== -1)) {
				this.editMyComments();
			}
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixSaveLinks.value)) {
				this.fixSaveLinks();
			}
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixHideLinks.value)) {
				this.fixHideLinks();
			}
			if ((this.options.turboSelfText.value) && (RESUtils.pageType() === 'linklist')) {
				this.setUpTurboSelfText();
			}
			if (this.options.showUnreadCountInFavicon.value) {
				var faviconDataurl = 'data:image/x-icon;base64,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';
				// remove current favicons and replace accordingly, or tinycon has a cross domain issue since the real favicon is on redditstatic.com.
				$('head link[rel="shortcut icon"], head link[rel="icon"]').attr('href', faviconDataurl);
			}
			if ((modules['betteReddit'].options.showLastEditedTimestamp.value) && ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments'))) {
				RESUtils.addCSS('.edited-timestamp[title]:after{content:" (" attr(title) ")";font-size: 90%;}');
			}
			if ((modules['betteReddit'].options.restoreSavedTab.value) && (RESUtils.loggedInUser() !== null) && document.querySelector('.with-listing-chooser:not(.profile-page)')) {
				this.restoreSavedTab();
			}
			if ((modules['betteReddit'].options.toolbarFix.value) && (RESUtils.pageType() === 'linklist')) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].toolbarFix);
			}
			if ((RESUtils.pageType() === 'inbox') && (modules['betteReddit'].options.fullCommentsLink.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fullComments);
			}
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (modules['betteReddit'].options.fixSaveLinks.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fixSaveLinks);
			}
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (modules['betteReddit'].options.fixHideLinks.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fixHideLinks);
			}
			if ((RESUtils.pageType() === 'comments') && (modules['betteReddit'].options.commentsLinksNewTabs.value)) {
				RESUtils.watchForElement('newComments', modules['betteReddit'].commentsLinksNewTabs);
			}

			if (this.options.searchSubredditByDefault.value) {
				// make sure we're not on a search results page...
				if (!/\/[r|m]\/[\w+\-]+\/search/.test(location.href.match)) {
					this.searchSubredditByDefault();
				}
			}
			if ((this.options.videoTimes.value) && ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments'))) {
				this.getVideoTimes();
				// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...

				RESUtils.watchForElement('siteTable', modules['betteReddit'].getVideoTimes);
			}
			if ((RESUtils.loggedInUser() !== null) && ((this.options.showUnreadCount.value) || (this.options.showUnreadCountInTitle.value) || (this.options.showUnreadCountInFavicon.value))) {
				// Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
				// RESUtils.addCSS('#mail { min-width: 16px !important; width: auto !important; text-indent: 18px !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				// removing text indent - on 11/14/11 reddit changed the mail sprites, so I have to change how this is handled..
				RESUtils.addCSS('#mail { top: 2px; min-width: 16px !important; width: auto !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				// RESUtils.addCSS('#mail.havemail { top: 2px !important; margin-right: 1px; }');
				RESUtils.addCSS('#mail.havemail { top: 2px !important; }');
				if ((BrowserDetect.isChrome()) || (BrowserDetect.isSafari())) {
					// I hate that I have this conditional CSS in here but I can't figure out why it's needed for webkit and screws up firefox.
					RESUtils.addCSS('#mail.havemail { top: 0; }');
				}
				this.showUnreadCount();
			}
			switch (this.options.pinHeader.value) {
				case 'header':
					this.pinHeader();
					$('body').addClass('pinHeader-header');
					break;
				case 'sub':
					this.pinSubredditBar();
					$('body').addClass('pinHeader-sub');
					break;
				case 'subanduser':
					this.pinSubredditBar();
					this.pinUserBar();
					$('body').addClass('pinHeader-subanduser');
					break;
				case 'userbar':
					this.pinUserBar();
					$('body').addClass('pinHeader-userbar');
					break;
				default:
					break;
			}
		}
	},
	commentsLinksNewTabs: function(ele) {
		ele = ele || document.body;
		var links = ele.querySelectorAll('div.md a');
		for (var i = 0, len = links.length; i < len; i++) {
			links[i].target = '_blank';
		}
	},
	setUpTurboSelfText: function() {
		// TODO: Turbo selftext seems a little wonky on NER pages
		modules['betteReddit'].selfTextHash = {};
		$('body').on('click', '.expando-button.selftext:not(".twitter"):not(.toggleImage)', modules['betteReddit'].showSelfText);
		$('#siteTable').data('jsonURL', location.href + '.json');

		RESUtils.watchForElement('siteTable', modules['betteReddit'].setNextSelftextURL);
	},
	setNextSelftextURL: function(ele) {
		if (modules['neverEndingReddit'].nextPageURL) {
			var jsonURL = modules['neverEndingReddit'].nextPageURL.replace('/?', '/.json?');
			$(ele).data('jsonURL', jsonURL);
		}
	},
	showSelfText: function(event) {
		var thisID = $(event.target).parent().parent().data('fullname');
		if (typeof modules['betteReddit'].selfTextHash[thisID] === 'undefined') {
			// we haven't gotten JSON data for this set of links yet... get it, then replace the click listeners with our own...
			var jsonURL = $(event.target).closest('.sitetable.linklisting').data('jsonURL');
			modules['betteReddit'].getSelfTextData(jsonURL);
		} else {
			if ($(event.target).hasClass('collapsed') || $(event.target).hasClass('collapsedExpando')) {
				// the duplicate classes here unfortunately have to exist due to Reddit clobbering things with .collapsed
				// and no real elegant way that I've thought of to fix the fact that selfText expandos still have that class.
				$(event.target).removeClass('collapsed collapsedExpando');
				$(event.target).addClass('expanded');
				$(event.target).parent().find('.expando').html(
					'<form class="usertext"><div class="usertext-body">' +
					$('<div/>').html(modules['betteReddit'].selfTextHash[thisID]).text() +
					'</div></form>'
				).show();
			} else {
				$(event.target).removeClass('expanded');
				$(event.target).addClass('collapsedExpando');
				$(event.target).addClass('collapsed');
				$(event.target).parent().find('.expando').hide();
			}

		}
	},
	getSelfTextData: function(href) {
		if (!modules['betteReddit'].gettingSelfTextData) {
			modules['betteReddit'].gettingSelfTextData = true;
			$.getJSON(href, modules['betteReddit'].applyTurboSelfText);
		}
	},
	applyTurboSelfText: function(data) {
		var linkList = data.data.children;

		delete modules['betteReddit'].gettingSelfTextData;
		for (var i = 0, len = linkList.length; i < len; i++) {
			var thisID = linkList[i].data.name;
			if (i === 0) {
				var thisSiteTable = $('.id-' + thisID).closest('.sitetable.linklisting');
				$(thisSiteTable).find('.expando-button.selftext').removeAttr('onclick');
			}
			modules['betteReddit'].selfTextHash[thisID] = linkList[i].data.selftext_html;
		}
	},
	getInboxLink: function(havemail) {
		if (havemail && !modules['betteReddit'].options.unreadLinksToInbox.value) {
			return '/message/unread/';
		}

		return '/message/inbox/';
	},
	showUnreadCount: function() {
		if (typeof this.mail === 'undefined') {
			this.mail = document.getElementById('mail');
			if (this.mail) {
				this.mailCount = RESUtils.createElementWithID('a', 'mailCount');
				this.mailCount.display = 'none';
				this.mailCount.setAttribute('href', this.getInboxLink(true));
				RESUtils.insertAfter(this.mail, this.mailCount);
			}
		}
		if (this.mail) {
			$(modules['betteReddit'].mail).html('');
			if (this.mail.classList.contains('havemail')) {
				this.mail.setAttribute('href', this.getInboxLink(true));
				var lastCheck = parseInt(RESStorage.getItem('RESmodules.betteReddit.msgCount.lastCheck.' + RESUtils.loggedInUser()), 10) || 0;
				var now = Date.now();
				// 300000 = 5 minutes... we don't want to annoy Reddit's servers too much with this query...
				if ((now - lastCheck) > 300000) {
					GM_xmlhttpRequest({
						method: "GET",
						url: location.protocol + '//' + location.hostname + "/message/unread/.json?mark=false&app=res",
						onload: function(response) {
							// save that we've checked in the last 5 minutes
							var now = Date.now();
							RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.' + RESUtils.loggedInUser(), now);
							var data = JSON.parse(response.responseText);
							var count = data.data.children.length;
							RESStorage.setItem('RESmodules.betteReddit.msgCount.' + RESUtils.loggedInUser(), count);
							modules['betteReddit'].setUnreadCount(count);
						}
					});
				} else {
					var count = RESStorage.getItem('RESmodules.betteReddit.msgCount.' + RESUtils.loggedInUser());
					modules['betteReddit'].setUnreadCount(count);
				}
			} else {
				// console.log('no need to get count - no new mail. resetting lastCheck');
				modules['betteReddit'].setUnreadCount(0);
				RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.' + RESUtils.loggedInUser(), 0);
			}
		}
	},
	setUnreadCount: function(count) {
		if (this.options.showUnreadCountInFavicon.value) {
			window.Tinycon.setOptions({
				fallback: false
			});
		}
		if (count > 0) {
			if (this.options.showUnreadCountInTitle.value) {
				var newTitle = '[' + count + '] ' + document.title.replace(/^\[[\d]+\]\s/, '');
				document.title = newTitle;
			}
			if (this.options.showUnreadCountInFavicon.value) {
				window.Tinycon.setBubble(count);
			}
			if (this.options.showUnreadCount.value) {
				modules['betteReddit'].mailCount.display = 'inline-block';
				modules['betteReddit'].mailCount.textContent = '[' + count + ']';
				if (modules['neverEndingReddit'].NREMailCount) {
					modules['neverEndingReddit'].NREMailCount.display = 'inline-block';
					modules['neverEndingReddit'].NREMailCount.textContent = '[' + count + ']';
				}
			}
		} else {
			var newTitle = document.title.replace(/^\[[\d]+\]\s/, '');
			document.title = newTitle;
			if (modules['betteReddit'].mailCount) {
				modules['betteReddit'].mailCount.display = 'none';
				$(modules['betteReddit'].mailCount).html('');
				if (modules['neverEndingReddit'].NREMailCount) {
					modules['neverEndingReddit'].NREMailCount.display = 'none';
					$(modules['neverEndingReddit'].NREMailCount).html('');
				}
			}
			if (this.options.showUnreadCountInFavicon.value) {
				window.Tinycon.setBubble(0);
			}
		}
	},
	toolbarFixLinks: [
		'etsy.com',
		'youtube.com',
		'youtu.be',
		'twitter.com',
		'teamliquid.net',
		'flickr.com',
		'github.com',
		'battle.net',
		'play.google.com',
		'plus.google.com',
		'soundcloud.com',
		'instagram.com'
	],
	checkToolbarLink: function(url) {
		for (var i = 0, len = this.toolbarFixLinks.length; i < len; i++) {
			if (url.indexOf(this.toolbarFixLinks[i]) !== -1) {
				return true;
			}
		}
		return false;
	},
	toolbarFix: function(ele) {
		var root = ele || document;
		var links = root.querySelectorAll('div.entry a.title');
		for (var i = 0, len = links.length; i < len; i++) {
			if (modules['betteReddit'].checkToolbarLink(links[i].getAttribute('href'))) {
				links[i].removeAttribute('onmousedown');
			}
			// patch below for comments pages thanks to redditor and resident helperninja gavin19
			if (links[i].getAttribute('srcurl')) {
				if (modules['betteReddit'].checkToolbarLink(links[i].getAttribute('srcurl'))) {
					links[i].removeAttribute('onmousedown');
				}
			}
		}
	},
	fullComments: function(ele) {
		var root = ele || document;
		var entries = root.querySelectorAll('#siteTable .entry');

		for (var i = 0, len = entries.length; i < len; i++) {
			var linkEle = entries[i].querySelector('A.bylink');
			var thisCommentsLink = '';
			if ((typeof linkEle !== 'undefined') && (linkEle !== null)) {
				thisCommentsLink = linkEle.getAttribute('href');
			}
			if (thisCommentsLink !== '') {
				thisCommentsSplit = thisCommentsLink.split("/");
				thisCommentsSplit.pop();
				thisCommentsLink = thisCommentsSplit.join("/");
				linkList = entries[i].querySelector('.flat-list');
				var fullCommentsLink = document.createElement('li');
				$(fullCommentsLink).html('<a class="redditFullComments" href="' + escapeHTML(thisCommentsLink) + '">' + escapeHTML(modules['betteReddit'].options.fullCommentsText.value) + '</a>');
				linkList.appendChild(fullCommentsLink);
			}
		}
	},
	editMyComments: function(ele) {
		var root = ele || document;
		var entries = root.querySelectorAll('#siteTable .entry');
		for (var i = 0, len = entries.length; i < len; i++) {
			var linkEle = entries[i].querySelector('A.bylink');
			var thisCommentsLink = '';
			if ((typeof linkEle !== 'undefined') && (linkEle !== null)) {
				thisCommentsLink = linkEle.getAttribute('href');
			}
			if (thisCommentsLink !== '') {
				permalink = entries[i].querySelector('.flat-list li.first');
				var editLink = document.createElement('li');
				$(editLink).html('<a onclick="return edit_usertext(this)" href="javascript:void(0);">edit</a>');
				RESUtils.insertAfter(permalink, editLink);
			}
		}
	},
	fixSaveLinks: function(ele) {
		var root = ele || document;
		var saveLinks = root.querySelectorAll('li:not(.comment-save-button) > FORM.save-button > SPAN > A');
		for (var i = 0, len = saveLinks.length; i < len; i++) {
			saveLinks[i].removeAttribute('onclick');
			saveLinks[i].setAttribute('action', 'save');
			saveLinks[i].addEventListener('click', modules['betteReddit'].saveLink, false);
		}
		var unsaveLinks = document.querySelectorAll('FORM.unsave-button > SPAN > A');
		for (var i = 0, len = saveLinks.length; i < len; i++) {
			if (typeof unsaveLinks[i] !== 'undefined') {
				unsaveLinks[i].removeAttribute('onclick');
				unsaveLinks[i].setAttribute('action', 'unsave');
				unsaveLinks[i].addEventListener('click', modules['betteReddit'].saveLink, false);
			}
		}
	},
	fixHideLinks: function(ele) {
		var root = ele || document;
		var hideLinks = root.querySelectorAll('FORM.hide-button > SPAN > A');
		for (var i = 0, len = hideLinks.length; i < len; i++) {
			hideLinks[i].removeAttribute('onclick');
			hideLinks[i].setAttribute('action', 'hide');
			hideLinks[i].addEventListener('click', modules['betteReddit'].hideLinkEventHandler, false);
		}
		var unhideLinks = document.querySelectorAll('FORM.unhide-button > SPAN > A');
		for (var i = 0, len = hideLinks.length; i < len; i++) {
			if (typeof unhideLinks[i] !== 'undefined') {
				unhideLinks[i].removeAttribute('onclick');
				unhideLinks[i].setAttribute('action', 'unhide');
				unhideLinks[i].addEventListener('click', modules['betteReddit'].hideLinkEventHandler, false);
			}
		}
	},
	saveLink: function(e) {
		if (e) {
			modules['betteReddit'].saveLinkClicked = e.target;
		}
		if (modules['betteReddit'].saveLinkClicked.getAttribute('action') === 'unsave') {
			$(modules['betteReddit'].saveLinkClicked).text('unsaving...');
		} else {
			$(modules['betteReddit'].saveLinkClicked).text('saving...');
		}
		if (modules['betteReddit'].modhash) {
			var action = modules['betteReddit'].saveLinkClicked.getAttribute('action'),
				parentThing = modules['betteReddit'].saveLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode,
				idRe = /id-([\w]+)/i,
				getLinkid = idRe.exec(parentThing.getAttribute('class')),
				linkid = getLinkid[1],
				executed, apiURL, params;

			if (action === 'unsave') {
				executed = 'unsaved';
				apiURL = location.protocol + '//' + location.hostname + '/api/unsave';
			} else {
				executed = 'saved';
				apiURL = location.protocol + '//' + location.hostname + '/api/save';
			}
			params = 'id=' + linkid + '&executed=' + executed + '&uh=' + modules['betteReddit'].modhash + '&renderstyle=html';
			GM_xmlhttpRequest({
				method: "POST",
				url: apiURL,
				data: params,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				onload: function(response) {
					if (response.status === 200) {
						if (modules['betteReddit'].saveLinkClicked.getAttribute('action') === 'unsave') {
							$(modules['betteReddit'].saveLinkClicked).text('save');
							modules['betteReddit'].saveLinkClicked.setAttribute('action', 'save');
						} else {
							$(modules['betteReddit'].saveLinkClicked).text('unsave');
							modules['betteReddit'].saveLinkClicked.setAttribute('action', 'unsave');
						}
					} else {
						delete modules['betteReddit'].modhash;
						alert('Sorry, there was an error trying to ' + modules['betteReddit'].saveLinkClicked.getAttribute('action') + ' your submission. Try clicking again.');
					}
				}
			});
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + '//' + location.hostname + '/api/me.json?app=res',
				onload: function(response) {
					var data = safeJSON.parse(response.responseText);
					if (typeof data.data === 'undefined') {
						alert('Sorry, there was an error trying to ' + modules['betteReddit'].saveLinkClicked.getAttribute('action') + ' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
					} else if ((typeof data.data.modhash !== 'undefined') && (data.data.modhash)) {
						modules['betteReddit'].modhash = data.data.modhash;
						modules['betteReddit'].saveLink();
					}
				}
			});
		}
	},
	hideLinkEventHandler: function(e) {
		modules['betteReddit'].hideLink(e.target);
	},
	hideLink: function(clickedLink) {
		if (clickedLink.getAttribute('action') === 'unhide') {
			$(clickedLink).text('unhiding...');
		} else {
			$(clickedLink).text('hiding...');
		}
		if (modules['betteReddit'].modhash) {
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
			params = 'id=' + linkid + '&executed=' + executed + '&uh=' + modules['betteReddit'].modhash + '&renderstyle=html';

			GM_xmlhttpRequest({
				method: "POST",
				url: apiURL,
				data: params,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				onload: function(response) {
					if (response.status === 200) {
						if (clickedLink.getAttribute('action') === 'unhide') {
							$(clickedLink).text('hide');
							clickedLink.setAttribute('action', 'hide');
							if (typeof modules['betteReddit'].hideTimer !== 'undefined') {
								clearTimeout(modules['betteReddit'].hideTimer);
							}
						} else {
							$(clickedLink).text('unhide');
							clickedLink.setAttribute('action', 'unhide');
							modules['betteReddit'].hideTimer = setTimeout(function() {
								modules['betteReddit'].hideFader(clickedLink);
							}, 5000);
						}
					} else {
						delete modules['betteReddit'].modhash;
						alert('Sorry, there was an error trying to ' + clickedLink.getAttribute('action') + ' your submission. Try clicking again.');
					}
				}
			});
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + '//' + location.hostname + '/api/me.json?app=res',
				onload: function(response) {
					var data = safeJSON.parse(response.responseText);
					if (typeof data.data === 'undefined') {
						alert('Sorry, there was an error trying to ' + clickedLink.getAttribute('action') + ' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
					} else if ((typeof data.data.modhash !== 'undefined') && (data.data.modhash)) {
						modules['betteReddit'].modhash = data.data.modhash;
						modules['betteReddit'].hideLink(clickedLink);
					}
				}
			});
		}
	},
	hideFader: function(ele) {
		var parentThing = ele.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
		RESUtils.fadeElementOut(parentThing, 0.3);
	},
	searchSubredditByDefault: function() {
		// Reddit now has this feature... but for some reason the box isn't checked by default, so we'll still do that...
		var restrictSearch = document.body.querySelector('INPUT[name=restrict_sr]');
		if (restrictSearch) {
			restrictSearch.checked = true;
		}
	},
	getVideoTimes: function(obj) {
		obj = obj || document;
		var youtubeLinks = obj.querySelectorAll('a.title[href*="youtube.com"], a.title[href*="youtu.be"]');
		var shortenedYoutubeLinks = obj.querySelectorAll('a.title[href*="youtube.com"]');
		var titleHasTimeRegex = /[\[|\(][0-9]*:[0-9]*[\]|\)]/;
		if (youtubeLinks) {
			var ytLinks = [];
			for (var i = 0, len = youtubeLinks.length; i < len; i += 1) {
				if (!titleHasTimeRegex.test(youtubeLinks[i].innerHTML)) {
					ytLinks.push(youtubeLinks[i]);
				}
			}
			youtubeLinks = ytLinks;
			var getYoutubeIDRegex = /\/?[\&|\?]?v\/?=?([\w\-]{11})&?/i;
			var getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i;
			var getYoutubeStartTimeRegex = /\[[\d]+:[\d]+\]/i;
			var tempIDs = [];
			modules['betteReddit'].youtubeLinkIDs = {};
			modules['betteReddit'].youtubeLinkRefs = [];
			for (var i = 0, len = youtubeLinks.length; i < len; i++) {
				var match = getYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href'));
				var shortened = /youtu\.be/i;
				var isShortened = shortened.exec(youtubeLinks[i].getAttribute('href'));
				if (isShortened) {
					var smatch = getShortenedYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href'));
					if (smatch) {
						var thisYTID = '"' + smatch[1] + '"';
						modules['betteReddit'].youtubeLinkIDs[thisYTID] = youtubeLinks[i];
						modules['betteReddit'].youtubeLinkRefs.push([thisYTID, youtubeLinks[i]]);
					}
				} else if (match) {
					// add quotes so URL creation is doable with just a join...
					var thisYTID = '"' + match[1] + '"';
					modules['betteReddit'].youtubeLinkIDs[thisYTID] = youtubeLinks[i];
					modules['betteReddit'].youtubeLinkRefs.push([thisYTID, youtubeLinks[i]]);
				}
				var timeMatch = getYoutubeStartTimeRegex.exec(youtubeLinks[i].getAttribute('href'));
				var titleMatch = titleHasTimeRegex.test(youtubeLinks[i].innerHTML);
				if (timeMatch && !titleMatch) {
					youtubeLinks[i].textContent += ' (@' + timeMatch[1] + ')';
				}
			}
			for (var id in modules['betteReddit'].youtubeLinkIDs) {
				tempIDs.push(id);
			}
			modules['betteReddit'].youtubeLinkIDs = tempIDs;
			modules['betteReddit'].getVideoJSON();
		}
	},
	getVideoJSON: function() {
		var thisBatch = modules['betteReddit'].youtubeLinkIDs.splice(0, 8);
		if (thisBatch.length) {
			var thisIDString = thisBatch.join('%7C');
			// var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&fields=entry(id,media:group(yt:duration))&alt=json';
			var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q=' + thisIDString + '&v=2&fields=entry(id,title,media:group(yt:duration,yt:videoid,yt:uploaded),yt:statistics)&alt=json';
			GM_xmlhttpRequest({
				method: "GET",
				url: jsonURL,
				onload: function(response) {
					var data = safeJSON.parse(response.responseText, null, true);
					if ((typeof data.feed !== 'undefined') && (typeof data.feed.entry !== 'undefined')) {
						for (var i = 0, len = data.feed.entry.length; i < len; i++) {
							var thisYTID = '"' + data.feed.entry[i]['media$group']['yt$videoid']['$t'] + '"',
								thisTotalSecs = data.feed.entry[i]['media$group']['yt$duration']['seconds'],
								thisTitle = data.feed.entry[i]['title']['$t'],
								thisMins = Math.floor(thisTotalSecs / 60),
								thisSecs = (thisTotalSecs % 60),
								thisUploaded, thisViewed, thisTime;

							if (thisSecs < 10) {
								thisSecs = '0' + thisSecs;
							}
							thisTime = ' - [' + thisMins + ':' + thisSecs + ']';
							if (modules['betteReddit'].options.videoUploaded.value) {
								thisUploaded = data.feed.entry[i]['media$group']['yt$uploaded']['$t'];
								thisUploaded = thisUploaded.match(/[^T]*/);
								thisTime += '[' + thisUploaded + ']';
							}
							if (modules['betteReddit'].options.videoViewed.value) {
								thisViewed = data.feed.entry[i]['yt$statistics']['viewCount'];
								thisTime += '[Views: ' + thisViewed + ']';
							}
							for (var j = 0, lenj = modules['betteReddit'].youtubeLinkRefs.length; j < lenj; j += 1) {
								if (modules['betteReddit'].youtubeLinkRefs[j][0] === thisYTID) {
									modules['betteReddit'].youtubeLinkRefs[j][1].textContent += ' ' + thisTime;
									modules['betteReddit'].youtubeLinkRefs[j][1].setAttribute('title', 'YouTube title: ' + thisTitle);
								}
							}
						}
						// wait a bit, make another request...
						setTimeout(modules['betteReddit'].getVideoJSON, 500);
					}
				}
			});
		}
	},
	pinSubredditBar: function() {
		// Make the subreddit bar at the top of the page a fixed element
		// The subreddit manager code changes the document's structure
		var sm = modules['subredditManager'].isEnabled();

		var sb = document.getElementById('sr-header-area');
		if (sb == null) {
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
		this.pinCommonElements(sm);
	},
	pinUserBar: function() {
		// Make the user bar at the top of the page a fixed element
		this.userBarElement = document.getElementById('header-bottom-right');
		var thisHeight = $('#header-bottom-right').height();
		RESUtils.addCSS('#header-bottom-right:hover { opacity: 1 !important;  }');
		RESUtils.addCSS('#header-bottom-right { height: ' + parseInt(thisHeight + 1, 10) + 'px; }');
		// make the account switcher menu fixed
		window.addEventListener('scroll', modules['betteReddit'].handleScroll, false);
		this.pinCommonElements();
	},
	handleScroll: function(e) {
		if (modules['betteReddit'].scrollTimer) {
			clearTimeout(modules['betteReddit'].scrollTimer);
		}
		modules['betteReddit'].scrollTimer = setTimeout(modules['betteReddit'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function(e) {
		if (RESUtils.elementInViewport(modules['betteReddit'].userBarElement)) {
			modules['betteReddit'].userBarElement.setAttribute('style', '');
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: absolute;');
			}
		} else if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: fixed;');
			}
			modules['betteReddit'].userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 19px; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		} else {
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: fixed;');
			}
			modules['betteReddit'].userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 0; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		}
	},
	pinHeader: function() {
		// Makes the Full header a fixed element

		// the subreddit manager code changes the document's structure
		var sm = modules['subredditManager'].isEnabled();

		var header = document.getElementById('header');
		if (header == null) {
			return; // reddit is under heavy load
		}

		// add a dummy <div> to the document for spacing
		var spacer = document.createElement('div');
		spacer.id = 'RESPinnedHeaderSpacer';

		// without the next line, the subreddit manager would make the subreddit bar three lines tall and very narrow
		RESUtils.addCSS('#sr-header-area {left: 0; right: 0;}');
		spacer.style.height = $('#header').outerHeight() + "px";

		// insert the spacer
		document.body.insertBefore(spacer, header.nextSibling);

		// make the header fixed
		RESUtils.addCSS('#header, #RESAccountSwitcherDropdown {position:fixed;}');
		// RESUtils.addCSS('#header {left: 0; right: 0; box-shadow: 0 2px 2px #AAA;}');
		RESUtils.addCSS('#header {left: 0; right: 0; }');
		var headerHeight = $('#header').height() + 15;
		RESUtils.addCSS('#RESNotifications { top: ' + headerHeight + 'px } ');
		this.pinCommonElements(sm);

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
	},
	pinCommonElements: function(sm) {
		// pin the elements common to both pinHeader() and pinSubredditBar()
		if (sm) {
			// RES's subreddit menu
			RESUtils.addCSS('#RESSubredditGroupDropdown, #srList, #RESShortcutsAddFormContainer, #editShortcutDialog {position: fixed !important;}');
		} else {
			RESUtils.addCSS('#sr-more-link: {position: fixed;}');
		}
	},
	restoreSavedTab: function() {
		var tabmenu = document.querySelector('#header .tabmenu'),
			li = document.createElement('li'),
			a = document.createElement('a'),
			user = RESUtils.loggedInUser();
		a.textContent = 'saved';
		a.href = '/user/' + user + '/saved/';
		li.appendChild(a);
		tabmenu.appendChild(li);
	}
};
