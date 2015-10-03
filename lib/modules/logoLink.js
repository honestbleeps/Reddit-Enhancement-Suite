import { $ } from '../vendor';

export const module = {};

module.moduleID = 'logoLink';
module.moduleName = 'Logo Link';
module.category = 'Browsing';
module.description = 'Allow you to change the link on the reddit logo.';
module.options = {
	redditLogoDestination: {
		type: 'enum',
		values: [{
			name: 'Frontpage',
			value: 'frontpage',
		}, {
			name: '/r/all',
			value: 'all',
		}, {
			name: 'Dashboard',
			value: 'dashboard',
		}, {
			name: 'Current subreddit/multireddit',
			value: 'subreddit',
		}],
		value: 'frontpage',
		description: 'Location when you click on the reddit logo.',
	}
};

module.go = function() {
	const redditLogoNode = document.getElementById('header-img-a') || document.getElementById('header-img');
	if (redditLogoNode) {
		const url = getLogoLinkUrl();
		if (url) {
			redditLogoNode.href = url;
		}
	}
};

function getLogoLinkUrl() {
	switch (module.options.redditLogoDestination.value) {
		case 'frontpage':
			return false;
		case 'all':
			return '/r/all';
		case 'dashboard':
			return '/r/Dashboard';
		case 'subreddit':
			return $('.redditname > a').attr('href');
		default:
			return false;
	}
}
