import * as Metadata from '../core/metadata';
import { Alert, click } from '../utils';
import { i18n, Storage } from '../environment';

export const module = {};

module.moduleID = 'backupAndRestore';
module.moduleName = 'backupName';
module.category = 'backupCategory';
module.sort = -8;
module.alwaysEnabled = true;
module.description = 'backupDesc';
module.options = {
	backup: {
		type: 'button',
		text: 'backup',
		callback: backup,
		description: 'backupBackupDesc',
	},
	restore: {
		type: 'button',
		text: 'restore',
		callback: restore,
		description: 'backupRestoreDesc',
	},
};

const SCHEMA_VERSION = 'SCHEMA_VERSION';
const CURRENT_SCHEMA_VERSION = 1;

async function backup() {
	// Generate copy of RES settings for download
	const settings = await Storage.batch(await Storage.keys());
	settings[SCHEMA_VERSION] = CURRENT_SCHEMA_VERSION;
	const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
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
	Alert.open(i18n('backupRestorePrompt'), { cancelable: true })
		.then(() => {
			const link = document.createElement('input');
			link.type = 'file';
			link.accept = '.resbackup';
			link.addEventListener('change', restoreFromFile);
			link.click();
		});
}

function restoreFromFile(e) {
	const file = e.target.files[0];

	const reader = new FileReader();

	reader.onload = () => {
		let settings;
		try {
			settings = JSON.parse(reader.result);
		} catch (err) {
			console.error(err);
			Alert.open(i18n('backupRestoreInvalid'));
			return;
		}

		restoreData(settings);

		Alert.open(i18n('backupRestoreDone'));
		location.hash = '';
		setTimeout(() => location.reload(), 500);
	};

	reader.readAsText(file);
}

function restoreData(settings) {
	switch (settings[SCHEMA_VERSION]) {
		default:
			// Version 0, no schema version was included
			for (const k in settings) {
				if (k === SCHEMA_VERSION) continue;
				let value;
				try {
					value = JSON.parse(settings[k]);
				} catch (e) {
					value = settings[k];
					console.warn('Could not parse:', k, 'falling back to raw string.');
				}
				Storage.set(k, value);
			}
			break;
		case 1:
			// Version 1, individual keys aren't stringified anymore
			for (const k in settings) {
				if (k === SCHEMA_VERSION) continue;
				Storage.set(k, settings[k]);
			}
			break;
	}
}
