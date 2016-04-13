import spoilerStylesTemplate from '../templates/spoilerStyles.hbs';
import { addCSS } from '../utils';

addModule('spoilerTags', (module, moduleID) => {
	module.moduleName = 'Global Spoiler Tags';
	module.category = ['Appearance'];
	module.description = 'Hide spoilers on user profile pages.';
	module.include = [
		'profile'
	];
	module.options = {
		transition: {
			type: 'boolean',
			value: true,
			description: 'Delay showing spoiler text momentarily'
		}
	};
	module.beforeLoad = function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}

		addCSS(spoilerStylesTemplate({
			transition: module.options.transition.value
		}));
	};
});
