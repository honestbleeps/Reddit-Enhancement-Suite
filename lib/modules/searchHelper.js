modules['searchHelper'] = {
	moduleID: 'searchHelper',
	moduleName: 'Search Helper',
	category: 'Posts',
	options: {
		addSearchOptions: {
			type: 'boolean',
			value: true,
			description: 'Allow you to choose sorting and time range on the search form of the side panel.'
		},
		legacySearch: {
			type: 'boolean',
			value: false,
			description: 'Request the "legacy layout" feature for reddit search.\n\n<br>This will only be available for a limited time.'
		},
		toggleSearchOptions: {
			type: 'boolean',
			value: true,
			description: 'Add a button to hide search options while searching.',
			advanced: true,
			dependsOn: 'legacySearch'
		},
		hideSearchOptions: {
			type: 'boolean',
			value: false,
			description: 'Automatically hide search options and suggestions on the search page.',
			advanced: true,
			dependsOn: 'legacySearch'
		},
		userFilterBySubreddit: {
			type: 'boolean',
			value: false,
			description: 'When on a user profile, offer to search user\'s post from the subreddit or multireddit we come from.'
		},
		searchByFlair: {
			type: 'boolean',
			value: true,
			description: 'When clicking on a post\'s flair, search its subreddit for that flair. <p>May not work in some subreddits that hide the actual flair and add pseudo-flair with CSS (only workaround is to disable subreddit style).</p>'
		}
	},
	description: 'Provide help with the use of search.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	// include: [
	// ],
	isMatchURL: function() {
		// return RESUtils.isMatchURL(this.moduleID);
		return true;
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var searchExpando;
			if (this.options.addSearchOptions.value) {
				searchExpando = document.getElementById('searchexpando');
				if (searchExpando) {
					var searchOptionsHtml = '<label>Sort:<select name="sort"><option value="relevance">relevance</option><option value="new">new</option><option value="hot">hot</option><option value="top">top</option><option value="comments">comments</option></select></label> <label>Time:<select name="t"><option value="all">all time</option><option value="hour">this hour</option><option value="day">today</option><option value="week">this week</option><option value="month">this month</option><option value="year">this year</option></select></label>';
					if ($(searchExpando).find('input[name=restrict_sr]').length) { // we don't want to add the new line if we are on the front page
						searchOptionsHtml = '<br />' + searchOptionsHtml;
					}
					$(searchExpando).find('#moresearchinfo').before(searchOptionsHtml);
				}
			}
			if (this.options.legacySearch.value) {
				$('form#search').append('<input type="hidden" name="feature" value="legacy_search" />');
			}
			if (this.options.userFilterBySubreddit.value) {
				var match = location.href.match(RESUtils.regexes.profile);
				if (match !== null) {
					var userProfile = match[1];
					var previousPage;
					if ((match = document.referrer.match(RESUtils.regexes.subreddit)) !== null) {
						previousPage = 'r/' + match[1];
					} else if ((match = document.referrer.match(RESUtils.regexes.multireddit)) !== null) {
						previousPage = match[1];
					}
					if (typeof previousPage !== 'undefined') {
						$('.content[role=main]').prepend('<div class="infobar"><a href="/' + previousPage + '/search?q=author:' + userProfile + ' nsfw:no&restrict_sr=on">Search post of ' + userProfile + ' on /' + previousPage + '</a></div>');
					}
				}
			}
			var isLegacySearch = document.querySelector('#siteTable');
			if (this.options.toggleSearchOptions.value && RESUtils.regexes.search.test(location.href) && isLegacySearch) {
				RESUtils.addCSS('.searchpane-toggle-hide { float: right; margin-top: -1em } .searchpane-toggle-show { float: right; } .searchpane-toggle-show:after { content:"\u25BC"; margin-left:2px; }.searchpane-toggle-hide:after { content: "\u25B2"; margin-left: 2px; }');
				if (this.options.hideSearchOptions.value || location.hash === '#res-hide-options') {
					$('body').addClass('res-hide-options');
				}
				RESUtils.addCSS('.res-hide-options .search-summary, .res-hide-options .searchpane, .res-hide-options .searchfacets { display: none; } .res-hide-options .searchpane-toggle-show { display: block; } .searchpane-toggle-show { display: none; }');
				$('.content .searchpane').append('<a href="#res-hide-options" class="searchpane-toggle-hide">hide search options</a>');
				$('.content .searchpane ~ .menuarea').prepend('<a href="#res-show-options" class="searchpane-toggle-show">show search options</a>');
				$('.searchpane-toggle-hide').on('click', function() {
					$('body').addClass('res-hide-options');
				});
				$('.searchpane-toggle-show').on('click', function() {
					$('body').removeClass('res-hide-options');
				});
			}
			if (this.options.searchByFlair) {
				RESUtils.addCSS('.res-flairSearch { cursor: pointer; position: relative; } .linkflairlabel.res-flairSearch a { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }');
				$('#siteTable').on('mouseenter', '.title > .linkflairlabel:not(.res-flairSearch)', function(e) {
					var parent = $(e.target).closest('.thing')[0],
						srMatch = RESUtils.regexes.subreddit.exec(parent.querySelector('.entry a.subreddit')),
						subreddit = (srMatch) ? srMatch[1] : RESUtils.currentSubreddit(),
						flair = e.target.title.replace(/\s/g, '+');
					if (flair && subreddit) {
						var link = document.createElement('a');
						link.href = '/r/' + encodeURIComponent(subreddit) + '/search?sort=new&restrict_sr=on&q=flair%3A' + encodeURIComponent(flair);
						e.target.classList.add('res-flairSearch');
						e.target.appendChild(link);
					}
				});
			}
		}
	}
};
