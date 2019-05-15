/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { RES_NER_PAGE_HASH } from '../constants/urlHashes';
import { Module } from '../core/module';
import * as Init from '../core/init';
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
let pauseReason;

module.beforeLoad = () => {
	if (module.options.hideDupes.value !== 'none') {
		watchForThings(['post'], thing => {
			// `#siteTable` to avoid processing posts found in spotlight box
			if (document.contains(thing.element) && !thing.element.closest('#siteTable')) return;
			handleDupes(thing);
		}, { immediate: true });
	}
};

module.go = async () => {
	pages[0] = { url: location.pathname, nextPageUrl: retrieveNextPageUrl(container()) };

	const loadReturnToPrevPage = initiateReturnToPrevPage();
	if (loadReturnToPrevPage) await loadReturnToPrevPage();

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

	prepareNextPageLoad(false);
};

const container = _.once(() => getLastSiteTable() || document.createElement('div'));
const pages: Array<{|
	url: string,
	nextPageUrl: ?string,
|}> = [];

export let loadNextPage: (opts?: { scrollToLoadWidget: boolean }) => void = () => {};
let refreshAutoLoad;

const getNextPageUrl = (): ?string => pages.slice(-1)[0].nextPageUrl;

function prepareNextPageLoad(displayEndBanner = true) {
	const last = pages.slice(-1)[0];
	const { nextPageUrl } = last;
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
		.then(() => loadPage(nextPageUrl, pages.indexOf(last) + 1))
		.then(prepareNextPageLoad)
		.catch(e => {
			endNER(`Could not load the next page: ${e.message}`);
			console.error(e);
		});

	createLoaderWidget(startPromise, donePromise);

	// It is not desirable to enable auto load instantly after creating the widget, to let misc async tasks complete
	Promise.all([Init.afterLoad, new Promise((requestIdleCallback: any))]).then(() => { if (refreshAutoLoad) refreshAutoLoad(false); });
}

const pauseButton = _.once(() => {
	const element = $('<span>', {
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

	history.replaceState(
		{ ...history.state, ner: { number, ...pages[number] } },
		`${document.title}${number ? `- page ${number + 1}` : ''}`,
		number ? `${RES_NER_PAGE_HASH}=${number + 1}` : `${location.pathname}${location.search}${isNerUrl() ? '' : location.hash}`
	);
}

const initiateReturnToPrevPage = _.once(() => {
	if (!module.options.returnToPrevPage.value) return;

	const { ner: { number, url } = {} } = history.state || {};
	let append;
	if (number && url && isNerUrl()) {
		const loadPromise = loadPage(url, number, new Promise(res => { append = () => { res(); return loadPromise; }; }));
	}

	return async () => {
		if (append) await append();
		SelectedEntry.addListener(setReturnToPage, 'instantly');
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

export function getNextPrevLinks(ele: HTMLElement = document.body): { buttons?: HTMLElement, next?: HTMLAnchorElement, prev?: HTMLAnchorElement } {
	const buttons = Array.from(ele.querySelectorAll([
		'.nav-buttons',
		'.sitetable + .nextprev', // /about/log differs from other pages
	].join(', '))).pop();
	return {
		buttons,
		next: buttons && (buttons.querySelector('a[rel~=next]'): any),
		prev: buttons && (buttons.querySelector('a[rel~=prev]'): any),
	};
}

// This also hides the original navigation
function retrieveNextPageUrl(body: ?HTMLElement): ?string {
	if (!body) return null;
	const { buttons, next } = getNextPrevLinks(body);
	if (!buttons || !next) return;
	buttons.hidden = true;
	return next.getAttribute('href');
}

function setLoaderWidgetActionText(widget) {
	empty(widget);
	widget.append(...string.html`<span>
		<h2>
			Never Ending Reddit
			${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
		</h2>
		<p>
			Click to load the next page;
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
}

const fetchPage = _.memoize(url => ajax({ url, cacheFor: HOUR }));
const prefetchNextPage = () => { const url = getNextPageUrl(); if (url) fetchPage(url); };

async function loadPage(url: string, number: number, attachPromise: ?Promise<*>) {
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
	const registerPromise = registerPage(newSiteTable);

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

	// Don't compelete the load process before the first thing's "immediate" tasks (e.g. filtering) have completed
	const firstThing = Thing.things(newSiteTable).shift();
	if (firstThing) {
		await Promise.race([
			Promise.all(firstThing.tasks.immediate.map(fn => fn())),
			new Promise(res => setTimeout(res, 1000)), // some task may be broken, so let the tasks maximum period to complete
		]).catch(console.error);
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
