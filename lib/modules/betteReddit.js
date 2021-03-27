/* @flow */

import $ from 'jquery';
import { debounce } from 'lodash-es';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	Alert,
	Thing,
	addCSS,
	hide,
	unhide,
	CreateElement,
	isPageType,
	loggedInUser,
	watchForThings,
	watchForElements,
	formatDateDiff,
	fromSecondsToTime,
	string,
} from '../utils';
import { _addHeaderId } from '../utils/dom';
import { i18n } from '../environment';
import { Expando } from './showImages/expando';
import Youtube from './hosts/youtube';
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
		title: 'betteRedditCommentsLinksNewTabTitle',
	},
	fixHideLinks: {
		type: 'boolean',
		value: true,
		description: 'betteRedditFixHideLinksDesc',
		title: 'betteRedditFixHideLinksTitle',
	},
	hideLinkInstant: {
		type: 'boolean',
		value: false,
		description: 'betteRedditHideLinkInstantDesc',
		title: 'betteRedditHideLinkInstantTitle',
		dependsOn: options => options.fixHideLinks.value,
	},
	hideLinkFadeDelay: {
		type: 'text',
		value: '5000',
		description: 'betteRedditHideLinkFadeDelayDesc',
		title: 'betteRedditHideLinkFadeDelayTitle',
		advanced: true,
		dependsOn: options => options.fixHideLinks.value && !options.hideLinkInstant.value,
	},
	videoTimes: {
		type: 'boolean',
		value: true,
		description: 'betteRedditVideoTimesDesc',
		title: 'betteRedditVideoTimesTitle',
		advanced: true,
	},
	videoUploaded: {
		type: 'boolean',
		value: false,
		description: 'betteRedditVideoUploadedDesc',
		title: 'betteRedditVideoUploadedTitle',
		advanced: true,
	},
	videoViewed: {
		type: 'boolean',
		value: false,
		description: 'betteRedditVideoViewedDesc',
		title: 'betteRedditVideoViewedTitle',
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
		title: 'betteRedditPinHeaderTitle',
		bodyClass: 'pinHeader',
	},
	permanentVerticalScrollbar: {
		type: 'boolean',
		value: true,
		description: 'betteRedditPermanentVerticalScrollbarDesc',
		title: 'betteRedditPermanentVerticalScrollbarTitle',
		bodyClass: true,
	},
	showLastEditedTimestamp: {
		type: 'boolean',
		value: true,
		description: 'betteRedditShowLastEditedTimestampDesc',
		title: 'betteRedditShowLastEditedTimestampTitle',
		bodyClass: true,
	},
	scoreHiddenTimeLeft: {
		type: 'boolean',
		value: true,
		description: 'betteRedditScoreHiddenTimeLeftDesc',
		title: 'betteRedditScoreHiddenTimeLeftTitle',
	},
	showTimestampPosts: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampPostsDesc',
		title: 'betteRedditShowTimestampPostsTitle',
		bodyClass: true,
	},
	showTimestampComments: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampCommentsDesc',
		title: 'betteRedditShowTimestampCommentsTitle',
		bodyClass: true,
	},
	showTimestampSidebar: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampSidebarDesc',
		title: 'betteRedditShowTimestampSidebarTitle',
		bodyClass: true,
	},
	showTimestampWiki: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampWikiDesc',
		title: 'betteRedditShowTimestampWikiTitle',
		bodyClass: true,
	},
	showTimestampModerationLog: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowTimestampModerationLogDesc',
		title: 'betteRedditShowTimestampModerationLogTitle',
		bodyClass: true,
	},
	restoreSavedTab: {
		type: 'boolean',
		value: false,
		description: 'betteRedditRestoreSavedTabDesc',
		title: 'betteRedditRestoreSavedTabTitle',
	},
	doNoCtrlF: {
		type: 'boolean',
		value: false,
		description: 'betteRedditDoNoCtrlFDesc',
		title: 'betteRedditDoNoCtrlFTitle',
	},
	showHiddenSortOptions: {
		type: 'boolean',
		value: false,
		description: 'betteRedditShowHiddenSortOptionsDesc',
		title: 'betteRedditShowHiddenSortOptionsTitle',
		bodyClass: true,
	},
	truncateLongLinks: {
		type: 'boolean',
		value: false,
		description: 'betteRedditTruncateLongLinksDesc',
		title: 'betteRedditTruncateLongLinksTitle',
		bodyClass: true,
	},
	commentCollapseInInbox: {
		type: 'boolean',
		value: false,
		description: 'betteRedditCommentCollapseInInboxDesc',
		title: 'betteRedditCommentCollapseInInboxTitle',
		bodyClass: true,
	},
	blankPageUntilMeaningfulContent: {
		type: 'boolean',
		value: false,
		description: 'betteRedditBlankPageUntilMeaningfulContentDesc',
		title: 'betteRedditBlankPageUntilMeaningfulContentTitle',
	},
	restrictScrollEvents: {
		type: 'boolean',
		value: false,
		description: 'betteRedditRestrictScrollEventsDesc',
		title: 'betteRedditRestrictScrollEventsTitle',
		advanced: true,
	},
};

module.exclude = [
	'd2x',
];

module.beforeLoad = () => {
	if (module.options.blankPageUntilMeaningfulContent.value) {
		document.documentElement.classList.add('res-hide-body');
	}

	if (module.options.commentsLinksNewTabs.value) {
		watchForThings(['comment'], comment => {
			const body = comment.getTextBody();
			if (body) for (const link of body.querySelectorAll('a')) commentsLinksNewTabs((link: any));
		});
	}

	if (module.options.fixHideLinks.value) {
		watchForThings(['post'], fixHideLinks);
	}

	if (module.options.doNoCtrlF.value) {
		watchForElements(['page'], '.side a.reddit-comment-link', applyNoCtrlF);
		watchForThings(null, thing => {
			for (const link of thing.entry.querySelectorAll('ul.flat-list.buttons li a')) applyNoCtrlF(link);
		});
	}

	if (module.options.videoTimes.value || module.options.videoUploaded.value || module.options.videoViewed.value) {
		// Fetch data immediately, to potentially reduce number of requests
		watchForThings(['post'], showVideoData, { immediate: true });
	}

	switch (module.options.pinHeader.value) {
		case 'userbar':
			_addHeaderId('header-bottom-right', true);
			break;
		case 'sub':
			_addHeaderId('sr-header-area');
			break;
		case 'subanduser':
			_addHeaderId('sr-header-area');
			_addHeaderId('header-bottom-right', true);
			break;
		case 'header':
			_addHeaderId('header');
			break;
		case 'none':
		default:
			break;
	}

	if (module.options.restrictScrollEvents.value) {
		const scr = document.createElement('script');
		scr.innerHTML = `{
			// Prevents overzealous Reddit scroll listeners from constantly mutating the DOM while scrolling
			let debounce, lastEvent;
			window.addEventListener('scroll', e => {
				// Note that '_.debounce' uses Reddit's instance of Lodash
				if (!debounce) debounce = _.debounce(e => window.dispatchEvent(e), 300);
				if (e === lastEvent) return;
				lastEvent = e;
				debounce(e);
				e.stopImmediatePropagation();
			}, true);
		}`;
		document.documentElement.append(scr);
	}
};

module.contentStart = () => {
	if (module.options.blankPageUntilMeaningfulContent.value) {
		document.documentElement.classList.remove('res-hide-body');
	}

	if (module.options.scoreHiddenTimeLeft.value && isPageType('comments', 'commentsLinklist')) {
		$(document.body).on('mouseenter', '.score-hidden', function() {
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

function commentsLinksNewTabs(link) {
	link.target = '_blank';
	link.rel = 'noopener noreferer';
}

function fixHideLinks(thing) {
	const orig = thing.getHideElement();
	if (!orig) return;

	const a = document.createElement('a');
	a.className = 'noCtrlF';
	a.href = 'javascript:void 0'; // eslint-disable-line no-script-url
	a.dataset.eventAction = orig.dataset.eventAction;
	a.dataset.text = i18n(
		orig.dataset.eventAction === 'hide' ?
			'betteRedditHideLinkLabel' :
			'betteRedditUnhideLinkLabel',
	);
	a.addEventListener('click', () => hideLink(a));

	orig.replaceWith(a);
}

const hideTimer = new Map();

async function hideLink(clickedLink, action = clickedLink.dataset.eventAction) {
	const timeout = module.options.hideLinkInstant.value ?
		null :
		parseInt(module.options.hideLinkFadeDelay.value, 10);

	const thing = Thing.checkedFrom(clickedLink);

	if (action === 'hide') {
		// Native expandos does not know that the post is being hidden, so collapse them manually
		const expando = Expando.getEntryExpandoFrom(thing);
		if (expando && expando.types.includes('native')) expando.collapse();

		if (timeout === null) {
			if (!isPageType('comments')) $(thing.element).hide();
		} else {
			hideTimer.set(clickedLink, setTimeout(() => {
				if (clickedLink.dataset.eventAction === action) return; // It may have been unhidden
				$(thing.element).fadeOut(300);
			}, timeout));
		}
	}

	try {
		if (action === 'hide') await hide(thing);
		else await unhide(thing);
	} catch (e) {
		Alert.open(i18n(action === 'hide' ? 'betteRedditHideSubmissionError' : 'betteRedditUnhideSubmissionError'));
		$(thing.element).show();
		throw e;
	}
}

async function showVideoData(thing) {
	const url = new URL(thing.getPostUrl(), location.origin);
	if (!Youtube.domains.some(domain => url.hostname.endsWith(domain))) return;
	const [id] = Youtube.detect(url) || [];
	const data = await (Youtube.getVideoData && Youtube.getVideoData(id));
	if (!data) return;

	const { title, duration, publishedAt, viewCount } = data;

	const link = thing.getPostLink();
	const info = [];

	if (module.options.videoUploaded.value) {
		const uploaded = new Date(publishedAt); // 2016-01-27T05:49:48.000Z
		const dt = `${uploaded.toDateString()} ${uploaded.toTimeString()}`;
		const timeAgo = i18n('submitHelperTimeAgo', formatDateDiff(uploaded));
		info.push(`[<time title="${dt}" datetime="${publishedAt}" class="live-timestamp">${timeAgo}</time>]`);
	}

	if (module.options.videoViewed.value && viewCount) {
		info.push(i18n('betteRedditVideoViewed', viewCount));
	}

	const titleHasTimeRegex = /[\[|\(][0-9]*:[0-9]*[\]|\)]/;
	const getYoutubeStartTimeRegex = /\/?[&|\?]?(?:t|time_continue)=([\w\-][a-z0-9]*)/i;
	const timeMatch = getYoutubeStartTimeRegex.exec(link.href);
	const titleMatch = titleHasTimeRegex.test(link.textContent);

	let startTime;
	if (timeMatch && !titleMatch) {
		const seconds = fromYoutubeTimecodeToSeconds(timeMatch[1]);
		startTime = fromSecondsToTime(seconds);
	}

	if (info.length) {
		link.appendChild(string.html`<span class="gray pay-link">${string.safe(info.join(' '))}</span>`);
	}
	link.setAttribute('title', i18n('betteRedditVideoYouTubeTitle', title));

	if (module.options.videoTimes.value) {
		// Add native Reddit duration overlay on video thumbnail
		const thumbnail = thing.element.querySelector('a.thumbnail');
		if (thumbnail) {
			thumbnail.appendChild(string.html`<div class="duration-overlay">${duration}${startTime ? ` (@${startTime})` : ''}</div>`);
		}
	}
}

function fromYoutubeTimecodeToSeconds(tc: string) {
	let timeSeconds = Number(tc);
	if (Number.isNaN(timeSeconds)) {
		const tcobj = (tc.split(/(\d+[hms])/)
			.filter(Boolean)
			.reduce((acc, match) => {
				acc[match.slice(-1)] = Number(match.slice(0, -1));
				return acc;
			}, {}));
		timeSeconds = (tcobj.h || 0) * 3600 + (tcobj.m || 0) * 60 + (tcobj.s || 0);
	}
	return timeSeconds;
}

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

	window.addEventListener('scroll', debounce(() => {
		if (header.getBoundingClientRect().top > 0) {
			userbar.classList.remove('res-floating-userbar');
		} else {
			userbar.classList.add('res-floating-userbar');
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
		onChange: () => { location.href = `/user/${user}/saved/`; },
	});
}

function applyNoCtrlF(element) {
	if (element.classList.contains('noCtrlF')) return;

	element.classList.add('noCtrlF');
	element.dataset.text = element.textContent;
	element.textContent = '';
}
