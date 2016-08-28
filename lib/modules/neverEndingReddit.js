import _ from 'lodash';
import { $ } from '../vendor';
import { go } from '../core/init';
import { Storage, ajax } from '../environment';
import {
	Thing,
	addCSS,
	elementInViewport,
	scrollToElement,
} from '../utils';
import * as Floater from './floater';
import * as Notifications from './notifications';
import * as Orangered from './orangered';
import * as SelectedEntry from './selectedEntry';
import * as SettingsConsole from './settingsConsole';
import * as SettingsNavigation from './settingsNavigation';

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
		value: 'hide',
		values: [{
			name: 'Hide',
			value: 'hide',
		}, {
			name: 'Fade',
			value: 'fade',
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
	'comments',
];

const dupeSet = new Set();
let currPage = 1;
let siteTable, $NREPause, isPaused, pauseReason, nextPageURL;
let failMarker, lastPageMarker;

export let progressIndicator;
export let loadPromise;

module.beforeLoad = async () => {
	[isPaused, pauseReason] = await Promise.all([
		Storage.get('RESmodules.neverEndingReddit.isPaused'),
		Storage.get('RESmodules.neverEndingReddit.pauseReason'),
	]);

	if (module.options.returnToPrevPage.value) initiateReturnToPrevPage();
};

module.go = () => {
	// code inspired by River of Reddit, but rewritten from scratch to work across multiple browsers...
	// Original River of Reddit author: reddy kapil
	// Original link to Chrome extension: https://chrome.google.com/extensions/detail/bjiggjllfebckflfdjbimogjieeghcpp

	// store access to the siteTable div since that's where we'll append new data...
	siteTable = Thing.thingsContainer();
	const nextPrevLinks = siteTable && getNextPrevLinks(siteTable);

	if (nextPrevLinks && nextPrevLinks.next) {
		nextPageURL = nextPrevLinks.next.getAttribute('href');
		initiate(nextPrevLinks.next);
	}
};

function initiate(nextLink) {
	siteTable.classList.add('res-ner-listing');

	// modified from a contribution by Peter Siewert, thanks Peter!
	// use #siteTable in selector to avoid marking duplicates found in spotlight box
	const entries = document.body.querySelectorAll('#siteTable a.comments');
	for (const { href } of entries) {
		dupeSet.add(href);
	}

	attachLoaderWidget();
	addPauseControls();

	// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
	if (module.options.autoLoad.value && nextLink) {
		window.addEventListener('scroll', _.debounce(handleScroll, 300));
	}
}

function addPauseControls() {
	$NREPause = $('<div>', {
		id: 'NREPause',
		title: 'Pause / Restart Never Ending Reddit',
		click: () => togglePause(!isPaused, 'manual'),
	});

	if (module.options.reversePauseIcon.value) $NREPause.addClass('reversePause');

	Floater.addElement($NREPause);
	// set up initial state of NER bar
	togglePause(isPaused, pauseReason);
}

function togglePause(pause, source) {
	isPaused = pause;
	pauseReason = source;

	if (isPaused) {
		Storage.set('RESmodules.neverEndingReddit.isPaused', isPaused);
		Storage.set('RESmodules.neverEndingReddit.pauseReason', source);
	} else {
		Storage.delete('RESmodules.neverEndingReddit.isPaused');
		Storage.delete('RESmodules.neverEndingReddit.pauseReason');
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

function initiateReturnToPrevPage() {
	// Only restore state if user returned here
	const returned = performance.navigation.TYPE_BACK_FORWARD === performance.navigation.type;

	if (
		returned &&
		history.state &&
		Number.isInteger(history.state.resRestorePage) &&
		(history.state.resRestoreURL || '').includes(location.hostname)
	) {
		({ resRestorePage: currPage, resRestoreURL: nextPageURL } = history.state);
		returnToPrevPage();
	}

	SelectedEntry.addListener(selected => {
		if (!selected) return;

		let resRestorePage = null;
		let resRestoreURL = null;

		const pageMarker = $(selected.$thing).closest('.sitetable').prev('.NERPageMarker').get(0);
		if (pageMarker) {
			// Do not have the browser auto-scroll when returning to this page
			// returnToPrevPage will scroll to the pagemarker when ready
			history.scrollRestoration = 'manual';

			({ currPage: resRestorePage, nextPageURL: resRestoreURL } = pageMarker);
		}

		history.replaceState(
			{ resRestorePage, resRestoreURL },
			`${document.title}${resRestorePage ? `- page ${resRestorePage}` : ''}`
		);
	});
}

async function returnToPrevPage() {
	attachModalWidget();

	$modalWidget.show();
	$modalContent.show();

	loadNewPage();

	try {
		await loadPromise;
		scrollToElement(lastPageMarker, { scrollStyle: 'top' });
	} catch (e) { /* empty */ }

	$modalWidget.hide();
	$modalContent.hide();
}

function handleScroll() {
	if (
		!loadPromise &&
		!isPaused &&
		!SettingsConsole.isOpen && // avoid console to close when scrolling
		elementInViewport(progressIndicator)
	) {
		loadNewPage();
	}
}

function refreshPauseAfter() {
	const pauseAfterPages = parseInt(module.options.pauseAfterEvery.value, 10);

	if ((pauseAfterPages > 0) && (currPage % pauseAfterPages === 0)) {
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
}

let $modalWidget, $modalContent;

function attachModalWidget() {
	$modalWidget = $('<div>', { id: 'NERModal', html: '&nbsp;' })
		.appendTo(document.body);

	$modalContent = $('<div>', {
		id: 'NERContent',
		html: `
			<div id="NERModalClose" class="RESCloseButton">&times;</div>
			Never Ending Reddit has detected that you are returning from a page that it loaded. Please give us a moment while we reload that content and return you to where you left off.
			<div class="RESCenteredLoadIndicator"><span class="RESLoadingSpinner"></span></div>
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

	progressIndicator.addEventListener('click', onClickProgressIndicator);
	$(siteTable).after(progressIndicator);
}

function onClickProgressIndicator(e) {
	if (e.target.id !== 'NERStaticLink' && !e.target.classList.contains('gearIcon')) {
		e.preventDefault();
		loadNewPage();
	}
}

export function getNextPrevLinks(ele = document.body) {
	const $ele = $(ele);
	// `~ .nextprev a[rel~=next]` for /about/log, because they aren't in the siteTable.
	// It wouldn't be reddit if it were consistent, would it?
	const links = {
		next: $ele.find('.nextprev a[rel~=next], ~ .nextprev a[rel~=next]')[0],
		prev: $ele.find('.nextprev a[rel~=prev], ~ .nextprev a[rel~=prev]')[0],
	};

	return (links.next || links.prev) ? links : null;
}

function setWidgetActionText() {
	$(progressIndicator).empty();
	$('<h2>Never Ending Reddit</h2>')
		.appendTo(progressIndicator)
		.append(SettingsNavigation.makeUrlHashLink(module.moduleID, null, ' ', 'gearIcon'));

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
		.click(e => {
			// avoid trying to load a new page before we navigate
			e.stopPropagation();
			// resume pause on a new page
			if (pauseReason === 'pauseAfterEvery') togglePause(false);
		});

	$('<p class="NERWidgetText" />').append(nextpage)
		.append('&nbsp;(and clear Never-Ending stream)')
		.appendTo(progressIndicator);
}

async function loadNewPage() {
	if (loadPromise) return;

	if (failMarker) failMarker.remove();

	loadPromise = Promise.all([ajax({ url: nextPageURL }), go]);

	if (progressIndicator) {
		progressIndicator.removeEventListener('click', onClickProgressIndicator);
		$(progressIndicator).html('<span class="RESLoadingSpinner"></span>');
	}

	const removeProgressIndicator = () => { if (progressIndicator) progressIndicator.remove(); };
	loadPromise.then(removeProgressIndicator, removeProgressIndicator);

	try {
		const html = (await loadPromise)[0];

		// drop the HTML we got back into a div...
		const tempDiv = document.createElement('div');
		// clear out any javascript so we don't render it again...
		$(tempDiv).html(html.replace(/<script(.|\s)*?\/script>/g, ''));

		// check for new mail
		Orangered.updateFromPage(tempDiv);

		appendPage(tempDiv);
	} catch (e) {
		NERFail(`Could not load the next page: ${e.message}`);
		console.error(e);
	}

	loadPromise = null;
	if (nextPageURL) attachLoaderWidget();
}

function appendPage(tempDiv) {
	// grab the siteTable out of there...
	const newHTML = Thing.thingsContainer(tempDiv);
	if (!newHTML) {
		throw Error('Could not find any things');
	}

	const firstLen = $(document.body).find('.link:last .rank').text().length;
	const lastLen = $(newHTML).find('.link:last .rank').text().length;
	if (lastLen > firstLen) {
		addCSS(`body.res > .content .link .rank { width: ${(lastLen * 1.1).toFixed(1)}ex; }`);
	}

	// get the new nextLink value for the next page...
	const nextPrevLinks = getNextPrevLinks(tempDiv);
	if (nextPrevLinks) {
		duplicateCheck(newHTML);

		lastPageMarker = $('<div>', { class: 'NERPageMarker', text: `Page ${currPage + 1}` })
			.append(SettingsNavigation.makeUrlHashLink(module.moduleID, null, ' ', 'gearIcon'))
			.get(0);
		Object.assign(lastPageMarker, { currPage, nextPageURL });

		siteTable.appendChild(lastPageMarker);
		siteTable.appendChild(newHTML);

		currPage++;
		nextPageURL = nextPrevLinks.next && nextPrevLinks.next.getAttribute('href');

		refreshPauseAfter();

		if (!nextPageURL) {
			$('<div>', {
				class: 'NERPageMarker',
				text: 'You\'ve reached the end of reddit. There are no more pages to load.',
			}).appendTo(siteTable);

			window.removeEventListener('scroll', handleScroll);
			progressIndicator.removeEventListener('click', onClickProgressIndicator);
		}
	} else {
		if (tempDiv.querySelector('#noresults')) throw Error('No results');
		else throw Error('Could not continue');
	}

	window.dispatchEvent(new Event('neverEndingLoad', { bubbles: true, cancelable: true }));
}

function NERFail(message) {
	failMarker = $('<div>', {
		id: 'NERFail',
		html: `
			<h3>
				${message}
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
