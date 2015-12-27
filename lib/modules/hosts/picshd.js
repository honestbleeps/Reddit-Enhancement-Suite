addLibrary('mediaHosts', 'picshd', {
	domains: ['picshd.com'],
	detect: href => (/^https?:\/\/(?:i\.|edge\.|www\.)*picshd\.com\/([\w]{5,})(\..+)?$/i).exec(href),
	handleLink(elem, [, hash]) {
		elem.type = 'IMAGE';
		elem.src = `http://i.picshd.com/${hash}.jpg`;
		return elem;
	}
});
