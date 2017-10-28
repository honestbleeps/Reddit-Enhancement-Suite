/* @flow */
import { $ } from '../vendor';
import { Module } from '../core/module';
import { i18n } from '../environment';
import * as Menu from './menu';
import {
	CreateElement
} from '../utils';

export const module: Module<*> = new Module('hideSidebar');

module.moduleName = 'hideSidebarName';
module.category = 'productivityCategory';
module.description = 'hideSidebarTabDesc';

let hideSidebar;
let propToChange;
let valueToChangeTo;
let valueToChangeFrom;
let $side;
let $content;
let contentOffset;
let headerHeight;
let documentHalf;
let sideContent;
let sideWidth;
let rulesCheck = ['reddiquette', 'rules'];

const toggleSidebar = () => {

	if (!$content.data('sidebar-hidden')) {
		let check = true;
		if (rulesCheck.some(function (v) { return sideContent.indexOf(v) >= 0; })) {
			check = confirm("Have you read the rules?");
		}
		if (check) {
			doHideSidebar();
		}
	} else {
		doShowSidebar();
	}
}

function recursiveEach($element) {
	$element.children().each(function () {
		let $this = $(this);
		let thisOffset = $this.offset();
		if ($this.css("position") == "absolute" &&
			thisOffset.top >= headerHeight &&
			thisOffset.top <= contentOffset.top &&
			thisOffset.left < documentHalf
		) {
			$this.css("visibility", "visible");
		}
		recursiveEach($this);
	});

}

const doHideSidebar = () => {
	$side.css({
		"visibility": "hidden",
		"width": 0
	});
	recursiveEach($side);
	$content.css(`${propToChange}-right`, valueToChangeTo);
	hideSidebar.innerText = "show sidebar";
	$content.data('sidebar-hidden', true);
}

const doShowSidebar = () => {
	$side.css({
		"visibility": "visible",
		"width": sideWidth + "px"
	});
	$content.css(`${propToChange}-right`, valueToChangeFrom);
	hideSidebar.innerText = "hide sidebar";
	$content.data('sidebar-hidden', false);
}

module.go = () => {
	$side = $(".side");
	$content = $(".content[role=main]");
	documentHalf = $(document).width() / 2;
	contentOffset = $content.offset();
	headerHeight = $("#header[role=banner]").height();
	sideContent = $side.text().toLowerCase();
	sideWidth = $side.width();

	let padding = $content.css("padding").split(" ");
	let margin = $content.css("margin").split(" ");

	if (padding[1] > margin[1]) {
		propToChange = "padding";
		valueToChangeFrom = padding[1];
		valueToChangeTo = parseInt(padding[3]) > 0 ? padding[3] : margin[3];
	} else {
		propToChange = "margin";
		valueToChangeFrom = margin[1];
		valueToChangeTo = parseInt(margin[3]) > 0 ? margin[3] : padding[3];
	}

	let oldHideSidebar = CreateElement.tabMenuItem({
		text: 'hide sidebar'
	});

	hideSidebar = document.createElement('a');
	hideSidebar.innerText = oldHideSidebar.innerText;
	$(oldHideSidebar).replaceWith(hideSidebar);

	hideSidebar.addEventListener('click', e => {
		e.preventDefault();
		toggleSidebar();
	});
	// TODO: Localstorage
};
