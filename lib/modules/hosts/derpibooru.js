addLibrary('mediaHosts', 'derpibooru', {
	name: 'Derpibooru',
	domains: ['derpiboo.ru'],
	matchRe: /^https?:\/\/(?:www\.)?derpiboo.ru\/\d+$/i,

	detect: function(href, _elem) {
		return modules['showImages'].siteModules['derpibooru'].matchRe.test(href);
	},

	handleLink: function(elem) {
		var def = $.Deferred();
		var apiURL = elem.href + '.json';
		RESEnvironment.ajax({
			method: 'GET',
			url: apiURL,
			onload: function(response) {
				var json;
				try {
					json = JSON.parse(response.responseText);
				} catch (error) {
					def.reject();
				}
				def.resolve(elem, json);
			},
			onerror: function(response) {
				def.reject();
			}
		});
		return def.promise();
	},

	handleInfo: function(elem, info) {
		elem.type = 'IMAGE';
		elem.src = info.image;

		return $.Deferred().resolve(elem).promise();
	}
});
