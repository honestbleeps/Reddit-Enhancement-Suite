/* @flow */

import { Host } from '../../core/host';

export default new Host('iloopit', {
	name: 'iLoopit - gif maker',
	domains: ['iloopit.net'],
	logo: 'https://iloopit.net/favicon.ico',
	detect: ({ href }) => (
		(/^https?:\/\/(\w+\.)?iloopit\.net\/.+?\/\?type=looplayer&loopid=(\d+)/i).exec(href) ||
		(/^https?:\/\/(\w+\.)?iloopit\.net(\/tube)?\/(\d+)\/.+?\/(\?type=(looplayer)|(embed))?/i).exec(href)
	),
	handleLink(href) {
		let link = '';
		const testWithTitle = /iloopit\.net(?:\/tube)?\/(\d+)\/(.+)?\//;
		const titleResult = testWithTitle.exec(href);

		if (titleResult) {
			link = `https://iloopit.net/${titleResult[1]}/${titleResult[2]}/?type=embed`;
		} else {
			link = href.replace('type=looplayer', 'type=embed');
		}

		return {
			type: 'IFRAME',
			muted: true,
			embed: link,
			fixedRatio: true,
		};
	},
});
