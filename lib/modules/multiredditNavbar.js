/* @flow */

import { Module } from '../core/module';
import { i18n } from '../environment';
import { string } from '../utils';
import * as Hover from './hover';
import * as SettingsNavigation from './settingsNavigation';
import * as PenaltyBox from './penaltyBox';

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
		title: 'multiredditNavbarSectionMenuTitle',
	},
	sectionLinks: {
		dependsOn: options => options.sectionMenu.value,
		type: 'table',
		addRowText: 'multiredditNavbarAddShortcut',
		fields: [{
			key: 'label',
			name: 'multiredditNavbarLabel',
			type: 'text',
		}, {
			key: 'url',
			name: 'multiredditNavbarUrl',
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
		title: 'multiredditNavbarSectionLinksTitle',
	},
	hoverDelay: {
		dependsOn: options => options.sectionMenu.value,
		type: 'text',
		value: '1000',
		description: 'multiredditNavbarHoverDelayDesc',
		title: 'multiredditNavbarHoverDelayTitle',
		advanced: true,
	},
	fadeDelay: {
		dependsOn: options => options.sectionMenu.value,
		type: 'text',
		value: '200',
		description: 'multiredditNavbarFadeDelayDesc',
		title: 'multiredditNavbarFadeDelayTitle',
		advanced: true,
	},
	fadeSpeed: {
		dependsOn: options => options.sectionMenu.value,
		type: 'text',
		value: '0.7',
		description: 'multiredditNavbarFadeSpeedDesc',
		title: 'multiredditNavbarFadeSpeedTitle',
		advanced: true,
	},
};

module.contentStart = () => {
	if (module.options.sectionMenu.value) {
		Hover.dropdownList(module.moduleID)
			.options({
				openDelay: PenaltyBox.penalizedDelay(module.moduleID, 'sectionMenu', module.options.hoverDelay),
				fadeDelay: parseFloat(module.options.fadeDelay.value),
				fadeSpeed: parseFloat(module.options.fadeSpeed.value),
				pin: Hover.pin.right,
				offsetWidth: -10,
				offsetHeight: 1,
				bottomPadding: 0,
			})
			.populateWith(card => [getListFragment(card.getCheckedTarget().href)])
			.watch('.listing-chooser .multis li a');
	}
};

const getListFragment = baseUrl => {
	PenaltyBox.alterFeaturePenalty(module.moduleID, 'sectionMenu', 5);

	const fragment = document.createDocumentFragment();

	for (const link of module.options.sectionLinks.value) {
		const label = link[0] || '';
		const url = link[1] || '';
		const li = string.html`<li><a href="${baseUrl}${url}">${label}</a></li>`;

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
