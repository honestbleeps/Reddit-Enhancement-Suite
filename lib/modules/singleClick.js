/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { Thing, watchForThings } from '../utils';
import { openNewTabs } from '../environment';

export const module: Module<*> = new Module('singleClick');

module.moduleName = 'singleClickName';
module.category = 'browsingCategory';
module.description = 'singleClickDesc';
module.options = {
	openOrder: {
		title: 'singleClickOpenOrderTitle',
		type: 'enum',
		values: [{
			name: 'open comments then link',
			value: 'commentsfirst',
		}, {
			name: 'open link then comments',
			value: 'linkfirst',
		}],
		value: 'commentsfirst',
		description: 'singleClickOpenOrderDesc',
	},
	hideLEC: {
		title: 'singleClickHideLECTitle',
		type: 'boolean',
		value: true,
		description: 'singleClickHideLECDesc',
		advanced: true,
		bodyClass: true,
	},
	openBackground: {
		title: 'singleClickOpenBackgroundTitle',
		type: 'boolean',
		value: false,
		description: 'singleClickOpenBackgroundDesc',
	},
	openFrontpage: {
		type: 'boolean',
		value: false,
		description: 'Open the subreddit front page when clicking [l=c] on self posts',
	},
};
module.exclude = [
	'comments',
	/^\/subreddits(?:\/|$)/i,
];

module.beforeLoad = () => {
	watchForThings(['post'], applyLinks);
};

module.go = () => {
	// mousedown because Firefox doesn't fire click events on middle click...
	$(document.body).on('mousedown', '.redditSingleClick', (e: MouseEvent) => {
		if (e.button !== 2) {
			e.preventDefault();

			const thing = Thing.checkedFrom(e.target);
			const focused = !e.button && !e.ctrlKey && !module.options.openBackground.value;

			openTabs(thing, focused);
		}
	});
};

export function openTabs(thing: Thing, focused: boolean) {
	const link = thing.getPostLink().href;
	const comments = thing.getCommentsLink().href;
	const frontpage = thing.getSubredditLink().href;
	const urls = [link];

	if (thing.isLinkPost()) urls.push(comments);
	else if (module.options.openFrontpage) urls.unshift(frontpage);
	if (module.options.openOrder.value === 'commentsfirst') urls.reverse();

	openNewTabs(focused, ...urls);
}

function applyLinks(thing) {
	thing.$thing
		.find('ul.flat-list')
		.append('<li><span class="redditSingleClick"></span></li>');
}
