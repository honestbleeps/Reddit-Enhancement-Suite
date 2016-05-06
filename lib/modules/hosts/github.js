import { markdown } from 'snudown-js';
import { DAY, string } from '../../utils';
import { ajax } from '../../environment';

export default {
	moduleID: 'github',
	domains: ['gist.github.com'],
	logo: '//assets-cdn.github.com/favicon.ico',
	name: 'github gists',
	detect: href => (/^https?:\/\/gist\.github\.com\/(?:[\w-]+\/)?([a-z0-9]{20,}|\d+)/i).exec(href),
	async handleLink(elem, [, id]) {
		const info = await ajax({
			url: `https://api.github.com/gists/${id}`,
			type: 'json',
			cacheFor: DAY,
		});

		elem.type = 'TEXT';
		elem.imageTitle = info.description;
		elem.src = '';

		for (const filename in info.files) {
			const { content, language, truncated } = info.files[filename];

			elem.src += string.escapeHTML`<h5>${filename}:</h5>`;

			if (language === 'Markdown') {
				elem.src += markdown(content);
			} else {
				elem.src += string.escapeHTML`<pre><code>${content}</code></pre>`;
			}

			if (truncated) {
				elem.src += '<p>&lt;file truncated&gt;</p>';
			}
		}
	},
};
