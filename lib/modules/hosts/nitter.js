/* @flow */

import { Host } from '../../core/host';

export default new Host('nitter', {
	name: 'Nitter instance',
	domains: ['nitter.privacydev.net', 'nitter.poast.org'],
	detect: ({ href }) => (/^https?:\/\/(nitter\.privacydev\.net|nitter\.poast\.org)\/(?:#!\/)?[\w]+\/status\/?([\w]+)/i).exec(href),
	handleLink(href, [, host, post]) {
		return {
			type: 'IFRAME',
			embed: `https://${host}/i/status/${post}/embed`,
		};
	},
});