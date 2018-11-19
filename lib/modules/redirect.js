/* @flow */

import { Module } from '../core/module';

export const module: Module<*> = new Module('redirect');

module.moduleName = 'redirectName';
module.category = 'usersCategory';
module.description = 'redirectDesc';
module.disabledByDefault = true;
module.keywords = ['redirect'];

module.options = {
	fromProfileLandingPage: {
		title: 'redirectFromProfileLandingPageTitle',
		description: 'redirectFromProfileLandingPageDesc',
		keywords: ['legacy', 'overview'],
		type: 'enum',
		value: 'none',
		values: [{
			name: 'Do nothing',
			value: 'none',
		}, {
			name: 'Overview (legacy)',
			value: 'overview',
		}, {
			name: 'Comments',
			value: 'comments',
		}, {
			name: 'Submitted (legacy)',
			value: 'submitted',
		}, {
			name: 'Gilded',
			value: 'gilded',
		}, {
			name: 'Custom',
			value: 'custom',
		}],
	},
	customFromProfileLandingPage: {
		dependsOn: options => options.fromProfileLandingPage.value === 'custom',
		title: 'redirectCustomFromProfileLandingPageTitle',
		description: 'redirectCustomFromProfileLandingPageDesc',
		type: 'text',
		value: '',
	},
	fromSubredditFrontPage: {
		title: 'redirectFromSubredditFrontPageTitle',
		description: 'redirectFromSubredditFrontPageDesc',
		keywords: ['subreddit', 'front'],
		type: 'enum',
		value: 'none',
		values: [{
			name: 'Do nothing',
			value: 'none',
		}, {
			name: 'New',
			value: 'new',
		}, {
			name: 'Rising',
			value: 'rising',
		}, {
			name: 'Controversial',
			value: 'controversial',
		}, {
			name: 'Top',
			value: 'top',
		}, {
			name: 'Gilded',
			value: 'gilded',
		}, {
			name: 'Wiki',
			value: 'wiki',
		}, {
			name: 'Custom',
			value: 'custom',
		}],
	},
	customFromSubredditFrontPage: {
		dependsOn: options => options.fromSubredditFrontPage.value === 'custom',
		title: 'redirectCustomFromSubredditFrontPageTitle',
		description: 'redirectCustomFromSubredditFrontPageDesc',
		type: 'text',
		value: '',
	},
};
