addModule('accountSwitcher', {
	moduleID: 'accountSwitcher',
	moduleName: 'Account Switcher',
	category: 'My account',
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
			advanced: true
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
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#RESAccountSwitcherDropdown { min-width: 110px; width: auto; display: none; position: absolute; z-index: 1000; }');
			RESUtils.addCSS('#RESAccountSwitcherDropdown li { height: auto; line-height: 20px; padding: 2px 10px; }');
			RESUtils.addCSS('#RESAccountSwitcherDropdown li span { margin-left: 8px; }');
			if (this.options.dropDownStyle.value === 'alien') {
				RESUtils.addCSS('#RESAccountSwitcherIcon { cursor: pointer; margin-left: 3px; display: inline-block; width: 12px; vertical-align: middle; height: 16px; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC); }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay { cursor: pointer; position: absolute; display: none; width: 11px; height: 22px; background-position: 2px 3px; padding-left: 2px; padding-right: 2px; padding-top: 3px; border: 1px solid #369; border-bottom: 1px solid #5f99cf; background-color: #5f99cf; border-radius: 3px 3px 0 0; z-index: 100; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC); }');
			} else {
				RESUtils.addCSS('#RESAccountSwitcherIcon { display: inline-block; vertical-align: bottom; margin-left: 3px; }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay { cursor: pointer; position: absolute; display: none; width: 20px; height: 22px; z-index: 100; border: 1px solid #369; border-bottom: 1px solid #5f99cf; background-color: #5f99cf; border-radius: 3px 3px 0 0; }');
				RESUtils.addCSS('#RESAccountSwitcherIcon .downArrow::after, #RESAccountSwitcherIconOverlay .downArrow::after { content: "\\25BC"; line-height: 10px; font-size: 14px; }');
				RESUtils.addCSS('#RESAccountSwitcherIcon .downArrow::after { cursor: pointer; margin-top: 2px; display: block; width: 16px; color: #aabfff; }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay .downArrow::after { margin-top: 6px; margin-left: 3px; display: inline-block; width: 18px; color: #829ff9; }');
				// this.alienIMG = '<span class="downArrow"></span>';
			}
			// RESUtils.addCSS('#RESAccountSwitcherIconOverlay { display: none; position: absolute; }');
		}
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

			if (modules['accountSwitcher'].options.updateOtherTabs.value) {
				window.addEventListener('focus', modules['accountSwitcher']._onFocus.bind(modules['accountSwitcher']));
			}
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

		} else {
			$(modules['accountSwitcher'].accountMenu).hide();
			$(modules['accountSwitcher'].downArrowOverlay).hide();
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
			this.reloadPage();
		}
	},
	_usernameElsewhere: undefined,
	_notifiedSwitchedAccount: false,
	switchedAccountElsewhere: function(username) {
		var module = modules['accountSwitcher'];
		module._usernameElsewhere = username;
		if (module._switchedAccountMessage) {
			module._switchedAccountMessage.close();
		}
		module._switchedAccountMessage = undefined;
	},
	_onFocus: function() {
		var module = modules['accountSwitcher'];
		if (typeof module._usernameElsewhere === 'undefined') {
			return;
		}

		var currentUsername = (RESUtils.loggedInUser() || '').toLowerCase();
		if (currentUsername === (module._usernameElsewhere || '').toLowerCase()) {
			module._notifiedSwitchedAccount = false;
			return;
		}

		if (module._notifiedSwitchedAccount) {
			return;
		}
		module._notifiedSwitchedAccount = true;

		if (module._switchedAccountMessage) {
			module._switchedAccountMessage.close();
		}
		module._switchedAccountMessage = module._notifySwitchedAccountElsewhere();
	},
	_notifySwitchedAccountElsewhere: function() {
		var username, hasDraft, message;
		username = this._usernameElsewhere;

		hasDraft = Array.prototype.slice.call(document.querySelectorAll('textarea'))
			.some(function(textarea) {
				return textarea.value;
			});

		if (!hasDraft && modules['accountSwitcher'].options.reloadOtherTabs.value) {
			this.reloadPage();
			return;
		}

		message = username ?
			'You switched to /u/' + username + '.' :
			'You have been logged out.';
		if (hasDraft) {
			message += ' However, you haven\'t finished posting on this page as /u/' + RESUtils.loggedInUser() + '.';
		}
		message += ' <p><a class="RESNotificationButtonBlue" href="' + location.origin + (location.pathame || '') + '">reload</a></p>';

		modules['notifications'].showNotification({
			moduleID: 'accountSwitcher',
			optionKey: 'updateOtherTabs',
			message: message
		});
	},
	manageAccounts: function() {
		modules['settingsNavigation'].loadSettingsPage('accountSwitcher', 'accounts');
	},
	reloadPage: function() {
		if (/^#page=/.test(location.hash)) {
			location.hash = '';
		}
		location.reload();
	}
});
