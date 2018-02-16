/* @flow */

/**
 * Types representing reddit's JSAPI events.
 */

export type SubredditEventData = {|
	displayText: string,
	id: string,
	name: string,
	title: string,
	url: string,
|};

export type PostAuthorEventData = {|
	author: string,
	isModerator: boolean,
	post: Post,
	subreddit: Subreddit,
|};

export type PostEventData = {|
	author: string,
	created: number,
	flair: Flair[],
	id: string,
	media: Media,
	permalink: string,
	subreddit: Subreddit,
	title: string,
	voteState: -1 | 0 | 1,
|};

type Post = {|
	id: string,
|};

type Subreddit = {|
	id: string,
	name: string,
	type: string,
|};

type Flair =
	{| type: 'richtext', richtext: Richtext[] |} |
	{| type: 'text', text: string |};

type Richtext =
	{| e: 'text', t: string |};

type Media =
	{| type: 'image', height: number, width: number, content: string |} |
	{| type: 'embed', height: number, width: number, content: string, provider: string |} |
	{| type: 'rtjson', content: string, markdownContent: string |} |
	{| type: 'video', height: number, width: number, dashUrl: string, isGif: boolean |} |
	{| type: 'gifvideo', height: number, width: number, content: string, gifBackgroundImage: string |};
