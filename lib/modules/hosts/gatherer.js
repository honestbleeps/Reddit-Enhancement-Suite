export default {
	moduleID: 'gatherer',
	name: 'Gatherer MTG Card Images',
	domains: ['gatherer.wizards.com'],
	logo: 'http://gatherer.wizards.com/Images/favicon.ico',
	detect: ({ pathname }) => (
		(/^\/Handlers\/Image\.ashx/i).exec(pathname)
	),
	handleLink(href) {
		return {
			type: 'IMAGE',
			src: href,
		};
	},
};
