addModule('tests', function(module, moduleID) {
	module.moduleName = 'Tests';
	module.description = 'Run diagnostic tests or example code for RES functionality',
	module.category = 'Troubleshoot';
	
	module.options['templates'] = {
		type: 'button',
		text: 'Test templates',
		callback: testTemplates,
		description: 'Test rendering templates'
	};
	function testTemplates() {
		RESTemplates.load('test');
		var templateText = RESTemplates.test.text({ name: 'FakeUsername' });
		console.log(templateText);
		/*
		modules['notifications'].showNotification({
			title: 'Template test',
			message: templateText
		});
		*/
	}
});