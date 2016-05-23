export default {
	moduleID: 'swirl',
	name: 'swirl',
	domains: ['swirl.xyz'],
	detect: href => (/^https:\/\/(?:s\.)?swirl\.xyz\/(?:s\/)?(.*?)(\.gif|\.mp4|\.webm)?$/i).exec(href),
	handleLink(href, [, hash, extension]) {
		const isGif = extension === '.gif';

		if (isGif) {
			return {
				type: 'IMAGE',
				src: `https://s.swirl.xyz/${hash}.gif`,
			};
		} else {
			return {
				type: 'VIDEO',
				autoplay: true,
				controls: false,
				muted: true,
				loop: true,
				sources: [{
					source: `https://s.swirl.xyz/${hash}.webm`,
					type: 'video/webm',
				}, {
					source: `https://s.swirl.xyz/${hash}.mp4`,
					type: 'video/mp4',
				}],
			};
		}
	},
};
