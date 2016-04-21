import * as Hover from './hover';
import * as SettingsNavigation from './settingsNavigation';
import { $ } from '../vendor';
import { regexes } from '../utils';

export const module = {};

module.moduleID = 'multiredditNavbar';
module.moduleName = 'Multireddit Navigation';
module.description = 'Enhance the navigation bar shown on the left side of the frontpage.';
module.category = 'Subreddits';

module.includes = [
	regexes.frontpage
];

module.options = {
	sectionMenu: {
		type: 'boolean',
		value: true,
		description: 'Show a menu linking to various sections of the multireddit when hovering your mouse over the link.'
	},
	sectionLinks: {
		dependsOn: 'sectionMenu',
		type: 'table',
		addRowText: '+add multireddit section shortcut',
		fields: [{
			name: 'label',
			type: 'text'
		}, {
			name: 'url',
			type: 'text'
		}],
		value: [
			['new', './new'],
			['rising', './rising'],
			['controversial', './controversial'],
			['top', './top'],
			['top this month', './top?t=month'],
			['gilded', './gilded'],
			['promoted', './ads']
		]
	},
	hoverDelay: {
		dependsOn: 'sectionMenu',
		type: 'text',
		value: 1000,
		description: 'Delay, in milliseconds, before hover tooltip loads. Default is 1000.',
		advanced: true
	},
	fadeDelay: {
		dependsOn: 'sectionMenu',
		type: 'text',
		value: 200,
		description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.',
		advanced: true
	},
	fadeSpeed: {
		dependsOn: 'sectionMenu',
		type: 'text',
		value: 0.7,
		description: 'Fade animation\'s speed (in seconds). Default is 0.7.',
		advanced: true
	}
};

module.go = function() {
	const $multis = $('.listing-chooser .multis');

	if (module.options.sectionMenu.value) {
		$multis.on('mouseover', 'li', onMouseoverMultiLink);
	}
};

function onMouseoverMultiLink(e) {
	const link = e.currentTarget.querySelector('a[href^="/me/m"]');
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
			bottomPadding: 0
		})
		.populateWith(() => populateSectionMenu(link.href))
		.begin();
}

const populateSectionMenu = baseUrl => [
	module.options.sectionLinks.value
		.map(link => populateSectionItem(baseUrl, link))
		.reduce((prev, curr) => (curr ? prev.add(curr) : prev), $())
		.add(populateSectionItem('.', [
			`<i>${module.moduleName}</i>`,
			SettingsNavigation.makeUrlHash(module.moduleID, 'sectionMenu')
		]))
];

function populateSectionItem(baseUrl, link) {
	if (!(link && link.length >= 2)) {
		return false;
	}

	const label = link[0] || '';
	const url = link[1] || '';
	const $link = $('<a />')
		.safeHtml(label)
		.attr('href', `${baseUrl}/${url}`);

	if (url.indexOf('#!settings') !== -1) {
		$link.append('<span class="RESMenuItemButton gearIcon" />');
	}

	$link.on('click', () => Hover.dropdownList(module.moduleID).close());

	return $('<li />').append($link);
}
