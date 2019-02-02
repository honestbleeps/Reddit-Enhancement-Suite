/* @flow */

import { Host } from '../../core/host';

export default new Host('peertube', {
	name: 'peertube',
	domains: [
		'peervideo.net',
		'peertube.social',
		'peertube.mastodon.host',
		'evertron.tv',
		'mplayer.demouliere.eu',
		'cloud.allplayer.tk',
		'video.tedomum.net',
		'peertube.fr',
		'hostyour.tv',
		'videobit.cc',
		'videoshare.cc',
		'peertube.openstreetmap.fr',
		'video.ploud.fr',
		'tube.kdy.ch',
		'lostpod.space',
		'pe.ertu.be',
		'peertube.live',
		'peer.tube',
		'watching.cypherpunk.observer',
		'queertube.org',
		'exode.me',
		'framatube.org',
	],
	attribution: false,
	detect: ({ pathname, hostname }) => {
		// split path excluding first /
		const split = pathname.substring(1).split('/');
		if (split[0] === 'videos') {
			return [split[2], hostname];
		}
	},

	handleLink(href, [id, hostname]) {
		const embed = `https://${hostname}/videos/embed/${id}`;
		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoplay=true`,
			fixedRatio: true,
		};
	},
});
