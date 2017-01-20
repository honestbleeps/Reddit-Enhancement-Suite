/* @flow */

import { Host } from '../../core/host';

export default new Host('imgflip', {
	name: 'imgflip',
	domains: ['imgflip.com'],
	logo: '//imgflip.com/favicon02.png',
	detect: ({ pathname }) => (/^\/(i|gif)\/([a-z0-9]+)/).exec(pathname),
	handleLink(href, [, type, id]) {
		return {
			type: 'IMAGE',
			src: `https://i.imgflip.com/${id}.${type === 'gif' ? 'gif' : 'jpg'}`,
		};
	},
});
