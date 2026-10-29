/* @flow */

import { memoize, once } from 'lodash-es';
import { RES_NER_PAGE_HASH } from '../constants/urlHashes';
import { Module } from '../core/module';
import { Storage, ajax, context } from '../environment';
import {
	addFloater,
	HOUR,
	Thing,
	PagePhases,
	SelectedThing,
	addCSS,
	scrollToElement,
	empty,
	registerPage,
	documentLoggedInUser,
	isCurrentSubreddit,
	string,
} from '../utils';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<any> = new Module('neverEndingReddit');

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

const pauseReasonStorage = Storage.wrap('RESmodules.neverEndingReddit.pauseReason', (undefined as void | 'manual' | 'pauseAfterEvery'));
let pauseReason: ?('manual' | 'pauseAfterEvery');
let initialLoadPromise: ?Promise<void>;

module.contentStart = async () => {
	if (module.options.returnToPrevPage.value) {
		const { ner: { number, url } = ({} as { number?: number, url?: string }) } = history.state || {};
		if (number && url && isNerUrl()) {
			// $FlowFixMe[incompatible-type] console.error does not depend on its `this` binding
			initialLoadPromise = loadPage(url, number, PagePhases.contentLoaded).catch(console.error);
		}
	}

	if (module.options.autoLoad.value) {
		setPause(await pauseReasonStorage.get());
	}
};

module.go = async () => {
	pages[0] = { url: location.pathname, container: container(), nextPageUrl: retrieveNextPageUrl(container()) };

	if (module.options.returnToPrevPage.value) {
		SelectedThing.addListener(setReturnToPage, 'instantly');
	}

	await initialLoadPromise;
	prepareNextPageLoad(false);
};

const container = once(() => getLastSiteTable() || document.createElement('div'));
type Page = {
	url: string,
	container: HTMLElement,
	nextPageUrl?: ?string,
};
const pages: Array<Page> = [];

function retrieveNextPageUrl(container: HTMLElement) {
	const { buttons, next } = getNextPrevLinks(container);
	if (buttons) buttons.hidden = true;
	return next;
}

const getNextPageUrl = (page: Page = pages.slice(-1)[0]): ?string => page.nextPageUrl;
type LoadOpts = { scrollToLoadWidget: boolean, ... };
export let loadNextPage: (opts?: LoadOpts) => void = () => {};
let refreshAutoLoad: ?((updateWidget?: boolean) => void);

function prepareNextPageLoad(displayEndBanner: boolean = true) {
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

	const startPromise = new Promise<LoadOpts | void>(res => { loadNextPage = res; });
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
	const element = string.html`<span id="NREPause" title="Pause / Restart Never Ending Reddit"></span>`;
	element.addEventListener('click', () => setPause(pauseReason ? null : 'manual'));
	addFloater(element, { container: 'visibleAfterScroll' });
	return element;
});

function setPause(source: ?('manual' | 'pauseAfterEvery')) {
	if (module.options.showPauseButton.value) {
		pauseButton().classList.toggle('paused', module.options.reversePauseIcon.value === !source);
	}

	pauseReason = source;
	// $FlowFixMe[incompatible-type] source is non-null here because it equals pauseReason
	if (pauseReason) pauseReasonStorage.set(source);
	else pauseReasonStorage.delete();

	if (refreshAutoLoad) refreshAutoLoad();
}

const pageMarkers = document.getElementsByClassName('NERPageMarker');
const isNerUrl = () => location.hash.startsWith(RES_NER_PAGE_HASH);

function setReturnToPage(selected: Thing) {
	if (!document.contains(selected.element)) return;

	let number = 0;

	const earlierMarkers = [...pageMarkers].filter(_marker => selected.element.compareDocumentPosition(_marker) & 0x03);
	if (earlierMarkers.length) number = parseInt((earlierMarkers.slice(-1)[0] as any as HTMLElement).dataset.number, 10);

	// replaceState is expensive, so avoid it when possible
	const { ner: saved } = history.state || {};
	if (saved && saved.number === number) return;

	// When restoring this page, the brower's auto scroll may not work properly; let selectedEntry scroll back to the thing
	if (earlierMarkers.length > 1) history.scrollRestoration = 'manual';

	const page = pages[number];
	history.replaceState(
		{ ...history.state, ner: { number, url: page.url, nextPageUrl: page.nextPageUrl } },
		`${document.title}${number ? `- page ${number + 1}` : ''}`,
		number ? `${RES_NER_PAGE_HASH}=${number + 1}` : `${location.pathname}${location.search}${isNerUrl() ? '' : location.hash}`,
	);
}

function getLastSiteTable(body: HTMLElement = document.body): ?HTMLElement {
	const selector = '.sitetable, .search-result-group';
	const elements = Array.from(body.querySelectorAll(selector)).reverse();
	// Don't select a nested sitetable
	for (const element of elements) {
		if (!element.parentElement || !element.parentElement.closest(selector)) return element;
	}
}

export function getNextPrevLinks(ele: HTMLElement = document.body): { buttons?: HTMLElement, next?: ?string, prev?: ?string, ... } {
	const buttons = ele.matches('.modactionlisting') ? // /about/log differs from other pages
		(ele.nextElementSibling as any) : ele.querySelector('.nav-buttons');
	return buttons ? {
		buttons,
		next: ((buttons.querySelector('a[rel~=next]') || {}) as any).href,
		prev: ((buttons.querySelector('a[rel~=prev]') || {}) as any).href,
	} : {};
}

function setLoaderWidgetActionText(widget: HTMLElement) {
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

function createLoaderWidget(startPromise: Promise<LoadOpts | void>, donePromise: Promise<void>) {
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

	refreshAutoLoad = (updateWidget: boolean = true) => {
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

async function loadPage(url: string, number: number, waitToAppendPromise: ?Promise<any>) {
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

	await waitToAppendPromise;

	// Invoke watcher callbacks etc on page
	registerPage(newSiteTable);

	const pageMarker = string.html`<div class="NERPageMarker" data-number="${number}">
		<a href="${pages[number].url}">Page ${number + 1}</a>
		${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
	</div>`;

	const firstLen = [...container().getElementsByClassName('rank')].slice(-1)[0]?.textContent.length || 0;
	const lastLen = [...newSiteTable.getElementsByClassName('rank')].slice(-1)[0]?.textContent.length || 0;
	if (lastLen > firstLen) {
		addCSS(`body.res > .content .link .rank { width: ${(lastLen * 1.1).toFixed(1)}ex; }`);
	}

	container().append(pageMarker, newSiteTable);

	window.dispatchEvent(new Event('neverEndingLoad', { bubbles: true, cancelable: true }));
}

function endNER(text: string) {
	container().append(string.html`<div class="NERPageMarker NERPageMarkerLast">
		${text}
		${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
		<p class="nextprev">
			<a href="${location.href.split('#')[0]}">start over</a>
			<a href="${getNextPageUrl() || ''}">try again</a>
			<a target="_blank" rel="noopener noreferer" href="/r/Enhancement/wiki/faq/never_ending_reddit">learn more</a>
		</p>
	</div>`);
}
