addModule('backupAndRestore', (module, moduleID) => {
	module.moduleName = 'Backup & Restore';
	module.category = 'Core';
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

	async function backup() {
		// Generate copy of RES settings for download
		const settings = {};
		await Promise.all((await RESEnvironment.storage.keys()).map(async key => settings[key] = await RESEnvironment.storage.getRaw(key)));
		const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
		// Make nice-ish suggested filename RES-yyyy-mm-dd-timestamp.resbackup
		const date = new Date();
		const filename = `RES-${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${Math.round(date.getTime() / 1000)}.resbackup`;
		// Create element to trigger download
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		RESUtils.click(link);
	}

	function restore() {
		alert(
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
		const failMessage = 'The file you uploaded did not appear to be a valid RES backup (files must have a .resbackup extension).';
		const file = e.target.files[0];

		// Check extension
		if (file.name.search(/\.resbackup$/) !== -1) {
			// read file
			const reader = new FileReader();
			reader.onload = function() {
				const settings = JSON.parse(reader.result);
				// Fail if JSON is bad
				if (!settings) {
					alert(failMessage);
					return;
				}
				// Reimport data
				for (const k in settings) {
					RESEnvironment.storage.setRaw(k, settings[k]);
				}

				alert('Your RES settings have been imported. Reloading reddit.');
				location.hash = '';
				setTimeout(location.reload.bind(location), 500);
			};
			reader.readAsText(file);
		} else {
			alert(failMessage);
		}
	}
});
