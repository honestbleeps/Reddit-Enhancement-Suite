/* @flow */

import { Host } from '../../core/host';

/*
 * Scrimpton.com is a transcription viewer for a series of radio shows that aired in the mid-2000s.
 * This host module allows sharing of snippets of text/audio.
 */
export default new Host('scrimpton', {
	name: 'Scrimpton',
	logo: 'https://scrimpton.com/assets/android-chrome-192x192.png',
	domains: [
		'scrimpton.com',
		'karltakesasneakylookatmenscocks.com',
	],
	detect: ({ href, pathname }) => {
		if (pathname.startsWith('/embed')) {
			return [href, href];
		}
		if (pathname.startsWith('/ep') && href.indexOf('#pos') > -1) {
			const [, epid, start, end] = (/.+\/ep\/([^#]+)\#pos-(\d+)(-\d+)?/i).exec(href);
			if (!epid || start === undefined) {
				return false;
			}
			if (end === undefined) {
				return [href, `https://scrimpton.com/embed?epid=${epid}&start=${start || 0}`];
			} else {
				return [href, `https://scrimpton.com/embed?epid=${epid}&start=${start || 0}&end=${end.replace('-', '')}`];
			}
		}
		return false;
	},
	handleLink(href, [, embedHref]) {
		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: embedHref,
			width: '800px',
			height: '500px',
		};
	},
});
