addLibrary('mediaHosts', 'steampowered', {
	name: 'steam',
	domains: ['steampowered.com', 'steamusercontent.com'],
	detect: (href, elem) => (/^\/ugc\/(\d{15,20}\/\w{40})(?:$|\/)/i).exec(elem.pathname),
	handleLink(elem, [pathname]) {
		elem.type = 'IMAGE';
		elem.src = `http://images.akamai.steamusercontent.com${pathname}`;
		return elem;
	}
});
