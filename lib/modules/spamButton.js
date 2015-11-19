addModule('spamButton', {
	moduleID: 'spamButton',
	moduleName: 'Spam Button',
	category: 'Submissions',
	disabledByDefault: true,
	options: {},
	description: 'Adds a Spam button to posts for easy reporting.',
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
			// check if the spam button was on by default from an old install of RES.  Per Reddit Admin request, this is being
			// disabled by default due to excess misuse, but people who want to purposefully re-enable it may do so.
			var reset = RESStorage.getItem('RESmodules.spamButton.reset');
			if (!reset) {
				RESStorage.setItem('RESmodules.spamButton.reset', 'true');
				RESUtils.options.enableModule('spamButton', false);
			}

			// credit to tico24 for the idea, here: http://userscripts.org/scripts/review/84454
			// code adapted for efficiency...
			if (RESUtils.loggedInUser() !== RESUtils.currentUserProfile()) {
				RESUtils.watchForElement('siteTable', modules['spamButton'].addSpamButtons);
				RESUtils.watchForElement('newComments', modules['spamButton'].addSpamButtons);
				this.addSpamButtons();
			}
		}
	},
	addSpamButtons: function(ele) {
		ele = ele || document;
		if ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments') || (RESUtils.pageType() === 'profile')) {
			var allLists = ele.querySelectorAll('.thing:not(.deleted):not(.morerecursion):not(.morechildren) > .entry .buttons');
			for (var i = 0, len = allLists.length; i < len; i++) {
				var spam = document.createElement('li');
				// insert spam button second to last in the list... this is a bit hacky and assumes singleClick is enabled...
				// it should probably be made smarter later, but there are so many variations of configs, etc, that it's a bit tricky.
				allLists[i].lastChild.parentNode.insertBefore(spam, allLists[i].lastChild);

				// it's faster to figure out the author only if someone actually clicks the link, so we're modifying the code to listen for clicks and not do all that queryselector stuff.
				var a = document.createElement('a');
				a.setAttribute('class', 'option');
				a.setAttribute('title', 'Report this user as a spammer');
				a.addEventListener('click', modules['spamButton'].reportPost, false);
				a.setAttribute('href', '#');
				a.textContent = 'rts';
				a.title = 'spam';
				spam.appendChild(a);
			}
		}
	},
	reportPost: function(e) {
		var a = e.target;
		var authorProfileContainer = a.parentNode.parentNode.parentNode;
		var authorProfileLink = authorProfileContainer.querySelector('.author');
		var href = authorProfileLink.href;
		var authorName = authorProfileLink.textContent;
		a.setAttribute('href', '/r/spam/submit?url=' + href + '&title=overview for ' + authorName);
		a.setAttribute('target', '_blank');
	}
});
