import { $ } from '../../vendor';

export default {
	moduleID: 'clyp',
	name: 'clyp',
	domains: ['clyp.it'],
	logo: '//d2cjvbryygm0lr.cloudfront.net/favicon.ico',
	detect(href, elem) {
		// reddit's expando is identical to ours, so ignore posts that have it
		return $(elem).closest('.entry').find('.expando-button.video:not(.commentImg)').length === 0 &&
			(/^https?:\/\/clyp\.it\/(playlist\/)?([A-Za-z0-9]+)/i).exec(href);
	},
	handleLink(elem, [, playlist, id]) {
		const urlBase = playlist ? '//clyp.it/playlist/' : '//clyp.it/';

		return {
			type: 'IFRAME',
			embed: `${urlBase}${id}/widget`,
			height: '160px',
			width: '100%',
		};
	},
};
