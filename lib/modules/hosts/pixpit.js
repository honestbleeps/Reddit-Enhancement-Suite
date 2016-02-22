addLibrary('mediaHosts', 'pixpit', {
	domains: [ 'pixpit.com'],
	name: 'PixPit',
	apiUrl: 'http://www.pixpit.com/api/v1/image/url/',
	detect: function(href, elem) {
		return href.indexOf('pixpit.com/pic/') !== -1;
	},
	_api: function(endpoint){
		var def = $.Deferred();

		RESEnvironment.ajax({
			method: 'GET',
			url: this.apiUrl + endpoint,

			onload: function(response) {
				try {
					if (response.status === 404) {
						def.reject(response, "not found");
					} else {
						def.resolve(response.responseText);
					}
				} catch (error) {
					def.reject(error);
				}
			},
			onerror: function(response) {
				def.reject(response);
			}
		});

		return def.promise();
	},

	handleLink: function(elem) {
		var siteMod = modules['showImages'].siteModules['pixpit'],
		def,
		id;

		id = elem.href.split('/pic/')[1].split('/')[0];

		def = siteMod._api(id);

		if (def) {
			def = def.then(function(info) {
				return $.Deferred().resolve(elem, info).promise();
			});
		} else {
			def = $.Deferred().reject();
		}
		return def.promise();
	},

	handleInfo: function(elem, info) {
		var def = $.Deferred();

		elem.type = "IMAGE";
		elem.src = info
		def.resolve(elem, info);

		return def;
	}
});
