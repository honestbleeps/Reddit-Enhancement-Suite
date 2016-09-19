import * as Metadata from '../../core/metadata';
import { ajax } from '../../environment';
import { $ } from '../../vendor';

export default {
	moduleID: 'wikipedia',
	name: 'wikipedia',
	domains: ['wikipedia.org', 'wikipedia.com'],
	logo: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
	detect: url => (url.pathname.startsWith('/wiki/') && {
		article: url.pathname.substr(6), // remove "/wiki/"
		language: url.host.split('.')[0],
		hash: url.hash.substr(1),
	}),
	async handleLink(href, { language, article, hash }) {
		// default to section 0
		let sectionId = 0;

		// Fix links with a www, or no lang code. These default to en
		if (language === 'www' || language === 'wikipedia') language = 'en';

		// If we have a hash, try and look up its section number
		if (hash !== '') {
			const sections = await ajax({
				url: `https://${language}.wikipedia.org/w/api.php?action=parse&format=json&prop=sections&page=${article}&origin=*`,
				type: 'json',
				headers: {
					// See https://www.mediawiki.org/wiki/API:Main_page#Identifying_your_client
					'Api-User-Agent': `Reddit-Enhancement-Suite/${Metadata.version} ( ${Metadata.homepageURL} )`,
				},
			});

			// search sections & attempt to find a matching one
			for (const section of sections.parse.sections) {
				if (section.anchor === hash) {
					sectionId = section.index;
					break;
				}
			}
		}

		// Grab data
		const data = await ajax({
			url: `https://${language}.wikipedia.org/w/api.php?action=parse&format=json&prop=text|displaytitle&section=${sectionId}&page=${article}&origin=*`,
			type: 'json',
			headers: {
				// See https://www.mediawiki.org/wiki/API:Main_page#Identifying_your_client
				'Api-User-Agent': `Reddit-Enhancement-Suite/${Metadata.version} ( ${Metadata.homepageURL} )`,
			},
		});

		// Clean up returned data
		const $wikiData = $('<div>', { html: data.parse.text['*'] });
		// Remove unwanted sections
		$wikiData.find('.metadata, .hatnote, .mw-editsection, .reference, .references').remove();
		// Make all relative links direct
		$wikiData.find('a[href^="/"]').attr('href', (i, old) => `https://${language}.wikipedia.org${old}`);
		// Prepend wikipedia logo to make clear it is a wikipedia article
		$wikiData.prepend('<img src="https://en.wikipedia.org/static/favicon/wikipedia.ico" alt="Hosted on wikipedia" title="Hosted on wikipedia">')

		return {
			type: 'TEXT',
			title: $('<div>', { html: data.parse.displaytitle || data.parse.title }).text(), // get title without html (jquery got quite unhappy when brackets appeared)
			src: $wikiData[0].outerHTML,
		};
	},
};
