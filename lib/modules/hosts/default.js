export default {
	moduleID: 'default',
	name: 'default',
	domains: [],
	detect(href) {
		const acceptRegex = /^[^#]+?\.(gif|jpe?g|png)(?:[?&#_].*|$)/i;
		const rejectRegex = /(?:wikipedia\.org\/wiki|(?:i\.|m\.)?imgur\.com|photobucket\.com|gifsound\.com|gfycat\.com|\/wiki\/File:.*|reddit\.com|onedrive\.live\.com|500px\.(?:com|net|org)|(?:www\.|share\.)?gifyoutube\.com)|futurism\.co/i;

		return acceptRegex.test(href) && !rejectRegex.test(href);
	},
	handleLink(elem) {
		elem.type = 'IMAGE';
		elem.src = elem.href;
	}
};
