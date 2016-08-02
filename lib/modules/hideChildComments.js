import { $ } from '../vendor';
import { click, forEachChunked } from '../utils';

export const module = {};

module.moduleID = 'hideChildComments';
module.moduleName = 'Hide All Child Comments';
module.category = 'Comments';
module.description = 'Allows you to hide all comments except for replies to the OP for easier reading.';
module.options = {
	automatic: {
		type: 'boolean',
		value: false,
		description: 'Automatically hide all but parent comments, or provide a link to hide them all?',
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
	toggleAllLink.addEventListener('click', function(e) {
		e.preventDefault();
		toggleComments(this.getAttribute('action'));
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
		const rootComments = document.querySelectorAll('div.commentarea > div.sitetable > div.thing > div.child > div.listing');
		rootComments::forEachChunked(comment => {
			const toggleButton = document.createElement('li');
			const toggleLink = document.createElement('a');
			toggleLink.setAttribute('data-text', 'hide child comments');
			toggleLink.setAttribute('action', 'hide');
			toggleLink.setAttribute('href', '#');
			toggleLink.setAttribute('class', 'toggleChildren noCtrlF');
			// toggleLink.setAttribute('title','Hide child comments.');
			toggleLink.addEventListener('click', function(e) {
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
	if (obj) { // toggle a single comment tree
		commentContainers = $(obj).closest('.thing');
	} else { // toggle all comments
		commentContainers = document.querySelectorAll('div.commentarea > div.sitetable > div.thing');
	}
	commentContainers::forEachChunked(container => {
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
