modules['subRedditTagger'] = {
	moduleID: 'subRedditTagger',
	moduleName: 'Subreddit Tagger',
	category: 'Filters',
	options: {
		subReddits: {
			type: 'table',
			addRowText: '+add tag',
			fields: [
				{ name: 'subreddit', type: 'text' },
				{ name: 'doesntContain', type: 'text' },
				{ name: 'tag', type: 'text' }
			],
			value: [
				/*
				['somebodymakethis','SMT','[SMT]'],
				['pics','pic','[pic]']
				*/
			],
			description: 'Set your subreddits below. For that subreddit, if the title of the post doesn\'t contain what you place in the "doesn\'t contain" field, the subreddit will be tagged with whatever you specify.'
		}
	},
	description: 'Adds tags to posts on subreddits (i.e. [SMT] on SomebodyMakeThis when the user leaves it out)',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			this.checkForOldSettings();
			this.SRTDoesntContain = [];
			this.SRTTagWith = [];
			this.loadSRTRules();
			
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
					modules['subRedditTagger'].scanTitles(event.target);
				}
			}, true);
			this.scanTitles();
			
		}
	},
	loadSRTRules: function () {
		var subReddits = this.options.subReddits.value;
		for (var i=0, len=subReddits.length; i<len; i++) {
			var thisGetArray = subReddits[i];
			if (thisGetArray) {
				this.SRTDoesntContain[thisGetArray[0].toLowerCase()] = thisGetArray[1];
				this.SRTTagWith[thisGetArray[0].toLowerCase()] = thisGetArray[2];
			}
		}
	},
	scanTitles: function(obj) {
		var qs = '#siteTable > .thing > DIV.entry';
		if (obj) {
			qs = '.thing > DIV.entry';
		} else {
			obj = document;
		}
		var entries = obj.querySelectorAll(qs);
		for (var i=0, len=entries.length; i<len;i++) {
			var thisSubRedditEle = entries[i].querySelector('A.subreddit');
			if ((typeof(thisSubRedditEle) != 'undefined') && (thisSubRedditEle != null)) {
				var thisSubReddit = thisSubRedditEle.innerHTML.toLowerCase();
				if (typeof(this.SRTDoesntContain[thisSubReddit]) != 'undefined') {
					var thisTitle = entries[i].querySelector('a.title');
					if (!(hasClass(thisTitle, 'srTagged'))) {
						addClass(thisTitle, 'srTagged');
						var thisString = this.SRTDoesntContain[thisSubReddit];
						var thisTagWith = this.SRTTagWith[thisSubReddit];
						if (thisTitle.text.indexOf(thisString) == -1) {
							thisTitle.innerHTML = thisTagWith + ' ' + thisTitle.innerHTML;
						}
					}
				}
			}
		}
	},
	checkForOldSettings: function() {
		var settingsCopy = [];
		var subRedditCount = 0;
		while (RESStorage.getItem('subreddit_' + subRedditCount)) {
			var thisGet = RESStorage.getItem('subreddit_' + subRedditCount).replace(/\"/g,"");
			var thisGetArray = thisGet.split("|");
			settingsCopy[subRedditCount] = thisGetArray;
			RESStorage.removeItem('subreddit_' + subRedditCount);
			subRedditCount++;
		}
		if (subRedditCount > 0) {
			RESUtils.setOption('subRedditTagger', 'subReddits', settingsCopy);
		}
	}

};
