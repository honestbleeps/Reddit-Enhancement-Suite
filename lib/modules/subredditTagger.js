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
		title: 'subRedditTaggerSubRedditsTitle',
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
		description: 'subRedditTaggerSubRedditsDesc',
	},
};

const SRTDoesntContain = new Map();
const SRTTagWith = new Map();

module.beforeLoad = () => {
	watchForThings(['post'], scanTitle);
};

module.go = () => {
	loadSRTRules();
};

function loadSRTRules() {
	for (const [subreddit, doesntContain, tagWith] of module.options.subReddits.value) {
		SRTDoesntContain.set(subreddit.toLowerCase(), doesntContain);
		SRTTagWith.set(subreddit.toLowerCase(), tagWith);
	}
}

function scanTitle(thing) {
	const tagToAdd = getTag(thing);
	if (tagToAdd !== undefined) {
		const tagText = $('<span>').append(escapeHTML(tagToAdd)).append('&nbsp;');
		$(thing.getTitleElement()).parent().prepend(tagText);
	}
}

function getTag(thing) {
	let hasTag = false;

	const thisSubReddit = (thing.getSubreddit() || '').toLowerCase();
	if (thisSubReddit && SRTTagWith.has(thisSubReddit)) {
		let thisString = SRTDoesntContain.get(thisSubReddit);
		if (thisString === undefined || thisString === '') {
			thisString = `[${thisSubReddit}]`;
			SRTDoesntContain.set(thisSubReddit, thisString);
		}
		hasTag = thing.getTitle().includes(thisString) ||
			thing.getPostFlairText().includes(thisString);
	}

	if (!hasTag) {
		return SRTTagWith.get(thisSubReddit);
	}
}
