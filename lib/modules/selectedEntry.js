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
export const getLastSelectedId = () => sessionStorage[lastSelectedKey];
let selectedContainer: ?Element;
let oldSelected;

module.beforeLoad = () => {
	addScrollStyleListener();

	if (module.options.addLine.value) styleLine();
	if (module.options.setColors.value) styleColor();
	styleOutline();

	// Auto select the previous selected thing this session, or the first thing
	const lastSelectedId = getLastSelectedId();
	watchForThings(null, thing => {
		if (Thing.selected) return;
		if (!lastSelectedId) return select(thing);
		if (thing.getFullname() !== lastSelectedId) return;
		history.scrollRestoration = 'manual';
		select(thing, { scrollStyle: 'legacy' });
	}, { immediate: true });
};

module.contentStart = () => {
	// Select Thing on manual click
	$(document.body).on('mouseup', Thing.thingSelector, (e: MouseEvent) => {
		if (click.isProgrammaticEvent(e)) return;
		const thing = Thing.from(e.target);
		if (thing) select(thing);
		return false; // In comment threads `thingSelector` may match parents of `target`; returning `false` prevents the event bubbling to them
	});

	if (module.options.autoSelectOnScroll.value) {
		window.addEventListener('scroll', () => { autoSelect(); });
	}
};

module.afterLoad = () => {
	if (!Thing.selected || !Thing.selected.isVisible()) autoSelect();

	// When loading additonal comments, select the first newly loaded comment
	watchForThings(['comment'], _.throttle(thing => {
		if (Thing.selected && document.contains(Thing.selected.element)) return;
		if (selectedContainer && selectedContainer !== thing.element.closest('.sitetable')) return;
		select(thing);
	}, 100, { leading: true, trailing: false }), { immediate: true });

	addListener(selected => {
		const id = selected.getFullname();
		if (!id) return;
		sessionStorage[lastSelectedKey] = id;
	}, 'beforePaint');
};

type SelectOptions = {
	allowMediaBrowse?: boolean,
	scrollStyle: ScrollStyle,
};

type SelectOptionsWithDirection = SelectOptions & { direction?: 'down' | 'up' };

const listeners = { instantly: [], beforePaint: [], idle: [] };

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

	const runBeforePaint = throttle(frameThrottle, listeners.beforePaint);
	const runIdle = throttle(idleThrottle, listeners.idle);

	return (new_, old, opt) => {
		if (listeners.instantly.length) runListeners(listeners.instantly, new_, old, opt);
		if (listeners.beforePaint.length) runBeforePaint(new_, old, opt);
		if (listeners.idle.length) runIdle(new_, old, opt);
	};
})();

export function select(newSelected: Thing, options: SelectOptions = { scrollStyle: 'none' }, force: boolean = false) {
	if (!force && newSelected === Thing.selected) return;

	oldSelected = Thing.selected;
	Thing.selected = newSelected;
	selectedContainer = newSelected.element.closest('.sitetable');

	const direction = oldSelected && oldSelected.getDirectionOf(newSelected);
	runCallbacks(newSelected, oldSelected, { ...options, ...(direction ? { direction } : undefined) });
}

const autoSelect = frameDebounce(() => {
	if (Thing.selected && getPercentageVisibleYAxis(Thing.selected.entry)) return;

	const closestToCurrent = Thing.selected && Thing.selected.getClosestVisible();
	if (closestToCurrent && getPercentageVisibleYAxis(closestToCurrent.entry)) {
		select(closestToCurrent);
		return;
	}

	const things = Thing.visibleThings();
	const currentIndex = things.indexOf(Thing.selected);
	const closestThings = _.sortBy(things.filter(thing => thing.isVisible()), thing => Math.abs(things.indexOf(thing) - currentIndex));
	const closestVisible = _.maxBy(closestThings, ({ entry }) => getPercentageVisibleYAxis(entry));
	if (closestVisible) select(closestVisible);
});

export function refreshSelect() {
	if (!Thing.selected || Thing.selected.isVisible()) return;
	autoSelect();
}

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
	if (!Thing.selected || !Thing.selected.element.offsetParent) {
		autoSelect();
		return;
	}

	const targetFn = movers[direction];

	if (!Thing.selected && targetFn.length) {
		if (!fallback || !fallback()) throw new Error('Function only works when an entry is selected');
	}

	const target = targetFn((Thing.selected: any));

	if (!target) {
		if (fallback && fallback()) return;

		if (Thing.selected) return select(Thing.selected, { scrollStyle: 'middle' });
		throw new Error('Could not find a target');
	} else if (Thing.selected === target) {
		if (Thing.selected) return select(Thing.selected, { scrollStyle: 'middle' });
		throw new Error('Target already selected');
	}

	select(target, options);
}

const addScrollStyleListener = _.once(() => {
	let anchor;
	// Partially visible comments may change height change depending on whether they are selected,
	// so it is necessary to anchor them to avoid having viewport move relative to the selected thing
	// XXX Can the native browser scroll anchoring achieve this?
	addListener((selected, unselected, { scrollStyle }) => {
		if (
			unselected && selected !== unselected &&
			(['none', 'adopt']: Array<ScrollStyle>).includes(scrollStyle) &&
			(selected.element.classList.contains('res-thing-partial') || unselected.element.classList.contains('res-thing-partial'))
		) {
			anchor = {
				to: selected.entry.getBoundingClientRect().top,
				from: unselected.entry.getBoundingClientRect().top,
			};
		} else {
			anchor = undefined;
		}
	}, 'instantly', -Infinity);

	addListener(async (selected, unselected, { direction, scrollStyle }) => {
		selected.runTasks();
		// If this has to wait for the thing to be visible, a promise is returned
		await scrollToElement(selected.entry, unselected && unselected.entry, { scrollStyle, direction, anchor, waitTillVisible: true });
	}, 'beforePaint', 9);
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
