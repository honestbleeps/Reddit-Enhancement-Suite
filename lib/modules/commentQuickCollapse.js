/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	click,
	Thing,
	addCSS,
} from '../utils';
import toggleCommentsOnClickLeftEdgeStylesheetTemplate from '../templates/toggleCommentsOnClickLeftEdge.mustache';
import * as SelectedEntry from './selectedEntry';

export const module: Module<*> = new Module('commentQuickCollapse');

module.moduleName = 'commentQuickCollapseName';
module.category = 'commentsCategory';
module.description = 'commentQuickCollapseDesc';

module.options = {
	hideCommentsOnHeaderDoubleClick: {
		title: 'commentQuickCollapseHideCommentsOnHeaderDoubleClickTitle',
		type: 'boolean',
		value: true,
		description: 'commentQuickCollapseHideCommentsOnHeaderDoubleClickDesc',
		title: 'hideCommentsOnHeaderDoubleClickTitle',
	},
	toggleCommentsOnClickLeftEdge: {
		title: 'commentQuickCollapseToggleCommentsOnClickLeftEdgeTitle',
		type: 'boolean',
		value: false,
		bodyClass: true,
		description: 'commentQuickCollapseToggleCommentsOnClickLeftEdgeDesc',
		title: 'toggleCommentsOnClickLeftEdgeTitle',
	},
	leftEdgeColor: {
		title: 'commentQuickCollapseLeftEdgeColorTitle',
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'color',
		value: '#D1D1D1',
		description: 'commentQuickCollapseLeftEdgeColorDesc',
		title: 'toggleCommentsLeftEdgeColorTitle',
	},
	leftEdgeHoverColor: {
		title: 'commentQuickCollapseLeftEdgeHoverColorTitle',
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'color',
		value: '#B1B1B1',
		description: 'commentQuickCollapseLeftEdgeHoverColorDesc',
		title: 'toggleCommentsLeftEdgeHoverColorTitle',
	},
	leftEdgeCollapsedColor: {
		title: 'commentQuickCollapseLeftEdgeCollapsedColorTitle',
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'color',
		value: '#B1B1B1',
		description: 'commentQuickCollapseLeftEdgeCollapsedColorDesc',
		title: 'toggleCommentsLeftEdgeCollapsedColorTitle',
	},
	leftEdgeWidth: {
		title: 'commentQuickCollapseLeftEdgeWidthTitle',
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'text',
		value: '50',
		description: 'commentQuickCollapseLeftEdgeWidthDesc',
		title: 'toggleCommentsLeftEdgeWidthTitle',
	},
	hideCollapseButton: {
		title: 'commentQuickCollapseHideCollapseButtonTitle',
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'boolean',
		value: false,
		bodyClass: true,
		description: 'commentQuickCollapseHideCollapseButtonDesc',
		title: 'toggleCommentsLeftEdgeHideButtonTitle',
	},
	scrollOnCollapse: {
		title: 'commentQuickCollapseScrollOnCollapseTitle',
		type: 'boolean',
		value: false,
		description: 'commentQuickCollapseScrollOnCollapseDesc',
		title: 'scrollOnCollapseTitle',
	},
};

module.include = [
	'comments',
];

module.beforeLoad = () => {
	if (module.options.toggleCommentsOnClickLeftEdge.value) {
		toggleCommentsOnClickLeftEdge();
	}
};

module.go = () => {
	if (module.options.hideCommentsOnHeaderDoubleClick.value) {
		hideCommentsOnHeaderDoubleClick();
	}
	if (module.options.scrollOnCollapse.value) {
		scrollOnCollapse();
	}
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

function toggleCommentsOnClickLeftEdge() {
	const leftEdgeWidth = _.clamp(parseInt(module.options.leftEdgeWidth.value, 10), 0, parseInt((module.options.leftEdgeWidth: any).default, 10)) / 100;
	const stylesheet = toggleCommentsOnClickLeftEdgeStylesheetTemplate({
		bColor: module.options.leftEdgeColor.value,
		hColor: module.options.leftEdgeHoverColor.value,
		cColor: module.options.leftEdgeCollapsedColor.value,
		widthI: 2 * leftEdgeWidth,
		widthO: 2.5 * leftEdgeWidth,
	});

	addCSS(stylesheet);
}

function scrollOnCollapse() {
	$(document.body).on('click', '.expand', (event: MouseEvent) => {
		// avoid scrolling on programmatic events (commentHidePersistor)
		if (click.isProgrammaticEvent(event)) return;

		const thing = Thing.checkedFrom(event.target);
		// don't scroll on uncollapsed comments
		if (thing.thing.classList.contains('noncollapsed')) return;

		const target = thing.getClosest(Thing.prototype.getNextSibling, { direction: 'down' });
		if (!target) return;

		SelectedEntry.select(target, { scrollStyle: 'adopt' });
	});
}
