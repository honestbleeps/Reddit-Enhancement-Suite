export default {
	moduleID: 'giphy',
	name: 'giphy',
	domains: ['giphy.com'],
	logo: '//giphy.com/static/img/favicon.png',
	detect: href => (/^https?:\/\/(?:www\.)?giphy\.com\/gifs\/(.*?)(\/html5)?$/i).exec(href),
	handleLink(elem, [, id, isHtml5]) {
		if (isHtml5) {
			elem.type = 'VIDEO';
			elem.expandoOptions = {
				autoplay: true,
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
			elem.type = 'IMAGE';
			elem.src = `https://media.giphy.com/media/${id}/giphy.gif`;
		}
	},
};
