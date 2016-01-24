addModule('accountSwitcher', function(module, moduleID) {
	module.moduleName = 'Account Switcher';
	module.category = 'My account';
	module.description = 'Store username/password pairs and switch accounts instantly while browsing Reddit!' +
		'\n\n<br><br>If you forget a password which is stored in Account Switcher, <a href="/r/Enhancement/wiki/faq/passwords">you can recover them from RES settings</a>. Be aware that RES offers very little protection for stored passwords, so be careful when sharing your computer or settings!';
	module.options = {
		keepLoggedIn: {
			type: 'boolean',
			value: false,
			description: 'Keep me logged in when I restart my browser.'
		},
		accounts: {
			type: 'table',
			addRowText: '+add account',
			fields: [{
				name: 'username',
				type: 'text'
			}, {
				name: 'password',
				type: 'password'
			}],
			value: [],
			description: 'Set your usernames and passwords below. They are only stored in RES preferences.'
		},
		updateOtherTabs: {
			type: 'boolean',
			description: 'After switching accounts, show a warning in other tabs.',
			value: true,
			advanced: true
		},
		reloadOtherTabs: {
			type: 'boolean',
			description: 'After switching accounts, automatically reload other tabs.',
			value: false,
			advanced: true
		},
		showCurrentUserName: {
			type: 'boolean',
			value: false,
			description: 'Show my current user name in the Account Switcher.',
			advanced: true
		},
		dropDownStyle: {
			type: 'enum',
			values: [{
				name: 'snoo (alien)',
				value: 'alien'
			}, {
				name: 'simple arrow',
				value: 'arrow'
			}],
			value: 'alien',
			description: 'Use the "snoo" icon, or older style dropdown?',
			advanced: true,
			bodyClass: true
		},
		showUserDetails: {
			type: 'boolean',
			value: true,
			description: 'Show details of each account in the Account Switcher, such as karma or gold status.',
			advanced: true
		},
		showKarma: {
			type: 'boolean',
			value: true,
			description: 'Show the link and comment karma of each account in the Account Switcher.',
			advanced: true,
			dependsOn: 'showUserDetails'
		},
		showGold: {
			type: 'boolean',
			value: true,
			description: 'Show the gold status of each account in the Account Switcher.',
			advanced: true,
			dependsOn: 'showUserDetails'
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.userLink = document.querySelector('#header-bottom-right > span.user > a');
			if (this.userLink) {
				this.userLink.style.marginRight = '2px';
				// var downArrowIMG = 'data:image/gif;base64,R0lGODlhBwAEALMAAAcHBwgICAoKChERETs7Ozo6OkJCQg0NDRoaGhAQEAwMDDIyMv///wAAAAAAAAAAACH5BAEAAAwALAAAAAAHAAQAAAQQ0BSykADsDAUwY4kQfOT4RQA7';
				if (this.options.dropDownStyle.value === 'alien') {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"></span>');
				} else {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"><span class="downArrow"></span></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"><span class="downArrow"></span></span>');
				}
				this.downArrowOverlay.on('click', function() {
					toggleAccountMenu(false);
					manageAccounts();
				}).appendTo(document.body);

				this.downArrow.on('click', function() {
					updateUserDetails();
					toggleAccountMenu(true);
				});

				$(this.userLink).after(this.downArrow);

				this.accountMenu = $('<ul id="RESAccountSwitcherDropdown" class="RESDropdownList"></ul>');

				var dropdownTimer;
				this.accountMenu.add(this.downArrowOverlay)
					.on('mouseenter', function() {
						clearTimeout(dropdownTimer);
					})
					.on('mouseleave', function() {
						dropdownTimer = setTimeout(function() {
							toggleAccountMenu(false);
						}, 1000);
					});

				this.accountMenu.on('click', '.accountName', function(e) {
					e.preventDefault();
					switchTo($.data(this, 'username'));
				});
				this.accountMenu.on('click', '.addAccount', function(e) {
					e.preventDefault();
					toggleAccountMenu(false);
					manageAccounts();
				});
				// RESUtils.addStyle(css);
				var accounts = this.options.accounts.value;
				if (accounts !== null) {
					var accountCount = 0;
					var loggedInUser = RESUtils.loggedInUser();
					accounts.forEach(function(account) {
						var username = account[0];
						if (!loggedInUser || username.toUpperCase() !== loggedInUser.toUpperCase() || this.options.showCurrentUserName.value) {
							accountCount++;
							var $accountLink = $('<li>', {
								'class': 'accountName'
							});
							// Check if user is logged in before comparing
							if (loggedInUser && username.toUpperCase() === loggedInUser.toUpperCase()) {
								$accountLink.addClass('active');
							}

							$accountLink.data('username', username)
								.appendTo(this.accountMenu);
						}
					}, this);

					if (accountCount) {
						populateUsers();
						updateUserDetails(false);
					}

					$('<li>', {
						'class': 'addAccount'
					})
						.text('+ add account')
						.appendTo(this.accountMenu);
				}

				$(document.body).append(this.accountMenu);
			}


			modules['commandLine'].registerCommand(/^sw$/, 'sw [username] - switch users to [username]',
				function(command, val, match) {
					var found = findMatchingAccount(val, true);
					if (val && found) {
						return 'Switch to username: ' + found[0];
					} else {
						return 'Switch to username: ...';
					}
				},
				function(command, val, match, e) {
					if (!val.length) {
						return 'No username specified.';
					}

					var found = findMatchingAccount(val, true);

					if (found) {
						switchTo(found[0]);
					} else {
						manageAccounts();
					}
				}
			);
		}
	};

	function populateUsers() {
		module.accountMenu.find('.accountName')
			.each(function(index, ele) { populateUser(ele); });
	}

	function updateUser(username) {
		module.accountMenu.find('.accountName')
			.filter(function() {
				var thisUsername = $(this).data('username');
				return username === thisUsername;
			})
			.each(function(index, ele) { populateUser(ele); });
	}

	var _userInfo = {};

	function populateUser(container) {
		var username = $(container).data('username');

		// Ignore "+ add account"
		if (typeof username === 'undefined') {
			return;
		}
		var userInfo = _userInfo[username] || {};

		var contents = document.createDocumentFragment();
		contents.appendChild(document.createTextNode(username));

		// Display the karma of the user
		if (typeof userInfo.link_karma !== 'undefined' && module.options.showKarma.value) {
			var karma = $('<span>').safeHtml('(' + userInfo.link_karma + ' &middot; ' + userInfo.comment_karma + ')');
			karma.appendTo(contents);
		}

		if (userInfo.is_gold && module.options.showGold.value) {
			// If the user has gold display the icon and set the title text to the time remaining till it expires

			var gilded = RESUtils.createElement('span', null, 'gilded-icon');
			if (userInfo.gold_expiration) {
				var today = new Date();
				var expDate = new Date(userInfo.gold_expiration * 1000); // s -> ms
				gilded.title = 'Until ' + expDate.toDateString() + ' (' + RESUtils.niceDateDiff(today, expDate) + ')';
			}

			contents.appendChild(gilded);
		}

		$(container).empty().append(contents);
	}

	function updateUserDetails(live) {
		if (!module.options.showUserDetails.value) return;
		var accounts = module.options.accounts.value;
		if (!accounts) {
			return;
		}

		accounts.forEach(function(account, index) {
			var username = account[0];
			if (_userInfo[username]) return;

			// Respect API burstiness: space out requests
			setTimeout(RESUtils.getUserInfo, 500 * index, addDetails, username, live);
			function addDetails(response) {
				// Fail if retrieving the user's info results in an error (such as a 404)
				if (!response || response.error || !response.data) {
					return;
				}

				_userInfo[username] = response.data;
				updateUser(username);
			}
		});
	}

	function toggleAccountMenu(open) {
		if (open) {
			var thisHeight = 18,
				thisX, thisY;
			if (module.accountMenu.css('position') !== 'fixed') {
				thisX = $(module.userLink).offset().left;
				thisY = $(module.userLink).offset().top;
			} else {
				thisX = $('#header-bottom-right').position().left + $(module.userLink).position().left;
				thisY = $(module.userLink).position().top;
				if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
					thisHeight += $('#sr-header-area').height();
				} else if (modules['betteReddit'].options.pinHeader.value === 'header') {
					thisHeight += $('#sr-header-area').height();
				}
			}
			$(module.accountMenu).css({
				top: (thisY + thisHeight) + 'px',
				left: (thisX) + 'px'
			});
			$(module.accountMenu).show();
			thisX = $(module.downArrow).offset().left;
			thisY = $(module.downArrow).offset().top;
			$(module.downArrowOverlay).css({
				top: (thisY - 4) + 'px',
				left: (thisX - 3) + 'px'
			});

			$(module.downArrowOverlay).show();
			modules['styleTweaks'].setSRStyleToggleVisibility(false, 'accountSwitcher');

		} else {
			$(module.accountMenu).hide();
			$(module.downArrowOverlay).hide();
			modules['styleTweaks'].setSRStyleToggleVisibility(true, 'accountSwitcher');
		}
	}

	module.closeAccountMenu = function() {
		// this function basically just exists for other modules to call.
		if (!this.accountMenu) return;
		$(this.accountMenu).hide();
	};

	function findMatchingAccount(username, partialMatch) {
		var accounts = module.options.accounts.value;
		var matched = accounts.find(function(account) {
			return account[0].toUpperCase() === username.toUpperCase();
		});

		if (matched || !partialMatch) {
			return matched;
		}

		return accounts.find(function(account) {
			return account[0].toUpperCase().indexOf(username.toUpperCase()) === 0;
		});
	}

	function switchTo(username) {
		var account = findMatchingAccount(username);
		if (!account) return;
		username = account[0];
		var password = account[1];
		var rem = '';
		if (module.options.keepLoggedIn.value) {
			rem = '&rem=on';
		}

		var loginUrl = 'https://' + location.hostname + '/api/login';

		// Remove old session cookie (reddit_session)
		// in FF we also need to remove this (secure_session), but it should be safe to remove either way.
		RESEnvironment.deleteCookies(['reddit_session', 'secure_session'], function() {
			RESEnvironment.ajax({
				method: 'POST',
				url: loginUrl,
				isLogin: true,
				data: 'user=' + encodeURIComponent(username) + '&passwd=' + encodeURIComponent(password) + rem,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				onload: function(response) {
					var badData = false;
					try {
						JSON.parse(response.responseText);
					} catch (error) {
						badData = true;
						console.log(error);
						console.log(response.responseText);
					}

					var wrongAuthDetails = /WRONG_PASSWORD/;
					var rateLimit = /RATELIMIT/;
					if (badData) {
						modules['notifications'].showNotification({
							type: 'error',
							moduleID: 'accountSwitcher',
							message: 'Could not switch accounts. Reddit may be under heavy load. Please try again in a few moments.'
						});
					} else if (wrongAuthDetails.test(response.responseText)) {
						alert('Could not log in as <b>' + username + '</b> because either the username or password is wrong. ' +
							'<p>Check your settings?</p>',
							manageAccounts);
						switchedAccount(false);
					} else if (rateLimit.test(response.responseText)) {
						alert('Could not log in as <b>' + username + '</b> because reddit is seeing too many requests from you too quickly. Perhaps you\'ve been trying to log in using the wrong username or password?' +
						'<p>Check your settings?</p>',
							manageAccounts);
						switchedAccount(false);
					} else {
						switchedAccount(username);
					}
				}
			});
		});
	}

	function switchedAccount(username) {
		if (module.options.updateOtherTabs.value) {
			RESEnvironment.sendMessage({
				requestType: 'multicast',
				moduleID: 'accountSwitcher',
				method: 'switchedAccountElsewhere',
				arguments: [ username ]
			});
		}
		if (username) {
			location.reload();
		}
	}

	var _usernameElsewhere;
	module.switchedAccountElsewhere = switchedAccountElsewhere;
	function switchedAccountElsewhere(username) {
		var setup = (_usernameElsewhere === undefined);
		_usernameElsewhere = username;
		if (setup) {
			window.addEventListener('focus', _onFocus);
		}
	}

	function _onFocus() {
		var currentUsername = (RESUtils.loggedInUser() || '').toLowerCase();
		if (currentUsername === _usernameElsewhere) {
			_usernameElsewhere = undefined;
			window.removeEventListener('focus', _onFocus);
			return;
		}
		_switchedAccountElsewhere();
	}

	function _switchedAccountElsewhere() {
		var username, hasDraft, switchedMessage, reloadMessage, message;
		username = _usernameElsewhere;

		hasDraft = Array.prototype.slice.call(document.querySelectorAll('textarea'))
			.some(function(textarea) {
				return textarea.value;
			});

		if (!hasDraft && module.options.reloadOtherTabs.value) {
			location.reload();
			return;
		}

		switchedMessage = username ?
			'You switched to /u/' + username + '.' :
			'You have been logged out.';
		reloadMessage = hasDraft ?
			'However, you haven\'t finished posting on this page as /u/' + RESUtils.loggedInUser() + '. Do you want to reload the page anyway?' :
			'Reload this page now?';
		message = [ switchedMessage, reloadMessage ].join('\n');
		alert(message, location.reload.bind(location));
	}

	function manageAccounts() {
		modules['settingsNavigation'].loadSettingsPage('accountSwitcher', 'accounts');
	}
});
