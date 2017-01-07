/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { i18n } from '../environment';
import { Module } from '../core/module';
import * as Hover from './hover';
import * as QuickMessage from './quickMessage';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('messageMenu');

module.moduleName = 'messageMenuName';
module.category = 'browsingCategory';
module.description = 'messageMenuDesc';

module.options = {
	links: {
		type: 'table',
		addRowText: 'messageMenuAddShortcut',
		fields: [{
			key: 'label',
			name: 'messageMenuLabel',
			type: 'text',
		}, {
			key: 'url',
			name: 'messageMenuUrl',
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
		description: 'messageMenuLinksDesc',
		title: 'messageMenuLinksTitle',
	},
	useQuickMessage: {
		type: 'boolean',
		description: 'messageMenuUseQuickMessageDesc',
		title: 'messageMenuUseQuickMessageTitle',
		value: true,
	},
	hoverDelay: {
		type: 'text',
		value: '1000',
		description: 'messageMenuHoverDelayDesc',
		title: 'messageMenuHoverDelayTitle',
		advanced: true,
	},
	fadeDelay: {
		type: 'text',
		value: '200',
		description: 'messageMenuFadeDelayDesc',
		title: 'messageMenuFadeDelayTitle',
		advanced: true,
	},
	fadeSpeed: {
		type: 'text',
		value: '0.7',
		description: 'messageMenuFadeSpeedDesc',
		title: 'messageMenuFadeSpeedTitle',
		advanced: true,
	},
};

module.go = () => {
	$('#mail, .mail-count, #NREMail, #NREMailCount').on('mouseover', onMouseOver);
};

function onMouseOver(e: Event) {
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
		.reduce((collection, item) => collection.add(item), $())
		.add(populateItem([
			`<i>${i18n(module.moduleName)}</i>`,
			SettingsNavigation.makeUrlHash(module.moduleID),
		])),
]);

function populateItem(link) {
	if (!(link && link.length >= 2)) {
		return $();
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
		$link.on('click', (e: MouseEvent) => {
			e.target = $(e.target).closest('a').get(0);
			if (QuickMessage.onClickMessageLink(e)) {
				e.preventDefault();
			}
		});
	}

	$link.on('click', () => Hover.dropdownList(module.moduleID).close());

	return $('<li />').append($link);
}
