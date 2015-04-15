modules['showKarma'] = {
	moduleID: 'showKarma',
	moduleName: 'Show Comment Karma',
	category: 'Users',
	options: {
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
	description: 'Shows your comment karma next to your link karma.',
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
				RESUtils.getUserInfo(modules['showKarma'].updateKarmaDiv);
			}
		}
	},
	updateKarmaDiv: function(userInfo) {
		var karmaDiv = document.querySelector('#header-bottom-right .userkarma');
		if ((typeof karmaDiv !== 'undefined') && (karmaDiv !== null)) {
			var linkKarma = karmaDiv.textContent;
			karmaDiv.title = '';
			if (typeof userInfo.data !== 'undefined') {
				var commentKarma = userInfo.data.comment_karma;
				if (modules['showKarma'].options.useCommas.value) {
					linkKarma = RESUtils.createElement.commaDelimitedNumber(linkKarma);
					commentKarma = RESUtils.createElement.commaDelimitedNumber(commentKarma);
				}
				$(karmaDiv).safeHtml('<a title="link karma" href="/user/' + RESUtils.loggedInUser() + '/submitted/">' + linkKarma + '</a> ' + modules['showKarma'].options.separator.value + ' <a title="comment karma" href="/user/' + RESUtils.loggedInUser() + '/comments/">' + commentKarma + '</a>');
			} else {
				// User has been shadowbanned
			}
		}
	}
};
