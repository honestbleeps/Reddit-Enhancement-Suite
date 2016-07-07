export default {
	moduleID: 'defaultAudio',
	name: 'defaultAudio',
	domains: [],
	detect: ({ href }) => (/^[^#]+?\.(opus|weba|ogg|wav|mp3|flac)(?:[?&#_].*|$)/i).exec(href),
	handleLink(href, [, extension]) {
		// Change weba and opus to their correct containers.
		if (extension === 'weba') extension = 'webm';
		if (extension === 'opus') extension = 'ogg';

		const format = `audio/${extension}`;

		return {
			type: 'AUDIO',
			autoplay: true,
			loop: false,
			sources: [{
				file: href,
				type: format,
			}],
		};
	},
};
