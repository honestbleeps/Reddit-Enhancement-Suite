addModule('localDate', {
	moduleID: 'localDate',
	moduleName: 'Local Date',
	category: ['My account'],
	options: {},
	description: 'Shows date in your local time zone when you hover over a relative date.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
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
					var $this = $(this);
					if (!$this.data('originalTitle')) {
						$this.data('originalTitle', $this.attr('title'));
					}
					$this.attr('title', new Date($this.attr('datetime')));
				})
				.on('mouseleave', 'time', function() {
					var $this = $(this);
					$this.attr('title', $this.data('originalTitle'));
				});
		}
	}
});
