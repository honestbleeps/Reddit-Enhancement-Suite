/* @flow */

import _ from 'lodash';
import { Module } from '../core/module';
import { $ } from '../vendor';
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
		type: 'enum',
		values: [{
			name: 'Off',
			value: 'off',
		}, {
			name: 'Scroll all comments on collapse if top is out of screen',
			value: 'scrollTop',
		}, {
			name: 'Also scroll top comments always',
			value:'scrollAlways',
		}],
		value: 'off',
		description: 'scrollOnCollapseDesc',
		title: 'scrollOnCollapseTitle',
	},
	scrollOnCollapsePosition: {
		//dependsOn: scrollOnCollapse
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
	if (module.options.scrollOnCollapse.value !== 'off') {
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
	var screenH = (screen.height * module.options.scrollOnCollapsePosition.value) / 100;
	$(document.body).on('click', '.expand', (event: Event) => {
		// if scroll to top only
		if (module.options.scrollOnCollapse.value === 'scrollTop') {
			// checks if top is out of screen
			if ($(event.target).offset().top < $(window).scrollTop()) {
				$('html, body').animate({
					scrollTop: $(event.target).offset().top - screenH,
					//scrollTop: event.target.offsetParent.nextSibling.nextSibling.offsetTop - 200,
				}, 'fast');
			}
		} else if (module.options.scrollOnCollapse.value === 'scrollAlways'){
			// solution I found to check if topcomment, is there a better way?
			if (event.target.offsetParent.offsetParent.className.indexOf('thing') === -1) {
				// if comment is collapsed scroll to next comment else scroll to expanded comment
				if (event.target.offsetParent.className.indexOf('noncollapsed') === -1) {
					$('html, body').animate({
						scrollTop: event.target.offsetParent.nextSibling.nextSibling.offsetTop - screenH,
					}, 'fast');
				} else {
					$('html, body').animate({
						scrollTop: event.target.offsetParent.offsetTop - screenH,
					}, 'fast');
				}
			}
		}
	});
}
