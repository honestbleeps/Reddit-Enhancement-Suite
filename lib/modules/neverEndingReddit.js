/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { RES_NER_PAGE_HASH } from '../constants/urlHashes';
import { Module } from '../core/module';
import { Storage, ajax, context } from '../environment';
import {
	HOUR,
	Thing,
	addCSS,
	scrollToElement,
	empty,
	registerPage,
	watchForThings,
	documentLoggedInUser,
	isCurrentSubreddit,
	string,
} from '../utils';
import * as Floater from './floater';
import * as Notifications from './notifications';
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
		dependsOn: options => options.autoLoad.value && options.showPauseButton.value,
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
const pauseReasonStorage = Storage.wrap('RESmodules.neverEndingReddit.pauseReason', (undefined: void | 'manual' | 'pauseAfterEvery'));
let pauseReason: ?string = 'unloaded';

module.beforeLoad = () => {
	if (module.options.hideDupes.value !== 'none') {
		watchForThings(['post'], thing => {
			// `#siteTable` to avoid processing posts found in spotlight box
			if (document.contains(thing.element) && !thing.element.closest('#siteTable')) return;
			handleDupes(thing);
		}, { immediate: true });
	}

	initiateReturnToPrevPage();
};

module.go = async () => {
	pages[0] = { url: location.pathname, nextPageUrl: retrieveNextPageUrl(document.body) };

	const loadReturnToPrevPage = initiateReturnToPrevPage();
	if (loadReturnToPrevPage) await loadReturnToPrevPage();

	if (!getNextPageUrl()) return;

	prepareNextPageLoad();

	if (module.options.autoLoad.value) {
		setPause(await pauseReasonStorage.get());

		SelectedEntry.addListener(selected => {
			if (pauseReason) return;
			const things = Thing.visibleThingElements();
			const distanceFromBottom = things.length - (things.indexOf(selected.element) + 1);
			if (distanceFromBottom === 1) prefetchNextPage();
			else if (distanceFromBottom < 1) loadNextPage();
		});
	}
};

const container = _.once(() => getLastSiteTable() || document.createElement('div'));
const pages: Array<{|
	url: string,
	nextPageUrl: ?string,
|}> = [];

export let loadNextPage: (opts?: { scrollToLoadWidget: boolean }) => void = () => {};
let refreshAutoLoad: ?() => void;

const getNextPageUrl = (): ?string => pages.slice(-1)[0].nextPageUrl;

function prepareNextPageLoad() {
	const last = pages.slice(-1)[0];
	const { nextPageUrl } = last;
	if (!nextPageUrl) {
		endNER('No more pages');
		return;
	}

	const pauseAfterPages = parseInt(module.options.pauseAfterEvery.value, 10);
	if (pauseAfterPages && pages.length % pauseAfterPages === 0) setPause('pauseAfterEvery');
	else if (pauseReason === 'pauseAfterEvery') setPause(null);

	const startPromise = new Promise(res => { loadNextPage = res; });
	const donePromise = startPromise
		.then(() => loadPage(nextPageUrl, pages.indexOf(last) + 1))
		.then(() => prepareNextPageLoad())
		.catch(e => {
			endNER(`Could not load the next page: ${e.message}`);
			console.error(e);
		});

	createLoaderWidget(startPromise, donePromise);
}

const pauseButton = _.once(() => {
	const element = $('<div>', {
		id: 'NREPause',
		title: 'Pause / Restart Never Ending Reddit',
		click: () => setPause(pauseReason ? null : 'manual'),
	}).get(0);
	Floater.addElement(element);
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

	// After appended page number two, the browser will auto-scroll too far
	const allowAutoScroll = $earlierMarkers.length < 2;
	history.scrollRestoration = allowAutoScroll ? 'auto' : 'manual';

	history.replaceState(
		{ ...history.state, ner: { number, ...pages[number] } },
		`${document.title}${number ? `- page ${number + 1}` : ''}`,
		number ? `${RES_NER_PAGE_HASH}=${number + 1}` : `${location.pathname}${location.search}${isNerUrl() ? '' : location.hash}`
	);
}

const initiateReturnToPrevPage = _.once(() => {
	if (!module.options.returnToPrevPage.value) return;

	const { ner } = history.state || {};
	if (!ner || !isNerUrl()) return;

	const { number, url } = ner;

	if (url) {
		// Cached & memoized, so it loads quickly
		fetchPage(url);
	}

	return () => {
		if (url) loadPage(url, number);
		SelectedEntry.addListener(setReturnToPage, 'beforeScroll');
	};
});

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

function getLastSiteTable(body: HTMLElement = document.body): ?HTMLElement {
	const selector = '.sitetable, .search-result-listing .contents';
	const elements = Array.from(body.querySelectorAll(selector)).reverse();
	// Don't select a nested sitetable
	for (const element of elements) {
		if (!element.parentElement || !element.parentElement.closest(selector)) return element;
	}
}

export function getNextPrevLinks(ele: HTMLElement = document.body, hideNavigation: boolean = false): { next?: HTMLAnchorElement, prev?: HTMLAnchorElement } {
	const buttons = Array.from(ele.querySelectorAll([
		'.nav-buttons',
		'.sitetable + .nextprev', // /about/log differs from other pages
	].join(', '))).pop();
	if (hideNavigation && buttons) buttons.hidden = true;
	const links = {
		next: buttons && (buttons.querySelector('a[rel~=next]'): any),
		prev: buttons && (buttons.querySelector('a[rel~=prev]'): any),
	};

	if (!links.next && !links.prev) throw new Error('Could not find any .nextprev links');
	return links;
}

// This also hides the original navigation
function retrieveNextPageUrl(body: HTMLElement): ?string {
	try {
		const nextLink = getNextPrevLinks(body, true).next;
		return nextLink ? nextLink.getAttribute('href') : null;
	} catch (e) {
		console.error('Could not find a link to the next page', e);
		return null;
	}
}

function setLoaderWidgetActionText(widget) {
	const text = module.options.autoLoad.value && pauseReason ?
		'Click to load the next page; or click the "pause" button in the top right corner' :
		'Click to load the next page';

	empty(widget);
	widget.append(...string.html`<span>
		<h2>
			Never Ending Reddit
			${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
		</h2>
		<p class="NERWidgetText">${text}</p>
		<p class="NERWidgetText">
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
	if (process.env.BUILD_TARGET !== 'edge') donePromise.finally(removeWidget);
	else donePromise.then(removeWidget, removeWidget);

	container().append(widget);

	const prefetchIo = new IntersectionObserver(([{ isIntersecting }]) => {
		if (!isIntersecting) return;
		prefetchNextPage();
	}, { rootMargin: '100%' });
	prefetchIo.observe(widget);

	const displayPauseReason = _.once(pauseReason =>
		Notifications.showNotification({
			moduleID: module.moduleID,
			notificationID: pauseReason,
			message: pauseReason === 'pauseAfterEvery' ? `
				<p>Time for a break!</p>
				<p>Never-Ending Reddit has been paused because you've passed ${module.options.pauseAfterEvery.value} pages.</p>
			` :
			'Never-Ending Reddit has been paused. Click the play/pause button to unpause it.',
		})
	);

	const pauseReasonIo = new IntersectionObserver(([{ isIntersecting }]) => {
		if (isIntersecting && pauseReason) displayPauseReason(pauseReason);
	}, { threshold: [1] });
	pauseReasonIo.observe(widget);

	const loadNextPageIo = new IntersectionObserver(([{ isIntersecting }]) => {
		if (!isIntersecting) return;
		loadNextPage();
	}, { threshold: [1] });

	refreshAutoLoad = () => {
		const enabled = module.options.autoLoad.value && !pauseReason;
		if (enabled) loadNextPageIo.observe(widget);
		else loadNextPageIo.disconnect();
		setLoaderWidgetActionText(widget);
	};

	refreshAutoLoad();

	startPromise.then(() => {
		prefetchIo.disconnect();
		loadNextPageIo.disconnect();
		pauseReasonIo.disconnect();
		refreshAutoLoad = null;
	});
}

const fetchPage = _.memoize(url => ajax({ url, cacheFor: HOUR }));
const prefetchNextPage = () => { const url = getNextPageUrl(); if (url) fetchPage(url); };

async function loadPage(url: string, number: number) {
	const html = (await fetchPage(url))
		// remove some elements which may have side-effects when parsed
		.replace(/<style(.|\s)*?>|<link(.|\s)*?>|<script(.|\s)*?\/script>/g, '');

	const tempDiv = $('<div>').html(html).get(0);

	if (context.username && context.username !== documentLoggedInUser(tempDiv)) {
		throw new Error('Page loaded was not for current user');
	}

	// grab the siteTable out of there...
	const newSiteTable = getLastSiteTable(tempDiv);
	if (!newSiteTable) throw Error('Could not find any siteTable');

	const noresults = newSiteTable.querySelector('#noresults');
	if (noresults) throw new Error(noresults.textContent);

	// Avoid attributes (class, id etc) which have impact on styling
	for (const { name } of newSiteTable.attributes) newSiteTable.removeAttribute(name);

	pages[number] = { url, nextPageUrl: retrieveNextPageUrl(tempDiv) };

	// Invoke watcher callbacks etc on page
	registerPage(newSiteTable);

	const pageMarker = string.html`<div class="NERPageMarker" data-number="${number}">
		<a href="${pages[number].url}">Page ${number + 1}</a>
		${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
	</div>`;

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
