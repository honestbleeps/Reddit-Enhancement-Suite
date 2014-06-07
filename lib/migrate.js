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
			
		case 1:
			
		case 2:
			
		case 3:
			
		case 4:
		
		default:
			RESStorage.setItem('RESOptionsVersion', RESOptionsLastVersion);
		break;
	}
}

// General migration function

RESOptionsMigrate = function(oldModuleID, oldOptionName, newModuleID, newOptionName) {
	try {
		RESUtils.setOption(newModuleID, newOptionName, RESOptionsMigrateGetRawOptions(oldModuleID)[oldOptionName].value);
	} catch (e) {
		console.error('Couldn\'t migrate (' + e + ' ; ' + arguments.join() + ')');
	}
}

RESOptionsMigrateWithFunction = function(oldModuleID, oldOptionName, newModuleID, newOptionName, f) {
	try {
		RESUtils.setOption(newModuleID, newOptionName, f(RESOptionsMigrateGetRawOptions(oldModuleID)[oldOptionName].value));
	} catch (e) {
		console.error('Couldn\'t migrate (' + e + ' ; ' + arguments.join() + ')');
	}
}

// Specific migration function



// Raw migration function

RESOptionsMigrateGetRawOptions = function(moduleID) {
	return JSON.parse(RESStorage.getItem('RESoptions.' + moduleID));
}