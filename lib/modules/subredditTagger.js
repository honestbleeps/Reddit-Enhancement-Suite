addModule('subRedditTagger', function(module, moduleID) {
	module.moduleName = 'Subreddit Tagger';
	module.category = [ 'Subreddits' ];
	module.description = 'Adds tags to posts based on which subreddit they were posted to.';
	module.options = {
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
	};

	var SRTDoesntContain = [];
	var SRTTagWith = [];

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			checkForOldSettings();
			loadSRTRules();

			RESUtils.watchForElement('siteTable', scanTitles);
			scanTitles();
		}
	};

	function loadSRTRules() {
		var subReddits = module.options.subReddits.value;
		for (var i = 0, len = subReddits.length; i < len; i++) {
			var thisGetArray = subReddits[i];
			if (thisGetArray) {
				SRTDoesntContain[thisGetArray[0].toLowerCase()] = thisGetArray[1];
				SRTTagWith[thisGetArray[0].toLowerCase()] = thisGetArray[2];
			}
		}
	}

	function scanTitles(obj) {
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

			var tagToAdd = getTagForEntry(entries[i]);
			if (tagToAdd !== undefined) {
				var tagText = $('<span>').append(escapeHTML(tagToAdd)).append('&nbsp;');
				title.prepend(tagText);
			}
		}
	}

	function getTagForEntry(entry) {
		var hasTag = false;
		var tagWith;

		var thisSubReddit = RESUtils.subredditForPost(entry).toLowerCase();
		do {
			if (thisSubReddit.length) {
				if (SRTTagWith.hasOwnProperty(thisSubReddit)) {
					if (thisSubReddit && !SRTDoesntContain[thisSubReddit]) {
						SRTDoesntContain[thisSubReddit] = '[' + thisSubReddit + ']';
					}
					var thisTitle = entry.querySelector('a.title');
					var thisString = SRTDoesntContain[thisSubReddit];
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

		if (!hasTag && SRTTagWith.hasOwnProperty(thisSubReddit)) {
			tagWith = SRTTagWith[thisSubReddit];
		}

		return tagWith;
	}

	function checkForOldSettings() {
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
			module.options['subReddits'].value = settingsCopy;
			update = true;
		}

		for (var i = 0, length = module.options['subReddits'].value.length; i < length; i++) {
			var current = module.options['subReddits'].value[i];
			if (current[0].indexOf('/r/') === 0) {
				current[0] = current[0].slice('/r/'.length);
				update = true;
			}
		}

		if (update) {
			RESUtils.options.setOption('subRedditTagger', 'subReddits', module.options['subReddits'].value);
		}
	}
});
