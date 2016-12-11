/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	Alert,
	DAY,
	Thing,
	addCSS,
	batch,
	CreateElement,
	forEachChunked,
	isPageType,
	loggedInUser,
	watchForElement,
	nextFrame,
} from '../utils';
import { ajax } from '../environment';
import { isSettingsUrl } from './settingsNavigation';
import * as AccountSwitcher from './accountSwitcher';
import * as SubredditManager from './subredditManager';

export const module: Module<*> = new Module('betteReddit');

module.moduleName = 'betteRedditName';
module.category = 'appearanceCategory';
module.description = 'betteRedditDesc';
module.options = {
	commentsLinksNewTabs: {
		type: 'boolean',
		value: false,
		description: 'betteRedditCommentsLinksNewTabDesc',
	},
	fixHideLinks: {
		type: 'boolean',
		value: true,
		description: 'betteRedditFixHideLinksDesc',
	},
	hideLinkFadeDelay: {
		type: 'text',
		value: '5000',
		description: 'betteRedditHideLinkFadeDelayDesc',
		advanced: true,
		dependsOn: 'fixHideLinks',
	},
	videoTimes: {
		type: 'boolean',
		value: true,
		description: 'betteRedditVideoTimesDesc',
		advanced: true,
	},
	videoUploaded: {
		type: 'boolean',
		value: false,
		description: 'betteRedditVideoUploadedDesc',
		advanced: true,
	},
	videoViewed: {
		type: 'boolean',
		value: false,
		description: 'betteRedditVideoViewedDesc',
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
		description: 'betteRedditPinHeaderDesc',
		bodyClass: 'pinHeader',
	},
	showLastEditedTimestamp: {
		type: 'boolean',
		value: true,
		description: 'betteRedditShowLastEditedTimestampDesc',
		bodyClass: true,
	},
	scoreHiddenTimeLeft: {
		type: 'boolean',
		value: true,
		description: 'betteRedditScoreHiddenTimeLeftDesc',
	},
	showTimestampPosts: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampPostsDesc',
		bodyClass: true,
	},
	showTimestampComments: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampCommentsDesc',
		bodyClass: true,
	},
	showTimestampSidebar: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampSidebarDesc',
		bodyClass: true,
	},
	showTimestampWiki: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampWikiDesc',
		bodyClass: true,
	},
	showTimestampModerationLog: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampModerationLogDesc',
		bodyClass: true,
	},
	restoreSavedTab: {
		type: 'boolean',
		value: false,
		description: 'betteRedditRestoreSavedTabDesc',
	},
	doNoCtrlF: {
		type: 'boolean',
		value: false,
		description: 'betteRedditDoNoCtrlFDesc',
	},
	showHiddenSortOptions: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowHiddenSortOptionsDesc',
		bodyClass: true,
	},
	truncateLongLinks: {
		type: 'boolean',
		value: false,
		description: 'betteRedditTruncateLongLinksDesc',
		bodyClass: true,
	},
	commentCollapseInInbox: {
		type: 'boolean',
		value: false,
		description: 'betteRedditCommentCollapseInInboxDesc',
		bodyClass: true,
	},
};
module.go = () => {
	if (isPageType('comments', 'commentsLinklist') && module.options.commentsLinksNewTabs.value) {
		commentsLinksNewTabs();
		watchForElement('newComments', commentsLinksNewTabs);
		watchForElement('siteTable', commentsLinksNewTabs);
	}

	if (isPageType('linklist', 'modqueue', 'comments') && module.options.fixHideLinks.value) {
		fixHideLinks();
		watchForElement('siteTable', fixHideLinks);
	}

	if (module.options.doNoCtrlF.value) {
		if (isPageType('inbox', 'profile', 'linklist', 'commentsLinklist', 'modqueue')) {
			applyNoCtrlF(document);
			watchForElement('siteTable', applyNoCtrlF);
		} else if (isPageType('comments')) {
			applyNoCtrlF(document);
			watchForElement('newComments', applyNoCtrlF);
		}
	}

	if (module.options.scoreHiddenTimeLeft.value && isPageType('comments', 'commentsLinklist')) {
		$('.sitetable').on('mouseenter', '.score-hidden', function() {
			const timeNode = $(this).siblings('time').get(0);
			if (timeNode) {
				if (!this.getAttribute('title').includes('revealed')) {
					const scoreHiddenDuration = parseInt(this.getAttribute('title').match(/[0-9]+/)[0], 10);
					const postTime = new Date(timeNode.getAttribute('datetime')).getTime();
					const minutesLeft = Math.ceil((postTime + scoreHiddenDuration * 60000 - new Date().getTime()) / 60000);
					if (minutesLeft >= 1) {
						this.setAttribute('title', `score will be revealed in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`);
					} else {
						this.setAttribute('title', 'reload page to reveal score');
					}
				}
			}
		});
	}

	const user = loggedInUser();
	if (module.options.restoreSavedTab.value && user && document.querySelector('.with-listing-chooser:not(.profile-page)')) {
		restoreSavedTab(user);
	}
	if (module.options.videoTimes.value && isPageType('linklist', 'modqueue', 'comments', 'commentsLinklist')) {
		getVideoTimes();
		watchForElement('siteTable', getVideoTimes);
	}
	switch (module.options.pinHeader.value) {
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
	forEachChunked(links, link => {
		const { baseURI, href } = link;
		if (href.includes(baseURI) && isSettingsUrl(href)) return;

		link.target = '_blank';
		link.rel = 'noopener noreferer';
	});
}

function fixHideLinks(ele = document.body) {
	const hideLinks = ele.querySelectorAll('form.hide-button > span > a');
	const unhideLinks = ele.querySelectorAll('form.unhide-button > span > a');

	forEachChunked(hideLinks, link => {
		$('<a>', {
			text: 'hide',
			action: 'hide',
			href: '#',
			click: hideLinkEventHandler,
		}).replaceAll(link);
	});

	forEachChunked(unhideLinks, link => {
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

	const parentThing = Thing.checkedFrom(clickedLink);

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
		hideTimer = setTimeout(() => parentThing.$thing.fadeOut(300), parseInt(module.options.hideLinkFadeDelay.value, 10));
	}
}

function getVideoTimes(obj = document) {
	const titleHasTimeRegex = /[\[|\(][0-9]*:[0-9]*[\]|\)]/;
	const getYoutubeIDRegex = /\/?[&|\?]?v\/?=?([\w\-]{11})&?/i;
	const getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i;
	const getYoutubeStartTimeRegex = /\[[\d]+:[\d]+\]/i;

	Array.from(((obj.querySelectorAll('a.title[href*="youtube.com"], a.title[href*="youtu.be"]'): any): NodeList<HTMLAnchorElement>))
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

			nextFrame(() => {
				link.textContent += ` - ${info}`;
				link.setAttribute('title', `YouTube title: ${title}`);
			});
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
	if (!sb) {
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
	const header = document.getElementById('header-bottom-left');
	const userbar = document.getElementById('header-bottom-right');

	window.addEventListener('scroll', _.debounce(() => {
		if (header.getBoundingClientRect().top > 0) {
			userbar.classList.remove('res-floating-userbar');
			if (AccountSwitcher.$accountMenu) {
				AccountSwitcher.$accountMenu.attr('style', 'position: absolute;');
			}
		} else {
			userbar.classList.add('res-floating-userbar');
			if (AccountSwitcher.$accountMenu) {
				AccountSwitcher.$accountMenu.attr('style', 'position: fixed;');
			}
		}
	}, 300));

	pinCommonElements();
}

/*
 * Modify the header so that its position is fixed to the top.
 */
function pinHeader() {
	const sm = Modules.isRunning(SubredditManager);

	const header = document.getElementById('header');

	if (!header) {
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

function restoreSavedTab(user) {
	CreateElement.tabMenuItem({
		text: 'saved',
	}).addEventListener('change', () => { location.href = `/user/${user}/saved/`; });
}

function applyNoCtrlF(searchIn) {
	const elems = searchIn.querySelectorAll('ul.flat-list.buttons li a:not(.noCtrlF), .side a.reddit-comment-link:not(.noCtrlF)');
	forEachChunked(elems, e => {
		e.classList.add('noCtrlF');
		e.setAttribute('data-text', e.textContent);
		e.textContent = '';
	});
}
