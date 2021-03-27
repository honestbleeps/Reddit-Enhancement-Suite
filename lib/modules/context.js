/* @flow */

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
	const context = (new URL(location.href)).searchParams.get('context');
	const [,,, id] = (regexes.commentPermalink.exec(location.pathname) || []);
	if (isPageType('comments') && module.options.viewFullContext.value && id && context !== '10000') {
		watchForThings(['comment'], thing => {
			if (!thing.getFullname().endsWith(id)) return;
			thing.getButtons().append(string.html`<li><a href="?context=10000" class="noCtrlF" data-text="view the full context"></a></li>`);
		});
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
