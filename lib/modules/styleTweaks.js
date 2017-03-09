/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Init from '../core/init';
import { PageAction, Storage, i18n } from '../environment';
import {
	BodyClasses,
	addCSS,
	asyncSome,
	currentSubreddit,
	isCurrentSubreddit,
	mutex,
	string,
} from '../utils';
import * as CommandLine from './commandLine';
import * as NightMode from './nightMode';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('styleTweaks');

module.moduleName = 'styleTweaksName';
module.category = 'appearanceCategory';
module.description = 'Provides a number of style tweaks to the Reddit interface. Also allow you to disable specific subreddit style (the <a href="/prefs/#show_stylesheets">global setting</a> must be on).';
module.options = {
	navTop: {
		title: 'styleTweaksNavTopTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksNavTopDesc',
		bodyClass: 'res-navTop',
	},
	disableAnimations: {
		title: 'styleTweaksDisableAnimationsTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksDisableAnimationsDesc',
		bodyClass: true,
	},
	visitedStyle: {
		title: 'styleTweaksVisitedStyleTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksVisitedStyleDesc',
		bodyClass: true,
	},
	showExpandos: {
		title: 'styleTweaksShowExpandosTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksShowExpandosDesc',
		advanced: true,
		bodyClass: true,
	},
	hideUnvotable: {
		title: 'styleTweaksHideUnvotableTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksHideUnvotableDesc',
		bodyClass: true,
	},
	showFullLinkFlair: {
		title: 'styleTweaksShowFullLinkFlairTitle',
		type: 'enum',
		values: [{
			name: 'Never',
			value: 'never',
		}, {
			name: 'On hover',
			value: 'hover',
		}, {
			name: 'Always',
			value: 'always',
		}],
		value: 'never',
		description: 'styleTweaksShowFullLinkFlairDesc',
		bodyClass: true,
	},
	highlightEditedTime: {
		title: 'styleTweaksHighlightEditedTimeTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksHighlightEditedTimeDesc',
		bodyClass: true,
	},
	colorBlindFriendly: {
		title: 'styleTweaksColorBlindFriendlyTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksColorBlindFriendlyDesc',
		advanced: true,
		bodyClass: 'res-colorblind',
	},
	subredditStyleBrowserToolbarButton: {
		title: 'styleTweaksSubredditStyleBrowserToolbarButtonTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksSubredditStyleBrowserToolbarButtonDesc',
		// can't be disabled in Chrome since Chrome 49
		noconfig: process.env.BUILD_TARGET === 'chrome',
	},
	scrollSubredditDropdown: {
		title: 'styleTweaksScrollSubredditDropdownTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksScrollSubredditDropdownDesc',
		advanced: true,
		bodyClass: true,
	},
	highlightTopLevel: {
		title: 'styleTweaksHighlightTopLevelTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksHighlightTopLevelDesc',
	},
	highlightTopLevelColor: {
		title: 'styleTweaksHighlightTopLevelColorTitle',
		type: 'color',
		dependsOn: options => options.highlightTopLevel.value,
		description: 'styleTweaksHighlightTopLevelColorDesc',
		value: '#8B0000',
	},
	highlightTopLevelSize: {
		title: 'styleTweaksHighlightTopLevelSizeTitle',
		type: 'text',
		dependsOn: options => options.highlightTopLevel.value,
		description: 'styleTweaksHighlightTopLevelSizeDesc',
		value: '2',
	},
	floatingSideBar: {
		title: 'styleTweaksFloatingSideBarTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksFloatingSideBarDesc',
		advanced: true,
		bodyClass: true,
	},
	postTitleCapitalization: {
		title: 'styleTweaksPostTitleCapitalizationTitle',
		description: 'styleTweaksPostTitleCapitalizationDesc',
		type: 'enum',
		value: 'none',
		values: [{
			name: 'do nothing',
			value: 'none',
		}, {
			name: 'Title Case',
			value: 'title',
		}, {
			name: 'Sentence case',
			value: 'sentence',
		}, {
			name: 'lowercase',
			value: 'lowercase',
		}],
		bodyClass: true,
	},
};

const ignoredSubredditStyleStorage = Storage.wrap('RESmodules.styleTweaks.ignoredSubredditStyles', ([]: string[]));

module.loadDynamicOptions = () => {
	toggleSubredditStyleIfNecessary();
};

module.beforeLoad = () => {
	if (module.options.highlightTopLevel.value) {
		const highlightTopLevelColor = module.options.highlightTopLevelColor.value || module.options.highlightTopLevelColor.default;
		const highlightTopLevelSize = parseInt(module.options.highlightTopLevelSize.value || module.options.highlightTopLevelSize.default, 10);
		addCSS(`
			.nestedlisting > .comment + .clearleft {
				height: ${highlightTopLevelSize}px !important;
				margin-bottom: 5px;
				background: ${highlightTopLevelColor} !important;
			}
		`);
	}
};

module.go = () => {
	updatePageAction();

	PageAction.onRefresh(updatePageAction);
	PageAction.onClick(() => {
		const toggle = !makeStyleToggleCheckbox().checked;
		toggleSubredditStyle(toggle);
	});

	if ($('#show_stylesheets').length) {
		$('label[for=show_stylesheets]').after(string.escapeHTML` <span class="little gray">(${i18n('styleTweaksRedditPrefsMessage')} <a href="/r/Enhancement/wiki/srstyle">${i18n('styleTweaksClickToLearnMore')}</a>)</span>`);
	}

	registerCommandLine();
};

export function updatePageAction() {
	if (!module.options.subredditStyleBrowserToolbarButton.value) {
		PageAction.destroy();
	} else if (!currentSubreddit()) {
		PageAction.hide();
	} else {
		PageAction.show(makeStyleToggleCheckbox().checked);
	}
}

function registerCommandLine() {
	CommandLine.registerCommand('srstyle', `srstyle [subreddit] [on|off] - ${i18n('styleTweaksCommandLineDescription')}`,
		(command, val) => {
			const options = getSrstyleOptions(val);
			if (options.toggleText) {
				return i18n(
					options.sr ? 'styleTweaksToggleSubredditStyleOnOffFor' : 'styleTweaksToggleSubredditStyleOnOff',
					options.toggleText === 'on' ? i18n('toggleOn') : i18n('toggleOff'),
					options.sr || ''
				);
			} else {
				return i18n('styleTweaksToggleSubredditStyle');
			}
		},
		(command, val) => {
			// toggle subreddit style
			const { sr, toggleText } = getSrstyleOptions(val);

			if (!sr) {
				return i18n('styleTweaksNoSubredditSpecified');
			}

			let toggle;
			if (toggleText === 'on') {
				toggle = true;
			} else if (toggleText === 'off') {
				toggle = false;
			} else {
				return i18n('styleTweaksYouMustSpecifyXOrY', 'on', 'off');
			}

			toggleSubredditStyle(toggle, sr);
			Notifications.showNotification({
				header: i18n('styleTweaksSubredditStyle'),
				moduleID: 'styleTweaks',
				message: i18n(toggle ? 'styleTweaksSubredditStyleEnabled' : 'styleTweaksSubredditStyleDisabled', sr),
			}, 4000);
		}
	);

	function getSrstyleOptions(val) {
		const splitWords = val.split(' ');
		let sr, toggleText;
		if (splitWords.length === 2) {
			sr = splitWords[0];
			toggleText = splitWords[1];
		} else {
			sr = currentSubreddit();
			toggleText = splitWords[0];
		}

		if (toggleText !== 'on' && toggleText !== 'off') {
			toggleText = false;
		}

		return {
			sr,
			toggleText,
		};
	}
}

const makeStyleToggleCheckbox = _.once(() => {
	const styleToggleContainer = $('<form>', { class: 'toggle res-sr-style-toggle' }).get(0);

	const styleToggleCheckbox = document.createElement('input');
	styleToggleCheckbox.setAttribute('type', 'checkbox');
	styleToggleCheckbox.setAttribute('id', 'res-style-checkbox');
	styleToggleCheckbox.setAttribute('name', 'res-style-checkbox');
	styleToggleCheckbox.checked = true;
	styleToggleCheckbox.addEventListener('change', function() {
		toggleSubredditStyle(this.checked);
	});
	styleToggleContainer.appendChild(styleToggleCheckbox);

	const styleToggleLabel = document.createElement('label');
	styleToggleLabel.setAttribute('for', 'res-style-checkbox');
	styleToggleLabel.textContent = i18n('styleTweaksUseSubredditStyle');
	styleToggleContainer.appendChild(styleToggleLabel);

	Init.bodyReady.then(() => $('.titlebox h1').first().after(styleToggleContainer));

	return styleToggleCheckbox;
});

export async function toggleSubredditStyleIfNecessary() {
	const subreddit = currentSubreddit();
	if (!subreddit) {
		return;
	}

	const toggleOff = await asyncSome([
		// subreddit style ignored by this module
		async () => (await ignoredSubredditStyleStorage.get()).includes(subreddit.toLowerCase()),
		// subreddit style incompatible with nightmode
		async () => !(await NightMode.isNightmodeCompatible()),
	], f => f());

	toggleSubredditStyle(!toggleOff);
}

export async function getSubredditStyleToggle() {
	const subreddit = currentSubreddit();
	if (!subreddit) {
		return;
	}
	return (await ignoredSubredditStyleStorage.get()).includes(subreddit.toLowerCase());
}

export async function toggleSubredditStyle(toggle: boolean, subreddit: string | void = currentSubreddit()) {
	subreddit = (subreddit || '').toLowerCase();

	if (isCurrentSubreddit(subreddit)) {
		// toggled for the current subreddit, add/remove the stylesheet
		toggleElements(toggle);

		// in case it was set by the pageAction, be sure to (un)check the checkbox.
		makeStyleToggleCheckbox().checked = toggle;

		PageAction.show(toggle);

		BodyClasses.toggle(toggle, 'res-srstyle-enabled');
		BodyClasses.toggle(!toggle, 'res-srstyle-disabled');

		// wait for nightmode to react to subreddit style toggle
		// so `isNightmodeCompatible` check below is accurate
		await NightMode.toggledSubredditStyle(toggle);
	}

	const ignoredSubreddits = await ignoredSubredditStyleStorage.get();

	if (toggle) {
		// enabled subreddit style, remove from ignore list
		_.pull(ignoredSubreddits, subreddit);
	} else {
		if (!isCurrentSubreddit(subreddit) || await NightMode.isNightmodeCompatible()) {
			// disabled and compatible with nightmode, or in a different subreddit, so add it to our ignore list
			// DO NOT add to our ignore list otherwise (current subreddit and incompatible with nightmode),
			// because in that case it will be disabled due to nightmode incompatibility
			if (!ignoredSubreddits.includes(subreddit)) {
				ignoredSubreddits.push(subreddit);
			}
		}
	}

	ignoredSubredditStyleStorage.set(ignoredSubreddits);
}

const toggleElements = (() => {
	const getStylesheet = _.once(async () => {
		const query = () => (
			document.head.querySelector('link[title=applied_subreddit_stylesheet]') ||
			document.head.querySelector('style[title=applied_subreddit_stylesheet]') ||
			document.head.querySelector('style[data-apng-original-href]') // apng extension fix (see #1076)
		);

		return (
			// <head> parsing has started
			// the stylesheet element may or may not be in the DOM (depending on how long ago `Init.headReady` resolved)
			await Init.headReady.then(query) ||
			// <body> parsing has started (i.e. the entire <head> is parsed)
			// if there is a stylesheet, the element will be in the DOM
			await Init.bodyStart.then(query) ||
			// subreddit styles disabled natively; no stylesheet element
			null
		);
	});

	const toggleStylesheet = mutex(async shouldRestore => {
		const stylesheet = await getStylesheet();

		if (!stylesheet) return;

		if (shouldRestore) {
			// only add element if not mounted
			if (!stylesheet.parentNode) {
				document.head.appendChild(stylesheet);
			}
		} else {
			if (stylesheet.parentNode) {
				stylesheet.remove();
			}
		}
	});

	const getHeaderImg = _.once(async () => {
		// subreddits with a custom header image will have:
		// `<a id="header-img-a"><img id="header-img"/></a>`
		// subreddits with the default will just have:
		// `<a id="header-img" class="default-header"></a>`
		const query = () => document.getElementById('header-img-a');
		const imgQuery = () => document.getElementById('header-img');

		const imgWrapper = (
			await Init.bodyStart.then(query) ||
			await Init.bodyReady.then(query)
		);

		return { imgWrapper, headerImg: imgWrapper && imgQuery() };
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
