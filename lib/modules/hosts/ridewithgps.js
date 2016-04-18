export default {
	moduleID: 'ridewithgps',
	name: 'ridewithgps',
	domains: ['ridewithgps.com'],
	attribution: false,
	detect: href => (/^https?:\/\/(?:www\.)?ridewithgps\.com\/(trips|routes)\/(\d+)/i).exec(href),
	handleLink(elem, [, type, id]) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `https://ridewithgps.com/${type}/${id}/embed`);
	}
};
