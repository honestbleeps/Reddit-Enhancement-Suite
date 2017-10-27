/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Init from '../core/init';
import { Storage, ajax } from '../environment';
import {
	Thing,
	addCSS,
	elementInViewport,
	scrollToElement,
	fastAsync,
	newSitetable,
	watchForElements,
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
		description: 'nerReturnToPrevPageDesc',
		title: 'nerReturnToPrevPageTitle',
	},
	autoLoad: {
		type: 'boolean',
		value: true,
		description: 'nerAutoLoadDesc',
		title: 'nerAutoLoadTitle',
	},
	pauseAfterEvery: {
		dependsOn: options => options.autoLoad.value,
		type: 'text',
		value: '0',
		description: 'nerPauseAfterEveryDesc',
		title: 'nerPauseAfterEveryTitle',
	},
	showPauseButton: {
		dependsOn: options => options.autoLoad.value,
		type: 'boolean',
		value: true,
		description: 'nerShowPauseButtonDesc',
		title: 'nerShowPauseButtonTitle',
	},
	reversePauseIcon: {
		dependsOn: options => options.autoLoad.value,
		type: 'boolean',
		value: false,
		description: 'nerReversePauseIconDesc',
		title: 'nerReversePauseIconTitle',
		advanced: true,
	},
	hideDupes: {
		type: 'enum',
		value: 'hide',
		values: [{
			name: 'nerHideDupesHide',
			value: 'hide',
		}, {
			name: 'nerHideDupesFade',
			value: 'fade',
		}, {
			name: 'nerHideDupesDontHide',
			value: 'none',
		}],
		description: 'nerHideDupesDesc',
		title: 'nerHideDupesTitle',
		bodyClass: true,
	},
	showServerInfo: {
		type: 'boolean',
		value: false,
		description: 'nerShowServerInfoDesc',
		title: 'nerShowServerInfoTitle',
		advanced: true,
		bodyClass: true,
	},
};
module.exclude = [
	'wiki',
	'comments',
];

const dupeSet = new Set();
const siteTable = _.once(() => Thing.thingsContainer());
let currPage = 1;
let nextPageURL;
let $NREPause, isPaused, pauseReason, pauseAfterPages, nextPausePage;
let scrollListenerAttached = false;

let loaderWidget;
export let loadPromise;

const isPausedStorage = Storage.wrap('RESmodules.neverEndingReddit.isPaused', false);
const pauseReasonStorage = Storage.wrap('RESmodules.neverEndingReddit.pauseReason', (null: void | null | 'manual' | 'pauseAfterEvery'));

module.beforeLoad = async () => {
	[isPaused, pauseReason] = await Promise.all([
		isPausedStorage.get(),
		pauseReasonStorage.get(),
	]);

	if (module.options.hideDupes.value !== 'none') {
		// use #siteTable in selector to avoid marking duplicates found in spotlight box
		watchForElements(['siteTable'], '#siteTable div.link', handleDupes, { immediate: true });
	}

	if (module.options.returnToPrevPage.value) initiateReturnToPrevPage();
};

module.go = () => {
	// code inspired by River of Reddit, but rewritten from scratch to work across multiple browsers...
	// Original River of Reddit author: reddy kapil
	// Original link to Chrome extension: https://chrome.google.com/extensions/detail/bjiggjllfebckflfdjbimogjieeghcpp

	if (!siteTable()) return;

	try {
		const nextLink = getNextPrevLinks(siteTable()).next;
		nextPageURL = nextPageURL || nextLink && nextLink.getAttribute('href');
	} catch (e) { /* empty */ }

	if (nextPageURL) initiate();
};

function initiate() {
	siteTable().classList.add('res-ner-listing');

	attachLoaderWidget(buildLoaderWidget());

	if (module.options.autoLoad.value) {
		if (module.options.showPauseButton.value) {
			addPauseControls();
		}
		// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
		window.addEventListener('scroll', _.debounce(handleScroll, 300));
		scrollListenerAttached = true;

		SelectedEntry.addListener(selected => {
			if (!selected || isPaused) return;

			const things = Thing.visibleThingElements();
			if (things.indexOf(selected.element) + 2 > things.length) {
				// nearing the bottom of the list, so initiate load of next page
				loadNextPage();
			}
		});
	}
}

function addPauseControls() {
	$NREPause = $('<div>', {
		id: 'NREPause',
		title: 'Pause / Restart Never Ending Reddit',
		click: () => togglePause(!isPaused, 'manual', 'Never-Ending Reddit has been paused. Click the play/pause button to unpause it.'),
	});

	if (module.options.reversePauseIcon.value) $NREPause.addClass('reversePause');

	Floater.addElement($NREPause);

	pauseAfterPages = parseInt(module.options.pauseAfterEvery.value, 10) || Infinity;
	// set up initial state of NER bar
	togglePause(isPaused, pauseReason);
}

function togglePause(pause, source, pauseMessage) {
	isPaused = pause;
	pauseReason = source;

	if (isPaused) {
		isPausedStorage.set(isPaused);
		pauseReasonStorage.set(source);
	} else {
		isPausedStorage.delete();
		pauseReasonStorage.delete();
	}

	setLoaderWidgetActionText(loaderWidget);

	if (isPaused) {
		if ($NREPause) $NREPause.addClass('paused');
		if (pauseMessage) {
			Notifications.showNotification({
				moduleID: module.moduleID,
				notificationID: source || undefined,
				message: pauseMessage,
			});
		}
	} else {
		nextPausePage = currPage + pauseAfterPages;

		if ($NREPause) $NREPause.removeClass('paused');
		if (scrollListenerAttached) handleScroll();
	}
}

const isNerUrl = () => (/^#res:ner-page=\d+/).test(location.hash);

export function resetReturnToPage() {
	if (!Modules.isRunning(module)) return;
	if (!module.options.returnToPrevPage.value) return;
	setReturnToPage(null);
}

function setReturnToPage(selected: ?Thing) {
	let resRestorePage = 0;
	let resRestoreURL = null;
	let resRestoreHTML = null;
	let pageMarker;

	if (selected) {
		const $pageMarker = $(selected.element).closest('.sitetable, .search-result-listing').prev('.NERPageMarker');
		pageMarker = $pageMarker.get(0);
		if (pageMarker) ({ currPage: resRestorePage, nextPageURL: resRestoreURL, pageHTML: resRestoreHTML } = $pageMarker.data());
	}

	// replaceState is expensive, so avoid it when possible
	if (history.state && history.state.resRestorePage === resRestorePage) return;

	// If on page > 2, the browser will auto-scroll too far
	const allowAutoScroll = !pageMarker || document.querySelector('.NERPageMarker') === pageMarker;
	history.scrollRestoration = allowAutoScroll ? 'auto' : 'manual';

	history.replaceState(
		{ ...history.state, resRestorePage, resRestoreURL, resRestoreHTML },
		`${document.title}${resRestorePage ? `- page ${resRestorePage + 1}` : ''}`,
		resRestorePage ? `#res:ner-page=${resRestorePage + 1}` : `${location.pathname}${location.search}${isNerUrl() ? '' : location.hash}`
	);
}

function initiateReturnToPrevPage() {
	if (
		isNerUrl() &&
		history.state &&
		Number.isInteger(history.state.resRestorePage) &&
		history.state.resRestoreHTML && history.state.resRestoreHTML.length
	) {
		let html;
		({ resRestorePage: currPage, resRestoreURL: nextPageURL, resRestoreHTML: html } = history.state); // eslint-disable-line prefer-const
		appendPage($(html).get(0));
	}

	SelectedEntry.addListener(setReturnToPage, 'beforeScroll');
}

function handleScroll() {
	if (
		!loadPromise &&
		!isPaused &&
		!SettingsConsole.isOpen && // avoid console to close when scrolling
		!pauseAfterPage() &&
		elementInViewport(loaderWidget)
	) {
		loadNextPage();
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

function handleDupes(element: *) {
	const id = Thing.checkedFrom(element).getFullname();

	if (dupeSet.has(id)) {
		if (module.options.hideDupes.value === 'fade') {
			element.classList.add('NERdupe');
		} else if (module.options.hideDupes.value === 'hide') {
			element.remove();
		}
	} else {
		dupeSet.add(id);
	}
}

export function getNextPrevLinks(ele: HTMLElement = document.body): { next?: HTMLAnchorElement, prev?: HTMLAnchorElement } {
	const $ele = $(ele);
	// `~ .nextprev a[rel~=next]` for /about/log, because they aren't in the siteTable.
	// It wouldn't be reddit if it were consistent, would it?
	const links = {
		next: ($ele.find('.nextprev a[rel~=next], ~ .nextprev a[rel~=next]')[0]: any),
		prev: ($ele.find('.nextprev a[rel~=prev], ~ .nextprev a[rel~=prev]')[0]: any),
	};

	if (!links.next && !links.prev) throw new Error('Could not find any .nextprev links');
	return links;
}

function buildLoaderWidget() {
	// add a widget at the bottom that will be used to detect that we've scrolled to the bottom, and will also serve as a "loading" bar...
	const widget = document.createElement('div');
	setLoaderWidgetActionText(widget);
	widget.id = 'progressIndicator';
	widget.className = 'neverEndingReddit';

	widget.addEventListener('click', (e: Event) => { if (e.target.tagName !== 'A') loadNextPage(); });

	return widget;
}

function attachLoaderWidget(widget) {
	loaderWidget = widget;
	$(siteTable()).after(widget);
}

function setLoaderWidgetActionText(widget) {
	$(widget).empty();
	$('<h2>Never Ending Reddit</h2>')
		.appendTo(widget)
		.append(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'));

	let text = 'Click to load the next page';
	if (module.options.autoLoad.value && !isPaused) {
		text = 'scroll or click to load the next page';
	} else if (module.options.autoLoad.value && isPaused) {
		text = 'click to load the next page; or click the "pause" button in the top right corner';
	}

	$('<p class="NERWidgetText" />')
		.text(text)
		.appendTo(widget);

	const nextpage = $('<a id="NERStaticLink">or open next page</a>')
		.attr('href', nextPageURL || '')
		.click(() => {
			loadPromise = true; // avoid trying to load a new page before we navigate
			if (pauseReason === 'pauseAfterEvery') togglePause(false);
		});

	$('<p class="NERWidgetText" />').append(nextpage)
		.append('&nbsp;(and clear Never-Ending stream)')
		.appendTo(widget);
}

export function loadNextPage(scrollToLoadWidget: boolean = false) {
	if (!nextPageURL) return;

	if (!loadPromise) {
		loadPromise = loadPage(nextPageURL).then(() => { loadPromise = null; });
	}

	if (scrollToLoadWidget) scrollToElement(loaderWidget, { scrollStyle: 'middle', direction: 'down' });

	return loadPromise;
}

async function loadPage(url: string) {
	const page = ajax({ url });

	if (loaderWidget) {
		$(loaderWidget).html('<span class="RESLoadingSpinner"></span>');
	}

	const newLoaderWidget = buildLoaderWidget();

	try {
		const html = (await page)
			// remove some elements which may have side-effects when parsed
			.replace(/<style(.|\s)*?>|<link(.|\s)*?>|<script(.|\s)*?\/script>/g, '');

		const tempDiv = $('<div>').html(html).get(0);

		// check for new mail
		Orangered.updateFromPage(tempDiv);

		try {
			const nextLink = getNextPrevLinks(tempDiv).next;
			nextPageURL = nextLink && nextLink.getAttribute('href');
		} catch (e) {
			const noresults = tempDiv.querySelector('#noresults');
			if (noresults) {
				return endNER(noresults.textContent);
			} else {
				throw Error('Could not find a link to the next page');
			}
		}

		// grab the siteTable out of there...
		const newSiteTable = Thing.thingsContainer(tempDiv);
		if (!newSiteTable) {
			throw Error('Could not find any siteTable');
		}

		const pageHTML = newSiteTable.outerHTML;
		await newSitetable(newSiteTable);
		await appendPage(newSiteTable, pageHTML);
	} catch (e) {
		endNER(`Could not load the next page: ${e.message}`);
		console.error(e);
	}

	if (loaderWidget) loaderWidget.remove();
	if (nextPageURL) attachLoaderWidget(newLoaderWidget);
}

const appendPage = fastAsync(function*(newSiteTable, pageHTML = newSiteTable.outerHTML) {
	const lastPageMarker = $('<div>', { class: 'NERPageMarker', text: `Page ${currPage + 1}` })
		.append(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))
		.data({ currPage, nextPageURL, pageHTML })
		.get(0);

	yield Init.bodyReady;

	const firstLen = $(siteTable()).find('.link:last .rank').text().length;
	const lastLen = $(newSiteTable).find('.link:last .rank').text().length;
	if (lastLen > firstLen) {
		addCSS(`body.res > .content .link .rank { width: ${(lastLen * 1.1).toFixed(1)}ex; }`);
	}

	siteTable().appendChild(lastPageMarker);
	siteTable().appendChild(newSiteTable);

	currPage++;

	if (!nextPageURL) endNER('No more pages');

	window.dispatchEvent(new Event('neverEndingLoad', { bubbles: true, cancelable: true }));
});

function endNER(text) {
	nextPageURL = null;

	$('<div>', {
		class: 'NERPageMarker NERPageMarkerLast',
		text,
	})
	.append(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))
	.append(`
		<p class="nextprev">
			<a href="${location.href.split('#')[0]}">start over</a>
			<a href="${nextPageURL || ''}">try again</a>
			<a target="_blank" rel="noopener noreferer" href="/r/Enhancement/wiki/faq/never_ending_reddit">learn more</a>
			<a href="/r/random">random subreddit</a>
		</p>
	`)
	.appendTo(siteTable());

	window.removeEventListener('scroll', handleScroll);
}
