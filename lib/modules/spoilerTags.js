modules['spoilerTags'] = {
	moduleID: 'spoilerTags',
	moduleName: 'Global Spoiler Tags',
	category: 'UI',
	options: { },
	description: 'Hides spoiler-tagged comments on user profiles.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		"profile"
	],
	exclude: [ ],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}
		RESTemplates.load('spoiler-styles', function(template) {
			var style = template.text();
			RESUtils.addCSS(style);
		});
	}
};
