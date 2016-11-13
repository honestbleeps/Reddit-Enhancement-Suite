import _ from 'lodash';
import { $ } from '../vendor';
import { i18n } from '../environment';
import * as Hover from './hover';
import * as QuickMessage from './quickMessage';
import * as SettingsNavigation from './settingsNavigation';

export const module = {};

module.moduleID = 'messageMenu';
module.moduleName = 'Message Menu';
module.category = 'Browsing';
module.description = 'Hover over the mail icon to access different types of messages or to compose a new message.';

module.options = {
	links: {
		type: 'table',
		addRowText: '+add shortcut',
		fields: [{
			name: 'label',
			type: 'text',
		}, {
			name: 'url',
			type: 'text',
		}],
		value: [
			['compose', '/message/compose'],
			['all', '/message/inbox'],
			['unread', '/message/unread'],
			['messages', '/message/messages'],
			['comment replies', '/message/comments'],
			['post replies', '/message/selfreply'],
			['/u/ mentions', '/message/mentions'],
		],
	},
	useQuickMessage: {
		type: 'boolean',
		description: 'Use Quick Message pop-up when composing a new message',
		value: true,
	},
	hoverDelay: {
		type: 'text',
		value: 1000,
		description: 'Delay, in milliseconds, before hover tooltip loads. Default is 1000.',
		advanced: true,
	},
	fadeDelay: {
		type: 'text',
		value: 200,
		description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.',
		advanced: true,
	},
	fadeSpeed: {
		type: 'text',
		value: 0.7,
		description: 'Fade animation\'s speed (in seconds). Default is 0.7.',
		advanced: true,
	},
};

module.go = () => {
	$('#mail, .mail-count, #NREMail, #NREMailCount').on('mouseover', onMouseOver);
};

function onMouseOver(e) {
	Hover.dropdownList(module.moduleID)
		.target(e.target)
		.options({
			openDelay: module.options.hoverDelay.value,
			fadeDelay: module.options.fadeDelay.value,
			fadeSpeed: module.options.fadeSpeed.value,
		})
		.populateWith(populate)
		.begin();
}

const populate = _.once(() => [
	module.options.links.value
		.map(populateItem)
		.reduce((prev, curr) => (curr ? prev.add(curr) : prev), $())
		.add(populateItem([
			`<i>${i18n(module.moduleName)}</i>`,
			SettingsNavigation.makeUrlHash(module.moduleID),
		])),
]);

function populateItem(link) {
	if (!(link && link.length >= 2)) {
		return false;
	}
	const label = link[0] || '';
	const url = link[1] || '';
	const compose = url.includes('/message/compose');
	const $link = $('<a />')
		.safeHtml(label)
		.attr('href', url);

	if (compose) {
		$link.append('<span class="RESMenuItemButton res-icon">&#xF139;</span>');
	} else if (SettingsNavigation.isSettingsUrl(url)) {
		$link.append('<span class="RESMenuItemButton gearIcon" />');
	}

	if (module.options.useQuickMessage.value && compose) {
		$link.on('click', e => {
			e.target = $(e.target).closest('a').get(0);
			if (QuickMessage.onClickMessageLink(e)) {
				e.preventDefault();
			}
		});
	}

	$link.on('click', () => Hover.dropdownList(module.moduleID).close());

	return $('<li />').append($link);
}
