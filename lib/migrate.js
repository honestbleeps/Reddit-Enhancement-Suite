var RESOptionsMigrate = {
	lastVersion: 1,
	/*
		If you need to migrate some stuff, increase the RESOptionsLastVersion variable by one.
		Then, add this code to the switch:
			case x:
				code to execute to migrate the data
		just before the
			default:
		where x is the RESOptionsLastVersion number before you increase it by one.
		Use RESOptionsMigrate to migrate data if you just want to move an option.
	*/
	migrate: function() {
		var RESOptionsVersion = RESStorage.getItem('RESOptionsVersion');
		switch (RESOptionsVersion) {
			case null: // Before migrate.js was implanted (i.e. before v4.4.0)
				RESOptionsMigrate.f.generic.move('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');

			case 1:

			case 2:

			case 3:

			case 4:

			default:
				RESStorage.setItem('RESOptionsVersion', this.lastVersion);
			break;
		}
	},
	f: { // Migration functions
		generic: { // Generic migration function
			move: function(oldModuleID, oldOptionName, newModuleID, newOptionName) {
				try {
					RESUtils.setOption(newModuleID, newOptionName, RESOptionsMigrate.f.utils.getRawOptions(oldModuleID)[oldOptionName].value);
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + ' ; ' + arguments.join() + ')');
				}
			},
			moveWithFunction: function(oldModuleID, oldOptionName, newModuleID, newOptionName, f) {
				try {
					RESUtils.setOption(newModuleID, newOptionName, f(RESOptionsMigrate.f.utils.getRawOptions(oldModuleID)[oldOptionName].value));
				} catch (e) {
					console.error('Couldn\'t migrate (' + e + ' ; ' + arguments.join() + ')');
				}
			}
		},
		specific: { // Specific migration function
			// Put your complicated function here to migrate data, then call this function in the switch.
		},
		utils: { // Utils migration function		
			getRawOptions: function(moduleID) {
				return JSON.parse(RESStorage.getItem('RESoptions.' + moduleID));
			}
		}
	}
};
