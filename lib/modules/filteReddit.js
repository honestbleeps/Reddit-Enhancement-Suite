modules['filteReddit'] = {
	moduleID: 'filteReddit',
	moduleName: 'filteReddit',
	category: 'Filters',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value..
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		NSFWfilter: {
			type: 'boolean',
			value: false,
			description: 'Filters all links labelled NSFW'
		},
		notificationThreshold: {
			type: 'text',
			value: '80',
			description: 'If more than this percentage (0-100) of a page is filtered, show a notification',
			advanced: true
		},
		NSFWQuickToggle: {
			type: 'boolean',
			value: true,
			description: 'Add a quick NSFW on/off toggle to the gear menu',
			advanced: true
		},
		excludeCommentsPage: {
			type: 'boolean',
			value: true,
			description: 'When visiting the comments page for a filtered link, allow the link/expando to be shown'
		},
		excludeModqueue: {
			type: 'boolean',
			value: true,
			description: 'Don\'t filter anything on modqueue pages (modqueue, reports, spam)'
		},
		excludeUserPages: {
			type: 'boolean',
			value: false,
			description: 'Don\'t filter anything on users\' profile pages'
		},
		regexpFilters: {
			type: 'boolean',
			value: true,
			advanced: true,
			description: 'Allow RegExp in certain filteReddit fields.'
				+ '<br>If you have filters which start with <code>/</code>, you should turn this option off.'
				+ '<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.'
		},
		keywords: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'keyword',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				},
				{
					name: 'subreddits',
					type: 'list',
					listType: 'subreddits',
				},
				{
					name: 'unlessKeyword',
					type: 'text'
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in title keywords you want to ignore if they show up in a title.'
				+ '\n\nRegExp like <code>/(this|that|theother)/i</code> is allowed for keyword (but not unlessKeyword).'
		},
		subreddits: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
				name: 'subreddit',
				type: 'text'
			}],
			value: [],
			description: 'Type in a subreddit you want to ignore (only applies to /r/all or /domain/* urls).'
			 	+ '\n\nRegExp like <code>/(this|that|theother)/i</code> is allowed for subreddit.'
		},
		domains: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'domain',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				},
				{
					name: 'subreddits',
					type: 'list',
					listType: 'subreddits',
				}
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in domain keywords you want to ignore. Note that "reddit" would ignore "reddit.com" and "fooredditbar.com"'
				+ '\n\nRegExp like <code>/(this|that|theother)/i</code> is allowed for domain.'
		},
		flair: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'keyword',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				},
				{
					name: 'subreddits',
					type: 'list',
					listType: 'subreddits',
				}
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in keywords you want to ignore if they are contained in link flair'
				+ '\n\nRegExp like <code>/(this|that|theother)/i</code> is allowed for flair.'
		},
		allowNSFW: {
			type: 'table',
			addRowText: '+add subreddits',
			description: 'Whitelist subreddits from NSFW filter',
			fields: [
				{
					name: 'subreddits',
					type: 'list',
					listType: 'subreddits',
				},
				{
					name: 'where',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'When browsing subreddit/multi-subreddit',
						value: 'visit'
					}],
					value: 'everywhere'
				}
			]
		}
	},
	description: 'Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all or /domain/*).',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/?(?:\??[\w]+=[\w]+&?)*/i,
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
	],
	exclude: [
		// /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		// /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/comments\/[-\w\.]+/i
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/over18.*/i
	],
	excludeSaved: /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/user\/[\w]+\/saved/i,
	excludeModqueue: /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/(?:modqueue|reports|spam)\/?/i,
	isMatchURL: function() {
		if (
			this.options.excludeModqueue.value && this.excludeModqueue.test(location.href) ||
			this.options.excludeUserPages.value && RESUtils.pageType() === 'profile'
		) {
			return false;
		}

		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled()) {
			RESUtils.addCSS('.RESFilterToggle { margin-right: 5px; color: white; background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('.RESFilterToggle.remove { background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-remove.png) }');
			RESUtils.addCSS('.RESFiltered { display: none !important; }');
			if (this.options.NSFWfilter.value && this.isEnabled() && this.isMatchURL()) {
				this.addNSFWFilterStyle();
			}
		}
	},
	go: function() {
		// shh I'm cheating. This runs the toggle on every single page, bypassing isMatchURL.
		if ((this.isEnabled()) && (this.options.NSFWQuickToggle.value)) {
			var thisFrag = document.createDocumentFragment(),
				toggleOn, toggleOff;

			toggleOn = RESUtils.createElementWithID('span', null, 'toggleOn', 'on');
			toggleOff = RESUtils.createElementWithID('span', null, 'toggleOff', 'off');
			this.nsfwSwitch = document.createElement('li');
			this.nsfwSwitch.setAttribute('title', 'Toggle NSFW Filter');
			this.nsfwSwitch.addEventListener('click', function(e) {
				e.preventDefault();
				modules['filteReddit'].toggleNsfwFilter();
			}, true);
			this.nsfwSwitch.textContent = 'nsfw filter';
			this.nsfwSwitchToggle = RESUtils.createElementWithID('div', 'nsfwSwitchToggle', 'toggleButton');
			this.nsfwSwitchToggle.appendChild(toggleOn);
			this.nsfwSwitchToggle.appendChild(toggleOff);
			this.nsfwSwitch.appendChild(this.nsfwSwitchToggle);
			(this.options.NSFWfilter.value) ? this.nsfwSwitchToggle.classList.add('enabled') : this.nsfwSwitchToggle.classList.remove('enabled');
			thisFrag.appendChild(this.nsfwSwitch);
			$('#RESDropdownOptions').append(this.nsfwSwitch);
		}

		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.scanEntries();
			RESUtils.watchForElement('siteTable', modules['filteReddit'].scanEntries);


			modules['commandLine'].registerCommand('nsfw', 'nsfw [on|off] - toggle nsfw filter on/off',
				function(command, val, match) {
					return 'Toggle nsfw filter on or off';
				}, function(command, val, match, e) {
					var toggle;
					switch (val && val.toLowerCase()) {
						case 'on':
							toggle = true;
							break;
						case 'off':
							toggle = false;
							break;
						default:
							return 'nsfw on &nbsp; or &nbsp; nsfw off ?';
							break;
					}
					modules['filteReddit'].toggleNsfwFilter(toggle, true);
				}
			);

		}
	},
	toggleNsfwFilter: function(toggle, notify) {
		if (toggle !== true && toggle === false || modules['filteReddit'].options.NSFWfilter.value) {
			modules['filteReddit'].filterNSFW(false);
			RESUtils.setOption('filteReddit', 'NSFWfilter', false);
			$(modules['filteReddit'].nsfwSwitchToggle).removeClass('enabled');
		} else {
			modules['filteReddit'].filterNSFW(true);
			RESUtils.setOption('filteReddit', 'NSFWfilter', true);
			$(modules['filteReddit'].nsfwSwitchToggle).addClass('enabled');
		}

		if (notify) {
			var onOff = modules['filteReddit'].options.NSFWfilter.value ? 'on' : ' off';

			modules['notifications'].showNotification({
				header: 'NSFW Filter',
				moduleID: 'filteReddit',
				optionKey: 'NSFWfilter',
				message: 'NSFW Filter has been turned ' + onOff + '.'
			}, 4000);
		}
	},
	scanEntries: function(ele) {
		var numFiltered = 0;
		var numNsfwHidden = 0;

		var entries;
		if (ele == null) {
			if (modules['filteReddit'].options.excludeCommentsPage.value) {
				entries = document.querySelectorAll('body:not(.comments-page) #siteTable .link');
			} else {
				entries = document.querySelectorAll('#siteTable .link');
			}
		} else {
			entries = ele.querySelectorAll('div.thing.link');
		}
		// var RALLre = /\/r\/all\/?(([\w]+)\/)?/i;
		// var onRALL = RALLre.exec(location.href);
		var filterSubs = (RESUtils.currentSubreddit('all')) || (RESUtils.currentDomain()) || (RESUtils.currentMultireddit('me/f/all'));
		var onSavedPage = modules['filteReddit'].excludeSaved.test && modules['filteReddit'].excludeSaved.test(location.href);

		for (var i = 0, len = entries.length; i < len; i++) {
			if (!onSavedPage) {
				var postTitle = entries[i].querySelector('.entry a.title').textContent;
				var postDomain = entries[i].querySelector('.entry span.domain > a');
				postDomain = (postDomain) ? postDomain.textContent.toLowerCase() : 'reddit.com'; // ads by redditads does not have a domain
				var thisSubreddit = entries[i].querySelector('.entry a.subreddit');
				var postFlair = entries[i].querySelector('.entry span.linkflairlabel');
				if (thisSubreddit !== null) {
					var postSubreddit = RESUtils.subredditRegex.exec(thisSubreddit.href)[1] || false;
				} else {
					var postSubreddit = false;
				}
				var filtered = false;
				var currSub = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : null;
				filtered = modules['filteReddit'].filterTitle(postTitle, postSubreddit || RESUtils.currentSubreddit());
				if (!filtered) filtered = modules['filteReddit'].filterDomain(postDomain, postSubreddit || currSub);
				if ((!filtered) && (filterSubs) && (postSubreddit)) {
					filtered = modules['filteReddit'].filterSubreddit(postSubreddit);
				}
				if ((!filtered) && (postFlair)) {
					filtered = modules['filteReddit'].filterFlair(postFlair.textContent, postSubreddit || RESUtils.currentSubreddit());
				}
				if (filtered) {
					entries[i].classList.add('RESFiltered')
					numFiltered++;
				}
			}

			if (entries[i].classList.contains('over18')) {
				if (modules['filteReddit'].allowNSFW(postSubreddit, currSub)) {
					entries[i].classList.add('allowOver18');
				} else if (modules['filteReddit'].options.NSFWfilter.value) {
					numNsfwHidden++;
				}
			}
		}

		var notificationThreshold = parseInt(modules['filteReddit'].options.notificationThreshold.value, 10);
		if (typeof notificationThreshold !== "number" || isNaN(notificationThreshold)) {
			notificationThreshold = modules['filteReddit'].options.notificationThreshold.default;
		};
		notificationThreshold = Math.max(0, Math.min(notificationThreshold, 110)); // so users can go the extra 10% to avoid notifications completely
		notificationThreshold /= 100;

		var percentageHidden = (numFiltered + numNsfwHidden) / entries.length;
		if (entries.length && percentageHidden >= notificationThreshold) {
			var notification = [];
			if (!percentageHidden) notification.push('No posts were filtered.');
			if (numFiltered) notification.push(numFiltered + ' post(s) hidden by ' + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'keywords', 'custom filters') + '.');
			if (numNsfwHidden) notification.push(numNsfwHidden + ' post(s) hidden by the ' + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'NSFWfilter', 'NSFW filter') + '.');
			if (numNsfwHidden && modules['filteReddit'].options.NSFWQuickToggle.value) notification.push('You can toggle the nsfw filter in the <span class="gearIcon"></span> menu.');

			var notification = notification.join('<br><br>');
			modules['notifications'].showNotification({
				header: 'Posts Filtered',
				moduleID: 'filteReddit',
				message: notification
			});
		}
	},
	addedNSFWFilterStyle: false,
	addNSFWFilterStyle: function() {
		if (this.addedNSFWFilterStyle) return;
		this.addedNSFWFilterStyle = true;

		RESUtils.addCSS('body:not(.allowOver18) .thing.over18:not(.allowOver18) { display: none !important; }');
	},
	filterNSFW: function(filterOn) {
		this.addNSFWFilterStyle();
		$(document.body).toggleClass('allowOver18');
	},
	filterTitle: function(title, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		return this.filtersMatchString('keywords', title.toLowerCase(), reddit);
	},
	filterDomain: function(domain, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		var domain = (domain) ? domain.toLowerCase() : null;
		return this.filtersMatchString('domains', domain, reddit);
	},
	filterSubreddit: function(subreddit) {
		// check for /r/ hack from when reddit changed its format and broke RES filters
		if (!this.filterFormatChecked) {
			this.checkFilterFormat();
		}
		return this.filtersMatchString('subreddits', subreddit.toLowerCase(), null, true);
	},
	filterFlair: function(flair, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		return this.filtersMatchString('flair', flair.toLowerCase(), reddit);
	},
	checkFilterFormat: function() {
		var i = 0,
			len = this.options.subreddits.value.length,
			check;

		for (; i<len; i++) {
			check = this.options.subreddits.value[i][0];
			if (check.substr(0,3) === '/r/') {
				this.options.subreddits.value[i][0] = check.substr(3);
			}
		}
		// save the options...
		RESStorage.setItem('RESoptions.filteReddit', JSON.stringify(modules['filteReddit'].options));
		this.filterFormatChecked = true;
	},
	_filters: {},
	filters: function(type) {
		var module = modules['filteReddit'];
		var sources = module.options[type].value;
		if (!module._filters[type] || module._filters[type].length !== sources.length) {
			var filters = [];
			module._filters[type] = filters;

			for (var i = 0; i < sources.length; i++) {
				var filter = {};
				filters.push(filter);

				var source = sources[i];
				if (typeof source != "object") {
					source = [ source ];
				}

				var searchString = source[0];
				if (modules['filteReddit'].options.regexpFilters.value && modules['filteReddit'].regexRegex.test(searchString)) {
					var regexp = modules['filteReddit'].regexRegex.exec(searchString);
					try {
						searchString = new RegExp(regexp[1], regexp[2]);
					} catch (e) {
						modules['notifications'].showNotification({
							moduleID: 'filteReddit',
							optionKey: type,
							notificationID: 'badRegexpPattern',
							header: 'filteReddit RegExp issue',
							message: 'There was a problem parsing a RegExp in your filteReddit settings. '
								+ modules['settingsNavigation'].makeUrlHashLink('filteReddit', type, 'Correct it now.')
								+ '<p>RegExp: <code>' + RESUtils.sanitizeHTML(searchString) + '</code></p>'
								+ '<blockquote>' + e.toString() + '</blockquote>'
						});
					}
				} else {
					searchString = searchString.toString().toLowerCase();
				}
				filter.searchString = searchString;

				var applyTo = source[1] || 'everywhere';
				filter.applyTo = applyTo;

				var applyList = (source[2] || '').toLowerCase().split(',');
				filter.applyList = applyList;

				var exceptSearchString = source[3] && source[3].toString().toLowerCase() || '';
				filter.exceptSearchString = exceptSearchString;
			}
		}

		return module._filters[type];
	},
	allowAllNSFW: null, // lazy loaded with boolean-y value
	subredditAllowNsfwOption: null, // lazy loaded with function to get a given subreddit's row in this.options.allowNSFW
	allowNSFW: function(postSubreddit, currSubreddit) {
		if (!this.options.allowNSFW.value || !this.options.allowNSFW.value.length) return false;

		if (typeof currSubreddit === 'undefined') {
			currSubreddit = RESUtils.currentSubreddit();
		}

		if (!this.subredditAllowNsfwOption) {
			this.subredditAllowNsfwOption = RESUtils.indexOptionTable('filteReddit', 'allowNSFW', 0);
		}

		if (this.allowAllNsfw == null && currSubreddit) {
			var optionValue = this.subredditAllowNsfwOption(currSubreddit);
			this.allowAllNsfw = (optionValue && optionValue[1] === 'visit') || false;
		}
		if (this.allowAllNsfw) {
			return true;
		}

		if (!postSubreddit) postSubreddit = currSubreddit;
		if (!postSubreddit) return false;
		var optionValue = this.subredditAllowNsfwOption(postSubreddit);
		if (optionValue) {
			if (optionValue[1] === 'everywhere') {
				return true;
			} else { // optionValue[1] == visit (subreddit or multisubreddit)
				if (RESUtils.inList(postSubreddit, currSubreddit, '+')) {
					return true;
				}
			}
		}
	},
	regexRegex: /^\/(.*)\/([gim]+)?$/,
	filtersMatchString: function(filterType, stringToSearch, reddit, fullmatch) {
		var filters = modules['filteReddit'].filters(filterType);
		if (!filters || !filters.length) return false;
		if (!stringToSearch) {
			// this means a bad filter of some sort...
			return;
		}
		var i = filters.length;
		var result = false;

		while (i--) {
			var filter = filters[i];
			var skipCheck = false;
			// we also want to know if we should be matching /r/all, because when getting
			// listings on /r/all, each post has a subreddit (that does not equal "all")
			var checkRAll = ((RESUtils.currentSubreddit() === 'all') && (filter.applyList.indexOf('all') !== -1));
			switch (filter.applyTo) {
				case 'exclude':
					if ((filter.applyList.indexOf(reddit) !== -1) || (checkRAll)) {
						skipCheck = true;
					}
					break;
				case 'include':
					if ((filter.applyList.indexOf(reddit) === -1) && (!checkRAll)) {
						skipCheck = true;
					}
					break;
			}

			if (!skipCheck && filter.exceptSearchString.length && stringToSearch.indexOf(filter.exceptSearchString) !== -1) {
				skipCheck = true;
			}

			if (skipCheck) {
				// skip checking this filter, duh
				continue;
			} else if (filter.searchString.test) {
				// filter is a regex
				if (filter.searchString.test(stringToSearch)) {
					result = true;
					break;
				}
			} else if (fullmatch) {
				// simple full string match
				if (stringToSearch === filter.searchString) {
					result = true;
					break;
				}
			} else {
				// simple in-string match
				if (stringToSearch.indexOf(filter.searchString) !== -1) {
					result = true;
					break;
				}
			}
		}
		return result;
	},
	toggleFilter: function(e) {
		var thisSubreddit = $(e.target).data('subreddit').toLowerCase();
		var filteredReddits = modules['filteReddit'].options.subreddits.value || [];
		var exists = false;
		for (var i = 0, len = filteredReddits.length; i < len; i++) {
			if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() === thisSubreddit)) {
				exists = true;
				filteredReddits.splice(i, 1);
				e.target.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
				e.target.textContent = '+filter';
				e.target.classList.remove('remove');
				break;
			}
		}
		if (!exists) {
			var thisObj = [thisSubreddit, 'everywhere', ''];
			filteredReddits.push(thisObj);
			e.target.setAttribute('title', 'Stop filtering this subreddit from /r/all and /domain/*');
			e.target.textContent = '-filter';
			e.target.classList.add('remove');
		}
		modules['filteReddit'].options.subreddits.value = filteredReddits;
		// save change to options...
		RESStorage.setItem('RESoptions.filteReddit', JSON.stringify(modules['filteReddit'].options));
	}
};
