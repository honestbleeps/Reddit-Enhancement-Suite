import * as ShowImages from '../showImages';
import { $ } from '../../vendor';

export default {
	moduleID: 'oddshot',
	domains: ['oddshot.tv'],
	logo: '//oddshot.tv/favicon.ico',
	name: 'Oddshot',
	detect: href => (/^https?:\/\/(?:www\.)?oddshot.tv\/shot\/([a-z0-9_-]+)/i).exec(href),
	handleLink(elem, [, hash]) {
		let url = `//oddshot.tv/shot/${hash}/embed`;

		if (ShowImages.module.options.autoplayVideo.value &&
			$(elem).closest('.md').find('.expando-button.video').length === 0) {
			url += '?autoplay=true';
		}

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', url);
	},
};
