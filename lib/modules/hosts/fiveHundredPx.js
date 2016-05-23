/**
 *
 * It's worth commenting here that this is essentially "reverse" support. There is
 * no support for inline expansion of 500px.com links in RES. This module "gives back
 * credit" to 500px.com authors when someone posts their image directly, by figuring
 * out the original 500px.com link and adding a caption / link to 500px.com
 *
 */
export default {
	moduleID: 'fiveHundredPx',
	name: 'fiveHundredPx',
	domains: ['500px.org', '500px.net', '500px.com'],
	logo: '//assetcdn.500px.org/assets/favicon-1e8257b93fb787f8ceb66b5522ee853c.ico',
	detect: href => (/^https?:\/\/\w*cdn\.500px\.(?:net|com|org)\/(?:photo\/)?([0-9]+)\//).exec(href),
	handleLink(href, [, photoId]) {
		return {
			type: 'IMAGE',
			src: href.replace(/\/[0-9]+\.jpg$/, '/5.jpg'),
			credits: `View original and details at: <a href="http://500px.com/photo/${photoId}">500px.com</a>`,
		};
	},
};
