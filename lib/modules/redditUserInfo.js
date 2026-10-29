/* @flow */

import { Module } from '../core/module';

export const module: Module<any> = new Module('redditUserInfo');

module.moduleName = 'redditUserInfoName';
module.category = 'usersCategory';
module.description = 'redditUserInfoDesc';
module.options = {
	hideAuthorTooltip: {
		type: 'boolean',
		value: false,
		description: 'redditUserInfoHideDesc',
		title: 'redditUserInfoHideTitle',
		bodyClass: true,
	},
};
