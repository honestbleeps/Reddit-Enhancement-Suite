addModule('commandLine', function(module, moduleID) {
	module.moduleName = 'RES Command Line';
	module.description = "Command line for navigating reddit, toggling RES settings, and debugging RES";
	module.category = 'About RES';
	
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
		this.commandLineForm.addEventListener('submit', module.cmdLineSubmit, false);

		document.body.appendChild(this.commandLineWidget);

	},
	cmdLineHelper: function(val) {
		var splitWords = val.split(' '),
			command = splitWords[0],
			str, srString;
		splitWords.splice(0, 1);
		val = splitWords.join(' ');
		if (command.slice(0, 2) === 'r/') {
			// get the subreddit name they've typed so far (anything after r/)...
			srString = command.slice(2);
			this.cmdLineShowTip('navigate to subreddit: ' + srString);
		} else if (/\/?u\/\w+\/m\//.test(command)) {
			str = 'navigate to multi-reddit: ';
			str += (command.indexOf('/') > 0 ? '/' : '') + command;
			this.cmdLineShowTip(str);
		} else if (command.slice(0, 2) === 'm/') {
			str = 'navigate to multi-reddit: /me/' + command;
			this.cmdLineShowTip(str);
		} else if (command === 'u' || /^\/u\/?/.test(command) || /^\/?u\//.test(command)) {
			// get the user name they've typed so far (anything after u/)...
			var userString = command.replace(/^\/?u\/?/, '');
			if (userString === '') {
				userString = modules['accountSwitcher'].loggedInUser;
			}
			this.cmdLineShowTip('navigate to user profile: ' + userString);
		} else if (/^\/?me\/?/.test(command)) {
			var userString = command.replace(/^\/?me\/?/, '')
			switch (userString) {
				case '':
					// go to current user's page
					this.cmdLineShowTip('navigate to user profile: ' + modules['accountSwitcher'].loggedInUser);
					break;
				case 'saved':
				case 's':
					// go to current user's saved content
					this.cmdLineShowTip('navigate to current user\'s saved content');
					break;
				case 'saved#comments':
				case 'sc':
					// go to current RES's saved comments
					this.cmdLineShowTip('navigate to current RES\'s saved comments');
					break;
				case 'submitted':
				case 'sub':
					// go to current user's submitted content
					this.cmdLineShowTip('navigate to current user\'s submitted content');
					break;
				case 'comments':
				case 'c':
					// go to current user's comments page
					this.cmdLineShowTip('navigate to current user\'s comments');
					break;
				case 'gilded':
				case 'g':
					// go to current user's gilded content
					this.cmdLineShowTip('navigate to current user\'s gilded content');
					break;
				case 'liked':
				case 'l':
					// go to current user's liked content
					this.cmdLineShowTip('navigate to current user\'s liked content');
					break;
				case 'disliked':
				case 'd':
					// go to current user's disliked content
					this.cmdLineShowTip('navigate to current user\'s disliked content');
					break;
				case 'hidden':
				case 'h':
					// go to current user's hidden content
					this.cmdLineShowTip('navigate to current user\'s hidden content');
					break;
				default:
					this.cmdLineShowTip('navigate to [s]aved, [s]aved[c]omments, [sub]mitted, [c]omments, [g]ilded, [l]iked, [d]isliked, [h]idden');
					break;
			}
		} else if (command.slice(0, 1) === '/') {
			srString = command.slice(1);
			this.cmdLineShowTip('sort by ([n]ew, [t]op, [h]ot, [c]ontroversial): ' + srString);
		} else if (command === 'tag') {
			if ((typeof this.cmdLineTagUsername === 'undefined') || (this.cmdLineTagUsername === '')) {
				var searchArea = modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex];
				var authorLink = searchArea.querySelector('a.author');
				this.cmdLineTagUsername = authorLink.innerHTML;
			}
			str = 'tag user ' + this.cmdLineTagUsername;
			if (val) {
				str += ' as: ' + val;
			}
			this.cmdLineShowTip(str);
		} else if (command === 'user') {
			str = 'go to profile';
			if (val) {
				str += ' for: ' + val;
			}
			this.cmdLineShowTip(str);
		} else if (command === 'sw') {
			this.cmdLineShowTip('Switch users to: ' + val);
		} else if (command === 'm') {
			this.cmdLineShowTip('View messages.');
		} else if (command === 'mm') {
			this.cmdLineShowTip('View moderator mail.');
		} else if (command === 'ls') {
			this.cmdLineShowTip('Toggle lightSwitch.');
		} else if (command === 'nsfw') {
			this.cmdLineShowTip('Toggle nsfw filter on or off');
		} else if (command === 'srstyle') {
			str = 'toggle subreddit style';
			if (val) {
				str += ' for: ' + val;
			} else {
				if (RESUtils.currentSubreddit()) {
					str += ' for: ' + RESUtils.currentSubreddit();
				}
			}
			this.cmdLineShowTip(str);
		} else if (command === 'search') {
			this.cmdLineShowTip('Search RES settings for: ' + val);
		} else if (command === 'XHRCache') {
			this.cmdLineShowTip('clear - clear the cache (use if inline images aren\'t loading properly)');
		} else if (command.slice(0, 1) === '?') {
			str = 'Currently supported commands:';
			str += '<ul>';
			str += '<li>r/[subreddit] - navigates to subreddit</li>';
			str += '<li>/n, /t, /h or /c - goes to new, top, hot or controversial sort of current subreddit</li>';
			str += '<li>[number] - navigates to the link with that number (comments pages) or rank (link pages)</li>';
			str += '<li>tag [text] - tags author of currently selected link/comment as text</li>';
			str += '<li>sw [username] - switch users to [username]</li>';
			str += '<li>user [username] or u/[username] - view profile for [username]</li>';
			str += '<li>u/[username]/m/[multi] - view the multireddit [multi] curated by [username]</li>';
			str += '<li>m/[multi] - view your multireddit [multi]';
			str += '<li>m - go to inbox</li>';
			str += '<li>mm - go to moderator mail</li>';
			str += '<li>me - view profile for current user</li>';
			str += '<li>me/saved or me/s - view current user\'s saved links</li>';
			str += '<li>me/saved#comments or me/sc - view current user\'s saved comments</li>';
			str += '<li>me/submitted or me/sub - view current user\'s submitted content</li>';
			str += '<li>me/comments or me/c - view current user\'s comments</li>';
			str += '<li>me/gilded or me/g - view current user\'s gilded content</li>';
			str += '<li>me/liked or me/l - view current user\'s liked content </li>';
			str += '<li>me/disliked or me/d - view current user\'s disliked content</li>';
			str += '<li>me/hidden or me/h - view current user\'s hidden content</li>';
			str += '<li>ls - toggle lightSwitch</li>';
			str += '<li>nsfw [on|off] - toggle nsfw filter on/off</li>';
			str += '<li>srstyle [subreddit] [on|off] - toggle subreddit style on/off (if no subreddit is specified, uses current subreddit)</li>';
			str += '<li>search [words to search for]- search RES settings</li>';
			str += '<li>RESStorage [get|set|update|remove] [key] [value] - For debug use only, you shouldn\'t mess with this unless you know what you\'re doing.</li>';
			str += '<li>XHRCache clear - manipulate the XHR cache </li>';
			str += '</ul>';
			this.cmdLineShowTip(str);
		} else {
			this.cmdLineShowTip('');
		}
	},
	cmdLineShowTip: function(str) {
		$(this.commandLineInputTip).html(str);
	},
	cmdLineShowError: function(str) {
		$(this.commandLineInputError).html(str);
	},
	toggleCmdLine: function(force) {
		if (!(this.isEnabled() && this.isMatchURL())) return;

		var open = ((force == null || force) && (this.commandLineWidget.style.display !== 'block'));
		delete this.cmdLineTagUsername;
		if (open) {
			this.cmdLineShowError('');
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
	cmdLineSubmit: function(e) {
		e.preventDefault();
		$(module.commandLineInputError).html('');
		var theInput = module.commandLineInput.value;
		// see what kind of input it is:
		if (/^\/?r\//.test(theInput)) {
			// subreddit? (r/subreddit or /r/subreddit)
			theInput = theInput.replace(/^\/?r\//, '');
			location.href = '/r/' + theInput;
		} else if (/^\/?m\//.test(theInput)) {
			theInput = theInput.replace(/^\/?m\//, '');
			location.href = '/me/m/' + theInput;
		} else if (theInput === 'u' || /^\/u\/?/.test(theInput) || /^\/?u\//.test(theInput)) {
			// user page? (u/username or /u/username or just u to go to current user's page)
			theInput = theInput.replace(/^\/?u\/?/, '');
			if (theInput !== '') {
				location.href = '/u/' + theInput;
			} else {
				location.href = '/u/' + modules['accountSwitcher'].loggedInUser;
			}
		} else if (/^\/?me\/?/.test(theInput)) {
			theInput = theInput.replace(/^\/?me\/?/, '');
			var currentUser = modules['accountSwitcher'].loggedInUser;
			switch (theInput) {
				case '':
					// go to current user's page
					location.href = '/user/' + currentUser;
					break;
				case 'saved':
				case 's':
					// go to current user's saved content
					location.href = '/user/' + currentUser + '/saved';
					break;
				case 'saved#comments':
				case 'sc':
					// go to current user's saved comments
					location.href = '/user/' + currentUser + '/saved#comments';
					break;
				case 'submitted':
				case 'sub':
					// go to current user's submitted content
					location.href = '/user/' + currentUser + '/submitted';
					break;
				case 'comments':
				case 'c':
					// go to current user's comments page
					location.href = '/user/' + currentUser + '/comments';
					break;
				case 'gilded':
				case 'g':
					// go to current user's gilded content
					location.href = '/user/' + currentUser + '/gilded';
					break;
				case 'liked':
				case 'l':
					// go to current user's liked content
					location.href = '/user/' + currentUser + '/liked';
					break;
				case 'disliked':
				case 'd':
					// go to current user's disliked content
					location.href = '/user/' + currentUser + '/disliked';
					break;
				case 'hidden':
				case 'h':
					// go to current user's hidden content
					location.href = '/user/' + currentUser + '/hidden';
					break;
				default:
					module.cmdLineShowError('unknown command - type ? for help');
					return false;
			}	
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
					location.href = '/user/' + RESUtils.currentUserProfile() + '?sort=' + theInput;
				} else if (RESUtils.currentSubreddit()) {
					location.href = '/r/' + RESUtils.currentSubreddit() + '/' + theInput;
				} else {
					location.href = '/' + theInput;
				}
			} else {
				module.cmdLineShowError('invalid sort command - must be [n]ew, [t]op, [h]ot or [c]ontroversial');
				return false;
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
				case 'tag':
					var tagLink = searchArea.querySelector('a.userTagLink');
					var searchArea = modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex];
					if (tagLink) {
						RESUtils.click(tagLink);
						setTimeout(function() {
							if (val !== '') {
								document.getElementById('userTaggerTag').value = val;
							}
						}, 20);
					}
					break;
				case 'sw':
					// switch accounts (username is required)
					if (val.length <= 1) {
						module.cmdLineShowError('No username specified.');
						return false;
					} else {
						// first make sure the account exists...
						var accounts = modules['accountSwitcher'].options.accounts.value;
						var found = false;
						for (var i = 0, len = accounts.length; i < len; i++) {
							var thisPair = accounts[i];
							if (thisPair[0] == val) {
								found = true;
							}
						}
						if (found) {
							modules['accountSwitcher'].switchTo(val);
						} else {
							module.cmdLineShowError('No such username in accountSwitcher.');
							return false;
						}
					}
					break;
				case 'user':
					// view profile for username (username is required)
					if (val.length <= 1) {
						module.cmdLineShowError('No username specified.');
						return false;
					} else {
						location.href = '/user/' + val;
					}
					break;
				case 'userinfo':
					// view JSON data for username (username is required)
					if (val.length <= 1) {
						module.cmdLineShowError('No username specified.');
						return false;
					} else {
						GM_xmlhttpRequest({
							method: "GET",
							url: location.protocol + "//" + location.hostname + "/user/" + encodeURIComponent(val) + "/about.json?app=res",
							onload: function(response) {
								alert(response.responseText);
							}
						});
					}
					break;
				case 'userbadge':
					// get CSS code for a badge for username (username is required)
					if (val.length <= 1) {
						module.cmdLineShowError('No username specified.');
						return false;
					} else {
						GM_xmlhttpRequest({
							method: "GET",
							url: location.protocol + "//" + location.hostname + "/user/" + val + "/about.json?app=res",
							onload: function(response) {
								var thisResponse = JSON.parse(response.responseText);
								var css = ', .id-t2_' + thisResponse.data.id + ':before';
								alert(css);
							}
						});
					}
					break;
				case 'm':
					// go to inbox
					location.href = '/message/inbox/';
					break;
				case 'mm':
					// go to mod mail
					location.href = '/message/moderator/';
					break;
				case 'ls':
					// toggle lightSwitch
					RESUtils.click(modules['styleTweaks'].lightSwitch);
					break;
				case 'nsfw':
					var toggle;
					switch (val && val.toLowerCase()) {
						case 'on':
							toggle = true;
							break;
						case 'off':
							toggle = false;
							break;
					}
					modules['filteReddit'].toggleNsfwFilter(toggle, true);
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
						module.cmdLineShowError('No subreddit specified.');
						return false;
					}
					if (toggleText === 'on') {
						toggle = true;
					} else if (toggleText === 'off') {
						toggle = false;
					} else {
						module.cmdLineShowError('You must specify "on" or "off".');
						return false;
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
						module.cmdLineShowError('You must specify "get [key]", "update [key]" or "set [key] [value]"');
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
							alert('Value of RESStorage[' + key + ']: <br><br><textarea rows="5" cols="50">' + RESStorage.getItem(key) + '</textarea>');
						} else if (command === 'update') {
							var now = Date.now();
							alert('Value of RESStorage[' + key + ']: <br><br><textarea id="RESStorageUpdate' + now + '" rows="5" cols="50">' + RESStorage.getItem(key) + '</textarea>', function() {
								var textArea = document.getElementById('RESStorageUpdate' + now);
								if (textArea) {
									var value = textArea.value;
									RESStorage.setItem(key, value);
								}
							});
						} else if (command === 'remove') {
							RESStorage.removeItem(key);
							alert('RESStorage[' + key + '] deleted');
						} else if (command === 'set') {
							RESStorage.setItem(key, value);
							alert('RESStorage[' + key + '] set to:<br><br><textarea rows="5" cols="50">' + value + '</textarea>');
						} else {
							module.cmdLineShowError('You must specify either "get [key]" or "set [key] [value]"');
						}
					}
					break;
				case 'XHRCache':
					splitWords = val.split(' ');
					if (splitWords.length < 1) {
						module.cmdLineShowError('Operation required [clear]');
					} else {
						switch (splitWords[0]) {
							case 'clear':
								RESUtils.xhrCache('clear');
								break;
							default:
								module.cmdLineShowError('The only accepted operation is <tt>clear</tt>');
								break;
						}
					}
					break;
				case '?':
					// user is already looking at help... do nothing.
					return false;
				default:
					module.cmdLineShowError('unknown command - type ? for help');
					return false;
			}
		}
		// hide the commandline tool...
		module.toggleCmdLine(false);
	}
	});
});