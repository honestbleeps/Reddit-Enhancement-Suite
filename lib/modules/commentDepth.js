/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { insertParams, regexes, Thing } from '../utils';

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
		description: 'commentDepthDefaultMinimumCommentsDesc',
		title: 'commentDepthDefaultMinimumCommentsTitle',
	},
	commentPermalinks: {
		type: 'boolean',
		value: false,
		description: 'commentDepthCommentPermaLinksDesc',
		title: 'commentDepthCommentPermaLinksTitle',
	},
	commentPermalinksContext: {
		dependsOn: options => options.commentPermalinks.value,
		type: 'boolean',
		value: false,
		description: 'commentDepthCommentPermalinksContextDesc',
		title: 'commentDepthCommentPermalinksContextTitle',
	},
	subredditCommentDepths: {
		type: 'table',
		addRowText: 'commentDepthAddSubreddit',
		fields: [{
			key: 'subreddits',
			name: 'commentDepthSubreddit',
			type: 'list',
			listType: 'subreddits',
		}, {
			key: 'commentDepth',
			name: 'commentDepthCommentDepth',
			type: 'text',
			value: '4',
		}, {
			key: 'minimumComments',
			name: 'commentDepthMinimumComments',
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
		if (!parseInt(commentDepth, 10)) return;

		const minimumCount = parseInt(minimumComments, 10);
		if (minimumCount) {
			const thing = Thing.from(e.target);
			if (thing && thing.isPost() && thing.getCommentCount() < minimumCount) return;
		}

		target.href = insertParams(href, { depth: commentDepth });
	});
};
