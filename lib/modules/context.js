/* @flow */

import { once } from 'lodash-es';
import $ from 'jquery';
import { Module } from '../core/module';
import { regexes, isPageType, string, watchForThings } from '../utils';

export const module: Module<*> = new Module('context');

module.moduleName = 'contextName';
module.category = 'commentsCategory';
module.description = 'contextDesc';
module.options = {
	viewFullContext: {
		type: 'boolean',
		value: true,
		description: 'contextViewFullContextDesc',
		title: 'contextViewFullContextTitle',
	},
	defaultContext: {
		type: 'text',
		value: '3',
		description: 'contextDefaultContextDesc',
		title: 'contextDefaultContextTitle',
	},
};

module.include = [
	'comments',
	'commentsLinklist',
	'inbox',
	'profile',
	'modqueue',
];

module.beforeLoad = () => {
	const [,,, id] = (regexes.commentPermalink.exec(location.pathname) || []);
	if (module.options.viewFullContext.value && id) {
		watchForThings(['comment'], once(thing => {
			// check that the top comment has a "Parent" button; if not, it's a top comment so don't show full context link
			// Permalink and Parent have bylink class
			if (thing.getButtons().querySelectorAll('.bylink').length < 2) return;

			const pInfobar = document.querySelector('.infobar:not(#searchexpando) p');
			if (pInfobar) pInfobar.append('\u00A0'/* nsbp */, string.html`<a href="?context=10000">view the full context</a>`, '\u00A0→');
		}));
	}
};

module.contentStart = () => {
	const defaultContextDepth = parseInt(module.options.defaultContext.value, 10);
	if (isPageType('commentsLinklist', 'inbox', 'profile', 'modqueue') && defaultContextDepth >= 0) {
		$(document.body).on('mousedown', 'a.bylink', (e: Event) => {
			const target: HTMLAnchorElement = (e.currentTarget: any);
			target.href = target.href.replace(/(\?|&|;)context=\d+\b/, `$1context=${defaultContextDepth}`);
		});
	}
};
