/* @flow */

import $ from 'jquery';
import { Module } from '../core/module';
import { Thing, watchForThings, string } from '../utils';
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
	openFrontpage: {
		title: 'singleClickOpenFrontpageTitle',
		type: 'boolean',
		value: false,
		description: 'singleClickOpenFrontpageDesc',
		dependsOn: options => !options.hideLEC.value,
	},
	openBackground: {
		title: 'singleClickOpenBackgroundTitle',
		type: 'boolean',
		value: false,
		description: 'singleClickOpenBackgroundDesc',
	},
};
module.exclude = [
	'comments',
	/^\/subreddits(?:\/|$)/i,
];

module.beforeLoad = () => {
	watchForThings(['post'], thing => thing.getButtons().append(string.html`<li><span class="redditSingleClick"></span></li>`));
};

module.contentStart = () => {
	// mouseup because Firefox doesn't fire click events on middle click...
	$(document.body).on('mouseup', '.redditSingleClick', (e: MouseEvent) => {
		if (e.button !== 2) {
			e.preventDefault();

			const thing = Thing.checkedFrom(e.currentTarget);
			const focused = !e.button && !e.ctrlKey && !module.options.openBackground.value;

			openTabs(thing, focused);
		}
	});
};

export function openTabs(thing: Thing, focused: boolean) {
	const link = thing.getPostUrl();
	const urls = [link];

	if (thing.isLinkPost()) {
		const comments = thing.getCommentsLink().href;
		// to avoid opening two of the same link, ensure
		// the comments link is not the same as the post link.
		if (comments !== link) {
			urls.push(comments);
		}
	} else if (module.options.openFrontpage.value) {
		const frontpageLink = thing.getSubredditLink();
		if (frontpageLink && frontpageLink.href !== link) {
			urls.push(frontpageLink.href);
		}
	}

	if (module.options.openOrder.value === 'commentsfirst') urls.reverse();

	openNewTabs(focused, ...urls);
}
