import _ from 'lodash';
import { $ } from '../vendor';
import { PageAction, Storage } from '../environment';
import {
	addCSS,
	currentSubreddit,
	elementInViewport,
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

let curSubReddit, styleToggleCheckbox;

module.beforeLoad = async function() {
	if (this.options.commentBoxes.value && this.options.commentIndent.value && isPageType('comments')) {
		// this should override the default of 10px in commentboxes.css because it's added later.
		addCSS(`
			.res-commentBoxes .comment {
				margin-left: ${this.options.commentIndent.value}px !important;
			}
		`);
	}
	if (currentSubreddit()) {
		curSubReddit = currentSubreddit().toLowerCase();
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

	await loadIgnoredSubreddits();
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
	subredditStyles();
	updatePageAction();

	PageAction.addRefreshListener(updatePageAction);
	PageAction.addClickListener(() => {
		const toggle = !isSubredditStyleEnabled();
		toggleSubredditStyle(toggle, currentSubreddit());
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
		PageAction.show(styleToggleCheckbox && styleToggleCheckbox.checked);
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

let ignoredSubReddits = [];

async function loadIgnoredSubreddits() {
	ignoredSubReddits = await Storage.get('RESmodules.styleTweaks.ignoredSubredditStyles') || [];
}

function subredditStyles() {
	if (!currentSubreddit()) {
		return;
	}

	const subredditTitle = document.querySelector('.titlebox h1');
	const styleToggleContainer = $('<form>', { class: 'toggle res-sr-style-toggle' }).get(0);
	const styleToggleLabel = document.createElement('label');
	styleToggleCheckbox = document.createElement('input');
	styleToggleCheckbox.setAttribute('type', 'checkbox');
	styleToggleCheckbox.setAttribute('id', 'res-style-checkbox');
	styleToggleCheckbox.setAttribute('name', 'res-style-checkbox');

	// are we blacklisting, or whitelisting subreddits?  If we're in night mode on a sub that's
	// incompatible with it, we want to check the whitelist. Otherwise, check the blacklist.

	if (curSubReddit && subredditTitle) {
		if (NightMode.isNightModeOn() && !NightMode.isNightmodeCompatible) {
			const subredditStylesWhitelist = NightMode.module.options.subredditStylesWhitelist.value.split(',');

			if (subredditStylesWhitelist.includes(curSubReddit)) {
				styleToggleCheckbox.checked = true;
			}
		} else {
			if (!ignoredSubReddits.includes(curSubReddit)) {
				styleToggleCheckbox.checked = true;
			} else {
				toggleSubredditStyle(false);
			}
		}
		styleToggleCheckbox.addEventListener('change', function() {
			toggleSubredditStyle(this.checked);
		}, false);
		styleToggleContainer.appendChild(styleToggleCheckbox);
		$(subredditTitle).after(styleToggleContainer);
	}

	styleToggleLabel.setAttribute('for', 'res-style-checkbox');
	styleToggleLabel.textContent = 'Use subreddit style ';
	styleToggleContainer.appendChild(styleToggleLabel);
}

export function toggleSubredditStyle(toggle, subreddit) {
	if (toggle) {
		enableSubredditStyle(subreddit);
	} else {
		disableSubredditStyle(subreddit);
	}
}

let stylesheetURL;

function enableSubredditStyle(subreddit) {
	const togglesr = subreddit ? subreddit.toLowerCase() : curSubReddit;

	if (NightMode.isNightModeOn() && !NightMode.isNightmodeCompatible) {
		NightMode.addSubredditToWhitelist(togglesr);
	} else if (ignoredSubReddits) {
		const index = ignoredSubReddits.indexOf(togglesr);

		if (index !== -1) {
			// Remove if found
			ignoredSubReddits.splice(index, 1);
		}

		Storage.set('RESmodules.styleTweaks.ignoredSubredditStyles', ignoredSubReddits);
	}

	const subredditStyleSheet = document.createElement('link');
	subredditStyleSheet.setAttribute('title', 'applied_subreddit_stylesheet');
	subredditStyleSheet.setAttribute('rel', 'stylesheet');
	if (stylesheetURL) {
		subredditStyleSheet.setAttribute('href', stylesheetURL);
	} else {
		subredditStyleSheet.setAttribute('href', `/r/${togglesr}/stylesheet.css`);
	}
	if (!subreddit || (subreddit.toLowerCase() === curSubReddit)) document.head.appendChild(subredditStyleSheet);

	// in case it was set by the pageAction, be sure to check the checkbox.
	if (styleToggleCheckbox) {
		styleToggleCheckbox.checked = true;
	}
	PageAction.show(true);
}

function disableSubredditStyle(subreddit) {
	const togglesr = subreddit ? subreddit.toLowerCase() : curSubReddit;
	if (NightMode.isNightModeOn() && !NightMode.isNightmodeCompatible) {
		NightMode.removeSubredditFromWhitelist(togglesr);
	} else if (ignoredSubReddits) {
		if (!ignoredSubReddits.includes(togglesr)) {
			// Add if found
			ignoredSubReddits.push(togglesr);
		}

		Storage.set('RESmodules.styleTweaks.ignoredSubredditStyles', ignoredSubReddits);
	}

	const subredditStyleSheet = (
		document.head.querySelector('link[title=applied_subreddit_stylesheet]') ||
		document.head.querySelector('style[title=applied_subreddit_stylesheet]') ||
		document.head.querySelector('style[data-apng-original-href]') // apng extension fix (see #1076)
	);

	if (subredditStyleSheet && (!subreddit || (subreddit.toLowerCase() === curSubReddit))) {
		stylesheetURL = subredditStyleSheet.href;
		subredditStyleSheet.remove();
	}

	// in case it was set by the pageAction, be sure to uncheck the checkbox
	if (styleToggleCheckbox) {
		styleToggleCheckbox.checked = false;
	}
	PageAction.show(false);
}

export function isSubredditStyleEnabled() {
	// TODO: detect if srstyle is disabled by reddit account preference

	if (styleToggleCheckbox) {
		return styleToggleCheckbox.checked;
	}

	// RES didn't disable it, at least
	return true;
}
