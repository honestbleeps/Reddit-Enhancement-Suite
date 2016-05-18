import _ from 'lodash';
import { $ } from '../vendor';
import * as Modules from '../core/modules';
import {
	Alert,
	DAY,
	Thing,
	addCSS,
	batch,
	elementInViewport,
	fadeElementOut,
	forEachChunked,
	isPageType,
	loggedInUser,
	watchForElement,
} from '../utils';
import { ajax } from '../environment';
import * as AccountSwitcher from './accountSwitcher';
import * as SubredditManager from './subredditManager';

export const module = {};

module.moduleID = 'betteReddit';
module.moduleName = 'betteReddit';
module.category = ['Appearance'];
module.description = 'Adds a number of interface enhancements to Reddit, such as "full comments" links, the ability to unhide accidentally hidden posts, and more';
module.options = {
	commentsLinksNewTabs: {
		type: 'boolean',
		value: false,
		description: 'Open links found in comments in a new tab.',
	},
	fixHideLinks: {
		type: 'boolean',
		value: true,
		description: 'Changes "hide" links to read as "hide" or "unhide" depending on the hide state. Also adds a 5 second delay prior to hiding the link.',
	},
	videoTimes: {
		type: 'boolean',
		value: true,
		description: 'Show lengths of videos when possible',
		advanced: true,
	},
	videoUploaded: {
		type: 'boolean',
		value: false,
		description: 'Show upload date of videos when possible',
		advanced: true,
	},
	videoViewed: {
		type: 'boolean',
		value: false,
		description: 'Show number of views for a video when possible',
		advanced: true,
	},
	pinHeader: {
		type: 'enum',
		values: [{
			name: 'None',
			value: 'none',
		}, {
			name: 'Subreddit Bar only',
			value: 'sub',
		}, {
			name: 'User Bar',
			value: 'userbar',
		}, {
			name: 'Subreddit Bar and User bar',
			value: 'subanduser',
		}, {
			name: 'Full Header',
			value: 'header',
		}],
		value: 'none',
		description: 'Pin the subreddit bar, user menu, or header to top, floating down as you scroll.',
		bodyClass: 'pinHeader',
	},
	showLastEditedTimestamp: {
		type: 'boolean',
		value: true,
		description: 'Show the time that a text post/comment was edited, without having to hover the timestamp.',
		bodyClass: true,
	},
	scoreHiddenTimeLeft: {
		type: 'boolean',
		value: true,
		description: 'When hovering [score hidden] show time left instead of hide duration.',
	},
	showTimestampPosts: {
		type: 'boolean',
		value: false,
		description: 'Show the precise date (Sun Nov 16 20:14:56 2014 UTC) instead of a relative date (7 days ago), for posts.',
		bodyClass: true,
	},
	showTimestampComments: {
		type: 'boolean',
		value: false,
		description: 'Show the precise date for comments / messages.',
		bodyClass: true,
	},
	showTimestampSidebar: {
		type: 'boolean',
		value: false,
		description: 'Show the precise date in the sidebar.',
		bodyClass: true,
	},
	showTimestampWiki: {
		type: 'boolean',
		value: false,
		description: 'Show the precise date in the wiki.',
		bodyClass: true,
	},
	showTimestampModerationLog: {
		type: 'boolean',
		value: false,
		description: 'Show the precise date in the moderation log (/r/mod/about/log).',
		bodyClass: true,
	},
	restoreSavedTab: {
		type: 'boolean',
		value: false,
		description: 'The saved tab is now located in the multireddit sidebar. This will restore a "saved" link to the header (next to the "hot", "new", etc. tabs).',
	},
	doNoCtrlF: {
		type: 'boolean',
		value: false,
		description: 'When using the browser\'s Ctrl+F/Cmd+F "find text", only search comment/post text and not navigation links ("permalink source save..."). Disabled by default due to a slight performance impact.',
	},
	showHiddenSortOptions: {
		type: 'boolean',
		value: false,
		description: 'Reddit hides some comment sorting options (random, etc.) on most pages. This option reveals them.',
		bodyClass: true,
	},
	truncateLongLinks: {
		type: 'boolean',
		value: false,
		description: 'Truncates long post titles (greater than 1 line) with an ellipsis.',
		bodyClass: true,
	},
	commentCollapseInInbox: {
		type: 'boolean',
		value: false,
		description: 'Show the [-] collapse button in the inbox.',
		bodyClass: true,
	},
};
module.go = function() {
	if (isPageType('comments') && this.options.commentsLinksNewTabs.value) {
		commentsLinksNewTabs();
		watchForElement('newComments', commentsLinksNewTabs);
	}

	if (isPageType('linklist', 'modqueue', 'comments') && this.options.fixHideLinks.value) {
		fixHideLinks();
		watchForElement('siteTable', fixHideLinks);
	}

	if (this.options.doNoCtrlF.value) {
		if (isPageType('inbox', 'profile', 'linklist', 'modqueue')) {
			applyNoCtrlF(document);
			watchForElement('siteTable', applyNoCtrlF);
		} else if (isPageType('comments')) {
			applyNoCtrlF(document);
			watchForElement('newComments', applyNoCtrlF);
		}
	}

	if (module.options.scoreHiddenTimeLeft.value && isPageType('comments')) {
		$('.tagline').on('mouseenter', 'span:contains([)', function() {
			const timeNode = this.nextSibling && this.nextSibling.nextSibling;
			if (timeNode && timeNode.tagName === 'TIME') { // avoid flair with [
				if (!this.getAttribute('title').includes('revealed')) {
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
	if ((module.options.restoreSavedTab.value) && (loggedInUser() !== null) && document.querySelector('.with-listing-chooser:not(.profile-page)')) {
		restoreSavedTab();
	}
	if (this.options.videoTimes.value && isPageType('linklist', 'modqueue', 'comments')) {
		getVideoTimes();
		watchForElement('siteTable', getVideoTimes);
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
};

function commentsLinksNewTabs(ele = document.body) {
	const links = ele.querySelectorAll('.thing div.md a');
	Array.from(links).forEach(link => (link.target = '_blank'));
}

function fixHideLinks(ele) {
	const root = ele || document;
	const hideLinks = root.querySelectorAll('form.hide-button > span > a');
	const unhideLinks = document.querySelectorAll('form.unhide-button > span > a');

	Array.from(hideLinks).forEach(link => {
		$('<a>', {
			text: 'hide',
			action: 'hide',
			href: '#',
			click: hideLinkEventHandler,
		}).replaceAll(link);
	});

	Array.from(unhideLinks).forEach(link => {
		$('<a>', {
			text: 'unhide',
			action: 'unhide',
			href: '#',
			click: hideLinkEventHandler,
		}).replaceAll(link);
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

	const parentThing = new Thing(clickedLink);

	try {
		await ajax({
			method: 'POST',
			url: `/api/${action}`,
			data: { id: parentThing.getFullname() },
		});
	} catch (e) {
		Alert.open(`Sorry, there was an error trying to ${action} your submission. Try clicking again.`);
		throw e;
	}

	if (action === 'unhide') {
		$(clickedLink).text('hide');
		clickedLink.setAttribute('action', 'hide');
		clearTimeout(hideTimer);
	} else {
		$(clickedLink).text('unhide');
		clickedLink.setAttribute('action', 'unhide');
		hideTimer = setTimeout(() => fadeElementOut(parentThing.element, 0.3), 5000);
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

const getVideoInfo = batch(async videoIds => {
	const parts = ['id', 'contentDetails', 'snippet'];
	if (module.options.videoViewed.value) parts.push('statistics');

	const { items } = await ajax({
		url: 'https://www.googleapis.com/youtube/v3/videos',
		data: {
			id: videoIds.join(','),
			part: parts.join(','),
			key: 'AIzaSyB8ufxFN0GapU1hSzIbuOLfnFC0XzJousw',
		},
		type: 'json',
		cacheFor: DAY,
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
	const sm = Modules.isRunning(SubredditManager);

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

	// add the spacer; take the subreddit bar out of the header and put it above
	header.insertBefore(spacer, sb);
	document.body.insertBefore(sb, header);

	// make it fixed
	addCSS(`
		#header-bottom-left {
			margin-top: 19px;
		}

		div#sr-header-area {
			position: fixed;
			z-index: 10000 !important;
			left: 0;
			right: 0;
		}
	`);
	pinCommonElements(sm);
}

function pinUserBar() {
	// Make the user bar at the top of the page a fixed element
	const userBarElement = document.getElementById('header-bottom-right');
	addCSS(`
		#header-bottom-right:hover {
			opacity: 1 !important;
		}
	`);
	// make the account switcher menu fixed
	window.addEventListener('scroll', _.debounce(() => handleScroll(userBarElement), 300));
	pinCommonElements();
}

function handleScroll(userBarElement) {
	if (elementInViewport(userBarElement)) {
		userBarElement.setAttribute('style', '');
		if (AccountSwitcher.$accountMenu) {
			AccountSwitcher.$accountMenu.attr('style', 'position: absolute;');
		}
	} else if (module.options.pinHeader.value === 'subanduser') {
		if (AccountSwitcher.$accountMenu) {
			AccountSwitcher.$accountMenu.attr('style', 'position: fixed;');
		}
		userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 19px !important; bottom: auto !important; right: 0; opacity: .6; -webkit-transition: opacity 0.3s ease-in; -moz-transition: opacity 0.3s ease-in; transition: opacity 0.3s ease-in;');
	} else {
		if (AccountSwitcher.$accountMenu) {
			AccountSwitcher.$accountMenu.attr('style', 'position: fixed;');
		}
		userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 0 !important; bottom: auto !important; right: 0; opacity: .6; -webkit-transition: opacity 0.3s ease-in; -moz-transition: opacity 0.3s ease-in;  transition: opacity 0.3s ease-in;');
	}
}

/*
 * Modify the header so that its position is fixed to the top.
 */
function pinHeader() {
	const sm = Modules.isRunning(SubredditManager);

	const header = document.getElementById('header');

	if (header === null) {
		console.error('No element found with ID "header".');
		return;
	}

	const headerHeight = $('#header').outerHeight(true);

	// Add fixed positioning to all relevant elements.
	addCSS(`
		#header,
		#RESAccountSwitcherDropdown {
			position: fixed;
		}
	`);
	pinCommonElements(sm);

	// Ensure the header remains in its original position at the top of the page.
	// We can't change the z-index because themes often rely on it being a certain value.
	addCSS(`
		#header {
			top: 0;
			left: 0;
			right: 0;
			bottom: auto;
		}
	`);

	// Spacer height should be equal to header (including padding, margins, etc).
	$('<div>', {
		id: 'RESPinnedHeaderSpacer',
		height: headerHeight,
	}).insertBefore(header);
}

function pinCommonElements(sm) {
	// pin the elements common to both pinHeader() and pinSubredditBar()
	if (sm) {
		// RES's subreddit menu
		addCSS(`
			#RESSubredditGroupDropdown,
			#srList,
			#RESShortcutsAddFormContainer,
			#editShortcutDialog {
				position: fixed !important;
			}
		`);
	} else {
		addCSS(`
			#sr-more-link {
				position: fixed;
			}
		`);
	}
}

function restoreSavedTab() {
	const tabmenu = document.querySelector('#header .tabmenu');

	if (!tabmenu) {
		return;
	}

	const li = document.createElement('li');
	const a = document.createElement('a');
	const user = loggedInUser();
	a.textContent = 'saved';
	a.href = `/user/${user}/saved/`;
	li.appendChild(a);
	tabmenu.appendChild(li);
}

function applyNoCtrlF(searchIn) {
	const elems = searchIn.querySelectorAll('ul.flat-list.buttons li a:not(.noCtrlF), .side a.reddit-comment-link:not(.noCtrlF)');
	elems::forEachChunked(e => {
		e.classList.add('noCtrlF');
		e.setAttribute('data-text', e.textContent);
		e.textContent = '';
	});
}
