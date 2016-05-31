import * as ShowImages from '../showImages';
import { CreateElement, insertParam } from '../../utils';

export default {
	moduleID: 'raddit',
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
			embed: insertParam(`https://radd.it${suffix}`, 'embed', '1'),
			height: '640px',
			width: '320px',
		};
	},
	go() {
		if (ShowImages.module.options['display radd.it'].value === false) return;

		// check sidebar for radd.it links, add embedded player option to toolbar if found
		const radditLink = document.querySelector('.side .md a[href^="http://radd.it/r/"], .side .md a[href^="https://radd.it/r/"]');
		if (radditLink) {
			const path = radditLink.href.match(/https?:\/\/radd\.it(\/.*)/)[1];

			if (ShowImages.module.options['always show sidebar playlister'].value) {
				this.toggleSidebarPlaylist(path);
			}

			if (ShowImages.module.options['show playlister toggle'].value) {
				this.addPlaylisterToggle(path);
			}
		}
	},
	addPlaylisterToggle(path) {
		if (ShowImages.module.options['show playlister toggle'].value === false) return;

		CreateElement.tabMenuItem({
			className: 'RES-raddit-embed',
			title: `show/hide radd.it${path} playlist in the sidebar`,
			text: 'playlister',
			checked: ShowImages.module.options['always show sidebar playlister'].value,
		}).checkbox.addEventListener('change', () => { this.toggleSidebarPlaylist(path); });
	},
	toggleSidebarPlaylist(path) {
		const sb = document.querySelector('.side');
		let listr = document.querySelector('.side iframe.RES-raddit');

		if (listr) {
			sb.removeChild(listr);		// nix it if it exists.
		} else {						// otherwise, create it.
			const width = window.getComputedStyle(sb).width;

			const src = `//radd.it/${path}${path.includes('?') ? '&' : '?'}embed`;

			listr = document.createElement('iframe');
			listr.className = 'RES-raddit';
			listr.src = src;
			listr.width = width;
			listr.height = '640px';
			listr.style.marginBottom = '5px';
			sb.insertBefore(listr, sb.querySelector('.spacer'));
		}
	},
};
