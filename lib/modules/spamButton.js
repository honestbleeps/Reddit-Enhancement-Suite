import { $ } from '../vendor';
import {
	currentUserProfile,
	forEachChunked,
	loggedInUser,
	watchForElement,
} from '../utils';

export const module = {};

module.moduleID = 'spamButton';
module.moduleName = 'Spam Button';
module.category = 'Submissions';
module.disabledByDefault = true;
module.description = 'Adds a Spam button to posts for easy reporting.';

module.include = ['linklist', 'modqueue', 'comments', 'profile'];

module.go = function() {
	// credit to tico24 for the idea, here: http://userscripts.org/scripts/review/84454
	// code adapted for efficiency...
	if (loggedInUser() !== currentUserProfile()) {
		watchForElement('siteTable', addSpamButtons);
		watchForElement('newComments', addSpamButtons);
		addSpamButtons();
	}
};

function addSpamButtons(ele = document) {
	const allLists = ele.querySelectorAll('.thing:not(.deleted):not(.morerecursion):not(.morechildren) > .entry .buttons');
	allLists::forEachChunked(list => {
		const spam = document.createElement('li');
		// insert spam button second to last in the list... this is a bit hacky and assumes singleClick is enabled...
		// it should probably be made smarter later, but there are so many variations of configs, etc, that it's a bit tricky.
		$(list.lastChild).before(spam);

		// it's faster to figure out the author only if someone actually clicks the link, so we're modifying the code to listen for clicks and not do all that queryselector stuff.
		const a = document.createElement('a');
		a.setAttribute('class', 'option');
		a.setAttribute('title', 'Report this user as a spammer');
		a.addEventListener('click', reportPost);
		a.setAttribute('href', '#');
		a.textContent = 'rts';
		a.title = 'spam';
		spam.appendChild(a);
	});
}

function reportPost(e) {
	const a = e.target;
	const authorProfileContainer = a.parentNode.parentNode.parentNode;
	const authorProfileLink = authorProfileContainer.querySelector('.author');
	const href = authorProfileLink.href;
	const authorName = authorProfileLink.textContent;
	a.setAttribute('href', `/r/spam/submit?url=${href}&title=overview for ${authorName}`);
	a.setAttribute('target', '_blank');
}
