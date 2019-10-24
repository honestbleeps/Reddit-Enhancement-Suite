/* @flow */

import {
	CreateElement,
	BodyClasses,
	isCurrentSubreddit,
	string,
} from './';

const initialTabID = location.hash.replace('#', '') || 'dashboardContents';
let selectedTabMenuItem;

export function addDashboardTab(tabID: string, tabName: string, tabModuleId?: string, callback: HTMLElement => any) {
	if (!isCurrentSubreddit('dashboard')) return;

	BodyClasses.add('res-dashboard');

	let tabPage;

	const tabMenuItem = CreateElement.tabMenuItem({
		text: tabName,
		className: 'res-dashboard-tab',
		order: -1,
		onChange: active => {
			const container = document.querySelector('#siteTable.linklisting');
			if (!container) return;

			if (active) {
				if (selectedTabMenuItem) selectedTabMenuItem.click();
				selectedTabMenuItem = tabMenuItem;
				tabPage = string.html`<div class="dashboardPane"></div>`;
				container.append(tabPage);
				callback(tabPage);
				location.hash = tabID;
			} else {
				tabPage.remove();
			}
		},
	});

	// if a module id has been provided then we automatically append the gear link
	if (tabModuleId) {
		// FIXME
		// const gear = string.html`${string.safe(SettingsNavigation.makeUrlHashLink(
		// 	tabModuleId, undefined, ' ', 'gearIcon'))}`;
		// tabMenuItem.after(gear);
	}

	if (tabID === initialTabID) tabMenuItem.click();
}
