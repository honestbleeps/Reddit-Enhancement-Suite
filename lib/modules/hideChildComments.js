/* @flow */

import { once } from 'lodash-es';
import { Module } from '../core/module';
import { i18n } from '../environment';
import { watchForThings, forEachChunked } from '../utils';

export const module: Module<*> = new Module('hideChildComments');

module.moduleName = 'hideChildCommentsName';
module.category = 'commentsCategory';
module.description = 'hideChildCommentsDesc';
module.options = {
	automatic: {
		type: 'boolean',
		value: false,
		description: 'hideChildCommentsAutomaticDesc',
		title: 'hideChildCommentsAutomaticTitle',
	},
	nested: {
		type: 'boolean',
		value: true,
		description: 'hideChildCommentsNestedDesc',
		title: 'hideChildCommentsNestedTitle',
	},
	hideNested: {
		dependsOn: options => options.nested.value,
		type: 'boolean',
		value: false,
		description: 'hideChildCommentsHideNestedDesc',
		title: 'hideChildCommentsHideNestedTitle',
	},
};
module.include = [
	'comments',
];

let initialHide, toggleAllButton;

module.beforeLoad = () => {
	initialHide = module.options.automatic.value &&
		// ensure we're not in a permalinked post..
		!((/\/comments\/(?:\w+)\/(?:\w+)\/(\w+)/).test(location.pathname));

	watchForThings(['comment'], addToggleChildrenButton);
	watchForThings(['post'], addToggleAllButton);
};

const addToggleAllButton = once(thing => {
	const menu = thing.getButtons();
	if (!menu) return;

	function toggle(action) {
		const includeChildren = module.options.nested.value && module.options.hideNested.value;
		const selector = includeChildren ? '.thing.comment' : '.nestedlisting > .thing.comment';
		forEachChunked(document.querySelectorAll(`${selector} > .entry .toggleChildren[action=${action}]`), toggle => {
			toggle.click();
		});

		if (action === 'hide') {
			initialHide = true;
			a.setAttribute('action', 'show');
			a.setAttribute('title', 'Show all comments.');
			a.dataset.text = i18n('hideChildCommentsShowAllLinkLabel');
		} else {
			initialHide = false;
			a.setAttribute('action', 'hide');
			a.setAttribute('title', 'Show only replies to original poster.');
			a.dataset.text = i18n('hideChildCommentsHideAllLinkLabel');
		}
	}

	const li = document.createElement('li');
	const a = document.createElement('a');
	a.setAttribute('href', '#');
	a.setAttribute('class', 'noCtrlF res-toggleAllChildren');
	a.addEventListener('click', (e: Event) => {
		e.preventDefault();
		toggle(a.getAttribute('action'));
	});
	toggleAllButton = a;

	toggle(initialHide ? 'hide' : 'show');

	li.appendChild(a);
	menu.appendChild(li);
});

function addToggleChildrenButton(comment) {
	if (!module.options.nested.value && !comment.isTopLevelComment()) return;
	if (!comment.getNumberOfChildren()) return;

	const children = comment.element.querySelector('div.child > .sitetable');
	const menu = comment.getButtons();
	if (!children || !menu) return;

	function toggle(action) {
		if (action === 'hide') {
			children.style.display = 'none';
			a.dataset.text = i18n('hideChildCommentsShowLinkLabel', comment.getNumberOfChildren());
			a.setAttribute('action', 'show');
		} else {
			children.style.display = '';
			a.dataset.text = i18n('hideChildCommentsHideLinkLabel');
			a.setAttribute('action', 'hide');
		}

		comment.element.classList.toggle('res-children-hidden', action === 'hide');
	}

	const li = document.createElement('li');
	const a = document.createElement('a');
	a.setAttribute('href', '#');
	a.setAttribute('class', 'toggleChildren noCtrlF');
	a.addEventListener('click', (e: Event) => {
		e.preventDefault();
		toggle(a.getAttribute('action'));
	});

	const hide = initialHide &&
		(module.options.hideNested.value || comment.isTopLevelComment());
	toggle(hide ? 'hide' : 'show');

	li.appendChild(a);
	menu.appendChild(li);
}

export function toggleAll() {
	const button = toggleAllButton;
	if (!button) throw new Error('Toggle all button not found');
	button.click();
}

export function toggle(thing: *) {
	const button = thing.entry.querySelector('a.toggleChildren');
	if (!button) throw new Error('Toggle button not found');
	button.click();
}
