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

export type RedditLink = {
	kind: 't3',
	data: {
		author: string,
		created: number,
		created_utc: number,
		domain: string,
		id: string,
		permalink: string,
		subreddit: string,
		title: string,
		url: string,
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
