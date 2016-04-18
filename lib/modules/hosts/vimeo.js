import { $ } from '../../vendor';

export default {
	moduleID: 'vimeo',
	name: 'vimeo',
	domains: ['vimeo.com'],
	attribution: false,
	detect: (href, elem) => !elem.classList.contains('title') && (/^https?:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/i).exec(href),
	handleLink(elem, [, id]) {
		let src = `https://player.vimeo.com/video/${id}`;

		if (modules['showImages'].options.autoplayVideo.value) {
			// Avoid auto playing more than 1 item
			if ($(elem).closest('.md').find('.expando-button.video').length === 0) src += '?autoplay=true';
		}

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', src);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');
	}
};
