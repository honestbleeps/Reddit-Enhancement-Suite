/* @flow */

import * as _ from 'lodash';
import { Module } from '../core/module';
import { elementInViewport } from '../utils/dom';

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
	const context = module.options.loadChildComments.value ? '' : '.commentarea > .sitetable > .thing.morechildren';
	const loaders = document.querySelectorAll(`${context} .morecomments a:not([res-clicked])`);

	return Array.from(loaders).find(el => elementInViewport(el));
}

const handleScroll = _.throttle(() => {
	const link = firstVisibleLoader();
	if (link) {
		link.setAttribute('res-clicked', '');
		link.click();
		handleScroll(); // throttled, so this call will be delayed
	}
}, 2000);
