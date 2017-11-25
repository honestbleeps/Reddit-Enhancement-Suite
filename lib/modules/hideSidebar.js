/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { i18n, Storage } from '../environment';
import * as Options from '../core/options';
import { CreateElement, currentSubreddit } from '../utils';

export const module: Module<*> = new Module('hideSidebar');

module.moduleName = 'hideSidebarName';
module.category = 'productivityCategory';
module.description = 'hideSidebarTabDesc';
module.options = {
	hideSidebars: {
		type: 'list',
		value: '',
		listType: 'subreddits',
		description: 'hideSidebarOptionsDesc',
		title: 'hideSidebarOptionsTitle',
	},
};

const rulesCheck = ['reddiquette', 'rules'];

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
let hiddenSidebars = [];
let sidebarRulesRead = false;
let currSub;

const setup = _.once(() => {
	$side 			= $('.side');
	$content 		= $('.content[role=main]');
	documentHalf 	= $(document).width() / 2;
	contentOffset 	= $content.offset();
	headerHeight 	= $('#header[role=banner]').height();
	sideContent 	= $side.text().toLowerCase();
	sideWidth 		= $side.width();

	const paddingLeft 	= $content.css('padding-left');
	const paddingRight 	= $content.css('padding-right');
	const marginLeft 	= $content.css('margin-left');
	const marginRight 	= $content.css('margin-right');

	if (parseInt(paddingRight, 10) > parseInt(marginRight, 10)) {
		propToChange = 'padding-right';
		valueToChangeFrom = paddingRight;
		valueToChangeTo = parseInt(paddingLeft, 10) > 0 ? paddingLeft : marginLeft;
	} else {
		propToChange = 'margin-right';
		valueToChangeFrom = marginRight;
		valueToChangeTo = parseInt(marginLeft, 10) > 0 ? marginLeft : paddingLeft;
	}
});

// Refetch for operation in case other tabs have modified state
function getStorage() {
	return Storage.get('RESoptions.hideSidebar');
}

const addSubreddit = subreddit => {
	getStorage().then(existingVal => {
		hiddenSidebars = existingVal ? existingVal.hideSidebars.value.split(',') : [];
		if (!hiddenSidebars.includes(subreddit)) {
			hiddenSidebars.push(subreddit);
			Options.set(module, 'hideSidebars', hiddenSidebars.join(','));
		}
		console.log('Hidden now:', hiddenSidebars);
	});
};

const removeSubreddit = subreddit => {
	// Refetch for operation in case other tabs have modified state
	getStorage().then(existingVal => {
		hiddenSidebars = existingVal ? existingVal.hideSidebars.value.split(',') : [];
		const i = hiddenSidebars.indexOf(subreddit);
		if (i !== -1) {
			hiddenSidebars.splice(i, 1);
			Options.set(module, 'hideSidebars', hiddenSidebars.join(','));
		}
		console.log('Hidden now:', hiddenSidebars);
	});
};

const toggleSidebar = () => {
	setup();

	if (!sidebarHidden) {
		let check = true;
		// https://github.com/eslint/eslint/issues/4353
		if (!sidebarRulesRead && rulesCheck.some(v => sideContent.indexOf(v) >= 0)) {
			check = confirm('Have you read the rules?');
		}
		if (check) {
			hideSidebar();
			sidebarRulesRead = true;
			addSubreddit(currSub);
		}
	} else {
		showSidebar();
		removeSubreddit(currSub);
	}
};

/*
Iterate through elements of the sidebar and make them visible
in case they are a sub navigation
*/
const recursiveEach = $element => {
	$element.children().each(() => {
		const $this = $(this);
		const thisOffset = $this.offset();
		if ($this.css('position') === 'absolute' &&
			thisOffset.top >= headerHeight &&
			thisOffset.top <= contentOffset.top &&
			thisOffset.left < documentHalf
		) {
			$this.css('visibility', 'visible');
		}
		recursiveEach($this);
	});
};

const hideSidebar = () => {
	$side.css({
		visibility: 'hidden',
		width: 0,
	});
	recursiveEach($side);
	$content.css(propToChange, valueToChangeTo);
	hideSidebarMenuItem.innerText = showLabel;
	sidebarHidden = true;
};

const showSidebar = () => {
	$side.css({
		visibility: 'visible',
		width: `${sideWidth}px`,
	});
	$content.css(propToChange, valueToChangeFrom);
	hideSidebarMenuItem.innerText = hideLabel;
	sidebarHidden = false;
};

module.beforeLoad = () => {
	hideLabel 	= i18n('hideSidebarHideLabel');
	showLabel 	= i18n('hideSidebarShowLabel');
};

module.go = () => {
	currSub = currentSubreddit();
	hideSidebarMenuItem = CreateElement.tabMenuItem({
		text: hideLabel,
		className: 'res-hide-sidebar',
	});

	hideSidebarMenuItem.addEventListener('change', e => {
		e.preventDefault();
		hideSidebarMenuItem.parentNode.classList.remove('selected');
		toggleSidebar();
	});

	//Options.set(module, 'hideSidebars', "classical");

	const existingVal = module.options.hideSidebars.value;

	hiddenSidebars = existingVal ? existingVal.split(',') : [];

	if (hiddenSidebars.includes(currSub)) {
		sidebarRulesRead = true;
		setup();
		hideSidebar();
	}
};
