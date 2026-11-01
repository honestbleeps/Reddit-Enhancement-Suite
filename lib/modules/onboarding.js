/* @flow */

import semverGt from 'semver/functions/gt';
import semverDiff from 'semver/functions/diff';
import { Module } from '../core/module';
import * as Metadata from '../core/metadata';
import { Storage, openNewTab, i18n } from '../environment';
import * as Notifications from './notifications';

export const module: Module<any> = new Module('onboarding');

module.moduleName = 'onboardingName';
module.category = 'aboutCategory';
module.description = 'onboardingDesc';
module.alwaysEnabled = true;

module.options = {
	updateNotification: {
		title: 'onboardingUpdateNotificationName',
		description: 'onboardingUpdateNotificationDescription',
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

const highestVersionStorage = Storage.wrap('highestVersion', (null as ?string));

module.go = async () => {
	const highestVersion = await highestVersionStorage.get();

	if (!highestVersion) {
		highestVersionStorage.set(Metadata.version);
		return;
	}

	if (
		highestVersion === Metadata.version ||
		semverGt(highestVersion, Metadata.version)
	) return;

	const diff = semverDiff(Metadata.version, highestVersion);

	let notificationOption;
	if (Metadata.isBeta) notificationOption = 'betaUpdateNotification';
	else if (diff === 'patch') notificationOption = 'patchUpdateNotification';
	else if (diff === 'major' || diff === 'minor') notificationOption = 'updateNotification';
	const infoType = notificationOption && module.options[notificationOption].value;

	if (infoType === 'releaseNotes') {
		openNewTab(Metadata.updatedURL, false);
	} else if (infoType === 'notification') {
		Notifications.showNotification({
			moduleID: module.moduleID,
			notificationID: diff,
			message: `
				${i18n('onboardingUpgradeMessage', Metadata.version)}
				<p><a class="RESNotificationButtonBlue" href="${Metadata.updatedURL}" target="_blank">
					${i18n('onboardingUpgradeCta')}
				</a></p>
			`.trim(),
			closeDelay: 15000,
		});
	} else {
		console.log(`RES upgraded to v${Metadata.version}.`);
	}

	highestVersionStorage.set(Metadata.version);
};
