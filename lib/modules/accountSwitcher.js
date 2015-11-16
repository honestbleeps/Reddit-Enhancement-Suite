addModule('accountSwitcher', {
	moduleID: 'accountSwitcher',
	moduleName: 'Account Switcher',
	category: 'Users',
	options: {
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
			value: [
				/*
				['somebodymakethis','SMT','[SMT]'],
				['pics','pic','[pic]']
				*/
			],
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
	},
	description: 'Store username/password pairs and switch accounts instantly while browsing Reddit!' +
				'\n\n<br><br>If you forget a password which is stored in Account Switcher, <a href="/r/Enhancement/wiki/faq/passwords">you can recover them from RES settings</a>. Be aware that RES offers very little protection for stored passwords, so be careful when sharing your computer or settings!',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.userLink = document.querySelector('#header-bottom-right > span.user > a');
			if (this.userLink) {
				this.userLink.style.marginRight = '2px';
				this.loggedInUser = RESUtils.loggedInUser();
				// var downArrowIMG = 'data:image/gif;base64,R0lGODlhBwAEALMAAAcHBwgICAoKChERETs7Ozo6OkJCQg0NDRoaGhAQEAwMDDIyMv///wAAAAAAAAAAACH5BAEAAAwALAAAAAAHAAQAAAQQ0BSykADsDAUwY4kQfOT4RQA7';
				if (this.options.dropDownStyle.value === 'alien') {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"></span>');
				} else {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"><span class="downArrow"></span></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"><span class="downArrow"></span></span>');
				}
				this.downArrowOverlay.on('click', function() {
					modules['accountSwitcher'].toggleAccountMenu(false);
					modules['accountSwitcher'].manageAccounts();
				}).appendTo(document.body);

				this.downArrow.on('click', function() {
					modules['accountSwitcher'].updateUserDetails();
					modules['accountSwitcher'].toggleAccountMenu(true);
				});

				// insertAfter(this.userLink, downArrow);
				$(this.userLink).after(this.downArrow);

				this.accountMenu = $('<ul id="RESAccountSwitcherDropdown" class="RESDropdownList"></ul>');

				this.accountMenu.add(this.downArrowOverlay).on('mouseenter', function() {
					clearTimeout(modules['accountSwitcher'].dropdownTimer);
				})
				.on('mouseleave', function() {
					modules['accountSwitcher'].dropdownTimer = setTimeout(function() {
						modules['accountSwitcher'].toggleAccountMenu(false);
					}, 1000);
				});

				this.accountMenu.on('click', '.accountName', function(e) {
					e.preventDefault();
					modules['accountSwitcher'].switchTo($.data(this, 'username'));
				});
				this.accountMenu.on('click', '.addAccount', function(e) {
					e.preventDefault();
					modules['accountSwitcher'].toggleAccountMenu(false);
					modules['accountSwitcher'].manageAccounts();
				});
				// RESUtils.addStyle(css);
				var accounts = this.options.accounts.value;
				if (accounts !== null) {
					var accountCount = 0;
					accounts.forEach(function(account) {
						var username = account[0];
						if (!this.loggedInUser || username.toUpperCase() !== this.loggedInUser.toUpperCase() || this.options.showCurrentUserName.value) {
							accountCount++;
							var $accountLink = $('<li>', {
								'class': 'accountName'
							});
							// Check if user is logged in before comparing
							if (this.loggedInUser && username.toUpperCase() === this.loggedInUser.toUpperCase()) {
								$accountLink.addClass('active');
							}

							$accountLink.data('username', username)
								.appendTo(this.accountMenu);
						}
					}, this);

					if (accountCount) {
						modules['accountSwitcher'].populateUsers();
						modules['accountSwitcher'].updateUserDetails(false);
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
					var found = modules['accountSwitcher'].findMatchingAccount(val, true);
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

					var found = modules['accountSwitcher'].findMatchingAccount(val, true);

					if (found) {
						modules['accountSwitcher'].switchTo(found[0]);
					} else {
						modules['accountSwitcher'].manageAccounts();
					}
				}
			);
		}
	},
	populateUsers: function() {
		this.accountMenu.find('.accountName')
			.each(function(index, ele) { modules['accountSwitcher'].populateUser(ele); });
	},
	updateUser: function(username) {
		this.accountMenu.find('.accountName')
			.filter(function() {
				var thisUsername = $(this).data('username');
				return username === thisUsername;
			})
			.each(function(index, ele) { modules['accountSwitcher'].populateUser(ele); });
	},
	populateUser: function(container) {
		var username = $(container).data('username');

		// Ignore "+ add account"
		if (typeof username === 'undefined') {
			return;
		}
		var userInfo = modules['accountSwitcher'].userInfo[username] || {};

		var contents = document.createDocumentFragment();
		contents.appendChild(document.createTextNode(username));

		// Display the karma of the user
		if (typeof userInfo.link_karma !== 'undefined' && modules['accountSwitcher'].options.showKarma.value) {
			var karma = $('<span>').safeHtml('(' + userInfo.link_karma + ' &middot; ' + userInfo.comment_karma + ')');
			karma.appendTo(contents);
		}

		if (userInfo.is_gold && modules['accountSwitcher'].options.showGold.value) {
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
	},
	userInfo: {},
	updateUserDetails: function(live) {
		if (!modules['accountSwitcher'].options.showUserDetails.value) return;
		var accounts = modules['accountSwitcher'].options.accounts.value;
		if (!accounts) {
			return;
		}

		accounts.forEach(function(account, index) {
			var username = account[0];
			if (modules['accountSwitcher'].userInfo[username]) return;

			// Respect API burstiness: space out requests
			setTimeout(RESUtils.getUserInfo, 500 * index, addDetails, username, live);
			function addDetails(response) {
				// Fail if retrieving the user's info results in an error (such as a 404)
				if (!response || response.error || !response.data) {
					return;
				}

				modules['accountSwitcher'].userInfo[username] = response.data;
				modules['accountSwitcher'].updateUser(username);
			}
		});
	},
	toggleAccountMenu: function(open) {
		if (open) {
			var thisHeight = 18,
				thisX, thisY;
			if (modules['accountSwitcher'].accountMenu.css('position') !== 'fixed') {
				thisX = $(modules['accountSwitcher'].userLink).offset().left;
				thisY = $(modules['accountSwitcher'].userLink).offset().top;
			} else {
				thisX = $('#header-bottom-right').position().left + $(modules['accountSwitcher'].userLink).position().left;
				thisY = $(modules['accountSwitcher'].userLink).position().top;
				if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
					thisHeight += $('#sr-header-area').height();
				} else if (modules['betteReddit'].options.pinHeader.value === 'header') {
					thisHeight += $('#sr-header-area').height();
				}
			}
			$(modules['accountSwitcher'].accountMenu).css({
				top: (thisY + thisHeight) + 'px',
				left: (thisX) + 'px'
			});
			$(modules['accountSwitcher'].accountMenu).show();
			thisX = $(modules['accountSwitcher'].downArrow).offset().left;
			thisY = $(modules['accountSwitcher'].downArrow).offset().top;
			$(modules['accountSwitcher'].downArrowOverlay).css({
				top: (thisY - 4) + 'px',
				left: (thisX - 3) + 'px'
			});

			$(modules['accountSwitcher'].downArrowOverlay).show();
			modules['styleTweaks'].setSRStyleToggleVisibility(false, 'accountSwitcher');

		} else {
			$(modules['accountSwitcher'].accountMenu).hide();
			$(modules['accountSwitcher'].downArrowOverlay).hide();
			modules['styleTweaks'].setSRStyleToggleVisibility(true, 'accountSwitcher');
		}
	},
	closeAccountMenu: function() {
		// this function basically just exists for other modules to call.
		if (!this.accountMenu) return;
		$(this.accountMenu).hide();
	},
	findMatchingAccount: function(username, partialMatch) {
		var accounts = this.options.accounts.value;
		var matched = accounts.find(function(account) {
			return account[0].toUpperCase() === username.toUpperCase();
		});

		if (matched || !partialMatch) {
			return matched;
		}

		return accounts.find(function(account) {
			return account[0].toUpperCase().indexOf(username.toUpperCase()) === 0;
		});
	},
	switchTo: function(username) {
		var account = this.findMatchingAccount(username);
		if (!account) return;
		username = account[0];
		var password = account[1];
		var rem = '';
		if (this.options.keepLoggedIn.value) {
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
							modules['accountSwitcher'].manageAccounts);
						modules['accountSwitcher'].switchedAccount(false);
					} else if (rateLimit.test(response.responseText)) {
						alert('Could not log in as <b>' + username + '</b> because reddit is seeing too many requests from you too quickly. Perhaps you\'ve been trying to log in using the wrong username or password?' +
						'<p>Check your settings?</p>',
							modules['accountSwitcher'].manageAccounts);
						modules['accountSwitcher'].switchedAccount(false);
					} else {
						modules['accountSwitcher'].switchedAccount(username);
					}
				}
			});
		});
	},
	switchedAccount: function(username) {
		if (modules['accountSwitcher'].options.updateOtherTabs.value) {
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
	},
	_usernameElsewhere: undefined,
	switchedAccountElsewhere: function(username) {
		var setup = (this._usernameElsewhere === undefined);
		this._usernameElsewhere = username;
		if (setup) {
			window.addEventListener('focus', this._onFocus);
		}
	},
	_onFocus: function() {
		var module = modules['accountSwitcher'];
		var currentUsername = (RESUtils.loggedInUser() || '').toLowerCase();
		if (currentUsername === module._usernameElsewhere) {
			this._usernameElsewhere = undefined;
			window.removeEventListener('focus', module._onFocus);
			return;
		}
		module._switchedAccountElsewhere();
	},
	_switchedAccountElsewhere: function() {
		var username, hasDraft, switchedMessage, reloadMessage, message;
		username = this._usernameElsewhere;

		hasDraft = Array.prototype.slice.call(document.querySelectorAll('textarea'))
			.some(function(textarea) {
				return textarea.value;
			});

		if (!hasDraft && modules['accountSwitcher'].options.reloadOtherTabs.value) {
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
	},
	manageAccounts: function() {
		modules['settingsNavigation'].loadSettingsPage('accountSwitcher', 'accounts');
	}
});
