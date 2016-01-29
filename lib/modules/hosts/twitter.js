addLibrary('mediaHosts', 'twitter', {
	domains: [ 'twitter.com' ],
	attribution: false,
	detect: function(href, elem) {
		return href.indexOf('twitter.com/') !== -1 && href.indexOf('/status') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred(),
			hashRe = /^https?:\/\/(?:mobile\.)?twitter\.com\/(?:#!\/)?[\w]+\/status(?:es)?\/([\d]+)/i,
			groups = hashRe.exec(elem.href);

		if (groups) {
			def.resolve(elem, 'https://api.twitter.com/1/statuses/oembed.json?id=' + groups[1]);
		} else {
			def.reject();
		}

		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'GENERIC_EXPANDO';
		elem.expandoClass = ' selftext twitter';
		// twitter expandos in Chrome must be opened by a user action so we can ask for permissions
		// https://developer.chrome.com/extensions/permissions#request
		elem.doNotExpandInSelfText = BrowserDetect.isChrome();
		elem.expandoOptions = {
			generate: function() {
				var expando = RESUtils.createElement('div', '', 'expando');

				function getTweet(omitScript) {
					RESEnvironment.ajax({
						method: 'GET',
						url: info + (omitScript ? '&omit_script=true' : ''),
						onload: function(response) {
							if (response.status === 200) {
								try {
									var json = JSON.parse(response.responseText);
									$(expando).html(json.html);
								} catch (error) {
									fail();
								}
							} else {
								fail();
							}
						}
					});
				}
				function fail() {
					$(expando).html('<span class="error">Error loading tweet.</span>');
				}

				if (BrowserDetect.isChrome()) {
					// first, we need to see if we have permissions for the twitter API...
					var permissionsJSON = {
						requestType: 'permissions',
						callbackID: permissionQueue.count,
						data: {
							origins: ['https://api.twitter.com/*']
						}
					};
					// save a function call that'll run the expando if our permissions request
					// comes back with a result of true
					permissionQueue.onloads[permissionQueue.count] = function(hasPermission) {
						if (hasPermission) {
							getTweet();
						} else {
							fail();
						}
					};
					permissionQueue.count++;

					// we do a noop in the callback here because we can't actually get a
					// response - there's multiple async calls going on...
					chrome.runtime.sendMessage(permissionsJSON, function(response) {});
				} else if (BrowserDetect.isFirefox()) {
					// we've got a jetpack extension, hit up the background page...
					// we have to omit the script tag and all of the nice formatting it brings us in Firefox
					// because AMO does not permit externally hosted script tags being pulled in from
					// oEmbed like this...
					getTweet(true);
				} else {
					getTweet();
				}

				return expando;
			},
			media: info
		};

		return $.Deferred().resolve(elem).promise();
	}
});
