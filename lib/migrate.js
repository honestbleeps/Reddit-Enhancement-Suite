RESOptionsMigrate = {
	lastVersion: 1,
	/*
	How does it work ?
		If you need to migrate some stuff, increase the RESOptionsLastVersion variable by one.
		Then, add this code to the switch :
			case x:
				code to execute to migrate the data
		just before the
			default:
		where x is the RESOptionsLastVersion number before you increase it by one.
		Use RESOptionsMigrate to migrate data if you just want to move an option.
	*/
	doMigration: function() {
		var RESOptionsVersion = RESStorage.getItem('RESOptionsVersion');
		switch (RESOptionsVersion) {
			case null: // Before migrate.js was implanted (i.e. before v4.4.0)
				
			case 1:
				
			case 2:
				
			case 3:
				
			case 4:
			
			default:
				RESStorage.setItem('RESOptionsVersion', this.lastVersion);
			break;
		}
	},
	f: { // migration functions
		generic: { // Generic migration function
			move: function(oldModuleID, oldOptionName, newModuleID, newOptionName, transformValue) {
				try {
					var value = RESOptionsMigrate.f.utils.getRawOptions(oldModuleID)[oldOptionName].value;
					if (typeof transformValue === 'function') {
						value = transformValue(value);
					}
					RESUtils.setOption(newModuleID, newOptionName, value);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + ' ; ' + arguments.join() + ')');
				}
			}
		},
		specific: { // Specific migration function
			// Put here your complicated function to migrate data. Then call this function in the switch.
		},
		utils: { // Utils migration function		
			getRawOptions: function(moduleID) {
				return JSON.parse(RESStorage.getItem('RESoptions.' + moduleID));
			}
		}
	}
}