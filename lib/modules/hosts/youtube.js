/* @flow */

import { Host } from '../../core/host';

export default new Host('youtube', {
	name: 'youtube',
	attribution: false,
	domains: ['youtube.com', 'youtu.be'],
	detect: ({ pathname, hostname, searchParams }) => {
		// split path excluding first /
		const split = pathname.substring(1).split('/');
		// livestream channel url
		if (split[0] === 'channel' && split[2] === 'live') return [`live_stream?channel=${split[1]}`, searchParams];
		// short url
		if (hostname.endsWith('youtu.be')) return [split[0], searchParams];
		// long url
		//   ?v=
		if (searchParams.has('v')) return [searchParams.get('v'), searchParams];
		//   watch/embed/v
		if ((/watch|embed|v/i).exec(split[0])) return [split[1], searchParams];
	},
	handleLink(href, [path, searchParams]) {
		const url = new URL(`https://www.youtube.com/embed/${path}`);
		url.searchParams.set('version', '3');
		url.searchParams.set('rel', '0');

		if (searchParams.has('t')) {
			let start = 0;
			const timeBlocks = { h: 3600, m: 60, s: 1 };
			const timeRe = /[0-9]+[hms]/ig;
			// Get each segment e.g. 8m and calculate its value in seconds
			const timeMatch = searchParams.get('t').match(timeRe);

			if (timeMatch) {
				for (const ts of timeMatch) {
					const unit = timeBlocks[ts.slice(-1)];
					const amount = parseInt(ts.slice(0, -1), 10);
					// Add each unit to start
					start += unit * amount;
				}
			} else {
				// support direct timestamp e.g. t=200
				start = parseInt(searchParams.get('t'), 10);
				if (isNaN(start)) start = 0;
			}
			url.searchParams.set('start', String(start));
		}

		for (const k of ['end', 'start', 'list']) {
			if (searchParams.has(k)) url.searchParams.set(k, searchParams.get(k));
		}

		return {
			type: 'IFRAME',
			embed: url.href,
			embedAutoplay: `${url.href}&autoplay=1`,
			fixedRatio: true,
		};
	},
});
