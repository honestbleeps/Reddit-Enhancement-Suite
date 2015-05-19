addModule('spoilerTags', function(module, moduleID) { $.extend(true, module, {
	moduleName: 'Global Spoiler Tags',
	category: 'UI',
	description: 'Hide spoiler-tagged comments on user profiles.',
	include: [
		"profile"
	],
	go: function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}
		RESTemplates.load('spoiler-styles', function(template) {
			var style = template.text();
			RESUtils.addCSS(style);
		});
	}
}); });
