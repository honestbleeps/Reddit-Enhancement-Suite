/* @flow */

import { Module } from '../core/module';
import { Alert, downcast } from '../utils';
import { extendDeep } from '../utils/object';
import { Storage, i18n } from '../environment';
import * as Providers from './backupAndRestore/providers';

export const module: Module<*> = new Module('backupAndRestore');

module.moduleName = 'backupName';
module.category = 'aboutCategory';
module.sort = -8;
module.alwaysEnabled = true;
module.description = 'backupDesc';

module.loadDynamicOptions = () => {
	for (const constructor of Object.values(Providers)) {
		const { name, text } = constructor;
		module.options[`backup_to_${name}`] = {
			type: 'button',
			text: `backup to ${text}`,
			callback: () => constructor.setup().then(backup),
			description: 'backupAndRestoreBackupDesc',
			title: `${i18n('backupAndRestoreBackupTitle')} — ${text}`,
		};
		module.options[`restore_from_${name}`] = {
			type: 'button',
			text: `restore from ${text}`,
			callback: () => constructor.setup().then(restore),
			description: 'backupAndRestoreRestoreDesc',
			title: `${i18n('backupAndRestoreRestoreTitle')} — ${text}`,
		};
	}
};

async function backup(provider) {
	const { name, notifyBackupDone, text } = provider.constructor;
	const storage = await Storage.getAll();
	const lastBackup = extendDeep(downcast(storage.lastBackup || {}, Object), { [name]: Date.now() });
	await provider.write({ ...storage, lastBackup });
	Storage.set('lastBackup', lastBackup);
	if (notifyBackupDone) Alert.open(`Backup saved to ${text}.`);
}

async function restore(provider) {
	const storage = await provider.read();
	const backupDate = provider.constructor.getBackupDate(storage);

	try {
		const overwriteNotice = 'Restoring a backup will <strong>permanently</strong> overwrite your current storage. Are you sure you want to do this?';
		const dateNotice = backupDate && `Backup date: ${String(backupDate)}` || '';
		await Alert.open(`<p>${overwriteNotice}</p><p>${dateNotice}</p>`, { cancelable: true });
	} catch (e) {
		return;
	}

	await Storage.setMultiple(storage);

	Alert.open('Your RES storage has been imported. Reloading reddit.');
	location.hash = '';
	setTimeout(() => location.reload(), 500);
}
