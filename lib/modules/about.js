import aboutTemplate from '../templates/aboutPanel.mustache';
import { CreateElement } from '../utils';

export const module = {};

module.moduleID = 'about';
module.moduleName = 'About RES';
module.category = 'About RES';
module.sort = -10;
module.alwaysEnabled = true;
module.description = aboutTemplate();

module.options = {};

module.options.presets = {
	type: 'button',
	description: 'Quickly customize RES with various presets.',
	text: CreateElement.icon('F142'),
	callback: { moduleID: 'presets' },
};

module.options.backup = {
	type: 'button',
	description: 'Back up and restore your RES settings.',
	text: CreateElement.icon('F059'),
	callback: { moduleID: 'backupAndRestore' },
};

module.options.searchSettings = {
	type: 'button',
	description: 'Find RES settings.',
	text: CreateElement.icon('F097'),
	callback: { moduleID: 'search' },
};

module.options.announcements = {
	type: 'button',
	description: 'Read the latest at /r/RESAnnouncements.',
	text: CreateElement.icon('F108'),
	callback: '/r/RESAnnouncements/new',
};

module.options.donate = {
	type: 'button',
	description: 'Support further RES development.',
	text: CreateElement.icon('F104'),
	callback: { moduleID: 'contribute' },
};

module.options.bugs = {
	type: 'button',
	description: 'If something isn\'t working right, visit /r/RESissues for help.',
	text: CreateElement.icon('F003'),
	callback: '/r/RESIssues/wiki/postanissue',
};

module.options.suggestions = {
	type: 'button',
	description: 'If you have an idea for RES or want to chat with other users, visit /r/Enhancement.',
	text: CreateElement.icon('F076'),
	callback: '/r/Enhancement',
};

module.options.faq = {
	type: 'button',
	description: 'Learn more about RES on the /r/Enhancement wiki.',
	text: CreateElement.icon('F0D3'),
	callback: '/r/Enhancement/wiki/index',
};

module.options.code = {
	type: 'button',
	description: 'You can improve RES with your code, designs, and ideas! RES is an open-source project on GitHub.',
	text: CreateElement.icon('F063'),
	callback: 'https://github.com/honestbleeps/Reddit-Enhancement-Suite',
};

module.options.contributors = {
	type: 'button',
	description: '<a target="_blank" href="http://www.honestbleeps.com/">Steve Sobel</a> (<a target="_blank" href="/user/honestbleeps/">/u/honestbleeps</a>) and a slew of community members have contributed code, design and/or great ideas to RES.',
	text: CreateElement.icon('F048'),
	callback: '/r/Enhancement/wiki/about/team',
};

module.options.privacy = {
	type: 'button',
	description: 'Read about RES\'s privacy policy.',
	text: CreateElement.icon('F0C2'),
	callback: '/r/Enhancement/wiki/about/privacy',
};

module.options.license = {
	type: 'button',
	description: 'Reddit Enhancement Suite is released under the GPL v3.0 license.',
	text: CreateElement.icon('F0D3'),
	callback: 'http://www.gnu.org/licenses/gpl-3.0.html',
};
