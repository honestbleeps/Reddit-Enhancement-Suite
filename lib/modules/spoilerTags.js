addModule('spoilerTags', function(module, moduleID) {
	module.moduleName = 'Global Spoiler Tags';
	module.category = ['Appearance'];
	module.description = 'Hide spoilers on user profile pages.';
	module.include = [
		'profile'
	];
	module.options = {
		transition: {
			type: 'boolean',
			value: true,
			description: 'Delay showing spoiler text momentarily'
		}
	};
	module.go = function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}
		RESTemplates.load('spoiler-styles', function(template) {
			var style = template.text({
				transition: module.options.transition.value
			});
			RESUtils.addCSS(style);
		});
	};
});
