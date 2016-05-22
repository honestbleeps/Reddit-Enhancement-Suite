import { $ } from '../../vendor';
import { ajax } from '../../environment';

export default {
	moduleID: 'soundcloud',
	name: 'soundcloud',
	domains: ['soundcloud.com'],
	logo: 'https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14b.ico',
	// reddit's expandos are exactly the same, so ignore posts
	detect: (href, elem) => !elem.classList.contains('title'),
	async handleLink(elem) {
		const { html } = await ajax({
			url: 'https://soundcloud.com/oembed',
			data: {
				url: elem.href,
				format: 'json',
				iframe: 'true',
			},
			type: 'json',
		});

		// Get src from iframe html returned
		const src = $(html).attr('src');
		return {
			type: 'IFRAME',
			embed: src,
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
};
