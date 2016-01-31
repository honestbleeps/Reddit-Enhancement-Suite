addModule('accountSwitcher', (module, moduleID) => {
	module.moduleName = 'Account Switcher';
	module.category = 'My account';
	module.description = `
		Store username/password pairs and switch accounts instantly while browsing Reddit!
		\n\n<br><br>
		If you forget a password which is stored in Account Switcher, <a href="/r/Enhancement/wiki/faq/passwords">you can recover them from RES settings</a>.
		Be aware that RES offers very little protection for stored passwords, so be careful when sharing your computer or settings!
	`;
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
				if (this.options.dropDownStyle.value === 'alien') {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"></span>');
				} else {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"><span class="downArrow"></span></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"><span class="downArrow"></span></span>');
				}
				this.downArrowOverlay
					.on('click', () => {
						toggleAccountMenu(false);
						manageAccounts();
					})
					.appendTo(document.body);

				this.downArrow.on('click', () => {
					updateUserDetails();
					toggleAccountMenu(true);
				});

				$(this.userLink).after(this.downArrow);

				this.accountMenu = $('<ul id="RESAccountSwitcherDropdown" class="RESDropdownList"></ul>');

				const dropdownTimer = RESUtils.debounce(() => toggleAccountMenu(false), 1000);
				this.accountMenu.add(this.downArrowOverlay)
					.on('mouseenter', dropdownTimer.cancel)
					.on('mouseleave', dropdownTimer);

				this.accountMenu.on('click', '.accountName', function(e) {
					e.preventDefault();
					switchTo($.data(this, 'username'));
				});
				this.accountMenu.on('click', '.addAccount', e => {
					e.preventDefault();
					toggleAccountMenu(false);
					manageAccounts();
				});
				// RESUtils.addStyle(css);
				const accounts = this.options.accounts.value;
				if (accounts !== null) {
					let accountCount = 0;
					const loggedInUser = RESUtils.loggedInUser();
					accounts.forEach(function(account) {
						const username = account[0];
						if (!loggedInUser || username.toUpperCase() !== loggedInUser.toUpperCase() || this.options.showCurrentUserName.value) {
							accountCount++;
							const $accountLink = $('<li>', {
								class: 'accountName'
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
						class: 'addAccount'
					})
						.text('+ add account')
						.appendTo(this.accountMenu);
				}

				$(document.body).append(this.accountMenu);
			}


			modules['commandLine'].registerCommand(/^sw$/, 'sw [username] - switch users to [username]',
				(command, val) => {
					const found = findMatchingAccount(val, true);
					if (val && found) {
						return `Switch to username: ${found[0]}`;
					} else {
						return 'Switch to username: ...';
					}
				},
				(command, val) => {
					if (!val.length) {
						return 'No username specified.';
					}

					const found = findMatchingAccount(val, true);

					if (found) {
						switchTo(found[0]);
					} else {
						manageAccounts();
					}
				}
			);

			if (module.options.updateOtherTabs.value) {
				window.addEventListener('focus', _onFocus);
			}
		}
	};

	function populateUsers() {
		module.accountMenu.find('.accountName')
			.each((index, ele) => populateUser(ele));
	}

	function updateUser(username) {
		module.accountMenu.find('.accountName')
			.filter(function() {
				const thisUsername = $(this).data('username');
				return username === thisUsername;
			})
			.each((index, ele) => populateUser(ele));
	}

	const _userInfo = {};

	function populateUser(container) {
		const username = $(container).data('username');

		// Ignore "+ add account"
		if (typeof username === 'undefined') {
			return;
		}
		const userInfo = _userInfo[username] || {};

		const contents = document.createDocumentFragment();
		contents.appendChild(document.createTextNode(username));

		// Display the karma of the user
		if (typeof userInfo.link_karma !== 'undefined' && module.options.showKarma.value) {
			const karma = $('<span>').safeHtml(`(${userInfo.link_karma} &middot; ${userInfo.comment_karma})`);
			karma.appendTo(contents);
		}

		if (userInfo.is_gold && module.options.showGold.value) {
			// If the user has gold display the icon and set the title text to the time remaining till it expires

			const gilded = RESUtils.createElement('span', null, 'gilded-icon');
			if (userInfo.gold_expiration) {
				const today = new Date();
				const expDate = new Date(userInfo.gold_expiration * 1000); // s -> ms
				gilded.title = `Until ${expDate.toDateString()} (${RESUtils.niceDateDiff(today, expDate)})`;
			}

			contents.appendChild(gilded);
		}

		$(container).empty().append(contents);
	}

	function updateUserDetails(live) {
		if (!module.options.showUserDetails.value) return;
		const accounts = module.options.accounts.value;
		if (!accounts) {
			return;
		}

		accounts.forEach(([username], index) => {
			if (_userInfo[username]) return;

			// Respect API burstiness: space out requests
			setTimeout(async () => {
				const { data } = await RESUtils.getUserInfo(username, live);

				if (data) {
					_userInfo[username] = data;
					updateUser(username);
				}
			}, 500 * index);
		});
	}

	function toggleAccountMenu(open) {
		if (open) {
			let thisHeight = 18;
			let thisX, thisY;
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
				top: `${thisY + thisHeight}px`,
				left: `${thisX}px`
			});
			$(module.accountMenu).show();
			thisX = $(module.downArrow).offset().left;
			thisY = $(module.downArrow).offset().top;
			$(module.downArrowOverlay).css({
				top: `${thisY - 4}px`,
				left: `${thisX - 3}px`
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
		const accounts = module.options.accounts.value;
		const matched = accounts.find(([user]) => user.toUpperCase() === username.toUpperCase());

		if (matched || !partialMatch) {
			return matched;
		}

		return accounts.find(([user]) => user.toUpperCase().indexOf(username.toUpperCase()) === 0);
	}

	async function switchTo(user) {
		const account = findMatchingAccount(user);
		if (!account) return;
		const [username, password] = account;

		// Remove old session cookie (reddit_session)
		// in FF we also need to remove this (secure_session), but it should be safe to remove either way.
		await RESEnvironment.deleteCookies('reddit_session', 'secure_session');

		const response = await RESEnvironment.ajax({
			method: 'POST',
			url: '/api/login',
			credentials: true,
			data: {
				user: username,
				passwd: password,
				rem: module.options.keepLoggedIn.value ? 'on' : 'off'
			}
		});

		try {
			JSON.parse(response);
		} catch (error) {
			modules['notifications'].showNotification({
				type: 'error',
				moduleID: 'accountSwitcher',
				message: 'Could not switch accounts. Reddit may be under heavy load. Please try again in a few moments.'
			});
			throw new Error(response);
		}

		if (response.includes('WRONG_PASSWORD')) {
			alert(`Could not log in as <b>${username}</b> because either the username or password is wrong.<p>Check your settings?</p>`, manageAccounts);
			switchedAccount(false);
		} else if (response.includes('RATELIMIT')) {
			alert(`Could not log in as <b>${username}</b> because reddit is seeing too many requests from you too quickly.
			Perhaps you've been trying to log in using the wrong username or password?<p>Check your settings?</p>`, manageAccounts);
			switchedAccount(false);
		} else {
			switchedAccount(username);
		}
	}

	function switchedAccount(username) {
		if (module.options.updateOtherTabs.value) {
			RESEnvironment.multicast(moduleID, 'switchedAccountElsewhere', username);
		}
		if (username) {
			location.reload();
		}
	}

	let _usernameElsewhere;
	let _notifiedSwitchedAccount = false;
	let _switchedAccountMessage;

	module.switchedAccountElsewhere = switchedAccountElsewhere;
	function switchedAccountElsewhere(username) {
		_usernameElsewhere = username;
		if (_switchedAccountMessage) {
			_switchedAccountMessage.close();
		}
		_switchedAccountMessage = undefined;
	}

	function _onFocus() {
		if (_usernameElsewhere === undefined) return;

		const currentUsername = (RESUtils.loggedInUser() || '').toLowerCase();
		if (currentUsername === (_usernameElsewhere || '').toLowerCase()) {
			_notifiedSwitchedAccount = false;
			return;
		}

		if (_notifiedSwitchedAccount) return;
		_notifiedSwitchedAccount = true;

		if (_switchedAccountMessage) {
			_switchedAccountMessage.close();
		}
		_switchedAccountMessage = _notifySwitchedAccountElsewhere();
	}

	function _notifySwitchedAccountElsewhere() {
		const username = _usernameElsewhere;

		const hasDraft = Array.from(document.querySelectorAll('textarea'))
			.some(textarea => textarea.value);

		if (!hasDraft && module.options.reloadOtherTabs.value) {
			location.reload();
			return undefined;
		}

		let message = username ?
			`You switched to /u/${username}.` :
			'You have been logged out.';

		if (hasDraft) {
			message += ` However, you haven't finished posting on this page as /u/${RESUtils.loggedInUser()}.`;
		}
		message += ` <p><a class="RESNotificationButtonBlue" href="${location.pathname}">reload</a></p>`;

		return modules['notifications'].showNotification({
			moduleID: 'accountSwitcher',
			optionKey: 'updateOtherTabs',
			message
		});
	}

	function manageAccounts() {
		modules['settingsNavigation'].loadSettingsPage('accountSwitcher', 'accounts');
	}
});
