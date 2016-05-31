import { ajax } from '../../environment';

export default {
	moduleID: 'wikipedia',
	name: 'wikipedia',
	domains: ['wikipedia.org'],
	attribution: false,
	detect: ({ href }) => (/^https?:\/\/([A-z]{2}|simple)?\.(?:m\.)?wikipedia\.org\/wiki\/(.+)/i).exec(href),
	async handleLink(href, [, country, article]) {
		const data = await ajax({
			url: 'https://noembed.com/embed',
			data: { url: `http://${country}.wikipedia.org/wiki/${article}` },
			type: 'json',
		});

		return {
			type: 'TEXT',
			title: data.title,
			src: data.html,
		};
	},
};
