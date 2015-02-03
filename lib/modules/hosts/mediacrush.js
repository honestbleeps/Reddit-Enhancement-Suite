modules['uploader'].hosts['mediacrush'] = {
	name: 'MediaCrush',
	description: '<img width="16" height="16" src="' + MediaCrush.logo + '" style="position: relative; top: 3px" /> \
						<a href="https://mediacru.sh/about" target="_blank">MediaCrush</a>',
	blurb: 'Drag and drop or <a href="#" class="file-trigger">click to upload</a> images, audio, or video.',
	maxSize: 100000000 /* MediaCrush advertises 50 MB but we're actually quite lenient */,
	load: function(ui) {
	},
	handleFile: function(file, ui, progressBar) {
		var blurb = ui.querySelector('.blurb');
		blurb.innerHTML = 'Uploading...';
		var url = document.getElementById('url');

		function done(blob) {
			if (blob.status === "error" || blob.status === "internal_error") {
				progressBar.classList.add('progress-red');
				blurb.innerHTML = 'There was a problem with this file.';
			} else if (blob.status === "unrecognised") {
				progressBar.classList.add('progress-red');
				blurb.innerHTML = 'This file format was not recognized.';
			} else if (blob.status === "timeout") {
				progressBar.classList.add('progress-red');
				blurb.innerHTML = 'This file took too long to process.';
			} else {
				progressBar.style.width = '0%';
				progressBar.className = 'progress';
				url.value = blob.url;
				blurb.innerHTML = 'Done!';
			}
		}

		MediaCrush.upload(file, function(blob) {
			if (blob.status === "done" || blob.status === "ready") {
				done(blob);
			} else {
				blurb.innerHTML = 'Processing, please wait...';
				progressBar.style.width = '100%';
				progressBar.classList.add('progress-green');
				blob.wait(function(blob) {
					done(blob);
				});
			}
		}, function(e) {
			if (e.lengthComputable) {
				var progress = e.loaded / e.total;
				progressBar.style.width = (progress * 100) + '%';
			}
		});
	}
};
modules['showImages'].siteModules['mediacrush'] = {
	name: 'mediacrush',
	domains: ['mediacru.sh'],
	calls: {},
	detect: function(href, elem) {
		return (/^https?:\/\/(?:www\.|cdn\.)?mediacru\.sh\/([a-zA-Z0-9_\-]{12})(?:\.(?:jpe|jpeg|jpg|png|mp3|flac|ogg|oga|ogv|mp4|webm|pdf|svg))?(?:\/?|\/(direct|grid|list|focus)\/?)(#.*)?$/).test(elem.href);
	},
	handleLink: function(elem) {
		var hashRe = /^https?:\/\/(?:www\.|cdn\.)?mediacru\.sh\/([a-zA-Z0-9_\-]{12})(?:\.(?:jpe|jpeg|jpg|png|mp3|flac|ogg|oga|ogv|mp4|webm|pdf|svg))?(?:\/?|\/direct|grid|list|focus\/?)(#.*)?$/,
			def = $.Deferred(),
			groups = hashRe.exec(elem.href);

		if (!groups) {
			return def.reject();
		}
		var siteMod = modules['showImages'].siteModules['mediacrush'],
			mediaId = groups[1],
			mediaSettings = groups[2];

		if (!mediaSettings) {
			mediaSettings = '';
		}
		window.MediaCrush.get(mediaId, function(media) {
			siteMod.calls['mediacrush-' + mediaId] = media;
			media.settings = mediaSettings;
			def.resolve(elem, media);
		});
		return def.promise();
	},
	handleInfo: function(elem, info) {
		var autoplay = modules['showImages'].options.autoplayVideo.value;

		// Avoid auto playing more than 1 item
		if (modules['showImages'].options.autoplayVideo.value) {
			if ($(elem).closest('.md').find('.expando-button.video').length > 0) {
				autoplay = false;
			}
		}
		if (typeof info.metadata.has_audio !== 'undefined' && info.metadata.has_audio && typeof info.flags !== 'undefined' && autoplay === false) {
			info.flags.autoplay = false;
		}

		var generate = function(options) {
			var div = document.createElement('div');
			div.setAttribute('data-media', options.media.hash);
			div.classList.add('mediacrush');
			// store a reference to elem so that expandoOptions can be accessed in mediacrush.js
			div.ele = elem;
			window.MediaCrush.render(div);
			return div;
		};
		var def = $.Deferred();
		if (info.type === 'application/album') {
			elem.type = 'GENERIC_EXPANDO';
			elem.expandoClass = ' image gallery';
			if (info.files[0].metadata.has_audio) {
				elem.expandOnViewAll = false;
			} else {
				elem.expandOnViewAll = true;
			}
			elem.expandoOptions = {
				generate: generate,
				media: info
			};
		} else if (info.blob_type === 'video') {
			elem.type = 'GENERIC_EXPANDO';
			if (info.metadata.has_audio) {
				elem.expandoClass = ' video';
			} else {
				elem.expandoClass = ' video-muted';
				elem.expandOnViewAll = true;
			}
			elem.expandoOptions = {
				generate: generate,
				media: info
			};
		} else if (info.blob_type === 'audio') {
			elem.type = 'GENERIC_EXPANDO';
			elem.expandoClass = ' video';
			elem.expandoOptions = {
				generate: generate,
				media: info
			};
		} else if (info.blob_type === 'image') {
			/* We could be using the IMAGE expando here, but this lets us
			 * include MediaCrush titles/descriptions with no extra code */
			elem.type = 'GENERIC_EXPANDO';
			elem.expandoClass = ' image';
			elem.expandOnViewAll = true;
			elem.expandoOptions = {
				generate: generate,
				media: info
			};
		}
		return $.Deferred().resolve(elem).promise();
	}
};
