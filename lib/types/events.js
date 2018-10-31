/* @flow */

/**
 * Types representing reddit's JSAPI events.
 */

export type SubredditEventData = {|
	_: EventMetadata,
	displayText: string,
	id: string,
	name: string,
	title: string,
	url: string,
|};

export type CommentAuthorEventData = {|
	_: EventMetadata,
	author: string,
	comment: {
		id: string,
	},
	post: {
		id: string,
	},
	isModerator: boolean,
	subreddit: Subreddit,
|};

export type UserHovercardEventData = {|
	_: EventMetadata,
	contextId: string,
	user: User,
	subreddit: Subreddit,
|};


export type PostAuthorEventData = {|
	_: EventMetadata,
	author: string,
	isModerator: boolean,
	post: Post,
	subreddit: Subreddit,
|};

export type PostEventData = {|
	_: EventMetadata,
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


export type PostModToolsEventData = {|
	_: EventMetadata,
	id: string,
|};

type EventMetadata = {|
	id: string,
	type: string,
	update: number,
|};

type Post = {|
	id: string,
|};

type Subreddit = {|
	id: string,
	name: string,
	type: string,
|};

type User = {|
	id: string,
	created: number,
	username: string,
	url: string,
	displayName: string, // for profile subreddit
	accountIcon: string,
	postKarma: number,
	commentKarma: number,
	hasUserProfile: boolean,
	iconSize: [ number, number ],
	isFollowing: ?boolean,
	isEmployee: boolean,
	bannerImage: string,
	hasVerifiedEmail: boolean,
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
