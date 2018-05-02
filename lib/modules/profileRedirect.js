/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { i18n } from '../environment';
import { WEEK, isPageType, regexes, string } from '../utils';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('profileRedirect');

module.moduleName = 'profileRedirectName';
module.category = 'usersCategory';
module.description = 'profileRedirectDesc';
module.keywords = ['legacy', 'overview'];
module.include = [
	'profile',
	'profile2x',
];

module.options = {
	fromLandingPage: {
		title: 'profileRedirectFromLandingPageTitle',
		description: 'profileRedirectFromLandingPageDesc',
		keywords: ['legacy', 'overview'],
		type: 'enum',
		value: 'none',
		values: [{
			name: 'Do nothing',
			value: 'none',
		}, {
			name: 'Overview (legacy)',
			value: 'overview',
		}, {
			name: 'Comments',
			value: 'comments',
		}, {
			name: 'Submitted (legacy)',
			value: 'submitted',
		}, {
			name: 'Gilded',
			value: 'gilded',
		}, {
			name: 'Custom',
			value: 'custom',
		}],
	},
	customFromLandingPage: {
		dependsOn: options => options.fromLandingPage.value === 'custom',
		title: 'profileRedirectCustomFromLandingPageTitle',
		description: 'profileRedirectCustomFromLandingPageDesc',
		type: 'text',
		value: '',
	},
};

module.beforeLoad = function() {
	const [, username, currentSection] = regexes.profile2x.exec(location.pathname) || [];
	if (username && !currentSection) {
		if (module.options.fromLandingPage.value !== 'none') {
			const preferredSection = module.options.fromLandingPage.value === 'custom' ?
				module.options.customFromLandingPage.value :
				module.options.fromLandingPage.value;
			window.location.replace(`/user/${username}/${preferredSection}`);
		} else if (isPageType('profile2x')) {
			const notificationPromise = Notifications.showNotification({
				moduleID: module.moduleID,
				optionKey: 'fromLandingPage',
				header: i18n('profileRedirectFromLandingPageNotificationTitle'),
				message: string.html`
					<div>
						<p>${i18n('profileRedirectFromLandingPageNotificationText')}</p>
						<p><a class="RESNotificationButtonBlue" href="${SettingsNavigation.makeUrlHash(module.moduleID, 'fromLandingPage')}">${i18n('profileRedirectFromLandingPageNotificationButton')}</a></p>
					</div>
				`,
				cooldown: WEEK,
			});

			notificationPromise.then(notification => {
				$(notification.element).on('click', '.RESNotificationButtonBlue', () => {
					notification.close();
				});
			});
		}
	}
};
