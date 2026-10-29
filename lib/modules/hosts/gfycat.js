/* @flow */

import { Host } from '../../core/host';
import type { BooleanOption } from '../../core/module';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

type Opt = { useMobileGfycat: BooleanOption<Opt> };

export default (new Host('gfycat', {
	name: 'gfycat',
	domains: ['gfycat.com'],
	logo: 'https://gfycat.com/favicon.ico',
	options: {
		useMobileGfycat: {
			title: 'gfycatUseMobileGfycatTitle',
			description: 'gfycatUseMobileGfycatDesc',
			value: false,
			type: 'boolean',
		},
	},
	detect: ({ pathname }) => (/^\/(?:(?:ifr|gifs\/detail)\/)?(\w+)(?:\.gif)?/i).exec(pathname),
	async handleLink(href, [, id]) {
		// $FlowFixMe[object-this-reference] handleLink is always called as a method of this host
		const isMobileResolution = this.options.useMobileGfycat.value;

		const info = (await ajax({
			url: string.encode`https://api.gfycat.com/v1/gfycats/${id}`,
			type: 'json',
			cacheFor: DAY,
		})).gfyItem;

		return {
			type: 'VIDEO',
			frameRate: info.frameRate,
			loop: true,
			muted: !info.hasAudio,
			playbackRate: +(href.match(/[?|&]speed=([\d\.]+)/i) || [undefined, 1])[1],
			poster: isMobileResolution ? info.mobilePosterUrl : info.posterUrl,
			sources: [isMobileResolution && {
				source: info.mobileUrl,
				type: 'video/mp4',
			}, {
				source: info.webmUrl,
				type: 'video/webm',
			}, {
				source: info.mp4Url,
				type: 'video/mp4',
				// $FlowFixMe[incompatible-type] the falsy entry is removed by the filter
			}].filter(x => x),
			time: +(href.match(/[?|&]frameNum=([\d]+)/i) || [undefined, 0])[1] / info.frameRate,
		};
	},
}) as Host<RegExpExecArray, Opt>);
