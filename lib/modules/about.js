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
		title: 'aboutPresetsTitle',
		type: 'button',
		description: 'aboutPresetsDesc',
		title: 'aboutOptionsPresetsTitle',
		text: CreateElement.icon('F142'),
		callback: { moduleID: 'presets' },
	},
	backup: {
		title: 'aboutBackupTitle',
		type: 'button',
		description: 'aboutBackupDesc',
		title: 'aboutOptionsBackupTitle',
		text: CreateElement.icon('F059'),
		callback: { moduleID: 'backupAndRestore' },
	},
	searchSettings: {
		title: 'aboutSearchSettingsTitle',
		type: 'button',
		description: 'aboutSearchSettingsDesc',
		title: 'aboutOptionsSearchSettingsTitle',
		text: CreateElement.icon('F097'),
		callback: { moduleID: 'search' },
	},
	announcements: {
		title: 'aboutAnnouncementsTitle',
		type: 'button',
		description: 'aboutAnnouncementsDesc',
		title: 'aboutOptionsAnnouncementsTitle',
		text: CreateElement.icon('F108'),
		callback: '/r/RESAnnouncements/new',
	},
	donate: {
		title: 'aboutDonateTitle',
		type: 'button',
		description: 'aboutDonateDesc',
		title: 'aboutOptionsDonateTitle',
		text: CreateElement.icon('F104'),
		callback: { moduleID: 'contribute' },
	},
	bugs: {
		title: 'aboutBugsTitle',
		type: 'button',
		description: 'aboutBugsDesc',
		title: 'aboutOptionsBugsTitle',
		text: CreateElement.icon('F003'),
		callback: '/r/RESIssues/wiki/postanissue',
	},
	suggestions: {
		title: 'aboutSuggestionsTitle',
		type: 'button',
		description: 'aboutSuggestionsDesc',
		title: 'aboutOptionsSuggestionsTitle',
		text: CreateElement.icon('F076'),
		callback: '/r/Enhancement',
	},
	faq: {
		title: 'aboutFaqTitle',
		type: 'button',
		description: 'aboutFaqDesc',
		title: 'aboutOptionsFAQTitle',
		text: CreateElement.icon('F0D3'),
		callback: '/r/Enhancement/wiki/index',
	},
	code: {
		title: 'aboutCodeTitle',
		type: 'button',
		description: 'aboutCodeDesc',
		title: 'aboutOptionsCodeTitle',
		text: CreateElement.icon('F063'),
		callback: 'https://github.com/honestbleeps/Reddit-Enhancement-Suite',
	},
	contributors: {
		title: 'aboutContributorsTitle',
		type: 'button',
		description: 'aboutContributorsDesc',
		title: 'aboutOptionsContributorsTitle',
		text: CreateElement.icon('F048'),
		callback: '/r/Enhancement/wiki/about/team',
	},
	privacy: {
		title: 'aboutPrivacyTitle',
		type: 'button',
		description: 'aboutPrivacyDesc',
		title: 'aboutOptionsPrivacyTitle',
		text: CreateElement.icon('F0C2'),
		callback: '/r/Enhancement/wiki/about/privacy',
	},
	license: {
		title: 'aboutLicenseTitle',
		type: 'button',
		description: 'aboutLicenseDesc',
		title: 'aboutOptionsLicenseTitle',
		text: CreateElement.icon('F0D3'),
		callback: 'http://www.gnu.org/licenses/gpl-3.0.html',
	},
};
