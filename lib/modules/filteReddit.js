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
		notification: {
			type: 'boolean',
			value: true,
			description: 'Show a notification when posts are filtered'
		},
		NSFWQuickToggle: {
			type: 'boolean',
			value: true,
			description: 'Add a quick NSFW on/off toggle to the gear menu'
		},
		excludeCommentsPage: {
			type: 'boolean',
			value: true,
			description: 'When visiting the comments page for a filtered link, allow the link/expando to be shown'
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
				}, {
					name: 'reddits',
					type: 'list',
					source: '/api/search_reddit_names.json?app=res',
					hintText: 'type a subreddit name',
					onResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i = 0, len = names.length; i < len; i++) {
							results.push({
								id: names[i],
								name: names[i]
							});
						}
						return results;
					},
					onCachedResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i = 0, len = names.length; i < len; i++) {
							results.push({
								id: names[i],
								name: names[i]
							});
						}
						return results;
					}
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in title keywords you want to ignore if they show up in a title'
		},
		subreddits: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
				name: 'subreddit',
				type: 'text'
			}],
			value: [],
			description: 'Type in a subreddit you want to ignore (only applies to /r/all or /domain/* urls)'
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
				}, {
					name: 'reddits',
					type: 'list',
					source: '/api/search_reddit_names.json?app=res',
					hintText: 'type a subreddit name',
					onResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i = 0, len = names.length; i < len; i++) {
							results.push({
								id: names[i],
								name: names[i]
							});
						}
						return results;
					},
					onCachedResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i = 0, len = names.length; i < len; i++) {
							results.push({
								id: names[i],
								name: names[i]
							});
						}
						return results;
					}
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in domain keywords you want to ignore. Note that \"reddit\" would ignore \"reddit.com\" and \"fooredditbar.com\"'
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
				}, {
					name: 'reddits',
					type: 'list',
					source: '/api/search_reddit_names.json?app=res',
					hintText: 'type a subreddit name',
					onResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i = 0, len = names.length; i < len; i++) {
							results.push({
								id: names[i],
								name: names[i]
							});
						}
						return results;
					},
					onCachedResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i = 0, len = names.length; i < len; i++) {
							results.push({
								id: names[i],
								name: names[i]
							});
						}
						return results;
					}
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in keywords you want to ignore if they are contained in link flair'
		},
		allowNSFW: {
			type: 'table',
			addRowText: "+add subreddits",
			description: "Whitelist subreddits from NSFW filter",
			fields: [{
				name: 'subreddits',
				type: 'list',
				source: '/api/search_reddit_names.json?app=res',
				hintText: 'type a subreddit name',
				onResult: function(response) {
					var names = response.names;
					var results = [];
					for (var i = 0, len = names.length; i < len; i++) {
						results.push({
							id: names[i],
							name: names[i]
						});
					}
					return results;
				},
				onCachedResult: function(response) {
					var names = response.names;
					var results = [];
					for (var i = 0, len = names.length; i < len; i++) {
						results.push({
							id: names[i],
							name: names[i]
						});
					}
					return results;
				}
			}, {
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
			}]
		}
	},
	description: 'Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all or /domain/*).',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/?(?:\??[\w]+=[\w]+&?)*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
	],
	exclude: [
		// /^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		// /^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
		/^https?:\/\/([a-z]+)\.reddit\.com\/saved\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/over18.*/i,
	],
	isMatchURL: function() {
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
			var thisFrag = document.createDocumentFragment();
			this.nsfwSwitch = document.createElement('li');
			this.nsfwSwitch.setAttribute('title', "Toggle NSFW Filter");
			this.nsfwSwitch.addEventListener('click', function(e) {
				e.preventDefault();
				modules['filteReddit'].toggleNsfwFilter();
			}, true);
			this.nsfwSwitch.textContent = 'nsfw filter';
			this.nsfwSwitchToggle = RESUtils.createElementWithID('div', 'nsfwSwitchToggle', 'toggleButton');
			$(this.nsfwSwitchToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
			this.nsfwSwitch.appendChild(this.nsfwSwitchToggle);
			(this.options.NSFWfilter.value) ? this.nsfwSwitchToggle.classList.add('enabled') : this.nsfwSwitchToggle.classList.remove('enabled');
			thisFrag.appendChild(this.nsfwSwitch);
			$('#RESDropdownOptions').append(this.nsfwSwitch);
		}

		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.scanEntries();
			RESUtils.watchForElement('siteTable', modules['filteReddit'].scanEntries);
		}
	},
	toggleNsfwFilter: function(toggle, notify) {
		if (toggle !== true && toggle === false || modules['filteReddit'].options.NSFWfilter.value == true) {
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
		var filterSubs = (RESUtils.currentSubreddit('all')) || (RESUtils.currentDomain());
		for (var i = 0, len = entries.length; i < len; i++) {
			var postTitle = entries[i].querySelector('.entry a.title').innerHTML;
			var postDomain = entries[i].querySelector('.entry span.domain > a').innerHTML.toLowerCase();
			var thisSubreddit = entries[i].querySelector('.entry a.subreddit');
			var postFlair = entries[i].querySelector('.entry span.linkflairlabel');
			if (thisSubreddit !== null) {
				var postSubreddit = thisSubreddit.innerHTML;
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

			if (entries[i].classList.contains('over18')) {
				if (modules['filteReddit'].allowNSFW(postSubreddit, currSub)) {
					entries[i].classList.add('allowOver18');
				} else if (modules['filteReddit'].options.NSFWfilter.value) {
					numNsfwHidden++;
				}
			}
		}

		if ((numFiltered || numNsfwHidden) && modules['filteReddit'].options.notification.value) {
			var notification = [];
			if (numFiltered) notification.push(numFiltered + ' post(s) hidden by ' + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'keywords', 'custom filters') + '.');
			if (numNsfwHidden) notification.push(numNsfwHidden + ' post(s) hidden by the ' + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'NSFWfilter', 'NSFW filter') + '.');
			if (numNsfwHidden && modules['filteReddit'].options.NSFWQuickToggle.value) notification.push('You can toggle the nsfw filter in the <span class="gearIcon"></span> menu.');

			notification.push("To hide this message, disable the " + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'notification', 'filteReddit notification') + '.');
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

		RESUtils.addCSS('body:not(.allowOver18) .over18 { display: none !important; }');
		RESUtils.addCSS('.thing.over18.allowOver18 { display: block !important; }');
	},
	filterNSFW: function(filterOn) {
		this.addNSFWFilterStyle();
		$(document.body).toggleClass('allowOver18');
	},
	filterTitle: function(title, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		return this.arrayContainsSubstring(this.options.keywords.value, title.toLowerCase(), reddit);
	},
	filterDomain: function(domain, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		var domain = (domain) ? domain.toLowerCase() : null;
		return this.arrayContainsSubstring(this.options.domains.value, domain, reddit);
	},
	filterSubreddit: function(subreddit) {
		return this.arrayContainsSubstring(this.options.subreddits.value, subreddit.toLowerCase(), null, true);
	},
	filterFlair: function(flair, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		return this.arrayContainsSubstring(this.options.flair.value, flair.toLowerCase(), reddit);
	},
	allowAllNSFW: null, // lazy loaded with boolean-y value
	subredditAllowNsfwOption: null, // lazy loaded with function to get a given subreddit's row in this.options.allowNSFW
	allowNSFW: function(postSubreddit, currSubreddit) {
		if (!this.options.allowNSFW.value || !this.options.allowNSFW.value.length) return false;

		if (typeof currSubreddit === "undefined") {
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
	unescapeHTML: function(theString) {
		var temp = document.createElement("div");
		$(temp).html(theString);
		var result = temp.childNodes[0].nodeValue;
		temp.removeChild(temp.firstChild);
		delete temp;
		return result;
	},
	arrayContainsSubstring: function(obj, stringToSearch, reddit, fullmatch) {
		if (!obj) return false;
		stringToSearch = this.unescapeHTML(stringToSearch);
		var i = obj.length;
		while (i--) {
			if ((typeof obj[i] !== 'object') || (obj[i].length < 3)) {
				if (obj[i].length === 1) obj[i] = obj[i][0];
				obj[i] = [obj[i], 'everywhere', ''];
			}
			var searchString = obj[i][0];
			var applyTo = obj[i][1];
			var applyList = obj[i][2].toLowerCase().split(',');
			var skipCheck = false;
			// we also want to know if we should be matching /r/all, because when getting
			// listings on /r/all, each post has a subreddit (that does not equal "all")
			var checkRAll = ((RESUtils.currentSubreddit() === "all") && (applyList.indexOf("all") !== -1));
			switch (applyTo) {
				case 'exclude':
					if ((applyList.indexOf(reddit) !== -1) || (checkRAll)) {
						skipCheck = true;
					}
					break;
				case 'include':
					if ((applyList.indexOf(reddit) === -1) && (!checkRAll)) {
						skipCheck = true;
					}
					break;
			}
			// if fullmatch is defined, don't do a substring match... this is used for subreddit matching on /r/all for example
			if ((!skipCheck) && (fullmatch) && (obj[i] !== null) && (stringToSearch.toLowerCase() === searchString.toLowerCase())) return true;
			if ((!skipCheck) && (!fullmatch) && (obj[i] !== null) && (stringToSearch.indexOf(searchString.toString().toLowerCase()) !== -1)) {
				return true;
			}
		}
		return false;
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
