/* @flow */

import { sortBy, map, flow } from 'lodash/fp';
import { Thing, isPageType, observe, downcast, forEachChunked, getViewportSize } from './';

type WatcherOptions = {| immediate?: boolean |};

type ElementWatcherType = 'siteTable' | 'selfText' | 'newComments';
type ElementWatcherCallback = (e: any) => void | Promise<void>;

const elementWatchers: {
	[key: ElementWatcherType]: Array<{
		selector: ?string,
		callback: ElementWatcherCallback,
		options?: WatcherOptions,
	}>,
} = {
	siteTable: [],
	selfText: [],
	newComments: [],
};

type ThingWatcherType = 'comment' | 'message' | 'post' | 'subreddit';
type ThingWatcherCallback = (thing: Thing) => void | Promise<void>;

const thingWatchers: {
	[key: ThingWatcherType]: Array<{
		callback: ThingWatcherCallback,
		options?: WatcherOptions,
	}>,
} = {
	comment: [],
	message: [],
	post: [],
	subreddit: [],
};

function registerElement(type, element, sorter = callbacks => callbacks) {
	const elementCallbacks: Map<HTMLElement, Array<() => mixed>> = new Map();

	function addCallback(callback, actingOnElement, options) {
		if (options && options.immediate) {
			try { callback(); } catch (e) { console.error(e); }
		} else {
			const callbacks = elementCallbacks.get(actingOnElement);
			if (callbacks) callbacks.push(callback);
			else elementCallbacks.set(actingOnElement, [callback]);
		}
	}

	for (const thing of Thing.findThings(element)) {
		const thingWatcherCallbacks =
			thing.isPost() && thingWatchers.post ||
			thing.isComment() && thingWatchers.comment ||
			thing.isMessage() && thingWatchers.message ||
			thing.isSubreddit() && thingWatchers.subreddit ||
			[];

		for (const { callback, options } of thingWatcherCallbacks) {
			addCallback(() => callback(thing), thing.element, options);
		}
	}

	for (const { selector, callback, options } of elementWatchers[type]) {
		const elements = selector ? Array.from(element.querySelectorAll(selector)) : [element];
		for (const e of elements) {
			// Avoid excessive number of chunked callbacks by tying the callback to an existing Thing
			const closest = e.closest && (e.parentElement: any).closest('.thing') || e;
			addCallback(() => callback(e), closest, options);
		}
	}

	return flow(
		sorter,
		map(v => v[1]),
		forEachChunked(c => { for (const callback of c) try { callback(); } catch (e) { console.error(e); } })
	)(Array.from(elementCallbacks));
}

export function watchForThings(types: Array<ThingWatcherType>, callback: ThingWatcherCallback, options?: WatcherOptions) {
	for (const type of types) thingWatchers[type].push({ callback, options });
}

export function watchForElements(types: Array<ElementWatcherType>, selector: ?string, callback: ElementWatcherCallback, options?: WatcherOptions) {
	for (const type of types) elementWatchers[type].push({ selector, callback, options });
}

export function initObservers() {
	watchForElements(['siteTable'], '.entry div.expando', addSelfTextObserver);

	if (isPageType('comments')) {
		addCommentsObserver(document.querySelector('.commentarea .sitetable'));

		watchForThings(['comment'], thing => {
			const sitetable: ?HTMLElement = thing.element.querySelector('.sitetable');

			// Comments without replies does not have `.sitetable`
			if (sitetable) {
				addCommentsObserver(sitetable);
			} else {
				const observer = observe(thing.element.querySelector('.child'), { childList: true }, mutation => {
					if (!mutation.addedNodes.length) return;
					const addedNode = downcast(mutation.addedNodes[0], HTMLElement);
					if (!addedNode.classList.contains('sitetable')) return;

					observer.disconnect();

					addCommentsObserver(addedNode);

					const comment = addedNode.querySelector('.thing');
					if (comment) registerElement('newComments', comment);
				});
			}
		});
	}
}

export function newSitetable(siteTable: HTMLElement) {
	let sorter;
	if (document.contains(siteTable)) {
		const viewportHeight = getViewportSize();
		sorter = sortBy(([element]) => {
			const fromTop = element.getBoundingClientRect().top;
			return element.offsetParent ?
					(fromTop >= 0 ? fromTop : -fromTop + viewportHeight) :
					Infinity;
		});
	}

	return registerElement('siteTable', siteTable, sorter);
}

function addCommentsObserver(ele) {
	observe(ele, { childList: true }, mutation => {
		if (!mutation.addedNodes.length) return;

		const addedNode = downcast(mutation.addedNodes[0], HTMLElement);

		if (addedNode.classList.contains('thing')) {
			registerElement('newComments', addedNode);
		}
	});
}

function addSelfTextObserver(ele) {
	observe(ele, { childList: true }, mutation => {
		const form = downcast(mutation.target, HTMLElement).querySelector('form');
		if (form) {
			registerElement('selfText', form);
		}
		// only the first mutation (legacy behavior)
		return true;
	});
}
