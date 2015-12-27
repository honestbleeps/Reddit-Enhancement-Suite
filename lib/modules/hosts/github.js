addLibrary('mediaHosts', 'github', {
	domains: ['gist.github.com'],
	name: 'github gists',
	detect: href => (/^https?:\/\/gist\.github\.com\/(?:[\w-]+\/)?([a-z0-9]{20,}|\d+)/i).exec(href),
	async handleLink(elem, [, id]) {
		const info = await RESEnvironment.ajax({
			url: `https://api.github.com/gists/${id}`,
			type: 'json',
			aggressiveCache: true
		});

		elem.type = 'TEXT';
		elem.imageTitle = info.description;
		elem.src = '';

		for (const filename in info.files) {
			const { content, language, truncated } = info.files[filename];

			elem.src += RESUtils.string.escapeHTML`<h5>${filename}:</h5>`;

			if (language === 'Markdown') {
				elem.src += Snudown.markdown(content);
			} else {
				elem.src += RESUtils.string.escapeHTML`<pre><code>${content}</code></pre>`;
			}

			if (truncated) {
				elem.src += '<p>&lt;file truncated&gt;</p>';
			}
		}

		return elem;
	}
});
