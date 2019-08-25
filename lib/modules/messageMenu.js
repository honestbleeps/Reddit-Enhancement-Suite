/* @flow */

import { i18n } from '../environment';
import { Module } from '../core/module';
import { string } from '../utils';
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

module.contentStart = () => {
	Hover.dropdownList(module.moduleID)
		.options({
			openDelay: parseFloat(module.options.hoverDelay.value),
			fadeDelay: parseFloat(module.options.fadeDelay.value),
			fadeSpeed: parseFloat(module.options.fadeSpeed.value),
		})
		.populateWith(() => [getListFragment()])
		.watch('#mail, .mail-count, #NREMail, #NREMailCount');
};

function getListFragment() {
	const fragment = document.createDocumentFragment();

	for (const link of module.options.links.value) {
		const label = link[0] || '';
		const url = link[1] || '';
		const li = string.html`<li><a href="${url}">${label}</a></li>`;

		li.addEventListener('click', (e: MouseEvent) => {
			if (module.options.useQuickMessage.value && QuickMessage.onClickMessageLink(e)) return;
			Hover.dropdownList(module.moduleID).close();
		});

		if (url.includes('/message/compose')) li.append(string.html`<span class="RESMenuItemButton res-icon">&#xF139;</span>`);

		fragment.append(li);
	}

	fragment.append(string.html`<li><a href=${SettingsNavigation.makeUrlHash(module.moduleID, 'sectionMenu')}>
		<i>${i18n(module.moduleName)}</i>
		<span class="RESMenuItemButton gearIcon"></span>
	</a></li>`);

	return fragment;
}
