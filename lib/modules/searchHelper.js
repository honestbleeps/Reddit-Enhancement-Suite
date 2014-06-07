modules['searchHelper'] = {
	moduleID: 'searchHelper',
	moduleName: 'Search Helper',
	category: 'UI',
	options: {	
		searchSubredditByDefault: {
			type: 'boolean',
			value: true,
			description: 'Search the current subreddit by default when using the search box, instead of all of reddit.'
		},
		userFilterBySubreddit: {
			type: 'boolean',
			value: true,
			description: 'When on a user profile, offer to search user\'s post from the subreddit or multireddit we come from.'
		}
	},
	description: 'Provide help with the use of search.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	// include: [
	// ],
	isMatchURL: function() {
		// return RESUtils.isMatchURL(this.moduleID);
		return true;
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.searchSubredditByDefault.value) {
				this.searchSubredditByDefault();
			}
			if (this.options.userFilterBySubreddit.value) {
				var match = location.href.match(RESUtils.profileRegex);
				if (match !== null) {
					var userProfile = match[1];
					var previousPage;
					if ((match = document.referrer.match(RESUtils.subredditRegex)) !== null) {
						previousPage = 'r/' + match[1];
					} else if ((match = document.referrer.match(RESUtils.multiredditRegex)) !== null) {
						previousPage = match[1];
					}
					if (typeof previousPage !== 'undefined') {
						$('.content[role=main]').prepend('<div class="infobar"><a href="/' + previousPage + '/search?q=author:' + userProfile + ' nsfw:no&restrict_sr=on">Search post of ' + userProfile + ' on /' + previousPage + '</a></div>');
					}
				}
			}
		}
	},
	searchSubredditByDefault: function() {
		// Reddit now has this feature... but for some reason the box isn't checked by default, so we'll still do that...
		var restrictSearch = document.body.querySelector('INPUT[name=restrict_sr]');
		if (restrictSearch && !/^https?:\/\/www\.reddit\.com\/r\/[-\w\.]+\/search\?/i.test(location.href)) { // prevent autochecking after uncheck it
				restrictSearch.checked = true;
		}
	},
};