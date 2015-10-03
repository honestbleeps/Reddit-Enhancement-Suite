modules['logoLink'] = {
	moduleID: 'logoLink',
	moduleName: 'Logo Link',
	category: 'Subreddits',
	options: {
		redditLogoDestination: {
			type: 'enum',
			value: 'frontpage',
			description: 'Location when you click on the reddit logo.',
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
			}]
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
				var url = this.getLogoLinkUrl();
				if (url) {
					redditLogoNode.href = url;
				}
			}
		}
	},
	getLogoLinkUrl: function() {
		var destination = this.options.redditLogoDestination.value;
		var url;
		switch (destination) {
			case 'frontpage':
				// do nothing
				break;
			case 'all':
				url = '/r/all';
				break;
			case 'dashboard':
				url = '/r/Dashboard';
				break;
			case 'subreddit':
				url = $('.redditname>a').attr('href');
				break;
		}
		return url;
	}
};
