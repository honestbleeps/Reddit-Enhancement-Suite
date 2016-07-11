export default {
	moduleID: 'defaultVideo',
	name: 'defaultVideo',
	domains: [],
	detect: ({ pathname }) => (/\.(webm|mp4|ogv|3gp|mkv)$/i).exec(pathname),
	handleLink(href, [, extension]) {
		// Change ogv to ogg format.
		if (extension === 'ogv') extension = 'ogg';

		const format = `video/${extension}`;

		return {
			type: 'VIDEO',
			sources: [{
				source: href,
				type: format,
			}],
		};
	},
};
