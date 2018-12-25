/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { RES_NER_PAGE_HASH } from '../constants/urlHashes';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Init from '../core/init';
import { Storage, ajax } from '../environment';
import {
	HOUR,
	Thing,
	addCSS,
	scrollToElement,
	fastAsync,
	registerPage,
	watchForThings,
	documentLoggedInUser,
	loggedInUser,
	isCurrentSubreddit,
	mutex,
	string,
} from '../utils';
import * as Floater from './floater';
import * as Notifications from './notifications';
import * as Orangered from './orangered';
import * as SelectedEntry from './selectedEntry';
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
		advanced: true,
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
	'd2x',
];
module.shouldRun = () => !isCurrentSubreddit('dashboard');

const dupeSet = new Set();
const siteTable = _.once(() => Thing.thingsContainer());
let currentPageNumber = 1;
let nextPageUrl;
let $NREPause, isPaused, pauseReason, pauseAfterPages, nextPausePage;

let initAutoNextPage: ?() => void;
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
		watchForThings(['post'], thing => {
			// `#siteTable` to avoid processing posts found in spotlight box
			if (!thing.element.closest('#siteTable')) return;
			handleDupes(thing);
		}, { immediate: true });
	}

	if (module.options.returnToPrevPage.value) initiateReturnToPrevPage();
};

module.go = () => {
	// code inspired by River of Reddit, but rewritten from scratch to work across multiple browsers...
	// Original River of Reddit author: reddy kapil
	// Original link to Chrome extension: https://chrome.google.com/extensions/detail/bjiggjllfebckflfdjbimogjieeghcpp

	if (!siteTable()) return;

	if (!nextPageUrl) { // May be restored from returnToPrevPage
		try {
			const nextLink = getNextPrevLinks(siteTable()).next;
			nextPageUrl = nextLink && nextLink.getAttribute('href');
		} catch (e) { /* empty */ }
	}

	if (nextPageUrl) initiate();
};

function initiate() {
	siteTable().classList.add('res-ner-listing');

	if (!loaderWidget) attachLoaderWidget(buildLoaderWidget());

	if (module.options.autoLoad.value) {
		if (module.options.showPauseButton.value) {
			addPauseControls();
		}

		SelectedEntry.addListener(selected => {
			if (!selected || isPaused) return;

			const things = Thing.visibleThingElements();
			const distanceFromBottom = things.length - (things.indexOf(selected.element) + 1);
			if (distanceFromBottom === 1) prefetchNextPage();
			else if (distanceFromBottom < 1) loadNextPage();
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
		nextPausePage = currentPageNumber + pauseAfterPages;

		if ($NREPause) $NREPause.removeClass('paused');
		if (initAutoNextPage) initAutoNextPage();
	}
}

const isNerUrl = () => location.hash.startsWith(RES_NER_PAGE_HASH);

export function resetReturnToPage() {
	if (!Modules.isRunning(module)) return;
	if (!module.options.returnToPrevPage.value) return;
	setReturnToPage(null);
}

const pages: {
	[number: number]: {
		url: string,
		nextPageUrl: ?string,
		html: string,
	},
} = {};
let storeHtml = true;

function setReturnToPage(selected: ?Thing) {
	if (!selected) return;

	let number = 1;

	const $earlierMarkers = $(selected.element).prevAll('.NERPageMarker');
	const marker = $earlierMarkers.get(0);
	if (marker) number = parseInt(marker.dataset.number, 10);

	// replaceState is expensive, so avoid it when possible
	const { ner: saved } = history.state || {};
	if (saved && saved.number === number) return;

	// After appended page number two, the browser will auto-scroll too far
	const allowAutoScroll = $earlierMarkers.length < 2;
	history.scrollRestoration = allowAutoScroll ? 'auto' : 'manual';

	try {
		history.replaceState(
			{ ...history.state, ner: { number, ...pages[number], ...(storeHtml ? {} : { html: null }) } },
			`${document.title}${number > 1 ? `- page ${number}` : ''}`,
			number > 1 ? `${RES_NER_PAGE_HASH}=${number}` : `${location.pathname}${location.search}${isNerUrl() ? '' : location.hash}`
		);
	} catch (e) {
		const firefoxFix = process.env.BUILD_TARGET === 'firefox' && e.name === 'NS_ERROR_ILLEGAL_VALUE' && 'To fix this, go to about:config and increase browser.history.maxStateObjectSize' || '';
		console.error('Could not store complete neverEndingReddit state.', firefoxFix, e);
		storeHtml = false;
	}
}

function initiateReturnToPrevPage() {
	SelectedEntry.addListener(setReturnToPage, 'beforeScroll');

	if (isNerUrl()) {
		const { ner } = history.state || {};
		if (!ner) return;

		const { url, html } = ner;
		({ number: currentPageNumber, nextPageUrl } = ner);

		if (html) {
			pages[currentPageNumber] = { url, nextPageUrl, html };
			appendPage($(html).get(0));
		} else {
			loadPage(url);
		}
	}
}

function pauseAfterPage() {
	if (currentPageNumber + 1 === nextPausePage) {
		const message = `
			    <p>Time for a break!</p>
			    <p>Never-Ending Reddit has been paused because you've passed ${pauseAfterPages} pages.</p>
			`;

		togglePause(true, 'pauseAfterEvery', message);
		return true;
	}
}

function handleDupes(thing: *) {
	const id = thing.getFullname();

	if (dupeSet.has(id)) {
		if (module.options.hideDupes.value === 'fade') {
			thing.element.classList.add('NERdupe');
		} else if (module.options.hideDupes.value === 'hide') {
			thing.element.remove();
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
		.attr('href', nextPageUrl || '')
		.click(() => {
			loadPromise = true; // avoid trying to load a new page before we navigate
			if (pauseReason === 'pauseAfterEvery') togglePause(false);
		});

	$('<p class="NERWidgetText" />').append(nextpage)
		.append('&nbsp;(and clear Never-Ending stream)')
		.appendTo(widget);
}

function attachLoaderWidget(widget) {
	loaderWidget = widget;
	siteTable().after(widget);

	const prefetchIo = new IntersectionObserver(([{ isIntersecting }]) => {
		if (!isIntersecting) return;
		prefetchNextPage();
		prefetchIo.disconnect();
	}, { rootMargin: '100%' });
	prefetchIo.observe(widget);

	initAutoNextPage = _.once(() => {
		const loadNextPageIo = new IntersectionObserver(([{ isIntersecting }]) => {
			if (!isIntersecting) return;
			loadNextPage();
			prefetchIo.disconnect();
			loadNextPageIo.disconnect();
		}, { threshold: [1] });
		loadNextPageIo.observe(widget);
	});

	if (module.options.autoLoad.value && !isPaused && !pauseAfterPage()) initAutoNextPage();
}

const fetchPage = url => ajax({ url, cacheFor: HOUR });
const prefetchNextPage = () => { if (nextPageUrl) fetchPage(nextPageUrl); };

export function loadNextPage(scrollToLoadWidget: boolean = false): Promise<void> | boolean | void {
	if (!nextPageUrl) return;

	if (!loadPromise) {
		currentPageNumber++;
		loadPromise = loadPage(nextPageUrl).then(() => { loadPromise = null; });
	}

	if (scrollToLoadWidget) scrollToElement(loaderWidget, null, { scrollStyle: 'middle', direction: 'down' });

	return loadPromise;
}

const loadPage = mutex(async (url: string) => {
	const page = fetchPage(url);

	if (loaderWidget) {
		$(loaderWidget).html('<span class="RESLoadingSpinner"></span>');
	}

	const newLoaderWidget = buildLoaderWidget();

	try {
		const html = (await page)
			// remove some elements which may have side-effects when parsed
			.replace(/<style(.|\s)*?>|<link(.|\s)*?>|<script(.|\s)*?\/script>/g, '');

		const tempDiv = $('<div>').html(html).get(0);
		const username = loggedInUser();
		const tempUsername = documentLoggedInUser(tempDiv);
		if (tempUsername !== username) {
			throw new Error('page loaded was not for current user');
		}

		// check for new mail
		Orangered.updateFromPage(tempDiv);

		try {
			const nextLink = getNextPrevLinks(tempDiv).next;
			nextPageUrl = nextLink && nextLink.getAttribute('href');
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

		pages[currentPageNumber] = { url, nextPageUrl, html: newSiteTable.outerHTML };

		registerPage(newSiteTable);
		await appendPage(newSiteTable);
	} catch (e) {
		endNER(`Could not load the next page: ${e.message}`);
		console.error(e);
	}

	if (loaderWidget) loaderWidget.remove();
	if (nextPageUrl) attachLoaderWidget(newLoaderWidget);
});

const appendPage = fastAsync(function*(newSiteTable) {
	const pageMarker = string.html`<div class="NERPageMarker" data-number="${currentPageNumber}">
		Page ${currentPageNumber}
		${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
	</div>`;

	yield Init.bodyReady;

	const firstLen = $(siteTable()).find('.link:last .rank').text().length;
	const lastLen = $(newSiteTable).find('.link:last .rank').text().length;
	if (lastLen > firstLen) {
		addCSS(`body.res > .content .link .rank { width: ${(lastLen * 1.1).toFixed(1)}ex; }`);
	}

	siteTable().append(pageMarker, ...newSiteTable.children);

	if (!nextPageUrl) endNER('No more pages');

	window.dispatchEvent(new Event('neverEndingLoad', { bubbles: true, cancelable: true }));
});

function endNER(text) {
	$('<div>', {
		class: 'NERPageMarker NERPageMarkerLast',
		text,
	})
		.append(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))
		.append(`
			<p class="nextprev">
				<a href="${location.href.split('#')[0]}">start over</a>
				<a href="${nextPageUrl || ''}">try again</a>
				<a target="_blank" rel="noopener noreferer" href="/r/Enhancement/wiki/faq/never_ending_reddit">learn more</a>
				<a href="/r/random">random subreddit</a>
			</p>
		`)
		.appendTo(siteTable());

	nextPageUrl = null;
}
