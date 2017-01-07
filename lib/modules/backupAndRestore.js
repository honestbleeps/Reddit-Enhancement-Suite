/* @flow */

import { Module } from '../core/module';
import * as Metadata from '../core/metadata';
import { Alert, click } from '../utils';
import { Storage } from '../environment';
import { serialize, deserialize } from './backupAndRestore/serialization';

export const module: Module<*> = new Module('backupAndRestore');

module.moduleName = 'backupName';
module.category = 'aboutCategory';
module.sort = -8;
module.alwaysEnabled = true;
module.description = 'backupDesc';
module.options = {
	backup: {
		type: 'button',
		text: 'backup',
		callback: backup,
		description: 'backupAndRestoreBackupDesc',
		title: 'backupAndRestoreBackupTitle',
	},
	restore: {
		type: 'button',
		text: 'restore',
		callback: restore,
		description: 'backupAndRestoreRestoreDesc',
		title: 'backupAndRestoreRestoreTitle',
	},
};

async function backup() {
	// Generate copy of RES settings for download
	const settings = await Storage.batch(await Storage.keys());
	const blob = new Blob([serialize(settings)], { type: 'application/json' });
	// Make nice-ish suggested filename RES-yyyy-mm-dd-timestamp.resbackup
	const date = new Date();
	const filename = `RES-${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${Math.round(date.getTime() / 1000)}-${Metadata.version.replace(/\./g, '_')}.resbackup`;
	// Create element to trigger download
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	click(link);
}

function restore() {
	Alert.open('<p>Restoring a .resbackup file will <strong>permanently</strong> overwrite your current settings. Are you sure you want to do this?</p>', { cancelable: true })
		.then(() => {
			const link = document.createElement('input');
			link.type = 'file';
			link.accept = '.resbackup';
			link.addEventListener('change', () => restoreFromFile(link));
			link.click();
		});
}

function restoreFromFile(link) {
	const file = link.files[0];

	const reader = new FileReader();

	reader.onload = () => {
		let settings;
		try {
			settings = deserialize(reader.result);
		} catch (err) {
			console.error(err);
			Alert.open('The file you uploaded did not appear to be a valid RES backup.');
			return;
		}

		for (const [key, value] of Object.entries(settings)) {
			Storage.set(key, value);
		}

		Alert.open('Your RES settings have been imported. Reloading reddit.');
		location.hash = '';
		setTimeout(() => location.reload(), 500);
	};

	reader.readAsText(file);
}
