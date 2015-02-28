addModule('orangered', function(module, moduleID) {
	module.moduleName = 'Unread Messages'
	module.category = 'Comments';
	module.description = 'Helping you get your daily dose of orangereds';

	module.options = {
		openMailInNewTab: {
			description: 'When clicking the mail envelope or modmail icon, open mail in a new tab?',
			type: 'enum',
			value: false
		}
	};

	module.go = function() {
		if (module.options.openMailInNewTab.value) {
			$('#mail, #modmail').attr('target', '_blank');
		}
	}
});
