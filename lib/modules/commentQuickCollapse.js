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
		type: 'boolean',
		value: true,
		description: 'hideCommentsOnHeaderDoubleClickDesc',
		title: 'hideCommentsOnHeaderDoubleClickTitle',
	},
	toggleCommentsOnClickLeftEdge: {
		type: 'boolean',
		value: false,
		bodyClass: true,
		description: 'toggleCommentsOnClickLeftEdgeDesc',
		title: 'toggleCommentsOnClickLeftEdgeTitle',
	},
	leftEdgeColor: {
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'color',
		value: '#D1D1D1',
		description: 'toggleCommentsLeftEdgeColorDesc',
		title: 'toggleCommentsLeftEdgeColorTitle',
	},
	leftEdgeHoverColor: {
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'color',
		value: '#B1B1B1',
		description: 'toggleCommentsLeftEdgeHoverColorDesc',
		title: 'toggleCommentsLeftEdgeHoverColorTitle',
	},
	leftEdgeCollapsedColor: {
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'color',
		value: '#B1B1B1',
		description: 'toggleCommentsLeftEdgeCollapsedColorDesc',
		title: 'toggleCommentsLeftEdgeCollapsedColorTitle',
	},
	leftEdgeWidth: {
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'text',
		value: '50',
		description: 'toggleCommentsLeftEdgeWidthDesc',
		title: 'toggleCommentsLeftEdgeWidthTitle',
	},
	hideCollapseButton: {
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'boolean',
		value: false,
		bodyClass: true,
		description: 'toggleCommentsLeftEdgeHideButtonDesc',
		title: 'toggleCommentsLeftEdgeHideButtonTitle',
	},
	scrollOnCollapse: {
		type: 'boolean',
		value: false,
		description: 'scrollOnCollapseDesc',
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

		SelectedEntry.select(target, { scrollStyle: 'adopt', from: thing.entry });
	});
}
