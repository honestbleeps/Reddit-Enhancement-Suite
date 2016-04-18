export default {
	moduleID: 'streamable',
	name: 'streamable',
	domains: ['streamable.com'],
	logo: '//cdn.streamable.com/static/img/favicon.ico',
	detect: (href, elem) => (
		!elem.classList.contains('title') &&
		(/^https?:\/\/(?:www\.)?streamable\.com\/([\w]+)/i).exec(href)
	),
	handleLink(elem, [, hash]) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `https://streamable.com/res/${hash}`);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');
	}
};
