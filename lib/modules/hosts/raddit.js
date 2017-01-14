/* @flow */

import { Host } from '../../core/host';
import { CreateElement, insertParams } from '../../utils';

export default new Host('raddit', {
	name: 'radd.it',
	attribution: false,
	domains: ['radd.it'],
	options: {
		'show playlister toggle': {
			description: 'Show a toggle for radd.it embeds in subreddits with sidebar links to a raddit.com/r/subreddit playlist',
			value: true,
			type: 'boolean',
		},
		'always show sidebar playlister': {
			description: 'Always show the radd.it embed in the sidebar when applicable',
			value: false,
			type: 'boolean',
		},
	},
	detect: ({ href }) => (/^https?:\/\/(?:(?:www|m|embed)\.)?radd\.it(\/(?:search|r|user|comments|playlists)\/.+)/i).exec(href),
	handleLink(href, [, suffix]) {
		return {
			type: 'IFRAME',
			embed: insertParams(`https://radd.it${suffix}`, { embed: '1' }),
			height: '640px',
			width: '320px',
		};
	},
	go() {
		// check sidebar for radd.it links, add embedded player option to toolbar if found
		const radditLink: ?HTMLAnchorElement = (document.querySelector('.side .md a[href^="http://radd.it/r/"], .side .md a[href^="https://radd.it/r/"]'): any);
		if (radditLink) {
			const path: string = (radditLink.href.match(/https?:\/\/radd\.it(\/.*)/): any)[1];

			if (this.options['always show sidebar playlister'].value) {
				toggleSidebarPlaylist(path);
			}

			if (this.options['show playlister toggle'].value) {
				CreateElement.tabMenuItem({
					className: 'RES-raddit-embed',
					title: `show/hide radd.it${path} playlist in the sidebar`,
					text: 'playlister',
					checked: this.options['always show sidebar playlister'].value,
				}).addEventListener('change', () => { toggleSidebarPlaylist(path); });
			}
		}

		function toggleSidebarPlaylist(path) {
			const sb = document.querySelector('.side');
			let listr = document.querySelector('.side iframe.RES-raddit');

			if (listr) { // nix it if it exists.
				listr.remove();
			} else { // otherwise, create it.
				const width = window.getComputedStyle(sb).width;

				const src = `//radd.it${path}${path.includes('?') ? '&' : '?'}embed`;

				listr = document.createElement('iframe');
				listr.className = 'RES-raddit';
				listr.src = src;
				listr.width = width;
				listr.height = '640px';
				listr.style.marginBottom = '5px';
				sb.insertBefore(listr, sb.querySelector('.spacer'));
			}
		}
	},
});
