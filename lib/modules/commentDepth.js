/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { insertParam, regexes } from '../utils';

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
		addRowText: '+add subreddit',
		fields: [{
			name: 'subreddits',
			type: 'list',
			listType: 'subreddits',
		}, {
			name: 'commentDepth',
			type: 'text',
		}],
		value: ([]: Array<[string, string]>),
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
		const [, commentDepth] = (
			module.options.subredditCommentDepths.value.find(([subreddits]) => subreddits.toLowerCase().split(',').includes(subreddit)) ||
			[null, module.options.defaultCommentDepth.value]
		);

		// NaN or 0 (show everything)
		if (!parseInt(commentDepth, 10)) return;

		target.href = insertParam(href, 'depth', commentDepth);
	});
};
