addModule('backupAndRestore', function(module, moduleID) {
	module.moduleName = 'Backup & Restore';
	module.category = 'About RES';
	module.sort = -8;
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

	function backup() {
		// Generate copy of RES settings for download
		var settings = JSON.stringify(RESStorage);
		var blob = new Blob([settings], { type: 'application/json' });
		// Make nice-ish suggested filename RES-yyyy-mm-dd-timestamp.resbackup
		var date = new Date();
		var filename = 'RES-' + date.getUTCFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + Math.round(date.getTime() / 1000) + '.resbackup';
		// Create element to trigger download
		var link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		RESUtils.click(link);
	}

	function restore() {
		alert(
			'<p>Restoring a .resbackup file will <strong>permanently</strong> overwrite your current settings. Are you sure you want to do this?</p>',
			function() {
				var link = document.createElement('input');
				link.type = 'file';
				link.accept = '.resbackup';
				link.addEventListener('change', restoreFromFile);
				link.click();
			}
		);
	}

	function restoreFromFile(e) {
		var fail_message = 'The file you uploaded did not appear to be a valid RES backup (files must have a .resbackup extension).';
		var file = e.target.files[0];

		// Check extension
		if (file.name.search(/\.resbackup$/) !== -1) {
			// read file
			var reader = new FileReader();
			reader.onload = function(e) {
				var settings = JSON.parse(reader.result);
				// Fail if JSON is bad
				if (!settings) {
					alert(fail_message);
					return;
				}
				// Reimport data
				for (var k in settings) {
					RESStorage.setItem(k, settings[k]);
				}

				alert('Your RES settings have been imported. Reloading reddit.');
				location.hash = '';
				setTimeout(location.reload.bind(location), 500);
			};
			reader.readAsText(file);
		} else {
			alert(fail_message);
		}
	}
});
