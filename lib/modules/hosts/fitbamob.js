addLibrary('mediaHosts', 'fitbamob', {
	domains: ['fitbamob.com','offsided.com'],
	logo: 'http://offsided.com/static/e23c43a/images/favicon.ico',
	detect: function(href, elem) {
		return href.indexOf('fitbamob.com') !== -1 || href.indexOf('offsided.com') !== -1 ;
	},
	handleLink: function(elem) {
		var hashRe = /r\/[a-zA-Z0-9]+\/([a-zA-Z0-9]+[\/]*$)|b\/([a-zA-Z0-9]+[\/]*$)|v\/([a-zA-Z0-9]+[\/]*$)/i;
		var def = $.Deferred();
		var groups = hashRe.exec(elem.href);

		if (!groups) return def.reject();

		var link_id;
		if (typeof groups[1] !== 'undefined'){
			link_id = encodeURIComponent(groups[1]);
		} else if (typeof groups[2] !== 'undefined') {
			link_id = encodeURIComponent(groups[2]);
		} else {
			link_id = encodeURIComponent(groups[3]);
		}
		var apiURL = location.protocol + '//fitbamob.com/link/' + link_id + '/?format=json';

		RESEnvironment.ajax({
			method: 'GET',
			url: apiURL,
			aggressiveCache: true,
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
		var generate = function(options) {
			var template = RESTemplates.getSync('VideoUI');
			var video = {
				loop: true,
				autoplay: true, // fitbamob is gfycat-based, thus also muted / no audio, so autoplay is OK
				muted: true,
				brand: {
					'url': elem.href,
					'name': 'Fitbamob',
					'img': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAkCAYAAABxE+FXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAzFJREFUeNrsmHtojXEYx9/XGZKQ5rJcSi4ZMVJESrknt1yK8sdcllxCQikjiRkr4g+WESK3cp0tsfKHFCn3lQl/KCv+sGU222w7vk++Pz1+fud9T9uZ8wdPfXbO+b3veZ/fc/k9z3PmR6NRL1nSxkuipMgff2OJXksFy8FE0AG0xDU+aAQvwSnw1FyIHpzyU7mSseAy6JVgIyeD9SAb5PxmOaUfuAZ6BjykAXwATda6eKcd6E1rzVo56M5rsr4HVIIToM7EPA3sDFHs0X3pYAgYqhhMr1Wqe8WQPmCf9YxdIFNbPgqMi8N9GeCJ7FpZ6NETnUBXtRaxXnVODdLKU60vBp2O9DjjPIdu7+a41tGOuZ3VTYxxSyTN8tCfR81SXAXWgIdU7rdwA5Jsc0FuLOVa5KidTfBRewUWgNFhFe5jKxW0z/GU1wbvL0lSa/t/5X4CjlSzlUu5rOB5r2klXVXU8wVU63N+FdziZmpbSflS0JYG1mvl30nQUOA7Wmksb7ruq45V4bazAtWzHK4CD6y6n8+2GeQZaRinQZ5jXSpnD/ANnATHjXJZHKFuzrKUm16+Mg7LnznWpLZP53vZ/E2dcG/AV3XzTNP2lJTEobiOm7QlU72vNaXWKJcOVmq1wknWA16DshDl99jD7QFkqvpcZgZJo/wxKHYMk1oaeSqC5IZjbYJVQ4o5Df1KOEm0i2AbE85MItmq16fQgiLuvL3avDSjgWATuA7e8/4BYJFSLHou2EfNuKMArOXnYUweydLz6jTMCrBcNn8b3AHzQBejiFLA8Dlre47qu+LiS2AheM6pMyvE7XkcJMdzTBbLZ/BahZ7ZXcrL+WtF5AzYDYaD/oznshDlWxlPmYaPgk/UISV7hZ2MrjFKYrYaHKOLSvmldeAtuM+Z3MQ8wpiPofKR6lky0xeCLa5kTYlhQT4T6AVYwpjLBvbyIe9YpyPcgM8fHIUqpovBOXAAHAmaXl2yGdwFhxnvXMbSYxhcIlZv4PQrG5vN09GsYaKIMZd6vR9MC7m/L9jBfMkIUhxmuZEaJt4hMJ/jr7i4M2tCPXu0TL2PwBX27vDfz//sfyZ+CDAAXXm2zpHEcnIAAAAASUVORK5CYII='
				}
			};
			if (location.protocol === 'https:') {
				info.webm_url = info.webm_url.replace('http:','https:');
				info.mp4_url = info.mp4_url.replace('http:','https:');
			}
			video.sources = [
				{
					'source': info.mp4_url,
					'type': 'video/mp4'
				},
				{
					'source': info.webm_url,
					'type': 'video/webm'
				}
			];
			var element = template.html(video)[0];
			new MediaPlayer(element);
			return element;
		};

		elem.type = 'GENERIC_EXPANDO';
		elem.expandoClass = ' video';
		elem.expandoOptions = {
			generate: generate,
			media: info
		};

		return $.Deferred().resolve(elem).promise();
	}
});
