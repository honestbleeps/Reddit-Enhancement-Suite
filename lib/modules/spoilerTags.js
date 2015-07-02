addModule('spoilerTags', function(module, moduleID) { $.extend(true, module, {
	moduleName: 'Global Spoiler Tags',
	category: 'UI',
	description: 'Hide spoiler-tagged comments on user profiles until moused over.',
	include: [
		'profile'
	],
	options: {
		transition: {
			type: 'boolean',
			value: true,
			description: 'Delay showing spoiler text momentarily'
		}
	},
	go: function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}
		RESTemplates.load('spoiler-styles', function(template) {
			var style = template.text({
				transition: module.options.transition.value
			});
			RESUtils.addCSS(style);
		});
	}
}); });
