addLibrary('mediaHosts', 'streamable', {
	domains: ['streamable.com'],
	detect: href => (/^https?:\/\/(?:www\.)?streamable\.com\/([\w]+)/i).exec(href),
	handleLink(elem, [, hash]) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `https://streamable.com/res/${hash}`);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');
		return elem;
	}
});
