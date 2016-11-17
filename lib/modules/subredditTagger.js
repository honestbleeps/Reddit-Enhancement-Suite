/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { escapeHTML, watchForThings } from '../utils';

export const module: Module<*> = new Module('subRedditTagger');

module.moduleName = 'subredditTaggerName';
module.category = 'subredditsCategory';
module.description = 'subredditTaggerDesc';
module.options = {
	subReddits: {
		type: 'table',
		addRowText: '+add tag',
		fields: [{
			key: 'subreddit',
			name: 'subreddit',
			type: 'text',
		}, {
			key: 'doesntContain',
			name: 'doesntContain',
			type: 'text',
		}, {
			key: 'tag',
			name: 'tag',
			type: 'text',
		}],
		value: ([]: Array<[string, string, string]>),
		description: '<p>Description:</p><dl><dt>subreddit</dt><dd>Name of the subreddit, without slashes.</dd><dt>doesntContain</dt><dd>Any string of text that could be present in a submission title. If a title contains this string, the tag will not be applied.</dd><dt>tag</dt><dd>The text that will appear at the beginning of submission titles. E.g. use [tag], (tag), TAG | , etc...</dd></dl>',
	},
};

const SRTDoesntContain = {};
const SRTTagWith = {};

module.beforeLoad = () => {
	watchForThings(['post'], scanTitle);
};

module.go = () => {
	loadSRTRules();
};

function loadSRTRules() {
	for (const [subreddit, doesntContain, tagWith] of module.options.subReddits.value) {
		SRTDoesntContain[subreddit.toLowerCase()] = doesntContain;
		SRTTagWith[subreddit.toLowerCase()] = tagWith;
	}
}

function scanTitle(thing) {
	const tagToAdd = getTag(thing);
	if (tagToAdd !== undefined) {
		const tagText = $('<span>').append(escapeHTML(tagToAdd)).append('&nbsp;');
		$(thing.getTitleElement()).prepend(tagText);
	}
}

function getTag(thing) {
	let hasTag = false;

	const thisSubReddit = (thing.getSubreddit() || '').toLowerCase();
	if (thisSubReddit) {
		if (SRTTagWith.hasOwnProperty(thisSubReddit)) {
			if (thisSubReddit && !SRTDoesntContain[thisSubReddit]) {
				SRTDoesntContain[thisSubReddit] = `[${thisSubReddit}]`;
			}
			const thisString = SRTDoesntContain[thisSubReddit];
			hasTag = thing.getTitle().includes(thisString) ||
				thing.getPostFlairText().includes(thisString);
		}
	}

	if (!hasTag && SRTTagWith.hasOwnProperty(thisSubReddit)) {
		return SRTTagWith[thisSubReddit];
	}
}
