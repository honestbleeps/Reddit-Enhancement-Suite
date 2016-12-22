/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { i18n } from '../environment';
import * as Hover from './hover';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('multiredditNavbar');

module.moduleName = 'multiredditNavbarName';
module.description = 'multiredditNavbarDesc';
module.category = 'subredditsCategory';

module.include = [
	// frontpage, multireddits, /r/all (including /r/all-sub1-sub2),
	// and some other special subreddits (/r/mod)
	// fails gracefully (and cheaply) if we're on a linklist page without the multireddit sidebar
	'linklist',
];

module.options = {
	sectionMenu: {
		type: 'boolean',
		value: true,
		description: 'multiredditNavbarSectionMenuDesc',
	},
	sectionLinks: {
		dependsOn: 'sectionMenu',
		type: 'table',
		addRowText: '+add multireddit section shortcut',
		fields: [{
			name: 'label',
			type: 'text',
		}, {
			name: 'url',
			type: 'text',
		}],
		value: [
			['new', './new'],
			['rising', './rising'],
			['controversial', './controversial'],
			['top', './top'],
			['top this month', './top?t=month'],
			['gilded', './gilded'],
			['promoted', './ads'],
		],
		description: 'multiredditNavbarSectionLinksDesc',
	},
	hoverDelay: {
		dependsOn: 'sectionMenu',
		type: 'text',
		value: '1000',
		description: 'multiredditNavbarHoverDelayDesc',
		advanced: true,
	},
	fadeDelay: {
		dependsOn: 'sectionMenu',
		type: 'text',
		value: '200',
		description: 'multiredditNavbarFadeDelayDesc',
		advanced: true,
	},
	fadeSpeed: {
		dependsOn: 'sectionMenu',
		type: 'text',
		value: '0.7',
		description: 'multiredditNavbarFadeSpeedDesc',
		advanced: true,
	},
};

module.go = () => {
	if (module.options.sectionMenu.value) {
		$('.listing-chooser .multis').on('mouseover', 'li', onMouseoverMultiLink);
	}
};

function onMouseoverMultiLink(e: Event) {
	const link: ?HTMLAnchorElement = (e.currentTarget.querySelector('a[href^="/me/m"]'): any);
	if (!link) {
		return;
	}
	Hover.dropdownList(module.moduleID)
		.target(e.currentTarget)
		.options({
			openDelay: module.options.hoverDelay.value,
			fadeDelay: module.options.fadeDelay.value,
			fadeSpeed: module.options.fadeSpeed.value,
			pin: Hover.pin.right,
			offsetWidth: -10,
			offsetHeight: 1,
			bottomPadding: 0,
		})
		.populateWith(() => populateSectionMenu(link.href))
		.begin();
}

const populateSectionMenu = baseUrl => [
	module.options.sectionLinks.value
		.map(link => populateSectionItem(baseUrl, link))
		.reduce((prev, curr) => (curr ? prev.add(curr) : prev), $())
		.add(populateSectionItem(baseUrl, [
			`<i>${i18n(module.moduleName)}</i>`,
			SettingsNavigation.makeUrlHash(module.moduleID, 'sectionMenu'),
		])),
];

function populateSectionItem(baseUrl, link) {
	if (!(link && link.length >= 2)) {
		return $();
	}

	const label = link[0] || '';
	const url = link[1] || '';
	const $link = $('<a />')
		.safeHtml(label)
		.attr('href', `${baseUrl}${url}`);

	if (SettingsNavigation.isSettingsUrl(url)) {
		$link.append('<span class="RESMenuItemButton gearIcon" />');
	}

	$link.on('click', () => Hover.dropdownList(module.moduleID).close());

	return $('<li />').append($link);
}
