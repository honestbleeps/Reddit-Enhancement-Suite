import { string } from '../../utils';

export default {
	moduleID: 'soundcloud',
	name: 'soundcloud',
	domains: ['soundcloud.com'],
	logo: 'https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14b.ico',
	detect: () => true,
	handleLink(href) {
		return {
			type: 'IFRAME',
			embed: string.encode`https://w.soundcloud.com/player/?url=${href}`,
			height: '166px',
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
};
