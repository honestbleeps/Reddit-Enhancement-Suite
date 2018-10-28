/* @flow */

import _ from 'lodash';
import { Thing } from './Thing';
import { isPageType } from './location';
import { getPercentageVisibleYAxis, getViewportSize, waitForChild, watchForFutureDescendants, watchForFutureChildren } from './dom';
import { forEachChunked, throttle } from './async';

type WatcherOptions = {| immediate?: boolean |};

type ElementWatcherType = 'page' | 'selfText';
type ElementWatcherCallback = (e: any) => void | Promise<void>;

const elementWatchers: {
	[ElementWatcherType]: Array<{
		selector: ?string,
		callback: ElementWatcherCallback,
		options?: WatcherOptions,
		registered: WeakSet<*>,
	}>,
} = {
	page: [],
	selfText: [],
};

type ThingWatcherType = 'comment' | 'message' | 'post' | 'subreddit';
type ThingWatcherCallback = (thing: Thing) => void | Promise<void>;

const thingWatchers: {
	[ThingWatcherType]: Array<{
		callback: ThingWatcherCallback,
		options?: WatcherOptions,
		registered: WeakSet<*>,
	}>,
} = {
	comment: [],
	message: [],
	post: [],
	subreddit: [],
};

const runCallback = fn => { try { fn(); } catch (e) { console.error(e); } };

type Chunks = Array<[Thing, Array<() => void>]>;
const executeChunk = ([, callbacks]) => { for (const callback of callbacks) runCallback(callback); };
const executeChunks = chunks => { for (const chunk of chunks) executeChunk(chunk); };

const chunkedCallbacks = new Map();
const immediateCallbacks = [];

const runCallbacks = throttle(async () => {
	for (const fn of immediateCallbacks) runCallback(fn);
	immediateCallbacks.length = 0;

	const chunks = Array.from(chunkedCallbacks);
	chunkedCallbacks.clear();
	const { immediate = [], normal = [], background = [] } = partitionChunks(chunks);
	executeChunks(immediate);
	await forEachChunked(normal, executeChunk);
	// Don't await hidden chunks as their progress is not important
	forEachChunked(background, executeChunk);
});

function partitionChunks(chunks: Chunks): { immediate?: Chunks, normal?: Chunks, background?: Chunks } {
	// If the document is opened in the background, this may casue an expensive reflow and would likely be unnecessary
	if (document.hidden) return { background: chunks };

	// Prioritize visible things
	const { visible = [], hidden = [] } = _.groupBy(chunks, ([thing]) => thing.isVisible() ? 'visible' : 'hidden');

	if (!visible.length) return { background: hidden };

	// When there's few chunks, there's likely too much overhead for the reflow to be worthwhile
	if (visible.length <= 55) return { immediate: visible, background: hidden };

	// Things in the viewport should be executed immediately
	const inViewport = [];

	// Prioritize things closest to the viewport
	// This causes a reflow
	const viewportHeight = getViewportSize().height;
	const sorted = _.sortBy(visible, chunk => {
		const [thing] = chunk;
		if (getPercentageVisibleYAxis(thing.element)) inViewport.push(chunk);
		const fromTop = thing.element.getBoundingClientRect().top;
		return fromTop >= 0 ? fromTop : -fromTop + viewportHeight;
	});
	_.pull(sorted, ...inViewport);

	return { immediate: inViewport, normal: sorted, background: hidden };
}

function addCallback(callback, actingOnElement, options) {
	let chunk;
	if (document.contains(actingOnElement) && !(options && options.immediate)) {
		// Avoid excessive number of chunked callbacks by tying the callback to a Thing
		// By grouping callbacks acting on a common thing, the number of elements having to be reflowed is reduced
		chunk = Thing.from(actingOnElement);
	}

	if (chunk) {
		const callbacks = chunkedCallbacks.get(chunk);
		if (callbacks) callbacks.push(callback);
		else chunkedCallbacks.set(chunk, [callback]);
	} else {
		immediateCallbacks.push(callback);
	}
}

function registerElement(type, element) {
	for (const { selector, callback, options, registered } of elementWatchers[type]) {
		const elements = selector ? Array.from(element.querySelectorAll(selector)) : [element];
		for (const e of elements) {
			if (registered.has(e)) continue;
			registered.add(e);
			const fn = () => { callback(e); };
			addCallback(fn, e, options);
		}
	}

	return runCallbacks();
}

function registerThing(element: HTMLElement) {
	const thing = Thing.checkedFrom(element);

	const thingWatcherCallbacks =
		thing.isPost() && thingWatchers.post ||
		thing.isComment() && thingWatchers.comment ||
		thing.isMessage() && thingWatchers.message ||
		thing.isSubreddit() && thingWatchers.subreddit ||
		[];

	for (const { callback, options, registered } of thingWatcherCallbacks) {
		if (registered.has(thing)) continue;
		registered.add(thing);
		const fn = () => { callback(thing); };
		addCallback(fn, thing.element, options);
	}

	return runCallbacks();
}

export function watchForThings(types: ?Array<ThingWatcherType>, callback: ThingWatcherCallback, options?: WatcherOptions) {
	if (!types) types = Object.keys(thingWatchers);
	for (const type of types) thingWatchers[type].push({ callback, options, registered: new WeakSet() });
}

export function watchForElements(types: Array<ElementWatcherType>, selector: ?string, callback: ElementWatcherCallback, options?: WatcherOptions) {
	for (const type of types) elementWatchers[type].push({ selector, callback, options, registered: new WeakSet() });
}

export function registerPage(page: HTMLElement) {
	return registerElement('page', page);
}

export function initR2Watcher() {
	watchForThings(['post'], thing => {
		const container = thing.entry.querySelector('div.expando');
		if (!container) return;
		waitForChild(container, 'form').then(form => { registerElement('selfText', form.querySelector('.md')); });
	});

	const sitetable = document.body.querySelector('#siteTable');
	if (sitetable) watchForFutureChildren(sitetable, Thing.thingSelector, registerThing);

	if (isPageType('comments')) {
		watchForFutureDescendants(document.body.querySelector('.commentarea'), '.thing', registerThing);
	}

	watchForElements(['page'], Thing.thingSelector, element => {
		registerThing(element);
	}, { immediate: true });

	return registerPage(document.body);
}
