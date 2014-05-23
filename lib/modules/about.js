addModule('contribute', function(module, moduleID) {
	module.moduleName = 'Donate and Contribute';
	module.category = 'About RES';
	module.sort = -4;
	module.alwaysEnabled = true;

	RESTemplates.load('contributeRESPanel', function(template) {
		module.description = template.html();
	});
});


addModule('about', function(module, moduleID) {
	module.moduleName = 'About RES';
	module.category = 'About RES';
	module.sort = -3;
	module.alwaysEnabled = true;

	RESTemplates.load('aboutRESPanel', function(template) {
		module.description = template.html();
	});
});
