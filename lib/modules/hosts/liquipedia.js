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
	domains: ['wiki.teamliquid.net', 'liquipedia.net'],
	logo: 'https://liquipedia.net/commons/extensions/TeamLiquidIntegration/resources/favicon/favicon-196x196.png',
	detect: url => (url.pathname.startsWith('.net/') && {
		game: url.host.split('/')[1],
		article: url.host.split('/')[2],
		hash: decodeURIComponent(url.hash.substr(1)),
	}),
	async handleLink(href, { game, article, hash }) {
		// If there's a hash, look up its section number
		const { index: sectionId = 0 } = hash && (await req(`https://liquipedia.net/${game}/api.php?action=parse&format=json&prop=sections&page=${article}&origin=*`)).parse.sections.find(({ anchor }) => anchor === hash) || {};

		const { parse: html } = await req(`https://liquipedia.net/${game}/api.php?action=parse&format=json&prop=text|displaytitle&section=${sectionId}&page=${article}&origin=*`);

		// Clean up returned html
		// DOMParser won't preload linked resources
		const cleanDoc = new DOMParser().parseFromString(html.text['*'], 'text/html');

		// Remove unwanted sections
		for (const e of cleanDoc.querySelectorAll('.metadata, .hatnote, .mw-editsection, .mwe-math-mathml-inline, .reference, .references')) e.remove();

		// Update all links to use the article's URL as baseURL
		for (const e of cleanDoc.querySelectorAll('a')) {
			e.href = new URL(e.getAttribute('href'), `https://liquipedia.net/${game}/${article}`).href;
		}

		return {
			type: 'TEXT',
			title: $('<div>', { html: html.displaytitle || html.title }).text(), // get title without html (jquery got quite unhappy when brackets appeared)
			src: cleanDoc.body.innerHTML,
		};
	},
});
