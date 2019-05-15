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
	if (thing && !thing.tasks.completed) {
		// XXX The callback ought not be wrapped so many times
		const task = _.once(() => runCallback(callback));
		if (id) thing.tasks.byId.set(id, task);
		(immediate ? thing.tasks.immediate : thing.tasks.visible).push(task);
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

export function registerPage(
	page: HTMLElement,
	runCallbacksOnVisibleCounter: {| count: number |} = { count: 20 },
	timeout: Promise<*> = new Promise(rej => setTimeout(rej, 2000))
) {
	const things = [];
	// Always rerun the `registerThing` function on Thing elements, in case new Thing watchers has been added
	if (page.matches(Thing.thingSelector)) things.push(registerThing(page));
	for (const e of page.querySelectorAll(Thing.thingSelector)) things.push(registerThing(e));

	registerElement('page', page);

	const promise = things.map<*>(thing => {
		thing.tasks.immediate.map(fn => fn());
		// XXX This does not actually not process `remaining` number of actually visible things if some matching filters are not synchronous
		if (runCallbacksOnVisibleCounter.count > 0 && thing.isVisible()) {
			runCallbacksOnVisibleCounter.count--;
			thing.runTasks();
		}
	});

	// Return a promise that resolves when all initial callbacks have completed or timeout promise rejects
	return Promise.race([promise, timeout]).catch(console.error);
}

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

	// Run visible tasks on the first things
	const counter = { count: 20 }; // Since `registerPage` is called multiple times, the counter must be referenced via an object

	// In case some of the idle callbacks get stuck, escape on the first idle or after 2 s
	const timeout = new Promise((res, rej) => {
		requestIdleCallback(() => rej(new Error('Immediate callbacks was not completed timely')), { timeout: 2000 });
	});

	// $FlowIssue Array#flat
	return Promise.all(thingElements.map(e => registerPage(e, counter, timeout)).flat());
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
	}, { rootMargin: '10%' });

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

	registerPage(document.body);
}
