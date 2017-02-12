/* @flow */

import { Module } from '../core/module';
import * as Metadata from '../core/metadata';
import { Storage, openNewTab, i18n } from '../environment';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('onboarding');

module.moduleName = 'onboardingName';
module.category = 'aboutCategory';
module.description = 'onboardingDesc';
module.alwaysEnabled = true;

module.options = {
	updateNotification: {
		title: 'onboardingUpdateNotificationName',
		description: 'onboardingUpdateNotificationDescription',
		type: 'enum',
		value: 'releaseNotes',
		values: [{
			name: 'onboardingUpdateNotifictionReleaseNotes',
			value: 'releaseNotes',
		}, {
			name: 'onboardingUpdateNotifictionNotification',
			value: 'notification',
		}, {
			name: 'onboardingUpdateNotifictionNothing',
			value: 'nothing',
		}],
	},
	patchUpdateNotification: {
		title: 'onboardingPatchUpdateNotificationName',
		description: 'onboardingPatchUpdateNotificationDescription',
		type: 'enum',
		value: 'notification',
		values: [{
			name: 'onboardingUpdateNotifictionReleaseNotes',
			value: 'releaseNotes',
		}, {
			name: 'onboardingUpdateNotifictionNotification',
			value: 'notification',
		}, {
			name: 'onboardingUpdateNotifictionNothing',
			value: 'none',
		}],
	},
	betaUpdateNotification: {
		title: 'onboardingBetaUpdateNotificationName',
		description: 'onboardingBetaUpdateNotificationDescription',
		type: 'enum',
		value: 'releaseNotes',
		values: [{
			name: 'onboardingUpdateNotifictionReleaseNotes',
			value: 'releaseNotes',
		}, {
			name: 'onboardingUpdateNotifictionNotification',
			value: 'notification',
		}, {
			name: 'onboardingUpdateNotifictionNothing',
			value: 'none',
		}],
	},
};

const firstRunStorage = Storage.wrapDomain(version => `RES.firstRun.${version}`, (null: null | boolean));

module.go = async () => {
	// if this is the first time this version has been run, pop open the what's new tab, background focused.
	if (!(await firstRunStorage.has(Metadata.version))) {
		firstRunStorage.set(Metadata.version, true);

		const notificationOption = (
			Metadata.isBeta ? 'betaUpdateNotification' :
			Metadata.isPatch ? 'patchUpdateNotification' :
			/* Metadata.isMajor ||
			Metadata.isMinor */ 'updateNotification'
		);

		switch (module.options[notificationOption].value) {
			case 'releaseNotes':
				openNewTab(Metadata.updatedURL, false);
				break;
			case 'notification':
				Notifications.showNotification({
					moduleID: module.moduleID,
					optionKey: notificationOption,
					message: `
						${i18n('onboardingUpgradeMessage', Metadata.version)}
						<p><a class="RESNotificationButtonBlue" href="${Metadata.updatedURL}" target="_blank">
							${i18n('onboardingUpgradeCta')}
						</a></p>
					`.trim(),
					closeDelay: 15000,
				});
				break;
			case 'none':
			default:
				console.log(`RES upgraded to v${Metadata.version}.`);
				break;

		}
	}
};
