/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { execRegexes, regexes, Thing } from '../utils';

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

module.contentStart = () => {
	$(document.body).on('mousedown', 'a[href*="/comments"]', (e: Event) => {
		const target: HTMLAnchorElement = (e.target: any);
		const url = new URL(target.href, location.href);

		// no need to proceed if depth already exists in the query string
		if (url.searchParams.has('depth')) return;

		if (regexes.commentPermalink.test(url.pathname)) {
			if (!module.options.commentPermalinks.value) return;
			if (!module.options.commentPermalinksContext.value && url.searchParams.has('context')) return;
		}

		const matches = execRegexes.comments(url.pathname);
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
			if (thing && thing.isPost() && (thing.getCommentCount() || 0) < minimumCount) return;
		}

		url.searchParams.set('depth', commentDepth);
		target.removeAttribute('data-inbound-url');
		target.href = url.href;
	});
};
