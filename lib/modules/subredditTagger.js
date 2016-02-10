addModule('subRedditTagger', (module, moduleID) => {
	module.moduleName = 'Subreddit Tagger';
	module.category = ['Subreddits'];
	module.description = 'Add custom text to the beginning of submission titles on your front page and /r/all. Useful for adding context to submissions.';
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
			description: '<p>Description:</p><dl><dt>subreddit</dt><dd>Name of the subreddit, without slashes.</dd><dt>doesntContain</dt><dd>Any string of text that could be present in a submission title. If a title contains this string, the tag will not be applied.</dd><dt>tag</dt><dd>The text that will appear at the beginning of submission titles. E.g. use [tag], (tag), TAG | , etc...</dd></dl>'
		}
	};

	const SRTDoesntContain = [];
	const SRTTagWith = [];

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			checkForOldSettings();
			loadSRTRules();

			RESUtils.watchForElement('siteTable', scanTitles);
			scanTitles();
		}
	};

	function loadSRTRules() {
		const subReddits = module.options.subReddits.value;
		for (let i = 0; i < subReddits.length; i++) {
			const thisGetArray = subReddits[i];
			if (thisGetArray) {
				SRTDoesntContain[thisGetArray[0].toLowerCase()] = thisGetArray[1];
				SRTTagWith[thisGetArray[0].toLowerCase()] = thisGetArray[2];
			}
		}
	}

	function scanTitles(obj) {
		let qs = '#siteTable > .thing > DIV.entry';
		if (obj) {
			qs = '.thing > DIV.entry';
		} else {
			obj = document;
		}
		const entries = obj.querySelectorAll(qs);
		for (let i = 0; i < entries.length; i++) {
			const title = $(entries[i]).find('a.title');
			if (title.is('.srTagged')) continue;
			title.addClass('srTagged');

			const tagToAdd = getTagForEntry(entries[i]);
			if (tagToAdd !== undefined) {
				const tagText = $('<span>').append(escapeHTML(tagToAdd)).append('&nbsp;');
				title.prepend(tagText);
			}
		}
	}

	function getTagForEntry(entry) {
		let hasTag = false;

		const thisSubReddit = RESUtils.subredditForPost(entry).toLowerCase();
		if (thisSubReddit.length) {
			if (SRTTagWith.hasOwnProperty(thisSubReddit)) {
				if (thisSubReddit && !SRTDoesntContain[thisSubReddit]) {
					SRTDoesntContain[thisSubReddit] = `[${thisSubReddit}]`;
				}
				const thisString = SRTDoesntContain[thisSubReddit];
				hasTag = entry.querySelector('a.title').innerText.includes(thisString) ||
					$(entry).find('.linkflairlabel').text().includes(thisString);
			}
		}

		if (!hasTag && SRTTagWith.hasOwnProperty(thisSubReddit)) {
			return SRTTagWith[thisSubReddit];
		}
	}

	async function checkForOldSettings() {
		let update = false;

		const settingsCopy = [];
		let subRedditCount = 0;
		let currentItem;
		while ((currentItem = await RESEnvironment.storage.getRaw(`subreddit_${subRedditCount}`))) { // eslint-disable-line babel/no-await-in-loop
			settingsCopy[subRedditCount] = currentItem.replace(/\"/g, '').split('|');
			RESEnvironment.storage.delete(`subreddit_${subRedditCount}`);
			subRedditCount++;
		}

		if (subRedditCount > 0) {
			module.options['subReddits'].value = settingsCopy;
			update = true;
		}

		for (let i = 0; i < module.options['subReddits'].value.length; i++) {
			const current = module.options['subReddits'].value[i];
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
