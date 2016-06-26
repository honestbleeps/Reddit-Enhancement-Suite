import _ from 'lodash';
import { $ } from '../vendor';
import { Session, Storage, ajax } from '../environment';
import {
	Thing,
	addCSS,
	currentSubreddit,
	elementInViewport,
	pageType,
	scrollTo,
} from '../utils';
import * as Floater from './floater';
import * as Notifications from './notifications';
import * as Orangered from './orangered';
import * as SettingsConsole from './settingsConsole';
import * as SettingsNavigation from './settingsNavigation';
import * as SubredditManager from './subredditManager';

export const module = {};

module.moduleID = 'neverEndingReddit';
module.moduleName = 'Never Ending Reddit';
module.category = ['Browsing'];
module.description = 'Inspired by modules like River of Reddit and Auto Pager - gives you a never ending stream of reddit goodness.';
module.options = {
	returnToPrevPage: {
		type: 'boolean',
		value: true,
		description: 'Return to the page you were last on when hitting "back" button?',
	},
	autoLoad: {
		type: 'boolean',
		value: true,
		description: 'Automatically load new page on scroll (if off, you click to load)',
	},
	reversePauseIcon: {
		type: 'boolean',
		value: false,
		description: 'Show "paused" bars icon when auto-load is paused and "play" wedge icon when active',
		advanced: true,
	},
	showServerInfo: {
		type: 'boolean',
		value: false,
		description: 'Show the π server / debug details next to the floating Never-Ending Reddit tools',
		advanced: true,
		bodyClass: true,
	},
	pauseAfterEvery: {
		type: 'text',
		value: 0,
		description: 'After auto-loading a certain number of pages, pause the auto-loader<br><br>0 or a negative number means Never-Ending Reddit will only pause when you click the play/pause button in the top right corner.',
	},
	hideDupes: {
		type: 'enum',
		value: 'fade',
		values: [{
			name: 'Fade',
			value: 'fade',
		}, {
			name: 'Hide',
			value: 'hide',
		}, {
			name: 'Do not hide',
			value: 'none',
		}],
		description: 'Fade or completely hide duplicate posts already showing on the page.',
		bodyClass: true,
	},
};
module.exclude = [
	'wiki',
];

const dupeSet = new Set();
let currPage = 1;
let siteTable, $NREPause, isPaused, isLoading, fromBackButton, nextPageURL;

export let progressIndicator;

module.beforeLoad = async function() {
	isPaused = !!(await Storage.get('RESmodules.neverEndingReddit.isPaused'));
};

module.go = function() {
	// code inspired by River of Reddit, but rewritten from scratch to work across multiple browsers...
	// Original River of Reddit author: reddy kapil
	// Original link to Chrome extension: https://chrome.google.com/extensions/detail/bjiggjllfebckflfdjbimogjieeghcpp

	// store access to the siteTable div since that's where we'll append new data...
	siteTable = Thing.thingsContainer();

	if (!siteTable) {
		// Couldn't find anything to work with, abandon ship
		return;
	}

	// get the first link to the next page of reddit...
	const nextPrevLinks = getNextPrevLinks(siteTable);
	if (!nextPrevLinks) return;

	siteTable.classList.add('res-ner-listing');

	// modified from a contribution by Peter Siewert, thanks Peter!
	// use #siteTable in selector to avoid marking duplicates found in spotlight box
	const entries = document.body.querySelectorAll('#siteTable a.comments');
	for (const { href } of entries) {
		dupeSet.add(href);
	}

	const nextLink = nextPrevLinks.next;
	if (nextLink) {
		nextPageURL = nextLink.getAttribute('href');

		attachLoaderWidget();
	}

	if (this.options.returnToPrevPage.value) {
		returnToPrevPageCheck(location.hash);
	}

	// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
	if (this.options.autoLoad.value && nextLink) {
		window.addEventListener('scroll', _.debounce(handleScroll, 300), false);
	}

	$NREPause = $('<div>', {
		id: 'NREPause',
		title: 'Pause / Restart Never Ending Reddit',
		click: () => togglePause(!isPaused),
	});

	if (this.options.reversePauseIcon.value) $NREPause.addClass('reversePause');

	togglePause(isPaused);

	Floater.addElement($NREPause);
};

const pageMarkers = [];

function togglePause(pause, source) {
	isPaused = pause;
	if (isPaused) {
		Storage.set('RESmodules.neverEndingReddit.isPaused', isPaused);
	} else {
		Storage.delete('RESmodules.neverEndingReddit.isPaused');
	}
	if (isPaused) {
		$NREPause.addClass('paused');
		if (source !== 'pauseAfterEvery') {
			Notifications.showNotification({
				moduleID: module.moduleID,
				notificationID: 'paused',
				message: 'Never-Ending Reddit has been paused. Click the play/pause button to unpause it.',
			});
		}
	} else {
		$NREPause.removeClass('paused');
		handleScroll();
	}
	setWidgetActionText();
}

function returnToPrevPageCheck(hash) {
	const pageRE = /page=(\d+)/;
	const match = pageRE.exec(hash);
	// Set the current page to page 1...
	currPage = 1;
	if (match) {
		const backButtonPageNumber = match[1] || 1;
		if (backButtonPageNumber > 1) {
			attachModalWidget();
			currPage = parseInt(backButtonPageNumber, 10) || 1;
			loadNewPage(true);
		}
	}
}

function handleScroll() {
	if (SettingsConsole.isOpen) { // avoid console to close when scrolling
		return;
	}
	const thisPageType = `${pageType()}.${currentSubreddit()}`;
	let thisPageNum = 1;

	for (const pageMarker of pageMarkers) {
		const { top } = $(pageMarker).offset();
		if (top < window.pageYOffset) {
			thisPageNum = pageMarker.getAttribute('id').replace('page-', '');
			currPage = parseInt(thisPageNum, 10) || 1;
			if (pageMarker) {
				Session.set(`RESmodules.neverEndingReddit.lastPage.${thisPageType}`, pageMarker.getAttribute('url'));
			}
		} else {
			break;
		}
	}
	if (thisPageNum !== sessionStorage.NERpage) {
		if (thisPageNum > 1) {
			// sessionStorage.NERpageURL = location.href;
			sessionStorage.NERpage = thisPageNum;
			location.hash = `page=${thisPageNum}`;
		} else {
			if (location.hash.includes('page=')) {
				location.hash = `page=${thisPageNum}`;
			}
			delete sessionStorage.NERpage;
		}
	}
	if (!fromBackButton && module.options.returnToPrevPage.value) {
		for (const link of Array.from(Thing.$things())) {
			if (elementInViewport(link)) {
				const thisClassString = link.getAttribute('class');
				const thisClass = thisClassString.match(/id-t[\d]_[\w]+/);

				if (thisClass) {
					const thisID = thisClass[0];
					Session.set(`RESmodules.neverEndingReddit.lastVisibleIndex.${thisPageType}`, thisID);
					break;
				}
			}
		}
	}
	if (elementInViewport(progressIndicator) && !fromBackButton) {
		if (!isPaused) {
			loadNewPage();
			pauseAfter(thisPageNum);
		}
	}
}

let pauseAfterPages = null;

function pauseAfter(currPageNum) {
	if (pauseAfterPages === null) {
		pauseAfterPages = parseInt(module.options.pauseAfterEvery.value, 10);
	}

	if ((pauseAfterPages > 0) && (currPageNum % pauseAfterPages === 0)) {
		togglePause(true, 'pauseAfterEvery');
		Notifications.showNotification({
			moduleID: module.moduleID,
			optionKey: 'pauseAfterEvery',
			notificationID: 'pauseAfterEvery',
			closeDelay: 5000,
			message: `
			    <p>Time for a break!</p>
			    <p>Never-Ending Reddit has been paused because you've passed ${pauseAfterPages} pages.</p>
			`,
		});
	}
}

function duplicateCheck(newHTML) {
	const newLinks = newHTML.querySelectorAll('div.link');
	for (const newLink of Array.from(newLinks).reverse()) {
		const thisCommentLink = newLink.querySelector('a.comments').href;
		if (dupeSet.has(thisCommentLink)) {
			// let's not remove it altogether, but instead dim it...
			newLink.classList.add('NERdupe');
		} else {
			dupeSet.add(thisCommentLink);
		}
	}
	return newHTML;
}

let $modalWidget, $modalContent;

function attachModalWidget() {
	$modalWidget = $('<div>', { id: 'NERModal', html: '&nbsp;' })
		.appendTo(document.body);

	$modalContent = $('<div>', {
		id: 'NERContent',
		html: `
			<div id="NERModalClose" class="RESCloseButton">&times;</div>
			Never Ending Reddit has detected that you are returning from a page that it loaded. Please give us a moment while we reload that content and return you to where you left off
			<br>
			<span class="RESLoadingSpinner"></span>
		`,
	}).appendTo(document.body);

	$('#NERModalClose').click(() => {
		$modalWidget.hide();
		$modalContent.hide();
	});
}

function attachLoaderWidget() {
	// add a widget at the bottom that will be used to detect that we've scrolled to the bottom, and will also serve as a "loading" bar...
	progressIndicator = document.createElement('div');
	setWidgetActionText();
	progressIndicator.id = 'progressIndicator';
	progressIndicator.className = 'neverEndingReddit';

	progressIndicator.addEventListener('click', e => {
		if (e.target.id !== 'NERStaticLink' && !e.target.classList.contains('gearIcon')) {
			e.preventDefault();
			loadNewPage();
		}
	}, false);
	$(siteTable).after(progressIndicator);
}

export function getNextPrevLinks(ele) {
	const $ele = $(ele || document.body);
	// `~ .nextprev a[rel~=next]` for /about/log, because they aren't in the siteTable.
	// It wouldn't be reddit if it were consistent, would it?
	const links = {
		next: $ele.find('.nextprev a[rel~=next], ~ .nextprev a[rel~=next]')[0],
		prev: $ele.find('.nextprev a[rel~=prev], ~ .nextprev a[rel~=prev]')[0],
	};

	if (!(links.next || links.prev)) return false;

	return links;
}

function setWidgetActionText() {
	$(progressIndicator).empty();
	$('<h2>Never Ending Reddit</h2>')
		.appendTo(progressIndicator)
		.append(SettingsNavigation.makeUrlHashLink('neverEndingReddit', null, ' ', 'gearIcon'));

	let text = 'Click to load the next page';
	if (module.options.autoLoad.value && !isPaused) {
		text = 'scroll or click to load the next page';
	} else if (module.options.autoLoad.value && isPaused) {
		text = 'click to load the next page; or click the "pause" button in the top right corner';
	}

	$('<p class="NERWidgetText" />')
		.text(text)
		.appendTo(progressIndicator);

	const nextpage = $('<a id="NERStaticLink">or open next page</a>')
		.attr('href', nextPageURL)
		.click(() => togglePause(false)); // resume pause on a new page

	$('<p class="NERWidgetText" />').append(nextpage)
		.append('&nbsp;(and clear Never-Ending stream)')
		.appendTo(progressIndicator);
}

async function loadNewPage(fromBackButton) {
	const storageKey = `RESmodules.neverEndingReddit.lastPage.${pageType()}.${currentSubreddit()}`;
	if (!isLoading) {
		isLoading = true;
		if (fromBackButton) {
			fromBackButton = true;
			const savePageURL = nextPageURL;
			nextPageURL = await Session.get(storageKey);
			if (!nextPageURL) {
				// something went wrong, probably someone hit refresh. Just revert to the first page...
				fromBackButton = false;
				nextPageURL = savePageURL;
				currPage = 1;
				isLoading = false;
				return false;
			}
			const leftCentered = Math.floor((window.innerWidth - 720) / 2);
			$modalWidget.show();
			$modalContent.show();
			$modalContent.css('left', `${leftCentered}px`);
			// remove the progress indicator early, as we don't want the user to scroll past it on accident, loading more content.
			progressIndicator.remove();
		} else {
			fromBackButton = false;
		}


		progressIndicator.removeEventListener('click', loadNewPage, false);
		$(progressIndicator).html('<span class="RESLoadingSpinner"></span>');
		// as a sanity check, which should NEVER register true, we'll make sure nextPageURL is on the same domain we're browsing...
		if (nextPageURL && !nextPageURL.includes(location.hostname)) {
			console.log('Next page URL mismatch. Something strange may be afoot.');
			isLoading = false;
			return false;
		}

		let thisHTML;

		try {
			thisHTML = await ajax({ url: nextPageURL });
		} catch (e) {
			NERFail();
			throw e;
		}

		progressIndicator.remove();

		// drop the HTML we got back into a div...
		const tempDiv = document.createElement('div');
		// clear out any javascript so we don't render it again...
		$(tempDiv).html(thisHTML.replace(/<script(.|\s)*?\/script>/g, ''));
		// grab the siteTable out of there...
		const newHTML = Thing.thingsContainer(tempDiv);
		// did we find anything?
		if (newHTML) {
			newHTML.setAttribute('ID', `siteTable-${currPage + 1}`);
			const firstLen = $('body').find('.link:last .rank').text().length;
			let lastLen = $(newHTML).find('.link:last .rank').text().length;
			if (lastLen > firstLen) {
				lastLen = (lastLen * 1.1).toFixed(1);
				addCSS(`body.res > .content .link .rank { width: ${lastLen}ex; }`);
			}
			duplicateCheck(newHTML);
			// check for new mail
			Orangered.updateFromPage(tempDiv);
			// get the new nextLink value for the next page...
			const nextPrevLinks = getNextPrevLinks(tempDiv);
			if (nextPrevLinks) {
				if (isNaN(currPage)) currPage = 1;

				currPage++;

				if (!fromBackButton && module.options.returnToPrevPage.value) {
					Session.set(storageKey, nextPageURL);
				}

				const pageMarker = $('<div>', { id: `page-${currPage}`, class: 'NERPageMarker', text: `Page ${currPage}` })
					.append(SettingsNavigation.makeUrlHashLink('neverEndingReddit', null, ' ', 'gearIcon'))
					.get(0);

				siteTable.appendChild(pageMarker);
				pageMarkers.push(pageMarker);
				siteTable.appendChild(newHTML);
				isLoading = false;

				const nextLink = nextPrevLinks.next;
				if (nextLink) {
					// console.log(nextLink);
					pageMarker.setAttribute('url', nextPageURL);
					if (nextLink.getAttribute('rel').includes('prev')) {
						// remove the progress indicator from the DOM, it needs to go away.
						progressIndicator.style.display = 'none';
						$('<div>', {
							id: 'endOfReddit',
							text: 'You\'ve reached the last page available.  There are no more pages to load.',
						}).appendTo(siteTable);
						window.removeEventListener('scroll', handleScroll, false);
					} else {
						// console.log('not over yet');
						nextPageURL = nextLink.getAttribute('href');
						attachLoaderWidget();
					}
				}

				if ((fromBackButton) && (module.options.returnToPrevPage.value)) {
					// TODO: it'd be great to figure out a better way than a timeout, but this
					// has considerably helped the accuracy of RES's ability to return you to where
					// you left off.
					setTimeout(scrollToLastElement, 4000, newHTML);
				}

				// If we're on the reddit-browsing page (/reddits or /subreddits), add +shortcut and -shortcut buttons...
				if (/^https?:\/\/www\.reddit\.com\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.href)) {
					SubredditManager.browsingReddits();
				}
			}

			if (!(nextPrevLinks && nextPrevLinks.next)) {
				const noresults = tempDiv.querySelector('#noresults');
				const noresultsfound = !!noresults;
				NERFail(noresultsfound);
			}

			window.dispatchEvent(new Event('neverEndingLoad', { bubbles: true, cancelable: true }));
		}
	}
}

async function scrollToLastElement(newHTML) {
	$modalWidget.hide();
	$modalContent.hide();
	const thisPageType = `${pageType()}.${currentSubreddit()}`;
	const lastTopScrolledID = await Session.get(`RESmodules.neverEndingReddit.lastVisibleIndex.${thisPageType}`);
	const lastTopScrolledEle = document.body.querySelector(`.${lastTopScrolledID}`) || Thing.$things(newHTML);
	const { top } = $(lastTopScrolledEle).offset();
	scrollTo(0, top);
	fromBackButton = false;
}

function NERFail(noresults) {
	isLoading = false;

	$('<div>', {
		id: 'NERFail',
		html: `
			<h3>
				${noresults ? 'There doesn\'t seem to be anything here!' : 'Couldn\'t load any more posts'}
				<a target="_blank" href="/r/Enhancement/comments/s72xt/never_ending_reddit_and_reddit_barfing_explained/">(Why not?)</a>
			</h3>
			<p class="nextprev">
				<a href="${location.href.split('#')[0]}">start over</a>
				<a href="${nextPageURL}">try again</a>
				<a href="/r/random">check out a random subreddit</a>
			</p>
		`,
		style: 'cursor: auto !important',
	}).appendTo(siteTable);

	if ($modalWidget) {
		$modalWidget.hide();
		$modalContent.hide();
	}
}
