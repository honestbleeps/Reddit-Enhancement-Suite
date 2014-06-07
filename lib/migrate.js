debugger;

var RESOptionsLastVersion = 1;

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

RESmigrateData = function() {
	var RESOptionsVersion = RESStorage.getItem('RESOptionsVersion');
	switch (RESOptionsVersion) {
		case null: // Before migrate.js was implanted (i.e. before v4.4.0)
			RESOptionsMigrate('betteReddit', 'searchSubredditByDefault', 'searchHelper', 'searchSubredditByDefault');
		case 1:
			
		case 2:
			
		case 3:
			
		case 4:
		
		default:
			RESStorage.setItem('RESOptionsVersion', RESOptionsLastVersion);
		break;
	}
}

RESOptionsMigrate = function(oldModuleID, oldOptionName, newModuleID, newOptionName) {
	if (modules[oldModuleID] && modules[oldModuleID].options[oldOptionName] && modules[newModuleID] && modules[newModuleID].options[newOptionName]) {
		RESUtils.setOption(newModuleID, newOptionName, RESUtils.getOptions(oldModuleID)[oldOptionName]);
	}
}