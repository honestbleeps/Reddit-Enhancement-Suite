modules['searchHelper'] = {
	moduleID: 'searchHelper',
	moduleName: 'Search Helper',
	category: 'UI',
	options: {
		addSearchOptions: {
			type: 'boolean',
			value: true,
			description: 'Allow you to choose sorting and time range on the search form of the side panel.'
		},
		userFilterBySubreddit: {
			type: 'boolean',
			value: false,
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
			if (this.options.addSearchOptions.value) {
				var searchExpando;
				if (searchExpando = document.getElementById('searchexpando')) {
					var searchOptionsHtml = '<label>Sort:<select name="sort"><option value="relevance">relevance</option><option value="new">new</option><option value="hot">hot</option><option value="top">top</option><option value="comments">comments</option></select></label> <label>Time:<select name="t"><option value="all">all time</option><option value="hour">this hour</option><option value="day">today</option><option value="week">this week</option><option value="month">this month</option><option value="year">this year</option></select></label>';
					if($(searchExpando).find('input[name=restrict_sr]').length) { // we don't want to add the new line if we are on the front page
						searchOptionsHtml = '<br />' + searchOptionsHtml;
					}
					$(searchExpando).find('#moresearchinfo').before(searchOptionsHtml);

				}
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
	}
};