/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Init from '../core/init';
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

export const module: Module<*> = new Module('neverEndingReddit');

module.moduleName = 'nerName';
module.category = 'browsingCategory';
module.description = 'nerDesc';
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
	pauseAfterEvery: {
		dependsOn: 'autoLoad',
		type: 'text',
		value: '0',
		description: 'After auto-loading a certain number of pages, pause the auto-loader<br><br>0 or a negative number means Never-Ending Reddit will only pause when you click the play/pause button in the top right corner.',
	},
	reversePauseIcon: {
		dependsOn: 'autoLoad',
		type: 'boolean',
		value: false,
		description: 'Show "paused" bars icon when auto-load is paused and "play" wedge icon when active',
		advanced: true,
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
	showServerInfo: {
		type: 'boolean',
		value: false,
		description: 'Show the π server / debug details next to the floating Never-Ending Reddit tools',
		advanced: true,
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
let pauseAfterPages, nextPausePage;

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
		initiate();
	}
};

function initiate() {
	siteTable.classList.add('res-ner-listing');

	// modified from a contribution by Peter Siewert, thanks Peter!
	// use #siteTable in selector to avoid marking duplicates found in spotlight box
	const entries: NodeList<HTMLAnchorElement> = (document.body.querySelectorAll('#siteTable a.comments'): any);
	for (const { href } of entries) {
		dupeSet.add(href);
	}

	attachLoaderWidget();

	if (module.options.autoLoad.value) {
		addPauseControls();
		// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
		window.addEventListener('scroll', _.debounce(handleScroll, 300));

		SelectedEntry.addListener(selected => {
			if (!selected || isPaused) return;

			const things = Thing.visibleThingElements();
			if (things.indexOf(selected.element) + 2 > things.length) {
				// nearing the bottom of the list, so initiate load of next page
				loadNewPage();
			}
		});
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

	pauseAfterPages = parseInt(module.options.pauseAfterEvery.value, 10) || Infinity;
	// set up initial state of NER bar
	togglePause(isPaused, pauseReason);
}

function togglePause(pause, source, pauseMessage = 'Never-Ending Reddit has been paused. Click the play/pause button to unpause it.') {
	isPaused = pause;
	pauseReason = source;

	if (isPaused) {
		Storage.set('RESmodules.neverEndingReddit.isPaused', isPaused);
		Storage.set('RESmodules.neverEndingReddit.pauseReason', source);
	} else {
		Storage.delete('RESmodules.neverEndingReddit.isPaused');
		Storage.delete('RESmodules.neverEndingReddit.pauseReason');
	}

	setWidgetActionText();

	if (isPaused) {
		$NREPause.addClass('paused');
		Notifications.showNotification({
			moduleID: module.moduleID,
			notificationID: source || undefined,
			message: pauseMessage,
		});
	} else {
		nextPausePage = currPage + pauseAfterPages;

		$NREPause.removeClass('paused');
		handleScroll();
	}
}

function initiateReturnToPrevPage() {
	const nerHashRegex = /^#res:ner-page=\d+/;

	if (
		nerHashRegex.test(location.hash) &&
		history.state &&
		Number.isInteger(history.state.resRestorePage) &&
		(history.state.resRestoreURL || '').includes(location.hostname)
	) {
		({ resRestorePage: currPage, resRestoreURL: nextPageURL } = history.state);
		returnToPrevPage();
	}

	function setReturnToPage(selected) {
		let resRestorePage = 0;
		let resRestoreURL = null;

		const $pageMarker = $(selected.$thing).closest('.sitetable, .search-result-listing').prev('.NERPageMarker');
		if ($pageMarker.length) ({ currPage: resRestorePage, nextPageURL: resRestoreURL } = $pageMarker.data());

		// Do not have the browser auto-scroll when returning to this page
		// returnToPrevPage will scroll to the pagemarker when ready
		history.scrollRestoration = $pageMarker.length ? 'manual' : 'auto';

		history.replaceState(
			{ ...history.state, resRestorePage, resRestoreURL },
			`${document.title}${resRestorePage ? `- page ${resRestorePage + 1}` : ''}`,
			// spread because Edge always coerces the third param to string, even `undefined`
			...(($pageMarker.length || nerHashRegex.test(location.hash)) ? [`#res:ner-page=${resRestorePage + 1}`] : [])
		);
	}

	SelectedEntry.addListener(selected => { if (selected) setReturnToPage(selected); }, 'beforeScroll');
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
		elementInViewport(progressIndicator) &&
		!pauseAfterPage()
	) {
		loadNewPage();
	}
}

function pauseAfterPage() {
	if (currPage + 1 === nextPausePage) {
		const message = `
			    <p>Time for a break!</p>
			    <p>Never-Ending Reddit has been paused because you've passed ${pauseAfterPages} pages.</p>
			`;

		togglePause(true, 'pauseAfterEvery', message);
		return true;
	}
}

function duplicateCheck(newHTML) {
	const newLinks = newHTML.querySelectorAll('div.link');
	for (const newLink of Array.from(newLinks).reverse()) {
		const thisCommentLink = (newLink.querySelector('a.comments'): any).href;
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

	progressIndicator.addEventListener('click', (e: Event) => { if (e.target.tagName !== 'A') loadNewPage(); });
	$(siteTable).after(progressIndicator);
}

export function getNextPrevLinks(ele: HTMLElement = document.body): ?{ next?: HTMLAnchorElement, prev?: HTMLAnchorElement } {
	const $ele = $(ele);
	// `~ .nextprev a[rel~=next]` for /about/log, because they aren't in the siteTable.
	// It wouldn't be reddit if it were consistent, would it?
	const links = {
		next: ($ele.find('.nextprev a[rel~=next], ~ .nextprev a[rel~=next]')[0]: any),
		prev: ($ele.find('.nextprev a[rel~=prev], ~ .nextprev a[rel~=prev]')[0]: any),
	};

	return (links.next || links.prev) ? links : null;
}

function setWidgetActionText() {
	$(progressIndicator).empty();
	$('<h2>Never Ending Reddit</h2>')
		.appendTo(progressIndicator)
		.append(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'));

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
		.attr('href', nextPageURL || '')
		.click(() => {
			loadPromise = true; // avoid trying to load a new page before we navigate
			if (pauseReason === 'pauseAfterEvery') togglePause(false);
		});

	$('<p class="NERWidgetText" />').append(nextpage)
		.append('&nbsp;(and clear Never-Ending stream)')
		.appendTo(progressIndicator);
}

async function loadNewPage() {
	if (loadPromise) return;

	if (failMarker) failMarker.remove();

	if (!nextPageURL) throw new Error(`Cannot load new page: ${String(nextPageURL)}.`);

	loadPromise = Promise.all([ajax({ url: nextPageURL }), Init.go]);

	if (progressIndicator) {
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
			.append(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))
			.data({ currPage, nextPageURL })
			.get(0);

		siteTable.appendChild(lastPageMarker);
		siteTable.appendChild(newHTML);

		currPage++;
		nextPageURL = nextPrevLinks.next && nextPrevLinks.next.getAttribute('href');

		if (!nextPageURL) {
			$('<div>', {
				class: 'NERPageMarker',
				text: 'You\'ve reached the end of reddit. There are no more pages to load.',
			}).appendTo(siteTable);

			window.removeEventListener('scroll', handleScroll);
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
				<a target="_blank" rel="noopener noreferer" href="/r/Enhancement/comments/s72xt/never_ending_reddit_and_reddit_barfing_explained/">(Why not?)</a>
			</h3>
			<p class="nextprev">
				<a href="${location.href.split('#')[0]}">start over</a>
				<a href="${nextPageURL || ''}">try again</a>
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
