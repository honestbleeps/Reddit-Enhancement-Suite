import aboutTemplate from '../templates/aboutPanel.mustache';
import { CreateElement } from '../utils';
import { i18n } from '../environment';

export const module = {};

module.moduleID = 'about';
module.moduleName = i18n('aboutName');
module.category = i18n('aboutCategory');
module.sort = -10;
module.alwaysEnabled = true;
module.description = aboutTemplate();

module.options = {};

module.options.presets = {
	type: 'button',
	description: i18n('aboutOptionsPresets'),
	text: CreateElement.icon('F142'),
	callback: { moduleID: 'presets' },
};

module.options.backup = {
	type: 'button',
	description: i18n('aboutOptionsBackup'),
	text: CreateElement.icon('F059'),
	callback: { moduleID: 'backupAndRestore' },
};

module.options.searchSettings = {
	type: 'button',
	description: i18n('aboutOptionsSearchSettings'),
	text: CreateElement.icon('F097'),
	callback: { moduleID: 'search' },
};

module.options.announcements = {
	type: 'button',
	description: i18n('aboutOptionsAnnouncements'),
	text: CreateElement.icon('F108'),
	callback: '/r/RESAnnouncements/new',
};

module.options.donate = {
	type: 'button',
	description: i18n('aboutOptionsDonate'),
	text: CreateElement.icon('F104'),
	callback: { moduleID: 'contribute' },
};

module.options.bugs = {
	type: 'button',
	description: i18n('aboutOptionsBugs'),
	text: CreateElement.icon('F003'),
	callback: '/r/RESIssues/wiki/postanissue',
};

module.options.suggestions = {
	type: 'button',
	description: i18n('aboutOptionsSuggestions'),
	text: CreateElement.icon('F076'),
	callback: '/r/Enhancement',
};

module.options.faq = {
	type: 'button',
	description: i18n('aboutOptionsFAQ'),
	text: CreateElement.icon('F0D3'),
	callback: '/r/Enhancement/wiki/index',
};

module.options.code = {
	type: 'button',
	description: i18n('aboutOptionsCode'),
	text: CreateElement.icon('F063'),
	callback: 'https://github.com/honestbleeps/Reddit-Enhancement-Suite',
};

module.options.contributors = {
	type: 'button',
	description: i18n('aboutOptionsContributors'),
	text: CreateElement.icon('F048'),
	callback: '/r/Enhancement/wiki/about/team',
};

module.options.privacy = {
	type: 'button',
	description: i18n('aboutOptionsPrivacy'),
	text: CreateElement.icon('F0C2'),
	callback: '/r/Enhancement/wiki/about/privacy',
};

module.options.license = {
	type: 'button',
	description: i18n('aboutOptionsLicense'),
	text: CreateElement.icon('F0D3'),
	callback: 'http://www.gnu.org/licenses/gpl-3.0.html',
};
