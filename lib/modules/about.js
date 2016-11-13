import aboutTemplate from '../templates/aboutPanel.mustache';
import { CreateElement } from '../utils';

export const module = {};

module.moduleID = 'about';
module.moduleName = 'aboutName';
module.category = 'aboutCategory';
module.sort = -10;
module.alwaysEnabled = true;
module.description = aboutTemplate();

module.options = {};

module.options.presets = {
	type: 'button',
	description: 'aboutOptionsPresets',
	text: CreateElement.icon('F142'),
	callback: { moduleID: 'presets' },
};

module.options.backup = {
	type: 'button',
	description: 'aboutOptionsBackup',
	text: CreateElement.icon('F059'),
	callback: { moduleID: 'backupAndRestore' },
};

module.options.searchSettings = {
	type: 'button',
	description: 'aboutOptionsSearchSettings',
	text: CreateElement.icon('F097'),
	callback: { moduleID: 'search' },
};

module.options.announcements = {
	type: 'button',
	description: 'aboutOptionsAnnouncements',
	text: CreateElement.icon('F108'),
	callback: '/r/RESAnnouncements/new',
};

module.options.donate = {
	type: 'button',
	description: 'aboutOptionsDonate',
	text: CreateElement.icon('F104'),
	callback: { moduleID: 'contribute' },
};

module.options.bugs = {
	type: 'button',
	description: 'aboutOptionsBugs',
	text: CreateElement.icon('F003'),
	callback: '/r/RESIssues/wiki/postanissue',
};

module.options.suggestions = {
	type: 'button',
	description: 'aboutOptionsSuggestions',
	text: CreateElement.icon('F076'),
	callback: '/r/Enhancement',
};

module.options.faq = {
	type: 'button',
	description: 'aboutOptionsFAQ',
	text: CreateElement.icon('F0D3'),
	callback: '/r/Enhancement/wiki/index',
};

module.options.code = {
	type: 'button',
	description: 'aboutOptionsCode',
	text: CreateElement.icon('F063'),
	callback: 'https://github.com/honestbleeps/Reddit-Enhancement-Suite',
};

module.options.contributors = {
	type: 'button',
	description: 'aboutOptionsContributors',
	text: CreateElement.icon('F048'),
	callback: '/r/Enhancement/wiki/about/team',
};

module.options.privacy = {
	type: 'button',
	description: 'aboutOptionsPrivacy',
	text: CreateElement.icon('F0C2'),
	callback: '/r/Enhancement/wiki/about/privacy',
};

module.options.license = {
	type: 'button',
	description: 'aboutOptionsLicense',
	text: CreateElement.icon('F0D3'),
	callback: 'http://www.gnu.org/licenses/gpl-3.0.html',
};