import { ajax } from '../../environment';
import logo from '../../images/hosts/giphy-logo.png';

export default {
	moduleID: 'giphy',
	name: 'giphy',
	domains: ['giphy.com'],
	logo,
	detect: ({ pathname }) => (/^(?:\/gifs|\/media|)\/(?:\w+-)*([^/.]+)(?:\/|\.gif|$)/i).exec(pathname),
	async handleLink(href, [, id]) {
		const { data } = await ajax({
			url: `https://api.giphy.com/v1/gifs/${id}`,
			data: { api_key: 'dc6zaTOxFJmzC' },
			type: 'json',
		});

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
	},
};
