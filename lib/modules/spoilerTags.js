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
	module.beforeLoad = async function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}

		const template = await RESTemplates.load('spoiler-styles');
		const style = template.text({
			transition: module.options.transition.value
		});
		RESUtils.addCSS(style);
	};
});
