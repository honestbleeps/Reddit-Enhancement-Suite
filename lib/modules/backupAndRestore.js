addModule('backupAndRestore', function(module, moduleID) {
	$.extend(module, {
		moduleName: 'Backup & Restore',
		category: 'About RES',
		description: 'Backup and restore your Reddit Enhancement Suite settings.',
		options: {
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
		}
	});

	function backup() {
		// Generate copy of RES settings for download
		var settings = JSON.stringify(RESStorage);
		var link = document.createElement('a');
		if (BrowserDetect.isChrome()) {
			// Encoding can make the URI long enough to crash Chrome; it doesn't appear to care if it's unencoded
			link.href = 'data:text/plain;charset=utf-8,' + settings;
		} else {
			link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(settings);
		}
		link.download = 'RES-' + Math.round(new Date().getTime() / 1000) + '.resbackup';
		RESUtils.click(link);
	}

	function restore() {
		alert(
			'<p>Restoring a .resbackup file will <b>permanently</b> overwrite your current settings. Are you sure you want to do this?</p>',
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
