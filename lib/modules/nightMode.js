addModule('nightMode', function(module, moduleID) {
	module.moduleName = 'Night Mode';
	module.description = 'A darker, more eye-friendly version of Reddit suited for night browsing.';
	module.category = 'UI';

	$.extend(module, {
	beforeLoad: function() {},
	go: function() {}
	});
});
