addModule('usernameHider', {
	moduleID: 'usernameHider',
	moduleName: 'Username Hider',
	category: 'My account',
	disabledByDefault: true,
	options: {
		displayText: {
			type: 'text',
			value: '~anonymous~',
			description: 'What to replace your username with. Default is ~anonymous~.'
		},
		perAccountDisplayText: {
			type: 'table',
			addRowText: '+add account',
			fields: [{
				name: 'username',
				type: 'text'
			}, {
				name: 'displayText',
				type: 'text'
			}],
			value: [],
			description: 'Allows you to specify the display text for a specific account. (useful in conjunction with the Account Switcher!)'
		},
		hideAllUsernames: {
			advanced: true,
			type: 'boolean',
			value: true,
			description: 'Hide all accounts listed in perAccountDisplayText, not just the logged-in user.'
		},
		hideAccountSwitcherUsernames: {
			advanced: true,
			type: 'boolean',
			value: true,
			description: 'Hide all accounts listed in Account Switcher. <br> \
			If an username isn\'t already listed in perAccountDisplayText, then hide that username with the default displayText.'
		},
		showUsernameOnHover: {
			type: 'boolean',
			value: false,
			description: 'Mousing over the text hiding your username reveals your real username.<br>\
			This makes it easy to double check that you\'re commenting/posting from the correct account,\
			while still keeping your username hidden from prying eyes.'
		}
	},
	description: 'Username hider hides your username from displaying on your screen when you\'re logged in to reddit. \
	This way, if someone looks over your shoulder at work, or if you take a screenshot, your reddit username is not shown. \
	This only affects your screen. There is no way to post or comment on reddit without your post being linked to the account \
	you made it from.',

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
			if (!RESUtils.loggedInUser(true)) {
				modules['usernameHider'].tryAgain = true;
				return false;
			}
			modules['usernameHider'].hideUsernames();
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (modules['usernameHider'].tryAgain) {
				modules['usernameHider'].hideUsernames();
			}
		}
	},
	getDisplayText: function(username) {
		var accounts = modules['usernameHider'].options.perAccountDisplayText.value,
			displayText;
		if (!username) {
			username = RESUtils.loggedInUser();
		}

		if (username && accounts) {
			username = username.toLowerCase();

			for (var i = 0, len = accounts.length; i < len; i++) {
				if (accounts[i][0].toLowerCase() === username) {
					displayText = accounts[i][1];
					break;
				}
			}
		}

		if (!displayText) {
			displayText = modules['usernameHider'].options.displayText.value ||
				modules['usernameHider'].options.displayText.default;
		}

		return displayText;
	},
	hideUsernames: function() {
		modules['usernameHider'].hideUsername();
		if (modules['usernameHider'].options.hideAllUsernames.value) {
			modules['usernameHider'].hideAllUsernames();
		}
		if (modules['usernameHider'].options.hideAccountSwitcherUsernames.value) {
			modules['usernameHider'].hideAccountSwitcherUsernames();
		}
	},
	hideAllUsernames: function() {
		modules['usernameHider'].options.perAccountDisplayText.value.forEach(function(perAccountDisplayText) {
			modules['usernameHider'].hideUsername(perAccountDisplayText[0]);
		});
	},
	hideAccountSwitcherUsernames: function() {
		var accounts = modules['accountSwitcher'].options.accounts.value;
		if (accounts !== null) {
			accounts.forEach(function(account) {
				modules['usernameHider'].hideUsername(account[0]);
			});
		}
	},
	_hiddenUsername: {},
	hideUsername: function(user) {
		user = user || RESUtils.loggedInUser();
		var curatedBy = document.querySelector('.multi-details > h2 a'),
			displayText = modules['usernameHider'].getDisplayText(user);

		if (!user) return;

		if (modules['usernameHider']._hiddenUsername[user.toLowerCase()]) {
			return;
		} else {
			modules['usernameHider']._hiddenUsername[user.toLowerCase()] = true;
		}
		// Hide username
		RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\'], #header .user > a[href*=\'/' + user + '\'], .titlebox .tagline a.author[href*=\'/' + user + '\'], .commentingAs, a.author[href*=\'/' + user + '\'], .bottom a[href*=\'/' + user + '\'] {line-height:0;font-size:0;content:none;}');
		RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\']:after, #header .user > a[href*=\'/' + user + '\']:after, .titlebox .tagline a.author[href*=\'/' + user + '\']:after,  a.author[href*=\'/' + user + '\']:after, .bottom a[href*=\'/' + user + '\']:after {content: "' + displayText + '";letter-spacing:normal;font-size:10px;background-color:inherit;border-radius:inherit;padding:inherit;}');
		RESUtils.addCSS('.commentingAs:after {content: "Commenting as: ' + displayText + '";letter-spacing:normal;font-size:12px;}');

		// Show username on hover
		if (modules['usernameHider'].options.showUsernameOnHover.value) {
			RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\']:hover, #header .user > a[href*=\'/' + user + '\']:hover, .titlebox .tagline a.author[href*=\'/' + user + '\']:hover, .commentingAs:hover, a.author[href*=\'/' + user + '\']:hover, .bottom a[href*=\'/' + user + '\']:hover {line-height:inherit;font-size:inherit;}');
			RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\']:hover:after, #header .user > a[href*=\'/' + user + '\']:hover:after, .titlebox .tagline a.author[href*=\'/' + user + '\']:hover:after, a.author[href*=\'/' + user + '\']:hover:after, .bottom a[href*=\'/' + user + '\']:hover:after {content:none;}');
			RESUtils.addCSS('.commentingAs:hover:after {content: none;}');
		}

		if (curatedBy) {
			var curatedByUsername = curatedBy.href.match(RESUtils.regexes.profile);
			if (curatedByUsername && curatedByUsername[1].toLowerCase() === user.toLowerCase()) {
				curatedBy.textContent = curatedBy.textContent.replace(user, displayText);

				// Show username on hover
				if (modules['usernameHider'].options.showUsernameOnHover.value) {
					(function(user, displayText) {
						$(curatedBy)
							.on('mouseenter', function() {
								this.textContent = this.textContent.replace(displayText, user);
							})
							.on('mouseleave', function() {
								this.textContent = this.textContent.replace(user, displayText);
							});
					}(user, displayText));
				}
			}
		}
	}
});
