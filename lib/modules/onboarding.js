addModule('onboarding', function(module, moduleID) {
	module.moduleName = 'RES Welcome Wagon';
	module.category = 'About RES';
	module.description = 'Learn more about RES at /r/Enhancement';
	module.alwaysEnabled = true;
	module.hidden = true;

	module.go = function() {
		return RESUtils.init.await('metadata')
			.then(function() {
				const storageKey = 'RES.firstRun.' + RESMetadata.version;
				RESStorage.loadItem(storageKey).done(() => firstRun(storageKey));
			});
	};

	function firstRun(storageKey) {
		// if this is the first time this version has been run, pop open the what's new tab, background focused.
		if (RESStorage.getItem(storageKey) === null) {
			RESStorage.setItem(storageKey, 'true');
			RESEnvironment.openNewTab(RESMetadata.updatedURL, false);
		}
	}
});
