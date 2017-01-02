/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	Thing,
	addCSS,
	watchForElement,
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
		value: true,
		description: 'toggleCommentsOnClickLeftEdgeDesc',
		title: 'toggleCommentsOnClickLeftEdgeTitle',
	},
	leftEdgeColor: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'text',
		value: '#D1D1D1',
		description: 'toggleCommentsLeftEdgeColorDesc',
		title: 'toggleCommentsLeftEdgeColorTitle',
	},
	leftEdgeHoverColor: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'text',
		value: '#B1B1B1',
		description: 'toggleCommentsLeftEdgeHoverColorDesc',
		title: 'toggleCommentsLeftEdgeHoverColorTitle',
	},
	leftEdgeCollapsedColor: {
		dependsOn: 'toggleCommentsOnClickLeftEdge',
		type: 'text',
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

module.go = () => {
	if (module.options.hideCommentsOnHeaderDoubleClick.value) {
		hideCommentsOnHeaderDoubleClick();
	}

	if (module.options.toggleCommentsOnClickLeftEdge.value) {
		toggleCommentsOnClickLeftEdge();
		watchForElement('newComments', toggleCommentsOnClickLeftEdge);
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
	var css = "";
	// css variables
	var bColor = 'background-color: ' + module.options.leftEdgeColor.value + ';';
	var hColor = 'background-color: ' + module.options.leftEdgeHoverColor.value + ';';
	var cColor = "background-color: " + module.options.leftEdgeCollapsedColor.value + "!important;"
	var cButton = "";
	// if transparent is enabled then...
	if (module.options.hideCollapseButton.value) {
		cButton = "color: transparent !important;"
	}
	//selects comment body
	var widthI = 2 * (parseInt(module.options.leftEdgeWidth.value, 10) / 100);
	var widthO = 2.5 * (parseInt(module.options.leftEdgeWidth.value, 10) / 100);

	// fetches the ids of each comment
	var comments = container.querySelectorAll(".comment");
	var commentRefrencer = "";
	// makes css for each id to have higher specificity than the subreddit custom css
	for (var i = 0; i < comments.length; i++) {
		if (comments[i].classList.contains('deleted')) {
			comments[i].id = "del" + i;
		}
		css += '#' + comments[i].id + " {padding-left: " + widthO + "em !important; box-shadow: 0px 1px 5px rgba(0,0,0,.16) !important; border: none !important; margin-bottom: 10px !important; margin-left: 0px !important;  position: relative; padding: 10px 10px 10px " + widthO + "em !important; padding-left: " + widthO + "em!important; border: 1px solid #EEE;}";
		css += '#' + comments[i].id + ".collapsed>.entry>.tagline>.expand{" + cColor + cButton + "}";
		css += '#' + comments[i].id + ">.entry>.tagline>.expand:hover { text-decoration: none; background-image: none !important; " + hColor + cButton + " }";
		css += '#' + comments[i].id + ">.entry>.tagline>.expand { margin-right: 3px !important; padding: 1px !important; height: 100% !important; background-image: none !important; position: absolute !important; top: 0 !important; left: 0 !important; bottom: 0 !important; width: " + widthI + "em !important; text-align: center !important; " + bColor + cButton + " font-size: 10px !important; transition: color .15s,background-color .15s; }";
	}
	// injects the css made into the reddit
	addCSS(css);
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

