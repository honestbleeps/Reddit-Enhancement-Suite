import { DAY } from '../../utils';
import { ajax } from '../../environment';

export default {
	moduleID: 'graphiq',
	name: 'graphiq',
	domains: ['graphiq.com'],
	logo: '//www.graphiq.com/favicon.ico',
	landingPage: 'https://www.graphiq.com/', // set menually as https url without www didn't work when i tried it
	detect: ({ pathname }) => (/^\/(?:w|wlp)\/([A-z0-9]+)/i).exec(pathname),
	async handleLink(href, [url, id]) {
		const { width, height } = await ajax({
			url: 'https://oembed.graphiq.com/services/oembed',
			data: { url },
			type: 'json',
			cacheFor: DAY,
		});

		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `https://www.graphiq.com/w/${id}`,
			width: `${width}px`,
			height: `${height}px`,
		};
	},
};
