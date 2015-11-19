addModule('logoLink', {
	moduleID: 'logoLink',
	moduleName: 'Logo Link',
	category: 'Browsing',
	options: {
		redditLogoDestination: {
			type: 'enum',
			values: [{
				name: 'Frontpage',
				value: 'frontpage'
			}, {
				name: '/r/all',
				value: 'all'
			}, {
				name: 'Dashboard',
				value: 'dashboard'
			}, {
				name: 'Current subreddit/multireddit',
				value: 'subreddit'
			}],
			value: 'frontpage',
			description: 'Location when you click on the reddit logo.'
		}
	},
	description: 'Allow you to change the link on the reddit logo.',
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
			var redditLogoNode = document.getElementById('header-img-a') || document.getElementById('header-img');
			if (redditLogoNode) {
				if (this.options.redditLogoDestination.value === 'all') {
					redditLogoNode.href = '/r/all';
				} else if (this.options.redditLogoDestination.value === 'dashboard'){
					redditLogoNode.href = '/r/Dashboard';
				} else if (this.options.redditLogoDestination.value === 'subreddit' && $('.redditname>a').length) {
					redditLogoNode.href = $('.redditname>a').attr('href');
				}
			}
		}
	}
});
