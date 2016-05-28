export default {
	moduleID: 'reddituploads',
	name: 'reddituploads',
	domains: ['reddituploads.com'],
	attribution: false,
	detect: () => true,
	handleLink(href) {
		return {
			type: 'IMAGE',
			src: href,
		};
	},
};
