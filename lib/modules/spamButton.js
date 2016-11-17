/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	currentUserProfile,
	forEachChunked,
	loggedInUser,
	watchForElement,
} from '../utils';

export const module: Module<*> = new Module('spamButton');

module.moduleName = 'spamButtonName';
module.category = 'submissionsCategory';
module.disabledByDefault = true;
module.description = 'spamButtonDesc';

module.include = ['linklist', 'modqueue', 'comments', 'profile'];

module.go = () => {
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
	forEachChunked(allLists, list => {
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

function reportPost(e: Event) {
	const $spamButton = $(e.target);
	const $author = $spamButton.closest('.entry').find('.author');
	const href = $author.attr('href');
	const authorName = $author.text();
	$spamButton
		.attr('href', `/r/spam/submit?url=${href}&title=overview for ${authorName}`)
		.attr('target', '_blank')
		.attr('rel', 'noopener noreferer');
}
