/* @flow */

import spoilerStylesTemplate from '../templates/spoilerStyles.mustache';
import { Module } from '../core/module';
import { addCSS } from '../utils';

export const module: Module<*> = new Module('spoilerTags');

module.moduleName = 'spoilerTagsName';
module.category = 'appearanceCategory';
module.description = 'spoilerTagsDesc';
module.include = [
	'profile',
];
module.options = {
	transition: {
		title: 'spoilerTagsTransitionTitle',
		type: 'boolean',
		value: true,
		description: 'spoilerTagsTransitionDesc',
	},
};

module.beforeLoad = () => {
	addCSS(spoilerStylesTemplate({
		transition: module.options.transition.value,
	}));
};
