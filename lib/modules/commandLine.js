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

	$.extend(module, {
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS(' \
				#keyCommandLineWidget { font-size: 14px; display: none; position: fixed; top: 30px; left: 50%; margin-left: -275px; z-index: 100000110; width: 550px; border: 3px solid #555; border-radius: 10px; padding: 10px; background-color: #333; color: #CCC; opacity: 0.95; } \
				#keyCommandInput { width: 240px; background-color: #999; margin-right: 10px; } \
				#keyCommandInputTip { margin-top: 5px; color: #9F9; } \
				#keyCommandInputTip ul { font-size: 11px; list-style-type: disc; }  \
				#keyCommandInputTip li { margin-left: 15px; }  \
				#keyCommandInputError { margin-top: 5px; color: red; font-weight: bold; } \
				');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.attachCommandLineWidget();

			if (module.options.menuItem.value) {
				this.addMenuItem();
			}

			if (module.options.launchFromMenuButton.value) {
				this.addMenuButtonHandler();
			}
		}
	},

	addMenuItem: function() {
		var menuItem = RESUtils.createElement('div', null, null, 'command line');
		var button = RESUtils.createElement('span', null, 'RESMenuItemButton res-icon', '\uF060');
		menuItem.appendChild(button);


		modules['RESMenu'].addMenuItem(menuItem, module._onClickMenu);
	},

	addMenuButtonHandler: function() {
		modules['RESMenu'].onClickMenuButton(module._onClickMenu);
	},

	_onClickMenu: function (e) {
		modules['RESMenu'].hidePrefsDropdown();
		modules['commandLine'].toggleCmdLine(true);
	},

	attachCommandLineWidget: function() {
		RESTemplates.load('commandLine', module._attachCommandLineWidget.bind(module));
	},
	_attachCommandLineWidget: function (template) {
		var widget = template.html();

		this.commandLineWidget = widget[0];

		this.commandLineWidget.style.display = 'none';

		this.commandLineInput = widget.find('#keyCommandInput')[0];

		this.commandLineInput.setAttribute('autocomplete','off');

		this.commandLineInput.addEventListener('blur', function(e) {
			if (!module.commandLineInput.value.length) {
				module.toggleCmdLine(false);
			} else {
				module.cmdLineShowError('click into the text input and press escape to close the command line');
			}
		}, false);
		this.commandLineInput.addEventListener('keyup', function(e) {
			if (e.keyCode === 27) {
				// close prompt.
				module.toggleCmdLine(false);
			} else {
				// auto suggest?
				module.cmdLineHelper(e.target.value);
			}
		}, false);
		this.commandLineInputTip = widget.find('#keyCommandInputTip')[0];
		this.commandLineInputError = widget.find('#keyCommandInputError')[0];

		this.commandLineForm = widget.find('#keyCommandForm')[0];
		this.commandLineForm.addEventListener('keydown', function(e) {
			if (e.keyCode === 13) {
				modules['commandLine'].cmdLineSubmit(e);
			}
		}, false);

		document.body.appendChild(this.commandLineWidget);

	},
	cmdLineShowTip: function(str) {
		if (str === false) {
			$(this.commandLineInputTip).empty();
		} else {
			$(this.commandLineInputTip).safeHtml(str);
		}
	},
	cmdLineShowError: function(str) {
		if (str === false) {
			$(this.commandLineInputError).empty();
		} else {
			$(this.commandLineInputError).safeHtml(str);
		}
	},
	toggleCmdLine: function(force) {
		if (!(this.isEnabled() && this.isMatchURL())) return;

		var open = ((force === undefined || force) && this.commandLineWidget.style.display !== 'block');
		delete this.cmdLineTagUsername;
		if (open) {
			this.cmdLineShowError(false);
			this.cmdLineShowTip(false);
			this.commandLineWidget.style.display = 'block';
			setTimeout(function() {
				module.commandLineInput.focus();
			}, 20);
			this.commandLineInput.value = '';
		} else {
			module.commandLineInput.blur();
			this.commandLineWidget.style.display = 'none';
		}
	},
	cmdLineHelper: function(val) {
		var splitWords = val.split(' '),
			command = splitWords[0];
		splitWords.splice(0, 1);
		val = splitWords.join(' ');
		var tip = getTip(command, val);
		this.cmdLineShowTip(tip);
		if (tip) {
			this.cmdLineShowError(false);
		}
	},
	cmdLineSubmit: function(e) {
		e.preventDefault();
		$(module.commandLineInputError).html('');

		var val = module.commandLineInput.value;

		var splitWords = val.split(' '),
			command = splitWords[0];
		splitWords.splice(0, 1);
		val = splitWords.join(' ');

		var error = executeCommand(command, val, e);
		if (error) {
			this.cmdLineShowError(error);
		} else if (error !== false) {
			// hide the commandline tool...
			module.toggleCmdLine(false);
		}
	},
	navigateTo: function(url, e) {
		if (e.shiftKey) {
			if (e.altKey) { // background tab
				RESEnvironment.openLinkInNewTab(url);
			} else { // new tab
				RESEnvironment.openInNewWindow(url);
			}
		} else {
			location.href = url;
		}
	}
	});

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
		var result;
		commands.some(function(commandSpec) {
			var predicateResult;
			if (commandSpec.commandPredicate.exec) {
				predicateResult = commandSpec.commandPredicate.exec(command);
			} else if (typeof commandSpec.commandPredicate === 'string') {
				predicateResult = commandSpec.commandPredicate === command;
			} else if (typeof commandSpec.commandPredicate === 'function') {
				predicateResult = commandSpec.commandPredicate(command, val);
			}
			if (predicateResult) {
				result = {};
				for (var key in commandSpec) {
					if (!commandSpec.hasOwnProperty(key)) continue;
					result[key] = commandSpec[key];
				}

				result.predicateResult = predicateResult;
				return result;
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
			modules['commandLine'].navigateTo('/r/' + match[1], e);
		}
	);

	module.registerCommand(/^\/?m\/(.*)/, 'm/[multi] - view your multi-reddit [multi]',
		function(command, val, match) {
			return 'navigate to multi-reddit: /me/m/' + match[1];
		}, function(command, val, match, e) {
			modules['commandLine'].navigateTo('/me/m/' + match[1], e);
		}
	);

	module.registerCommand('m', 'm - go to inbox',
		function() {
			return 'View messages';
		}, function(command, value, match, e) {
			modules['commandLine'].navigateTo('/message/inbox/', e);
		}
	);

	module.registerCommand('mm', 'mm - go to moderator mail',
		function() {
			return 'View moderator mail';
		}, function(command, value, match, e) {
			modules['commandLine'].navigateTo('/message/moderator/', e);
		}
	);

	module.registerCommand(/^XHR/, 'XHRCache clear - manipulate the XHR cache',
		function(command, value, match) {
			return 'clear - clear the cache (use if inline images aren\'t loading properly)';
		}, function(command, value, match, e) {
			if (/^\s*$/.test(value)) {
				return 'Operation required [clear]';
			}

			switch (value) {
				case 'clear':
					RESUtils.xhrCache('clear');
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
			modules['commandLine'].navigateTo('/u/' + val, e);
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
			modules['commandLine'].navigateTo('/u/' + match[1] + '/m/' + match[2], e);
		}
	);

	module.registerCommand(/^\/?me(?:\/?(.*))$/, [
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
		function (command, val, match) {
			if (!RESUtils.loggedInUser()) {
				return 'not logged in';
			}
			var str;
			switch (match[1]) {
				case '':
					// go to current user's page
					str = 'navigate to user profile: ' + RESUtils.loggedInUser();
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
		function (command, val, match, e) {
			var currentUser = RESUtils.loggedInUser();
			if (!currentUser) {
				return 'not logged in';
			}
			switch (match[1]) {
				case '':
					// go to current user's page
					modules['commandLine'].navigateTo('/user/' + currentUser, e);
					break;
				case 'saved':
				case 's':
					// go to current user's saved content
					modules['commandLine'].navigateTo('/user/' + currentUser + '/saved', e);
					break;
				case 'saved#comments':
				case 'sc':
					// go to current user's saved comments
					modules['commandLine'].navigateTo('/user/' + currentUser + '/saved#comments', e);
					break;
				case 'submitted':
				case 'sub':
					// go to current user's submitted content
					modules['commandLine'].navigateTo('/user/' + currentUser + '/submitted', e);
					break;
				case 'comments':
				case 'c':
					// go to current user's comments page
					modules['commandLine'].navigateTo('/user/' + currentUser + '/comments', e);
					break;
				case 'gilded':
				case 'g':
					// go to current user's gilded content
					modules['commandLine'].navigateTo('/user/' + currentUser + '/gilded', e);
					break;
				case 'liked':
				case 'l':
					// go to current user's liked content
					modules['commandLine'].navigateTo('/user/' + currentUser + '/liked', e);
					break;
				case 'disliked':
				case 'd':
					// go to current user's disliked content
					modules['commandLine'].navigateTo('/user/' + currentUser + '/disliked', e);
					break;
				case 'hidden':
				case 'h':
					// go to current user's hidden content
					modules['commandLine'].navigateTo('/user/' + currentUser + '/hidden', e);
					break;
				default:
					return 'unknown command - type ? for help';
			}
		}
	);

	module.registerCommand('userinfo', false,
		function() { },
		function (command, val, match, e) {
			// view JSON data for username (username is required)
			if (val.length <= 1) {
				return 'No username specified.';
			} else {
				RESEnvironment.ajax({
					method: 'GET',
					url: location.protocol + '//' + location.hostname + '/user/' + encodeURIComponent(val) + '/about.json?app=res',
					onload: function(response) {
						alert(response.responseText);
					}
				});
			}
		}
	);

	module.registerCommand('userbadge', false,
		function() { },
		function(command, val, match, e) {
			// get CSS code for a badge for username (username is required)
			if (val.length <= 1) {
				return 'No username specified.';
			} else {
				RESEnvironment.ajax({
					method: 'GET',
					url: location.protocol + '//' + location.hostname + '/user/' + val + '/about.json?app=res',
					onload: function(response) {
						var thisResponse = JSON.parse(response.responseText);
						var css = ', .id-t2_' + thisResponse.data.id + ':before';
						alert(css);
					}
				});
			}
		}
	);

	module.registerCommand(/(?:RES)?stor(?:e|age)?/i, 'RESStorage [get|set|update|remove] [key] [value] - For debug use only, you shouldn\'t mess with this unless you know what you\'re doing.',
		function(command, value, match) { },
		function(command, val, match, e) {
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
				alert('Value of RESStorage[' + escapeHTML(key) + ']: <br><br><textarea rows="5" cols="50">' + escapeHTML(RESStorage.getItem(key)) + '</textarea>');
			} else if (command === 'update') {
				var now = Date.now();
				alert('Value of RESStorage[' + escapeHTML(key) + ']: <br><br><textarea id="RESStorageUpdate' + now + '" rows="5" cols="50">' + escapeHTML(RESStorage.getItem(key)) + '</textarea>', function() {
					var textArea = document.getElementById('RESStorageUpdate' + now);
					if (textArea) {
						var value = textArea.value;
						RESStorage.setItem(key, value);
					}
				});
			} else if (command === 'remove') {
				RESStorage.removeItem(key);
				alert('RESStorage[' + escapeHTML(key) + '] deleted');
			} else if (command === 'set') {
				RESStorage.setItem(key, value);
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
						modules['commandLine'].navigateTo('/user/' + RESUtils.currentUserProfile() + '/' + theInput, e);
					} else if (theInput === 'ads' || theInput === 'rising') {
						return 'invalid sort command - "' + theInput + '" is not supported on profile pages';
					} else {
						modules['commandLine'].navigateTo('/user/' + RESUtils.currentUserProfile() + '?sort=' + theInput, e);
					}
				} else if (RESUtils.currentSubreddit()) {
					modules['commandLine'].navigateTo('/r/' + RESUtils.currentSubreddit() + '/' + theInput, e);
				} else if (RESUtils.currentMultireddit()) {
					modules['commandLine'].navigateTo('/' + RESUtils.currentMultireddit() + '/' + theInput, e);
				} else {
					modules['commandLine'].navigateTo('/' + theInput, e);
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
					return b ? a.concat(b) :a;
				}, []);

			if (descriptions.length) {
				return '<ul><li>' + descriptions.join('</li><li>') + '</li></ul>';
			}
		},
		function () {
			return false;
		}
	);
});
