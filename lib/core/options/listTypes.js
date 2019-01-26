/* @flow */

import type { RedditSearchSubredditNames } from '../../types/reddit';

export default ({
	subreddits: {
		source: '/api/search_reddit_names.json?app=res',
		hintText: 'type a subreddit name',
		onResult(response: RedditSearchSubredditNames) {
			return response.names.map(name => ({
				id: name,
				name,
			}));
		},
		onCachedResult(response: RedditSearchSubredditNames) {
			return response.names.map(name => ({
				id: name,
				name,
			}));
		},
	},
}: {
	[type: string]: {|
		source: string,
		hintText: ?string,
		onResult: (RedditSearchSubredditNames) => Array<{| id: string, name: string |}>,
		onCachedResult: (RedditSearchSubredditNames) => Array<{| id: string, name: string |}>,
	|},
});
