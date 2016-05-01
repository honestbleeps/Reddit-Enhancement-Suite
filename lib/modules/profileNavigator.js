import * as Hover from './hover';
import * as SettingsNavigation from './settingsNavigation';
import { $ } from '../vendor';
import { loggedInUser } from '../utils';

export const module = {};

module.moduleID = 'profileNavigator';
module.moduleName = 'Profile Navigator';
module.description = 'Enhance getting to various parts of your user page';
module.category = 'My account';


module.options = {
	sectionMenu: {
		type: 'boolean',
		value: true,
		description: 'Show a menu linking to various sections of the current user\'s profile when hovering your mouse over the username link in the top right corner.'
	},
	sectionLinks: {
		dependsOn: 'sectionMenu',
		type: 'table',
		addRowText: '+add profile section shortcut',
		fields: [{
			name: 'label',
			type: 'text'
		}, {
			name: 'url',
			type: 'text'
		}],
		value: [
			['comments', './comments'],
			['submitted', './submitted'],
			['gilded', './gilded'],
			['upvoted', './upvoted'],
			['downvoted', './downvoted'],
			['saved', './saved']
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
	if (module.options.sectionMenu.value) {
		$('#header .user a').on('mouseover', onMouseoverProfileLink);
	}
};

function onMouseoverProfileLink(e) {
	Hover.dropdownList(module.moduleID)
		.target(e.currentTarget)
		.options({
			openDelay: module.options.hoverDelay.value,
			fadeDelay: module.options.fadeDelay.value,
			fadeSpeed: module.options.fadeSpeed.value,
			pin: Hover.pin.below
		})
		.populateWith(() => populateSectionMenu(loggedInUser()))
		.begin();
}

const populateSectionMenu = (username) => [
	module.options.sectionLinks.value
		.map(link => populateSectionItem(username, link))
		.reduce((prev, curr) => (curr ? prev.add(curr) : prev), $())
		.add(populateSectionItem('.', [
			`<i>${module.moduleName}</i>`,
			SettingsNavigation.makeUrlHash(module.moduleID, 'sectionMenu')
		]))
];

function populateSectionItem(username, link) {
	if (!(link && link.length >= 2)) {
		return false;
	}

	const label = link[0] || '';
	const url = link[1] || '';
	const $link = $('<a />')
		.safeHtml(label)
		.attr('href', `/user/${username}/${url}`);

	if (url.indexOf('#!settings') !== -1) {
		$link.append('<span class="RESMenuItemButton gearIcon" />');
	}

	$link.on('click', () => Hover.dropdownList(module.moduleID).close());

	return $('<li />').append($link);
}
