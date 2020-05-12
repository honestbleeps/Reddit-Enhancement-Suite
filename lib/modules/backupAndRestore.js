/* @flow */

import { Module } from '../core/module';
import { MINUTE, Alert, formatDateTime } from '../utils';
import { Storage, locale, i18n, multicast } from '../environment';
import { sendMessage } from '../environment/foreground/messaging';
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
		values: Object.values(Providers).map(p => ({
			text: p.text,
			callback: () => getProvider(p).then(backup),
		})),
		description: 'backupAndRestoreBackupDesc',
		title: 'backupAndRestoreBackupTitle',
	},
	restore: {
		type: 'button',
		values: Object.values(Providers).map(p => ({
			text: p.text,
			callback: () => getProvider(p).then(restore),
		})),
		description: process.env.BUILD_TARGET === 'firefox' ? 'backupAndRestoreRestoreDescFirefox' : 'backupAndRestoreRestoreDesc',
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
		values: [
			{
				name: 'backupAndRestoreAutomaticBackupsNone',
				value: 'none',
			},
			...Object.values(Providers)
				.filter(p => p.supportsAutomaticBackups)
				.map(p => ({
					name: p.text,
					value: p.key,
				})),
		],
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

module.afterLoad = async () => {
	await handleAutomaticSync();
};

function getProvider(providerClass) {
	return new providerClass().init({ // eslint-disable-line new-cap
		googleLoginHint: module.options.googleAccount.value,
	});
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

	const isAutomatic = alertType === 'automatic';

	if (alertType !== 'none') {
		const lastModifiedKey = lastModifiedStorage._keyGen(key);
		const backupDate: void | number = (storage[lastModifiedKey]: any);
		let size;
		try {
			// $FlowIssue Intl.NumberFormat type is outdated
			size = (new Intl.NumberFormat(locale, { style: 'unit', unit: 'byte', notation: 'compact', unitDisplay: 'narrow' })).format(data.length);
		} catch (e) {
			size = `${data.length / 1e6} MB`;
		}
		try {
			await Alert.open(`
			${isAutomatic ? `
				<p><b>${i18n('backupAndRestoreFoundBackup', name)}</b></p>
				<br>
			` : ''}
			<p>${i18n('backupAndRestoreBackupOverwriteWarning')}</p>
			<br>
			${isAutomatic ? `
				<p>${i18n('backupAndRestoreAfterCancel')}</p>
				<br>
			` : ''}
			${backupDate ? `
				<p>${i18n('backupAndRestoreBackupDate', formatDateTime(new Date(backupDate)))}</p>
			` : ''}
			<p>${i18n('backupAndRestoreBackupSize', size)}</p>
		`, { cancelable: true });
		} catch (e) {
			if (isAutomatic) {
				SettingsNavigation.open(module.moduleID, 'automaticBackups');
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
	// Actually, we might as well reset lastCheck here.
	// This write is not required for correctness, and can be dropped or reordered
	// (though I hope browsers' storage APIs don't actually do that).
	await lastCheckStorage.set(Date.now());

	// Migrating might take a while, depending on how old the backup is
	await sendMessage('runMigrations');

	postRestore(module.options.reloadWarning.value);

	await Alert.open(i18n('backupAndRestoreImported'));
	postRestore.local('auto');
}

const postRestore = multicast(operation => {
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
}, { name: 'restore-settings-warning', local: false });
