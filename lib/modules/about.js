addModule('contribute', function(module, moduleID) {
	module.moduleName = 'Donate and Contribute';
	module.category = 'About RES';
	module.sort = -10;
	module.alwaysEnabled = true;

	module.go = function() {
		modules['RESMenu'].addMenuItem(
			'<div class="RES-donate">donate to RES &#8679;</div>',
			function() {
				RESUtils.openLinkInNewTab('http://redditenhancementsuite.com/contribute.html', true);
			}
		);
	};

	module.onConsoleOpen = function() {
		RESTemplates.load('contributeRESPanel', function(template) {
			module.description = template.html();
		});
	};
});


addModule('about', function(module, moduleID) {
	module.moduleName = 'About RES';
	module.category = 'About RES';
	module.sort = -3;
	module.alwaysEnabled = true;

	module.onConsoleOpen = function() {
		RESTemplates.load('aboutRESPanel', function(template) {
			module.description = template.html();
		});
	};
});
