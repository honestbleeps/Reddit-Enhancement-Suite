addModule('showKarma', {
	moduleID: 'showKarma',
	moduleName: 'Show Karma',
	category: 'My account',
	options: {
		showCommentKarma: {
			type: 'boolean',
			value: true,
			description: 'Show comment karma in addition to link karma'
		},
		separator: {
			type: 'text',
			value: '\u00b7',
			description: 'Separator character between post/comment karma',
			advanced: true
		},
		useCommas: {
			type: 'boolean',
			value: true,
			description: 'Use commas for large karma numbers'
		}
	},
	description: 'Add more info and tweaks to the karma next to your username in the user menu bar.',
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
			if (RESUtils.loggedInUser()) {
				 if (this.options.showCommentKarma.value) {
					RESUtils.getUserInfo(modules['showKarma'].updateKarmaDiv.bind(modules['showKarma']));
				} else {
					this.formatLinkKarma();
				}
			}
		}
	},
	updateKarmaDiv: function(userInfo) {
		var karmaDiv = document.querySelector('#header-bottom-right .userkarma'),
			linkKarma, commentKarma;
		if (karmaDiv) {
			linkKarma = karmaDiv.textContent;
			karmaDiv.title = '';
			if (typeof userInfo.data !== 'undefined') {
				linkKarma = userInfo.data.link_karma;
				commentKarma = userInfo.data.comment_karma;
				if (modules['showKarma'].options.useCommas.value) {
					linkKarma = this.commaNumber(linkKarma);
					commentKarma = this.commaNumber(commentKarma);
				} else {
					linkKarma = this.uncommaNumber(linkKarma);
				}
				$(karmaDiv).safeHtml('<a title="link karma" href="/user/' + RESUtils.loggedInUser() + '/submitted/">' + linkKarma + '</a> ' + modules['showKarma'].options.separator.value + ' <a title="comment karma" href="/user/' + RESUtils.loggedInUser() + '/comments/">' + commentKarma + '</a>');
			} else {
				// User has been shadowbanned
			}
		}
	},
	formatLinkKarma: function(value) {
		var container = document.querySelector('#header-bottom-right .user .userkarma'),
			formatted;
		value = (typeof value !== 'undefined') ? value : container.textContent;

		if (!this.options.useCommas.value) {
			formatted = this.uncommaNumber(value);
			container.textContent = formatted;
		}
	},
	commaNumber: function(value) {
		return RESUtils.createElement.commaDelimitedNumber(value);
	},
	uncommaNumber: function(value) {
		value = value || 0;
		value = (value + '').match(/(\w+)/g);
		value = (value && value).join('') || 0;
		return value;
	}
});
