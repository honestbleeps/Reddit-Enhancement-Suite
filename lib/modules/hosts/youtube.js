import * as ShowImages from '../showImages';
import { $ } from '../../vendor';
import { getUrlParams } from '../../utils';

export default {
	moduleID: 'youtube',
	name: 'youtube',
	attribution: false,
	domains: ['youtube.com', 'youtu.be'],
	detect(href, elem) {
		return !elem.classList.contains('title') &&
			(/^https?:\/\/(?:youtu\.be|(?:www\.|m\.)?youtube\.com)\/?(?:watch|embed)?(?:.*?v=|v\/|\/)([\w-]+)/i).exec(href);
	},
	handleLink(elem, [, hash]) {
		let src = `https://www.youtube.com/embed/${hash}?enablejsapi=1&enablecastapi=1`;
		const params = getUrlParams(elem.href);
		if (params.t) {
			let starttime = 0;
			const timeBlocks = { h: 3600, m: 60, s: 1 };
			const timeRe = /[0-9]+[hms]/ig;
			// Get each segment e.g. 8m and calculate its value in seconds
			const timeMatch = params.t.match(timeRe);

			if (timeMatch) {
				timeMatch.forEach(ts => {
					const unit = timeBlocks[ts.charAt(ts.length - 1)];
					const amount = parseInt(ts.slice(0, -1), 10);
					// Add each unit to starttime
					starttime += unit * amount;
				});
			} else {
				// support direct timestamp e.g. t=200
				starttime = parseInt(params.t, 10);
				if (isNaN(starttime)) starttime = 0;
			}
			src = `${src}&start='${starttime}`;
		}
		if (params.end) {
			src = `${src}&end=${params.end}&version=3`;
		}
		if (params.start) {
			src = `${src}&start=${params.start}`;
		}
		if (params.list) {
			src = `${src}&list=${params.list}`;
		}

		if (ShowImages.module.options.autoplayVideo.value) {
			// Avoid auto playing more than 1 item
			if ($(elem).closest('.md').find('.expando-button.video').length === 0) src += '&autoplay=1';
		}

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', src);
		elem.setAttribute('data-pause', '{"event":"command","func":"pauseVideo","args":""}');
		elem.setAttribute('data-play', '{"event":"command","func":"playVideo","args":""}');
	},
};
