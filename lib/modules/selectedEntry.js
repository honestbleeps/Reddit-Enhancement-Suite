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
	isPageType,
	scrollToElement,
	watchForElement,
	idleThrottle,
} from '../utils';
import type { ScrollStyle } from '../utils/dom';
import * as Hover from './hover';
import * as KeyboardNav from './keyboardNav';
import * as NeverEndingReddit from './neverEndingReddit';

export const module: Module<*> = new Module('selectedEntry');

module.moduleName = 'selectedEntryName';
module.category = 'browsingCategory';
module.include = ['comments', 'linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox', 'search'];
module.description = 'selectedEntryDesc';

module.options = {
	autoSelectOnScroll: {
		type: 'boolean',
		value: false,
		description: 'Automatically select the topmost item while scrolling',
	},
	selectThingOnLoad: {
		type: 'boolean',
		value: true,
		description: 'Automatically select a post/comment when the page loads',
	},
	selectLastThingOnLoad: {
		dependsOn: 'selectThingOnLoad',
		type: 'boolean',
		value: true,
		description: 'Automatically select the last thing you had selected',
	},
	scrollToSelectedThingOnLoad: {
		dependsOn: 'selectThingOnLoad',
		type: 'boolean',
		value: false,
		description: 'Automatically scroll to the post/comment that is selected when the page loads',
	},
	selectOnClick: {
		type: 'boolean',
		value: true,
		description: 'Allows you to click on an item to select it',
		advanced: true,
	},
	addFocusBGColor: {
		type: 'boolean',
		value: true,
		description: 'Use a background color',
	},
	focusBGColor: {
		type: 'color',
		value: '#F0F3FC',
		description: 'The background color',
		advanced: true,
		dependsOn: 'addFocusBGColor',
	},
	focusBGColorNight: {
		type: 'color',
		value: '#373737',
		description: 'The background color while using Night Mode',
		advanced: true,
		dependsOn: 'addFocusBGColor',
	},
	focusFGColorNight: {
		type: 'color',
		value: '#DDDDDD',
		description: 'The text color while using Night Mode',
		advanced: true,
		dependsOn: 'addFocusBGColor',
	},
	addFocusBorder: {
		type: 'boolean',
		value: true,
		description: 'Use a border',
	},
	focusBorder: {
		type: 'text',
		value: '',
		description: 'Border appearance. E.g. <code>1px dashed gray</code> (CSS)',
		advanced: true,
		dependsOn: 'addFocusBorder',
	},
	focusBorderNight: {
		type: 'text',
		value: '',
		description: 'Border appearance using Night Mode (as above)',
		advanced: true,
		dependsOn: 'addFocusBorder',
	},
};

module.beforeLoad = () => {
	watchForElement('newComments', onNewComments);
};

module.go = () => {
	if (module.options.autoSelectOnScroll.value) {
		window.addEventListener('scroll', _.debounce(autoSelect, 300));
	}
	if (module.options.selectOnClick.value) {
		$(document.body).on('mouseup', Thing.bodyThingSelector, handleClick);
	}

	if (module.options.addFocusBGColor.value) {
		addFocusBGColor();
	}
	if (module.options.addFocusBorder.value) {
		addFocusBorder();
	}

	addListener((selected, unselected) => unselected && Hover.infocard('showParent').close(false), 'beforePaint');
	addListener(updateActiveElement, 'beforePaint');
	addListener(selected => BodyClasses.toggle(!!selected, 'res-entry-is-selected'), 'beforePaint');
	addListener(updateLastSelectedCache);
};

module.afterLoad = () => {
	// Do not re-select if user has already selected something
	if (!selectedThing) selectInitial();
};

const onClick = _.throttle(e => {
	_select(e.target, { scrollStyle: 'none' });
}, 100, { trailing: false });

export function handleClick(e: MouseEvent) {
	// Exposed so modules which stop propagation on click events inside things can explicitly pass the event to this module
	if (!module.options.selectOnClick.value) {
		return;
	}
	if (click.isProgrammaticEvent(e)) {
		// Use modules['select'].select(thing), don't rely on click handling
		return;
	}

	onClick(e);
}

let selectedThing, selectedContainer;

type SelectOptions = {
	scrollStyle: ScrollStyle,
	mediaBrowse?: boolean,
	mediaBrowseScrollStyle?: ScrollStyle,
};

export function select(thing: ?Thing | HTMLElement | JQuery, options?: SelectOptions) {
	if (!thing) return;
	_select(thing, options);
}

export const selectClosestVisible = _.debounce((options: SelectOptions) => {
	const target = selectedThing.getNext({ direction: 'down' }) || selectedThing.getNext({ direction: 'up' });
	if (target) _select(target, options);
});

export function unselect() {
	const prevSelected = selectedThing;
	_select(undefined);
	return prevSelected;
}

export { _selectedThing as selectedThing };
function _selectedThing() {
	return selectedThing;
}

const listeners = { beforeScroll: [], beforePaint: [], idle: [] };

export function addListener(callback: (new_: Thing, old: Thing, opt: SelectOptions & { direction?: 'down' | 'up' }) => mixed, when?: $Keys<typeof listeners> = 'idle'): void {
	listeners[when].push(callback);
}

const runCallbacks = (() => {
	function runListeners(listeners, new_, old, opt) {
		for (const listener of listeners) listener(new_, old, opt);
	}

	const runIdle = idleThrottle((new_, old, opt) => runListeners(listeners.idle, new_, old, opt));

	return (new_, old, opt) => {
		if (listeners.beforeScroll.length) runListeners(listeners.beforeScroll, new_, old, opt);
		if (listeners.beforePaint.length) requestAnimationFrame(() => runListeners(listeners.beforePaint, new_, old, opt));
		if (listeners.idle.length) runIdle(new_, old, opt);
	};
})();

function _select(thingOrEntry, options = { scrollStyle: 'none' }) {
	const newThing = Thing.from(thingOrEntry);
	if (!newThing || newThing.is(selectedThing)) return;

	const newSelected = newThing;
	const oldSelected = selectedThing;

	options = {
		...options,
		direction: newThing && newThing.isVisible() && oldSelected && oldSelected.isVisible() ?
			(newThing.entry.getBoundingClientRect().top > oldSelected.entry.getBoundingClientRect().top ? 'down' : 'up') :
			undefined,
	};

	runCallbacks(newSelected, oldSelected, options);

	scrollToElement(newThing.entry, options);

	selectedThing = newSelected;
	selectedContainer = newSelected && $(newSelected.thing).parent().closest('.thing');
}

let onNewCommentsCooldown;
function onNewComments(entry) {
	if (onNewCommentsCooldown) {
		// Recently selected something, ignore remainder of batch
		return;
	}
	if (selectedThing && !selectedThing.parentNode) {
		// Selected thing was replaced, so select the replacement
		const newContainer = $(entry).closest('.thing').parent().closest('.thing');
		if (newContainer.filter(selectedContainer).length) {
			_select(entry);
			// only select the first applicable thing in a batch
			onNewCommentsCooldown = setTimeout(() => (onNewCommentsCooldown = undefined), 100);
		}
	}
}

function updateActiveElement(selected, last) {
	if (selected) {
		selected.entry.classList.add('RES-keyNav-activeElement');
		// Add a class to thing to provide extra styling options.
		selected.thing.classList.add('RES-keyNav-activeThing');
	}
	if (last) {
		last.entry.classList.remove('RES-keyNav-activeElement');
		last.thing.classList.remove('RES-keyNav-activeThing');
	}
}

function autoSelect() {
	if (KeyboardNav.recentKeyMove) return;
	if (selectedThing && elementInViewport(selectedThing.element)) return;

	for (const thing of Thing.visibleThingElements()) {
		if (elementInViewport(thing)) {
			_select(thing);
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
	if (!lastSelectedCache || !isPageType('linklist', 'modqueue', 'profile')) return;

	const url = urlForSelectedCache();
	lastSelectedCache[url] = {
		fullname: selected.getFullname(),
		updated: Date.now(),
	};
	Session.set('RESmodules.selectedThing.lastSelectedCache', lastSelectedCache);
}

async function selectInitial() {
	if (!module.options.selectThingOnLoad.value) {
		return;
	}

	// NER may restore a page which contains the last selected thing
	if (NeverEndingReddit.loadPromise) await NeverEndingReddit.loadPromise;

	let target = await findLastSelectedThing();
	const rememberedTarget = !!target;

	if (!target) {
		const things = Thing.visibleThingElements();
		target = things.find(v => elementInViewport(v)) || things[0];
	}

	_select(target, {
		scrollStyle: rememberedTarget && module.options.scrollToSelectedThingOnLoad.value ? 'legacy' : 'none',
	});
}

async function findLastSelectedThing() {
	if (!module.options.selectLastThingOnLoad.value) {
		return false;
	}

	await setupLastSelectedCache();

	const url = urlForSelectedCache();
	const lastSelected = lastSelectedCache[url] && lastSelectedCache[url].fullname;
	if (lastSelected) {
		return Thing.visibleThings().find(v => v.getFullname() === lastSelected);
	}
}


// old style: .RES-keyNav-activeElement { '+borderType+': '+focusBorder+'; background-color: '+focusBGColor+'; } \
// this new pure CSS arrow will not work because to position it we must have .RES-keyNav-activeElement position relative, but that screws up image viewer's absolute positioning to
// overlay over the sidebar... yikes.
// .RES-keyNav-activeElement:after { content: ""; float: right; margin-right: -5px; border-color: transparent '+focusBorderColor+' transparent transparent; border-style: solid; border-width: 3px 4px 3px 0; } \

// why !important on .RES-keyNav-activeElement?  Because some subreddits are unfortunately using !important for no good reason on .entry divs...

function addFocusBGColor() {
	const focusBGColor = module.options.focusBGColor.value || module.options.focusBGColor.default;
	const focusBGColorNight = module.options.focusBGColorNight.value || module.options.focusBGColorNight.default;
	const focusFGColorNight = module.options.focusFGColorNight.value || module.options.focusFGColorNight.default;

	addCSS(`
		.RES-keyNav-activeElement,
		.RES-keyNav-activeElement .md-container {
			background-color: ${focusBGColor} !important;
		}

		.res-nightmode .RES-keyNav-activeElement > .tagline,
		.res-nightmode .RES-keyNav-activeElement .md-container > .md,
		.res-nightmode .RES-keyNav-activeElement .md-container > .md p {
			color: ${focusFGColorNight} !important;
		}

		.res-nightmode .RES-keyNav-activeElement,
		.res-nightmode .RES-keyNav-activeElement .md-container {
			background-color: ${focusBGColorNight} !important;
		}
	`);
}

function addFocusBorder() {
	const borderType = 'outline';

	const focusBorder = module.options.focusBorder.value ?
		`${borderType}: ${module.options.focusBorder.value};` :
		'';

	const focusBorderNight = module.options.focusBorderNight.value ?
		`${borderType}: ${module.options.focusBorderNight.value};` :
		'';

	addCSS(`
		.RES-keyNav-activeElement { ${focusBorder} }
		.res-nightmode .RES-keyNav-activeElement { ${focusBorderNight} }
	`);
}
