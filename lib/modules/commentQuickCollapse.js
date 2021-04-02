/* @flow */

import $ from 'jquery';
import { clamp } from 'lodash-es';
import { Module } from '../core/module';
import {
	click,
	Thing,
	SelectedThing,
	addCSS,
} from '../utils';

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
		value: '#d1d1d1',
		description: 'toggleCommentsLeftEdgeColorDesc',
		title: 'toggleCommentsLeftEdgeColorTitle',
	},
	leftEdgeHoverColor: {
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'color',
		value: '#b1b1b1',
		description: 'toggleCommentsLeftEdgeHoverColorDesc',
		title: 'toggleCommentsLeftEdgeHoverColorTitle',
	},
	leftEdgeCollapsedColor: {
		dependsOn: options => options.toggleCommentsOnClickLeftEdge.value,
		type: 'color',
		value: '#b1b1b1',
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

module.contentStart = () => {
	if (module.options.hideCommentsOnHeaderDoubleClick.value) {
		hideCommentsOnHeaderDoubleClick();
	}
	if (module.options.scrollOnCollapse.value) {
		scrollOnCollapse();
	}
};

function hideCommentsOnHeaderDoubleClick() {
	$(document.body).on('dblclick', '.tagline', (e: Event) => {
		const thing = Thing.checkedFrom(e.currentTarget);
		thing.setCommentCollapse(!thing.isCollapsed(), 'commentQuickCollapse');

		// since the browser will select the whole comment exchange
		// on a double click, we manually deselect it
		if (window.getSelection()) {
			window.getSelection().removeAllRanges();
		}
	});
}

function toggleCommentsOnClickLeftEdge() {
	const leftEdgeWidth = clamp(parseInt(module.options.leftEdgeWidth.value, 10), 0, parseInt((module.options.leftEdgeWidth: any).default, 10)) / 100;

	addCSS(`
		.commentarea .comment {
			padding-left: ${2.5 * leftEdgeWidth}em !important;
		}

		.commentarea .comment > .entry > .tagline > .expand:hover {
			background-color: ${module.options.leftEdgeHoverColor.value};
		}

		.commentarea .entry > .tagline > .expand {
			width: ${2 * leftEdgeWidth}em !important;
			background-color: ${module.options.leftEdgeColor.value};
		}

		.commentarea .collapsed > .entry > .tagline > .expand {
			background-color: ${module.options.leftEdgeCollapsedColor.value};
		}
	`);
}

function scrollOnCollapse() {
	$(document.body).on('click', '.expand', (event: MouseEvent) => {
		// avoid scrolling on programmatic events (commentHidePersistor)
		if (click.isProgrammaticEvent(event)) return;

		const thing = Thing.checkedFrom(event.target);
		// don't scroll on uncollapsed comments
		if (thing.element.classList.contains('noncollapsed')) return;

		const target = thing.getClosest(Thing.prototype.getNextSibling, { direction: 'down' });
		if (!target) return;

		SelectedThing.set(target, { scrollStyle: 'adopt', from: thing.entry });
	});
}
