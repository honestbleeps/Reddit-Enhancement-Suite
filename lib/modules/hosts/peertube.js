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
		'peervideo.net',
	],
	attribution: false,
	detect: ({ hostname, pathname }) => {
		const [, route, , id] = pathname.split('/');
		if (route === 'videos') {
			return [hostname, id];
		}
	},
	handleLink(href, [hostname, id]) {
		const embed = `https://${hostname}/videos/embed/${id}`;
		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoplay=true`,
			fixedRatio: true,
		};
	},
});
