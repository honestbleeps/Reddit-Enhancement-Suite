import { ajax } from '../../environment';
import { $ } from '../../vendor';

export default {
	moduleID: 'wikipedia',
	name: 'wikipedia',
	domains: ['wikipedia.org', 'wikipedia.com'],
	logo: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
	detect: url => {
		return {
			article: url.pathname.substr(6), // remove "/wiki/"
			language: url.host.split('.')[0],
			hash: url.hash.substr(1),
		};
	},
	async handleLink(href, { language, article, hash }) {
		// default to section 0
		let sectionId = 0;

		// If we have a hash, try and look up its section number
		if (hash !== '') {
			const sections = await ajax({
				url: `https://${language}.wikipedia.org/w/api.php?action=parse&format=json&prop=sections&page=${article}&origin=*`,
				type: 'json',
				headers: {
					// See https://www.mediawiki.org/wiki/API:Main_page#Identifying_your_client
					'Api-User-Agent': 'Reddit-Enhancement-Suite/5.0 ( https://github.com/honestbleeps/Reddit-Enhancement-Suite/ )',
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
				'Api-User-Agent': 'Reddit-Enhancement-Suite/5.0 ( https://github.com/honestbleeps/Reddit-Enhancement-Suite/ )',
			},
		});

		// Clean up returned data
		const $wikiData = $('<div>', { html: data.parse.text['*'] });
		// Remove unwanted sections
		$wikiData.find('.metadata, .hatnote, .mw-editsection').remove();
		// Make all relative links direct
		$wikiData.find('a[href^="/"]').attr('href', (i, old) => `https://${language}.wikipedia.org${old}`);

		return {
			type: 'TEXT',
			title: $(data.parse.displaytitle || data.parse.title).text(),
			src: $wikiData[0].outerHTML,
		};
	},
};
