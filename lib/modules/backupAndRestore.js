/* @flow */

import { Module } from '../core/module';
import { Alert, formatDateTime } from '../utils';
import { Storage, i18n, multicast } from '../environment';
import { serialize, deserialize } from './backupAndRestore/serialization';
import * as Providers from './backupAndRestore/providers';

export const module: Module<*> = new Module('backupAndRestore');

module.moduleName = 'backupName';
module.category = 'aboutCategory';
module.sort = -8;
module.alwaysEnabled = true;
module.description = 'backupDesc';

module.options = {
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
};

module.loadDynamicOptions = () => {
	for (const providerClass of Object.values(Providers)) {
		const { key, text } = providerClass;
		module.options[`backup_to_${key}`] = {
			type: 'button',
			text: `backup to ${text}`,
			callback: () => backup(providerClass),
			description: 'backupAndRestoreBackupDesc',
			title: `${i18n('backupAndRestoreBackupTitle')} — ${text}`,
		};
		module.options[`restore_from_${key}`] = {
			type: 'button',
			text: `restore from ${text}`,
			callback: () => restore(providerClass),
			description: 'backupAndRestoreRestoreDesc',
			title: `${i18n('backupAndRestoreRestoreTitle')} — ${text}`,
		};
	}
};

const lastBackupStorage = Storage.wrapPrefix('lastBackup.', () => (0: number));

async function backup(providerClass) {
	const { key, text, notifyBackupDone } = providerClass;
	const provider = await new providerClass().init();
	const storage = await Storage.getAll();
	const newUpdateDate = await provider.write(serialize(storage));
	lastBackupStorage.set(key, newUpdateDate);
	if (notifyBackupDone) Alert.open(`Backup saved to ${text}.`);
}

async function restore(providerClass) {
	const { key, text } = providerClass;
	const provider = await new providerClass().init();
	const { data, modified } = await provider.read();
	const storage = deserialize(data);

	try {
		const overwriteNotice = `Restoring a backup from ${text} will <strong>permanently</strong> overwrite your current storage. Are you sure you want to do this?`;
		const dateNotice = modified ? `Backup date: ${formatDateTime(new Date(modified))}` : '';
		await Alert.open(`<p>${overwriteNotice}</p><br><p>${dateNotice}</p>`, { cancelable: true });
	} catch (e) {
		return;
	}

	await Storage.setMultiple(storage);
	await lastBackupStorage.set(key, modified);

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
