/* @flow */

import { Module } from '../core/module';
import { loggedInUser, string } from '../utils';
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

module.contentStart = () => {
	const username = loggedInUser();
	if (module.options.sectionMenu.value && username) {
		Hover.dropdownList(module.moduleID)
			.options({
				openDelay: PenaltyBox.penalizedDelay(module.moduleID, 'sectionMenu', module.options.hoverDelay),
				fadeDelay: parseFloat(module.options.fadeDelay.value),
				fadeSpeed: parseFloat(module.options.fadeSpeed.value),
				pin: Hover.pin.bottom,
			})
			.populateWith(() => [getListFragment(username)])
			.watch('#header .user a');
	}
};

const getListFragment = username => {
	PenaltyBox.alterFeaturePenalty(module.moduleID, 'sectionMenu', 5);

	const fragment = document.createDocumentFragment();

	for (const link of module.options.sectionLinks.value) {
		const label = link[0] || '';
		const url = link[1] || '';
		const li = string.html`<li><a href="/user/${username}/${url}">${label}</a></li>`;

		li.addEventListener('click', () => {
			Hover.dropdownList(module.moduleID).close();
			PenaltyBox.alterFeaturePenalty(module.moduleID, 'sectionMenu', -30);
		});

		fragment.append(li);
	}

	fragment.append(string.html`<li><a href=${SettingsNavigation.makeUrlHash(module.moduleID, 'sectionMenu')}>
		<i>${i18n(module.moduleName)}</i>
		<span class="RESMenuItemButton gearIcon"></span>
	</a></li>`);

	return fragment;
};
