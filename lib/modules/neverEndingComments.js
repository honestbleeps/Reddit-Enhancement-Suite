/* @flow */

import * as _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { elementInViewport } from '../utils/dom';
import * as SettingsConsole from './settingsConsole';

export const module: Module<*> = new Module('neverEndingComments');

module.moduleName = 'necName';
module.category = 'commentsCategory';
module.description = 'necDescription';
module.options = {
	loadChildComments: {
		type: 'boolean',
		value: false,
		description: 'necLoadChildCommentsDesc',
		title: 'necLoadChildCommentsTitle',
	},
};

module.include = [
	'comments',
];

module.go = () => {
	window.addEventListener('scroll', _.debounce(handleScroll, 300));
};

function firstVisibleLoader() {
	const loaders = module.options.loadChildComments.value ? $('span.morecomments a') : $('span.morecomments:last a');
	return loaders.toArray().find(el => elementInViewport(el));
}

function handleScroll() {
	if (!SettingsConsole.isOpen) { // avoid console to close when scrolling
		function load() {
			const link = firstVisibleLoader();
			if (link) {
				const id = setInterval(() => {
					if (document.body.contains(link)) {
						link.click();
					} else {
						load();
						clearInterval(id);
					}
				}, 250);
			}
		}
		load();
	}
}
