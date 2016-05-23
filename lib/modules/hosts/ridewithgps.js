export default {
	moduleID: 'ridewithgps',
	name: 'ridewithgps',
	domains: ['ridewithgps.com'],
	attribution: false,
	detect: ({ href }) => (/^https?:\/\/(?:www\.)?ridewithgps\.com\/(trips|routes)\/(\d+)/i).exec(href),
	handleLink(href, [, type, id]) {
		return {
			type: 'IFRAME',
			embed: `https://ridewithgps.com/${type}/${id}/embed`,
		};
	},
};
