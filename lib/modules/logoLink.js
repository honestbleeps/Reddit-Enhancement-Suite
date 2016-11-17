/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';

export const module: Module<*> = new Module('logoLink');

module.moduleName = 'logoLinkName';
module.category = 'browsingCategory';
module.description = 'logoLinkDesc';
module.options = {
	redditLogoDestination: {
		type: 'enum',
		value: 'frontpage',
		description: 'Location when you click on the reddit logo.',
		values: [{
			name: 'Frontpage',
			value: 'frontpage',
		}, {
			name: '/r/all',
			value: 'all',
		}, {
			name: 'Dashboard',
			value: 'dashboard',
		}, {
			name: 'Current subreddit/multireddit',
			value: 'subreddit',
		}, {
			name: 'My user page',
			value: '/u/me',
		}, {
			name: 'Inbox',
			value: '/message/inbox',
		}, {
			name: 'Custom',
			value: 'custom',
		}],
	},
	customDestination: {
		type: 'text',
		value: '/',
		description: 'If redditLogoDestination is set to custom, link here',
	},
};

module.go = () => {
	const redditLogoNode: ?HTMLAnchorElement = (document.getElementById('header-img-a') || document.getElementById('header-img'): any);
	if (redditLogoNode) {
		const url = getLogoLinkUrl();
		if (url) {
			redditLogoNode.href = url;
		}
	}
};

function getLogoLinkUrl() {
	const destination = module.options.redditLogoDestination.value;
	switch (destination) {
		case 'frontpage':
			return false;
		case 'all':
			return '/r/all';
		case 'dashboard':
			return '/r/Dashboard';
		case 'subreddit':
			return $('.redditname > a').attr('href');
		case 'custom':
			return module.options.customDestination.value;
		default:
			return destination;
	}
}
