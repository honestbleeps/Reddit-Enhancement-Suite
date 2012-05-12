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
		NSFWQuickToggle: {
			type: 'boolean',
			value: true,
			description: 'Add a quick NSFW on/off toggle to the gear menu'
		},
		keywords: {
			type: 'table',
			addRowText: '+add filter',
			fields: [
				{ name: 'keyword', type: 'text' },
				{ name: 'applyTo',
					type: 'enum',
					values: [
						{ name: 'Everywhere', value: 'everywhere' },
						{ name: 'Everywhere but:', value: 'exclude' },
						{ name: 'Only on:', value: 'include' }
					],
					value: 'everywhere',
					description: 'Apply filter to:'
				},
				{ 
					name: 'reddits', 
					type: 'list', 
					source: '/api/search_reddit_names.json?app=res', 
					hintText: 'type a subreddit name',
					onResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i=0, len=names.length; i<len; i++) {
							results.push({id: names[i], name: names[i]});
						}
						return results;
					}					
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [
			],
			description: 'Type in title keywords you want to ignore if they show up in a title'
		},
		subreddits: {
			type: 'table',
			addRowText: '+add filter',
			fields: [
				{ name: 'subreddit', type: 'text' }
			],
			value: [
			],
			description: 'Type in a subreddit you want to ignore (only applies to /r/all)'
		},
		domains: {
			type: 'table',
			addRowText: '+add filter',
			fields: [
				{ name: 'domain', type: 'text' },
				{ name: 'applyTo',
					type: 'enum',
					values: [
						{ name: 'Everywhere', value: 'everywhere' },
						{ name: 'Everywhere but:', value: 'exclude' },
						{ name: 'Only on:', value: 'include' }
					],
					value: 'everywhere',
					description: 'Apply filter to:'
				},
				{ 
					name: 'reddits', 
					type: 'list', 
					source: '/api/search_reddit_names.json?app=res', 
					hintText: 'type a subreddit name',
					onResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i=0, len=names.length; i<len; i++) {
							results.push({id: names[i], name: names[i]});
						}
						return results;
					}					
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [
			],
			description: 'Type in domain keywords you want to ignore. Note that \"reddit\" would ignore \"reddit.com\" and \"fooredditbar.com\"'
		}
	},
	description: 'Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all).',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/?(?:\??[\w]+=[\w]+&?)*/i,
		/https?:\/\/([a-z]+).reddit.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
	),
	exclude: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/saved\/?/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled()) {
			RESUtils.addCSS('#nsfwSwitchToggle { float: right; margin-right: 10px; margin-top: 10px; line-height: 10px; }');
			RESUtils.addCSS('.RESFilterToggle { margin-right: 5px; color: white; background-image: url(/static/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('.RESFilterToggle.remove { background-image: url(/static/bg-button-remove.png) }');
			RESUtils.addCSS('.RESFiltered { display: none !important; }');
			if (this.options.NSFWfilter.value) {
				RESUtils.addCSS('.over18 { display: none !important; }');
			}
		}
	},
	go: function() {
		// shh I'm cheating. This runs the toggle on every single page, bypassing isMatchURL.
		if ((this.isEnabled()) && (this.options.NSFWQuickToggle.value)) {
			var thisFrag = document.createDocumentFragment();
			this.nsfwSwitch = document.createElement('li');
			this.nsfwSwitch.setAttribute('title',"Toggle NSFW Filter");
			this.nsfwSwitch.addEventListener('click',function(e) {
				e.preventDefault();
				if (modules['filteReddit'].options.NSFWfilter.value == true) {
					modules['filteReddit'].filterNSFW(false);
					RESUtils.setOption('filteReddit','NSFWfilter',false);
					removeClass(modules['filteReddit'].nsfwSwitchToggle, 'enabled');
				} else {
					modules['filteReddit'].filterNSFW(true);
					RESUtils.setOption('filteReddit','NSFWfilter',true);
					addClass(modules['filteReddit'].nsfwSwitchToggle, 'enabled');
				}
			}, true);
			this.nsfwSwitch.innerHTML = 'nsfw filter';
			this.nsfwSwitchToggle = createElementWithID('div','nsfwSwitchToggle','toggleButton');
			this.nsfwSwitchToggle.innerHTML = '<span class="toggleOn">on</span><span class="toggleOff">off</span>';
			this.nsfwSwitch.appendChild(this.nsfwSwitchToggle);
			(this.options.NSFWfilter.value) ? addClass(this.nsfwSwitchToggle, 'enabled') : removeClass(this.nsfwSwitchToggle, 'enabled');
			thisFrag.appendChild(this.nsfwSwitch);
			$('#RESDropdownOptions').append(this.nsfwSwitch);
		}

		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
					modules['filteReddit'].scanEntries(event.target);
				}
			}, true);
			this.scanEntries();
		}
	},
	scanEntries: function(ele) {
		if (ele == null) {
			var entries = document.querySelectorAll('#siteTable div.thing.link');
		} else {
			var entries = ele.querySelectorAll('div.thing.link');
		}
		// var RALLre = /\/r\/all\/?(([\w]+)\/)?/i;
		// var onRALL = RALLre.exec(location.href);
		var onRALL = (RESUtils.currentSubreddit('all'));
		for (var i=0, len=entries.length; i<len;i++) {
			var postTitle = entries[i].querySelector('.entry a.title').innerHTML;
			var postDomain = entries[i].querySelector('.entry span.domain > a').innerHTML.toLowerCase();
			var thisSubreddit = entries[i].querySelector('.entry a.subreddit');
			if (thisSubreddit != null) {
				var postSubreddit = thisSubreddit.innerHTML;
			} else {
				var postSubreddit = false;
			}
			var filtered = false;
			var currSub = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : null;
			filtered = this.filterTitle(postTitle, postSubreddit || RESUtils.currentSubreddit());
			if (!filtered) filtered = this.filterDomain(postDomain, postSubreddit || currSub);
			if ((!filtered) && (onRALL) && (postSubreddit)) {
				filtered = this.filterSubreddit(postSubreddit);
			}
			if (filtered) {
				addClass(entries[i],'RESFiltered')
			}
		}
	},
	filterNSFW: function(filterOn) {
		if (filterOn == true) {
			$('.over18').hide();
		} else {
			$('.over18').show();
		}
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
	unescapeHTML: function(theString) {
		var temp = document.createElement("div");
		temp.innerHTML = theString;
		var result = temp.childNodes[0].nodeValue;
		temp.removeChild(temp.firstChild);
		delete temp;
		return result;	
	},
	arrayContainsSubstring: function(obj, stringToSearch, reddit, fullmatch) {
		stringToSearch = this.unescapeHTML(stringToSearch);
		var i = obj.length;
		while (i--) {
			if ((typeof(obj[i]) != 'object') || (obj[i].length<3)) {
				if (obj[i].length == 1) obj[i] = obj[i][0];
				obj[i] = [obj[i], 'everywhere',''];
			}
			var searchString = obj[i][0];
			var applyTo = obj[i][1];
			var applyList = obj[i][2].toLowerCase().split(',');
			var skipCheck = false;
			switch (applyTo) {
				case 'exclude':
					if (applyList.indexOf(reddit) != -1) {
						skipCheck = true;
					}
					break;
				case 'include':
					if (applyList.indexOf(reddit) == -1) {
						skipCheck = true;
					}
					break;
			}
			// if fullmatch is defined, don't do a substring match... this is used for subreddit matching on /r/all for example
			if ((!skipCheck) && (fullmatch) && (obj[i] != null) && (stringToSearch.toLowerCase() == searchString.toLowerCase())) return true;
			if ((!skipCheck) && (!fullmatch) && (obj[i] != null) && (stringToSearch.indexOf(searchString.toString().toLowerCase()) != -1)) {
				return true;
			}
		}
		return false;
	},
	toggleFilter: function(e) {
		var thisSubreddit = e.target.getAttribute('subreddit').toLowerCase();
		var filteredReddits = modules['filteReddit'].options.subreddits.value || [];
		var exists=false;
		for (var i=0, len=filteredReddits.length; i<len; i++) {
			if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() == thisSubreddit)) {
				exists=true;
				filteredReddits.splice(i,1);
				e.target.setAttribute('title','Filter this subreddit form /r/all');
				e.target.innerHTML = '+filter';
				removeClass(e.target,'remove');
				break;
			}
		}
		if (!exists) {
			var thisObj = [thisSubreddit, 'everywhere',''];
			filteredReddits.push(thisObj);
			e.target.setAttribute('title','Stop filtering this subreddit from /r/all');
			e.target.innerHTML = '-filter';
			addClass(e.target,'remove');
		}
		modules['filteReddit'].options.subreddits.value = filteredReddits;
		// save change to options...
		RESStorage.setItem('RESoptions.filteReddit', JSON.stringify(modules['filteReddit'].options));
	}
};
