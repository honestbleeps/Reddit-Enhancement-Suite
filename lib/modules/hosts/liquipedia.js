/* @flow */

import $ from 'jquery';
import { Host } from '../../core/host';
import * as Metadata from '../../core/metadata';
import { ajax } from '../../environment';

const req = url => ajax({
	url,
	type: 'json',
	headers: {
		// See https://www.mediawiki.org/wiki/API:Main_page#Identifying_your_client
		'Api-User-Agent': `Reddit-Enhancement-Suite/${Metadata.version} ( ${Metadata.homepageURL} )`,
	},
});

export default new Host('liquipedia', {
	name: 'liquipedia',
	domains: ['liquipedia.net', 'wiki.teamliquid.net'],
	logo: 'https://liquipedia.net/commons/extensions/TeamLiquidIntegration/resources/favicon/favicon-196x196.png',
	detect: url => (url.pathname.startsWith('/') && {
		game: url.pathname.substr(1).split('/')[0],
		article: url.pathname.replace(`/${url.pathname.substr(1).split('/')[0]}/`, ''),
		hash: decodeURIComponent(url.hash.substr(1)),
	}),
	async handleLink(href, { game, article, hash }) {
		// Request sections
		const sectionsReq = await req(`https://liquipedia.net/${game}/api.php?action=parse&format=json&prop=sections&page=${article}&origin=*`);

		// If there's a hash, look up its section number
		const { index: sectionId = 0 } = hash && sectionsReq.prase.sections.find(({ anchor }) => anchor === hash) || {};

		const { parse: html } = await req(`https://liquipedia.net/${game}/api.php?action=parse&format=json&prop=text|displaytitle&section=${sectionId}&page=${article}&origin=*`);

		// Clean up returned html
		// DOMParser won't preload linked resources
		const cleanDoc = new DOMParser().parseFromString(html.text['*'], 'text/html');

		// Remove unwanted sections
		for (const e of cleanDoc.querySelectorAll('.ambox, .reference, .mw-references-wrap, .navbox, .tabs-static, .infobox-buttons, .fo-nttax-infobox-adbox, .navigation-not-searchable, .lp-icon')) {
			e.remove();
		}
		for (const e of cleanDoc.querySelectorAll('p > br')) {
			e.remove();
		}

		// Update all links to use the article's URL as baseURL
		for (const e of cleanDoc.querySelectorAll('a')) {
			e.href = new URL(e.getAttribute('href'), `https://liquipedia.net/${game}/${article}`).href;
		}

		// Update all images to use Liquipedia commons
		for (const e of cleanDoc.querySelectorAll('img')) {
			e.src = `https://liquipedia.net${e.getAttribute('src')}`;
		}

		return {
			type: 'TEXT',
			title: $('<div>', { html: html.displaytitle || html.title }).text(),
			src: cleanDoc.body.innerHTML,
		};
	},
});
