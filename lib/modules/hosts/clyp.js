addLibrary('mediaHosts', 'clyp', {
	domains: ['clyp.it'],
	detect(href, elem) {
		// reddit's expando is identical to ours, so ignore posts that have it
		return $(elem).closest('.entry').find('.expando-button.video:not(.commentImg)').length === 0 &&
			(/^https?:\/\/clyp\.it\/(playlist\/)?([A-Za-z0-9]+)/i).exec(href);
	},
	handleLink(elem, [, playlist, id]) {
		const urlBase = playlist ? '//clyp.it/playlist/' : '//clyp.it/';

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `${urlBase}${id}/widget`);
		elem.setAttribute('data-height', '160px');
		elem.setAttribute('data-width', '100%');
	}
});
