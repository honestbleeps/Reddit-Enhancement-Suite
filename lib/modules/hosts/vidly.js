modules['showImages'].siteModules['vidly'] = {
	domains: ['vidly.io'],
	matchRE: /^https?:\/\/(?:www\.)?vidly\.io\/([\w]+)/i,
	detect: function(href, elem) {
		return href.indexOf('vidly.io') !== -1 || href.indexOf('https://vidly.io') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/(?:www\.)?vidly\.io\/([\w]+)/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			var input = groups['input'];
			var splinput = input.split('/');
			var apiURL = 'https://vidly.io/media/' + splinput[splinput.length - 1];
			RESUtils.runtime.ajax({
				method: 'GET',
				url: apiURL,
				onload: function(response) {
					try {
						var json = JSON.parse(response.responseText);
						if (json && json.length > 0 && json[0]['outputs']) {
							var outputs = json[0]['outputs'];
							def.resolve(elem, outputs);
						} else {
							def.reject();
						}
					} catch (error) {
						def.reject();
					}
				},
				onerror: function(response) {
					def.reject();
				}
			});
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'VIDEO';
		elem.expandoOptions = {
			autoplay: false,
			loop: false
		};
		var sources = [{
			file: info,
			type: 'video/mp4'
		}];
		$(elem).data('sources', sources);
		return $.Deferred().resolve(elem).promise();
	}
};
