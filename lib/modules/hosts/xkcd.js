import { ajax } from '../../environment';

export default {
	moduleID: 'xkcd',
	name: 'xkcd',
	domains: ['xkcd.com'],
	permissions: ['https://xkcd.com/*/info.0.json'],
	logo: 'https://xkcd.com/favicon.ico',
	detect: ({ hostname, pathname }) => (
		// primarily to exclude what-if.xkcd.com
		['xkcd.com', 'www.xkcd.com'].includes(hostname) &&
		(/^\/([0-9]+)(?:\/|$)/i).exec(pathname)
	),
	async handleLink(href, [, id]) {
		const { title, alt, img } = await ajax({
			url: `https://xkcd.com/${id}/info.0.json`,
			type: 'json',
		});

		return {
			type: 'IMAGE',
			title,
			caption: alt,
			// Fix API always returning non-HTTPS URL
			src: img.replace('http://', '//'),
		};
	},
};
