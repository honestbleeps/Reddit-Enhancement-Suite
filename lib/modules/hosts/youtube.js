/* @flow */

import { Host } from '../../core/host';

export default new Host('youtube', {
	name: 'youtube',
	attribution: false,
	domains: ['youtube.com', 'youtu.be'],
	options: {
		youtubePrivacyPolicy: {
			title: 'youtube Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
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
			const videoID = new URLSearchParams(uParam.split('?')[1]);
			const vParam = videoID.get('v');
			if (vParam) return [vParam, searchParams];
		}
	},
	handleLink(href, [path, searchParams]) {
		const url = new URL(`https://www.youtube.com/embed/${path}`);
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
});
