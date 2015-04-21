modules['showImages'].siteModules['onedrive'] = {
	domains: [ 'onedrive.live.com', '1drv.ms' ],
	name: 'Microsoft OneDrive',
	videoDetect: document.createElement('VIDEO'),
	audioDetect: document.createElement('AUDIO'),
	// Returns true/false to indicate whether the siteModule will attempt to handle the link.
	// The only parameters are the actual URL and the anchor element.
	detect: function(href, elem) {
		return href.indexOf('onedrive.live.com/') !== -1 || href.indexOf('1drv.ms/') !== -1;
	},

	handleLink: function (elem) {
		var def = $.Deferred();

		var siteMod = modules['showImages'].siteModules['onedrive'];


		if (elem.href.indexOf('1drv.ms/') !== -1) {
			// Remove the protocol.
			var href = elem.href.replace(/https?:\/\//, '');
			RESUtils.runtime.ajax({
				method: 'GET',
				url: 'https://1.utilities.space/api/longurl/' + href,
				aggressiveCache: true,
				onload: function(response) {
					siteMod.fetchJson(elem, response.responseText, def);
				},
				onerror: function(response) {
					def.reject();
				}
			});
		} else {
			siteMod.fetchJson(elem, elem.href, def);
		}

		return def.promise();
	},

	fetchJson: function (elem, href, def) {
		var hashRe = /(?:resid=|&id=)([a-z0-9!%]+)(?:.*&authkey=([a-z0-9%!_-]+)|)/i;
		var groups = hashRe.exec(href);

		if (!groups) return def.reject();

		var resId = decodeURIComponent(groups[1]);
		var authKey = decodeURIComponent(groups[2]);

		var siteMod = modules['showImages'].siteModules['onedrive'];

		var apiURL = 'https://api.onedrive.com/v1.0/drive/items/' + resId + (authKey != null ? '?authKey=' + authKey : '');

		RESUtils.runtime.ajax({
			method: 'GET',
			url: apiURL,
			aggressiveCache: true,
			onload: function(response) {
				try {
					var json = JSON.parse(response.responseText);
					// An error happened, reject.
					if (json.error !== undefined) return def.reject();

					// The link is a folder, get its content instead.
					if (json.folder !== undefined) {
						var folderUrl = 'https://api.onedrive.com/v1.0/drive/items/' + resId + '/children' + (authKey != null ? '?authKey=' + authKey : '');


						RESUtils.runtime.ajax({
							method: 'GET',
							url: folderUrl,
							aggressiveCache: true,
							onload: function(folderResponse) {
								var folderJson = JSON.parse(folderResponse.responseText);
								// An error happend this time, reject.
								if (json.error !== undefined) return def.reject();

								json.files = folderJson.value;
								def.resolve(elem, json);
							},
							onerror: function(folderResponse) {
								def.reject();
							}
						});


					} else {
						// Check if the file is a video, if that's the case, check if we can play it.
						if (json.video !== undefined) {
							if (siteMod.videoDetect.canPlayType(json.file.mimeType) == '') {
								def.reject();
							}
						} else if (json.audio !== undefined) {
							if (siteMod.audioDetect.canPlayType(json.file.mimeType) == '') {
								def.reject();
							}
						}

						def.resolve(elem, json);
					}
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

	// This is where the embedding information is added to the link.
	// handleInfo sits in the Deferred chain after handleLink
	// and should receive both the element and a data object from handleLink.
	// The first parameter should the same anchor element passed to handleLink.
	// The second parameter should be module-specific data.
	// A new $.Deferred object should be created and resolved/rejected as necessary and then returned.
	// If resolving, the element should be passed.
	handleInfo: function(elem, info) {
		var def = $.Deferred();

		if (info.files == undefined) {

			var type = info.file.mimeType.substring(0, info.file.mimeType.indexOf('/'));

			switch (type) {
			case 'video':
				elem.expandoOptions = {
					autoplay: false,
					loop: false
				};

				var sources = [{
					'file': info['@content.downloadUrl'],
					'type': info.file.mimeType
				}];

				elem.type = 'VIDEO';
				$(elem).data('sources', sources);

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				def.resolve(elem);
				break;
			case 'image':
				elem.type = 'IMAGE';
				elem.src = info['@content.downloadUrl'];

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				def.resolve(elem);
				break;
			case 'audio':
				elem.expandoOptions = {
					autoplay: true,
					loop: false
				};
				var sources = [{
					'file': info['@content.downloadUrl'],
					'type': info.file.mimeType
				}];

				elem.type = 'AUDIO';
				$(elem).data('sources', sources);
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				def.resolve(elem);
				break;
			default:
				def.reject();
				break;
			}
		} else {
			// Gallery

			var gallery = info.files.filter(function(item) {
				return item.file.mimeType.indexOf('image') !== -1;
			});

			if (gallery == null || gallery.length == 0) return def.reject();

			if (gallery.length > 1) {
				elem.type = 'GALLERY';
				elem.src = gallery.map(function(e, i, a) {

					return {
						src: e['@content.downloadUrl'],
						href: e.webUrl
					};
				});
			} else {
				elem.type = 'IMAGE';
				elem.src = gallery[0]['@content.downloadUrl'];

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
			}
			def.resolve(elem);
		}

		return def.promise();
	}
};
