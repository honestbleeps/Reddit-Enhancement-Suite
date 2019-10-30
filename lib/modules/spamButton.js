/* @flow */

import { Module } from '../core/module';
import {
	loggedInUser,
	watchForThings,
} from '../utils';

export const module: Module<*> = new Module('spamButton');

module.moduleName = 'spamButtonName';
module.category = 'submissionsCategory';
module.disabledByDefault = true;
module.description = 'spamButtonDesc';

module.beforeLoad = () => {
	watchForThings(['post', 'comment'], addSpamButton);
};

function addSpamButton(thing) {
	const authorElement = thing.getAuthorElement();
	const authorName = thing.getAuthor();
	if (!authorElement || !authorName || loggedInUser() === authorName) return;

	const spam = document.createElement('li');
	// insert spam button second to last in the list... this is a bit hacky and assumes singleClick is enabled...
	// it should probably be made smarter later, but there are so many variations of configs, etc, that it's a bit tricky.
	const buttons = thing.getButtons();
	if (buttons.lastElementChild) buttons.lastElementChild.before(spam);
	else buttons.append(spam);

	const a = document.createElement('a');
	a.setAttribute('class', 'option noCtrlF');
	a.setAttribute('title', 'Report this user as a spammer');
	a.href = `/message/compose?to=/r/reddit.com&subject=spam&message=${authorElement.href}`;
	a.target = '_blank';
	a.rel = 'noopener noreferer';
	a.dataset.text = 'rts';
	spam.appendChild(a);
}
