/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { DAY } from '../../utils';

export default new Host('github', {
	name: 'GitHub',
	domains: ['github.com'],
	attribution: false, // shown in embed
	// Match /user/repo only as nothing can do with user alone.
	detect: ({ pathname }) => (/^\/([\w\-\_]+)\/([\w\-\_]+)/i).exec(pathname),
	async handleLink(href, [, user, repo]) {
		return {
			type: 'IMAGE',
			src: `https://opengraph.githubassets.com/res/${user}/${repo}`,
		};
	},
});
