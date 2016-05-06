import { ajax } from '../../environment';

export default {
	moduleID: 'photobucket',
	name: 'photobucket',
	domains: ['photobucket.com'],
	logo: '//pic2.pbsrc.com/common/favicon.ico',
	detect: href => (/([is]?)[0-9]+|media|smg|img(?=.photobucket.com)/i).exec(href),
	async handleLink(elem, [, prefix]) {
		const href = elem.href.replace('.html', '');

		// user linked direct image so no need to hit API
		if (prefix === 'i') {
			elem.src = href;
		} else {
			const { imageUrl } = await ajax({
				url: 'https://api.photobucket.com/v2/media/fromurl',
				data: { url: href },
				type: 'json',
			});
			elem.src = imageUrl.replace('http:', 'https:');
		}

		elem.type = 'IMAGE';
	},
};
