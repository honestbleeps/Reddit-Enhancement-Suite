/* @flow */

import { memoize, once } from 'lodash-es';
import { Thing } from './Thing';
import { filterMap } from './array';
import { isPageType } from './location';
import { isLastNodeInDOM, watchForChildren, watchForFutureChildren, watchForFutureDescendants, waitForAttach, waitForDescendantChange } from './dom';

type WatcherOptions = {| immediate?: boolean, id?: mixed |};

type ElementWatcherType = 'page' | 'selfText';
type ElementWatcherCallback = (e: HTMLElement) => any;

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
type ThingWatcherCallback = (thing: Thing) => any;

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

// eslint-disable-next-line no-unused-vars
const runCallback = fn => { try { return fn(); } catch (e) { console.error(e); } };

const addCallback = (callback, actingOnElement, { immediate, id } = {}) => {
	const thing = Thing.from(actingOnElement);
	if (thing) {
		// XXX The callback ought not be wrapped so many times
		const task = once(() => runCallback(callback));
		if (id) thing.tasks.byId.set(id, task);
		(immediate ? thing.tasks.immediate : thing.tasks.visible).push(task);
		if (immediate || thing.tasks.completed) task();
	} else {
		runCallback(callback);
	}
};

function registerElement(type, element) {
	for (const { selector, callback, options, registered } of elementWatchers[type]) {
		const elements = selector && !element.matches(selector) ?
			Array.from(element.querySelectorAll(selector)) :
			[element];
		for (const e of elements) {
			if (registered.has(e)) continue;
			registered.add(e);
			addCallback(() => callback(e), e, options);
		}
	}
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
		addCallback(() => callback(thing), thing.element, options);
	}

	return thing;
}

export function watchForThings(types: ?Array<ThingWatcherType>, callback: ThingWatcherCallback, options?: WatcherOptions) {
	if (!types) types = Object.keys(thingWatchers);
	const entry = { callback, options, registered: new WeakSet() };
	for (const type of types) thingWatchers[type].push(entry);
}

export function watchForElements(types: Array<ElementWatcherType>, selector: ?string, callback: ElementWatcherCallback, options?: WatcherOptions) {
	const entry = { selector, callback, options, registered: new WeakSet() };
	for (const type of types) elementWatchers[type].push(entry);
}

// Run tasks on a few things manually, since the IntersectionObserver requires at least one paint before invoking callback
// By running tasks on what is likely to be displayed on first paint, we avoid an extra reflow
const _runLikelyVisibleTasks = () => {
	let max: number = Math.ceil(screen.availHeight / 55 /* approx min height of a thing */);
	const queue = [];
	let i = 0;
	return async thing => {
		const n = i++;
		// Whether a thing will be visible, is usually ascertained when the filter task has been completed
		const filterTask = thing.tasks.byId.get('filter');
		if (filterTask instanceof Promise) await filterTask();
		const check = queue[n] = () => {
			delete queue[n];
			if (thing.tasks.completed || thing.isVisible()) {
				thing.runTasks();
			} else if (n < max) {
				max++;
				const nextCheck = queue.find(Boolean);
				if (nextCheck) nextCheck();
			}
		};
		if (n < max) check();
	};
};

export function registerPage(page: HTMLElement, runLikelyVisibleTasks: function = _runLikelyVisibleTasks()) {
	const things = filterMap([
		page.matches(Thing.thingSelector) && page,
		...page.querySelectorAll(Thing.thingSelector),
	], e => e instanceof HTMLElement ? [registerThing(e)] : undefined);

	registerElement('page', page);

	things.forEach(runLikelyVisibleTasks);
}

const HIDE_FOLLOWING_CLASS = 'res-hide-following';
const THING_NOT_COMPLETED = 'res-thing-not-completed';
const dupeSet = new Set();
let contentLoaded = false;

export async function r2WatcherSitetableStart() {
	// Loading additional things ("load more comments", neverEndingReddit) may cause repeating posts; remove those
	watchForThings(['post', 'comment'], thing => {
		// Check if the post was in `#siteTable` to avoid registering posts from the spotlight box
		if (document.contains(thing.element) && !thing.element.closest('#siteTable')) return;
		const id = thing.getFullname();
		if (dupeSet.has(id)) thing.element.remove();
		dupeSet.add(id);
	}, { immediate: true });

	// Add selftext observer
	watchForThings(['post'], thing => {
		const container = thing.entry.querySelector('div.expando');
		if (!container) return;
		watchForChildren(container, 'form', () => {
			const body = thing.getTextBody();
			if (body) registerElement('selfText', body);
		});
	});

	const getReadyThingElements = () => {
		Thing.thingElements.cache.clear();
		const thingElements = Thing.thingElements();

		// Check if the last element (tree?) is complete
		// If there's no nodes in the DOM after it, it's contents might not be ready to be processed
		const last = thingElements.slice(-1)[0];
		if (last && isLastNodeInDOM(last)) {
			thingElements.pop();
			// Remove earlier hide
			for (const ele of [...document.getElementsByClassName(THING_NOT_COMPLETED)]) ele.classList.remove(THING_NOT_COMPLETED);
			last.classList.add(THING_NOT_COMPLETED);
		}

		return thingElements;
	};

	let thingElements;
	while (!(thingElements = getReadyThingElements()).length) {
		await waitForDescendantChange(document.body, Thing.thingSelector); // eslint-disable-line no-await-in-loop
		// Stop if the next phase has started by now
		if (contentLoaded) return;
	}

	const runLikelyVisibleTasks = _runLikelyVisibleTasks();

	for (const e of thingElements) {
		const thing = registerThing(e);
		runLikelyVisibleTasks(thing);
	}

	// Hide the following elements until 'contentLoaded',
	// to prevent them being painted without the 'immediate' watchers having been invoked on them
	let _last = thingElements.slice(-1)[0];
	do { _last.classList.add(HIDE_FOLLOWING_CLASS); } while ((_last = _last.parentElement) && _last !== document.body);
}

export function r2WatcherContentLoaded() {
	contentLoaded = true;
	for (const ele of [...document.getElementsByClassName(THING_NOT_COMPLETED)]) ele.classList.remove(THING_NOT_COMPLETED);
	for (const ele of [...document.getElementsByClassName(HIDE_FOLLOWING_CLASS)]) ele.classList.remove(HIDE_FOLLOWING_CLASS);

	// Execute non-immediate callbacks on things when they become visible
	const io = new IntersectionObserver(entries => {
		for (const { target, isIntersecting } of entries) {
			if (isIntersecting) {
				io.unobserve(target);
				(Thing.checkedFrom(target)).runTasks();
			}
		}
	}, { rootMargin: '100%' });

	watchForThings(null, async thing => {
		// By starting observing before the element is attached (e.g. when invoked via neverEndingReddit), the IO may not trigger
		if (!document.body.contains(thing.element)) await waitForAttach(document.body, thing.element);
		io.observe(thing.element);
	}, { immediate: true });

	// Things may be edited/loaded using the Reddit interface
	if (isPageType('comments')) {
		const commentarea = document.body.querySelector('.commentarea');
		if (commentarea) watchForFutureDescendants(commentarea, '.thing', registerPage, true);
	} else {
		const watchList = memoize(ele => { if (ele) watchForFutureChildren(ele, '.thing', registerPage); });
		watchForThings(null, thing => { watchList(thing.element.parentElement); });
	}

	registerPage(document.body);
}
