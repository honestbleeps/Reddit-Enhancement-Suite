/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { string } from '../../utils';

export default new Host('aarli', {
	name: 'AAR Library',
	domains: ['aar.li'],
	logo: 'https://aar.li/favicon.ico',
	detect: ({ pathname }) => (/^\/a\/(\w+)/i).exec(pathname),
	async handleLink(href, [, aarId]) {
		const info = await ajax({
			url: 'https://aar.li/api.php',
			data: { aarId },
			type: 'json',
		});

		if (info.errors) {
			throw new Error(info.errors);
		}

		return {
			type: 'GALLERY',
			title: info.title,
			caption: info.description + (info.previousurl ? string.escape`<br/><a href="${info.previousurl}">Previous part.</a>` : ''),
			credits: string.escape`AAR by <a href="${info.authorurl}">${info.author}</a>`,
			src: info.slides.map(({ desc, imglink }) => ({
				type: 'IMAGE',
				caption: desc,
				src: imglink,
			})),
		};
	},
});
