/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { escapeHTML } from '../../utils';

export default new Host('xkcd', {
	name: 'xkcd',
	domains: ['xkcd.com'],
	permissions: ['https://xkcd.com/*/info.0.json'],
	logo: 'https://xkcd.com/favicon.ico',
	detect: ({ hostname, pathname }) => (
		// primarily to exclude what-if.xkcd.com
		['xkcd.com', 'www.xkcd.com'].includes(hostname) &&
		(/^\/([0-9]+)(?:\/|$)/i).exec(pathname)
	),
	async handleLink(href, [, id]) {
		const { title, alt, img } = await ajax({
			url: `https://xkcd.com/${id}/info.0.json`,
			type: 'json',
		});

		return {
			type: 'IMAGE',
			title,
			caption: escapeHTML(
				// The XKCD API is broken for unicode characters which are multibyte in utf8,
				// in that it escapes each byte individually (bytes are not codepoints!).
				// For example, ↘ is code point 0x2198, which is `E2 86 98` in utf8 bytes,
				// so the API returns `\u00e2\u0086\u0098`.
				// Luckily (?) the `escape` function also doesn't understand multibyte characters,
				// so it cancels out the bug.
				decodeURIComponent(escape(alt))
			),
			src: img,
		};
	},
});
