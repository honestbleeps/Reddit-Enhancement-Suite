addModule('onboarding', function(module, moduleID) {
	module.moduleName = 'RES Welcome Wagon';
	module.category = 'About RES';
	module.description = 'Learn more about RES at /r/Enhancement';
	module.alwaysEnabled = true;
	module.hidden = true;

	module.go = async function() {
		await RESUtils.init.await.metadata;
		const storageKey = 'RES.firstRun.' + RESMetadata.version;
		// if this is the first time this version has been run, pop open the what's new tab, background focused.
		if (!(await RESEnvironment.storage.has(storageKey))) {
			RESEnvironment.storage.set(storageKey, true);
			RESEnvironment.openNewTab(RESMetadata.updatedURL, false);
		}
	};
});
