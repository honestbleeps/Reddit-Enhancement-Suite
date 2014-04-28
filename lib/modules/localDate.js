modules['localDate'] = {
	moduleID: 'localDate',
	moduleName: 'Local Date',
	category: 'UI',
	options: {	},
	description: 'Show date in your local time zone when you hover relative date.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	// include: [
	// ],
	isMatchURL: function() {
		// return RESUtils.isMatchURL(this.moduleID);
		return true;
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			$(".sitetable").on("mouseenter", "time", function() {
				this.setAttribute('title', new Date(this.getAttribute('datetime')));
			});
		}
	}
};