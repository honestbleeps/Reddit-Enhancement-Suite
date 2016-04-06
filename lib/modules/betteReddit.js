addModule('betteReddit', (module, moduleID) => {
	module.moduleName = 'betteReddit';
	module.category = ['Appearance'];
	module.description = 'Adds a number of interface enhancements to Reddit, such as "full comments" links, the ability to unhide accidentally hidden posts, and more';
	module.options = {
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
		showHiddenSortOptions: {
			type: 'boolean',
			value: false,
			description: 'Reddit hides some comment sorting options (random, etc.) on most pages. This option reveals them.',
			bodyClass: true
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if ((RESUtils.pageType() === 'comments') && (this.options.commentsLinksNewTabs.value)) {
				commentsLinksNewTabs();
				RESUtils.watchForElement('newComments', commentsLinksNewTabs);
			}

			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixHideLinks.value)) {
				fixHideLinks();
				RESUtils.watchForElement('siteTable', fixHideLinks);
			}

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
					const timeNode = this.nextSibling && this.nextSibling.nextSibling;
					if (timeNode && timeNode.tagName === 'TIME') { // avoid flair with [
						if (this.getAttribute('title').indexOf('revealed') === -1) {
							const scoreHiddenDuration = parseInt(this.getAttribute('title').match(/[0-9]+/)[0], 10);
							const postTime = new Date(timeNode.getAttribute('datetime')).getTime();
							const minutesLeft = Math.ceil((postTime + scoreHiddenDuration * 60000 - new Date().getTime()) / 60000);
							this.setAttribute('title', `score will be revealed in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`);
						}
					}
				});
			}
			if (this.options.showTimestampSidebar.value) {
				const subredditAge = document.body.querySelector('.side .age');
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
		const links = ele.querySelectorAll('.thing div.md a');
		Array.from(links).forEach(link => (link.target = '_blank'));
	}

	function fixHideLinks(ele) {
		const root = ele || document;
		const hideLinks = root.querySelectorAll('form.hide-button > span > a');
		const unhideLinks = document.querySelectorAll('form.unhide-button > span > a');

		Array.from(hideLinks).forEach(link => {
			const newLink = RESUtils.createElement('a', null, null, 'hide');
			newLink.setAttribute('action', 'hide');
			newLink.setAttribute('href', '#');
			newLink.addEventListener('click', hideLinkEventHandler, false);
			const parent = link.parentNode;
			parent.removeChild(link);
			parent.appendChild(newLink);
		});

		Array.from(unhideLinks).forEach(link => {
			const newLink = RESUtils.createElement('a', null, null, 'unhide');
			newLink.setAttribute('action', 'unhide');
			newLink.setAttribute('href', '#');
			newLink.addEventListener('click', hideLinkEventHandler, false);
			const parent = link.parentNode;
			parent.removeChild(link);
			parent.appendChild(newLink);
		});
	}

	function hideLinkEventHandler(e) {
		e.preventDefault();
		hideLink(e.target);
	}

	let hideTimer;

	async function hideLink(clickedLink) {
		const action = clickedLink.getAttribute('action');

		if (action === 'unhide') {
			$(clickedLink).text('unhiding...');
		} else {
			$(clickedLink).text('hiding...');
		}

		const parentThing = new RESUtils.thing(clickedLink);

		try {
			await RESEnvironment.ajax({
				method: 'POST',
				url: `/api/${action}`,
				data: { id: parentThing.getFullname() }
			});
		} catch (e) {
			alert(`Sorry, there was an error trying to ${action} your submission. Try clicking again.`);
			throw e;
		}

		if (action === 'unhide') {
			$(clickedLink).text('hide');
			clickedLink.setAttribute('action', 'hide');
			clearTimeout(hideTimer);
		} else {
			$(clickedLink).text('unhide');
			clickedLink.setAttribute('action', 'unhide');
			hideTimer = setTimeout(() => RESUtils.fadeElementOut(parentThing.element, 0.3), 5000);
		}
	}

	function getVideoTimes(obj = document) {
		const titleHasTimeRegex = /[\[|\(][0-9]*:[0-9]*[\]|\)]/;
		const getYoutubeIDRegex = /\/?[&|\?]?v\/?=?([\w\-]{11})&?/i;
		const getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i;
		const getYoutubeStartTimeRegex = /\[[\d]+:[\d]+\]/i;

		Array.from(obj.querySelectorAll('a.title[href*="youtube.com"], a.title[href*="youtu.be"]') || [])
			.filter(link => !titleHasTimeRegex.test(link.textContent))
			.forEach(async link => {
				const isShortened = (/youtu\.be/i).test(link.href);

				const match = isShortened ?
					getShortenedYoutubeIDRegex.exec(link.href) :
					getYoutubeIDRegex.exec(link.href);

				if (!match) return;

				const timeMatch = getYoutubeStartTimeRegex.exec(link.href);
				const titleMatch = titleHasTimeRegex.test(link.textContent);
				if (timeMatch && !titleMatch) {
					link.textContent += ` (@${timeMatch[1]})`;
				}

				const { info, title } = await getVideoInfo(match[1]);

				link.textContent += ` - ${info}`;
				link.setAttribute('title', `YouTube title: ${title}`);
			});
	}

	const getVideoInfo = RESUtils.batch(async videoIds => {
		const parts = ['id', 'contentDetails', 'snippet'];
		if (module.options.videoViewed.value) parts.push('statistics');

		const { items } = await RESEnvironment.ajax({
			url: 'https://www.googleapis.com/youtube/v3/videos',
			data: {
				id: videoIds.join(','),
				part: parts.join(','),
				key: 'AIzaSyB8ufxFN0GapU1hSzIbuOLfnFC0XzJousw'
			},
			type: 'json',
			cacheFor: RESUtils.DAY
		});

		const results = items.map(({ id, contentDetails, snippet, statistics }) => {
			const title = snippet.title;
			const rawDuration = contentDetails.duration; // PT1H11M46S
			const duration = ['0']
				.concat(rawDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i).slice(1))
				.map(time => `0${time || 0}`.slice(-2))
				.filter((time, i, { length }) => +time !== 0 || i >= length - 2)
				.join(':');

			let info = `[${duration}]`;

			if (module.options.videoUploaded.value) {
				const uploaded = snippet.publishedAt; // 2016-01-27T05:49:48.000Z
				info += `[${uploaded.match(/[^T]*/)}]`;
			}

			if (module.options.videoViewed.value) {
				const viewed = statistics.viewCount;
				info += `[Views: ${viewed}]`;
			}

			return { id, info, title };
		});

		return videoIds.map(idFromBatch => results.find(({ id }) => id === idFromBatch));
	}, { size: 50 });

	function pinSubredditBar() {
		// Make the subreddit bar at the top of the page a fixed element
		// The subreddit manager code changes the document's structure
		const sm = modules['subredditManager'].isEnabled();

		const sb = document.getElementById('sr-header-area');
		if (sb === null) {
			return; // reddit is under heavy load
		}
		const header = document.getElementById('header');

		// add a dummy <div> inside the header to replace the subreddit bar (for spacing)
		const spacer = document.createElement('div');
		// null parameter is necessary for FF3.6 compatibility.
		spacer.style.paddingTop = window.getComputedStyle(sb, null).paddingTop;
		spacer.style.paddingBottom = window.getComputedStyle(sb, null).paddingBottom;

		// HACK: for some reason, if the SM is enabled, the SB gets squeezed horizontally,
		//       and takes up three rows of vertical space (even at low horizontal resolution).
		if (sm) {
			spacer.style.height = `${parseInt(window.getComputedStyle(sb, null).height, 10) / 3 - 3}px`;
		} else {
			spacer.style.height = window.getComputedStyle(sb, null).height;
		}

		// window.setTimeout(function(){
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
		const userBarElement = document.getElementById('header-bottom-right');
		const thisHeight = $('#header-bottom-right').height();
		RESUtils.addCSS('#header-bottom-right:hover { opacity: 1 !important;  }');
		RESUtils.addCSS(`#header-bottom-right { height: ${parseInt(thisHeight + 1, 10)}px; }`);
		// make the account switcher menu fixed
		window.addEventListener('scroll', RESUtils.debounce(() => handleScroll(userBarElement), 300));
		pinCommonElements();
	}

	function handleScroll(userBarElement) {
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
		const sm = modules['subredditManager'].isEnabled();

		const header = document.getElementById('header');
		if (header === null) {
			return; // reddit is under heavy load
		}

		// add a dummy <div> to the document for spacing
		const spacer = document.createElement('div');
		spacer.id = 'RESPinnedHeaderSpacer';

		// without the next line, the subreddit manager would make the subreddit bar three lines tall and very narrow
		RESUtils.addCSS('#sr-header-area {left: 0; right: 0;}');
		spacer.style.height = `${$('#header').outerHeight()}px`;

		// insert the spacer
		document.body.insertBefore(spacer, header.nextSibling);

		// make the header fixed
		RESUtils.addCSS('#header, #RESAccountSwitcherDropdown {position:fixed;}');
		// RESUtils.addCSS('#header {left: 0; right: 0; box-shadow: 0 2px 2px #AAA;}');
		RESUtils.addCSS('#header {left: 0; right: 0; }');
		const headerHeight = $('#header').height() + 15;
		RESUtils.addCSS(`#RESNotifications { top: ${headerHeight}px } `);
		pinCommonElements(sm);

		// TODO Needs testing
		// Sometimes this gets executed before the subreddit logo has finished loading. When that
		// happens, the spacer gets created too short, so when the SR logo finally loads, the header
		// grows and overlaps the top of the page, potentially obscuring the first link. This checks
		// to see if the image is finished loading. If it is, then the spacer's height is set. Otherwise,
		// it pauses, then loops.
		// added a check that this element exists, so it doesn't error out RES.
		if (document.getElementById('header-img') && (!document.getElementById('header-img').complete)) {
			setTimeout(() => {
				if (document.getElementById('header-img').complete) {
					// null parameter is necessary for FF3.6 compatibility.
					document.getElementById('RESPinnedHeaderSpacer').style.height = window.getComputedStyle(document.getElementById('header'), null).height;
				} else {
					setTimeout(pinHeader, 10);
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
		const tabmenu = document.querySelector('#header .tabmenu');

		if (!tabmenu) {
			return;
		}

		const li = document.createElement('li');
		const a = document.createElement('a');
		const user = RESUtils.loggedInUser();
		a.textContent = 'saved';
		a.href = `/user/${user}/saved/`;
		li.appendChild(a);
		tabmenu.appendChild(li);
	}

	function applyNoCtrlF(searchIn) {
		const elems = searchIn.querySelectorAll('ul.flat-list.buttons li a:not(.noCtrlF)');
		RESUtils.forEachChunked(elems, e => {
			e.classList.add('noCtrlF');
			e.setAttribute('data-text', e.textContent);
			e.textContent = '';
		});
	}
});
