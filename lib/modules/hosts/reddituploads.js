export default {
	moduleID: 'reddituploads',
	name: 'reddituploads',
	domains: ['reddituploads.com'],
	attribution: false,
	detect: () => true,
	handleLink(elem) {
		elem.type = 'IMAGE';
		elem.src = elem.href;
	}
};
