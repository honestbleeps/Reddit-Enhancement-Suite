addLibrary('mediaHosts', 'graphiq', {
	domains: [ 'graphiq.com' ],

	detect: function(href, elem) {
		return !!href.match(/graphiq.com\/(?:w\/|wlp\/)/);
	},

	handleLink: function(elem) {
		var def = $.Deferred();
		var oembedEndpoint = 'https://oembed.graphiq.com/services/oembed';
		var vizEndpoint = 'https://www.graphiq.com/w/';
		RESEnvironment.ajax({
			method: 'GET',
			url: oembedEndpoint + '?url=' + encodeURIComponent(elem.href),
			aggressiveCache: true,
			onload: function(response) {
				if (response.status === 200) {
					var json = JSON.parse(response.responseText);
					var wid = elem.href.match(/graphiq.com\/(?:w\/|wlp\/)(\w{10,11})/)[1];
					json._url = vizEndpoint + wid;
					def.resolve(elem, json);
				} else {
					def.reject();
				}
			},
			onerror: function(error) {
				def.reject();
			}
		});

		return def.promise();
	},

	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info._url);
		elem.setAttribute('data-width', info.width);
		elem.setAttribute('data-height', info.height);
		return $.Deferred().resolve(elem).promise();
	}
});
