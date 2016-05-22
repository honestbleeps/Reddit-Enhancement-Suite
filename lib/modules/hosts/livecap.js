import * as ShowImages from '../showImages';
import { $ } from '../../vendor';

export default {
	moduleID: 'livecap',
	name: 'LiveCap',
	domains: ['livecap.tv'],
	logo: '//www.livecap.tv/public/images/16x16.png',

	detect: href => (/^https?:\/\/(?:www\.)?livecap\.tv\/[st]\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9]+)/i).exec(href),

	handleLink(elem, [, path]) {
		let src = `//www.livecap.tv/s/embed/${path}`;

		if (ShowImages.module.options.autoplayVideo.value &&
			$(elem).closest('.md').find('.expando-button.video').length === 0) {
			// Avoid auto playing more than 1 item
			src += '?autoplay=1';
		}

		return {
			type: 'IFRAME',
			embed: src,
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
};
