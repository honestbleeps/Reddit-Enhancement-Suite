/* @flow */

/**
 * Types representing reddit's data models.
 * Many obscure/unused fields omitted.
 */

export type RedditComment = {
	kind: 't1',
	data: {
		author: string,
		body: string,
		body_html: string,
		created: number,
		created_utc: number,
		id: string,
		subreddit: string,
	},
};

export type RedditAccount = {
	kind: 't2',
	data: {
		comment_karma: number,
		created: number,
		created_utc: number,
		gold_expiration: number,
		id: string,
		is_friend: boolean,
		is_gold: boolean,
		is_mod: boolean,
		link_karma: number,
		name: string,
	},
};

type PreviewSource = {
	url: string,
	height: number,
	width: number,
};

export type RedditLink = {
	kind: 't3',
	data: {
		author: string,
		created: number,
		created_utc: number,
		edited: number,
		domain: string,
		id: string,
		num_comments: number,
		permalink: string,
		score: number,
		subreddit: string,
		title: string,
		url: string,
		preview?: {
			images: Array<{
				id: string,
				resolutions: PreviewSource[],
				source: PreviewSource,
				variants: {
					[key: string]: ?{
						resolutions: PreviewSource[],
						source: PreviewSource,
					},
				},
			}>,
		},
	},
};

export type RedditMessage = {
	kind: 't4',
	data: {
		author: string,
		body: string,
		body_html: string,
		created: number,
		created_utc: number,
		dest: string,
		id: string,
		subject: string,
		subreddit: ?string,
	},
};

export type RedditSubreddit = {
	kind: 't5',
	data: {
		created: number,
		created_utc: number,
		description: string,
		description_html: string,
		display_name: string,
		id: string,
		name: string,
		public_description: string,
		public_description_html: string,
		quarantine: boolean,
		subscribers: number,
		title: string,
		url: string,
		user_is_subscriber: boolean,
	},
};

export type RedditThing = RedditComment | RedditAccount | RedditLink | RedditMessage | RedditSubreddit;

export type RedditListing<T: RedditThing> = {
	kind: 'Listing',
	data: {
		children: T[],
		after: ?string,
		before: ?string,
	},
};

export type RedditSearchSubredditNames = {
	names: string[],
};

export type RedditSearchWikiNames = {
	kind: 'wikipagelisting',
	data: Array<string>,
};

export type RedditStylesheet = {
	kind: 'stylesheet',
	data: {
		stylesheet: string,
		subreddit_id: string,
		images: Array<{
			link: string,
			name: string,
			url: string,
		}>,
	},
};

export type RedditWikiPage = {
	kind: 'wikipage',
	data: {
		content_html: string,
		content_md: string,
		may_revise: boolean,
		revision_by: RedditAccount,
		revision_date: number,
	},
};
