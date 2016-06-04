import { $ } from '../vendor';
import { insertParam, regexes } from '../utils';

export const module = {};

module.moduleID = 'commentDepth';
module.moduleName = 'Custom Comment Depth';
module.category = 'Comments';
module.disabledByDefault = true;
module.description = `
	Allows you to set the preferred depth of comments you wish to see when clicking on comments links.
	0 = Everything, 1 = Root level, 2 = Responses to root level, 3 = Responses to responses to root level, etc.
`.trim();

module.options = {
	defaultCommentDepth: {
		type: 'text',
		value: '4',
		description: 'Default depth to use for all subreddits not listed below.',
	},
	commentPermalinks: {
		type: 'boolean',
		value: false,
		description: 'Set depth on links to particular comments.'
	},
	commentPermalinksContext: {
		dependsOn: 'commentPermalinks',
		type: 'boolean',
		value: false,
		description: 'Set depth on links to particular comments with context.'
	},
	subredditCommentDepths: {
		type: 'table',
		addRowNext: '+add subreddit',
		fields: [{
			name: 'subreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			name: 'commentDepth',
			type: 'text',
		}],
		value: [],
		description: 'Subreddit-specific comment depths.',
	},
};

module.go = function() {
	$(document.body).on('mousedown', 'a[href*="/comments"]', e => {
		const href = e.target.href;

		if (!href.match(regexes.comments)) return;
		if (href.match(regexes.commentPermalink)) {
			if (!module.options.commentPermalinks.value) return;
			if (!module.options.commentPermalinksContext.value && href.match(/[?&]context=/)) return;
		}

		// no need to proceed if depth already exists in the query string
		if (href.match(/[?&]depth=/)) return;

		const subreddit = (/\/r\/(.+?)\//i).exec(href)[1].toLowerCase();

		// check for subreddit specific values
		const [, commentDepth] = (
			module.options.subredditCommentDepths.value.find(([subreddits]) => subreddits.toLowerCase().split(',').includes(subreddit)) ||
			[null, module.options.defaultCommentDepth.value]
		);

		// NaN or 0 (show everything)
		if (!parseInt(commentDepth, 10)) return;

		e.target.href = insertParam(href, 'depth', commentDepth);
	});
};
