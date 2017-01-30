/* @flow */

import _ from 'lodash';
import commandLineTemplate from '../templates/commandLine.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	Alert,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	downcast,
	loggedInUser,
	string,
} from '../utils';
import { Storage, XhrCache, ajax, openNewTab } from '../environment';
import * as Menu from './menu';

export const module: Module<*> = new Module('commandLine');

module.moduleName = 'commandLineName';
module.description = 'commandLineDesc';
module.category = 'coreCategory';
module.options = {
	launch: {
		type: 'button',
		text: 'Launch',
		description: 'Open the RES Command Line',
		callback() { toggleCmdLine(true); },
	},
	menuItem: {
		type: 'boolean',
		description: 'Add a "launch command line" item to the RES dropdown menu',
		value: false,
	},
	launchFromMenuButton: {
		type: 'boolean',
		description: 'Launch the command line by clicking the RES menu gear button',
		value: false,
	},
};

module.go = () => {
	if (module.options.menuItem.value) {
		addMenuItem();
	}

	if (module.options.launchFromMenuButton.value) {
		addMenuButtonHandler();
	}
};

function addMenuItem() {
	const $menuItem = $('<div>', { text: 'command line' })
		.append($('<span>', {
			class: 'RESMenuItemButton res-icon',
			text: '\uF060',
		}));

	Menu.addMenuItem($menuItem, _onClickMenu);
}

function addMenuButtonHandler() {
	Menu.onClickMenuButton(_onClickMenu, true);
}

function _onClickMenu() {
	Menu.hidePrefsDropdown();
	toggleCmdLine(true);
}

const commandLine = _.once(() => {
	const $widget = $(commandLineTemplate());
	const widget = $widget[0];

	widget.style.display = 'none';

	const input: HTMLInputElement = ($widget.find('#keyCommandInput')[0]: any);

	input.setAttribute('autocomplete', 'off');

	input.addEventListener('blur', () => {
		if (!input.value.length) {
			toggleCmdLine(false);
		} else {
			cmdLineShowError('click into the text input and press escape to close the command line');
		}
	});

	input.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.keyCode === 27) {
			// close prompt.
			toggleCmdLine(false);
		} else {
			// auto suggest?
			cmdLineHelper($(e.target).val());
		}
	});

	const $tip = $widget.find('#keyCommandInputTip');
	const $error = $widget.find('#keyCommandInputError');

	const commandLineForm = $widget.find('#keyCommandForm')[0];
	commandLineForm.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.keyCode === 13) {
			cmdLineSubmit(e);
		}
	});

	$widget.appendTo(document.body);

	return { widget, input, $tip, $error };
});

function cmdLineShowTip(str) {
	if (str === false) {
		commandLine().$tip.empty();
	} else {
		commandLine().$tip.safeHtml(str);
	}
}

function cmdLineShowError(str) {
	if (str === false) {
		commandLine().$error.empty();
	} else {
		commandLine().$error.safeHtml(str);
	}
}

export function toggleCmdLine(force?: boolean = true, initialCmd?: string = '') {
	if (!Modules.isRunning(module)) return;

	const open = force && commandLine().widget.style.display !== 'block';

	if (open) {
		cmdLineShowError(false);
		cmdLineShowTip(false);
		commandLine().widget.style.display = 'block';
		setTimeout(() => commandLine().input.focus(), 20);
		commandLine().input.value = initialCmd;
	} else {
		commandLine().input.blur();
		commandLine().widget.style.display = 'none';
	}
}

function cmdLineHelper(val) {
	const splitWords = val.split(' ');
	const command = splitWords[0];
	splitWords.splice(0, 1);
	val = splitWords.join(' ');
	const tip = getTip(command, val);
	cmdLineShowTip(tip);
	if (tip) {
		cmdLineShowError(false);
	}
}

function cmdLineSubmit(e) {
	e.preventDefault();
	cmdLineShowError(false);

	const splitWords = commandLine().input.value.split(' ');
	const command = splitWords[0];
	const val = splitWords.slice(1).join(' ');

	const error = executeCommand(command, val, e);
	if (error) {
		cmdLineShowError(error);
	} else if (error !== false) {
		// hide the commandline tool...
		toggleCmdLine(false);
	}
}

function navigateTo(url, e) {
	if (e.shiftKey) {
		// background tab if e.altKey
		openNewTab(url, !e.altKey);
	} else {
		location.href = url;
	}
}

const commands = [];

export function registerCommand<T>(
	commandPredicate: RegExp | string | (cmd: string, val: string) => false | void | T,
	description: string | string[] | false,
	getTip: (cmd: string, val: string, predResult: T) => string | false | void,
	executeCommand: (cmd: string, val: string, predResult: T, e: KeyboardEvent) => string | false | void
) {
	commands.push({
		commandPredicate,
		description,
		getTip,
		executeCommand,
	});
}

function getCommandSpec(command, val) {
	let result;
	commands.some(commandSpec => {
		let predicateResult;
		if (typeof commandSpec.commandPredicate.exec === 'function') {
			predicateResult = commandSpec.commandPredicate.exec(command);
		} else if (typeof commandSpec.commandPredicate === 'string') {
			predicateResult = commandSpec.commandPredicate === command;
		} else if (typeof commandSpec.commandPredicate === 'function') {
			predicateResult = commandSpec.commandPredicate(command, val);
		}
		if (predicateResult) {
			result = {
				...commandSpec,
				predicateResult,
			};
			return true;
		}
	});
	return result;
}

function getTip(command, val) {
	const matchingCommandSpec = getCommandSpec(command, val);
	if (matchingCommandSpec) {
		return matchingCommandSpec.getTip(command, val, matchingCommandSpec.predicateResult) ||
			matchingCommandSpec.description;
	}

	return false;
}

function executeCommand(command, value, event) {
	// see what kind of input it is:
	const matchingCommandSpec = getCommandSpec(command, value);
	if (matchingCommandSpec) {
		return matchingCommandSpec.executeCommand(command, value, matchingCommandSpec.predicateResult, event);
	} else {
		return 'unknown command - type ? for help';
	}
}

registerCommand(/^\/?r\/(.*)/, 'r/[subreddit] - navigates to subreddit',
	(command, val, match) => `navigate to subreddit: ${match[1]}`,
	(command, val, match, e) => {
		navigateTo(`/r/${match[1]}`, e);
	}
);

registerCommand(/^\/?m\/(.*)/, 'm/[multi] - view your multi-reddit [multi]',
	(command, val, match) => `navigate to multi-reddit: /me/m/${match[1]}`,
	(command, val, match, e) => {
		navigateTo(`/me/m/${match[1]}`, e);
	}
);

registerCommand('m', 'm - go to inbox',
	() => 'View messages',
	(command, value, match, e) => {
		navigateTo('/message/inbox/', e);
	}
);

registerCommand('mm', 'mm - go to moderator mail',
	() => 'View moderator mail',
	(command, value, match, e) => {
		navigateTo('/message/moderator/', e);
	}
);

registerCommand(/^XHR/, 'XHRCache clear - manipulate the XHR cache',
	() => 'clear - clear the cache (use if inline images aren\'t loading properly)',
	(command, value) => {
		if (/^\s*$/.test(value)) {
			return 'Operation required [clear]';
		}

		switch (value) {
			case 'clear':
				XhrCache.clear();
				break;
			default:
				return 'The only accepted operation is <tt>clear</tt>';
		}
	}
);


registerCommand(/^user$|^u$|^\/?u(?:ser)?\/(\w*((?!\/m\/).)*)$/, 'user [username] or u/[username] - view profile for [username]',
	(command, val, match) => {
		val = val || match[1];
		if (!val && loggedInUser()) {
			return 'go to profile';
		} else if (!val) {
			return false;
		} else {
			return `go to profile for: ${val}`;
		}
	},
	(command, val, match, e) => {
		val = val || match[1] || loggedInUser();
		if (!val) {
			return 'not logged in';
		}
		navigateTo(`/u/${val}`, e);
	}
);

registerCommand(/^\/?u(?:ser)?\/(\w+)\/m(?:\/(.+))?/, 'u/[username]/m/[multi] - view the multireddit [multi] curated by [username]',
	(command, val, match) => `navigate to multi-reddit: /u/${match[1]}/m/${match[2] || ''}`,
	(command, val, match, e) => {
		if (!match[1]) {
			return 'no multi-reddit specified';
		}
		navigateTo(`/u/${match[1]}/m/${match[2]}`, e);
	}
);

registerCommand(/^\/?me(?:\/?(.*))$/,
	[
		'me - view profile for current user',
		'me/saved or me/s - view current user\'s saved links',
		'me/saved#comments or me/sc - view current user\'s saved comments',
		'me/submitted or me/sub - view current user\'s submitted content',
		'me/comments or me/c - view current user\'s comments',
		'me/gilded or me/g - view current user\'s gilded content',
		'me/liked or me/l - view current user\'s liked content ',
		'me/disliked or me/d - view current user\'s disliked content',
		'me/hidden or me/h - view current user\'s hidden content',
	],
	(command, val, match) => {
		const loggedIn = loggedInUser();
		if (!loggedIn) {
			return 'not logged in';
		}
		let str;
		switch (match[1]) {
			case '':
				// go to current user's page
				str = `navigate to user profile: ${loggedIn}`;
				break;
			case 'saved':
			case 's':
				// go to current user's saved content
				str = 'navigate to current user\'s saved content';
				break;
			case 'saved#comments':
			case 'sc':
				// go to current RES's saved comments
				str = 'navigate to current RES\'s saved comments';
				break;
			case 'submitted':
			case 'sub':
				// go to current user's submitted content
				str = 'navigate to current user\'s submitted content';
				break;
			case 'comments':
			case 'c':
				// go to current user's comments page
				str = 'navigate to current user\'s comments';
				break;
			case 'gilded':
			case 'g':
				// go to current user's gilded content
				str = 'navigate to current user\'s gilded content';
				break;
			case 'liked':
			case 'l':
				// go to current user's liked content
				str = 'navigate to current user\'s liked content';
				break;
			case 'disliked':
			case 'd':
				// go to current user's disliked content
				str = 'navigate to current user\'s disliked content';
				break;
			case 'hidden':
			case 'h':
				// go to current user's hidden content
				str = 'navigate to current user\'s hidden content';
				break;
			default:
				str = 'navigate to [s]aved, [s]aved[c]omments, [sub]mitted, [c]omments, [g]ilded, [l]iked, [d]isliked, [h]idden';
				break;
		}
		return str;
	},
	(command, val, match, e) => {
		const currentUser = loggedInUser();
		if (!currentUser) {
			return 'not logged in';
		}
		switch (match[1]) {
			case '':
				// go to current user's page
				navigateTo(`/user/${currentUser}`, e);
				break;
			case 'saved':
			case 's':
				// go to current user's saved content
				navigateTo(`/user/${currentUser}/saved`, e);
				break;
			case 'saved#comments':
			case 'sc':
				// go to current user's saved comments
				navigateTo(`/user/${currentUser}/saved#comments`, e);
				break;
			case 'submitted':
			case 'sub':
				// go to current user's submitted content
				navigateTo(`/user/${currentUser}/submitted`, e);
				break;
			case 'comments':
			case 'c':
				// go to current user's comments page
				navigateTo(`/user/${currentUser}/comments`, e);
				break;
			case 'gilded':
			case 'g':
				// go to current user's gilded content
				navigateTo(`/user/${currentUser}/gilded`, e);
				break;
			case 'liked':
			case 'l':
				// go to current user's liked content
				navigateTo(`/user/${currentUser}/liked`, e);
				break;
			case 'disliked':
			case 'd':
				// go to current user's disliked content
				navigateTo(`/user/${currentUser}/disliked`, e);
				break;
			case 'hidden':
			case 'h':
				// go to current user's hidden content
				navigateTo(`/user/${currentUser}/hidden`, e);
				break;
			default:
				return 'unknown command - type ? for help';
		}
	}
);

registerCommand('userinfo', false,
	() => {},
	(command, val) => {
		// view JSON data for username (username is required)
		if (val.length <= 1) {
			return 'No username specified.';
		} else {
			ajax({ url: string.encode`/user/${val}/about.json` }).then(Alert.open);
		}
	}
);

registerCommand('userbadge', false,
	() => {},
	(command, val) => {
		// get CSS code for a badge for username (username is required)
		if (val.length <= 1) {
			return 'No username specified.';
		} else {
			ajax({
				url: string.encode`/user/${val}/about.json`,
				type: 'json',
			}).then(({ data }) => Alert.open(`, .id-t2_${data.id}::before`));
		}
	}
);

{
	const optionsRegex = /(?:RES)?opt(?:ion)?s?[\.\s]+(.*)/i;
	const moduleDataRegex = /(?:RES)?mod(?:ule)?s?[\.\s]+(.*)/i;

	function sanitizeStorageKey(key) {
		let match;
		if ((match = optionsRegex.exec(key))) {
			key = `RESoptions.${match[1]}`;
		} else if ((match = moduleDataRegex.exec(key))) {
			key = `RESmodules.${match[1]}`;
		}

		return key;
	}

	function executeCommand(command, key, value) {
		if (command === 'get') {
			Storage.get(key).then(value =>
				Alert.open(string.escapeHTML`Value of RESStorage[${key}]: <br><br><textarea rows="5" cols="50">${JSON.stringify(value)}</textarea>`)
			);
		} else if (command === 'update') {
			const id = `RESStorageUpdate-${Date.now()}`;
			Storage.get(key).then(value =>
				Alert.open(string.escapeHTML`Value of RESStorage[${key}]: <br><br><textarea id="${id}" rows="5" cols="50">${JSON.stringify(value)}</textarea>`, { cancelable: true })
					.then(() => {
						const textArea = document.getElementById(id);
						if (textArea) {
							Storage.set(key, JSON.parse(downcast(textArea, HTMLTextAreaElement).value));
						}
					})
			);
		} else if (command === 'remove') {
			Storage.delete(key);
			Alert.open(string.escapeHTML`RESStorage[${key}] deleted`);
		} else if (command === 'set') {
			Storage.set(key, JSON.parse(value));
			Alert.open(string.escapeHTML`RESStorage[${key}] set to:<br><br><textarea rows="5" cols="50">${value}</textarea>`);
		} else {
			return 'You must specify either "get [key]" or "set [key] [value]"';
		}
	}

	registerCommand(/(?:RES)?stor(?:e|age)?/i, 'RESStorage [get|set|update|remove] [key] [value] - For debug use only, you shouldn\'t mess with this unless you know what you\'re doing.',
		() => {
		},
		(command, val) => {
			// get or set RESStorage data
			const splitWords = val.split(' ');
			if (splitWords.length < 2) {
				return 'You must specify "get [key]", "update [key]" or "set [key] [value]"';
			} else {
				const key = sanitizeStorageKey(splitWords[1]);
				const value = splitWords.slice(2).join(' ');

				return executeCommand(splitWords[0], key, value);
			}
		}
	);
}

const sortTypes = {
	n: 'new',
	t: 'top',
	h: 'hot',
	r: 'rising',
	c: 'controversial',
	g: 'gilded',
	p: 'ads',
};

registerCommand(/^\/([nthrcgp])?/, '/n, /t, /h, /r, /c, /g, or /p - goes to new, top, hot, rising, controversial, gilded, or promoted sort of current subreddit, multireddit or user page',
	(command, val, match) => `sort by ([n]ew, [t]op, [h]ot, [r]ising, [c]ontroversial, [g]ilded, [p]romoted): ${match[1] || ''}`,
	(command, val, match, e) => {
		const theInput = sortTypes[match[1]];
		if (theInput) {
			const currentUser = currentUserProfile();
			if (currentUser) {
				// Special-case for user pages since they behave a little differently
				// than subreddits/multireddits.
				if (theInput === 'gilded') {
					navigateTo(`/user/${currentUser}/${theInput}`, e);
				} else if (theInput === 'ads' || theInput === 'rising') {
					return `invalid sort command - "${theInput}" is not supported on profile pages`;
				} else {
					navigateTo(`/user/${currentUser}?sort=${theInput}`, e);
				}
				return;
			}

			const subreddit = currentSubreddit();
			if (subreddit) {
				navigateTo(`/r/${subreddit}/${theInput}`, e);
				return;
			}

			const multi = currentMultireddit();
			if (multi) {
				navigateTo(`/${multi}/${theInput}`, e);
			} else {
				navigateTo(`/${theInput}`, e);
			}
		} else {
			return 'invalid sort command - must be one of [n]ew, [t]op, [h]ot, [r]ising, [c]ontroversial, [g]ilded, [p]romoted';
		}
	}
);

registerCommand('?', false,
	() => {
		const descriptions = commands
			.map(command => command.description)
			.reduce((a, b) => b ? a.concat(b) : a, []);

		if (descriptions.length) {
			return `<ul><li>${descriptions.join('</li><li>')}</li></ul>`;
		}
	},
	() => false
);
