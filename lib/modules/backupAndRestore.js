import { Alert, click } from '../utils';
import { Storage } from '../environment';

export const module = {};

module.moduleID = 'backupAndRestore';
module.moduleName = 'Backup & Restore';
module.category = 'About RES';
module.sort = -8;
module.alwaysEnabled = true;
module.description = 'Backup and restore your Reddit Enhancement Suite settings.';
module.options = {
	backup: {
		type: 'button',
		text: 'backup',
		callback: backup,
		description: 'Download a backup of your current RES settings.'
	},
	restore: {
		type: 'button',
		text: 'restore',
		callback: restore,
		description: 'Restore a backup of your RES settings. Warning: This will overwrite your current settings.'
	}
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
	const filename = `RES-${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${Math.round(date.getTime() / 1000)}.resbackup`;
	// Create element to trigger download
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	click(link);
}

function restore() {
	Alert.open(
		'<p>Restoring a .resbackup file will <strong>permanently</strong> overwrite your current settings. Are you sure you want to do this?</p>',
		() => {
			const link = document.createElement('input');
			link.type = 'file';
			link.accept = '.resbackup';
			link.addEventListener('change', restoreFromFile);
			link.click();
		}
	);
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
			Alert.open('The file you uploaded did not appear to be a valid RES backup.');
			return;
		}

		restoreData(settings);

		Alert.open('Your RES settings have been imported. Reloading reddit.');
		location.hash = '';
		setTimeout(::location.reload, 500);
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
