/* @flow */

import { markdown } from 'snudown-js';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { isPageType } from '../utils';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('modHelper');

module.moduleName = 'modhelperName';
module.category = 'coreCategory';
module.description = 'modhelperDesc';
module.hidden = true;
module.alwaysEnabled = true;
module.go = () => {
	if (isPageType('stylesheet')) {
		doStyleSheetCheck();
	}
};

const tips = {
	'no-res-styles': 'It appears you haven\'t done any styling specific to RES.  If you are interested in a quick overview on styling for RES users, please see [our wiki article](/r/Enhancement/wiki/subredditstyling)',
	keyNav: 'Styling `RES-keyNav-activeElement`? This is the element RES uses for Keyboard Navigation - it indicates the currently selected post, and is crucial to RES functionality. If you don\'t like the way it looks with your theme, you may style it however you want, as long as Keyboard Navigation remains usable for your visitors.',
	'keyNav-benice': `It appears that you are hiding \`RES-keyNav-activeElement\`. This negatively affects RES users by rendering keyboard navigation unusable. It's understandable that you may not care for the default appearance, but we politely request that you consider styling it to fit your subreddit, perhaps using a particular background color or border. Even just a one-sided border, e.g. \`border-right: 3px solid blue;\` - thank you for your consideration.\n\n For convenience we've included \`RES-keyNav-activeThing\` which can be used as an alternative to \`RES-keyNav-activeElement\`. It applies to elements with the class \`thing\` as opposed to \`entry\`. If you choose to use this, make sure keyboard navigation is usable when [commentBoxes](${SettingsNavigation.makeUrlHash('styleTweaks', 'commentBoxes')}) is turned off.`,
	nightmode: 'Want your subreddit to be night mode friendly? Please have a look at [the night mode section of our wiki](/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit)',
};

function doStyleSheetCheck() {
	const $stylesheetTextarea = $('.stylesheet-customize-container textarea');
	const stylesheet = ($stylesheetTextarea.length) ? $($stylesheetTextarea).val() : '';

	createTipPane();
	if (stylesheet.length) {
		// check if they have any RES styles at all
		if (!stylesheet.includes('.res') && !stylesheet.includes('.RES')) {
			addTipToPane('no-res-styles');
		}
		if (!stylesheet.includes('.res-nightmode')) {
			addTipToPane('nightmode');
		}

		// check if they're hiding RES-keyNav-activeElement
		const keyNavIdx = stylesheet.indexOf('.RES-keyNav-activeElement');
		if (keyNavIdx !== -1) {
			let keyNavRule = '';
			let i = keyNavIdx;
			while (i < stylesheet.length) {
				const thisChar = stylesheet.charAt(i);
				keyNavRule += thisChar;
				if (thisChar === '}') {
					i = stylesheet.length;
				}
				i++;
			}
			if (
				(
					keyNavRule.includes('transparent') ||
					keyNavRule.includes('background: none') ||
					keyNavRule.includes('background-color: none')
				) &&
				!keyNavRule.includes('border') &&
				!stylesheet.includes('.RES-keyNav-activeThing')
			) {
				addTipToPane('keyNav-benice');
			} else {
				addTipToPane('keyNav');
			}
		}
	}
}

let $tipPane, $tipPaneHeader, $tipPaneContents, $tipPaneList;

function createTipPane() {
	const $sheetsDiv = $('div.sheets');

	$tipPane = $('<div>', { id: 'RESStyleSheetTipPane' });
	$tipPaneHeader = $('<div>', {
		id: 'RESStyleSheetTipPane-header',
		class: 'minimized',
		text: 'RES specific styling tips',
		click: toggleTipPane,
	});

	const $tipPaneCloseButton = $('<span>', {
		id: 'RESStyleSheetTipPane-close',
		class: 'RESCloseButton',
		html: '&times;',
		title: 'Close for this session',
		click: hideTipPane,
	});

	const $tipPaneHeaderSpan = $('<span>', { class: 'details', text: '[click for details]' });

	$tipPaneHeader
		.append($tipPaneCloseButton)
		.append($tipPaneHeaderSpan);

	$tipPaneContents = $('<div>', { id: 'RESStyleSheetTipPane-contents' });
	$tipPaneList = $('<ul>', { id: 'RESStyleSheetTipPane-list' });
	$tipPaneContents.append($tipPaneList);

	$tipPane
		.append($tipPaneHeader)
		.append($tipPaneContents);

	$sheetsDiv.before($tipPane);
}

function hideTipPane() {
	sessionStorage.setItem('hideTipPane', 'true');
	$tipPane.hide();
}

function toggleTipPane() {
	if ($tipPaneHeader.hasClass('minimized')) {
		openTipPaneContents();
	} else {
		closeTipPaneContents();
	}
}

function openTipPaneContents() {
	$tipPaneHeader.removeClass('minimized');
	$tipPaneContents.slideDown();
}

function closeTipPaneContents() {
	$tipPaneHeader.addClass('minimized');
	$tipPaneContents.slideUp();
}

function addTipToPane(key) {
	const tipText = tips[key];
	const $tip = $('<li>', { html: markdown(tipText) });

	if (!sessionStorage.getItem('hideTipPane')) {
		$tipPane.show();
	}

	$tipPaneList.append($tip);
}
