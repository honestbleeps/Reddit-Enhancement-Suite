
addModule('contribute', function(module, moduleID) {
	module.moduleName = 'Donate and Contribute';
	module.category = 'About RES';
	module.sort = -4;

	RESTemplates.load('contributeRESPanel', function(template) {
		module.description = template.html();
	});
});


addModule('about', function(module, moduleID) {
	module.moduleName = 'About RES';
	module.category = 'About RES';
	module.sort = -3;

	RESTemplates.load('aboutRESPanel', function(template) {
		module.description = template.html();
	});
});


addModule('team', function(module, moduleID) {
	module.moduleName = 'RES Team';
	module.category = 'About RES';
	module.sort = -2;

	RESTemplates.load('teamRESPanel', function(template) {
		module.description = template.html();
	});
});
