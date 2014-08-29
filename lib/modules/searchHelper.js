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
		addSearchOptions: {
			type: 'boolean',
			value: true,
			description: 'Allow you to choose sorting and time range on the search form of the side panel.'
		},
		userFilterBySubreddit: {
			type: 'boolean',
			value: false,
			description: 'When on a user profile, offer to search user\'s post from the subreddit or multireddit we come from.'
		},
		addSubmitButton: {
			type: 'boolean',
			value: true,
			description: 'Add a submit button to the search field.'
		},
		toggleSearchOptions: {
			type: 'boolean',
			value: true,
			description: 'Add a button to hide search options while searching.',
			advanced: true
		},
		hideSearchOptions: {
			type: 'boolean',
			value: false,
			description: 'Automatically hide the search options and suggestions on the search page..',
			advanced: true,
			dependsOn: 'toggleSearchOptions'
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
			if (this.options.addSubmitButton.value) {
				var searchExpando;
				if (searchExpando = document.getElementById('searchexpando')) {
					RESUtils.addCSS('#searchexpando .searchexpando-submit { text-align:center; }');
					var submitDiv = '<div class="searchexpando-submit"><input type="submit" value="search" /></div>';
					$(searchExpando).append(submitDiv);
				}
			}
			if (this.options.toggleSearchOptions.value && RESUtils.searchRegex.test(location.href)) {
				RESUtils.addCSS('.searchpane-toggle-hide { float: right; margin-top: -1em } .searchpane-toggle-show { float: right; } .searchpane-toggle-show:after {  content:"\u25BC"; margin-left:2px; }.searchpane-toggle-hide:after { content: "\u25B2"; margin-left: 2px; }');
				if (this.options.hideSearchOptions.value || location.hash == '#res-hide-options') {
					$('body').addClass('res-hide-options');
				}
				RESUtils.addCSS('.res-hide-options .search-summary, .res-hide-options .searchpane, .res-hide-options .searchfacets { display: none; } .res-hide-options .searchpane-toggle-show { display: block; } .searchpane-toggle-show { display: none; }');
				$(".content .searchpane").append('<a href="#res-hide-options" class="searchpane-toggle-hide">hide search options</a>')
				$(".content .searchpane ~ .menuarea").prepend('<a href="#res-show-options" class="searchpane-toggle-show">show search options</a>');
				$('.searchpane-toggle-hide').click(function() {
					$('body').addClass('res-hide-options');
				});
				$('.searchpane-toggle-show').click(function() {
					$('body').removeClass('res-hide-options');
				});
			}
		}
	},
	searchSubredditByDefault: function() {
		// Reddit now has this feature... but for some reason the box isn't checked by default, so we'll still do that...
		var restrictSearch = document.body.querySelector('INPUT[name=restrict_sr]');
		if (restrictSearch && !/^https?:\/\/www\.reddit\.com\/r\/[-\w\.+]+\/search\?/i.test(location.href)) { // prevent autochecking after uncheck it
				restrictSearch.checked = true;
		}
	},
};
