addModule('backupAndRestore', function(module, moduleID) {
	$.extend(module, {
		moduleName: 'Backup & Restore',
		category: 'About RES',
		options: {
			backup: {
				type: 'button',
				text: 'backup',
				callback: null,
				description: 'Download a backup of your current RES settings.'
			},
			restore: {
				type: 'button',
				text: 'Restore',
				callback: null,
				description: 'Restore a backup of your RES settings. Warning: This will overwrite your current settings.'
			}
		},
		description: 'Backup and restore your Reddit Enhancement Suite settings.',
		loadDynamicOptions: function() {
			this.options['backup'].callback = this.backup; 
			this.options['restore'].callback = this.restore;
		},
		backup: function() {
			// Generate copy of RES settings for download
			var settings = JSON.stringify(RESStorage);
			var link = document.createElement("a");
			link.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(settings) );
			link.setAttribute('download', "RES-" + Math.round(new Date().getTime() / 1000 ) + ".resbackup");
			link.click();
		},
		uploader: false, // stores ref to upload input
		restore: function(){
			var check = alert(
				"<p>Restoring a .resbackup file will <b>permanently</b> overwrite your current settings. Are you sure you want to do this?</p>",
				function(){
					var link = document.createElement("input");
					link.setAttribute("type", "file");
					link.setAttribute("accept", ".resbackup");
					link.addEventListener('change', modules['backupAndRestore'].restoreFromFile);
					modules['backupAndRestore'].uploader = link;
					link.click();
				}
			);
		},
		restoreFromFile: function(){
			var fail_message = "The file you uploaded did not appear to be a valid RES backup (files must have a .resbackup extension).";
			var file = modules['backupAndRestore'].uploader.files[0];

			// Check extension
			if(file.name.indexOf(".resbackup") !== false){
				// read file
				var reader = new FileReader();
				reader.onload = function(e) {
					var settings = JSON.parse(reader.result);
					// Fail if JSON is bad
					if(!settings){
						alert(fail_message);
						return;
					}
					// Reimport data
					for(var k in settings){
						RESStorage.setItem(k, settings[k]);
					}

					alert("Your RES settings have been imported. Reloading reddit.");
					// Reload reddit after half a second
					setTimeout(function(){
						window.location.href = 'http://reddit.com';
					},500)	
				}
				reader.readAsText(file);
			}else{
				alert(fail_message);
			}
		}
	});
});