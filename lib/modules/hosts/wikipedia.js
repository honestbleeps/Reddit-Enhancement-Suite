import { ajax } from '../../environment';
import { $ } from '../../vendor';

export default {
	moduleID: 'wikipedia',
	name: 'wikipedia',
	domains: ['wikipedia.org','wikipedia.com'],
	logo: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
	detect: ({ href }) => (/^https?:\/\/([A-z]{2}|simple)?\.(?:m\.)?wikipedia\.(?:com|org)\/wiki\/([^#\?]+)/i).exec(href),
	async handleLink(href, [, country, article]) {

		const data = await ajax({
			url: `https://${country}.wikipedia.org/w/api.php?action=parse&format=json&prop=text|displaytitle&section=0&page=${article}&origin=*`,
			type: 'json',
			headers: {
				// See https://www.mediawiki.org/wiki/API:Main_page#Identifying_your_client
				'Api-User-Agent': 'Reddit-Enhancement-Suite/5.0 ( https://github.com/honestbleeps/Reddit-Enhancement-Suite/ )',
				'Origin': '*',
				'Content-Type': 'application/json; charset=utf-8',
			}
		});

		// Clean up returned data
		const wikiData = $(`<div>${data.parse.text['*']}</div>`);
		// Remove unwanted sections
		wikiData.find('.metadata, .hatnote').remove();
		// Make all relative links direct
		wikiData.find('a[href^="/"]').attr('href', (i, old) => {
			return `https://${country}.wikipedia.org${old}`;
		});

		return {
			type: 'TEXT',
			title: $(data.parse.displaytitle || data.parse.title).text(),
			src: wikiData[0].outerHTML,
		};
	},
};
