export default {
	moduleID: 'defaultVideo',
	name: 'defaultVideo',
	domains: [],
	detect: ({ href }) => (/^[^#]+?\.(webm|mp4|ogv|3gp|mkv)(?:[?&#_].*|$)/i).exec(href),
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
