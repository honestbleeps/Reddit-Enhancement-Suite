modules['showImages'].siteModules['futurism'] = {
	name: 'futurism',
	domains: ['futurism.co'],
	detect: function(href, elem) {
		console.log("Detected futurism link")
		if (href.indexOf('futurism.co/wp-content/uploads') !== -1) {
			console.log("Valid futurism link")
			return true;
		}
		return false;
	},
	handleLink: function(elem) {

		var def = $.Deferred();
		var apiURL = 'http://www.futurism.co/wp-content/themes/futurism/res.php?url=' + encodeURIComponent(elem.href);

		BrowserStrategy.ajax({
			method: 'GET',
			url: apiURL,
			onload: function(response) {
				try {
					var json = JSON.parse(response.responseText);
					def.resolve(elem, json);
				} catch (error) {
					console.error("Something went wrong parsing JSON: " + error);
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
		elem.href = info['data']['image_link']
		elem.href = info['data']['routing_link']

		return $.Deferred().resolve(elem).promise();
	}
};
