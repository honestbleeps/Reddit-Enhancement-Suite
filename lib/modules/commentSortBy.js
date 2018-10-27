/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { rawLocale } from '../utils/localization';
import {
	loggedInUser,
	watchForThings,
	Alert,
	CreateElement,
	Thing,
	batch,
	click,
	downcast,
	isCurrentSubreddit,
	isPageType,
	string,
	watchForElements,
	empty,
	watchForRedditEvents,
	isAppType,
} from '../utils';

export const module: Module<*> = new Module('commentSortBy');

export const commentSortSelector = "#CommentSort--SortPicker";

module.beforeLoad = () => {
	watchForRedditEvents('postModTools', (element) => {
		applyToPost(element);
	});
};

module.moduleName = 'commentSortBy';
module.category = 'commentsCategory';
module.disabledByDefault = false;
module.description = 'addCommentSortPrefMenuItemDesc';

export class SortByPrefLink {
	
	static defaultTagElement = (e => () => e().cloneNode(true))(_.once(() => SortByPrefLink.buildTagElement()));
	static buildTagElement({}: {} = {}) {
		return string.html`
			<span class="RESUserTag">
				<a
					class="sortByPrefLink gearIcon"
					style="opacity: 0.3;"
					title="Set default sort by preferences"
					href="https://${rawLocale()}.reddit.com/prefs/#default_comment_sort"
				>${'\u00A0'/* nbsp */}</a>
			</span>
		`;
	}
	
	static render() {
		let bttn = SortByPrefLink.defaultTagElement();
		if ($("#CommentSort--SortPicker").parent().find('.sortByPrefLink').length === 0) {
			$("#CommentSort--SortPicker").parent().append(bttn);
		}
	}
}

function applyToPost(element: HTMLAnchorElement | HTMLElement, options?: WatcherOptions) {
	SortByPrefLink.render();
}

module.afterLoad = () => {
	SortByPrefLink.render();
};
