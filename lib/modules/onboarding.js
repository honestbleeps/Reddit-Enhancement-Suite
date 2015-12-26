addModule('onboarding', function(module, moduleID) {
	module.moduleName = 'RES Welcome Wagon';
	module.category = 'About RES';
	module.description = 'Learn more about RES at /r/Enhancement';
	module.alwaysEnabled = true;
	module.hidden = true;

	var storageKey;

	module.go = function() {
		return RESUtils.init.await('metadata')
			.then(function() {
				storageKey = 'RES.firstRun.' + RESMetadata.version;
			}).then(function() {
				RESStorage.loadItem(storageKey).done(firstRun);
			});
	};

	var firstRun = function() {
		// if this is the first time this version has been run, pop open the what's new tab, background focused.
		if (RESStorage.getItem(storageKey) === null) {
			RESStorage.setItem(storageKey, 'true');
			RESUtils.openLinkInNewTab(RESMetadata.updatedURL, false);
		}
	};
});
