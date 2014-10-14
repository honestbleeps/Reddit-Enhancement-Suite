modules['localDate'] = {
	moduleID: 'localDate',
	moduleName: 'Local Date',
	category: 'UI',
	options: {},
	description: 'Shows date in your local time zone when you hover over a relative date.',
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
			$('.sitetable')
				.on('mouseenter', 'time', function() {
					if (!this.getAttribute('data-original-title')) {
						this.setAttribute('data-original-title', this.getAttribute('title'));
					}
					this.setAttribute('title', new Date(this.getAttribute('datetime')));
				})
				.on('mouseleave', 'time', function() {
					this.setAttribute('title', this.getAttribute('data-original-title'));
				});
		}
	}
};
