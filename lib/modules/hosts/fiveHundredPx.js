/**
 *
 * It's worth commenting here that this is essentially "reverse" support. There is
 * no support for inline expansion of 500px.com links in RES. This module "gives back
 * credit" to 500px.com authors when someone posts their image directly, by figuring
 * out the original 500px.com link and adding a caption / link to 500px.com
 *
 */
modules['showImages'].siteModules['fiveHundredPx'] = {
	domains: ['ppcdn.500px.org', 'pcdn.500px.net'],
	detect: function(href, elem) {
		return (/pcdn\.500px\.(?:org|net)/).test(elem.href);
	},
	handleLink: function(elem) {
		var def = $.Deferred(),
			photoId = elem.href.match(/pcdn\.500px\.(?:net|com|org)\/([0-9]+)\//);
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
};
