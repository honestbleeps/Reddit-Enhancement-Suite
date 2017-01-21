/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { click, forEachChunked } from '../utils';

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
		dependsOn: 'nested',
		type: 'boolean',
		value: false,
		description: 'hideChildCommentsHideNestedDesc',
		title: 'hideChildCommentsHideNestedTitle',
	},
};
module.include = [
	'comments',
];

module.go = () => {
	const toggleButton = document.createElement('li');
	const toggleAllLink = document.createElement('a');
	toggleAllLink.textContent = 'hide all child comments';
	toggleAllLink.setAttribute('action', 'hide');
	toggleAllLink.setAttribute('href', '#');
	toggleAllLink.setAttribute('title', 'Show only replies to original poster.');
	toggleAllLink.addEventListener('click', function(e: Event) {
		e.preventDefault();
		toggleComments(this.getAttribute('action'), !module.options.hideNested.value);
		if (this.getAttribute('action') === 'hide') {
			this.setAttribute('action', 'show');
			this.setAttribute('title', 'Show all comments.');
			this.textContent = 'show all child comments';
		} else {
			this.setAttribute('action', 'hide');
			this.setAttribute('title', 'Show only replies to original poster.');
			this.textContent = 'hide all child comments';
		}
	}, true);
	toggleButton.appendChild(toggleAllLink);
	const commentMenu = document.querySelector('ul.buttons');
	if (commentMenu) {
		commentMenu.appendChild(toggleButton);
		const comments = document.querySelectorAll(module.options.nested.value ?
			'.commentarea .listing' :
			'div.commentarea > div.sitetable > div.thing > div.child > div.listing'
		);
		forEachChunked(comments, comment => {
			const toggleButton = document.createElement('li');
			const toggleLink = document.createElement('a');
			toggleLink.setAttribute('data-text', 'hide child comments');
			toggleLink.setAttribute('action', 'hide');
			toggleLink.setAttribute('href', '#');
			toggleLink.setAttribute('class', 'toggleChildren noCtrlF');
			// toggleLink.setAttribute('title','Hide child comments.');
			toggleLink.addEventListener('click', function(e: Event) {
				e.preventDefault();
				toggleComments(this.getAttribute('action'), this);
			}, true);
			toggleButton.appendChild(toggleLink);
			const sib = comment.parentNode.previousSibling;
			if (sib) {
				const sibMenu = sib.querySelector('ul.buttons');
				if (sibMenu) sibMenu.appendChild(toggleButton);
			}
		});
		if (module.options.automatic.value) {
			// ensure we're not in a permalinked post..
			const linkRE = /\/comments\/(?:\w+)\/(?:\w+)\/(\w+)/;
			if (!location.pathname.match(linkRE)) {
				click(toggleAllLink);
			}
		}
	}
};

function toggleComments(action, obj) {
	let commentContainers;
	if (obj === true) { // toggle only top level comments
		commentContainers = document.querySelectorAll('div.commentarea > div.sitetable > div.thing');
	} else if (obj === false) { // toggle all comments
		commentContainers = document.querySelectorAll('div.commentarea div.sitetable div.thing');
	} else if (obj) { // toggle all top level comments
		commentContainers = $(obj).closest('.thing');
	}
	forEachChunked(commentContainers, container => {
		const thisChildren = container.querySelector('div.child > div.sitetable');
		const thisToggleLink = container.querySelector('a.toggleChildren');
		if (thisToggleLink) {
			if (action === 'hide') {
				const numChildrenElem = container.querySelector('.numchildren');
				const numChildren = parseInt((/\((\d+)/).exec(numChildrenElem.textContent)[1], 10);
				if (thisChildren) {
					thisChildren.style.display = 'none';
				}
				thisToggleLink.setAttribute('data-text', `show ${numChildren} child comments`);
				thisToggleLink.setAttribute('action', 'show');
			} else {
				if (thisChildren) {
					thisChildren.style.display = 'block';
				}
				thisToggleLink.setAttribute('data-text', 'hide child comments');
				thisToggleLink.setAttribute('action', 'hide');
			}
		}
	});
}
