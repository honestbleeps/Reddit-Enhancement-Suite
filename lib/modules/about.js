addModule('contribute', function(module, moduleID) {
	module.moduleName = 'Donate and Contribute';
	module.category = 'About RES';
	module.sort = -10;
	module.alwaysEnabled = true;

	module.loadDynamicOptions = async function() {
		module.description = (await RESTemplates.load('contributeRESPanel')).html();
	};

	module.go = function() {
		modules['RESMenu'].addMenuItem(
			'<div class="RES-donate">donate to RES &#8679;</div>',
			() => RESEnvironment.openNewTab('http://redditenhancementsuite.com/contribute.html')
		);
	};
});


addModule('about', function(module, moduleID) {
	module.moduleName = 'About RES';
	module.category = 'About RES';
	module.sort = -3;
	module.alwaysEnabled = true;

	module.loadDynamicOptions = async function() {
		module.description = (await RESTemplates.load('aboutRESPanel')).html();
	};
});
