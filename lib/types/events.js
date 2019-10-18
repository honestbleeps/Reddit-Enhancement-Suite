/* @flow */

/**
 * Types representing reddit's JSAPI events.
 */

export type EventData =
	| SubredditEventData
	| CommentEventData
	| CommentAuthorEventData
	| UserHovercardEventData
	| PostAuthorEventData
	| PostEventData
	| PostModToolsEventData;

type EventType =
	| 'subreddit'
	| 'comment'
	| 'commentAuthor'
	| 'userHovercard'
	| 'postAuthor'
	| 'post'
	| 'postModTools';

type EventMetadata = {|
	_id: string,
	_type: EventType,
	_update: number,
|};


export type SubredditEventData = {|
	...EventMetadata,
	_type: 'subreddit',
	displayText: string,
	id: string,
	name: string,
	title: string,
	url: string,
|};

export type CommentEventData = {|
	...EventMetadata,
	_type: 'comment',
	author: string,
	created: number,
	distinguishType: ?string,
	id: string,
	isStickied: boolean,
	isTopLevel: ?boolean, // TODO
	post: {|
		id: string,
	|},
	subreddit: Subreddit,
	// voteState
|};

export type CommentAuthorEventData = {|
	...EventMetadata,
	_type: 'commentAuthor',
	author: string,
	comment: {|
		id: string,
	|},
	post: {|
		id: string,
	|},
	isModerator: boolean,
	subreddit: Subreddit,
|};

export type UserHovercardEventData = {|
	...EventMetadata,
	_type: 'userHovercard',
	contextId: string,
	user: User,
	subreddit: Subreddit,
|};


export type PostAuthorEventData = {|
	...EventMetadata,
	_type: 'postAuthor',
	author: string,
	isModerator: boolean,
	post: Post,
	subreddit: Subreddit,
|};

export type PostEventData = {|
	...EventMetadata,
	_type: 'post',
	author: string,
	created: number,
	distinguishType: ?string,
	flair: Flair[],
	id: string,
	media: Media,
	numComments: number,
	permalink: string,
	subreddit: Subreddit,
	title: string,
	voteState: VoteState,
|};


export type PostModToolsEventData = {|
	...PostEventData,
	_type: 'postModTools',
|};

export type Post = {|
	id: string,
|};

export type VoteState = -1 | 0 | 1;

export type Subreddit = {|
	id: string,
	name: string,
	type: string,
|};

export type User = {|
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

export type Flair =
	{| type: 'richtext', richtext: Richtext[] |} |
	{| type: 'text', text: string |};

export type Richtext =
	{| e: 'text', t: string |};

export type Media =
	{| type: 'image', height: number, width: number, content: string |} |
	{| type: 'embed', height: number, width: number, content: string, provider: string |} |
	{| type: 'rtjson', content: string, markdownContent: string |} |
	{| type: 'video', height: number, width: number, dashUrl: string, isGif: boolean |} |
	{| type: 'gifvideo', height: number, width: number, content: string, gifBackgroundImage: string |};
