/* @flow */

import { Module } from '../core/module';
import * as Metadata from '../core/metadata';
import { Storage, openNewTab, i18n } from '../environment';
import { filterMap } from '../utils';
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
		value: 'notification',
		values: [{
			name: 'onboardingUpdateNotificationReleaseNotes',
			value: 'releaseNotes',
		}, {
			name: 'onboardingUpdateNotificationNotification',
			value: 'notification',
		}, {
			name: 'onboardingUpdateNotificationNothing',
			value: 'nothing',
		}],
	},
	patchUpdateNotification: {
		title: 'onboardingPatchUpdateNotificationName',
		description: 'onboardingPatchUpdateNotificationDescription',
		type: 'enum',
		value: 'notification',
		values: [{
			name: 'onboardingUpdateNotificationReleaseNotes',
			value: 'releaseNotes',
		}, {
			name: 'onboardingUpdateNotificationNotification',
			value: 'notification',
		}, {
			name: 'onboardingUpdateNotificationNothing',
			value: 'none',
		}],
	},
	betaUpdateNotification: {
		title: 'onboardingBetaUpdateNotificationName',
		description: 'onboardingBetaUpdateNotificationDescription',
		type: 'enum',
		value: 'releaseNotes',
		values: [{
			name: 'onboardingUpdateNotificationReleaseNotes',
			value: 'releaseNotes',
		}, {
			name: 'onboardingUpdateNotificationNotification',
			value: 'notification',
		}, {
			name: 'onboardingUpdateNotificationNothing',
			value: 'none',
		}],
	},
};

const highestVersionStorage = Storage.wrap('highestVersion', null);

module.go = async () => {
	const highestVersion = await highestVersionStorage.get();

	if (!highestVersion) {
		highestVersionStorage.set(Metadata.version);
		return;
	}

	if (
		highestVersion === Metadata.version ||
		require('semver/functions/gt')(highestVersion, Metadata.version) // eslint-disable-line global-require
	) return;

	const diff = require('semver/functions/diff')(Metadata.version, highestVersion); // eslint-disable-line global-require

	const infoTypes = filterMap([
		Metadata.isBeta && 'betaUpdateNotification',
		diff === 'patch' && 'patchUpdateNotification',
		(diff === 'major' || diff === 'minor') && 'updateNotification',
	], notificationOption => notificationOption ? [module.options[notificationOption].value] : undefined);

	if (infoTypes.includes('releaseNotes')) {
		openNewTab(Metadata.updatedURL, false);
	} else if (infoTypes.includes('notification')) {
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
