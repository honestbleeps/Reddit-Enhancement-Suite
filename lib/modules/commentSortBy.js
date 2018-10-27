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

module.moduleName = 'commentSortBy';
module.category = 'commentsCategory';
module.disabledByDefault = false;
module.description = 'addCommentSortPrefMenuItemDesc';

export class SortByPrefLink {
	color: ?string = null;
	
	static defaultTagElement = (e => () => e().cloneNode(true))(_.once(() => SortByPrefLink.buildTagElement()));
	static buildTagElement({ color }: { color: ?string } = {}) {
		return string.html`
			<span class="RESUserTag">
				<a
					class="sortByPrefLink gearIcon"
					style="opacity: 0.3;"
					title="Set default sort by preferences"
					href="https://${rawLocale()}.reddit.com/prefs/#default_comment_sort"
				>${'\uFE0F'}</a>
			</span>
		`;
	}
	
	static render() {
		let bttn = (this.color) ? SortByPrefLink.buildTagElement(this) : SortByPrefLink.defaultTagElement();
		console.log($("#CommentSort--SortPicker"));
		console.log($("#CommentSort--SortPicker").parent());
		console.log($("#CommentSort--SortPicker").parent().children());
		$("#CommentSort--SortPicker").parent().append(bttn);
	}
}

module.afterLoad = () => {
	
	SortByPrefLink.render();
			
};
