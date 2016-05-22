export default {
	moduleID: 'defaultVideo',
	name: 'defaultVideo',
	domains: [],
	videoDetect: document.createElement('VIDEO'),
	detect(href) {
		const acceptRegex = /^[^#]+?\.(webm|mp4|ogv|3gp|mkv)(?:[?&#_].*|$)/i;
		const rejectRegex = /(?:onedrive\.live\.com)/i;

		// important that acceptRegex is last (the returned value)
		return !rejectRegex.test(href) && acceptRegex.exec(href);
	},
	handleLink(elem, [, extension]) {
		// Change ogv to ogg format.
		if (extension === 'ogv') extension = 'ogg';

		const format = `video/${extension}`;

		// Only add the inline video player if the users browser
		// 'probably' or 'maybe' supports the linked video format.
		// This should cover most video problems. You can never be
		// sure if the client supports the codecs used in the container.
		if (this.videoDetect.canPlayType(format) === '') {
			throw new Error(`Format ${format} unsupported.`);
		}

		return {
			type: 'VIDEO',
			sources: [{
				source: elem.href,
				type: format,
			}],
		};
	},
};
