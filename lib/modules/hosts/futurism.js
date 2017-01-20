/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { string } from '../../utils';

export default new Host('futurism', {
	name: 'futurism',
	attribution: false,
	domains: ['futurism.com', 'futurism.co'],
	detect: () => true,
	async handleLink(href) {
		let apiURL = string.encode`http://www.futurism.com/wp-content/themes/futurism/res.php?url=${href}`;
		if (href.includes('wp-content/uploads')) {
			apiURL += '&reverse=true';
		}

		const { data, success, status } = await ajax({
			url: apiURL,
			type: 'json',
		});

		if (!success) {
			throw new Error(`Request failure: status ${status}`);
		}

		return {
			type: 'IMAGE',
			src: data.image_link,
		};
	},
});
