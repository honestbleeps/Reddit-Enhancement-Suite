import { $ } from '../../vendor';
import { ajax } from '../../environment';
import { string } from '../../utils';

export default {
	moduleID: 'soundcloud',
	name: 'soundcloud',
	domains: ['soundcloud.com'],
	logo: 'https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14b.ico',
	detect: () => true,
	async handleLink(href) {
		const src = string.encode`https://w.soundcloud.com/player/?url=${href}`;		
		return {
			type: 'IFRAME',
			embed: src,
			height: '124px',
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
};
