/* @flow */

import { Module } from '../core/module';
import {
	string,
	watchForRedditEvents,
} from '../utils';

export const module: Module<*> = new Module('commentSortBy');

module.moduleName = 'commentSortByTitle';
module.category = 'commentsCategory';
module.description = 'commentSortByDesc';
module.include = ['d2x'];

module.beforeLoad = () => {
	watchForRedditEvents('postModTools', (element, { _update }) => {
		if (_update) return;
		const _base = document.querySelector('#CommentSort--SortPicker');
		const base = _base && _base.parentElement;
		if (!base || base.querySelector('.sortByPrefLink')) return;
		base.append(string.html`
			<a
				class="sortByPrefLink gearIcon"
				style="opacity: 0.3;"
				title="Go to comment sort preferences"
				href="https://old.reddit.com/prefs/#default_comment_sort"
				target="_blank"
			>${'\u00A0'/* nbsp */}</a>
		`);
	});
};
