/* @flow */

import { Module } from '../core/module';
import { i18n, openNewTab } from '../environment';
import { WEEK, string } from '../utils';
import * as Menu from './menu';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('contribute');

module.moduleName = 'contributeName';
module.category = 'aboutCategory';
module.sort = -9;
module.alwaysEnabled = true;
module.description = 'contributeDesc';

const contributeUrl = 'https://redditenhancementsuite.com/contribute/';

module.go = () => {
	Menu.addMenuItem(
		() => string.html`<span>${i18n('donateToRES')} &#8679;</span>`,
		() => { openNewTab(contributeUrl); }
	);
};

export function showUpdateNotification() {
	Notifications.showNotification({
		moduleID: module.moduleID,
		notificationID: 'onUpdate',
		message: `
			<p>
				${i18n('contributeUpdateNotification')}
			<p>
				<a class="RESNotificationButtonBlue" href="${contributeUrl}" target="_blank">
					<span>${i18n('donateToRES')} &#8679;</span>
				</a>
			</p>
			`.trim(),
		closeDelay: 30000,
		cooldown: 4 * WEEK,
	});
}
