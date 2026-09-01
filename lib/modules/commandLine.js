/* @flow */

import DOMPurify from 'dompurify';
import { once } from 'lodash-es';
import { Module } from '../core/module';
import {
	Alert,
	NAMED_KEYS,
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	downcast,
	empty,
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
		title: 'commandLineLaunchTitle',
		type: 'button',
		text: 'Launch',
		description: 'commandLineLaunchDesc',
		callback() { open(); },
	},
	menuItem: {
		title: 'commandLineMenuItemTitle',
		type: 'boolean',
		description: 'commandLineMenuItemDesc',
		value: false,
	},
};

module.contentStart = () => {
	if (module.options.menuItem.value) {
		addMenuItem();
	}
};

function addMenuItem() {
	Menu.addMenuItem(
		() => string.html`<div>command line <span class="RESMenuItemButton res-icon">\uF060</span></div>`,
		() => open(),
	);
}

const commandLine = once(() => {
	const widget = string.html`
		<div id="keyCommandLineWidget" hidden>
			<div id="keyCommandForm">
				<input id="keyCommandInput" type="text" autocomplete="off">
				type a command, ? for help, esc to close
				<div id="keyCommandInputTip"></div>
				<div id="keyCommandInputError"></div>
			</div>
		</div>
	`;

	document.body.append(widget);

	const input = downcast(widget.querySelector('#keyCommandInput'), HTMLInputElement);

	const tip = widget.querySelector('#keyCommandInputTip');
	const error = widget.querySelector('#keyCommandInputError');

	const setTip = str => { tip.innerHTML = DOMPurify.sanitize(str); };
	const clearTip = () => empty(tip);
	const setError = str => { error.innerHTML = DOMPurify.sanitize(str); };
	const clearError = () => empty(error);

	input.addEventListener('blur', () => {
		if (!input.value.length) {
			close();
		} else {
			setError('click into the text input and press escape to close the command line');
		}
	});

	document.addEventListener('keyup', (e: KeyboardEvent) => {
		if (!widget.hidden && e.key === NAMED_KEYS.Escape) {
			close();
			e.stopImmediatePropagation();
		}
	});

	input.addEventListener('input', async () => {
		clearTip();
		clearError();
		const tip = await getTip(parse(input.value));
		if (tip) setTip(tip);
	});

	const commandLineForm = widget.querySelector('#keyCommandForm');
	commandLineForm.addEventListener('keydown', async (e: KeyboardEvent) => {
		if (e.key === NAMED_KEYS.Enter) {
			const error = await executeCommand(parse(input.value), e);
			if (error) {
				setError(error);
			} else if (error !== false) {
				close();
			}
		}
	});

	return { widget, input };
});

export function open(initialCmd: string = '') {
	commandLine().widget.hidden = false;
	commandLine().input.focus();
	commandLine().input.value = initialCmd;
	commandLine().input.dispatchEvent(new Event('input'));
}

function close() {
	commandLine().input.blur();
	commandLine().widget.hidden = true;
}

export function toggle() {
	if (commandLine().widget.hidden) open();
	else close();
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
	commandPredicate: RegExp | string | (cmd: string, val: string) => false | void | null | T,
	description: string | string[] | false,
	getTip: (cmd: string, val: string, predResult: T) => string | false | void | null | Promise<string>,
	executeCommand: (cmd: string, val: string, predResult: T, e: KeyboardEvent) => string | false | void | null | Promise<string | void>,
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

function parse(input) {
	const splitWords = input.split(' ');
	const command = splitWords[0];
	const value = splitWords.slice(1).join(' ');
	return { command, value };
}

function getTip({ command, value }) {
	const matchingCommandSpec = getCommandSpec(command, value);
	if (matchingCommandSpec) {
		return matchingCommandSpec.getTip(command, value, matchingCommandSpec.predicateResult) ||
			matchingCommandSpec.description;
	}
}

function executeCommand({ command, value }, event) {
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
	},
);

registerCommand(/^\/?m\/(.*)/, 'm/[multi] - view your multi-reddit [multi]',
	(command, val, match) => `navigate to multi-reddit: /me/m/${match[1]}`,
	(command, val, match, e) => {
		navigateTo(`/me/m/${match[1]}`, e);
	},
);

registerCommand('m', 'm - go to inbox',
	() => 'View messages',
	(command, value, match, e) => {
		navigateTo('/message/inbox/', e);
	},
);

registerCommand('mm', 'mm - go to moderator mail',
	() => 'View moderator mail',
	(command, value, match, e) => {
		navigateTo('/message/moderator/', e);
	},
);

registerCommand('front', 'front - go to frontpage',
	() => 'Go to frontpage',
	(command, value, match, e) => {
		navigateTo('/', e);
	},
);

registerCommand(/^XHR/, 'XHRCache clear - manipulate the XHR cache',
	() => 'clear - clear the cache (use if inline images aren\'t loading properly)',
	(command, value) => {
		if ((/^\s*$/).test(value)) {
			return 'Operation required [clear]';
		}

		switch (value) {
			case 'clear':
				XhrCache.clear();
				break;
			default:
				return 'The only accepted operation is <tt>clear</tt>';
		}
	},
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
	},
);

registerCommand(/^\/?u(?:ser)?\/(\w+)\/m(?:\/(.+))?/, 'u/[username]/m/[multi] - view the multireddit [multi] curated by [username]',
	(command, val, match) => `navigate to multi-reddit: /u/${match[1]}/m/${match[2] || ''}`,
	(command, val, match, e) => {
		if (!match[1]) {
			return 'no multi-reddit specified';
		}
		navigateTo(`/u/${match[1]}/m/${match[2]}`, e);
	},
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
	},
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
	},
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
	},
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
				Alert.open(string.escape`Value of RESStorage[${key}]: <br><br><textarea rows="5" cols="50">${JSON.stringify(value)}</textarea>`),
			);
		} else if (command === 'update') {
			Storage.get(key).then(value => {
				const element = string.html`<div>Value of RESStorage[${key}]: <br><br><textarea rows="5" cols="50">${JSON.stringify(value)}</textarea></div>`;
				Alert.open(element, { cancelable: true })
					.then(() => Storage.set(key, JSON.parse(downcast(element.querySelector('textarea'), HTMLTextAreaElement).value)));
			});
		} else if (command === 'remove') {
			Storage.delete(key);
			Alert.open(string.escape`RESStorage[${key}] deleted`);
		} else if (command === 'set') {
			Storage.set(key, JSON.parse(value));
			Alert.open(string.escape`RESStorage[${key}] set to:<br><br><textarea rows="5" cols="50">${value}</textarea>`);
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
		},
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
const sortTypeRecognizesPeriod = sortType => sortTypes.t === sortType || sortTypes.c === sortType;
const periods = ['hour', 'day', 'week', 'month', 'year', 'all'];
const getPeriod = val => val && periods.find(period => period.startsWith(val));

registerCommand(/^\/([nthrcgp])?/, '/n, /t, /h, /r, /c, /g, or /p - goes to new, top, hot, rising, controversial, gilded, or promoted sort of current subreddit, multireddit or user page',
	(command, val, match) => {
		const sortType = sortTypes[match[1]];
		if (sortType) {
			return sortTypeRecognizesPeriod(sortType) ?
				`sort by ${sortType} [(${periods.map(period => getPeriod(val) === period ? `<b>${period}</b>` : period).join('|')})]` :
				`sort by ${sortType}`;
		} else {
			return 'sort by ([n]ew, [t]op, [h]ot, [r]ising, [c]ontroversial, [g]ilded, [p]romoted)';
		}
	},
	(command, val, match, e) => {
		const sortType = sortTypes[match[1]];
		if (!sortType) {
			return 'invalid sort command - must be one of [n]ew, [t]op, [h]ot, [r]ising, [c]ontroversial, [g]ilded, [p]romoted';
		}

		function _navigateTo(v) {
			const url = new URL(v, location.href);

			const period = getPeriod(val);
			if (sortTypeRecognizesPeriod(sortType) && period) {
				url.searchParams.append('t', period);
			}

			navigateTo(url.href, e);
		}

		const currentUser = currentUserProfile();
		if (currentUser) {
			// Special-case for user pages since they behave a little differently
			// than subreddits/multireddits.
			if (sortType === 'gilded') {
				_navigateTo(`/user/${currentUser}/${sortType}`);
			} else if (sortType === 'ads' || sortType === 'rising') {
				return `invalid sort command - "${sortType}" is not supported on profile pages`;
			} else {
				_navigateTo(`/user/${currentUser}?sort=${sortType}`);
			}
			return;
		}

		const subreddit = currentSubreddit();
		if (subreddit) {
			_navigateTo(`/r/${subreddit}/${sortType}`);
			return;
		}

		const multi = currentMultireddit();
		if (multi) {
			_navigateTo(`/${multi}/${sortType}`);
		} else {
			_navigateTo(`/${sortType}`);
		}
	},
);

registerCommand(cmd => ['s', 'search'].includes(cmd), 's[earch] [query] - searches the current subreddit (if any) or all of Reddit',
	(command, val) => {
		const subreddit = currentSubreddit();
		if (!subreddit) {
			return `Search all of Reddit: ${val}`;
		}
		return `Search /r/${subreddit}: ${val}`;
	},
	(command, val, match, e) => {
		const subreddit = currentSubreddit();
		if (!subreddit) {
			navigateTo(string.encode`/search?q=${val}`, e);
			return;
		}
		navigateTo(string.encode`/r/${subreddit}/search?q=${val}&restrict_sr=on`, e);
	},
);

registerCommand('sr', 'sr [query] - searches all of Reddit',
	(command, val) => `Search all of Reddit: ${val}`,
	(command, val, match, e) => {
		navigateTo(string.encode`/search?q=${val}`, e);
	},
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
	() => false,
);
