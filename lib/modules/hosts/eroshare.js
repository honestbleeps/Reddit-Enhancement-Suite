/* @flow */

import { Host } from '../../core/host';

export default new Host('eroshare', {
	name: 'eroshare',
	domains: ['eroshare.com'],
	logo: '//eroshare.com/favicon.ico',
	detect({ pathname, href }) {
		const slugRegex = /^\/((?:i\/)?[a-z0-9]{8})/i;
		const slugDirectLinkRegex = /^https?:\/\/i\.eroshare\.com\/([a-z0-9_]{8})([a-zA-Z_]+)?\.[a-z0-9]{1,4}/i;
		const slugMatch = slugRegex.exec(pathname);
		const slugDirectLinkMatch = slugDirectLinkRegex.exec(href);

		if(slugDirectLinkMatch){
			const url = "https://eroshare.com/i/" + slugDirectLinkMatch[1];
			return () => _handleSingleImage(href,url);
		}else if(slugMatch){
			return () =>  _handleAlbum(slugMatch[1]);
		}else{
			return false;
		}

		function _handleAlbum(slug){
			return {
				type: 'IFRAME',
				embed: `//eroshare.com/embed/${slug}`,
				width: '550px',
				height: '550px',
				fixedRatio: true,
			};
		}

		function _handleSingleImage(src,url){
			return {
				src: src,
				href: url,
				type: 'IMAGE'
			};
		}
	},
	handleLink(href, content) {
		return content();
	},
});
