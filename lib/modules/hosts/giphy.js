import { ajax } from '../../environment';

export default {
	moduleID: 'giphy',
	name: 'giphy',
	domains: ['giphy.com'],
	logo: 'http://i.imgur.com/8SH0d1H.png',
	detect: ({ pathname }) => (/^(?:\/gifs|\/media|)\/(?:\w+-)*([^/.]*)(\/html5)?.*$/i).exec(pathname),
	async handleLink(href, [, id, isHtml5]) {
		const { data } = await ajax({
			url: `http://api.giphy.com/v1/gifs/${id}?api_key=dc6zaTOxFJmzC`,
			type: 'json',
		});

		if (isHtml5) {
			return {
				type: 'VIDEO',
				controls: false,
				fallback: data.images.original.url,
				loop: true,
				muted: true,
				sources: [{
					source: data.images.original.mp4,
					type: 'video/mp4',
				}],
			};
		} else {
			// gif
			return {
				type: 'IMAGE',
				src: data.images.original.url,
			};
		}
	},
};
