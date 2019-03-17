/* @flow */

import { Host } from '../../core/host';

export default new Host('vlive', {
	name: 'VLive',
	domains: ['vlive.tv'],
	logo: 'https://www.vlive.tv/favicon.ico?2018042316',
	detect: ({ pathname }) => (/^\/(?:video)\/([0-9]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		const embed = `https://vlive.tv/embed/${id}`;
		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoPlay=true`,
			fixedRatio: true,
	}},
});
