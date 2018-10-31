/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { i18n } from '../environment';
import * as SettingsNavigation from './settingsNavigation';
import {
	string,
	watchForRedditEvents,
} from '../utils';

export const module: Module<*> = new Module('commentSortBy');

module.beforeLoad = () => {
	watchForRedditEvents('postModTools', (element, { post, _: { update } }) => {
		if (update) return;
		applyToPost();
	});
};

module.moduleName = 'commentSortBy';
module.category = 'commentsCategory';
module.disabledByDefault = false;
module.description = 'addCommentSortPrefMenuItemDesc';

export class SortByPrefLink {
	static buildTagElement = () => string.html`
			<a
				class="sortByPrefLink gearIcon"
				style="opacity: 0.3;"
				title="${i18n('addCommentSortPrefMenuItemLinkTitle')}"
				href="https://old.reddit.com/prefs/#default_comment_sort"
			>${'\u00A0'/* nbsp */}</a>
		`;

	static render() {
		$('#CommentSort--SortPicker').parent().append(SortByPrefLink.buildTagElement());
	}
}

type WatcherOptions = {|
	post_id?: string
|};

function applyToPost() {
	if ($('#CommentSort--SortPicker').parent().find('.sortByPrefLink').length === 0) {
		SortByPrefLink.render();
	}
}

module.afterLoad = () => {
	applyToPost();
};
