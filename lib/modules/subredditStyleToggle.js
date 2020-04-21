/* @flow */

import { Module } from '../core/module';
import { PageAction, Storage, i18n } from '../environment';
import {
	BodyClasses,
	PagePhases,
	asyncSome,
	currentSubreddit,
	mutex,
	string,
	waitForChild,
} from '../utils';
import * as CustomToggles from './customToggles';
import * as NightMode from './nightMode';
import _ from 'lodash';
import $ from 'jquery';

export const module: Module<*> = new Module('subredditStyleToggle');

module.moduleName = 'subredditStyleToggleName';
module.category = 'appearanceCategory';
module.description = 'subredditStyleToggleDesc';
module.alwaysEnabled = true; // Not implemented to be disabled
module.options = {
	browserToolbarButton: {
		title: 'subredditStyleToggleBrowserToolbarButtonTitle',
		type: 'boolean',
		value: true,
		description: 'subredditStyleToggleBrowserToolbarButtonDesc',
		keywords: ['css'],
		// can't be disabled in Chrome since Chrome 49
		noconfig: process.env.BUILD_TARGET === 'chrome',
	},
	checkbox: {
		title: 'subredditStyleToggleCheckboxTitle',
		type: 'boolean',
		value: true,
		description: 'subredditStyleToggleCheckboxDesc',
		keywords: ['css'],
	},
};

const ignoredStorage = Storage.wrap('RESmodules.subredditStyleToggle.ignored', ([]: string[]));
let toggle: CustomToggles.Toggle;
export let refresh: ?() => *;

module.onInit = () => {
	// Hide the toolbar button while it is not active
	PageAction.hide();

	const ready = Promise.all([
		shouldDisable(),
		hasToggleableElements(),
	]).then(([disable, has]) => {
		if (has) {
			BodyClasses.add('res-srstyle-enabled');
			createToggle(!disable);
		}
	});

	refresh = (nightmodeCompatible?: boolean) => ready.then(async () => {
		if (toggle) toggle.toggle('auto', !await shouldDisable(nightmodeCompatible));
	});
};

function createToggle(initialState) {
	const subreddit = (currentSubreddit() || '').toLowerCase();
	if (toggle || !subreddit) return;

	toggle = new CustomToggles.Toggle(`${module.moduleID}.${subreddit}`, 'Custom subreddit style', true);

	toggle.onToggle(async type => {
		if (type !== 'manual') return;

		// wait for nightmode to react to subreddit style toggle so `isNightmodeCompatible` check below is accurate
		await NightMode.toggledSubredditStyle(toggle.enabled);

		const ignoredSubreddits = new Set(await ignoredStorage.get());
		if (toggle.enabled) {
			ignoredSubreddits.delete(subreddit);
		} else if (await NightMode.isNightmodeCompatible()) {
			// disabled and compatible with nightmode, or in a different subreddit, so add it to our ignore list
			// DO NOT add to our ignore list otherwise (current subreddit and incompatible with nightmode),
			// because in that case it will be disabled due to nightmode incompatibility
			ignoredSubreddits.add(subreddit);
		}

		ignoredStorage.set(Array.from(ignoredSubreddits));
	});

	toggle.onStateChange(() => {
		toggleElements(toggle.enabled);
		BodyClasses.toggle(toggle.enabled, 'res-srstyle-enabled');
		BodyClasses.toggle(!toggle.enabled, 'res-srstyle-disabled');
	});

	toggle.toggle('auto', initialState);

	makeInteractable();
}

function makeInteractable() {
	if (module.options.checkbox.value) {
		PagePhases.sitetableStarted.then(() => {
			const place = document.body.querySelector('.titlebox h1.redditname');
			if (place) insertCheckbox(place);
		});
	}

	if (module.options.browserToolbarButton.value) {
		PageAction.show(toggle.enabled);
		toggle.onStateChange(() => { PageAction.show(toggle.enabled); });
		PageAction.onClick(() => { toggle.toggle('manual'); });
	}

	toggle.addCLI('srstyle');

	if ($('#show_stylesheets').length) {
		$('label[for=show_stylesheets]').after(string.escape` <span class="little gray">(${i18n('subredditStyleToggleRedditPrefsMessage')} <a href="/r/Enhancement/wiki/srstyle">${i18n('subredditStyleToggleClickToLearnMore')}</a>)</span>`);
	}
}

function insertCheckbox(place) {
	const container = string.html`
		<form class="toggle res-sr-style-toggle">
			<label for="res-style-checkbox">${i18n('subredditStyleToggleUse')}</label>
		</form>
	`;

	const checkbox = toggle.buildCheckbox();
	checkbox.setAttribute('id', 'res-style-checkbox');
	checkbox.setAttribute('name', 'res-style-checkbox');
	container.prepend(checkbox);
	place.after(container);
}

const shouldDisable = (nightmodeCompatible: boolean | Promise<boolean> = NightMode.isNightmodeCompatible(true)) => asyncSome([
	// subreddit style ignored by this module
	async () => (await ignoredStorage.get()).includes((currentSubreddit() || '').toLowerCase()),
	// subreddit style incompatible with nightmode
	async () => !(await nightmodeCompatible),
], f => f());

const hasToggleableElements = () => asyncSome([
	getStylesheet,
	async () => !!(await getHeaderImg()).headerImg,
], f => f());

const getStylesheet = _.once(async () => {
	const query = () => (document.head || document.documentElement).querySelector('link[title=applied_subreddit_stylesheet]');

	return (
		// parsing has started
		// the stylesheet element may or may not be in the DOM
		query() ||
		// <body> parsing has started (i.e. the entire <head> is parsed)
		// if there is a stylesheet, the element will be in the DOM
		await PagePhases.bodyStart.then(query) ||
		// subreddit styles disabled natively; no stylesheet element
		null
	);
});

const getHeaderImg = _.once(async () => {
	// subreddits with a custom header image will have:
	// `<a id="header-img-a"><img id="header-img"/></a>`
	// subreddits with the default will just have:
	// `<a id="header-img" class="default-header"></a>`
	const query = () => document.getElementById('header-img-a');
	const imgQuery = () => document.getElementById('header-img');

	const imgWrapper = (
		await PagePhases.bodyStart.then(query) ||
		await waitForChild(document.body, '#header').then(query) ||
		await PagePhases.contentLoaded.then(query)
	);

	return { imgWrapper, headerImg: imgWrapper && imgQuery() };
});

const toggleElements = (() => {
	const toggleStylesheet = mutex(async shouldRestore => {
		const subredditStylesheet = await getStylesheet();

		if (!subredditStylesheet) return;

		if (shouldRestore) {
			// only add element if not mounted
			if (!subredditStylesheet.parentNode) {
				document.head.appendChild(subredditStylesheet);
			}
		} else {
			if (subredditStylesheet.parentNode) {
				subredditStylesheet.remove();
			}
		}
	});

	const toggleHeaderImg = mutex(async shouldRestore => {
		const { imgWrapper, headerImg } = await getHeaderImg();

		if (!imgWrapper || !headerImg) return;

		if (shouldRestore) {
			if (!headerImg.parentNode) {
				imgWrapper.id = 'header-img-a';
				imgWrapper.classList.remove('default-header');
				imgWrapper.appendChild(headerImg);
			}
		} else {
			if (headerImg.parentNode) {
				headerImg.remove();
				imgWrapper.id = 'header-img';
				imgWrapper.classList.add('default-header');
			}
		}
	});

	return shouldRestore => Promise.all([
		toggleStylesheet(shouldRestore),
		toggleHeaderImg(shouldRestore),
	]);
})();
