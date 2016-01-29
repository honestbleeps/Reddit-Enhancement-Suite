/**
 *
 * It's worth commenting here that this is essentially "reverse" support. There is
 * no support for inline expansion of 500px.com links in RES. This module "gives back
 * credit" to 500px.com authors when someone posts their image directly, by figuring
 * out the original 500px.com link and adding a caption / link to 500px.com
 *
 */
addLibrary('mediaHosts', 'fiveHundredPx', {
	domains: [ '500px.org', '500px.net', '500px.com' ],
	logo: '//assetcdn.500px.org/assets/favicon-1e8257b93fb787f8ceb66b5522ee853c.ico',
	regex: /^https?:\/\/\w*cdn\.500px\.(?:net|com|org)\/(?:photo\/)?([0-9]+)\//,
	detect: function(href, elem) {
		return this.regex.test(href);
	},
	handleLink: function(elem) {
		var def = $.Deferred(),
			siteMod = modules['showImages'].siteModules['fiveHundredPx'],
			photoId = elem.href.match(siteMod.regex);
		if (photoId) {
			def.resolve(elem, photoId[1]);
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, photoId) {
		elem.type = 'IMAGE';
		elem.src = elem.href.replace(/\/[0-9]+\.jpg$/, '/5.jpg');
		elem.credits = 'View original and details at: <a href="http://500px.com/photo/' + RESUtils.sanitizeHTML(photoId) + '">500px.com</a>';
		return $.Deferred().resolve(elem).promise();
	}
});
