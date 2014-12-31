modules['usernameHider'] = {
	moduleID: 'usernameHider',
	moduleName: 'Username Hider',
	category: 'Accounts',
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
		return RESConsole.getModulePrefs(this.moduleID);
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
				modules['accountSwitcher'].tryAgain = true;
				return false;
			}
			modules['accountSwitcher'].hideUsernames();
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (modules['accountSwitcher'].tryAgain) {
				modules['accountSwitcher'].hideUsernames();
			}
		}
	},
	getDisplayText: function(username) {
		var accounts = modules['accountSwitcher'].options.perAccountDisplayText.value,
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
			displayText = modules['accountSwitcher'].options.displayText.value ||
				modules['accountSwitcher'].options.displayText.default;
		}

		return displayText;
	},
	hideUsernames: function() {
		modules['accountSwitcher'].hideUsername();
		if (modules['accountSwitcher'].options.hideAllUsernames.value) {
			modules['accountSwitcher'].hideAllUsernames();
		}
		if (modules['accountSwitcher'].options.hideAccountSwitcherUsernames.value) {
			modules['accountSwitcher'].hideAccountSwitcherUsernames();
		}
	},
	hideAllUsernames: function() {
		modules['accountSwitcher'].options.perAccountDisplayText.value.forEach(function(perAccountDisplayText) {
			modules['accountSwitcher'].hideUsername(perAccountDisplayText[0]);
		});
	},
	hideAccountSwitcherUsernames: function() {
		modules['accountSwitcher'].options.accounts.value.forEach(function(account) {
			modules['accountSwitcher'].hideUsername(account[0]);
		});
	},
	_hiddenUsername: {},
	hideUsername: function(user) {
		user = user || RESUtils.loggedInUser();
		var curatedBy = document.querySelector('.multi-details > h2 a'),
			displayText = modules['accountSwitcher'].getDisplayText(user);

		if (!user) return;

		if (modules['accountSwitcher']._hiddenUsername[user.toLowerCase()]) {
			return;
		} else {
			modules['accountSwitcher']._hiddenUsername[user.toLowerCase()] = true;
		}
		// Hide username
		RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\'], #header .user > a, .titlebox .tagline a.author, .commentingAs, a.author[href*=\'/' + user + '\'], .bottom a[href*=\'/' + user + '\'] {line-height:0;font-size:0;content:none;}');
		RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\']:after, #header .user > a:after, .titlebox .tagline a.author:after,  a.author[href*=\'/' + user + '\']:after, .bottom a[href*=\'/' + user + '\']:after {content: "' + displayText + '";letter-spacing:normal;font-size:10px;}');
		RESUtils.addCSS('.commentingAs:after {content: "Commenting as: ' + displayText + '";letter-spacing:normal;font-size:12px;}');

		// Show username on hover
		if (modules['accountSwitcher'].options.showUsernameOnHover.value) {
			RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\']:hover, #header .user > a:hover, .titlebox .tagline a.author:hover, .commentingAs:hover, a.author[href*=\'/' + user + '\']:hover, .bottom a[href*=\'/' + user + '\']:hover {line-height:inherit;font-size:inherit;}');
			RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\']:hover:after, #header .user > a:hover:after, .titlebox .tagline a.author:hover:after, a.author[href*=\'/' + user + '\']:hover:after, .bottom a[href*=\'/' + user + '\']:hover:after {content:none;}');
			RESUtils.addCSS('.commentingAs:hover:after {content: none;}');
		}

		if (modules['userHighlight'].isEnabled()) {
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:after, p.tagline > .moderator[href*=\'/' + user + '\']:after{background-color:inherit;padding:0 2px;font-weight:bold;border-radius:3px;color:#fff;}');
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:after{ background-color:' + modules['userHighlight'].options.OPColor.value + ';}');
			RESUtils.addCSS('p.tagline > .moderator[href*=\'/' + user + '\']:after{ background-color:' + modules['userHighlight'].options.modColor.value + ';}');
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:hover:after{ background-color:' + modules['userHighlight'].options.OPColorHover.value + ';}');
			RESUtils.addCSS('p.tagline > .moderator[href*=\'/' + user + '\']:hover:after{ background-color:' + modules['userHighlight'].options.modColorHover.value + ';}');
		}
		if (curatedBy) {
			var curatedByUsername = curatedBy.href.match(RESUtils.profileRegex);
			if (curatedByUsername && curatedByUsername[1].toLowerCase() === user.toLowerCase()) {
				curatedBy.textContent = curatedBy.textContent.replace(user, displayText);

				// Show username on hover
				if (modules['accountSwitcher'].options.showUsernameOnHover.value) {
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
};
