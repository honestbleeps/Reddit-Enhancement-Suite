addLibrary('mediaHosts', 'imgur', {
	domains: ['imgur.com'],
	logo: '//i.imgur.com/favicon.ico',
	options: {
		'prefer RES albums': {
			description: 'Prefer RES support for imgur albums rather than reddit\'s built in support',
			value: true,
			type: 'boolean'
		}
	},
	cdnURL: location.protocol + '//i.imgur.com/',
	apiPrefix: 'https://api.imgur.com/3/',
	apiID: '1d8d9b36339e0e2',
	badHashes: [ 'rules', 'inbox' ],

	// hashRe: /^https?:\/\/(?:i\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)?([\w]{5,}(?:[&,][\w]{5,})?)(\..+)?(?:#(\d*))?$/i,
	// the modified regex below fixes detection of "edited" imgur images, but imgur's edited images are broken right now actually, falling into
	// a redirect loop.  preserving the old one just in case.  however it also fixes detection of the extension (.jpg, for example) which
	// was too greedy a search...
	// the hashRe below was provided directly by MrGrim (well, everything after the domain was), using that now.
	// in addition to the above, the album index was moved out of the first capture group.
	hashRe: /^https?:\/\/(?:i\.|m\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)*(?!gallery)(?!removalrequest)(?!random)(?!memegen)([\w]{5,7}(?:[&,][\w]{5,7})*)(?:#\d+)?[sbtmlh]?(\.(?:jpe?g|gif|png|gifv))?(\?.*)?$/i,
	hostedHashRe: /^https?:(\/\/i\.\w+\.*imgur\.com\/)([\w]{5,7}(?:[&,][\w]{5,7})*)(?:#\d+)?[sbtmlh]?(\.(?:jpe?g|gif|png))?(\?.*)?$/i,
	galleryHashRe: /^https?:\/\/(?:m\.)?imgur\.com\/gallery\/([\w]+)(\..+)?(?:\/)?(?:#?\w*)?$/i,
	albumHashRe: /^https?:\/\/(?:m\.)?imgur\.com\/a\/([\w]+)(\..+)?(?:\/)?(?:#?\w*)?$/i,
	detect: function(href, elem) {
		return href.indexOf('imgur.com/') !== -1;
	},
	_api: function (endpoint) {
		var def = $.Deferred();

		RESEnvironment.ajax({
			method: 'GET',
			url: this.apiPrefix + endpoint,
			headers: {
				'Authorization': 'Client-ID ' + this.apiID
			},
			// aggressiveCache: true,
			onload: function(response) {
				try {
					var json = JSON.parse(response.responseText);
					if (json.data.error || response.status === 404) {
						def.reject(response, json.data.error);
					} else {
						def.resolve(json.data);
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
		var siteMod = modules['showImages'].siteModules['imgur'],
			def,
			href = elem.href.split('?')[0],
			groups, hash;

		if ((groups = siteMod.galleryHashRe.exec(href))) {
			hash = groups[1];
			def = siteMod._api('gallery/' + encodeURIComponent(hash));
		}

		else if ((groups = siteMod.albumHashRe.exec(href))) {
			if (modules['showImages'].options['prefer RES albums'].value === true) {
				hash = groups[1];
				elem.imgHash = hash;
				def = siteMod._api('album/' + encodeURIComponent(hash));
			}
		}

		else if ((groups = siteMod.hostedHashRe.exec(href))) {
			hash = groups[2];
			def = siteMod._handleImage(hash, href);
		}

		else if ((groups = siteMod.hashRe.exec(href))) {
			hash = groups[1];
			if (hash.search(/[&,]/) > -1) {
				// handle separated list of IDs
				def = siteMod._handleImageCollection(hash.split(/[&,]/), href);
			} else {
				def = siteMod._handleImage(hash, href);
			}
		}

		if (siteMod.badHashes.indexOf(hash) !== -1) {
		 	def = $.Deferred().reject(false);
		} else if (def) {
			def = def.then(function(info) {
				return $.Deferred().resolve(elem, info).promise();
			});
		} else {
			def = $.Deferred().reject();
		}
		return def.promise();
	},

	_deferredImages: {},
	_deferredImageQueue: [],
	_handleImage: function(hash, url) {
		var siteMod = modules['showImages'].siteModules['imgur'],
			def;

		if (!siteMod._deferredImages[hash]) {
			def = $.Deferred();
			siteMod._deferredImages[hash] = def;
			siteMod._deferredImageQueue.push({
				url: url,
				hash: hash,
				deferred: def
			});
			RESUtils.debounce('showImages.imgur.batchHandleImages', 500, siteMod._batchHandleImages.bind(siteMod));
		}

		return siteMod._deferredImages[hash].promise();
	},
	_batchHandleImages: function() {
		var siteMod = modules['showImages'].siteModules['imgur'],
			queue = siteMod._deferredImageQueue;
		siteMod._deferredImageQueue = [];

		queue.forEach(function(item) {
			var def,
				extension = (extension = siteMod.hashRe.exec(item.url)) && extension[2];

			if (['.gif', '.gifv', '.png'].indexOf(extension)) {
				// Extension is given and hopefully correct, so we can intuit the mimetype
				// removed caption API calls as they don't seem to exist/matter for single images, only albums...
				// If we don't show captions and know the mimetype, then we can skip the API call.
				def = siteMod._hashMockAPI(item.hash, item.url);
			} else if (siteMod.hostedHashRe.test(item.url)) {
				def = siteMod._hashMockAPI(item.hash, item.url);
			} else {
				// Check if image is gifv
				def = siteMod._api('image/' + item.hash);
			}

			def
				.done(item.deferred.resolve)
				.fail(item.deferred.reject);
		});
	},

	_hashMockAPI: function(hash, url) {
		var siteMod = modules['showImages'].siteModules['imgur'],
			def = $.Deferred(), matches,
			extension, mimeType, cdnURL;

		cdnURL = siteMod.cdnURL;

		if ((matches = siteMod.hostedHashRe.exec(url))) {
			cdnURL = matches[1];
			extension = matches[3];
		} else if ((matches = siteMod.hashRe.exec(url))) {
			 extension = matches[2];
		}

		if (!extension) {
			// Imgur doesn't really care about the extension except video and the browsers don't seem to either.
			extension = '.jpg';
		}

		mimeType = (extension === '.jpg') ? 'image/jpeg' : 'image/' + extension.substr(1);

		if (extension === '.gifv' || extension === '.gif') {
			def.resolve({
				id: hash,
				looping: true,
				animated: true,
				ext: extension,
				type: 'image/gif',
				gifv: cdnURL + hash + '.gifv',
				webm: cdnURL + hash + '.webm',
				mp4: cdnURL + hash + '.mp4',
				link: cdnURL + hash + '.gif',
				download: cdnURL + 'download/' + hash
			});
		} else {
			def.resolve({
				id: hash,
				animated: false,
				looping: false,
				ext: extension,
				link: cdnURL + hash + extension,
				type: mimeType
			});
		}
		return def.promise();
	},

	_handleImageCollection: function(hashes, url) {
		var siteMod = modules['showImages'].siteModules['imgur'],
			def,
			expandoInfo = {
				is_album: true
			};

		def = RESUtils.deferred.map(hashes, function(hash) {
			return siteMod._hashMockAPI(hash, url);
		}).then(function(images) {
			expandoInfo.images = images;
			return expandoInfo;
		});
		return def.promise();
	},

	handleInfo: function(elem, info) {
		// Provide
		var def;
		if (info.images && info.images.length) {
			def = modules['showImages'].siteModules['imgur']._handleAlbum(elem, info);
		} else if (info.gifv) {
			def = modules['showImages'].siteModules['imgur']._handleGifv(elem, info);
		} else if (info.link) {
			def = modules['showImages'].siteModules['imgur']._handleSingleImage(elem, info);
		}

		if (def) {
			def = def.then(function(expandoInfo) {
				$.extend(true, elem, expandoInfo);
				return elem;
			});
		} else {
			def = $.Deferred().reject();
			// console.log('ERROR', info);
			// console.log(arguments.callee.caller);
		}

		return def.promise();
	},
	_handleSingleImage: function(elem, info) {
		var link = info.link;

		if (location.protocol === 'https:') {
			link = link.replace('http:','https:');
		}
		var expandoInfo = {
			src: link,
			type: 'IMAGE',
			caption: info.caption,
			title: info.title
		};
		return $.Deferred().resolve(expandoInfo).promise();
	},
	_handleAlbum: function(elem, info) {
		var siteMod = modules['showImages'].siteModules['imgur'],
			deferred,
			expandoInfo = {},
			base = elem.href.split('#')[0];

		deferred = RESUtils.deferred.map(info.images, function(info, i, a) {
			var deferred,
				expandoInfo;

			expandoInfo = {
				title: info.title,
				caption: info.description,
				href: base + '#' + info.id
			};
			//if (info.gifv) {
			//	deferred = siteMod._handleGifv(elem, info);
			//} else {
				deferred = siteMod._handleSingleImage(elem, info);
			//}

			deferred = deferred.then(function(imageExpandoInfo) {
				$.extend(true, expandoInfo, imageExpandoInfo);
				return expandoInfo;
			});

			return deferred.promise();
		})
		.then(function(images) {
			expandoInfo.src = images;
		})
		.then(function() {
			if (info.hash) {
				var hash = info.hash.slice(1);
				var galleryStart = parseInt(hash, 10);
				if (isNaN(galleryStart)) {
					galleryStart = info.images.findIndex(function(image, i) {
						return hash === info.images[i].image.hash;
					});

					if (galleryStart === -1) {
						galleryStart = 0;
					}
				}
				expandoInfo.galleryStart = galleryStart;
			}
			expandoInfo.imageTitle = info.title;
			expandoInfo.caption = info.description;
			expandoInfo.type = 'GALLERY';
		})
		.then(function() {
			return expandoInfo;
		});
		return deferred.promise();
	},
	_handleGifv: function(elem, info) {
		var siteMod = modules['showImages'].siteModules['imgur'],
			expandoInfo = {};
		expandoInfo.type = 'GENERIC_EXPANDO';
		expandoInfo.subtype = 'VIDEO';
		// open via 'view all images'
		expandoInfo.expandOnViewAll = true;
		expandoInfo.expandoClass = ' video-muted';

		expandoInfo.expandoOptions = {
			generate: siteMod._generateGifv.bind(siteMod, elem, info),
			media: info
		};

		return $.Deferred().resolve(expandoInfo).promise();
	},

	_generateGifv: function(elem, info) {
		var template = RESTemplates.getSync('imgurgifvUI');
		var video = {
			loop: true,
			autoplay: true, // imgurgifv will always be muted, so autoplay is OK
			muted: true,
			directurl: elem.href,
			downloadurl: info.download
		};
		video.sources = [
			{
				'source': info.webm,
				'type': 'video/webm',
				'class': 'imgurgifvwebmsrc'
			},
			{
				'source': info.mp4,
				'type': 'video/mp4',
				'class': 'imgurgifvmp4src'
			}
		];
		var element = template.html(video)[0],
			v = element.querySelector('video');

		// set the max width to the width of the entry area
		v.style.maxWidth = $(elem).closest('.entry').width() + 'px';
		new window.imgurgifvObject(element, elem.href, info.link);
		return element;
	}
});
