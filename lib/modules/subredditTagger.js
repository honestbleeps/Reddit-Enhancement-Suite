addModule('subRedditTagger', {
	moduleID: 'subRedditTagger',
	moduleName: 'Subreddit Tagger',
	category: [ 'Subreddits' ],
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
			description: 'Set your subreddit-specific tags below. You can avoid double tagging a post that has already been tagged by using the "doesntContain" field. So, if you want to make sure that all <a href="http://www.reddit.com/r/tipofmytongue">/r/tipofmytongue</a> posts are tagged [TOMT], even if the user has forgotten, then put "tipofmytongue" as the subreddit, "TOMT" in the "doesntContain" field, and "[TOMT]" in the tag field. Subreddit tagger looks for the "doesntContain" text in the post\'s title and flair'
		}
	},
	description: 'Adds tags to posts based on which subreddit they were posted to.',
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
			var title = $(entries[i]).find('a.title');
			if (title.is('.srTagged')) continue;
			title.addClass('srTagged');

			var tagToAdd = modules['subRedditTagger'].getTagForEntry(entries[i]);
			if (tagToAdd !== undefined) {
				var tagText = $('<span>').append(escapeHTML(tagToAdd)).append('&nbsp;');
				title.prepend(tagText);
			}
		}
	},
	getTagForEntry: function(entry) {
		var hasTag = false;
		var tagWith;

		var thisSubReddit = RESUtils.subredditForPost(entry).toLowerCase();
		do {
			if (thisSubReddit.length) {
				if (modules['subRedditTagger'].SRTTagWith.hasOwnProperty(thisSubReddit)) {
					if (thisSubReddit && !modules['subRedditTagger'].SRTDoesntContain[thisSubReddit]) {
						modules['subRedditTagger'].SRTDoesntContain[thisSubReddit] = '[' + thisSubReddit + ']';
					}
					var thisTitle = entry.querySelector('a.title');
					var thisString = modules['subRedditTagger'].SRTDoesntContain[thisSubReddit];
					if (thisTitle.text.indexOf(thisString) !== -1) {
						hasTag = true;
						break;
					}

					var thisFlair = $(entry).find('.linkflairlabel').text();
					if (thisFlair.indexOf(thisString) !== -1) {
						hasTag = true;
						break;
					}
				}
			}
		} while (false);

		if (!hasTag && modules['subRedditTagger'].SRTTagWith.hasOwnProperty(thisSubReddit)) {
			tagWith = modules['subRedditTagger'].SRTTagWith[thisSubReddit];
		}

		return tagWith;
	},
	checkForOldSettings: function() {
		var update = false;

		var settingsCopy = [];
		var subRedditCount = 0;
		while (RESStorage.getItem('subreddit_' + subRedditCount)) {
			var thisGet = RESStorage.getItem('subreddit_' + subRedditCount).replace(/\"/g, '');
			var thisGetArray = thisGet.split('|');
			settingsCopy[subRedditCount] = thisGetArray;
			RESStorage.removeItem('subreddit_' + subRedditCount);
			subRedditCount++;
		}

		if (subRedditCount > 0) {
			modules['subRedditTagger'].options['subReddits'].value = settingsCopy;
			update = true;
		}

		for (var i = 0, length = modules['subRedditTagger'].options['subReddits'].value.length; i < length; i++) {
			var current = modules['subRedditTagger'].options['subReddits'].value[i];
			if (current[0].indexOf('/r/') === 0) {
				current[0] = current[0].slice('/r/'.length);
				update = true;
			}
		}

		if (update) {
			RESUtils.options.setOption('subRedditTagger', 'subReddits', modules['subRedditTagger'].options['subReddits'].value);
		}
	}
});
