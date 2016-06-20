import { addCSS } from '../utils';

export const module = {};

module.moduleID = 'commentStyle';
module.moduleName = 'Comment Style';
module.category = ['Appearance', 'Comments'];
module.description = 'Add readability enhancements to comments.';
module.options = {
	commentBoxes: {
		type: 'boolean',
		value: true,
		description: 'Highlights comment boxes for easier reading / placefinding in large threads.',
		bodyClass: 'res-commentBoxes',
	},
	commentRounded: {
		type: 'boolean',
		value: true,
		description: 'Round corners of comment boxes',
		advanced: true,
		dependsOn: 'commentBoxes',
		bodyClass: 'res-commentBoxes-rounded',
	},
	commentHoverBorder: {
		type: 'boolean',
		value: false,
		description: 'Highlight comment box hierarchy on hover (turn off for faster performance)',
		advanced: true,
		dependsOn: 'commentBoxes',
		bodyClass: 'res-commentHoverBorder',
	},
	commentIndent: {
		type: 'text',
		value: 10,
		description: 'Indent comments by [x] pixels (only enter the number, no \'px\')',
		advanced: true,
		dependsOn: 'commentBoxes',
	},
	continuity: {
		type: 'boolean',
		value: false,
		description: 'Show comment continuity lines',
		advanced: true,
		dependsOn: 'commentBoxes',
		bodyClass: 'res-continuity',
	},
};

module.include = [
	'comments',
];

module.beforeLoad = function() {
	if (module.options.commentBoxes.value && module.options.commentIndent.value) {
		// this should override the default of 10px in commentboxes.css because it's added later.
		addCSS(`
			.res-commentBoxes .comment {
				margin-left: ${module.options.commentIndent.value}px !important;
			}
		`);
	}
};
