/* @flow */

import { Host } from '../../core/host';

export default new Host('makeameme', {
	name: 'makeameme',
	domains: ['makeameme.org'],
	logo: 'https://makeameme.org/images/favicons/favicon-32x32.png',
	detect: ({ pathname }) => (/^\/meme\/([\w\-]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `https://makeameme.org/media/created/${id}.jpg`,
		};
	},
});
