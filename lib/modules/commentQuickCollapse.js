/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { Thing } from '../utils';

export const module: Module<*> = new Module('commentQuickCollapse');

module.moduleName = 'commentQuickCollapseName';
module.category = 'commentsCategory';
module.description = 'commentQuickCollapseDesc';

module.options = {
};

module.include = [
	'comments',
];

module.go = () => {
	hideCommentsOnHeaderDoubleClick();
};

function hideCommentsOnHeaderDoubleClick() {
	$('.commentarea').on('dblclick', '.tagline', (e: Event) => {
		const toggleElement = Thing.checkedFrom(e.target).getCommentToggleElement();
		if (!toggleElement) return;

		toggleElement.click();

		// since the browser will select the whole comment exchange
		// on a double click, we manually deselect it
		if (window.getSelection()) {
			window.getSelection().removeAllRanges();
		}
	});
}
