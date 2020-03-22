/* @flow */

import { Host } from '../../core/host';

type Detect = RegExp$matchResult;

export default new Host<Detect, {}>('archive.is', {
	name: 'archive.is',
	domains: ['archive.is'],
	logo: 'https://archive.is/favicon.ico',
	detect: ({ pathname }) => (/^\/(\w+)(?:\/|$)/i).exec(pathname),
	handleLink(href, detect) {
		if (!Array.isArray(detect)) {
			return Promise.reject(new Error('path not detected'));
		}
		const code = detect[1];
		return {
			type: 'IMAGE',
			src: `https://archive.fo/${code}/scr.png`,
		};
	},
});
