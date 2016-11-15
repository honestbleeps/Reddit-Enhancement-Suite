import { $ } from '../vendor';
import { Thing, escapeHTML, forEachChunked, watchForElement } from '../utils';

export const module = {};

module.moduleID = 'subRedditTagger';
module.moduleName = 'subredditTaggerName';
module.category = 'subredditsCategory';
module.description = 'subredditTaggerDesc';
module.options = {
	subReddits: {
		type: 'table',
		addRowText: '+add tag',
		fields: [{
			name: 'subreddit',
			type: 'text',
		}, {
			name: 'doesntContain',
			type: 'text',
		}, {
			name: 'tag',
			type: 'text',
		}],
		value: [
			/*
			['somebodymakethis','SMT','[SMT]'],
			['pics','pic','[pic]']
			*/
		],
		description: '<p>Description:</p><dl><dt>subreddit</dt><dd>Name of the subreddit, without slashes.</dd><dt>doesntContain</dt><dd>Any string of text that could be present in a submission title. If a title contains this string, the tag will not be applied.</dd><dt>tag</dt><dd>The text that will appear at the beginning of submission titles. E.g. use [tag], (tag), TAG | , etc...</dd></dl>',
	},
};

const SRTDoesntContain = [];
const SRTTagWith = [];

module.go = () => {
	loadSRTRules();

	watchForElement('siteTable', scanTitles);
	scanTitles();
};

function loadSRTRules() {
	for (const [subreddit, doesntContain, tagWith] of module.options.subReddits.value) {
		SRTDoesntContain[subreddit.toLowerCase()] = doesntContain;
		SRTTagWith[subreddit.toLowerCase()] = tagWith;
	}
}

function scanTitles(obj) {
	let qs = '#siteTable > .thing > DIV.entry';
	if (obj) {
		qs = '.thing > DIV.entry';
	} else {
		obj = document;
	}
	obj.querySelectorAll(qs)::forEachChunked(entry => {
		const title = $(entry).find('a.title');
		if (title.is('.srTagged')) return;
		title.addClass('srTagged');

		const tagToAdd = getTagForEntry(entry);
		if (tagToAdd !== undefined) {
			const tagText = $('<span>').append(escapeHTML(tagToAdd)).append('&nbsp;');
			title.prepend(tagText);
		}
	});
}

function getTagForEntry(entry) {
	let hasTag = false;

	const thisSubReddit = (new Thing(entry).getSubreddit() || '').toLowerCase();
	if (thisSubReddit.length) {
		if (SRTTagWith.hasOwnProperty(thisSubReddit)) {
			if (thisSubReddit && !SRTDoesntContain[thisSubReddit]) {
				SRTDoesntContain[thisSubReddit] = `[${thisSubReddit}]`;
			}
			const thisString = SRTDoesntContain[thisSubReddit];
			hasTag = entry.querySelector('a.title').innerText.includes(thisString) ||
				$(entry).find('.linkflairlabel').text().includes(thisString);
		}
	}

	if (!hasTag && SRTTagWith.hasOwnProperty(thisSubReddit)) {
		return SRTTagWith[thisSubReddit];
	}
}
