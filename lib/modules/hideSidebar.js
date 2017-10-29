/* @flow */
import { $ } from '../vendor';
import _ from 'lodash';
import { Module } from '../core/module';
import { i18n } from '../environment';
import * as Menu from './menu';
import { CreateElement } from '../utils';

export const module: Module<*> = new Module('hideSidebar');

module.moduleName 	= 'hideSidebarName';
module.category 	= 'productivityCategory';
module.description 	= 'hideSidebarTabDesc';

const rulesCheck	= ['reddiquette', 'rules'];

let hideLabel;
let showLabel;
let hideSidebarMenuItem;
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
let sidebarHidden = false;

const setup = _.once(() => {

	$side 			= $(".side");
	$content 		= $(".content[role=main]");
	documentHalf 	= $(document).width() / 2;
	contentOffset 	= $content.offset();
	headerHeight 	= $("#header[role=banner]").height();
	sideContent 	= $side.text().toLowerCase();
	sideWidth 		= $side.width();

	const paddingLeft 	= $content.css("padding-left");
	const paddingRight 	= $content.css("padding-right");
	const marginLeft 	= $content.css("margin-left");
	const marginRight 	= $content.css("margin-right");

	if (parseInt(paddingRight) > parseInt(marginRight)) {
		propToChange = "padding-right";
		valueToChangeFrom = paddingRight;
		valueToChangeTo = parseInt(paddingLeft) > 0 ? paddingLeft : marginLeft;
	} else {
		propToChange = "margin-right";
		valueToChangeFrom = marginRight;
		valueToChangeTo = parseInt(marginLeft) > 0 ? marginLeft : paddingLeft;
	}

});

const toggleSidebar = () => {

	setup();

	if (!sidebarHidden) {
		let check = true;
		if (rulesCheck.some((v) => { return sideContent.indexOf(v) >= 0; })) {
			check = confirm("Have you read the rules?");
		}
		if (check) {
			hideSidebar();
		}
	} else {
		showSidebar();
	}
}

/*
Iterate through elements of the sidebar and make them visible
in case they are a sub navigation
*/
const recursiveEach = ($element) => {
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

const hideSidebar = () => {
	$side.css({
		"visibility": "hidden",
		"width": 0
	});
	recursiveEach($side);
	$content.css(propToChange, valueToChangeTo);
	hideSidebarMenuItem.innerText = showLabel;
	sidebarHidden = true;
}

const showSidebar = () => {
	$side.css({
		"visibility": "visible",
		"width": sideWidth + "px"
	});
	$content.css(propToChange, valueToChangeFrom);
	hideSidebarMenuItem.innerText = hideLabel;
	sidebarHidden = false;
}

module.beforeLoad = () => {
	hideLabel 	= i18n("hideSidebarHideLabel");
	showLabel 	= i18n("hideSidebarShowLabel");
};

module.go = () => {

	hideSidebarMenuItem = CreateElement.tabMenuItem({
		text: hideLabel,
		className: 'res-hide-sidebar'
	});

	hideSidebarMenuItem.addEventListener('change', e => {
		e.preventDefault();
		hideSidebarMenuItem.parentNode.classList.remove("selected")
		toggleSidebar();
	});
	// TODO: Localstorage

};
