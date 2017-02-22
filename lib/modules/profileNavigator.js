/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { loggedInUser } from '../utils';
import { i18n } from '../environment';
import * as Hover from './hover';
import * as SettingsNavigation from './settingsNavigation';
import * as PenaltyBox from './penaltyBox';

export const module: Module<*> = new Module('profileNavigator');

module.moduleName = 'profileNavigatorName';
module.description = 'profileNavigatorDesc';
module.category = 'myAccountCategory';

module.options = {
	sectionMenu: {
		title: 'profileNavigatorSectionMenuTitle',
		type: 'boolean',
		value: true,
		description: 'profileNavigatorSectionMenuDesc',
	},
	sectionLinks: {
		title: 'profileNavigatorSectionLinksTitle',
		dependsOn: options => options.sectionMenu.value,
		description: 'profileNavigatorSectionLinksDesc',
		type: 'table',
		addRowText: '+add profile section shortcut',
		fields: [{
			key: 'label',
			name: 'label',
			type: 'text',
		}, {
			key: 'url',
			name: 'url',
			type: 'text',
		}],
		value: [
			['saved', './saved'],
			['comments', './comments'],
			['submitted', './submitted'],
			['gilded', './gilded'],
			['upvoted', './upvoted'],
			['downvoted', './downvoted'],
		],
	},
	hoverDelay: {
		title: 'profileNavigatorHoverDelayTitle',
		dependsOn: options => options.sectionMenu.value,
		type: 'text',
		value: '1000',
		description: 'profileNavigatorHoverDelayDesc',
		advanced: true,
	},
	fadeDelay: {
		title: 'profileNavigatorFadeDelayTitle',
		dependsOn: options => options.sectionMenu.value,
		type: 'text',
		value: '200',
		description: 'profileNavigatorFadeDelayDesc',
		advanced: true,
	},
	fadeSpeed: {
		title: 'profileNavigatorFadeSpeedTitle',
		dependsOn: options => options.sectionMenu.value,
		type: 'text',
		value: '0.7',
		description: 'profileNavigatorFadeSpeedDesc',
		advanced: true,
	},
};

module.go = () => {
	const username = loggedInUser();
	if (module.options.sectionMenu.value && username) {
		$('#header .user a').on('mouseover', (e: Event) => onMouseoverProfileLink(username, e));
	}
};

function onMouseoverProfileLink(user, e) {
	Hover.dropdownList(module.moduleID)
		.target(e.target)
		.options({
			openDelay: PenaltyBox.penalizedDelay(module.moduleID, 'sectionMenu', module.options.hoverDelay),
			fadeDelay: module.options.fadeDelay.value,
			fadeSpeed: module.options.fadeSpeed.value,
			pin: Hover.pin.bottom,
		})
		.populateWith(() => populateSectionMenu(user))
		.begin();
}

const populateSectionMenu = username => {
	PenaltyBox.alterFeaturePenalty(module.moduleID, 'sectionMenu', 5);
	return [module.options.sectionLinks.value
		.map(link => populateSectionItem(username, link))
		.reduce((prev, curr) => prev.add(curr), $())
		.add(populateSectionItem('..', [
			`<i>${i18n(module.moduleName)}</i>`,
			SettingsNavigation.makeUrlHash(module.moduleID, 'sectionMenu'),
		])),
	];
};

function populateSectionItem(username, link) {
	if (!(link && link.length >= 2)) {
		return $();
	}

	const label = link[0] || '';
	const url = link[1] || '';
	const $link = $('<a />')
		.safeHtml(label)
		.attr('href', `/user/${username}/${url}`);

	if (SettingsNavigation.isSettingsUrl(url)) {
		$link.append('<span class="RESMenuItemButton gearIcon" />');
	}

	$link.on('click', () => {
		Hover.dropdownList(module.moduleID).close();
		PenaltyBox.alterFeaturePenalty(module.moduleID, 'sectionMenu', -30);
	});

	return $('<li />').append($link);
}
