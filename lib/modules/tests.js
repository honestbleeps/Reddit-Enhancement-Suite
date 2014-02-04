addModule('tests', function(module, moduleID) {
	module.moduleName = 'Tests';
	module.description = 'Run diagnostic tests or example code for RES functionality',
	module.category = 'About RES';
	
	module.options['templates'] = {
		type: 'button',
		text: 'Test templates',
		callback: testTemplates,
		description: 'Test rendering templates'
	};
	function testTemplates() {
		RESTemplates.load('test', function(template) {
			var templateText = template.text({ name: 'FakeUsername' });
			console.log(templateText);

			/*
			modules['notifications'].showNotification({
				title: 'Template test',
				message: templateText
			});
			*/
		});
	}
});
