import { markdown } from 'snudown-js';
import { Permissions, ajax } from '../../environment';

export default {
	moduleID: 'tumblr',
	name: 'tumblr',
	domains: ['tumblr.com'],
	logo: '//secure.assets.tumblr.com/images/favicons/favicon.ico',
	detect: href => (/^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/(?:post|image)\/(\d+)(?:\/|$)/i).exec(href),
	async handleLink(href, [, blog, id]) {
		await Permissions.request('https://api.tumblr.com/v2/blog/*/posts?api_key=*&id=*');

		const { response } = await ajax({
			url: `https://api.tumblr.com/v2/blog/${blog}/posts`,
			data: {
				api_key: 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq',
				id,
				filter: 'raw',
			},
			type: 'json',
		});

		const post = response.posts[0];

		function render(string) {
			return post.format === 'markdown' ?
				markdown(string) :
				string;
		}

		// Overwritten in some types
		const options = {
			title: post.title,
			caption: post.caption,
			credits: `Posted by: <a href="${response.blog.url}">${response.blog.name}</a> @ Tumblr`,
		};

		switch (post.type) {
			case 'photo':
				options.type = 'GALLERY';
				options.src = post.photos.map(photo => ({
					type: 'IMAGE',
					src: photo.original_size.url,
					caption: photo.caption,
				}));
				break;
			case 'text':
				options.type = 'TEXT';
				options.src = render(post.body);
				break;
			case 'quote':
				options.type = 'TEXT';
				options.credits = post.source;
				options.src = `<blockquote><p>${render(post.text)}</p></blockquote>`;
				break;
			case 'link':
				options.type = 'TEXT';
				options.title = `<a href="${post.url}">${post.title}</a>`;
				options.src = render(post.description);
				break;
			case 'chat':
				options.type = 'TEXT';
				options.src = post.dialogue.reduce((prev, { label, phrase }) => `${prev}<blockquote><p><b>${label}</b> ${phrase}</p></blockquote>`, '');
				break;
			case 'answer':
				options.type = 'TEXT';
				let asking;
				if (post.asking_url) {
					asking = `<a href="${post.asking_url}">${post.asking_name}</a>`;
				} else {
					asking = post.asking_name;
				}
				options.src = `<blockquote><p>${asking} sent: ${post.question}</p></blockquote>${render(post.answer)}`;
				break;
			default:
				throw new Error(`Unsupported post type: ${post.type}`);
		}

		return options;
	},
};
