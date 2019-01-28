/* @flow */

import { addCSS } from '../utils';
import { Module } from '../core/module';

export const module: Module<*> = new Module('styleTweaks');

module.moduleName = 'styleTweaksName';
module.category = 'appearanceCategory';
module.description = 'styleTweaksDesc';
module.options = {
	navTop: {
		title: 'styleTweaksNavTopTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksNavTopDesc',
		bodyClass: 'res-navTop',
	},
	disableAnimations: {
		title: 'styleTweaksDisableAnimationsTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksDisableAnimationsDesc',
		bodyClass: true,
	},
	visitedStyle: {
		title: 'styleTweaksVisitedStyleTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksVisitedStyleDesc',
		bodyClass: true,
	},
	showExpandos: {
		title: 'styleTweaksShowExpandosTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksShowExpandosDesc',
		advanced: true,
		bodyClass: true,
	},
	hideUnvotable: {
		title: 'styleTweaksHideUnvotableTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksHideUnvotableDesc',
		bodyClass: true,
	},
	showFullLinkFlair: {
		title: 'styleTweaksShowFullLinkFlairTitle',
		type: 'enum',
		values: [{
			name: 'Never',
			value: 'never',
		}, {
			name: 'On hover',
			value: 'hover',
		}, {
			name: 'Always',
			value: 'always',
		}],
		value: 'never',
		description: 'styleTweaksShowFullLinkFlairDesc',
		bodyClass: true,
	},
	highlightEditedTime: {
		title: 'styleTweaksHighlightEditedTimeTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksHighlightEditedTimeDesc',
		bodyClass: true,
	},
	colorBlindFriendly: {
		title: 'styleTweaksColorBlindFriendlyTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksColorBlindFriendlyDesc',
		advanced: true,
		bodyClass: 'res-colorblind',
	},
	scrollSubredditDropdown: {
		title: 'styleTweaksScrollSubredditDropdownTitle',
		type: 'boolean',
		value: true,
		description: 'styleTweaksScrollSubredditDropdownDesc',
		advanced: true,
		bodyClass: true,
	},
	highlightTopLevel: {
		title: 'styleTweaksHighlightTopLevelTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksHighlightTopLevelDesc',
	},
	highlightTopLevelColor: {
		title: 'styleTweaksHighlightTopLevelColorTitle',
		type: 'color',
		dependsOn: options => options.highlightTopLevel.value,
		description: 'styleTweaksHighlightTopLevelColorDesc',
		value: '#8B0000',
	},
	highlightTopLevelSize: {
		title: 'styleTweaksHighlightTopLevelSizeTitle',
		type: 'text',
		dependsOn: options => options.highlightTopLevel.value,
		description: 'styleTweaksHighlightTopLevelSizeDesc',
		value: '2',
	},
	floatingSideBar: {
		title: 'styleTweaksFloatingSideBarTitle',
		type: 'boolean',
		value: false,
		description: 'styleTweaksFloatingSideBarDesc',
		advanced: true,
		bodyClass: true,
	},
	postTitleCapitalization: {
		title: 'styleTweaksPostTitleCapitalizationTitle',
		description: 'styleTweaksPostTitleCapitalizationDesc',
		type: 'enum',
		value: 'none',
		values: [{
			name: 'do nothing',
			value: 'none',
		}, {
			name: 'Title Case',
			value: 'title',
		}, {
			name: 'Sentence case',
			value: 'sentence',
		}, {
			name: 'lowercase',
			value: 'lowercase',
		}],
		bodyClass: true,
	},
	hideDomainLink: {
		title: 'styleTweaksHideDomainLink',
		type: 'boolean',
		value: false,
		description: 'styleTweaksHideDomainLinkDesc',
		bodyClass: true,
	},
};

module.beforeLoad = () => {
	if (module.options.highlightTopLevel.value) {
		const highlightTopLevelColor = module.options.highlightTopLevelColor.value || module.options.highlightTopLevelColor.default;
		const highlightTopLevelSize = parseInt(module.options.highlightTopLevelSize.value || module.options.highlightTopLevelSize.default, 10);
		addCSS(`
			.nestedlisting > .comment + .clearleft {
				height: ${highlightTopLevelSize}px !important;
				margin-bottom: 5px;
				background: ${highlightTopLevelColor} !important;
			}
			.Comment.top-level {
				border-top: ${highlightTopLevelSize}px solid ${highlightTopLevelColor};
			}
		`);
	}
};

