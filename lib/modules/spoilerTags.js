/* @flow */

import { Module } from '../core/module';

export const module: Module<*> = new Module('spoilerTags');

module.moduleName = 'spoilerTagsName';
module.category = 'appearanceCategory';
module.description = 'spoilerTagsDesc';
module.include = [
	'profile',
];
module.bodyClass = true;
module.options = {
	transition: {
		title: 'spoilerTagsTransitionTitle',
		type: 'boolean',
		value: true,
		description: 'spoilerTagsTransitionDesc',
		bodyClass: true,
	},
};
