/* eslint no-unused-vars: [2, { "argsIgnorePattern": "^(moduleID|command|value|match)$" }] */

addModule('commandLine', function(module, moduleID) {
	module.moduleName = 'RES Command Line';
	module.description = 'Command line for navigating reddit, toggling RES settings, and debugging RES';
	module.category = ['Core'];
	module.options.launch = {
		type: 'button',
		text: 'Launch',
		description: 'Open the RES Command Line',
		callback: function() { module.toggleCmdLine(true); }
	};
	module.options.menuItem = {
		type: 'boolean',
		text: 'Add a "launch command line" item to the RES dropdown menu',
		value: false
	};
	module.options.launchFromMenuButton = {
		type: 'boolean',
		text: 'Launch the command line by clicking the RES menu <span class="gearIcon"></span> gear button',
		value: false
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (module.options.menuItem.value) {
				addMenuItem();
			}

			if (module.options.launchFromMenuButton.value) {
				addMenuButtonHandler();
			}

			return attachCommandLineWidget();
		}
	};

	function addMenuItem() {
		var menuItem = RESUtils.createElement('div', null, null, 'command line');
		var button = RESUtils.createElement('span', null, 'RESMenuItemButton res-icon', '\uF060');
		menuItem.appendChild(button);


		modules['RESMenu'].addMenuItem(menuItem, _onClickMenu);
	}

	function addMenuButtonHandler() {
		modules['RESMenu'].onClickMenuButton(_onClickMenu);
	}

	function _onClickMenu() {
		modules['RESMenu'].hidePrefsDropdown();
		module.toggleCmdLine(true);
	}

	var commandLineWidget, commandLineInput, commandLineInputTip, commandLineInputError;

	async function attachCommandLineWidget() {
		const template = await RESTemplates.load('commandLine');

		var widget = template.html();

		commandLineWidget = widget[0];

		commandLineWidget.style.display = 'none';

		commandLineInput = widget.find('#keyCommandInput')[0];

		commandLineInput.setAttribute('autocomplete', 'off');

		commandLineInput.addEventListener('blur', function() {
			if (!commandLineInput.value.length) {
				module.toggleCmdLine(false);
			} else {
				cmdLineShowError('click into the text input and press escape to close the command line');
			}
		}, false);
		commandLineInput.addEventListener('keyup', function(e) {
			if (e.keyCode === 27) {
				// close prompt.
				module.toggleCmdLine(false);
			} else {
				// auto suggest?
				cmdLineHelper(e.target.value);
			}
		}, false);
		commandLineInputTip = widget.find('#keyCommandInputTip')[0];
		commandLineInputError = widget.find('#keyCommandInputError')[0];

		var commandLineForm = widget.find('#keyCommandForm')[0];
		commandLineForm.addEventListener('keydown', function(e) {
			if (e.keyCode === 13) {
				cmdLineSubmit(e);
			}
		}, false);

		document.body.appendChild(commandLineWidget);

	}

	function cmdLineShowTip(str) {
		if (str === false) {
			$(commandLineInputTip).empty();
		} else {
			$(commandLineInputTip).safeHtml(str);
		}
	}

	function cmdLineShowError(str) {
		if (str === false) {
			$(commandLineInputError).empty();
		} else {
			$(commandLineInputError).safeHtml(str);
		}
	}

	module.toggleCmdLine = function(force) {
		if (!(this.isEnabled() && this.isMatchURL())) return;

		var open = ((force === undefined || force) && commandLineWidget.style.display !== 'block');

		if (open) {
			cmdLineShowError(false);
			cmdLineShowTip(false);
			commandLineWidget.style.display = 'block';
			setTimeout(function() {
				commandLineInput.focus();
			}, 20);
			commandLineInput.value = '';
		} else {
			commandLineInput.blur();
			commandLineWidget.style.display = 'none';
		}
		modules['styleTweaks'].setSRStyleToggleVisibility(!open, 'cmdline');
	};

	function cmdLineHelper(val) {
		var splitWords = val.split(' '),
			command = splitWords[0];
		splitWords.splice(0, 1);
		val = splitWords.join(' ');
		var tip = getTip(command, val);
		cmdLineShowTip(tip);
		if (tip) {
			cmdLineShowError(false);
		}
	}

	function cmdLineSubmit(e) {
		e.preventDefault();
		cmdLineShowError(false);

		var val = commandLineInput.value;

		var splitWords = val.split(' '),
			command = splitWords[0];
		splitWords.splice(0, 1);
		val = splitWords.join(' ');

		var error = executeCommand(command, val, e);
		if (error) {
			cmdLineShowError(error);
		} else if (error !== false) {
			// hide the commandline tool...
			module.toggleCmdLine(false);
		}
	}

	function navigateTo(url, e) {
		if (e.shiftKey) {
			// background tab if e.altKey
			RESEnvironment.openNewTab(url, !e.altKey);
		} else {
			location.href = url;
		}
	}

	var commands = [];
	module.registerCommand = function registerCommand(commandPredicate, description, getTip, executeCommand) {
		commands.push({
			commandPredicate: commandPredicate,
			description: description,
			getTip: getTip,
			executeCommand: executeCommand
		});
	};

	function getCommandSpec(command, val) {
		let result;
		commands.some(commandSpec => {
			let predicateResult;
			if (commandSpec.commandPredicate.exec) {
				predicateResult = commandSpec.commandPredicate.exec(command);
			} else if (typeof commandSpec.commandPredicate === 'string') {
				predicateResult = commandSpec.commandPredicate === command;
			} else if (typeof commandSpec.commandPredicate === 'function') {
				predicateResult = commandSpec.commandPredicate(command, val);
			}
			if (predicateResult) {
				result = Object.assign({}, commandSpec, { predicateResult });
				return true;
			}
		});
		return result;
	}

	function getTip(command, val) {
		var str = false;
		var matchingCommandSpec = getCommandSpec(command, val);
		if (matchingCommandSpec) {
			str = matchingCommandSpec.getTip(command, val, matchingCommandSpec.predicateResult);
		}

		return str;
	}

	function executeCommand(command, value, event) {
		// see what kind of input it is:
		var matchingCommandSpec = getCommandSpec(command, value);
		if (matchingCommandSpec) {
			var result = matchingCommandSpec.executeCommand(command, value, matchingCommandSpec.predicateResult, event);
			return result;
		} else {
			return 'unknown command - type ? for help';
		}
	}

	module.registerCommand(/^\/?r\/(.*)/, 'r/[subreddit] - navigates to subreddit',
		function(command, val, match) {
			return 'navigate to subreddit: ' + match[1];
		}, function(command, val, match, e) {
			navigateTo('/r/' + match[1], e);
		}
	);

	module.registerCommand(/^\/?m\/(.*)/, 'm/[multi] - view your multi-reddit [multi]',
		function(command, val, match) {
			return 'navigate to multi-reddit: /me/m/' + match[1];
		}, function(command, val, match, e) {
			navigateTo('/me/m/' + match[1], e);
		}
	);

	module.registerCommand('m', 'm - go to inbox',
		function() {
			return 'View messages';
		}, function(command, value, match, e) {
			navigateTo('/message/inbox/', e);
		}
	);

	module.registerCommand('mm', 'mm - go to moderator mail',
		function() {
			return 'View moderator mail';
		}, function(command, value, match, e) {
			navigateTo('/message/moderator/', e);
		}
	);

	module.registerCommand(/^XHR/, 'XHRCache clear - manipulate the XHR cache',
		function(command, value, match) {
			return 'clear - clear the cache (use if inline images aren\'t loading properly)';
		}, function(command, value, match) {
			if (/^\s*$/.test(value)) {
				return 'Operation required [clear]';
			}

			switch (value) {
				case 'clear':
					RESEnvironment.xhrCache.clear();
					break;
				default:
					return 'The only accepted operation is <tt>clear</tt>';
			}
		}
	);


	module.registerCommand(/^user$|^u$|^\/?u(?:ser)?\/(\w*((?!\/m\/).)*)$/, 'user [username] or u/[username] - view profile for [username]',
		function(command, val, match) {
			val = RESUtils.firstValid(val || undefined, match[1] || undefined, false);
			if (val === false && RESUtils.loggedInUser()) {
				return 'go to profile';
			} else if (val === false) {
				return false;
			} else {
				return 'go to profile for: ' + val;
			}
		},
		function(command, val, match, e) {
			val = RESUtils.firstValid(val || undefined, match[1] || undefined, RESUtils.loggedInUser(), false);
			if (val === false) {
				return 'not logged in';
			}
			navigateTo('/u/' + val, e);
		}
	);

	module.registerCommand(/^\/?u(?:ser)?\/(\w+)\/m(?:\/(.+))?/, 'u/[username]/m/[multi] - view the multireddit [multi] curated by [username]',
		function(command, val, match) {
			return 'navigate to multi-reddit: /u/' + match[1] + '/m/' + (match[2] || '');
		},
		function(command, val, match, e) {
			if (!match[1]) {
				return 'no multi-reddit specified';
			}
			navigateTo('/u/' + match[1] + '/m/' + match[2], e);
		}
	);

	module.registerCommand(/^\/?me(?:\/?(.*))$/,
		[
			'me - view profile for current user',
			'me/saved or me/s - view current user\'s saved links',
			'me/saved#comments or me/sc - view current user\'s saved comments',
			'me/submitted or me/sub - view current user\'s submitted content',
			'me/comments or me/c - view current user\'s comments',
			'me/gilded or me/g - view current user\'s gilded content',
			'me/liked or me/l - view current user\'s liked content ',
			'me/disliked or me/d - view current user\'s disliked content',
			'me/hidden or me/h - view current user\'s hidden content'
		],
		function(command, val, match) {
			if (!RESUtils.loggedInUser()) {
				return 'not logged in';
			}
			var str;
			switch (match[1]) {
				case '':
					// go to current user's page
					str = 'navigate to user profile: ' + modules['accountSwitcher'].loggedInUser;
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
		function(command, val, match, e) {
			if (!RESUtils.loggedInUser()) {
				return 'not logged in';
			}
			var currentUser = modules['accountSwitcher'].loggedInUser;
			switch (match[1]) {
				case '':
					// go to current user's page
					navigateTo('/user/' + currentUser, e);
					break;
				case 'saved':
				case 's':
					// go to current user's saved content
					navigateTo('/user/' + currentUser + '/saved', e);
					break;
				case 'saved#comments':
				case 'sc':
					// go to current user's saved comments
					navigateTo('/user/' + currentUser + '/saved#comments', e);
					break;
				case 'submitted':
				case 'sub':
					// go to current user's submitted content
					navigateTo('/user/' + currentUser + '/submitted', e);
					break;
				case 'comments':
				case 'c':
					// go to current user's comments page
					navigateTo('/user/' + currentUser + '/comments', e);
					break;
				case 'gilded':
				case 'g':
					// go to current user's gilded content
					navigateTo('/user/' + currentUser + '/gilded', e);
					break;
				case 'liked':
				case 'l':
					// go to current user's liked content
					navigateTo('/user/' + currentUser + '/liked', e);
					break;
				case 'disliked':
				case 'd':
					// go to current user's disliked content
					navigateTo('/user/' + currentUser + '/disliked', e);
					break;
				case 'hidden':
				case 'h':
					// go to current user's hidden content
					navigateTo('/user/' + currentUser + '/hidden', e);
					break;
				default:
					return 'unknown command - type ? for help';
			}
		}
	);

	module.registerCommand('userinfo', false,
		function() { },
		function(command, val, match) {
			// view JSON data for username (username is required)
			if (val.length <= 1) {
				return 'No username specified.';
			} else {
				RESEnvironment.ajax({ url: RESUtils.string.encode`/user/${val}/about.json` }).then(alert);
			}
		}
	);

	module.registerCommand('userbadge', false,
		function() { },
		function(command, val, match) {
			// get CSS code for a badge for username (username is required)
			if (val.length <= 1) {
				return 'No username specified.';
			} else {
				RESEnvironment.ajax({
					url: RESUtils.string.encode`/user/${val}/about.json`,
					type: 'json'
				}).then(({ data }) => alert(`, .id-t2_${data.id}::before`));
			}
		}
	);

	module.registerCommand(/(?:RES)?stor(?:e|age)?/i, 'RESStorage [get|set|update|remove] [key] [value] - For debug use only, you shouldn\'t mess with this unless you know what you\'re doing.',
		function(command, value, match) { },
		function(command, val, match) {
			// get or set RESStorage data
			var splitWords = val.split(' ');
			if (splitWords.length < 2) {
				return 'You must specify "get [key]", "update [key]" or "set [key] [value]"';
			} else {
				command = splitWords[0];
				var key = splitWords[1],
					value;
				if (splitWords.length > 2) {
					value = splitWords.slice(2).join(' ');
				}
				key = storage.sanitizeStorageKey(key);

				// console.log(command);
				return storage.executeCommand(command, key, value);
			}
		}
	);
	var storage = {
		optionsRegex: /(?:RES)?opt(?:ion)?s?[\.\s]+(.*)/i,
		moduleDataRegex: /(?:RES)?mod(?:ule)?s?[\.\s]+(.*)/i,
		sanitizeStorageKey: function(key) {
			var match;
			if ((match = storage.optionsRegex.exec(key))) {
				key = 'RESoptions.' + match[1];
			} else if ((match = storage.moduleDataRegex.exec(key))) {
				key = 'RESmodules.' + match[1];
			}

			return key;
		},
		executeCommand: function(command, key, value) {
			if (command === 'get') {
				RESEnvironment.storage.getRaw(key).then(value =>
					alert(RESUtils.string.escapeHTML`Value of RESStorage[${key}]: <br><br><textarea rows="5" cols="50">${value}</textarea>`)
				);
			} else if (command === 'update') {
				const id = `RESStorageUpdate-${Date.now()}`;
				RESEnvironment.storage.getRaw(key).then(value =>
					alert(RESUtils.string.escapeHTML`Value of RESStorage[${key}]: <br><br><textarea id="${id}" rows="5" cols="50">${value}</textarea>`, () => {
						const textArea = document.getElementById(id);
						if (textArea) {
							RESEnvironment.storage.setRaw(key, textArea.value);
						}
					})
				);
			} else if (command === 'remove') {
				RESEnvironment.storage.delete(key);
				alert('RESStorage[' + escapeHTML(key) + '] deleted');
			} else if (command === 'set') {
				RESEnvironment.storage.setRaw(key, value);
				alert('RESStorage[' + escapeHTML(key) + '] set to:<br><br><textarea rows="5" cols="50">' + escapeHTML(value) + '</textarea>');
			} else {
				return 'You must specify either "get [key]" or "set [key] [value]"';
			}
		}
	};

	var sortTypes = {
		n: 'new',
		t: 'top',
		h: 'hot',
		r: 'rising',
		c: 'controversial',
		g: 'gilded',
		p: 'ads'
	};
	module.registerCommand(/^\/([nthrcgp])?/, '/n, /t, /h, /r, /c, /g, or /p - goes to new, top, hot, rising, controversial, gilded, or promoted sort of current subreddit, multireddit or user page',
		function(command, val, match) {
			return 'sort by ([n]ew, [t]op, [h]ot, [r]ising, [c]ontroversial, [g]ilded, [p]romoted): ' + (match[1] || '');
		},
		function(command, val, match, e) {
			var theInput = sortTypes[match[1]];
			if (theInput) {
				if (RESUtils.currentUserProfile()) {
					// Special-case for user pages since they behave a little differently
					// than subreddits/multireddits.
					if (theInput === 'gilded') {
						navigateTo('/user/' + RESUtils.currentUserProfile() + '/' + theInput, e);
					} else if (theInput === 'ads' || theInput === 'rising') {
						return 'invalid sort command - "' + theInput + '" is not supported on profile pages';
					} else {
						navigateTo('/user/' + RESUtils.currentUserProfile() + '?sort=' + theInput, e);
					}
				} else if (RESUtils.currentSubreddit()) {
					navigateTo('/r/' + RESUtils.currentSubreddit() + '/' + theInput, e);
				} else if (RESUtils.currentMultireddit()) {
					navigateTo('/' + RESUtils.currentMultireddit() + '/' + theInput, e);
				} else {
					navigateTo('/' + theInput, e);
				}
			} else {
				return 'invalid sort command - must be one of [n]ew, [t]op, [h]ot, [r]ising, [c]ontroversial, [g]ilded, [p]romoted';
			}
		}
	);

	module.registerCommand('?', false,
		function() {
			var descriptions = commands.map(function(command) {
				return command.description;
			}).reduce(function(a, b) {
				return b ? a.concat(b) : a;
			}, []);

			if (descriptions.length) {
				return '<ul><li>' + descriptions.join('</li><li>') + '</li></ul>';
			}
		},
		function() {
			return false;
		}
	);
});
