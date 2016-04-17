import { $ } from '../../vendor';
import { ajax } from 'environment';

addLibrary('mediaHosts', 'soundcloud', {
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
				iframe: 'true'
			},
			type: 'json'
		});

		// Get src from iframe html returned
		const src = $(html).attr('src');
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', src);
		elem.setAttribute('data-pause', '{"method":"pause"}');
		elem.setAttribute('data-play', '{"method":"play"}');
	}
});
