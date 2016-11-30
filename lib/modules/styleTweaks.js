/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Init from '../core/init';
import { PageAction, Storage } from '../environment';
import {
	BodyClasses,
	addCSS,
	asyncSome,
	currentSubreddit,
	isCurrentSubreddit,
	mutex,
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
		type: 'boolean',
		value: true,
		description: 'Moves the username navbar to the top (great on netbooks!)',
		bodyClass: 'res-navTop',
	},
	disableAnimations: {
		type: 'boolean',
		value: false,
		description: 'Discourage CSS3 animations. (This will apply to all of reddit, every subreddit, and RES functionality. However, subreddits might still have some animations.)',
		bodyClass: true,
	},
	visitedStyle: {
		type: 'boolean',
		value: false,
		description: 'Change the color of links you\'ve visited to purple. (By default Reddit only does this for submission titles.)',
		bodyClass: true,
	},
	showExpandos: {
		type: 'boolean',
		value: true,
		description: 'Bring back video and text expando buttons for users with compressed link display',
		advanced: true,
		bodyClass: true,
	},
	hideUnvotable: {
		type: 'boolean',
		value: false,
		description: 'Hide vote arrows on threads where you cannot vote (e.g. archived due to age)',
		bodyClass: true,
	},
	showFullLinkFlair: {
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
		description: 'Choose when full link flair should be shown',
		bodyClass: true,
	},
	highlightEditedTime: {
		type: 'boolean',
		value: false,
		description: 'Make edited timestamps bold (e.g. "last edited 50 minutes ago")',
		bodyClass: true,
	},
	colorBlindFriendly: {
		type: 'boolean',
		value: false,
		description: 'Use colorblind friendly styles when possible',
		advanced: true,
		bodyClass: 'res-colorblind',
	},
	subredditStyleBrowserToolbarButton: {
		type: 'boolean',
		value: true,
		description: 'Add a toolbar/omnibar icon to disable/enable current subreddit style - note this may be behind a hamburger menu in some browsers.',
		// can't be disabled in Chrome since Chrome 49, doesn't exist in Safari
		noconfig: process.env.BUILD_TARGET === 'chrome' || process.env.BUILD_TARGET === 'safari',
	},
	scrollSubredditDropdown: {
		type: 'boolean',
		value: true,
		description: 'Scroll the standard subreddit dropdown (useful for pinned header and disabled Subreddit Manager)',
		advanced: true,
		bodyClass: true,
	},
	highlightTopLevel: {
		type: 'boolean',
		value: false,
		description: 'Draws a line to separate top-level comments for easier distinction.',
	},
	highlightTopLevelColor: {
		type: 'color',
		dependsOn: 'highlightTopLevel',
		description: 'Specify the color to separate top-level comments',
		value: '#8B0000',
	},
	highlightTopLevelSize: {
		type: 'text',
		dependsOn: 'highlightTopLevel',
		description: 'Specify how thick (in pixels) of a bar is used to separate top-level comments',
		value: '2',
	},
	floatingSideBar: {
		type: 'boolean',
		value: false,
		description: 'Makes the left sidebar (with multireddits) float as you scroll down so you can always see it.',
		advanced: true,
		bodyClass: true,
	},
	postTitleCapitalization: {
		description: 'Force a particular style of capitalization on post titles',
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
		$('label[for=show_stylesheets]').after(' <span class="little gray">(RES allows you to disable specific subreddit styles!  <a href="/r/Enhancement/wiki/srstyle">Click here to learn more</a>)</span>');
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
	CommandLine.registerCommand('srstyle', 'srstyle [subreddit] [on|off] - toggle subreddit style on/off (if no subreddit is specified, uses current subreddit)',
		(command, val) => {
			const options = getSrstyleOptions(val);
			let str = 'toggle subreddit style';
			if (options.toggleText) {
				str += ` ${options.toggleText}`;

				if (options.sr) {
					str += ` for: ${options.sr}`;
				}
			}

			return str;
		},
		(command, val) => {
			// toggle subreddit style
			const { sr, toggleText } = getSrstyleOptions(val);

			if (!sr) {
				return 'No subreddit specified.';
			}

			let toggle;
			if (toggleText === 'on') {
				toggle = true;
			} else if (toggleText === 'off') {
				toggle = false;
			} else {
				return 'You must specify "on" or "off".';
			}
			const action = toggle ? 'enabled' : 'disabled';
			toggleSubredditStyle(toggle, sr);
			Notifications.showNotification({
				header: 'Subreddit Style',
				moduleID: 'styleTweaks',
				message: `Subreddit style ${action} for subreddit: ${sr}`,
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
	styleToggleLabel.textContent = 'Use subreddit style ';
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

async function toggleSubredditStyle(toggle, subreddit = currentSubreddit()) {
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
