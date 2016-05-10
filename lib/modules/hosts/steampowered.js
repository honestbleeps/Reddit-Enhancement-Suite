export default {
	moduleID: 'steampowered',
	name: 'steam',
	logo: '//store.steampowered.com/favicon.ico',
	domains: ['steampowered.com', 'steamusercontent.com'],
	detect: (href, elem) => (/^\/ugc\/(\d{15,20}\/\w{40})(?:$|\/)/i).exec(elem.pathname),
	handleLink(elem, [pathname]) {
		elem.type = 'IMAGE';
		elem.src = `http://images.akamai.steamusercontent.com${pathname}`;
	},
};
