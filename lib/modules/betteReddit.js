modules['betteReddit'] = {
	moduleID: 'betteReddit',
	moduleName: 'betteReddit',
	category: 'UI',
	options: {
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
		showUnreadCount: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count next to orangered? If set to false, this will hides reddit\'s new native functionality once that is added.'
		},
		retroUnreadCount: {
			type: 'boolean',
			value: false,
			description: 'If you dislike the unread count provided by native reddit, you can replace it with the RES-style bracketed unread count',
			dependsOn: 'showUnreadCount'
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
			description: 'Always go to the inbox, not unread messages, when clicking on orangered',
			advanced: true
		},
		uncheckSendRepliesToInbox: {
			type: 'boolean',
			value: false,
			description: 'Uncheck "send replies to my inbox" by default, when submitting a new post'
		},
		hideModMail: {
			type: 'boolean',
			value: false,
			description: 'Hide the mod mail button in user bar.'
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
		toolbarFix: {
			type: 'boolean',
			value: true,
			description: 'Don\'t use Reddit Toolbar when linking to sites that may not function (twitter, youtube and others)',
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
			description: 'Pin the subreddit bar or header to the top, even when you scroll.'
		},
/*		turboSelfText: {
			type: 'boolean',
			value: true,
			description: 'Preload selftext data to make selftext expandos faster (preloads after first expando)',
			advanced: true
		},
*/		showLastEditedTimestamp: {
			type: 'boolean',
			value: true,
			description: 'Show the time that a text post/comment was edited, without having to hover the timestamp.'
		},
		scoreHiddenTimeLeft: {
			type: 'boolean',
			value: true,
			description: 'When hovering [score hidden] show time left instead of hide duration.'
		},
		restoreSavedTab: {
			type: 'boolean',
			value: false,
			description: 'The saved tab is now located in the multireddit sidebar. This will restore a "saved" link to the header (next to the "hot", "new", etc. tabs).'
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
		'all'
	],
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// add body classes as early as possible and batched all at once to
			// avoid document repaints
			switch (this.options.pinHeader.value) {
				case 'header':
					RESUtils.bodyClasses.push('pinHeader-header');
					break;
				case 'sub':
					RESUtils.bodyClasses.push('pinHeader-sub');
					break;
				case 'subanduser':
					RESUtils.bodyClasses.push('pinHeader-subanduser');
					break;
				case 'userbar':
					RESUtils.bodyClasses.push('pinHeader-userbar');
					break;
				default:
					break;
			}
		}
	},
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
			if ((RESUtils.pageType() === 'inbox') && (this.options.fullCommentsLink.value)) {
				this.fullComments();
			}
			
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixHideLinks.value)) {
				this.fixHideLinks();
			}
			// temporarily disabling turboselftext because it seems to cause occasional issues
			// with video autoplay (only on first, non-turbo expando)
			//
			// if ((this.options.turboSelfText.value) && (RESUtils.pageType() === 'linklist')) {
			// 	this.setUpTurboSelfText();
			// }
			this.setupFaviconBadge();

			if ((modules['betteReddit'].options.showLastEditedTimestamp.value) && ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments'))) {
				RESUtils.addCSS('.edited-timestamp[title]:after{content:" (" attr(title) ")";font-size: 90%;}');
			}
			if ((modules['betteReddit'].options.scoreHiddenTimeLeft.value) && (RESUtils.pageType() === 'comments')) {
				$('.tagline').on('mouseenter', 'span:contains([)', function() {
					var timeNode;
					if (this.nextSibling && ( timeNode = this.nextSibling.nextSibling) && this.nextSibling.nextSibling.tagName === 'TIME') { // avoid flair with [
						if (this.getAttribute('title').indexOf('revealed') === -1) {
							var scoreHiddenDuration = parseInt(this.getAttribute('title').match(/[0-9]+/)[0], 10);
							var postTime = new Date(timeNode.getAttribute('datetime')).getTime();
							var minutesLeft = Math.ceil((postTime+scoreHiddenDuration*60000-new Date().getTime())/60000);
							this.setAttribute('title','score will be revealed in '+minutesLeft+' minute'+(minutesLeft>1?'s':''));
						}
					}
				});
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
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (modules['betteReddit'].options.fixHideLinks.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fixHideLinks);
			}
			if ((RESUtils.pageType() === 'comments') && (modules['betteReddit'].options.commentsLinksNewTabs.value)) {
				RESUtils.watchForElement('newComments', modules['betteReddit'].commentsLinksNewTabs);
			}
			if ((this.options.videoTimes.value) && ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments'))) {
				this.getVideoTimes();
				// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...

				RESUtils.watchForElement('siteTable', modules['betteReddit'].getVideoTimes);
			}
			if ((RESUtils.loggedInUser() !== null) && ((this.options.showUnreadCount.value) || (this.options.showUnreadCountInTitle.value) || (this.options.showUnreadCountInFavicon.value))) {
				// Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
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
			if ((RESUtils.loggedInUser() !== null) && !this.options.showUnreadCount.value) {
				this.hideUnreadCount();
			}
			if (this.options.hideModMail.value) {
				RESUtils.addCSS('#modmail, #modmail + .separator { display:none; }');
			}
			switch (this.options.pinHeader.value) {
				case 'header':
					this.pinHeader();
					break;
				case 'sub':
					this.pinSubredditBar();
					break;
				case 'subanduser':
					this.pinSubredditBar();
					this.pinUserBar();
					break;
				case 'userbar':
					this.pinUserBar();
					break;
				default:
					break;
			}
			if (this.options.uncheckSendRepliesToInbox.value) {
				this.uncheckSendRepliesToInbox();
			}
		}
	},
	commentsLinksNewTabs: function(ele) {
		ele = ele || document.body;
		var links = ele.querySelectorAll('.thing div.md a');
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
	},/*
		commenting this out for now, it's only used by turboSelfText which is disabled.

	showSelfText: function(event) {
		var thisID = $(event.target).parent().parent().data('fullname');
		if (typeof modules['betteReddit'].selfTextHash[thisID] === 'undefined') {
			// we haven't gotten JSON data for this set of links yet... get it, then replace the click listeners with our own...
			var jsonURL = $(event.target).closest('.sitetable.linklisting').data('jsonURL');
			modules['betteReddit'].getSelfTextData(jsonURL);
		} else {
			if (!$(event.target).hasClass('expanded')) {
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
	},*/
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
		if ((typeof this.mail === 'undefined') && this.options.showUnreadCount.value) {
			// deprecate this feature once reddit's own goes live...
			this.mail = document.getElementById('mail');
			if (!document.querySelector('.message-count') || this.options.retroUnreadCount.value) {
				if (this.mail) {
					this.mailCount = RESUtils.createElementWithID('a', 'mailCount');
					this.mailCount.display = 'none';
					this.mailCount.setAttribute('href', this.getInboxLink(true));
					RESUtils.insertAfter(this.mail, this.mailCount);
				}
				// since retroUnreadCount must be turned on (or the new one isn't active yet),
				// add the CSS to hide the "new" unread count
				this.hideUnreadCount();
			} else {
				this.deprecateMailCount = true;
			}
		}
		if (this.mail) {
			$(modules['betteReddit'].mail).html('');
			if (this.mail.classList.contains('havemail')) {
				this.mail.setAttribute('href', this.getInboxLink(true));
				var countDiv = document.querySelector('.message-count'),
					count;

				// the new way of getting message count is right from reddit, as it will soon
				// output the message count, replacing RES's check.
				if (countDiv) {
					count = countDiv.textContent;
					modules['betteReddit'].setUnreadCount(count);
				} else {
					// if the countDiv doesn't exist, we still need to use the old way of polling
					// reddit for unread count
					var lastCheck = parseInt(RESStorage.getItem('RESmodules.betteReddit.msgCount.lastCheck.' + RESUtils.loggedInUser()), 10) || 0;
					var now = Date.now();
					// 300000 = 5 minutes... we don't want to annoy Reddit's servers too much with this query...
					if ((now - lastCheck) > 300000) {
						BrowserStrategy.ajax({
							method: 'GET',
							url: location.protocol + '//' + location.hostname + '/message/unread/.json?mark=false&app=res',
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
				}
			} else {
				// console.log('no need to get count - no new mail. resetting lastCheck');
				modules['betteReddit'].setUnreadCount(0);
				RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.' + RESUtils.loggedInUser(), 0);
			}
		}
	},
	hideUnreadCount: function() {
		RESUtils.addCSS('.message-count { display: none; }');
	},
	setUnreadCount: function(count) {
		if (count > 0) {
			if (this.options.showUnreadCountInTitle.value) {
				var newTitle = '[' + count + '] ' + document.title.replace(/^\[[\d]+\]\s/, '');
				document.title = newTitle;
			}
			this.updateFaviconBadge(count);
			if (this.options.showUnreadCount.value && !this.deprecateMailCount) {
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
			this.updateFaviconBadge(0);
		}
	},
	updateFaviconBadge: function(count) {
		if (!(this.isEnabled() && this.isMatchURL())) return;
		if (this.options.showUnreadCountInFavicon.value) {
			this.setupFaviconBadge();

			count = count || 0;
			this.favicon.badge(count);
		}
	},
	setupFaviconBadge: function() {
		if (this.favicon) return;

		if (this.options.showUnreadCountInFavicon.value) {
			var faviconDataurl = 'data:image/x-icon;base64,AAABAAEAICAAAAAAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///n///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb////n/wAAAAD/8Nb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv//8Nb/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//ngyP//5s3//+3T///w1v//8Nb//u7V//7u1f/+7tX///DW//7u1f/+6M//+eDI//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G///mzf//8Nb//ePL/9O/qv+hkYL/eW1g/1pQRv9HPzf/Rz83/1VLQf91aV3/mYl6/8i1of/23cb//u7V//7p0P/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//u7V/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//3jy///8Nb/2cax/3VpXf8fGxj/BAQE/xIUFv8sLzH/RkhK/1pcXf9bXV//TE5Q/zAzNf8WGBn/BAQE/xQRDv9cUkj/xbOg//7s0v/+6M//9t3G//bdxv/23cb/9t3G//bdxv/+7tX/AAAAAP/w1v/23cb/9t3G//bdxv//7dP/7NfA/2RbUf8CAQH/IyQm/4GDhP/Ozs//+Pj4//////////////////////////////////39/f/Z2dr/lZaW/zc5O/8AAAD/RDw1/9TBrf//8Nb/9t3G//bdxv/23cb/9t3G///w1v8AAAAA/u7V//bdxv/23cb//u7V/8Oyn/8TEA3/ICIk/6+vsP/+/v7//v7+//7+/v/+/v7//v7+//7+/v/29vb/8/P0//39/f/+/v7//v7+//7+/v/+/v7//v7+/8vLy/8/QUL/AAAA/52PgP/+8df/+N7G//bdxv/23cb//u7V/wAAAAD+7tX/9t3G//7u1f+/rZr/AAAA/2JjZP/6+vr//v7+//7+/v/+/v7//v7+/7Ozs/9RUVH/IyMj/xYWFv8UFBT/Ghoa/zg4OP+MjIz/+Pj4//7+/v/+/v7//v7+//7+/v+Pj4//AAAA/41/cv//8Nb/9t3G//bdxv/+7tX/AAAAAP7u1f/85c3/59G7/wUDAv9pamv//v7+//7+/v/+/v7//v7+//7+/v9dXV3/AAAA/1dXV/+bm5v/vb2+/8PDw/+tra3/dnZ2/xYWFv8lJSX/8fHx//7+/v/+/v7//v7+//7+/v+hoqL/AAAA/7+tmv/+7NL/9t3G//7u1f8AAAAA//DW///w1v9aUEb/IyQm/////////////////////////////////4+Pj//Ly8v/////////////////////////////////8PDw/4WFhf/w8PD///////////////////////////9WWFr/Ix8a//znzv/54Mj///DW/wAAAAD+9dv/6dK7/wIBAf+rrK3//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/9/f4P8AAAD/w66b//7p0P/+7tX/AAAAAP784P+8qZb/BgcH/+vr6//+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/yMkJv+CdGb//u7V//7u1f8AAAAA/v7j/76rmP8ODg//9PT1//7+/v/+/v7//v7+//7+/v/+/v7//v7+/9TY/v/z9f7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/8vP/v/s7/7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/LzEz/4J0Zv/+99z//u7V/wAAAAD//+X/b2NY/wAAAP/d3d3///////////////////////f5//9QVv//AAD//yUq///d4f////////////////////////f5//9KT///AAD//x0h///Y2/////////////////////////////8VFxj/Ni8o/+zZwv//+N3/AAAAALWjkf8DBQf/EBAQ/3R0dP/+/v7//v7+//7+/v/+/v7/xsv+/wAA//8AAP//AAD//4GH/v/+/v7//v7+//7+/v/+/v7/yM3+/wAA//8AAP//AAD//32D/v/+/v7//v7+//7+/v/+/v7/t7e3/wQEBP8jJCb/Miwn//7z2v8AAAAAQTgx/3p7ff+3t7f/AAAA/9LS0v/+/v7//v7+//7+/v/l6P7/Ehb+/wAA//8AAP//t7z+//7+/v/+/v7//v7+//7+/v/p7P7/GR7+/wAA//8AAP//ub7+//7+/v/+/v7//v7+//n5+f8WFhb/ZWVl//Pz9P8DBQf/t6KQ/wAAAAAxKiT/jI2P//7+/v9RUVH/Dg4P/9vb2//+/v7//v7+//7+/v/U2P7/fYP+/7G2/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/b3/7/iI3+/7m+/v/+/v7//v7+//7+/v/09PX/PDw8/xkZGf/x8fH//v7+/zAzNf+Ddmj/AAAAAH9wY/8XGhz/8PDw//////9XV1f/EhIS/6anp///////////////////////////////////////////////////////////////////////////////////////xcXG/ysrLP8vLy//8PDw///////q6ur/AQMF/7mkkv8AAAAA9+rS/y4pJf8QEhT/YGJj/0lLTf8AAAD/AAAA/zU3Of+vr7D/+Pj4//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/xcXG/1JTVf8CAQH/AAAA/0JERv+1trf/nZ6e/xkbHf82MCr//vXb/wAAAAD/+N3/89vE/4l7bf9EPDX/WE5F/7+tmv/Ww6//Vk1E/wYFBP8SFBb/UlNV/5KTlP+9vb7/3d3d/+rq6v/r6+v/39/g/8vLy/+fn6D/X2Bi/x4gIv8CAQH/OzUu/8Gwnf/Rv6r/Rz83/w4MCf8TEA3/ZFpP/+/Zwv/+99z/AAAAAP7u1f/74sn//u7V//7u1f/+7tX//unQ//7oz//+7tX/4s23/5aHeP9JQTj/GxcT/wkIB/8GBwf/BwgJ/w4OD/8KCgr/BgUE/xMQDf8+Ny//g3Zo/9O/qv/+7NL//unQ//7oz//+6dD/79fA//PbxP/+7tX/++LJ//7u1f8AAAAA//DW//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/948v//u7V//7u1f/74sn/5s+5/9G9qP+olob/AAAA/5+QgP/iz7n/89vE///t0//+7tX//+bN//bdxv/23cb//+bN//7p0P//5s3/+eDI//bdxv/23cb///DW/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//ngyP/948v//unQ///w1v8jIB3/hHdr///43f/54Mj/9t3G//bdxv/23cb/++LJ//7p0P/Tvan/w7Cc//PbxP/+6M//9tzE//bdxv/+7tX/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//vHX/21jWf8uKSX//unQ//bdxv/23cb/9t3G//ngyP/85c3/YllP/wMCAv8GBwf/IR0a/9TBrf/+6M//9t3G//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/+6dD/vquY/wMCAv/iy7X//ePL//bdxv/74sn//vne/5SFdv8BAwX/wcLC/+Li4v9ERkj/KCMf//nlzP/54Mj//u7V/wAAAAD/8Nb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//viyf/z28T/DAsL/6GRgv///+X//+3T/+/Zwv/JvKj/Ix8a/2NlZv///////////9nZ2v8AAAD/3MWw///mzf//8Nb/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G///w1v9PR0D/Mi0p/3l1af84My7/EBAQ/woKCv8PDQz/NDU2//v7+//+/v7/iYqL/wgGBP/v18D/++LJ//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//uzS/7Ggj/8UEhH/MCom/2phV/+omYj/4M23/9/Ltv8fGxj/Gx0f/zI0Nv8AAAD/mot9//7s0v/23cb//u7V/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/+eDI/+/XwP/+6dD///DW//7s0v/948v//unQ/+fRu/+Ddmj/bmJW/8Gum//+7NL/9t3G//bdxv/+7tX/AAAAAP/w1v/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/43sb/++LJ//jexv/23cb/9t3G//bdxv/23cb//ePL//7u1f//8Nb//unQ//bdxv/23cb/9t3G///w1v8AAAAA///n///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb////n/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAP////8=';
			// Remove current favicons and replace accordingly, or Favico has a cross domain issue since the real favicon is on redditstatic.com.
			$('head link[rel="shortcut icon"], head link[rel="icon"]').attr('href', faviconDataurl);

			// Init Favico
			this.favicon = new window.Favico();

			// Prevent notification icon from showing up in bookmarks
			$(window).on('beforeunload', function() {
				modules['betteReddit'].favicon.reset();
			});
		}
	},
	toolbarFixLinks: [
		'gfycat.com',
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
		var root = ele || document,
			links = $(root).find('a[onmousedown*="/tb/"]'),
			newEle,
			srcurl;

		for (var i = 0, len = links.length; i < len; i++) {
			if (modules['betteReddit'].checkToolbarLink(links[i].getAttribute('href')) && links[i].getAttribute('onmousedown') !== null) {
				// this crazy clone solution is necessary because now onmousedown events
				// still seem to fire even after removing the attribute. this means that
				// save_href($(this)) (reddit's code) will not get called, but there's no
				// way around this because RES can't call that code. Not even by re-adding
				// it to the onmousedown attribute.
				links[i].removeAttribute('onmousedown');
				srcurl = links[i].getAttribute('srcurl');
				if (srcurl) {
					links[i].setAttribute('href', srcurl);
				}
				newEle = links[i].cloneNode(true);
				links[i].parentNode.replaceChild(newEle, links[i]);
			}
			// patch below for comments pages thanks to redditor and resident helperninja gavin19
			if (links[i].getAttribute('srcurl')) {
				if (modules['betteReddit'].checkToolbarLink(links[i].getAttribute('srcurl'))) {
					links[i].removeAttribute('onmousedown');
					srcurl = links[i].getAttribute('srcurl');
					if (srcurl) {
						links[i].setAttribute('href', srcurl);
					}
					newEle = links[i].cloneNode(true);
					links[i].parentNode.replaceChild(newEle, links[i]);
				}
			}
		}
	},
	fullComments: function(ele) {
		if (this.deprecateFullComments) {
			return;
		}
		var root = ele || document,
			entries = root.querySelectorAll('#siteTable .entry'),
			i = 0,
			len = entries.length,
			linkEle, thisCommentsLink, linkList, depTest,
			fullCommentsLinkContainer, fullCommentsLink;

		// check if reddit's new native full comments link exists, and if so, deprecate
		// so we no longer run this function.
		if (entries && entries[0]) {
			depTest = entries[0].querySelector('a.full-comments');
		}
		if (depTest) {
			this.deprecateFullComments = true;
			return;
		}

		for (; i < len; i++) {
			linkEle = entries[i].querySelector('a.bylink');
			thisCommentsLink = '';
			if ((typeof linkEle !== 'undefined') && (linkEle !== null)) {
				thisCommentsLink = linkEle.getAttribute('href');
			}
			if (thisCommentsLink !== '') {
				thisCommentsSplit = thisCommentsLink.split('/');
				thisCommentsSplit.pop();
				thisCommentsLink = thisCommentsSplit.join('/');
				linkList = entries[i].querySelector('.flat-list');
				fullCommentsLinkContainer = document.createElement('li');
				fullCommentsLink = RESUtils.createElementWithID('a', null, 'redditFullComments');
				fullCommentsLink.href = thisCommentsLink;
				fullCommentsLink.textContent = modules['betteReddit'].options.fullCommentsText.value;
				fullCommentsLinkContainer.appendChild(fullCommentsLink);
				linkList.appendChild(fullCommentsLinkContainer);
			}
		}
	},
	fixHideLinks: function(ele) {
		var root = ele || document,
			hideLinks = root.querySelectorAll('FORM.hide-button > SPAN > A'),
			unhideLinks = document.querySelectorAll('FORM.unhide-button > SPAN > A'),
			i = 0,
			len = hideLinks.length,
			parent, newLink;

		for (; i < len; i++) {
			newLink = RESUtils.createElementWithID('a', null, null, 'hide');
			newLink.setAttribute('action', 'hide');
			newLink.setAttribute('href', 'javascript:void(0);');
			newLink.addEventListener('click', modules['betteReddit'].hideLinkEventHandler, false);
			parent = hideLinks[i].parentNode;
			parent.removeChild(hideLinks[i]);
			parent.appendChild(newLink);
		}

		i = 0;
		len = unhideLinks.length;

		for (; i < len; i++) {
			newLink = RESUtils.createElementWithID('a', null, null, 'unhide');
			newLink.setAttribute('action', 'unhide');
			newLink.setAttribute('href', 'javascript:void(0);');
			newLink.addEventListener('click', modules['betteReddit'].hideLinkEventHandler, false);
			parent = unhideLinks[i].parentNode;
			parent.removeChild(unhideLinks[i]);
			parent.appendChild(newLink);
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
			BrowserStrategy.ajax({
				method: 'POST',
				url: apiURL,
				data: params,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
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
			BrowserStrategy.ajax({
				method: 'GET',
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

			BrowserStrategy.ajax({
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
			BrowserStrategy.ajax({
				method: 'GET',
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
	uncheckSendRepliesToInbox: function () {
		var sendReplies = document.body.querySelector('#sendreplies');
		if (sendReplies) {
			sendReplies.checked = false;
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
				if (!titleHasTimeRegex.test(youtubeLinks[i].textContent)) {
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
				var titleMatch = titleHasTimeRegex.test(youtubeLinks[i].textContent);
				if (timeMatch && !titleMatch) {
					youtubeLinks[i].textContent += ' (@' + timeMatch[1] + ')';
				}
			}
			for (var id in modules['betteReddit'].youtubeLinkIDs) {
				// for security since these will become URL parameters, encodeURIComponent:
				tempIDs.push(encodeURIComponent(id));
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

			// SECURITY NOTE:
			// youtubeLinkIDs list is already run through encodeURIComponent
			// so we don't want to double-run that in this request
			var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q=' + thisIDString + '&v=2&fields=entry(id,title,media:group(yt:duration,yt:videoid,yt:uploaded),yt:statistics)&alt=json';
			BrowserStrategy.ajax({
				method: 'GET',
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
			modules['betteReddit'].userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 19px !important; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		} else {
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: fixed;');
			}
			modules['betteReddit'].userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 0 !important; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
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
		spacer.style.height = $('#header').outerHeight() + 'px';

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
};
