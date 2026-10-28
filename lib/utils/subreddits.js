/* @flow */

export const fakeSubreddits = [
	'mod',
	'friends',
	'all',
	'contrib',
	'popular',
];

export function isFakeSubreddit(subreddit: string): boolean {
	return fakeSubreddits.some(fakeSubreddit => fakeSubreddit === subreddit.toLowerCase());
}
