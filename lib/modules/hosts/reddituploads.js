export default {
	moduleID: 'reddituploads',
	name: 'reddituploads',
	domains: ['reddituploads.com'],
	attribution: false,
	detect: () => true,
	handleLink(elem) {
		return {
			type: 'IMAGE',
			src: elem.href,
		};
	},
};
