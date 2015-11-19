addModule('spoilerTags', {
	moduleName: 'Global Spoiler Tags',
	category: ['Appearance'],
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
		RESTemplates.load('spoiler-styles', (function(template) {
			var style = template.text({
				transition: this.options.transition.value
			});
			RESUtils.addCSS(style);
		}).bind(this));
	}
});
