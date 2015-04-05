addModule('onboarding', function(module, moduleID) {
	module.moduleName = 'RES Welcome Wagon';
	module.category = 'Core';
	module.description = 'Welcome to RES!';

	module.go = function() {
		firstRun();
	}

	var firstRun = function() {
		// if this is the first time this version has been run, pop open the what's new tab, background focused.
		if (RESStorage.getItem('RES.firstRun.' + RESmetadata.version) === null) {
			RESStorage.setItem('RES.firstRun.' + RESmetadata.version, 'true');
			RESUtils.openLinkInNewTab(RESmetadata.updatedURL, false);
		}
	}
};
