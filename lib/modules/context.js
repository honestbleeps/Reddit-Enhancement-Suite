/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { isPageType } from '../utils';

export const module: Module<*> = new Module('context');

module.moduleName = 'contextName';
module.category = 'commentsCategory';
module.description = 'contextDesc';
module.options = {
	viewFullContext: {
		type: 'boolean',
		value: true,
		description: 'contextViewFullContextDesc',
	},
	defaultContext: {
		type: 'text',
		value: '3',
		description: 'contextDefaultContextDesc',
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

	const defaultContext = parseInt(module.options.defaultContext.value, 10);
	if (isPageType('commentsLinklist', 'inbox', 'profile', 'modqueue') && defaultContext >= 0) {
		setDefaultContext(defaultContext);
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

function setDefaultContext(contextDepth) {
	$(document.body).on('mousedown', 'a.bylink', (e: Event) => {
		const target: HTMLAnchorElement = (e.target: any);
		target.href = target.href.replace(/(\?|&|;)context=\d+\b/, `$1context=${contextDepth}`);
	});
}
