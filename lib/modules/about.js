/* @flow */

import { Module } from '../core/module';
import { CreateElement } from '../utils';

export const module: Module<*> = new Module('about');

module.moduleName = 'aboutName';
module.category = 'aboutCategory';
module.sort = -10;
module.alwaysEnabled = true;
module.description = 'aboutDesc';

module.options = {
	presets: {
		type: 'button',
		description: 'aboutOptionsPresets',
		title: 'aboutOptionsPresetsTitle',
		text: CreateElement.icon(0xF142),
		callback: { moduleID: 'presets' },
	},
	backup: {
		type: 'button',
		description: 'aboutOptionsBackup',
		title: 'aboutOptionsBackupTitle',
		text: CreateElement.icon(0xF059),
		callback: { moduleID: 'backupAndRestore' },
	},
	searchSettings: {
		type: 'button',
		description: 'aboutOptionsSearchSettings',
		title: 'aboutOptionsSearchSettingsTitle',
		text: CreateElement.icon(0xF097),
		callback: { moduleID: 'search' },
	},
	announcements: {
		type: 'button',
		description: 'aboutOptionsAnnouncements',
		title: 'aboutOptionsAnnouncementsTitle',
		text: CreateElement.icon(0xF108),
		callback: '/r/RESAnnouncements/new',
	},
	donate: {
		type: 'button',
		description: 'aboutOptionsDonate',
		title: 'aboutOptionsDonateTitle',
		text: CreateElement.icon(0xF104),
		callback: 'https://redditenhancementsuite.com/contribute/',
	},
	bugs: {
		type: 'button',
		description: 'aboutOptionsBugs',
		title: 'aboutOptionsBugsTitle',
		text: CreateElement.icon(0xF003),
		callback: '/r/RESIssues/wiki/postanissue',
	},
	suggestions: {
		type: 'button',
		description: 'aboutOptionsSuggestions',
		title: 'aboutOptionsSuggestionsTitle',
		text: CreateElement.icon(0xF076),
		callback: '/r/Enhancement',
	},
	faq: {
		type: 'button',
		description: 'aboutOptionsFAQ',
		title: 'aboutOptionsFAQTitle',
		text: CreateElement.icon(0xF0D3),
		callback: '/r/Enhancement/wiki/index',
	},
	code: {
		type: 'button',
		description: 'aboutOptionsCode',
		title: 'aboutOptionsCodeTitle',
		text: CreateElement.icon(0xF063),
		callback: 'https://github.com/honestbleeps/Reddit-Enhancement-Suite',
	},
	contributors: {
		type: 'button',
		description: 'aboutOptionsContributors',
		title: 'aboutOptionsContributorsTitle',
		text: CreateElement.icon(0xF048),
		callback: 'https://redditenhancementsuite.com/about',
	},
	privacy: {
		type: 'button',
		description: 'aboutOptionsPrivacy',
		title: 'aboutOptionsPrivacyTitle',
		text: CreateElement.icon(0xF0C2),
		callback: '/r/Enhancement/wiki/about/privacy',
	},
	license: {
		type: 'button',
		description: 'aboutOptionsLicense',
		title: 'aboutOptionsLicenseTitle',
		text: CreateElement.icon(0xF0D3),
		callback: 'https://www.gnu.org/licenses/gpl-3.0.html',
	},
};
