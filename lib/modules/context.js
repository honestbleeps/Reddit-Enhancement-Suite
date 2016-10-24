import { $ } from '../vendor';
import { isPageType } from '../utils';

export const module = {};

module.moduleID = 'context';
module.moduleName = 'Context';
module.category = 'Comments';
module.description = 'Adds a link to the yellow infobar to view deeply linked comments in their full context.';
module.options = {
	viewFullContext: {
		type: 'boolean',
		value: true,
		description: 'Add a "View the Full Context" link when on a comment link',
	},
	defaultContext: {
		type: 'text',
		value: '3',
		description: 'Change the default context value on context link',
	},
};

module.include = [
	'comments',
	'commentsLinklist',
	'inbox',
	'profile',
	'modqueue',
];

module.go = () => {
	if (isPageType('comments') && module.options.viewFullContext.value) {
		addViewFullContext();
	}
	if (isPageType('commentsLinklist', 'inbox', 'profile', 'modqueue') && !isNaN(module.options.defaultContext.value) && module.options.defaultContext.value >= 0) {
		setDefaultContext();
	}
};

function addViewFullContext() {
	if (location.search !== '?context=10000') {
		const pInfobar = document.querySelector('.infobar:not(#searchexpando) p');
		if (pInfobar) {
			// check if there is a Parent button; if not, it's a top comment so don't show full context link
			if ($('.sitetable:eq(1) .buttons:first .bylink').length > 1) { // Permalink and Parent have bylink class
				pInfobar.innerHTML += '&nbsp;<a href="?context=10000">view the full context</a>&nbsp;→';
			}
		}
	}
}

function setDefaultContext() {
	$(document.body).on('mousedown', 'a.bylink', e => {
		e.target.href = e.target.href.replace(/(\?|&|;)context=\d+\b/, `$1context=${module.options.defaultContext.value}`);
	});
}
