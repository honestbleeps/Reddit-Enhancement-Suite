/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { insertParam, regexes, Thing } from '../utils';

export const module: Module<*> = new Module('commentDepth');

module.moduleName = 'commentDepthName';
module.category = 'commentsCategory';
module.disabledByDefault = true;
module.description = 'commentDepthDesc';

module.options = {
	defaultCommentDepth: {
		type: 'text',
		value: '4',
		description: 'commentDepthDefaultCommentDepthDesc',
		title: 'commentDepthDefaultCommentDepthTitle',
	},
	defaultMinimumComments: {
		type: 'text',
		value: '50',
		description: 'Default minimum number of comments required to apply custom depth',
	},
	commentPermalinks: {
		type: 'boolean',
		value: false,
		description: 'commentDepthCommentPermaLinksDesc',
		title: 'commentDepthCommentPermaLinksTitle',
	},
	commentPermalinksContext: {
		dependsOn: 'commentPermalinks',
		type: 'boolean',
		value: false,
		description: 'commentDepthCommentPermalinksContextDesc',
		title: 'commentDepthCommentPermalinksContextTitle',
	},
	subredditCommentDepths: {
		type: 'table',
		addRowText: 'commentDepthAddSubreddit',
		fields: [{
			name: 'commentDepthSubreddit',
			type: 'list',
			listType: 'subreddits',
		}, {
			name: 'commentDepthCommentDepth',
			type: 'text',
			value: '4',
		}, {
			name: 'minimumComments',
			type: 'text',
			value: '50',
		}],
		value: ([]: Array<[string, string, string]>),
		description: 'commentDepthSubredditCommentDepthsDesc',
		title: 'commentDepthSubredditCommentDepthsTitle',
	},
};

module.go = () => {
	$(document.body).on('mousedown', 'a[href*="/comments"]', (e: Event) => {
		const target: HTMLAnchorElement = (e.target: any);
		const { href, pathname, search } = target;

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
		const [, commentDepth, minimumComments] = (
			module.options.subredditCommentDepths.value.find(([subreddits]) => subreddits.toLowerCase().split(',').includes(subreddit)) ||
			[null, module.options.defaultCommentDepth.value, module.options.defaultMinimumComments.value]
		);

		// NaN or 0 (show everything)
		if (!commentDepth) return;
		const commentCount = new Thing(e.target).getCommentCount();
		// comment count was extracted correctly and is less than the minimum required
		if (commentCount && commentCount < minimumComments) return;

		target.href = insertParam(href, 'depth', commentDepth);
	});
};
