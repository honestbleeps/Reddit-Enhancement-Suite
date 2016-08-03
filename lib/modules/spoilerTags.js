import spoilerStylesTemplate from '../templates/spoilerStyles.mustache';
import { addCSS } from '../utils';

export const module = {};

module.moduleID = 'spoilerTags';
module.moduleName = 'Global Spoiler Tags';
module.category = ['Appearance'];
module.description = 'Hide spoilers on user profile pages.';
module.include = [
	'profile',
];
module.options = {
	transition: {
		type: 'boolean',
		value: true,
		description: 'Delay showing spoiler text momentarily',
	},
};

module.beforeLoad = () => {
	addCSS(spoilerStylesTemplate({
		transition: module.options.transition.value,
	}));
};
