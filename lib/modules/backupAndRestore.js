/* @flow */

import numeral from 'numeral';
import { Module } from '../core/module';
import { MINUTE, Alert, formatDateTime } from '../utils';
import { Storage, i18n, multicast } from '../environment';
import * as Notifications from './notifications';
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
	},
	warnBeforeAutomaticRestore: {
		type: 'boolean',
		value: true,
		description: 'backupAndRestoreWarnBeforeAutomaticRestoreDesc',
		title: 'backupAndRestoreWarnBeforeAutomaticRestoreTitle',
		dependsOn: options => options.automaticBackups.value !== 'none',
	},
};

module.loadDynamicOptions = () => {
	for (const providerClass of Object.values(Providers)) {
		const { key, text, supportsAutomaticBackups } = providerClass;

		module.options.backup.values.push({
			text,
			callback: () => new providerClass().init().then(backup),
		});
		module.options.restore.values.push({
			text,
			callback: () => new providerClass().init().then(restore),
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

// Last modified date is defined by the specific provider and must only be consistent for that provider;
// it cannot be meaningfully compared to Date.now().
const lastModifiedStorage = Storage.wrapPrefix('backup.lastModified.', () => (0: number));
// Last check date is local and can be compared to Date.now().
const lastCheckStorage = Storage.wrap('backup.lastCheck', (0: number));

async function handleAutomaticSync() {
	const automaticProviderKey = module.options.automaticBackups.value;
	if (automaticProviderKey !== 'none') {
		const providerClass = Object.values(Providers).find(p => p.key === automaticProviderKey);
		if (!providerClass) throw new Error(`Can't find provider with key ${automaticProviderKey}`);

		if ((Date.now() - await lastCheckStorage.get()) > 5 * MINUTE) {
			// last check was 5 minutes ago, check again
			const lastLocalBackup = await lastModifiedStorage.get(automaticProviderKey);
			const provider = await new providerClass().init();
			const lastRemoteBackup = await provider.readLastModified().catch(e => {
				console.warn('Failed to read last modified:', e);
				return 0;
			});

			if (lastRemoteBackup > lastLocalBackup) {
				await restore(provider, {
					shouldAlert: module.options.warnBeforeAutomaticRestore.value,
					alertPrefix: `Found new automatic backup from ${providerClass.name}.`,
				});
			} else {
				// no new remote backup, make a local backup
				if (lastLocalBackup > lastRemoteBackup) {
					console.warn('Remote backup at', lastRemoteBackup, 'went back in time compared to local at', lastLocalBackup);
				}
				await backup(provider);
			}

			await lastCheckStorage.set(Date.now());
		}
	}
}

async function backup(provider) {
	const { key, text, notifyBackupDone } = provider.constructor;
	const storage = await Storage.getAll();
	const newUpdateDate = await provider.write(serialize(storage));
	lastModifiedStorage.set(key, newUpdateDate);

	if (notifyBackupDone) {
		Notifications.showNotification({
			message: i18n('backupAndRestoreSavedNotification', text),
			notificationID: 'backupAndRestoreSaved',
			moduleID: module.moduleID,
			closeDelay: 1000,
		});
	}
}

async function restore(provider, { shouldAlert = true, alertPrefix = '' } = {}) {
	const { key } = provider.constructor;
	const { data, modified } = await provider.read();
	const storage = deserialize(data);

	if (shouldAlert) {
		try {
			await Alert.open(`
			<p><b>${alertPrefix}</b></p>
			<p>Restoring a backup will <b>permanently</b> overwrite your current storage. Are you sure you want to do this?</p>
			<br>
			<p>${modified ? `Backup date: ${formatDateTime(new Date(modified))}` : ''}</p>
			<p>Backup size: ${numeral(data.length).format('0.0 b')}</p>
		`, { cancelable: true });
		} catch (e) {
			return;
		}
	}

	await Storage.setMultiple(storage);
	await lastModifiedStorage.set(key, modified);

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
