addLibrary('mediaHosts', 'futurism', {
	name: 'futurism',
	attribution: false,
	domains: ['futurism.com', 'futurism.co'],
	detect: function(href, elem) {
		return href.indexOf('futurism.co') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var apiURL = 'http://www.futurism.com/wp-content/themes/futurism/res.php?url=' + encodeURIComponent(elem.href);
		if (elem.href.indexOf('wp-content/uploads') !== -1) {
			apiURL += '&reverse=true';
		}

		RESEnvironment.ajax({
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
		elem.src = info['data']['image_link'];

		return $.Deferred().resolve(elem).promise();
	}
});
