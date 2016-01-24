addLibrary('mediaHosts', 'steampowered', {
	name: 'steam',
	logo: '//store.steampowered.com/favicon.ico',
	domains: ['steampowered.com', 'steamusercontent.com'],
	detect: function(href, elem) {
		return (/^cloud(?:-\d)?\.(?:steampowered|steamusercontent)\.com$/i).test(elem.host);
	},
	handleLink: function(elem) {
		return $.Deferred().resolve(elem, elem.href).promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IMAGE';
		elem.src = info;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return $.Deferred().resolve(elem).promise();
	}
});
