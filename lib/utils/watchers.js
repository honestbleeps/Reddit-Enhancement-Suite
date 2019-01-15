/* @flow */

import _ from 'lodash';
import { Thing } from './Thing';
import { isPageType } from './location';
import { watchForChildren, watchForFutureDescendants } from './dom';
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

let createChunks = true;
type Chunks = Array<[Thing, Array<() => void>]>;
const executeChunk = ([, callbacks]) => { for (const callback of callbacks) runCallback(callback); };
const executeChunks = (chunks: Chunks) => { for (const chunk of chunks) executeChunk(chunk); };

const chunkedCallbacks = new Map();

const runChunkedCallbacks = throttle(async trigger => {
	const chunks = Array.from(chunkedCallbacks);
	chunkedCallbacks.clear();

	const [visible, hidden]: any = _.partition(chunks, ([thing]) => thing.isVisible());
	// Execute a few callbacks on the first frame, in an attempt to minimize the delay in mutation elements in the user's viewport
	executeChunks(visible.splice(0, isPageType('comments') ? 1 : 10));
	// Don't execute chunks in the following animation frame if this was trigged by a timeout
	if (trigger === 'timeout') await new Promise(res => requestAnimationFrame(res));
	// Run callbacks on visible things before hidden ones
	return forEachChunked([...visible, ...hidden], executeChunk);
});

function addCallback(callback, actingOnElement, options) {
	let chunk;
	if (
		createChunks &&
		!(options && options.immediate) &&
		document.contains(actingOnElement)
	) {
		// Avoid excessive number of chunked callbacks by tying the callback to a Thing
		// By grouping callbacks acting on a common thing, the number of elements having to be reflowed is reduced
		chunk = Thing.from(actingOnElement);
	}

	if (chunk) {
		const callbacks = chunkedCallbacks.get(chunk);
		if (callbacks) callbacks.push(callback);
		else chunkedCallbacks.set(chunk, [callback]);
		runChunkedCallbacks();
	} else {
		callback();
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
}

function registerThing(element: HTMLElement) {
	// Promoted (ads) links are unsupported by most modules, and anyway often hidden by adblockers, so avoid processing them
	if (element.classList.contains('promoted')) return;

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
}

export function watchForThings(types: ?Array<ThingWatcherType>, callback: ThingWatcherCallback, options?: WatcherOptions) {
	if (!types) types = Object.keys(thingWatchers);
	for (const type of types) thingWatchers[type].push({ callback, options, registered: new WeakSet() });
}

export function watchForElements(types: Array<ElementWatcherType>, selector: ?string, callback: ElementWatcherCallback, options?: WatcherOptions) {
	for (const type of types) elementWatchers[type].push({ selector, callback, options, registered: new WeakSet() });
}

export function registerPage(page: HTMLElement) {
	registerElement('page', page);
}

export function initR2Watcher() {
	watchForThings(['post'], thing => {
		const container = thing.entry.querySelector('div.expando');
		if (!container) return;
		watchForChildren(container, 'form', () => {
			const body = thing.getTextBody();
			if (body) registerElement('selfText', body);
		});
	});

	if (isPageType('comments')) {
		const commentarea = document.body.querySelector('.commentarea');
		if (commentarea) watchForFutureDescendants(commentarea, '.thing', registerThing);
	}

	watchForElements(['page'], Thing.thingSelector, registerThing, { immediate: true });

	registerPage(document.body);

	// Run chunks only on the initial load
	createChunks = false;

	// Resolve when chunks are completed
	return runChunkedCallbacks();
}
