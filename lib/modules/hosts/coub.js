export default {
	moduleID: 'coub',

	name: 'Coub',

	domains: ['coub.com'],

	detect: href => (/^https?:\/\/coub\.com\/(?:view|embed)\/([\w]+)(\.gifv)?/i).exec(href),

	handleLink(elem, [, hash, isGifv]) {
		const src = isGifv ?
			`//coub.com/view/${hash}.gifv?res=true` :
			`//coub.com/embed/${hash}?autoplay=true&res=true`;

		elem.type = 'IFRAME';
		elem.expandoClass = isGifv ? 'video-muted' : 'video';
		elem.setAttribute('data-embed', src);
		elem.setAttribute('data-pause', 'stop');
		elem.setAttribute('data-play', 'play');
	}
};
