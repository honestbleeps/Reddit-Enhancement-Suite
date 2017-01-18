/* @flow */

import _ from 'lodash';
import { Module } from '../core/module';
import { $ } from '../vendor';
import { click } from '../utils';
import {
	Thing,
	addCSS,
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
		description: 'toggleCommentsLeftEdgeCollapsedColorDesc',
		title: 'toggleCommentsLeftEdgeCollapsedColorTitle',
	},
	leftEdgeWidth: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'text',
		value: '50',
		description: 'toggleCommentsLeftEdgeWidthDesc',
		title: 'toggleCommentsLeftEdgeWidthTitle',
	},
	hideCollapseButton: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'boolean',
		value: false,
		bodyClass: true,
		description: 'toggleCommentsLeftEdgeHideButtonDesc',
		title: 'toggleCommentsLeftEdgeHideButtonTitle',
	},
	// removed dependancy since it can now be used without leftbar active
	scrollOnCollapse: {
		type: 'boolean',
		value: false,
		description: 'scrollOnCollapseDesc',
		title: 'scrollOnCollapseTitle',
	},
	scrollOnCollapseType: {
		dependsOn: 'scrollOnCollapse',
		type: 'boolean',
		value: false,
		description: 'scrollOnCollapseTypeDesc',
		title: 'scrollOnCollapseTypeTitle',
	},
	scrollOnCollapsePosition: {
		dependsOn: 'scrollOnCollapseType',
		type: 'text',
		value: '10',
		description: 'scrollOnCollapsePositionDesc',
		title: 'scrollOnCollapsePositionTitle',
	}
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
	// if not turned off then...
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
	const leftEdgeWidth = _.clamp(parseInt(module.options.leftEdgeWidth.value, 10), 0, parseInt(module.options.leftEdgeWidth.default, 10)) / 100;
	const stylesheet = toggleCommentsOnClickLeftEdgeStylesheetTemplate({
		bColor: module.options.leftEdgeColor.value,
		hColor: module.options.leftEdgeHoverColor.value,
		cColor: module.options.leftEdgeCollapsedColor.value,
		widthI: 2 * leftEdgeWidth,
		widthO: 2.5 * leftEdgeWidth,
	});

	addCSS(stylesheet);
}
// scrolls on collapse
function scrollOnCollapse() {
	$(document.body).on('click', '.expand', (event: Event) => {
		// if not clicked by user or if not a top level comment then return
		if (click.isProgrammaticEvent(event) || Thing.from(event.target.offsetParent).getParent()) {
			return;
		}
		let scrollDownValue;
		let nextSiblingVariable;
		// if nextSibling is null then correct for that
		try {
			nextSiblingVariable = event.target.offsetParent.nextSibling.nextSibling;
		} catch (e) {
			nextSiblingVariable = event.target.offsetParent;
		}
		// creates scroll values
		if(module.options.scrollOnCollapseType.value) {
			const screenHeight = (screen.height * module.options.scrollOnCollapsePosition.value) / 100;
			scrollDownValue = nextSiblingVariable.offsetTop - screenHeight;
		} else {
			scrollDownValue = nextSiblingVariable.offsetTop - event.originalEvent.y + 10;
		}
		console.log(Thing.from(event.target).thing.classList.contains('noncollapsed'));
		if (!Thing.from(event.target).thing.classList.contains('noncollapsed')) {
			$('html, body').animate({
				scrollTop: scrollDownValue,
			}, 0);
		}
	});
}
