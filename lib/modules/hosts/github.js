/* @flow */

import { markdown } from 'snudown-js';
import { Host } from '../../core/host';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default new Host('github', {
	domains: ['gist.github.com'],
	logo: 'https://assets-cdn.github.com/favicon.ico',
	name: 'github gists',
	detect: ({ pathname }) => (/^\/(?:[\w-]+\/)?([a-z0-9]{20,}|\d+)/i).exec(pathname),
	async handleLink(href, [, id]) {
		const { files, description } = await ajax({
			url: `https://api.github.com/gists/${id}`,
			type: 'json',
			cacheFor: DAY,
		});

		let src = '';

		for (const [filename, { content, language, truncated }] of Object.entries(files)) {
			src += string.escape`<h5>${filename}:</h5>`;

			if (language === 'Markdown') {
				src += markdown(content);
			} else {
				src += string.escape`<pre><code>${content}</code></pre>`;
			}

			if (truncated) {
				src += '<p>&lt;file truncated&gt;</p>';
			}
		}

		return {
			type: 'TEXT',
			title: description,
			src,
		};
	},
});
