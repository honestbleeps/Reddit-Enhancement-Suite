addModule('onboarding', function(module, moduleID) {
	module.moduleName = 'RES Welcome Wagon';
	module.category = 'About RES';
	module.description = 'Learn more about RES at /r/Enhancement';
	module.alwaysEnabled = true;
	module.hidden = true;

	module.go = function() {
		firstRun();
	}

	var firstRun = function() {
		// if this is the first time this version has been run, pop open the what's new tab, background focused.
		if (RESStorage.getItem('RES.firstRun.' + RESMetadata.version) === null) {
			RESStorage.setItem('RES.firstRun.' + RESMetadata.version, 'true');
			RESUtils.openLinkInNewTab(RESMetadata.updatedURL, false);
		}
	}
});
