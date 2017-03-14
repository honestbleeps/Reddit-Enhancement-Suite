/* @flow */

import { markdown } from 'snudown-js';
import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('tumblr', {
	name: 'tumblr',
	domains: ['tumblr.com'],
	permissions: ['https://api.tumblr.com/v2/blog/*/posts?api_key=*&id=*'],
	logo: '//secure.assets.tumblr.com/images/favicons/favicon.ico',
	detect({ hostname, pathname }) {
		const pathMatch = (/^\/(?:post|image)\/(\d+)(?:\/|$)/i).exec(pathname);
		return pathMatch && [hostname, pathMatch[1]];
	},
	async handleLink(href, [blog, id]) {
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

		const defaults = {
			title: post.title,
			caption: post.caption,
			credits: `Posted by: <a href="${response.blog.url}">${response.blog.name}</a> @ Tumblr`,
		};

		switch (post.type) {
			case 'photo':
				if (!post.photos.length) throw new Error('No images in gallery.');
				return {
					type: 'GALLERY',
					...defaults,
					src: post.photos.map(photo => ({
						type: 'IMAGE',
						src: photo.original_size.url,
						caption: photo.caption,
						href,
					})),
				};
			case 'text':
				return {
					type: 'TEXT',
					...defaults,
					src: render(post.body),
				};
			case 'quote':
				return {
					type: 'TEXT',
					...defaults,
					credits: post.source,
					src: `<blockquote><p>${render(post.text)}</p></blockquote>`,
				};
			case 'link':
				return {
					type: 'TEXT',
					...defaults,
					title: `<a href="${post.url}">${post.title}</a>`,
					src: render(post.description),
				};
			case 'chat':
				return {
					type: 'TEXT',
					...defaults,
					src: post.dialogue.reduce((prev, { label, phrase }) => `${prev}<blockquote><p><b>${label}</b> ${phrase}</p></blockquote>`, ''),
				};
			case 'answer':
				const asking = post.asking_url ?
					`<a href="${post.asking_url}">${post.asking_name}</a>` :
					post.asking_name;

				return {
					type: 'TEXT',
					...defaults,
					src: `<blockquote><p>${asking} sent: ${post.question}</p></blockquote>${render(post.answer)}`,
				};
			default:
				throw new Error(`Unsupported post type: ${post.type}`);
		}
	},
});
