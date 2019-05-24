/* @flow */

import _ from 'lodash';
import { Thing } from './Thing';
import { filterMap } from './array';
import { isPageType } from './location';
import { watchForChildren, watchForFutureChildren, watchForFutureDescendants } from './dom';

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
		const task = _.once(() => runCallback(callback));
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
		// Whether a thing will be visible, is usually decided once the filter task has been completed
		const filterTask = thing.tasks.byId.get('filter');
		await (filterTask && filterTask());
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

export function registerPage(page: HTMLElement, runLikelyVisibleVisibleTasks: function = _runLikelyVisibleTasks()) {
	const things = filterMap([
		page.matches(Thing.thingSelector) && page,
		...page.querySelectorAll(Thing.thingSelector),
	], e => e instanceof HTMLElement ? [registerThing(e)] : undefined);

	registerElement('page', page);

	things.forEach(runLikelyVisibleVisibleTasks);
}

const HIDE_FOLLOWING_CLASS = 'res-thing-hide-following';

export function r2WatcherSitetableStart() {
	// Add selftext observer
	watchForThings(['post'], thing => {
		const container = thing.entry.querySelector('div.expando');
		if (!container) return;
		watchForChildren(container, 'form', () => {
			const body = thing.getTextBody();
			if (body) registerElement('selfText', body);
		});
	});

	// Only register top level things, to avoid processing incomplete comment trees--which may have bad side effects
	const thingElements = Thing.thingElements(document.body, true);

	const runLikelyVisibleVisibleTasks = _runLikelyVisibleTasks();
	for (const e of thingElements) registerPage(e, runLikelyVisibleVisibleTasks);

	const lastThing = thingElements.slice(-1)[0];
	// Hide the following Things until 'contentLoaded', to prevent them being painted without the 'immediate' watchers being invoked on them
	if (lastThing) lastThing.classList.add(HIDE_FOLLOWING_CLASS);
}

export function r2WatcherContentLoaded() {
	// Execute non-immediate callbacks on things when they become visible
	const io = new IntersectionObserver(entries => {
		const intersecting = filterMap(entries, ({ target, isIntersecting }) => isIntersecting && [Thing.from(target)]);
		if (!intersecting.length) return;

		const thingElements = Thing.thingElements();
		const things = _.sortBy(intersecting, thing => thingElements.indexOf(thing.element));

		// Always run tasks on the intersecting things, in case `Thing#isVisible` or `runTaskRange` breaks
		for (const thing of things) thing.runTasks();

		// Also complete a few of the surrounding things in order to reduce the number of mutation instances
		Thing.runTasksRange(things.slice(-1)[0], things[0], 10, 10);
	}, { rootMargin: '50%' });

	watchForThings(null, thing => {
		io.observe(thing.element);
		addCallback(() => {
			io.unobserve(thing.element);
			thing.tasks.completed = true;
		}, thing.element);
	}, { immediate: true });

	// Things may be edited/loaded using the Reddit interface
	if (isPageType('comments')) {
		const commentarea = document.body.querySelector('.commentarea');
		if (commentarea) watchForFutureDescendants(commentarea, '.thing', registerPage, true);
	} else {
		const watchList = _.memoize(ele => { if (ele) watchForFutureChildren(ele, '.thing', registerPage); });
		watchForThings(null, thing => { watchList(thing.element.parentElement); });
	}

	(document.body.querySelector(`.${HIDE_FOLLOWING_CLASS}`) || document.body).classList.remove(HIDE_FOLLOWING_CLASS);

	registerPage(document.body);
}
