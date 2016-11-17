/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { watchForThings, string } from '../utils';
import { i18n } from '../environment';

export const module: Module<*> = new Module('xPostLinks');

module.moduleName = 'xPostLinksName';
module.category = 'submissionsCategory';
module.description = 'xPostLinksDesc';

module.include = [
	'linklist',
	'modqueue',
	'comments',
	'profile',
	'search',
];

module.beforeLoad = () => {
	watchForThings(['post'], createLinks);
};

const xpostRe = /(?:x|cross)[\s-]?post\S*(.+)/i;
const xpostFromRe = /^(?:\s+\S+)?\s+\/?(\w{2,20}\b)(?:[\)\]}]|\S*$)/i;
const subredditRe = /r\/(\w{2,20}\b)/i;

function parseSubreddit(title) {
	const [, xpostString] = xpostRe.exec(title) || [];

	if (!xpostString) return false;

	const [, sub] = (
		subredditRe.exec(xpostString) || // found something like r/games
		xpostFromRe.exec(xpostString) || // use the last of one or two words before end of string of closing bracket
		[]
	);

	return sub;
}

function appendToTagline(sub, thing) {
	$()
		.add($(thing.getSubredditLink()).prev())
		.add(thing.getUserattrsElement() || '')
		.first() // first valid (thing.getSubredditLink() may be null)
		.after(
			string.escapeHTML` ${i18n('xPostLinksXpostedFrom')} `,
			$('<a>', {
				class: 'subreddit hover',
				href: `/r/${sub}`,
				text: `/r/${sub}`,
			})
		);
}

function createLinks(thing) {
	const sub = parseSubreddit(thing.getTitle());
	if (sub) appendToTagline(sub, thing);
}
