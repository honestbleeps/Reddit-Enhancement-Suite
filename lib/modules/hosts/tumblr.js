import { markdown } from 'snudown-js';

addLibrary('mediaHosts', 'tumblr', {
	domains: ['tumblr.com'],
	logo: '//secure.assets.tumblr.com/images/favicons/favicon.ico',
	detect: href => (/^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/(?:post|image)\/(\d+)(?:\/|$)/i).exec(href),
	async handleLink(elem, [, blog, id]) {
		await RESEnvironment.permissions.request('https://api.tumblr.com/v2/blog/*/posts?api_key=*&id=*');

		const APIKey = 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq';
		const { response } = await RESEnvironment.ajax({
			url: RESUtils.string.encode`https://api.tumblr.com/v2/blog/${blog}/posts?api_key=${APIKey}&id=${id}&filter=raw`,
			type: 'json'
		});

		const post = response.posts[0];

		function render(string) {
			return post.format === 'markdown' ?
				markdown(string) :
				string;
		}

		// Overwritten in some types
		elem.imageTitle = post.title;
		elem.caption = post.caption;
		elem.credits = `Posted by: <a href="${response.blog.url}">${response.blog.name}</a> @ Tumblr`;

		switch (post.type) {
			case 'photo':
				elem.type = post.photos.length > 1 ? 'GALLERY' : 'IMAGE';
				elem.src = post.photos.map(photo => ({
					src: photo.original_size.url,
					caption: photo.caption
				}));
				break;
			case 'text':
				elem.type = 'TEXT';
				elem.src = render(post.body);
				break;
			case 'quote':
				elem.type = 'TEXT';
				elem.credits = post.source;
				elem.src = `<blockquote><p>${render(post.text)}</p></blockquote>`;
				break;
			case 'link':
				elem.type = 'TEXT';
				elem.imageTitle = `<a href="${post.url}">${post.title}</a>`;
				elem.src = render(post.description);
				break;
			case 'chat':
				elem.type = 'TEXT';
				elem.src = post.dialogue.reduce((prev, { label, phrase }) => `${prev}<blockquote><p><b>${label}</b> ${phrase}</p></blockquote>`, '');
				break;
			case 'answer':
				elem.type = 'TEXT';
				let asking;
				if (post.asking_url) {
					asking = `<a href="${post.asking_url}">${post.asking_name}</a>`;
				} else {
					asking = post.asking_name;
				}
				elem.src = `<blockquote><p>${asking} sent: ${post.question}</p></blockquote>${render(post.answer)}`;
				break;
			default:
				throw new Error(`Unsupported post type: ${post.type}`);
		}
	}
});
