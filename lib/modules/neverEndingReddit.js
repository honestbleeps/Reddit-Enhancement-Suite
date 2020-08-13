/* @flow */

import $ from 'jquery';
import { memoize, once } from 'lodash-es';
import { RES_NER_PAGE_HASH } from '../constants/urlHashes';
import { Module } from '../core/module';
import { Storage, ajax, context } from '../environment';
import {
	addFloater,
	HOUR,
	Thing,
	SelectedThing,
	addCSS,
	scrollToElement,
	empty,
	registerPage,
	watchForThings,
	documentLoggedInUser,
	isCurrentSubreddit,
	string,
} from '../utils';
import * as Notifications from './notifications';
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
		dependsOn: options => options.autoLoad.value && options.showPauseButton.value,
		type: 'boolean',
		value: false,
		description: 'nerReversePauseIconDesc',
		title: 'nerReversePauseIconTitle',
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
const pauseReasonStorage = Storage.wrap('RESmodules.neverEndingReddit.pauseReason', (undefined: void | 'manual' | 'pauseAfterEvery'));
let pauseReason;

module.beforeLoad = () => {
	// Loaded pages may repeat posts; remove those
	watchForThings(['post'], thing => {
		// `#siteTable` to avoid processing posts found in spotlight box
		if (document.contains(thing.element) && !thing.element.closest('#siteTable')) return;
		const id = thing.getFullname();
		if (dupeSet.has(id)) thing.element.remove();
		dupeSet.add(id);
	}, { immediate: true });
};

module.go = async () => {
	pages[0] = { url: location.pathname, container: container(), nextPageUrl: retrieveNextPageUrl(container()) };

	const loadReturnToPrevPage = initiateReturnToPrevPage();
	if (loadReturnToPrevPage) await loadReturnToPrevPage().catch(console.error);

	if (module.options.autoLoad.value) {
		setPause(await pauseReasonStorage.get());

		SelectedThing.addListener(current => {
			if (pauseReason) return;
			const things = Thing.visibleThingElements();
			const distanceFromBottom = things.length - (things.indexOf(current.element) + 1);
			if (distanceFromBottom === 1) prefetchNextPage();
			else if (distanceFromBottom < 1) loadNextPage();
		});
	}

	prepareNextPageLoad(false);
};

const container = once(() => getLastSiteTable() || document.createElement('div'));
const pages: Array<{|
	url: string,
	container: HTMLElement,
	nextPageUrl?: ?string,
|}> = [];

function retrieveNextPageUrl(container) {
	const { buttons, next } = getNextPrevLinks(container);
	if (buttons) buttons.hidden = true;
	return next;
}

const getNextPageUrl = (page = pages.slice(-1)[0]): ?string => page.nextPageUrl;
export let loadNextPage: (opts?: { scrollToLoadWidget: boolean }) => void = () => {};
let refreshAutoLoad;

function prepareNextPageLoad(displayEndBanner = true) {
	const nextPageUrl = getNextPageUrl();
	if (!nextPageUrl) {
		if (displayEndBanner) endNER('No more pages');
		return;
	}

	const pauseAfterPages = parseInt(module.options.pauseAfterEvery.value, 10);
	if (module.options.autoLoad.value && pauseAfterPages) {
		if (pages.length % pauseAfterPages === 0) setPause('pauseAfterEvery');
		else if (pauseReason === 'pauseAfterEvery') setPause(null);
	}

	const startPromise = new Promise(res => { loadNextPage = res; });
	const donePromise = startPromise
		.then(() => loadPage(nextPageUrl, pages.length))
		.then(prepareNextPageLoad)
		.catch(e => {
			endNER(`Could not load the next page: ${e.message}`);
			console.error(e);
		});

	createLoaderWidget(startPromise, donePromise);
	if (refreshAutoLoad) refreshAutoLoad(false);
}

const pauseButton = once(() => {
	const element = $('<span>', {
		id: 'NREPause',
		title: 'Pause / Restart Never Ending Reddit',
		click: () => setPause(pauseReason ? null : 'manual'),
	}).get(0);
	addFloater(element, { container: 'visibleAfterScroll' });
	return element;
});

function setPause(source) {
	if (module.options.showPauseButton.value) {
		pauseButton().classList.toggle('paused', module.options.reversePauseIcon.value === !source);
	}

	pauseReason = source;
	if (pauseReason) pauseReasonStorage.set(source);
	else pauseReasonStorage.delete();

	if (refreshAutoLoad) refreshAutoLoad();
}

const isNerUrl = () => location.hash.startsWith(RES_NER_PAGE_HASH);

function setReturnToPage(selected: Thing) {
	let number = 0;

	const $earlierMarkers = $(selected.element).parent().prevAll('.NERPageMarker');
	const marker = $earlierMarkers.get(0);
	if (marker) number = parseInt(marker.dataset.number, 10);

	// replaceState is expensive, so avoid it when possible
	const { ner: saved } = history.state || {};
	if (saved && saved.number === number) return;

	// When restoring this page, the brower's auto scroll may not work properly; let selectedEntry scroll back to the thing
	if ($earlierMarkers.length > 1) history.scrollRestoration = 'manual';

	const page = pages[number];
	history.replaceState(
		{ ...history.state, ner: { number, url: page.url, nextPageUrl: page.nextPageUrl } },
		`${document.title}${number ? `- page ${number + 1}` : ''}`,
		number ? `${RES_NER_PAGE_HASH}=${number + 1}` : `${location.pathname}${location.search}${isNerUrl() ? '' : location.hash}`,
	);
}

const initiateReturnToPrevPage = once(() => {
	if (!module.options.returnToPrevPage.value) return;

	const { ner: { number, url } = {} } = history.state || {};
	let append;
	if (number && url && isNerUrl()) {
		const loadPromise = loadPage(url, number, new Promise(res => { append = () => { res(); return loadPromise; }; }));
	}

	return async () => {
		if (append) await append();
		SelectedThing.addListener(setReturnToPage, 'instantly');
	};
});

function getLastSiteTable(body: HTMLElement = document.body): ?HTMLElement {
	const selector = '.sitetable, .search-result-group';
	const elements = Array.from(body.querySelectorAll(selector)).reverse();
	// Don't select a nested sitetable
	for (const element of elements) {
		if (!element.parentElement || !element.parentElement.closest(selector)) return element;
	}
}

export function getNextPrevLinks(ele: HTMLElement = document.body): { buttons?: HTMLElement, next?: ?string, prev?: ?string } {
	const buttons = ele.matches('.modactionlisting') ? // /about/log differs from other pages
		(ele.nextElementSibling: any) : ele.querySelector('.nav-buttons');
	return buttons ? {
		buttons,
		next: (buttons.querySelector('a[rel~=next]') || {}: any).href,
		prev: (buttons.querySelector('a[rel~=prev]') || {}: any).href,
	} : {};
}

function setLoaderWidgetActionText(widget) {
	empty(widget);
	widget.append(...string.html`<span>
		<h2>
			Never Ending Reddit
			${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
		</h2>
		<p>
			Click here to just load the next page;
			${pauseReason ? string.safe(`or click ${pauseButton().outerHTML} in the top right corner;`) : null}
		</p>
		<p>
			<a id="NERStaticLink" href="${getNextPageUrl() || ''}">or open next page</a> (and clear Never-Ending stream)
		</p>
	</span>`.children);
}

function createLoaderWidget(startPromise, donePromise) {
	const widget = document.createElement('div');
	widget.id = 'progressIndicator';
	widget.className = 'neverEndingReddit';

	widget.addEventListener('click', (e: Event) => {
		if (e.target.tagName === 'A') return;
		loadNextPage();
	});

	startPromise.then(({ scrollToLoadWidget = false } = {}) => {
		empty(widget);
		widget.append(string.html`<span class="RESLoadingSpinner"></span>`);
		if (scrollToLoadWidget) scrollToElement(widget, null, { scrollStyle: 'middle', direction: 'down' });
	});

	const removeWidget = () => widget.remove();
	donePromise.finally(removeWidget);

	const prefetchIo = new IntersectionObserver(([{ isIntersecting }]) => {
		if (!isIntersecting) return;
		prefetchNextPage();
	}, { rootMargin: '100%' });
	prefetchIo.observe(widget);

	const displayPauseReason = once(pauseReason =>
		Notifications.showNotification({
			moduleID: module.moduleID,
			notificationID: pauseReason,
			message: pauseReason === 'pauseAfterEvery' ? `
				<p>Time for a break!</p>
				<p>Never-Ending Reddit has been paused because you've passed ${module.options.pauseAfterEvery.value} pages.</p>
			` :
			`<p>Never-Ending Reddit is paused. Click ${pauseButton().outerHTML} button in the top right corner to unpause it.</p>`,
		}),
	);

	const pauseReasonIo = new IntersectionObserver(([{ isIntersecting }]) => {
		if (isIntersecting && pauseReason) displayPauseReason(pauseReason);
	}, { threshold: [1] });

	const loadNextPageIo = new IntersectionObserver(([{ isIntersecting }]) => {
		if (!isIntersecting) return;
		loadNextPage();
	}, { threshold: [1] });

	refreshAutoLoad = (updateWidget = true) => {
		const enabled = module.options.autoLoad.value && !pauseReason;
		if (enabled) loadNextPageIo.observe(widget);
		else loadNextPageIo.disconnect();
		if (updateWidget) setLoaderWidgetActionText(widget);
		pauseReasonIo.observe(widget);
	};

	setLoaderWidgetActionText(widget);

	startPromise.then(() => {
		prefetchIo.disconnect();
		loadNextPageIo.disconnect();
		pauseReasonIo.disconnect();
		refreshAutoLoad = null;
	});

	pages.slice(-1)[0].container.append(widget);
}

const fetchPage = memoize(url => ajax({ url, cacheFor: HOUR }));
const prefetchNextPage = () => { const url = getNextPageUrl(); if (url) fetchPage(url); };

async function loadPage(url: string, number: number, attachPromise: ?Promise<*>) {
	const html = (await fetchPage(url))
		// remove some unnecessary elements which could cause longer parse times
		.replace(/<style(.|\s)*?>|<link(.|\s)*?>|<script(.|\s)*?\/script>/g, '');

	const document = new DOMParser().parseFromString(html, 'text/html');

	if (context.username && context.username !== documentLoggedInUser(document.body)) {
		throw new Error('Page loaded was not for current user');
	}

	// grab the siteTable out of there...
	const newSiteTable = getLastSiteTable(document.body);
	if (!newSiteTable) throw Error('Could not find any siteTable');

	const noresults = newSiteTable.querySelector('#noresults');
	if (noresults) throw new Error(noresults.textContent);

	// Avoid attributes (class, id etc) which have impact on styling
	for (const { name } of newSiteTable.attributes) newSiteTable.removeAttribute(name);

	pages[number] = { url, container: newSiteTable, nextPageUrl: retrieveNextPageUrl(newSiteTable) };

	// Invoke watcher callbacks etc on page
	registerPage(newSiteTable);

	const pageMarker = string.html`<div class="NERPageMarker" data-number="${number}">
		<a href="${pages[number].url}">Page ${number + 1}</a>
		${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
	</div>`;

	await attachPromise;

	const firstLen = $(container()).find('.link:last .rank').text().length;
	const lastLen = $(newSiteTable).find('.link:last .rank').text().length;
	if (lastLen > firstLen) {
		addCSS(`body.res > .content .link .rank { width: ${(lastLen * 1.1).toFixed(1)}ex; }`);
	}

	container().append(pageMarker, newSiteTable);

	window.dispatchEvent(new Event('neverEndingLoad', { bubbles: true, cancelable: true }));
}

function endNER(text) {
	$('<div>', {
		class: 'NERPageMarker NERPageMarkerLast',
		text,
	})
		.append(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))
		.append(`
			<p class="nextprev">
				<a href="${location.href.split('#')[0]}">start over</a>
				<a href="${getNextPageUrl() || ''}">try again</a>
				<a target="_blank" rel="noopener noreferer" href="/r/Enhancement/wiki/faq/never_ending_reddit">learn more</a>
				<a href="/r/random">random subreddit</a>
			</p>
		`)
		.appendTo(container());
}
