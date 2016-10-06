export default {
	moduleID: 'vidgif',
	name: 'vidgif',
	domains: ['vidgif.com'],
	detect: ({ pathname }) => (/^\/(?:s\/)?(.*?)(\.gif|\.mp4|\.webm)?$/i).exec(pathname),
	handleLink(href, [, hash, extension]) {
		const isGif = extension === '.gif';

		if (isGif) {
			return {
				type: 'IMAGE',
				src: `https://s.vidgif.com/${hash}.gif`,
			};
		} else {
			return {
				type: 'VIDEO',
				controls: false,
				muted: true,
				loop: true,
				sources: [{
					source: `https://s.vidgif.com/${hash}.webm`,
					type: 'video/webm',
				}, {
					source: `https://s.vidgif.com/${hash}.mp4`,
					type: 'video/mp4',
				}],
			};
		}
	},
};
