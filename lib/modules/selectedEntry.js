/* @flow */

import $ from 'jquery';
import { throttle } from 'lodash-es';
import { Module } from '../core/module';
import {
	Thing,
	SelectedThing,
	addCSS,
	click,
} from '../utils';

export const module: Module<*> = new Module('selectedEntry');

module.moduleName = 'selectedEntryName';
module.category = 'browsingCategory';
module.include = ['comments', 'linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox', 'search'];
module.description = 'selectedEntryDesc';

module.options = {
	autoSelectOnScroll: {
		title: 'selectedEntryAutoSelectOnScrollTitle',
		type: 'boolean',
		value: false,
		description: 'selectedEntryAutoSelectOnScrollDesc',
	},
	scrollToSelectedThingOnLoad: {
		title: 'selectedEntryScrollToSelectedThingOnLoadTitle',
		type: 'boolean',
		value: false,
		advanced: true,
		description: 'selectedEntryScrollToSelectedThingOnLoadDesc',
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
	if (module.options.addLine.value) styleLine();
	if (module.options.setColors.value) styleColor();
	styleOutline();

	SelectedThing.setScrollToSelectedThingOnLoad(module.options.scrollToSelectedThingOnLoad.value);
};

module.contentStart = () => {
	// Select Thing on manual click
	// In comment threads `thingSelector` may match parents of `e.currentTarget`; throttle in order to invoke `select` only on the bottom Thing
	$(document.body).on('mouseup', Thing.thingSelector, throttle((e: MouseEvent) => {
		if (click.isProgrammaticEvent(e)) return;
		const thing = Thing.from(e.currentTarget);
		if (thing) SelectedThing.set(thing);
	}, 50, { leading: true, trailing: false }));

	if (module.options.autoSelectOnScroll.value) {
		window.addEventListener('scroll', () => { SelectedThing.selectClosestInView(); });
	}
};

module.afterLoad = () => {
	if (!SelectedThing.current || !SelectedThing.current.isVisible()) SelectedThing.selectClosestInView();
};

// why !important on .entry.res-selected?  Because some subreddits are unfortunately using !important for no good reason on .entry divs...

function styleLine() {
	addCSS(`
		.entry.res-selected { box-shadow: 3px 0 0 -1px #c2d2e0 !important; }
		.res-nightmode .entry.res-selected { box-shadow: 3px 0 0 -1px grey !important; }
	`);
}

function styleColor() {
	// Add legacy classes for external stylesheets which override these styles
	SelectedThing.addListener((current, previous) => {
		if (previous) {
			previous.entry.classList.remove('RES-keyNav-activeElement');
			previous.element.classList.remove('RES-keyNav-activeThing');
		}
		if (current) {
			current.entry.classList.add('RES-keyNav-activeElement');
			current.element.classList.add('RES-keyNav-activeThing');
		}
	}, 'instantly');

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
	}
}
