/* @flow */

import _ from 'lodash';
import { Module } from '../core/module';
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

module.beforeLoad = () => {
	watchForThings(['comment'], addToggleChildrenButton);
	watchForThings(['post'], addToggleAllButton);
};

const initialHide = _.once(() =>
	module.options.automatic.value &&
	// ensure we're not in a permalinked post..
	!((/\/comments\/(?:\w+)\/(?:\w+)\/(\w+)/).test(location.pathname))
);

const addToggleAllButton = _.once(thing => {
	const menu = thing.element.querySelector('ul.buttons');
	if (!menu) return;

	function toggle(action) {
		const includeChildren = module.options.nested.value && module.options.hideNested.value;
		const selector = includeChildren ? '.commentarea .sitetable .thing' : '.commentarea > .sitetable > .thing';
		forEachChunked(document.querySelectorAll(`${selector} > .entry .toggleChildren[action=${action}]`), toggle => {
			toggle.click();
		});

		if (action === 'hide') {
			a.setAttribute('action', 'show');
			a.setAttribute('title', 'Show all comments.');
			a.setAttribute('data-text', 'show all child comments');
		} else {
			a.setAttribute('action', 'hide');
			a.setAttribute('title', 'Show only replies to original poster.');
			a.setAttribute('data-text', 'hide all child comments');
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

	toggle(initialHide() ? 'hide' : 'show');

	li.appendChild(a);
	menu.appendChild(li);
});

function addToggleChildrenButton(comment) {
	if (!module.options.nested.value && !comment.isTopLevelComment()) return;
	if (!comment.getNumberOfChildren()) return;

	const children = comment.element.querySelector('div.child > .sitetable');
	const menu = comment.element.querySelector('ul.buttons');
	if (!children || !menu) return;

	function toggle(action) {
		if (action === 'hide') {
			children.style.display = 'none';
			a.setAttribute('data-text', `show ${comment.getNumberOfChildren()} child comments`);
			a.setAttribute('action', 'show');
		} else {
			children.style.display = '';
			a.setAttribute('data-text', 'hide child comments');
			a.setAttribute('action', 'hide');
		}
	}

	const li = document.createElement('li');
	const a = document.createElement('a');
	a.setAttribute('href', '#');
	a.setAttribute('class', 'toggleChildren noCtrlF');
	a.addEventListener('click', (e: Event) => {
		e.preventDefault();
		toggle(a.getAttribute('action'));
	});

	const hide = initialHide() &&
		(module.options.hideNested.value || comment.isTopLevelComment());
	toggle(hide ? 'hide' : 'show');

	li.appendChild(a);
	menu.appendChild(li);
}
