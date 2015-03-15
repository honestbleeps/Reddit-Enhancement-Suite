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
		},
		doNoCtrlF: {
			type: 'boolean',
			value: false,
			description: 'Modify reddit\'s comment/link buttons ("perma-link source save...") such that they don\'t show up in searches. Disabled by default due to a slight performance impact.'
		}
	},
	description: 'Adds a number of interface enhancements to Reddit, such as "full comments" links, the ability to unhide accidentally hidden posts, and more',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
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
			// removed profile pages since Reddit does this natively now for those...
			if ((RESUtils.pageType() === 'inbox') && (this.options.fullCommentsLink.value)) {
				this.fullComments();
			}

			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixHideLinks.value)) {
				this.fixHideLinks();
			}

			if (this.options.doNoCtrlF.value) {
				if ((RESUtils.pageType() === 'inbox') || (RESUtils.pageType() === 'profile') || (RESUtils.pageType() === 'linklist')) {
					this.applyNoCtrlF(document);
					RESUtils.watchForElement('siteTable', this.applyNoCtrlF);
				} else if (RESUtils.pageType() === 'comments') {
					this.applyNoCtrlF(document);
					RESUtils.watchForElement('newComments', this.applyNoCtrlF);
				}
			}

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
			linkEle, thisCommentsLink, thisCommentsSplit, linkList, depTest,
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
			newLink.setAttribute('href', '#');
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
			newLink.setAttribute('href', '#');
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
			RESUtils.runtime.ajax({
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
			RESUtils.runtime.ajax({
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
		e.preventDefault();
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

			RESUtils.runtime.ajax({
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
			RESUtils.runtime.ajax({
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
	getVideoTimes: function(obj) {
		obj = obj || document;
		var youtubeLinks = obj.querySelectorAll('a.title[href*="youtube.com"], a.title[href*="youtu.be"]'),
			titleHasTimeRegex = /[\[|\(][0-9]*:[0-9]*[\]|\)]/,
			i, len;
		if (youtubeLinks) {
			var ytLinks = [];
			for (i = 0, len = youtubeLinks.length; i < len; i += 1) {
				if (!titleHasTimeRegex.test(youtubeLinks[i].textContent)) {
					ytLinks.push(youtubeLinks[i]);
				}
			}
			youtubeLinks = ytLinks;
			var getYoutubeIDRegex = /\/?[\&|\?]?v\/?=?([\w\-]{11})&?/i,
				getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i,
				getYoutubeStartTimeRegex = /\[[\d]+:[\d]+\]/i,
				tempIDs = [];
			modules['betteReddit'].youtubeLinkIDs = {};
			modules['betteReddit'].youtubeLinkRefs = [];
			for (i = 0, len = youtubeLinks.length; i < len; i++) {
				var match = getYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href')),
					shortened = /youtu\.be/i,
					isShortened = shortened.exec(youtubeLinks[i].getAttribute('href')),
					thisYTID;
				if (isShortened) {
					var smatch = getShortenedYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href'));
					if (smatch) {
						thisYTID = '"' + smatch[1] + '"';
						modules['betteReddit'].youtubeLinkIDs[thisYTID] = youtubeLinks[i];
						modules['betteReddit'].youtubeLinkRefs.push([thisYTID, youtubeLinks[i]]);
					}
				} else if (match) {
					// add quotes so URL creation is doable with just a join...
					thisYTID = '"' + match[1] + '"';
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

			// SECURITY NOTE:
			// youtubeLinkIDs list is already run through encodeURIComponent
			// so we don't want to double-run that in this request
			var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q=' + thisIDString + '&v=2&fields=entry(id,title,media:group(yt:duration,yt:videoid,yt:uploaded),yt:statistics)&alt=json';
			RESUtils.runtime.ajax({
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

		// add the spacer; take the subreddit bar out of the header and put it above
		header.insertBefore(spacer, sb);
		document.body.insertBefore(sb, header);

		// make it fixed
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
	},
	applyNoCtrlF: function(searchIn) {
		var elems = searchIn.querySelectorAll('ul.flat-list.buttons li a:not(.noCtrlF)');
		RESUtils.forEachChunked(elems, 25, 100, function(e) {
			e.classList.add('noCtrlF');
			e.setAttribute('data-text', e.textContent);
			e.textContent = '';
		})
	}
};
