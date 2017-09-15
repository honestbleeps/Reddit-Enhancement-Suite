/* @flow */

import { Module } from '../core/module';

export const module: Module<*> = new Module('redditUserInfo');

module.moduleName = 'redditUserInfoName';
module.category = 'usersCategory';
module.description = 'redditUserInfoDesc';
module.options = {
	hideAuthorTooltip: {
		type: 'boolean',
		value: true,
		description: 'redditUserInfoHideDesc',
		title: 'redditUserInfoHideTitle',
		bodyClass: true,
	},
};
