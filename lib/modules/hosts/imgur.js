modules['showImages'].siteModules['imgur'] = {
	domains: ['imgur.com'],
	options: {
		'prefer RES albums': {
			description: 'Prefer RES support for imgur albums rather than reddit\'s built in support',
			value: true,
			type: 'boolean'
		}
	},
	APIKey: 'fe266bc9466fe69aa1cf0904e7298eda',
	// hashRe: /^https?:\/\/(?:i\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)?([\w]{5,}(?:[&,][\w]{5,})?)(\..+)?(?:#(\d*))?$/i,
	// the modified regex below fixes detection of "edited" imgur images, but imgur's edited images are broken right now actually, falling into
	// a redirect loop.  preserving the old one just in case.  however it also fixes detection of the extension (.jpg, for example) which
	// was too greedy a search...
	// the hashRe below was provided directly by MrGrim (well, everything after the domain was), using that now.
	// in addition to the above, the album index was moved out of the first capture group.
	hashRe: /^https?:\/\/(?:i\.|m\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)*(?!gallery)(?!removalrequest)(?!random)(?!memegen)([\w]{5,7}(?:[&,][\w]{5,7})*)(?:#\d+)?[sbtmlh]?(\.(?:jpe?g|gif|png|gifv))?(\?.*)?$/i,
	albumHashRe: /^https?:\/\/(?:i\.|m\.)?imgur\.com\/(?:a|gallery)\/([\w]+)(\..+)?(?:\/)?(?:#?\w*)?$/i,
	apiPrefix: 'https://api.imgur.com/2/',
	calls: {},
	detect: function(href, elem) {
		return href.indexOf('imgur.com/') !== -1;
	},
	handleLink: function(elem) {
		var siteMod = modules['showImages'].siteModules['imgur'],
			def = $.Deferred(),
			href = elem.href.split('?')[0],
			groups = siteMod.hashRe.exec(href),
			extension,
			albumGroups;

		if (!groups) {
			albumGroups = siteMod.albumHashRe.exec(href);
		}

		if (groups && !albumGroups) {
			// handling for separated list of IDs
			if (groups[1].search(/[&,]/) > -1) {
				var hashes = groups[1].split(/[&,]/);
				def.resolve(elem, {
					album: {
						images: hashes.map(function(hash) {
							return {
								image: {
									title: '',
									caption: '',
									hash: hash
								},
								links: {
									original: location.protocol + '//i.imgur.com/' + hash + '.jpg'
								}
							};
						})
					}
				});
			} else {
				// removed caption API calls as they don't seem to exist/matter for single images, only albums...
				//If we don't show captions, then we can skip the API call.
				extension = groups[2] || '.jpg';
				if (extension === '.gifv' || extension === '.gif') {
					// remove the default reddit expando button
					$(elem).closest('.entry').find('.expando-button.video').remove();

					def.resolve(elem, {
						gifv: {
							webmUrl: location.protocol + '//i.imgur.com/' + groups[1] + '.webm',
							mp4Url: location.protocol + '//i.imgur.com/' + groups[1] + '.mp4',
							gifUrl: location.protocol + '//i.imgur.com/' + groups[1] + '.gif',
							downloadUrl: location.protocol + '//i.imgur.com/download/' + groups[1],
							image: {}
						}
					});
				} else {
					def.resolve(elem, {
						image: {
							links: {
								//Imgur doesn't really care about the extension and the browsers don't seem to either.
								original: location.protocol + '//i.imgur.com/' + groups[1] + extension
							},
							image: {}
						}
					});
				}
			}
		} else if (albumGroups && !albumGroups[2]) {
			// on detection, if "prefer RES albums" is checked, hide any existing expando...
			// we actually remove it from the DOM for a number of reasons, including the
			// fact that many subreddits style them with display: block !important;, which
			// overrides a "hide" call here.
			if (modules['showImages'].options['prefer RES albums'].value === true) {
				$(elem).closest('.entry').find('.expando-button.video').remove();
				var apiURL = siteMod.apiPrefix + 'album/' + encodeURIComponent(albumGroups[1]) + '.json';
				elem.imgHash = albumGroups[1];
				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						def.reject();
					}
				} else {
					RESUtils.runtime.ajax({
						method: 'GET',
						url: apiURL,
						// aggressiveCache: true,
						onload: function(response) {
							if (response.status === 404) {
								return def.reject();
							}
							try {
								var json = JSON.parse(response.responseText);
								siteMod.calls[apiURL] = json;
								def.resolve(elem, json);
							} catch (error) {
								siteMod.calls[apiURL] = null;
								def.reject();
							}
						},
						onerror: function(response) {
							def.reject();
						}
					});
				}
			} else {
				// do not use RES's album support...
				return def.reject();
			}
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		if ('image' in info) {
			return modules['showImages'].siteModules['imgur'].handleSingleImage(elem, info);
		} else if ('album' in info) {
			return modules['showImages'].siteModules['imgur'].handleGallery(elem, info);
		} else if ('gifv' in info) {
			return modules['showImages'].siteModules['imgur'].handleGifv(elem, info.gifv);
		} else if (info.error && info.error.message === 'Album not found') {
			// This case comes up when there is an imgur.com/gallery/HASH link that
			// links to an image, not an album (not to be confused with the word "gallery", ugh)
			info = {
				image: {
					links: {
						original: location.protocol + '//i.imgur.com/' + elem.imgHash + '.jpg'
					},
					image: {}
				}
			};
			return modules['showImages'].siteModules['imgur'].handleSingleImage(elem, info);
		} else {
			return $.Deferred().reject().promise();
			// console.log('ERROR', info);
			// console.log(arguments.callee.caller);
		}
	},
	handleSingleImage: function(elem, info) {
		if (location.protocol === 'https:') {
			info.image.links.original = info.image.links.original.replace('http:','https:');
		}
		elem.src = info.image.links.original;
		elem.href = info.image.links.original;
		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		elem.type = 'IMAGE';
		if (info.image.image.caption) elem.caption = info.image.image.caption;
		return $.Deferred().resolve(elem).promise();
	},
	handleGallery: function(elem, info) {
		var base = elem.href.split('#')[0];
		elem.src = info.album.images.map(function(e, i, a) {
			if (location.protocol === 'https:') {
				e.links.original = e.links.original.replace('http:','https:');
			}
			return {
				title: e.image.title,
				src: e.links.original,
				href: base + '#' + e.image.hash,
				caption: e.image.caption
			};
		});
		if (elem.hash) {
			var hash = elem.hash.slice(1);
			if (isNaN(hash)) {
				for (var i = 0; i < elem.src.length; i++) {
					if (hash == info.album.images[i].image.hash) {
						elem.galleryStart = i;
						break;
					}
				}
			} else {
				elem.galleryStart = parseInt(hash, 10);
			}
		}
		elem.imageTitle = info.album.title;
		elem.caption = info.album.description;
		elem.type = 'GALLERY';
		return $.Deferred().resolve(elem).promise();
	},
	handleGifv: function(elem, info) {
		RESTemplates.load('imgurgifvUI');

		var generate = function(options) {
			var template = RESTemplates.getSync('imgurgifvUI');
			var video = {
				loop: true,
				autoplay: true, // imgurgifv will always be muted, so autoplay is OK
				muted: true,
				directurl: elem.href,
				downloadurl: info.downloadUrl
			};
			video.sources = [
				{
					'source': info.webmUrl,
					'type': 'video/webm',
					'class': 'imgurgifvwebmsrc'
				},
				{
					'source': info.mp4Url,
					'type': 'video/mp4',
					'class': 'imgurgifvmp4src'
				}
			];
			var element = template.html(video)[0],
				v = element.querySelector('video');

			// set the max width to the width of the entry area
			v.style.maxWidth = $(elem).closest('.entry').width() + 'px';
			new window.imgurgifvObject(element, elem.href, info.gifUrl);
			return element;
		};
		elem.type = 'GENERIC_EXPANDO';
		elem.subtype = 'VIDEO';
		// open via 'view all images'
		elem.expandOnViewAll = true;
		elem.expandoClass = ' video-muted';

		elem.expandoOptions = {
			generate: generate,
			media: info
		};

		if (RESUtils.pageType() === 'linklist') {
			$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
		}
		return $.Deferred().resolve(elem).promise();
	}
};
