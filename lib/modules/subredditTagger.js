modules['subRedditTagger'] = {
	moduleID: 'subRedditTagger',
	moduleName: 'Subreddit Tagger',
	category: 'Filters',
	options: {
		subReddits: {
			type: 'table',
			addRowText: '+add tag',
			fields: [{
				name: 'subreddit',
				type: 'text'
			}, {
				name: 'doesntContain',
				type: 'text'
			}, {
				name: 'tag',
				type: 'text'
			}],
			value: [
				/*
				['somebodymakethis','SMT','[SMT]'],
				['pics','pic','[pic]']
				*/
			],
			description: 'Set your subreddit-specific tags below. You can avoid double tagging a post that has already been tagged by using the "doesntContain" field. So, if you want to make sure that all <a href=\"http://www.reddit.com/r/tipofmytongue\">/r/tipofmytongue</a> posts are tagged [TOMT], even if the user has forgotten, you\'d put "tipofmytongue" as the subreddit, "TOMT" in the "doesntContain" field, and "[TOMT]" in the tag field. Subreddit tagger only looks at the text of the title, it does not check flair.'
	},
	description: 'Adds tags to posts based on which subreddit they were posted to.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.checkForOldSettings();
			this.SRTDoesntContain = [];
			this.SRTTagWith = [];
			this.loadSRTRules();

			RESUtils.watchForElement('siteTable', modules['subRedditTagger'].scanTitles);
			this.scanTitles();

		}
	},
	loadSRTRules: function() {
		var subReddits = this.options.subReddits.value;
		for (var i = 0, len = subReddits.length; i < len; i++) {
			var thisGetArray = subReddits[i];
			if (thisGetArray) {
				modules['subRedditTagger'].SRTDoesntContain[thisGetArray[0].toLowerCase()] = thisGetArray[1];
				modules['subRedditTagger'].SRTTagWith[thisGetArray[0].toLowerCase()] = thisGetArray[2];
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
		for (var i = 0, len = entries.length; i < len; i++) {
			var thisSubRedditEle = entries[i].querySelector('A.subreddit');
			if ((typeof thisSubRedditEle !== 'undefined') && (thisSubRedditEle !== null)) {
				var thisSubReddit = thisSubRedditEle.innerHTML.toLowerCase();
				if (typeof modules['subRedditTagger'].SRTTagWith[thisSubReddit] !== 'undefined') {
					if (thisSubReddit && !modules['subRedditTagger'].SRTDoesntContain[thisSubReddit]) {
						modules['subRedditTagger'].SRTDoesntContain[thisSubReddit] = '[' + thisSubReddit + ']';
					}
					var thisTitle = entries[i].querySelector('a.title');
					if (!thisTitle.classList.contains('srTagged')) {
						thisTitle.classList.add('srTagged');
						var thisString = modules['subRedditTagger'].SRTDoesntContain[thisSubReddit];
						var thisTagWith = modules['subRedditTagger'].SRTTagWith[thisSubReddit];
						if (thisTitle.text.indexOf(thisString) === -1) {
							$(thisTitle).text(escapeHTML(thisTagWith) + ' ' + $(thisTitle).text());
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
			var thisGet = RESStorage.getItem('subreddit_' + subRedditCount).replace(/\"/g, "");
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
