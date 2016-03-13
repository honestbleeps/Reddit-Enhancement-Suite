addLibrary('mediaHosts', 'imgflip', {
	domains: ['imgflip.com'],
	logo: '//imgflip.com/favicon02.png',
	detect: href => (/^https?:\/\/imgflip\.com\/(i|gif)\/([a-z0-9]+)/).exec(href),
	handleLink(elem, [, type, id]) {
		elem.type = 'IMAGE';
		elem.src = `https://i.imgflip.com/${id}.${type === 'gif' ? 'gif' : 'jpg'}`;
	}
});
