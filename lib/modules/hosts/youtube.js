/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { DAY, batch } from '../../utils';

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
		const vParam = searchParams.get('v');
		if (vParam) return [vParam, searchParams];
		//   watch/embed/v
		if ((/watch|embed|v/i).exec(split[0])) return [split[1], searchParams];
		//   attribution_link
		const uParam = searchParams.get('u');
		if (split[0] === 'attribution_link' && uParam !== null) {
			const vParam = new URLSearchParams(uParam.split('?')[1]).get('v');
			if (vParam) return [vParam, searchParams];
		}
	},
	handleLink(href, [id, searchParams]) {
		const url = new URL(`https://www.youtube.com/embed/${id}`);
		url.searchParams.set('version', '3');
		url.searchParams.set('rel', '0');

		const tParam = searchParams.get('t');
		if (tParam) {
			let start = 0;
			const timeBlocks = { h: 3600, m: 60, s: 1 };
			const timeRe = /[0-9]+[hms]/ig;
			// Get each segment e.g. 8m and calculate its value in seconds
			const timeMatch = tParam.match(timeRe);

			if (timeMatch) {
				for (const ts of timeMatch) {
					const unit = timeBlocks[ts.slice(-1)];
					const amount = parseInt(ts.slice(0, -1), 10);
					// Add each unit to start
					start += unit * amount;
				}
			} else {
				// support direct timestamp e.g. t=200
				start = parseInt(tParam, 10);
				if (isNaN(start)) start = 0;
			}
			url.searchParams.set('start', String(start));
		}

		for (const k of ['end', 'start', 'list']) {
			const param = searchParams.get(k);
			if (param) url.searchParams.set(k, param);
		}

		return {
			type: 'IFRAME',
			embed: url.href,
			embedAutoplay: `${url.href}&autoplay=1`,
			fixedRatio: true,
		};
	},
	getVideoData: batch(async ids => {
		const { items } = await ajax({
			url: 'https://www.googleapis.com/youtube/v3/videos',
			query: {
				id: [...ids].sort().join(','), // sorted to improve cache hit likelyhood
				part: ['id', 'contentDetails', 'snippet', 'statistics'].join(','),
				fields: `items(${['id', 'contentDetails(duration)', 'snippet(title,publishedAt)', 'statistics(viewCount)'].join(',')})`,
				key: 'AIzaSyB8ufxFN0GapU1hSzIbuOLfnFC0XzJousw',
			},
			type: 'json',
			cacheFor: DAY,
		});

		return ids
			.map(id => {
				const data = items.find(({ id: _id }) => _id === id);
				try {
					const { contentDetails: { duration: rawDuration }, snippet: { title, publishedAt }, statistics: { viewCount } } = data;

					const duration = ['0']
						.concat(rawDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i).slice(1)) // PT1H11M46S
						.map(time => `0${time || 0}`.slice(-2))
						.filter((time, i, { length }) => +time !== 0 || i >= length - 2)
						.join(':');

					return { title, duration, publishedAt, viewCount };
				} catch (e) { /* empty */ }
			});
	}, { size: 50, delay: 750 }),
});
