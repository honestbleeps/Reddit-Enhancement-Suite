addModule('truncateLongLinks', function(module, moduleID) {
	module.moduleName = 'Truncate Long Links';
	module.category = 'Browsing';
	module.description = 'Truncates long links (greater than 1 line) with an ellipsis.';
	module.options = {

	};

	module.include = [
		'all'
	];
	module.exclude = [
	];

	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			RESUtils.addCSS("overflow: hidden;text-overflow: ellipsis;white-space: nowrap;");
		}
	};

});
