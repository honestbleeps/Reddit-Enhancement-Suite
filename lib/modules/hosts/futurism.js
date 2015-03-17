modules['showImages'].siteModules['futurism'] = {
	name: 'futurism',
	domains: ['futurism.co'],
	detect: function(href, elem) {
		if (href.indexOf('futurism.co/wp-content/uploads') !== -1) {
			return true;
		}
		return false;
	},
	handleLink: function(elem) {

		var def = $.Deferred();
		var apiURL = 'http://www.futurism.co/wp-content/themes/futurism/res.php?url=' + encodeURIComponent(elem.href);

		RESUtils.runtime.ajax({
			method: 'GET',
			url: apiURL,
			onload: function(response) {
				try {
					var json = JSON.parse(response.responseText);
					def.resolve(elem, json);
				} catch (error) {
					def.reject();
				}
			},
			onerror: function(response) {
				def.reject();
			}
		});

		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IMAGE';
		elem.src = info['data']['image_link']
		elem.href = info['data']['routing_link']

		return $.Deferred().resolve(elem).promise();
	}
};
