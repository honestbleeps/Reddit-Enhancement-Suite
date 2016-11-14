import { $ } from '../vendor';
import { insertParam, regexes } from '../utils';

export const module = {};

module.moduleID = 'commentDepth';
module.moduleName = 'commandDepthName';
module.category = 'commandDepthCategory';
module.disabledByDefault = true;
module.description = 'commandDepthDesc'.trim();

module.options = {
	defaultCommentDepth: {
		type: 'text',
		value: '4',
		description: 'Default depth to use for all subreddits not listed below.',
	},
	commentPermalinks: {
		type: 'boolean',
		value: false,
		description: 'Set depth on links to particular comments.',
	},
	commentPermalinksContext: {
		dependsOn: 'commentPermalinks',
		type: 'boolean',
		value: false,
		description: 'Set depth on links to particular comments with context.',
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

module.go = () => {
	$(document.body).on('mousedown', 'a[href*="/comments"]', e => {
		const { href, pathname, search } = e.target;

		// no need to proceed if depth already exists in the query string
		if (search.match(/[?&]depth=/)) return;

		if (pathname.match(regexes.commentPermalink)) {
			if (!module.options.commentPermalinks.value) return;
			if (!module.options.commentPermalinksContext.value && search.match(/[?&]context=/)) return;
		}

		const matches = pathname.match(regexes.comments);
		if (!matches) return;

		const subreddit = matches[1].toLowerCase();

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
