/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { LAST_SELECTED_ENTRY_KEY } from '../constants/sessionStorage';
import {
	Thing,
	addCSS,
	click,
	getPercentageVisibleYAxis,
	scrollToElement,
	watchForThings,
	frameThrottle,
	frameDebounce,
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

const lastSelectedKey = `${LAST_SELECTED_ENTRY_KEY}-${location.pathname}`;

module.beforeLoad = () => {
	addScrollStyleListener();

	if (module.options.addLine.value) styleLine();
	if (module.options.setColors.value) styleColor();
	styleOutline();

	if (!sessionStorage[lastSelectedKey]) {
		watchForThings(null, _.once(select));
	}
};

module.go = () => {
	watchForThings(['comment'], onNewComments, { immediate: true });

	// Select Thing on manual click
	$(document.body).on('mouseup', Thing.bodyThingSelector, (e: MouseEvent) => {
		if (!click.isProgrammaticEvent(e)) onClick(e);
	});

	if (module.options.autoSelectOnScroll.value) {
		window.addEventListener('scroll', () => { autoSelect(); });
	}

	if (module.options.selectLastThingOnLoad.value) {
		requestAnimationFrame(() => {
			const lastSelectedId = sessionStorage[lastSelectedKey];
			const thing = lastSelectedId && Thing.from(document.querySelector(`.thing[data-fullname=${lastSelectedId}]`));
			if (!thing) return;
			if (module.options.scrollToSelectedThingOnLoad.value) history.scrollRestoration = 'manual';
			// `scrollRestoration` may also be set in neverEndingReddit
			const scrollToSelected = history.scrollRestoration === 'manual';
			select(thing, { scrollStyle: scrollToSelected ? 'legacy' : 'none' });
		});
	}

	refreshSelect();
};

const onClick = _.throttle(e => {
	addLastSelectedListener();
	const thing = Thing.from(e.target);
	if (thing) select(thing, { scrollStyle: 'none' });
}, 100, { trailing: false });

export let selectedThing: ?Thing;
let selectedContainer: ?Element;

type SelectOptions = {
	allowMediaBrowse?: boolean,
	scrollStyle: ScrollStyle,
};

type SelectOptionsWithDirection = SelectOptions & { direction?: 'down' | 'up' };

const listeners = { beforeScroll: [], beforePaint: [], idle: [] };

export function addListener(
	callback: (new_: Thing, old: ?Thing, opt: SelectOptionsWithDirection) => mixed,
	when: $Keys<typeof listeners> = 'idle',
	priority: number = 0
): void {
	callback.priority = priority;
	listeners[when].push(callback);
	listeners[when].sort((a, b) => a.priority - b.priority);
}

const runCallbacks = (() => {
	function runListeners(listeners, new_, old, opt) {
		for (const listener of listeners) try { listener(new_, old, opt); } catch (e) { console.error(e); }
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
		if (listeners.beforePaint.length) runPaint(new_, old, opt);
		if (listeners.idle.length) runIdle(new_, old, opt);
	};
})();

let oldSelected;

export function select(newSelected: Thing, options: SelectOptions = { scrollStyle: 'none' }, force: boolean = false) {
	if (!force && newSelected === selectedThing) return;

	oldSelected = selectedThing;

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
		const newContainer = thing.element.closest('.sitetable');
		if (newContainer === selectedContainer) {
			select(thing);
			// The comment may be hidden by filters, so check that it's actually visible
			autoSelect();
		}
	}
}, 100, { leading: true, trailing: false });

const autoSelect = frameDebounce(() => {
	if (selectedThing && getPercentageVisibleYAxis(selectedThing.entry)) return;

	const closestToCurrent = selectedThing && selectedThing.getClosestVisible();
	if (closestToCurrent && getPercentageVisibleYAxis(closestToCurrent.entry)) {
		select(closestToCurrent);
		return;
	}

	const things = Thing.visibleThings();
	const currentIndex = things.indexOf(selectedThing);
	const closestThings = _.sortBy(things.filter(thing => thing.isVisible()), thing => Math.abs(things.indexOf(thing) - currentIndex));
	const closestVisible = _.maxBy(closestThings, ({ entry }) => getPercentageVisibleYAxis(entry));
	if (closestVisible) select(closestVisible);
});

export function refreshSelect() {
	if (!selectedThing || selectedThing.isVisible()) return;
	autoSelect();
}

// avoid adding this at once, to avoid storing initial (auto) selection
const addLastSelectedListener = _.once(() => {
	addListener(selected => {
		sessionStorage[lastSelectedKey] = selected.getFullname();
	}, 'beforeScroll');
});

const movers = {
	closestVisible: (thing: Thing) => thing.getClosestVisible(),
	up: (thing: Thing) => thing.getNext({ direction: 'up' }),
	down: (thing: Thing) => thing.getNext({ direction: 'down' }),
	top: (/*:: thing: Thing */) => Thing.visibleThings()[0],
	bottom: (/*:: thing: Thing */) => Thing.visibleThings().slice(-1)[0],
	upSibling: (thing: Thing) => thing.getNextSibling({ direction: 'up' }) || thing.parent,
	downSibling: (thing: Thing) => thing.getClosest(thing.getNextSibling, { direction: 'down' }),
	downParentSibling: (thing: Thing) => (thing.parent || thing).getClosest(thing.getNextSibling, { direction: 'down' }),
	upThread: (thing: Thing) => thing.getThreadTop().getNextSibling({ direction: 'up' }) || thing.getThreadTop(),
	downThread: (thing: Thing) => thing.getThreadTop().getNextSibling({ direction: 'down' }),
	toTopComment: (thing: Thing) => thing.getThreadTop(),
	toParent: (thing: Thing) => thing.parent,
	previous: (/*:: thing: Thing */) => oldSelected,
};

export function move(direction: $Keys<typeof movers>, options?: SelectOptionsWithDirection, fallback?: () => ?*) {
	if (!selectedThing || !selectedThing.element.offsetParent) {
		autoSelect();
		return;
	}

	const targetFn = movers[direction];

	if (!selectedThing && targetFn.length) {
		if (!fallback || !fallback()) throw new Error('Function only works when an entry is selected');
	}

	const target = targetFn((selectedThing: any));

	if (!target) {
		if (fallback && fallback()) return;

		if (selectedThing) return select(selectedThing, { scrollStyle: 'middle' });
		throw new Error('Could not find a target');
	} else if (selectedThing === target) {
		if (selectedThing) return select(selectedThing, { scrollStyle: 'middle' });
		throw new Error('Target already selected');
	}

	addLastSelectedListener();
	select(target, options);
}

export const frameThrottledMove = frameThrottle(move);

const addScrollStyleListener = _.once(() => {
	// Filtered comments may be collapsed or expanded (causing height change) depending on whether they are selected
	let anchor;
	addListener((selected, unselected, { scrollStyle }) => {
		if (
			unselected && selected !== unselected &&
			(['none', 'adopt']: Array<ScrollStyle>).includes(scrollStyle) &&
			(selected.matchingHideFilter || unselected.matchingHideFilter)
		) {
			anchor = {
				to: selected.entry.getBoundingClientRect().top,
				from: unselected.entry.getBoundingClientRect().top,
			};
		} else {
			anchor = undefined;
		}
	}, 'beforeScroll', -Infinity);

	// Scroll may force reflow when determining new position
	// Run it last so that another listener won't invalidate it
	addListener((selected, unselected, { scrollStyle, direction }) => scrollToElement(selected.entry, unselected && unselected.entry, { scrollStyle, direction, anchor }), 'beforePaint', Infinity);
});

const installUpdateSelectedElementClassListener = _.once(() =>
	addListener((selected, last) => {
		if (last) {
			last.entry.classList.remove('res-selected');
			last.element.classList.remove('res-selected');
		}
		if (selected) {
			selected.entry.classList.add('res-selected');
			selected.element.classList.add('res-selected');
		}
	}, 'beforePaint')
);

// why !important on .entry.res-selected?  Because some subreddits are unfortunately using !important for no good reason on .entry divs...

function styleLine() {
	addCSS(`
		.entry.res-selected { box-shadow: 3px 0 0 -1px #c2d2e0 !important; }
		.res-nightmode .entry.res-selected { box-shadow: 3px 0 0 -1px grey !important; }
	`);
	installUpdateSelectedElementClassListener();
}

function styleColor() {
	// Add legacy classes for external stylesheets which override these styles
	addListener((selected, last) => {
		if (last) {
			last.entry.classList.remove('RES-keyNav-activeElement');
			last.element.classList.remove('RES-keyNav-activeThing');
		}
		if (selected) {
			selected.entry.classList.add('RES-keyNav-activeElement');
			selected.element.classList.add('RES-keyNav-activeThing');
		}
	}, 'beforePaint');

	const backgroundColor = module.options.backgroundColor.value ? `
		.entry.res-selected,
		.entry.res-selected .md-container {
			background-color: ${module.options.backgroundColor.value} !important;
		}` : '';

	const backgroundColorNight = module.options.backgroundColorNight.value ? `
		.res-nightmode .entry.res-selected,
		.res-nightmode .entry.res-selected .md-container {
			background-color: ${module.options.backgroundColorNight.value} !important;
		}` : '';

	const textColorNight = module.options.textColorNight.value ? `
		.res-nightmode .entry.res-selected > .tagline,
		.res-nightmode .entry.res-selected .md-container > .md,
		.res-nightmode .entry.res-selected .md-container > .md p {
			color: ${module.options.textColorNight.value} !important;
		}` : '';

	addCSS(backgroundColor + backgroundColorNight + textColorNight);
	installUpdateSelectedElementClassListener();
}

function styleOutline() {
	const outlineStyle = module.options.outlineStyle.value ? `
		.entry.res-selected {
			outline: ${module.options.outlineStyle.value};
		}` : '';

	const outlineStyleNight = module.options.outlineStyleNight.value ? `
		.res-nightmode .entry.res-selected {
			outline: ${module.options.outlineStyleNight.value};
		}
	` : '';

	const style = outlineStyle + outlineStyleNight;
	if (style) {
		addCSS(style);
		installUpdateSelectedElementClassListener();
	}
}
