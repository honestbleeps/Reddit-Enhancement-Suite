import * as ShowImages from '../showImages';
import { $ } from '../../vendor';

export default {
	moduleID: 'vimeo',
	name: 'vimeo',
	domains: ['vimeo.com'],
	attribution: false,
	detect: (href, elem) => !elem.classList.contains('title') && (/^https?:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/i).exec(href),
	handleLink(elem, [, id]) {
		let src = `https://player.vimeo.com/video/${id}`;

		if (ShowImages.module.options.autoplayVideo.value) {
			// Avoid auto playing more than 1 item
			if ($(elem).closest('.md').find('.expando-button.video').length === 0) src += '?autoplay=true';
		}

		return {
			type: 'IFRAME',
			embed: src,
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
};
