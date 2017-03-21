/* @flow */

import _ from 'lodash';
import { Host } from '../../core/host';
import { getUrlParams, insertParams } from '../../utils';

export default new Host('youtube', {
	name: 'youtube',
	attribution: false,
	domains: ['youtube.com', 'youtu.be'],
	detect: ({ pathname, hostname, search }) => {
		const params = getUrlParams(search);
		// split path excluding first /
		const split = pathname.substring(1).split('/');
		// livestream channel url
		if (split[0] === 'channel' && split[2] === 'live') return `live_stream?channel=${split[1]}`;
		// short url
		if (hostname.endsWith('youtu.be')) return split[0];
		// long url
		return 'v' in params ?
			params.v : // ?v=
			(/watch|embed|v/i).exec(split[0]) && split[1]; // watch/embed/v
	},
	handleLink(href, path) {
		let src = insertParams(`https://www.youtube.com/embed/${path}`, { version: 3 });

		const params = getUrlParams(href);

		if (params.t) {
			let start = 0;
			const timeBlocks = { h: 3600, m: 60, s: 1 };
			const timeRe = /[0-9]+[hms]/ig;
			// Get each segment e.g. 8m and calculate its value in seconds
			const timeMatch = params.t.match(timeRe);

			if (timeMatch) {
				for (const ts of timeMatch) {
					const unit = timeBlocks[ts.slice(-1)];
					const amount = parseInt(ts.slice(0, -1), 10);
					// Add each unit to start
					start += unit * amount;
				}
			} else {
				// support direct timestamp e.g. t=200
				start = parseInt(params.t, 10);
				if (isNaN(start)) start = 0;
			}
			src = insertParams(src, { start });
		}

		src = insertParams(src, _.pick(params, ['end', 'start', 'list']));

		return {
			type: 'IFRAME',
			embed: src,
			embedAutoplay: insertParams(src, { autoplay: 1, rel: 0 }),
			fixedRatio: true,
		};
	},
});
