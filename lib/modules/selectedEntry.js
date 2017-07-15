/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { Session } from '../environment';
import {
	Thing,
	addCSS,
	BodyClasses,
	click,
	elementInViewport,
	fastAsync,
	scrollToElement,
	watchForThings,
	frameThrottle,
	idleThrottle,
} from '../utils';
import type { ScrollStyle } from '../utils/dom';

export const module: Module<*> = new Module('selectedEntry');

module.moduleName = 'selectedEntryName';
module.category = 'browsingCategory';
module.include = ['comments', 'linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox', 'search'];
module.description = 'selectedEntryDesc';
module.alwaysEnabled = true;

module.options = {
	autoSelectOnScroll: {
		title: 'selectedEntryAutoSelectOnScrollTitle',
		type: 'boolean',
		value: false,
		description: 'selectedEntryAutoSelectOnScrollDesc',
	},
	selectLastThingOnLoad: {
		title: 'selectedEntrySelectLastThingOnLoadTitle',
		type: 'boolean',
		value: true,
		description: 'selectedEntrySelectLastThingOnLoadDesc',
	},
	scrollToSelectedThingOnLoad: {
		title: 'selectedEntryScrollToSelectedThingOnLoadTitle',
		type: 'boolean',
		value: false,
		advanced: true,
		description: 'selectedEntryScrollToSelectedThingOnLoadDesc',
		dependsOn: options => options.selectLastThingOnLoad.value,
	},
	addLine: {
		title: 'selectedEntryAddLineTitle',
		type: 'boolean',
		value: false,
		description: 'selectedEntryAddLineDesc',
	},
	setColors: {
		title: 'selectedEntrySetColorsTitle',
		type: 'boolean',
		value: true,
		description: 'selectedEntrySetColorsDesc',
	},
	backgroundColor: {
		title: 'selectedEntryBackgroundColorTitle',
		type: 'color',
		value: '#F0F3FC',
		description: 'selectedEntryBackgroundColorDesc',
		advanced: true,
		dependsOn: options => options.setColors.value,
	},
	backgroundColorNight: {
		title: 'selectedEntryBackgroundColorNightTitle',
		type: 'color',
		value: '#373737',
		description: 'selectedEntryBackgroundColorNightDesc',
		advanced: true,
		dependsOn: options => options.setColors.value,
	},
	textColorNight: {
		title: 'selectedEntryTextColorNightTitle',
		type: 'color',
		value: '#DDDDDD',
		description: 'selectedEntryTextColorNightDesc',
		advanced: true,
		dependsOn: options => options.setColors.value,
	},
	outlineStyle: {
		title: 'selectedEntryOutlineStyleTitle',
		type: 'text',
		value: '',
		description: 'selectedEntryOutlineStyleDesc',
		advanced: true,
	},
	outlineStyleNight: {
		title: 'selectedEntryOutlineStyleNightTitle',
		type: 'text',
		value: '',
		description: 'selectedEntryOutlineStyleNightDesc',
		advanced: true,
	},
};

module.beforeLoad = () => {
	setupLastSelectedCache();
	watchForThings(['post', 'comment', 'message'], selectInitial);
};

module.go = () => {
	watchForThings(['comment'], onNewComments);

	// Select Thing on manual click
	$(document.body).on('mouseup', Thing.bodyThingSelector, e => {
		if (!click.isProgrammaticEvent(e)) onClick(e);
	});

	if (module.options.autoSelectOnScroll.value) {
		window.addEventListener('scroll', _.debounce(() => { if (!recentKeyMove) autoSelect(); }, 300));
	}

	if (module.options.addLine.value) styleLine();
	if (module.options.setColors.value) styleColor();
	styleOutline();

	addListener(updateActiveElement, 'beforePaint');
	addListener(selected => BodyClasses.toggle(!!selected, 'res-entry-is-selected'), 'beforePaint');
	addListener((selected, unselected, { scrollStyle, direction }) => scrollToElement(selected.entry, { from: unselected && unselected.entry, scrollStyle, direction }), 'beforePaint');
};

const onClick = _.throttle(e => {
	const thing = Thing.from(e.target);
	if (thing) select(thing, { scrollStyle: 'none' });
}, 100, { trailing: false });

export let selectedThing: ?Thing;
let selectedContainer: ?Element;

type SelectOptions = {
	allowMediaBrowse?: boolean,
	scrollStyle: ScrollStyle,
	paintImmediate?: boolean, // Set `true` when `select` is invoked during the animation phase, in order for `beforePaint` not to be delayed to the next animation frame
};

type SelectOptionsWithDirection = SelectOptions & { direction?: 'down' | 'up' };

const listeners = { beforeScroll: [], beforePaint: [], idle: [] };

export function addListener(callback: (new_: Thing, old: ?Thing, opt: SelectOptionsWithDirection) => mixed, when?: $Keys<typeof listeners> = 'idle'): void {
	listeners[when].push(callback);
}

const runCallbacks = (() => {
	function runListeners(listeners, new_, old, opt) {
		for (const listener of listeners) listener(new_, old, opt);
	}

	function throttle(throttler, listeners) {
		let oldest: ?Thing; // So that `oldest` will equal `new_` from the previous listener invokation

		const throttled = throttler((new_: Thing, old: ?Thing, opt: SelectOptionsWithDirection) => {
			runListeners(listeners, new_, oldest, opt);
			oldest = null;
		});

		return (new_, old, opt) => {
			if (!oldest) oldest = old;
			throttled(new_, old, opt);
		};
	}

	const runIdle = throttle(idleThrottle, listeners.idle);
	const runPaint = throttle(frameThrottle, listeners.beforePaint);

	return (new_, old, opt) => {
		if (listeners.beforeScroll.length) runListeners(listeners.beforeScroll, new_, old, opt);
		if (listeners.beforePaint.length) {
			if (opt.paintImmediate) runListeners(listeners.beforePaint, new_, old, opt);
			else runPaint(new_, old, opt);
		}
		if (listeners.idle.length) runIdle(new_, old, opt);
	};
})();

export function select(newSelected: Thing, options: SelectOptions = { scrollStyle: 'none' }) {
	if (newSelected === selectedThing) return;

	const oldSelected = selectedThing;

	options = {
		...options,
		direction: newSelected && newSelected.isVisible() && oldSelected && oldSelected.isVisible() ?
			(newSelected.entry.getBoundingClientRect().top > oldSelected.entry.getBoundingClientRect().top ? 'down' : 'up') :
			undefined,
	};

	runCallbacks(newSelected, oldSelected, options);

	selectedThing = newSelected;
	selectedContainer = newSelected && newSelected.element.closest('.sitetable');
}

const onNewComments = _.throttle(thing => {
	if (selectedThing && !document.contains(selectedThing.element)) {
		// Selected thing was replaced, so select the replacement
		const newContainer = $(thing.element).closest('.sitetable').get(0);
		if (newContainer === selectedContainer) {
			select(thing);
		}
	}
}, 100, { leading: true, trailing: false });

function updateActiveElement(selected, last) {
	if (last) {
		last.entry.classList.remove('RES-keyNav-activeElement');
		last.element.classList.remove('RES-keyNav-activeThing');
	}
	if (selected) {
		selected.entry.classList.add('RES-keyNav-activeElement');
		selected.element.classList.add('RES-keyNav-activeThing');
	}
}

function autoSelect() {
	if (selectedThing && elementInViewport(selectedThing.element)) return;

	for (const thing of Thing.visibleThings()) {
		if (elementInViewport(thing.element)) {
			select(thing);
			break;
		}
	}
}

const lastSelectedKey = 'RESmodules.selectedThing.lastSelectedCache';
let lastSelectedCache;

const setupLastSelectedCache = _.once(async () => {
	lastSelectedCache = await Session.get(lastSelectedKey) || {};

	// clean cache every so often and delete any urls that haven't been visited recently
	const clearCachePeriod = 21600000; // 6 hours
	const itemExpiration = 3600000; // 1 hour
	const now = Date.now();
	if (!lastSelectedCache.lastScan || (now - lastSelectedCache.lastScan > clearCachePeriod)) {
		for (const idx in lastSelectedCache) {
			if (lastSelectedCache[idx] && (now - lastSelectedCache[idx].updated > itemExpiration)) {
				delete lastSelectedCache[idx];
			}
		}
		lastSelectedCache.lastScan = now;
		Session.set(lastSelectedKey, lastSelectedCache);
	}
});

function urlForSelectedCache() {
	let url = document.location.pathname;
	// remove any trailing slash from the URL
	if (url.endsWith('/')) {
		url = url.slice(0, -1);
	}

	return url;
}

function updateLastSelectedCache(selected) {
	if (!lastSelectedCache) return;

	const url = urlForSelectedCache();
	lastSelectedCache[url] = {
		fullname: selected.getFullname(),
		updated: Date.now(),
	};
	Session.set('RESmodules.selectedThing.lastSelectedCache', lastSelectedCache);
}

const selectInitial = _.once(fastAsync(function*(firstThing) {
	if (module.options.scrollToSelectedThingOnLoad.value) history.scrollRestoration = 'manual';
	// `scrollRestoration` may also be set in neverEndingReddit
	const scrollToSelected = history.scrollRestoration === 'manual';

	const lastSelected = yield findLastSelectedThing();
	const target = (lastSelected || firstThing).getClosestVisible() || lastSelected || firstThing;

	select(target, {
		scrollStyle: scrollToSelected ? 'legacy' : 'none',
		paintImmediate: true,
	});

	addListener(updateLastSelectedCache);
}));

async function findLastSelectedThing() {
	await setupLastSelectedCache();

	const url = urlForSelectedCache();
	const lastSelected = lastSelectedCache[url] && lastSelectedCache[url].fullname;
	if (lastSelected) {
		return Thing.things().find(v => v.getFullname() === lastSelected);
	}
}

const movers = {
	closestVisible: (thing: Thing) => thing.getClosestVisible(false),
	up: (thing: Thing) => thing.getNext({ direction: 'up' }),
	down: (thing: Thing) => thing.getNext({ direction: 'down' }),
	top: () => Thing.visibleThings()[0],
	bottom: () => Thing.visibleThings().slice(-1)[0],
	upSibling: (thing: Thing) => thing.getNextSibling({ direction: 'up' }) || thing.getParent(),
	downSibling: (thing: Thing) => thing.getClosest(thing.getNextSibling, { direction: 'down' }),
	downParentSibling: (thing: Thing) => (thing.getParent() || thing).getClosest(thing.getNextSibling, { direction: 'down' }),
	upThread: (thing: Thing) => thing.getThreadTop().getNextSibling({ direction: 'up' }) || thing.getThreadTop(),
	downThread: (thing: Thing) => thing.getThreadTop().getNextSibling({ direction: 'down' }),
	toTopComment: (thing: Thing) => thing.getThreadTop(),
	toParent: (thing: Thing) => thing.getParent(),
};

let recentKeyMove = false;
const refreshKeyMoveTimer = _.debounce(() => { recentKeyMove = false; }, 1000);

export function move(direction: $Keys<typeof movers>, options?: SelectOptionsWithDirection, fallback?: () => void) {
	if (!selectedThing) autoSelect();

	const targetFn = movers[direction];

	let thing;
	if (!selectedThing && targetFn.length) throw new Error('Function only works when an entry is selected');
	else thing = (selectedThing: any);

	const target = targetFn(thing);

	if (!target) {
		if (fallback) fallback();
		return;
	} else if (selectedThing === target) {
		return;
	}

	select(target, options);

	recentKeyMove = true;
	refreshKeyMoveTimer();
}

// why !important on .RES-keyNav-activeElement?  Because some subreddits are unfortunately using !important for no good reason on .entry divs...

function styleLine() {
	addCSS(`
		.RES-keyNav-activeElement { box-shadow: 3px 0 0 -1px #c2d2e0; !important; }
		.res-nightmode .RES-keyNav-activeElement { box-shadow: 3px 0 0 -1px grey; !important; }
	`);
}

function styleColor() {
	const backgroundColor = module.options.backgroundColor.value ? `
		.RES-keyNav-activeElement,
		.RES-keyNav-activeElement .md-container {
			background-color: ${module.options.backgroundColor.value} !important;
		}` : '';

	const backgroundColorNight = module.options.backgroundColorNight.value ? `
		.res-nightmode .RES-keyNav-activeElement,
		.res-nightmode .RES-keyNav-activeElement .md-container {
			background-color: ${module.options.backgroundColorNight.value} !important;
		}` : '';

	const textColorNight = module.options.textColorNight.value ? `
		.res-nightmode .RES-keyNav-activeElement > .tagline,
		.res-nightmode .RES-keyNav-activeElement .md-container > .md,
		.res-nightmode .RES-keyNav-activeElement .md-container > .md p {
			color: ${module.options.textColorNight.value} !important;
		}` : '';

	addCSS(backgroundColor + backgroundColorNight + textColorNight);
}

function styleOutline() {
	const outlineStyle = module.options.outlineStyle.value ? `
		.RES-keyNav-activeElement {
			outline: ${module.options.outlineStyle.value};
		}` : '';

	const outlineStyleNight = module.options.outlineStyleNight.value ? `
		.res-nightmode .RES-keyNav-activeElement {
			outline: ${module.options.outlineStyleNight.value};
		}
	` : '';

	addCSS(outlineStyle + outlineStyleNight);
}
