/* @flow */

import numeral from 'numeral';
import { Module } from '../core/module';
import { MINUTE, Alert, formatDateTime } from '../utils';
import { Storage, i18n, multicast } from '../environment';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';
import { serialize, deserialize } from './backupAndRestore/serialization';
import * as Providers from './backupAndRestore/providers';

export const module: Module<*> = new Module('backupAndRestore');

module.moduleName = 'backupName';
module.category = 'aboutCategory';
module.sort = -8;
module.alwaysEnabled = true;
module.description = 'backupDesc';

module.options = {
	backup: {
		type: 'button',
		values: [],
		description: 'backupAndRestoreBackupDesc',
		title: 'backupAndRestoreBackupTitle',
	},
	restore: {
		type: 'button',
		values: [],
		description: 'backupAndRestoreRestoreDesc',
		title: 'backupAndRestoreRestoreTitle',
	},
	reloadWarning: {
		type: 'enum',
		value: 'warn',
		values: [{
			name: 'backupAndRestoreReloadWarningNone',
			value: 'none',
		}, {
			name: 'backupAndRestoreReloadWarningWarn',
			value: 'warn',
		}, {
			name: 'backupAndRestoreReloadWarningAuto',
			value: 'auto',
		}],
		description: 'backupAndRestoreReloadWarningDesc',
		title: 'backupAndRestoreReloadWarningTitle',
	},
	automaticBackups: {
		type: 'enum',
		value: 'none',
		// other values populated in loadDynamicOptions
		values: [{
			name: 'None',
			value: 'none',
		}],
		description: 'backupAndRestoreAutomaticBackupsDesc',
		title: 'backupAndRestoreAutomaticBackupsTitle',
		onChange() {
			// reset the last check time, in case we switched providers or turned it off
			lastCheckStorage.set(0);
			handleAutomaticSync();
		},
	},
	warnBeforeAutomaticRestore: {
		type: 'boolean',
		value: true,
		description: 'backupAndRestoreWarnBeforeAutomaticRestoreDesc',
		title: 'backupAndRestoreWarnBeforeAutomaticRestoreTitle',
		dependsOn: options => options.automaticBackups.value !== 'none',
	},
	googleAccount: {
		type: 'text',
		value: '',
		description: 'backupAndRestoreGoogleAccountDesc',
		title: 'backupAndRestoreGoogleAccountTitle',
		advanced: true,
	},
};

module.loadDynamicOptions = () => {
	for (const providerClass of Object.values(Providers)) {
		const { key, text, supportsAutomaticBackups } = providerClass;

		module.options.backup.values.push({
			text,
			callback: () => getProvider(providerClass).then(backup),
		});
		module.options.restore.values.push({
			text,
			callback: () => getProvider(providerClass).then(restore),
		});

		if (supportsAutomaticBackups) {
			module.options.automaticBackups.values.push({
				name: text,
				value: key,
			});
		}
	}
};

module.afterLoad = async () => {
	await handleAutomaticSync();
};

function getProvider(providerClass) {
	return new providerClass().init({ googleLoginHint: module.options.googleAccount.value });
}

const lastModifiedStorage = Storage.wrapPrefix('backup.lastModified.', () => (0: number));
const lastCheckStorage = Storage.wrap('backup.lastCheck', (0: number));

async function handleAutomaticSync() {
	const automaticProviderKey = module.options.automaticBackups.value;
	if (automaticProviderKey === 'none') return;

	const providerClass = Object.values(Providers).find(p => p.key === automaticProviderKey);
	if (!providerClass) throw new Error(`Can't find provider with key ${automaticProviderKey}`);

	const now = Date.now();
	const lastCheck = await lastCheckStorage.get();
	if ((now - lastCheck) < (15 * MINUTE)) return;

	// If multiple tabs pass the above check, only one will CAS successfully.
	if (!await lastCheckStorage.compareAndSet(lastCheck, now)) return;
	// From this point forward, it is guaranteed that only one tab can enter (per 15 minutes).

	// Create provider, get permissions, etc.
	const provider = await getProvider(providerClass);

	// Read the remote backup to get the last modified time.
	// This has some overhead, but only 2x at worst.
	// (If we've reached this point, we're definitely going to be uploading or downloading the backup.)
	// ...and it guarantees that the modified time remains in sync with the backup.
	let remoteBackup;
	const lastModifiedKey = lastModifiedStorage._keyGen(providerClass.key);
	try {
		remoteBackup = deserialize(await provider.read());
	} catch (e) {
		console.warn('Failed to read automatic backup:', e);
		remoteBackup = { [lastModifiedKey]: 0 };
	}

	// We must use a positive check for restoring, to fail safe if the remote backup has no modified time.
	// i.e. because `(undefined > 12345) === (undefined < 12345) === false`
	if ((remoteBackup[lastModifiedKey]: any) > await lastModifiedStorage.get(providerClass.key)) {
		// This will download the backup a second time, which in theory might download a newer version (which would be good, but quite rare).
		// Restoring should be the uncommon case, though, so this is left as-is (for now) for simplicity.
		await restore(provider, module.options.warnBeforeAutomaticRestore.value ? 'automatic' : 'none');
	} else {
		await backup(provider);
	}
}

async function backup(provider) {
	const { key, text, notifyBackupDone } = provider.constructor;
	// Write to lastModified and store it in the blob.
	// At this point, we know that there is no remote backup newer than local. [*]
	// In the worst case, the backup request fails, but this modified time has already been set to the current date.
	// That's still okay, because:
	// a. If a new remote backup happens, it should happen after this millisecond (because [*]), so its timestamp
	//    will be greater than this value, and will get restored as expected.
	// b. If no new remote backup happens, then our local modified time will still be equal to/ahead of the remote,
	//    and we'll just try backing up again after the next check.
	// (theoretically, there is a very short timeframe between the check for [*] and this backup,
	//  during which another client [but not this one, thanks to the lastCheck CAS] could create a new backup,
	//  but it should be very short [~1 second] and would require using two machines simultaneously, which we warn about)
	await lastModifiedStorage.set(key, Date.now());
	const storage = await Storage.getAll();
	await provider.write(serialize(storage));

	if (notifyBackupDone) {
		Notifications.showNotification({
			message: i18n('backupAndRestoreSavedNotification', text),
			notificationID: 'backupAndRestoreSaved',
			moduleID: module.moduleID,
			closeDelay: 1000,
		});
	}
}

async function restore(provider, alertType: 'normal' | 'automatic' | 'none' = 'normal') {
	const { key, name } = provider.constructor;
	const data = await provider.read();
	const storage = deserialize(data);

	const lastModifiedKey = lastModifiedStorage._keyGen(key);
	if (alertType !== 'none') {
		try {
			await Alert.open(`
			${alertType === 'automatic' ? `
				<p><b>Found new automatic backup from ${name}.</b></p>
				<br>
			` : ''}
			<p>Restoring a backup will <b>permanently</b> overwrite your current storage. Are you sure you want to do this?</p>
			<br>
			${alertType === 'automatic' ? `
				<p>If you click cancel, you will be taken to the settings page where you can disable automatic backups or create a new backup to overwrite this one.</p>
				<br>
			` : ''}
			<p>${storage[lastModifiedKey] ? `Backup date: ${formatDateTime(new Date((storage[lastModifiedKey]: any)))}` : ''}</p>
			<p>Backup size: ${numeral(data.length).format('0.0 b')}</p>
		`, { cancelable: true });
		} catch (e) {
			if (alertType === 'automatic') {
				SettingsNavigation.loadSettingsPage(module.moduleID, 'automaticBackups');
			}
			return;
		}
	}

	// This is the only correctness-related write involved in restoring a backup.
	// This operation is atomic (probably--at least, as atomic as our limited API can be), so if it fails
	// then the remote timestamp will still be ahead of the local timestamp, and we'll try restoring again
	// after the next check.
	// This will reset the lastCheck time to whatever it was when this backup was created,
	// potentially meaning the next pageload will create a new backup.
	// That's fine, because we can assume that the other client was in a consistent state.
	await Storage.setMultiple(storage);

	Alert.open(i18n('backupAndRestoreImported'));
	warnTabsAboutRestore(module.options.reloadWarning.value);

	setTimeout(() => {
		location.hash = '';
		location.reload();
	}, 500);
}

const warnTabsAboutRestore = multicast(operation => {
	switch (operation) {
		case 'warn':
			Alert.open(i18n('backupAndRestoreImportedOtherTabs'), { cancelable: true })
				.then(() => location.reload(), () => {});
			break;
		case 'auto':
			location.reload();
			break;
		case 'none':
		default:
			break;
	}
}, { name: 'restore-settings-warning', local: false, crossIncognito: true });
