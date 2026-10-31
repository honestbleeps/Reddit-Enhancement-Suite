/* @flow */

import { Host } from '../../core/host';

export default (new Host('spotify', {
	name: 'spotify',
	domains: ['spotify.com'],
	logo: 'https://spotify.com/favicon.ico',
	/*
	* Match the following (optionally followed by a query string or fragment):
	* https://open.spotify.com/track/id
	* https://open.spotify.com/intl-de/track/id
	* https://play.spotify.com/artist/id
	* https://play.spotify.com/album/id
	* https://open.spotify.com/playlist/id
	* https://open.spotify.com/user/someUser/playlist/id
	*/
	detect: ({ href }) => (/^https:\/\/(?:open|play)\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:user\/[^/?#]+\/(?=playlist\/))?(track|artist|album|playlist)\/([a-zA-Z0-9]+)(?:[?#]|$)/i).exec(href),
	handleLink(href, [, type, id]) {
		return {
			type: 'IFRAME',
			embed: `https://open.spotify.com/embed/${type.toLowerCase()}/${id}`,
		};
	},
}) as Host<RegExpExecArray, {}>);
