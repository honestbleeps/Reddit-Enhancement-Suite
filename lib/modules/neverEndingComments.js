import * as _ from 'lodash';
import { $ } from '../vendor';
import { elementInViewport } from '../utils/dom';
import * as SettingsConsole from './settingsConsole';

export const module = {};

module.moduleID = 'neverEndingComments';
module.moduleName = 'Never Ending Comments';
module.category = 'Comments';
module.description = 'For those ultra-long comment pages, this will keep them flowing';
module.options = {
	loadChildComments: {
		type: 'boolean',
		value: false,
		description: 'Whether or not on-screen \'load more comments\' links should be expanded when paused',
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
