export default {
	moduleID: 'giphy',
	name: 'giphy',
	domains: ['giphy.com'],
	logo: '//giphy.com/static/img/favicon.png',
	detect: ({ pathname }) => (/^\/gifs\/(.*?)(\/html5)?$/i).exec(pathname),
	handleLink(href, [, id, isHtml5]) {
		if (isHtml5) {
			return {
				type: 'VIDEO',
				controls: false,
				fallback: `https://media.giphy.com/media/${id}/giphy.gif`,
				loop: true,
				muted: true,
				sources: [{
					source: `https://media.giphy.com/media/${id}/giphy.mp4`,
					type: 'video/mp4',
				}],
			};
		} else {
			// gif
			return {
				type: 'IMAGE',
				src: `https://media.giphy.com/media/${id}/giphy.gif`,
			};
		}
	},
};
