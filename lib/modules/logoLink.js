/* @flow */

import $ from 'jquery';
import { Module } from '../core/module';

export const module: Module<*> = new Module('logoLink');

module.moduleName = 'logoLinkName';
module.category = 'browsingCategory';
module.description = 'logoLinkDesc';
module.options = {
	redditLogoDestination: {
		type: 'enum',
		value: 'frontpage',
		description: 'logoLinkRedditLogoDestinationDesc',
		title: 'logoLinkRedditLogoDestinationTitle',
		values: [{
			name: 'logoLinkFrontpage',
			value: 'frontpage',
		}, {
			name: 'logoLinkAll',
			value: 'all',
		}, {
			name: 'logoLinkHot',
			value: 'hot',
		}, {
			name: 'logoLinkDashboard',
			value: 'dashboard',
		}, {
			name: 'logoLinkCurrent',
			value: 'subreddit',
		}, {
			name: 'logoLinkMyUserPage',
			value: '/u/me',
		}, {
			name: 'logoLinkInbox',
			value: '/message/inbox',
		}, {
			name: 'logoLinkCustom',
			value: 'custom',
		}],
	},
	customDestination: {
		dependsOn: options => options.redditLogoDestination.value === 'custom',
		type: 'text',
		value: '/',
		description: 'logoLinkCustomDestinationDesc',
		title: 'logoLinkCustomDestinationTitle',
	},
};

module.contentStart = () => {
	const redditLogoNode: ?HTMLAnchorElement = (document.getElementById('header-img-a') || document.getElementById('header-img') || document.querySelector('header a[href="/"]'): any);
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
		case 'hot':
			return '/hot';
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
