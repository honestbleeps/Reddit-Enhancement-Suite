import _ from 'lodash';
import { $ } from '../vendor';
import * as Init from '../core/init';
import { PageAction, Storage } from '../environment';
import {
	BodyClasses,
	addCSS,
	currentSubreddit,
	elementInViewport,
	isCurrentSubreddit,
	isPageType,
} from '../utils';
import * as CommandLine from './commandLine';
import * as NightMode from './nightMode';
import * as Notifications from './notifications';

export const module = {};

module.moduleID = 'styleTweaks';
module.moduleName = 'Style Tweaks';
module.category = ['Appearance', 'Comments'];
module.description = 'Provides a number of style tweaks to the Reddit interface. Also allow you to disable specific subreddit style (the <a href="/prefs/#show_stylesheets">global setting</a> must be on).';
module.options = {
	navTop: {
		type: 'boolean',
		value: true,
		description: 'Moves the username navbar to the top (great on netbooks!)',
		bodyClass: 'res-navTop',
	},
	commentBoxes: {
		type: 'boolean',
		value: true,
		description: 'Highlights comment boxes for easier reading / placefinding in large threads.',
		bodyClass: 'res-commentBoxes',
	},
	/* REMOVED for performance reasons...
	commentBoxShadows: {
		type: 'boolean',
		value: false,
		description: 'Drop shadows on comment boxes (turn off for faster performance)'
	},
	*/
	commentRounded: {
		type: 'boolean',
		value: true,
		description: 'Round corners of comment boxes',
		advanced: true,
		dependsOn: 'commentBoxes',
		bodyClass: 'res-commentBoxes-rounded',
	},
	commentHoverBorder: {
		type: 'boolean',
		value: false,
		description: 'Highlight comment box hierarchy on hover (turn off for faster performance)',
		advanced: true,
		dependsOn: 'commentBoxes',
		bodyClass: 'res-commentHoverBorder',
	},
	commentIndent: {
		type: 'text',
		value: 10,
		description: 'Indent comments by [x] pixels (only enter the number, no \'px\')',
		advanced: true,
		dependsOn: 'commentBoxes',
	},
	continuity: {
		type: 'boolean',
		value: false,
		description: 'Show comment continuity lines',
		advanced: true,
		dependsOn: 'commentBoxes',
		bodyClass: 'res-continuity',
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
		description: 'Add an icon in the omnibar (where the page address is written) to disable/enable current subreddit style.',
		noconfig: process.env.BUILD_TARGET !== 'firefox', // can't be disabled in Chrome since Chrome 49
	},
	scrollSubredditDropdown: {
		type: 'boolean',
		value: true,
		description: 'Scroll the standard subreddit dropdown (useful for pinned header and disabled Subreddit Manager)',
		advanced: true,
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
		value: 2,
	},
	floatingSideBar: {
		type: 'boolean',
		value: false,
		description: 'Makes the left sidebar (with multireddits) float as you scroll down so you can always see it.',
		advanced: true,
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

module.loadDynamicOptions = function() {
	Init.headReady.then(() => toggleSubredditStyleIfNecessary());
};

module.beforeLoad = function() {
	if (this.options.commentBoxes.value && this.options.commentIndent.value && isPageType('comments')) {
		// this should override the default of 10px in commentboxes.css because it's added later.
		addCSS(`
			.res-commentBoxes .comment {
				margin-left: ${this.options.commentIndent.value}px !important;
			}
		`);
	}

	if (this.options.highlightTopLevel.value) {
		const highlightTopLevelColor = this.options.highlightTopLevelColor.value || this.options.highlightTopLevelColor.default;
		const highlightTopLevelSize = parseInt(this.options.highlightTopLevelSize.value || this.options.highlightTopLevelSize.default, 10);
		addCSS(`
			.nestedlisting > .comment + .clearleft {
				height: ${highlightTopLevelSize}px !important;
				margin-bottom: 5px;
				background: ${highlightTopLevelColor} !important;
			}
		`);
	}
};

module.go = function() {
	if (this.options.scrollSubredditDropdown.value) {
		const calcedHeight = Math.floor(window.innerHeight * 0.95);
		if ($('.drop-choices.srdrop').height() > calcedHeight) {
			addCSS(`
				.drop-choices.srdrop {
					overflow-y: scroll;
					max-height: ${calcedHeight} px;
				}
			`);
		}
	}
	if (this.options.floatingSideBar.value) {
		floatSideBar();
	}

	updatePageAction();

	PageAction.addRefreshListener(updatePageAction);
	PageAction.addClickListener(() => {
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
			const options = getSrstyleOptions(val);

			if (!options.sr) {
				return 'No subreddit specified.';
			}

			let toggle;
			if (options.toggleText === 'on') {
				toggle = true;
			} else if (options.toggleText === 'off') {
				toggle = false;
			} else {
				return 'You must specify "on" or "off".';
			}
			const action = toggle ? 'enabled' : 'disabled';
			toggleSubredditStyle(toggle, options.sr);
			Notifications.showNotification({
				header: 'Subreddit Style',
				moduleID: 'styleTweaks',
				message: `Subreddit style ${action} for subreddit: ${options.sr}`,
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

function floatSideBar() {
	const sideBarElement = document.querySelector('.listing-chooser');
	if (sideBarElement) {
		window.addEventListener('scroll', _.debounce(() => handleScroll(sideBarElement), 300), false);
	}
}

function handleScroll(sideBarElement) {
	if (elementInViewport(sideBarElement)) {
		sideBarElement.setAttribute('style', '');
	} else {
		sideBarElement.setAttribute('style', 'position: fixed; top: 0; z-index: 100; height: 100%; overflow-y: auto;');
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
	if (!currentSubreddit()) {
		return;
	}

	const toggleOff = (
		// subreddit style ignored by this module
		(await Storage.get('RESmodules.styleTweaks.ignoredSubredditStyles') || []).includes(currentSubreddit().toLowerCase()) ||
		// subreddit style incompatible with nightmode
		!(await NightMode.isNightmodeCompatible())
	);

	toggleSubredditStyle(!toggleOff);
}

async function toggleSubredditStyle(toggle, subreddit = currentSubreddit()) {
	subreddit = (subreddit || '').toLowerCase();

	if (isCurrentSubreddit(subreddit)) {
		// toggled for the current subreddit, add/remove the stylesheet
		if (toggle) {
			// only add element if not mounted
			if (!existingStylesheet().parentNode) {
				document.head.appendChild(existingStylesheet());
			}
		} else {
			existingStylesheet().remove();
		}

		// in case it was set by the pageAction, be sure to (un)check the checkbox.
		makeStyleToggleCheckbox().checked = toggle;

		PageAction.show(toggle);

		BodyClasses.toggle(toggle, 'res-srstyle-enabled');

		// wait for nightmode to react to subreddit style toggle
		// so `isNightmodeCompatible` check below is accurate
		await NightMode.toggledSubredditStyle(toggle);
	}

	const ignoredSubreddits = await Storage.get('RESmodules.styleTweaks.ignoredSubredditStyles') || [];

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

	Storage.set('RESmodules.styleTweaks.ignoredSubredditStyles', ignoredSubreddits);
}

const existingStylesheet = _.once(() => (
	document.head.querySelector('link[title=applied_subreddit_stylesheet]') ||
	document.head.querySelector('style[title=applied_subreddit_stylesheet]') ||
	document.head.querySelector('style[data-apng-original-href]') || // apng extension fix (see #1076)
	$('<link>', {
		title: 'applied_subreddit_stylesheet',
		rel: 'stylesheet',
		href: `/r/${currentSubreddit()}/stylesheet.css`,
	}).get(0)
));
