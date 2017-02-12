/* @flow */

import aboutTemplate from '../templates/aboutPanel.mustache';
import { Module } from '../core/module';
import { CreateElement } from '../utils';

export const module: Module<*> = new Module('about');

module.moduleName = 'aboutName';
module.category = 'aboutCategory';
module.sort = -10;
module.alwaysEnabled = true;
module.description = aboutTemplate();

module.options = {
	presets: {
		type: 'button',
		description: 'aboutOptionsPresets',
		title: 'aboutOptionsPresetsTitle',
		text: CreateElement.icon('F142'),
		callback: { moduleID: 'presets' },
	},
	backup: {
		type: 'button',
		description: 'aboutOptionsBackup',
		title: 'aboutOptionsBackupTitle',
		text: CreateElement.icon('F059'),
		callback: { moduleID: 'backupAndRestore' },
	},
	searchSettings: {
		type: 'button',
		description: 'aboutOptionsSearchSettings',
		title: 'aboutOptionsSearchSettingsTitle',
		text: CreateElement.icon('F097'),
		callback: { moduleID: 'search' },
	},
	announcements: {
		type: 'button',
		description: 'aboutOptionsAnnouncements',
		title: 'aboutOptionsAnnouncementsTitle',
		text: CreateElement.icon('F108'),
		callback: '/r/RESAnnouncements/new',
	},
	donate: {
		type: 'button',
		description: 'aboutOptionsDonate',
		title: 'aboutOptionsDonateTitle',
		text: CreateElement.icon('F104'),
		callback: { moduleID: 'contribute' },
	},
	bugs: {
		type: 'button',
		description: 'aboutOptionsBugs',
		title: 'aboutOptionsBugsTitle',
		text: CreateElement.icon('F003'),
		callback: '/r/RESIssues/wiki/postanissue',
	},
	suggestions: {
		type: 'button',
		description: 'aboutOptionsSuggestions',
		title: 'aboutOptionsSuggestionsTitle',
		text: CreateElement.icon('F076'),
		callback: '/r/Enhancement',
	},
	faq: {
		type: 'button',
		description: 'aboutOptionsFAQ',
		title: 'aboutOptionsFAQTitle',
		text: CreateElement.icon('F0D3'),
		callback: '/r/Enhancement/wiki/index',
	},
	code: {
		type: 'button',
		description: 'aboutOptionsCode',
		title: 'aboutOptionsCodeTitle',
		text: CreateElement.icon('F063'),
		callback: 'https://github.com/honestbleeps/Reddit-Enhancement-Suite',
	},
	contributors: {
		type: 'button',
		description: '<a target="_blank" rel="noopener noreferer" href="http://www.honestbleeps.com/">Steve Sobel</a> (<a target="_blank" rel="noopener noreferer" href="/user/honestbleeps/">/u/honestbleeps</a>) and a slew of community members have contributed code, design and/or great ideas to RES.',
		title: 'aboutOptionsContributorsTitle',
		text: CreateElement.icon('F048'),
		callback: 'https://redditenhancementsuite.com/about',
	},
	privacy: {
		type: 'button',
		description: 'aboutOptionsPrivacy',
		title: 'aboutOptionsPrivacyTitle',
		text: CreateElement.icon('F0C2'),
		callback: '/r/Enhancement/wiki/about/privacy',
	},
	license: {
		type: 'button',
		description: 'aboutOptionsLicense',
		title: 'aboutOptionsLicenseTitle',
		text: CreateElement.icon('F0D3'),
		callback: 'http://www.gnu.org/licenses/gpl-3.0.html',
	},
};
