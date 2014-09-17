addModule('commandLine', function(module, moduleID) {
	module.moduleName = 'RES Command Line';
	module.description = 'Command line for navigating reddit, toggling RES settings, and debugging RES';
	module.category = 'About RES';
	module.options.launch = {
		type: 'button',
		text: 'Launch',
		description: 'Open the RES Command Line',
		callback: function() { module.toggleCmdLine(true); }
	};

	$.extend(module, {
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS(' \
				#keyCommandLineWidget { font-size: 14px; display: none; position: fixed; top: 200px; left: 50%; margin-left: -275px; z-index: 100000110; width: 550px; border: 3px solid #555; border-radius: 10px; padding: 10px; background-color: #333; color: #CCC; opacity: 0.95; } \
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
		}
	},

	attachCommandLineWidget: function() {
		RESTemplates.load('commandLine', module._attachCommandLineWidget.bind(module));
	},
	_attachCommandLineWidget: function (template) {
		var widget = template.html();

		this.commandLineWidget = widget[0];

		this.commandLineWidget.style.display = 'none';

		this.commandLineInput = widget.find('#keyCommandInput')[0];
		this.commandLineInput.addEventListener('blur', function(e) {
			module.toggleCmdLine(false);
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

		var open = ((force == null || force) && (this.commandLineWidget.style.display !== 'block'));
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
		modules['styleTweaks'].setSRStyleToggleVisibility(!open, 'cmdline');
	},
	cmdLineHelper: function(val) {
		var splitWords = val.split(' '),
			command = splitWords[0],
			str, srString;
		splitWords.splice(0, 1);
		val = splitWords.join(' ');
		var tip = getTip(command, val);
		this.cmdLineShowTip(tip);
	},
	cmdLineSubmit: function(e) {
		e.preventDefault();
		$(module.commandLineInputError).html('');

		var val = module.commandLineInput.value;

		var splitWords = val.split(' '),
			command = splitWords[0],
			str, srString;
		splitWords.splice(0, 1);
		val = splitWords.join(' ');

		var error = executeCommand(command, val, e);
		if (error) {
			this.cmdLineShowError(error)
		} else if (error !== false) {
			// hide the commandline tool...
			module.toggleCmdLine(false);
		}
	},
	navigateTo: function(url, e) {
		if (e.shiftKey) {
			if (e.altKey) { // background tab
				BrowserStrategy.openLinkInNewTab(url);
			} else { // new tab
				BrowserStrategy.openInNewWindow(url);
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
	}

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
		var str;
		var matchingCommandSpec = getCommandSpec(command, val);
		if (matchingCommandSpec) {
			str = matchingCommandSpec.getTip(command, val, matchingCommandSpec.predicateResult);

		} else if (command.slice(0, 1) === '/') {
			srString = command.slice(1);
			str = 'sort by ([n]ew, [t]op, [h]ot, [c]ontroversial): ' + srString;
		} else if (command === 'srstyle') {
			str = 'toggle subreddit style';
			if (val) {
				str += ' for: ' + escapeHTML(val);
			} else {
				if (RESUtils.currentSubreddit()) {
					str += ' for: ' + RESUtils.currentSubreddit();
				}
			}
		} else if (command === 'search') {
			str = 'Search RES settings for: ' + escapeHTML(val);
		} else if (command.slice(0, 1) === '?') {
			str = 'Currently supported commands:';
			str += '<ul>';
			var descriptions = $.map(commands, function(command) {
				return command.description;
			});
			for (var i = 0, len = descriptions.length; i < len; i++) {
				if (descriptions[i]) {
					str += '<li>' + descriptions[i] + '</li>';
				}
			}
			str += '<li>/n, /t, /h or /c - goes to new, top, hot or controversial sort of current subreddit</li>';
			str += '<li>[number] - navigates to the link with that number (comments pages) or rank (link pages)</li>';
			str += '<li>srstyle [subreddit] [on|off] - toggle subreddit style on/off (if no subreddit is specified, uses current subreddit)</li>';
			str += '<li>search [words to search for]- search RES settings</li>';
			str += '<li>RESStorage [get|set|update|remove] [key] [value] - For debug use only, you shouldn\'t mess with this unless you know what you\'re doing.</li>';
			str += '</ul>';
			str = str;
		} else {
			str = false;
		}

		return str;
	}

	function executeCommand(command, value, event) {
		// see what kind of input it is:
		var matchingCommandSpec = getCommandSpec(command, value);
		if (matchingCommandSpec) {
			var result = matchingCommandSpec.executeCommand(command, value, matchingCommandSpec.predicateResult, event);
			return result;
		}

		var theInput = command;
		if (value.length) {
			theInput += ' ' + value;
		}

		if (/^\/?me\/?/.test(theInput)) {
			theInput = theInput.replace(/^\/?me\/?/, '');
			v
		} else if (theInput.indexOf('/') === 0) {
			// sort...
			theInput = theInput.slice(1);
			switch (theInput) {
				case 'n':
					theInput = 'new';
					break;
				case 't':
					theInput = 'top';
					break;
				case 'h':
					theInput = 'hot';
					break;
				case 'c':
					theInput = 'controversial';
					break;
			}
			validSorts = ['new', 'top', 'hot', 'controversial'];
			if (validSorts.indexOf(theInput) !== -1) {
				if (RESUtils.currentUserProfile()) {
					modules['commandLine'].navigateTo('/user/' + RESUtils.currentUserProfile() + '?sort=' + theInput, e);
				} else if (RESUtils.currentSubreddit()) {
					modules['commandLine'].navigateTo('/r/' + RESUtils.currentSubreddit() + '/' + theInput, e);
				} else {
					modules['commandLine'].navigateTo('/' + theInput, e);
				}
			} else {
				return 'invalid sort command - must be [n]ew, [t]op, [h]ot or [c]ontroversial';
			}
		} else if (!(isNaN(parseInt(theInput, 10)))) {
			if (RESUtils.pageType() === 'comments') {
				// comment link number? (integer)
				modules['keyboardNav'].commentLink(parseInt(theInput, 10) - 1);
			} else if (RESUtils.pageType() === 'linklist') {
				modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
				modules['keyboardNav'].activeIndex = parseInt(theInput, 10) - 1;
				modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
				modules['keyboardNav'].followLink();
			}
		} else {
			var splitWords = theInput.split(' ');
			var command = splitWords[0];
			splitWords.splice(0, 1);
			var val = splitWords.join(' ');
			switch (command) {
				case 'userinfo':
					// view JSON data for username (username is required)
					if (val.length <= 1) {
						return 'No username specified.';
					} else {
						BrowserStrategy.ajax({
							method: 'GET',
							url: location.protocol + '//' + location.hostname + '/user/' + encodeURIComponent(val) + '/about.json?app=res',
							onload: function(response) {
								alert(response.responseText);
							}
						});
					}
					break;
				case 'userbadge':
					// get CSS code for a badge for username (username is required)
					if (val.length <= 1) {
						return 'No username specified.';
					} else {
						BrowserStrategy.ajax({
							method: 'GET',
							url: location.protocol + '//' + location.hostname + '/user/' + val + '/about.json?app=res',
							onload: function(response) {
								var thisResponse = JSON.parse(response.responseText);
								var css = ', .id-t2_' + thisResponse.data.id + ':before';
								alert(css);
							}
						});
					}
					break;
				case 'srstyle':
					// toggle subreddit style
					var sr;
					var toggleText;
					splitWords = val.split(' ');
					if (splitWords.length === 2) {
						sr = splitWords[0];
						toggleText = splitWords[1];
					} else {
						sr = RESUtils.currentSubreddit();
						toggleText = splitWords[0];
					}
					if (!sr) {
						return 'No subreddit specified.';
					}
					if (toggleText === 'on') {
						toggle = true;
					} else if (toggleText === 'off') {
						toggle = false;
					} else {
						return 'You must specify "on" or "off".';
					}
					var action = (toggle) ? 'enabled' : 'disabled';
					modules['styleTweaks'].toggleSubredditStyle(toggle, sr);
					modules['notifications'].showNotification({
						header: 'Subreddit Style',
						moduleID: 'styleTweaks',
						message: 'Subreddit style ' + action + ' for subreddit: ' + sr
					}, 4000);
					break;
				case 'notification':
					// test notification
					modules['notifications'].showNotification(val, 4000);
					break;
				case 'search':
					modules['search'].search(val);
					break;
				case 'RESStorage':
					// get or set RESStorage data
					splitWords = val.split(' ');
					if (splitWords.length < 2) {
						return 'You must specify "get [key]", "update [key]" or "set [key] [value]"';
					} else {
						var command = splitWords[0],
							key = splitWords[1],
							value;
						if (splitWords.length > 2) {
							splitWords.splice(0, 2);
							value = splitWords.join(' ');
						}
						// console.log(command);
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
					break;
				case '?':
					// user is already looking at help... do nothing.
					return false;
				default:
					return 'unknown command - type ? for help';
			}
		}
	}

	module.registerCommand(/^\/?r\/(.*)/, "r/[subreddit] - navigates to subreddit",
		function(command, val, match) {
			return 'navigate to subreddit: ' + match[1];
		}, function(command, val, match, e) {
			modules['commandLine'].navigateTo('/r/' + match[1], e);
		}
	);

	module.registerCommand(/^\/?m\/(.*)/, 'm/[multi] - view your multi-reddit [multi]',
		function(command, val, match) {
			return str = 'navigate to multi-reddit: /me/m/' + match[1];
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

	module.registerCommand(/^mm$/, 'mm - go to moderator mail',
		function() {
			return 'View moderator mail';
		}, function(command, value, match, e) {
			modules['commandLine'].navigateTo('/message/moderator/', e);
		}
	);

	module.registerCommand(/^(ls|ns)$/, 'ns - toggle nightSwitch',
		function(command, val, match) {
			if (match[1] === 'ls') {
				return 'Toggle nightSwitch (deprecated, use "ns" instead).';
			} else {
				return "Toggle nightSwitch";
			}

		}, function(command, value, match, e) {
			RESUtils.click(modules['nightMode'].nightSwitch);
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
					break;
			}
		}
	);


	module.registerCommand(/^nsfw$/, 'nsfw [on|off] - toggle nsfw filter on/off',
		function(command, val, match) {
			return 'Toggle nsfw filter on or off';
		}, function(command, val, match, e) {
			var toggle;
			switch (val && val.toLowerCase()) {
				case 'on':
					toggle = true;
					break;
				case 'off':
					toggle = false;
					break;
				default:
					return 'nsfw on &nbsp; or &nbsp; nsfw off ?';
					break;
			}
			modules['filteReddit'].toggleNsfwFilter(toggle, true);
		}
	);

	module.registerCommand(/^user$|^u$|^\/?u(?:ser)?\/(\w*((?!\/m\/).)*)$/, 'user [username] or u/[username] - view profile for [username]',
		function (command, val, match) {
			val = RESUtils.firstValid(val || undefined, match[1] || undefined, false);
			if (val === false && RESUtils.loggedInUser()) {
				return 'go to profile';
			} else if (val === false) {
				return false;
			} else {
				return 'go to profile for: ' + val;
			}
		},
		function (command, val, match, e) {
			val = RESUtils.firstValid(val || undefined, match[1] || undefined, RESUtils.loggedInUser(), false);
			if (val === false) {
				return 'not logged in';
			}
			modules['commandLine'].navigateTo('/u/' + val, e);
		}
	);

	module.registerCommand(/^\/?u(?:ser)?\/(\w+)\/m(?:\/(.+))?/, 'u/[username]/m/[multi] - view the multireddit [multi] curated by [username]',
		function (command, val, match) {
			return 'navigate to multi-reddit: /u/' + match[1] + '/m/' + (match[2] || '');
		},
		function (command, val, match, e) {
			if (!match[1]) {
				return "no multi-reddit specified";
			}
			modules['commandLine'].navigateTo('/u/' + match[1] + '/m/' + match[2], e);
		}
	);

	module.registerCommand(/^sw$/, 'sw [username] - switch users to [username]',
		function (command, val, match) {
			if (val) {
				return 'Switch to username: ' + val;
			}
		},
		function (command, val, match, e) {
			if (!val.length) {
				return 'No username specified.';
			}

			var found = modules['accountSwitcher'].options.accounts.value.some(function(account) {
				return account[0] === val;
			});
			if (found) {
				modules['accountSwitcher'].switchTo(val);
			} else {
				return 'No such username in accountSwitcher.';
			}
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
				return "not logged in";
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
		function (command, val, match, e) {
			if (!RESUtils.loggedInUser()) {
				return "not logged in";
			}
			var currentUser = modules['accountSwitcher'].loggedInUser;
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

	module.registerCommand(/^tag$/, 'tag [text] - tags author of currently selected link/comment as text',
		function (command, val, match) {
			var tagLink = getAuthorTagLink();
			if (tagLink) {
				var str = 'tag user ' + tagLink.getAttribute('username');
				if (val) {
					str += ' as: ' + val;
				}
				return str;
			} else {
				return 'can\'t set tag - no post/comment selected';
			}
		},
		function (command, val, match, e) {
			var tagLink = getAuthorTagLink();
			if (tagLink) {
				RESUtils.click(tagLink);
				setTimeout(function() {
					if (val !== '') {
						document.getElementById('userTaggerTag').value = val;
					}
				}, 20);
			} else {
				return 'can\'t set tag - no post/comment selected';
			}
		}
	);

	function getAuthorTagLink() {
		var searchArea = modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex];
		if (!searchArea) {
			searchArea = document.body;
		}
		var tagLink = searchArea.querySelector('a.userTagLink');
		return tagLink;
	}
});
