/* @flow */

import { Module } from '../core/module';
import { i18n } from '../environment';
import {
	string,
	watchForRedditEvents,
} from '../utils';

export const module: Module<*> = new Module('commentSortBy');

module.moduleName = 'commentSortBy';
module.category = 'commentsCategory';
module.disabledByDefault = false;
module.description = 'addCommentSortPrefMenuItemDesc';
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
				title="${i18n('addCommentSortPrefMenuItemLinkTitle')}"
				href="https://old.reddit.com/prefs/#default_comment_sort"
				target="_blank"
			>${'\u00A0'/* nbsp */}</a>
		`);
	});
};
