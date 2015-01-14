modules['spoilerTags'] = {
	moduleID: 'spoilerTags',
	moduleName: 'Global Spoiler Tags',
	category: 'UI',
	options: { },
	description: 'Hides spoiler-tagged comments globally across Reddit',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/user\/.*/i
	],
	exclude: [ ],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}
		var styles = RESTemplates.getSync('spoiler-styles');
		var tag = document.createElement('style');
		tag.setAttribute('type', 'text/css');
		tag.innerHTML = styles.text(); // Security note: not user input
		document.head.appendChild(tag);
	},
	hosts: {}
};
