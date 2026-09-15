/* @flow */

import { Host } from '../../core/host';

export default new Host('github', {
	name: 'GitHub',
	domains: ['github.com'],
	attribution: false, // shown in embed
	// Match /user/repo only as nothing can do with user alone.
	detect: ({ hostname, pathname }) => hostname !== 'gist.github.com' && (/^\/([\w\-\_\.]+)\/([\w\-\_\.]+)/i).exec(pathname),
	handleLink(href, [, user, repo]) {
		return {
			type: 'IMAGE',
			src: `https://opengraph.githubassets.com/res/${user}/${repo}`,
		};
	},
});
