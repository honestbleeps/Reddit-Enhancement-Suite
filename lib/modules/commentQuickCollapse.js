/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	Thing,
	addCSS,
	watchForElement,
} from '../utils';
import toggleCommentsOnClickLeftEdgeStylesheetTemplate from '../templates/toggleCommentsOnClickLeftEdge.mustache';

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
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'color',
		value: '#D1D1D1',
		description: 'toggleCommentsLeftEdgeColorDesc',
		title: 'toggleCommentsLeftEdgeColorTitle',
	},
	leftEdgeHoverColor: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'color',
		value: '#B1B1B1',
		description: 'toggleCommentsLeftEdgeHoverColorDesc',
		title: 'toggleCommentsLeftEdgeHoverColorTitle',
	},
	leftEdgeCollapsedColor: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'color',
		value: '#B1B1B1',
		description: 'Hide minimize button'
	},
	leftEdgeWidth: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'text',
		value: '100',
	},
	hideCollapseButton: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'boolean',
		value: true,
		bodyClass: true,
	},
	scrollOnCollapse: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'boolean',
		value: true,
		description: 'Autoscroll on click'
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

function toggleCommentsOnClickLeftEdge(container) {
	container = container || document.body;
	const stylesheet = toggleCommentsOnClickLeftEdgeStylesheetTemplate({
		bColor: module.options.leftEdgeColor.value,
		hColor: module.options.leftEdgeHoverColor.value,
		cColor: module.options.leftEdgeCollapsedColor.value,
		widthI: 2 * (parseInt(module.options.leftEdgeWidth.value, 10) / 100),
		widthO: 2.5 * (parseInt(module.options.leftEdgeWidth.value, 10) / 100),
	});

	addCSS(stylesheet);
}

function scrollOnCollapse() {
	$(document.body).on('click', '.expand', function(event) {
		if ($(event.target).offset().top < $(window).scrollTop()) {
			$('html, body').animate({
				scrollTop: $(event.target).offset().top - 100
			}, 'fast');
		}
	});
}

