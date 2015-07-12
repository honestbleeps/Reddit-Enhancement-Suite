/* modified mediacrush for imgrush.js for use in RES */
window.Imgrush = (function() {
	var self = {};
	self.version = 1;
	self.domain = 'https://imgrush.com';
	self.maxMediaWidth = 700;
	self.maxMediaHeight = -1;
	self.preserveAspectRatio = true;
	self.logo = 'data:image/png;base64,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';

	/*
	 * Private methods/properties
	 */
	var createRequest = function(method, url) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, self.domain + url);
		xhr.setRequestHeader('X-CORS-Status', 'true');
		return xhr;
	};

	var createMediaObject = function(blob) {
		if (typeof blob.status === "undefined") {
			blob.status = null;
		}
		blob.url = self.domain + '/' + blob.hash;
		blob.update = function(callback) {
			self.checkStatus(blob.hash, function(value, result) {
				if (value == 'done') {
					for (prop in result[blob.hash]) {
						blob[prop] = result[blob.hash][prop];
					}
				}
				blob.status = value;
				if (callback) {
					callback(blob);
				}
			});
		};
		blob.delete = function(callback) {
			self.delete(blob.hash, function(value) {
				if (callback) {
					callback(value);
				}
			});
		};
		blob.wait = function(callback) {
			if (blob.status != 'processing') {
				if (callback) {
					callback(blob);
				}
			} else {
				setTimeout(function() {
					blob.update(function(a) { a.wait(callback); });
				}, 1000);
			}
		};
		return blob;
	};

	var renderAlbum = function(target, media, options) {
		var album = document.createElement('div');
		album.className = 'imgrush-album';
		album.media = media;

		var controls = document.createElement('span');
		controls.className = 'RESGalleryControls';
		var prev = document.createElement('a');
		prev.className = 'previous noKeyNav';
		var next = document.createElement('a');
		next.className = 'next noKeyNav';
		var text = document.createElement('span');
		text.className = 'RESGalleryLabel';
		controls.appendChild(prev);
		controls.appendChild(text);
		controls.appendChild(next);
		album.appendChild(controls);

		var brand = document.createElement('a');
		brand.href = self.domain + '/' + media.hash;
		brand.target = '_blank';
		brand.className = 'imgrush-brand';
		var image = document.createElement('img');
		image.src = self.logo;
		image.width = 16; image.height = 16;
		brand.appendChild(image);
		var span = document.createElement('span');
		span.textContent = 'Imgrush';
		brand.appendChild(span);
		album.appendChild(brand);

		album.index = 0;
		var mediaDiv;
		function renderPage() {
			if (mediaDiv)
				mediaDiv.parentElement.removeChild(mediaDiv);
			mediaDiv = document.createElement('div');
			mediaDiv.className = 'imgrush';
			mediaDiv.setAttribute('data-media', media.files[album.index].hash);
			album.appendChild(mediaDiv);
			text.textContent = (album.index + 1) + ' of ' + media.files.length;
			self.render(mediaDiv);
		}
		renderPage();

		next.addEventListener('click', function(e) {
			e.preventDefault();
			album.index++;
			if (album.index >= media.files.length) album.index = 0;
			renderPage();
		}, false);
		prev.addEventListener('click', function(e) {
			e.preventDefault();
			album.index--;
			if (album.index < 0) album.index = media.files.length - 1;
			renderPage();
		}, false);

		target.appendChild(album);
	};

	var renderImage = function(target, media, callback) {
		var link = document.createElement('a');
		link.href = self.domain + '/' + media.hash;
		link.target = '_blank';
		link.className = 'madeVisible';

		var image = document.createElement('img');
		image.className = 'RESImage';
		image.style.maxWidth = modules['showImages'].options.maxWidth.value + 'px';
		image.style.maxHeight = modules['showImages'].options.maxHeight.value + 'px';

		image.src = media.files[0].url;
		link.appendChild(image);

		var container = document.createElement('div');
		if (media.title && media.title !== "") {
			var title = document.createElement('h3');
			title.textContent = media.title;
			container.appendChild(title);
		}
		container.appendChild(link);
		if (media.description && media.description !== "") {
			var converter = window.SnuOwnd.getParser();
			var desc = document.createElement('p');
			$(desc).safeHtml(converter.render(media.description));
			desc.classList.add('md');
			desc.classList.add('imgrush-md');
			container.appendChild(desc);
		}

		target.appendChild(container);
		modules['showImages'].makeMediaZoomable(image);
	};

	var renderMedia = function(target, media, options, callback) {
		if (media.blob_type === 'video') {
			RESTemplates.load('VideoUI', function(template) {
				var video = {
					loop: media.type === 'image/gif',
					autoplay: media.type === 'image/gif',
					muted: media.type === 'image/gif',
					download: 'https://imgrush.com/download/' + media.original,
					poster: 'https://imgrush.com/' + media.hash + '.jpg',
					brand: {
						'url': 'https://imgrush.com/' + media.hash,
						'img': self.logo,
						'name': 'Imgrush'
					}
				};
				if (media.flags) {
					if (media.flags.loop) video.loop = media.flags.loop;
					if (typeof(media.flags.autoplay) !== 'undefined') video.autoplay = media.flags.autoplay;
					if (media.flags.mute) video.muted = media.flags.mute;
				}
				video.sources = [];
				for (var i = 0; i < media.files.length; i++) {
					if (media.files[i].type.indexOf('video/') !== 0) {
						continue;
					}
					video.sources.push({ source: media.files[i].url });
				}
				var jElement = template.html(video);
				var element = jElement.get()[0];
				new window.MediaPlayer(element);
				var container = document.createElement('div');
				if (media.title && media.title !== "") {
					var title = document.createElement('h3');
					title.textContent = media.title;
					container.appendChild(title);
				}
				if (media.description && media.description !== "") {
					var converter = window.SnuOwnd.getParser();
					var desc = document.createElement('p');
					$(desc).safeHtml(converter.render(media.description));
					desc.classList.add('md');
					desc.classList.add('imgrush-md');
					container.appendChild(desc);
				}
				container.appendChild(element);
				target.appendChild(container);
				modules['showImages'].makeMediaZoomable(element.querySelector('video'));
			});
		} else if (media.blob_type === 'audio') {
			var audio = document.createElement('audio');
			audio.controls = true;
			for (var i = 0; i < media.files.length; i++) {
				if (media.files[i].type.indexOf('audio/') != 0) {
					continue;
				}
				var source = document.createElement('source');
				source.src = media.files[i].url;
				audio.appendChild(source);
			}
			target.appendChild(audio);
		} else if (media.type == 'application/album') {
			renderAlbum(target, media, options);
		}
	};

	/*
	 * Retrieves information for the specified hashes.
	 */
	self.get = function(hashes, callback) {
		var xhr;
		if (hashes instanceof Array) {
			xhr = createRequest('GET', '/api/info?list=' + hashes.join(','));
		} else {
			xhr = createRequest('GET', '/api/' + hashes);
		}
		xhr.onload = function() {
			if (callback) {
				var result = JSON.parse(this.responseText);
				if (hashes instanceof Array) {
					var array = [];
					var dictionary = {};
					for (blob in result) {
						if (blob.length != 12) {
							continue;
						}
						if (result[blob] == null) {
							array.push(result[blob]);
							dictionary[blob] = result[blob];
							result[blob].hash = blob;
							dictionary[blob].hash = blob;
						} else {
							var media = createMediaObject(result[blob]);
							media.hash = blob;
							array.push(media);
							dictionary[blob] = media;
						}
					}
					if (callback) {
						callback(array, dictionary);
					}
				} else {
					if (callback) {
						var media = createMediaObject(result);
						media.hash = hashes;
						callback(media);
					}
				}
			}
		};
		xhr.send();
	};

	/*
	 * Deletes the specified media blob from Imgrush, if the user is allowed to.
	 */
	self.delete = function(hash, callback) {
		var xhr = createRequest('DELETE', '/api/' + hash);
		xhr.onload = function() {
			var result = JSON.parse(this.responseText);
			if (callback)
				callback(result['x-status'] == 200);
		};
		xhr.onerror = function() {
			if (callback)
				callback(false);
		};
		xhr.send();
	};

	/*
	 * Checks the processing status of the specified hash.
	 */
	self.checkStatus = function(hash, callback) {
		var xhr = createRequest('GET', '/api/' + hash + '/status');
		xhr.onload = function() {
			var result = JSON.parse(this.responseText);
			if (callback)
				callback(result['x-status'], result);
		};
		xhr.send();
	};

	/*
	 * Uploads a file or URL to Imgrush.
	 */
	self.upload = function(file, callback, onprogress) {
		var xhr;
		var formData = new FormData();
		if (file instanceof File) {
			xhr = createRequest('POST', '/api/upload/file');
			formData.append('file', file);
		} else {
			xhr = createRequest('POST', '/api/upload/url');
			formData.append('url', file);
		}
		xhr.upload.onprogress = onprogress;
		xhr.onload = function() {
			var json = JSON.parse(this.responseText);
			var blob = { hash: json.hash };
			if (json['x-status'] === 409) {
				blob.status = 'done';
			} else {
				blob.status = 'processing';
			}
			if (callback) {
				callback(createMediaObject(blob));
			}
		};
		xhr.send(formData);
	};

	/*
	 * Translates a .imgrush div into an embedded Imgrush object.
	 */
	self.render = function(element, callback) {
		var hash = element.getAttribute('data-media'),
			options = '',
			media;

		if (hash.indexOf('#') == 12) {
			options = hash.split('#')[1];
			hash = hash.split('#')[0];
		}
		if (element.ele && element.ele.expandoOptions && element.ele.expandoOptions.media) {
			media = element.ele.expandoOptions.media;
			if (media.type.indexOf('image/') == 0 && media.type != 'image/gif') {
				renderImage(element, media, callback);
			} else {
				renderMedia(element, media, options, callback);
			}
		} else {
			self.get(hash, function(media) {
				if (media.type.indexOf('image/') == 0 && media.type != 'image/gif') {
					renderImage(element, media, callback);
				} else {
					renderMedia(element, media, options, callback);
				}
			});
		}
	};

	return self;
}());
// Generated by CoffeeScript 1.6.3
(function() {
  var MediaPlayer;

  document.cancelFullScreen = document.cancelFullScreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen;

  MediaPlayer = function(container) {
    var adjustVolumeProgress, adjustingVolume, beginAdjustVolume, beginSeek, controls, debounce, endAdjustVolume, endSeek, event, ex, fullscreen, idleDebounce, idleEvent, idleUI, isAudio, isFullscreen, isVideo, leaveFullscreen, media, playPause, prefix, rate, rates, ready, seek, seekClick, seekProgress, seeking, startButton, timeout, toggleLoop, updateMedia, volume, volumeClick, volumeIcon, wasPaused, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    media = container.querySelector('video, audio');
    $(media).closest('.md').css('max-width', 'none');
    isVideo = media.tagName === 'VIDEO';
    isAudio = media.tagName === 'AUDIO';
    if (isVideo) {
      $(media).click(function() {
	if (media.preventPlayPause) {
	  media.preventPlayPause = false;
	  return;
	}
	if (media.paused) {
	  media.play();
	} else {
	  media.pause();
	}
	  });
	}
	controls = container.querySelector('.controls');
	brand = container.querySelector('.brand');
	playPause = container.querySelector('.play-pause');
	startButton = container.querySelector('.start');
	fullscreen = container.querySelector('.fullscreen');
	isFullscreen = false;
	toggleLoop = container.querySelector('.loop');
	rates = container.querySelectorAll('.speeds a');
	seek = container.querySelector('.seek');
	volume = container.querySelector('.volume > div');
	ready = false;
	updateMedia = function() {
	  var loaded, s, _i, _len, _ref;
	  if (!ready) {
		ready = true;
		_ref = seek.querySelectorAll('.hidden');
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		  s = _ref[_i];
		  s.classList.remove('hidden');
		}
		if (!media.autoplay) {
			seek.querySelector('.progress').classList.add('hidden');
		} else {
			if (!media.paused) {
				seek.querySelector('.progress').classList.add('hidden');
			}
		}
	  }
	  if (media.buffered.length === 0) {
		loaded = 100;
	  } else {
		loaded = media.buffered.end(media.buffered.length - 1) / media.duration * 100;
	  }
	  seek.querySelector('.loaded').style.width = loaded + '%';
	  seek.querySelector('.played').style.width = media.currentTime / media.duration * 100 + '%';
	  if (media.ended && (startButton != null)) {
		startButton.classList.remove('hidden');
	  }
	  if (media.paused) {
		if (isVideo) {
		  controls.classList.add('fixed');
		}
		playPause.classList.remove('pause');
		return playPause.classList.add('play');
	  } else {
		if (isVideo) {
		  controls.classList.remove('fixed');
		}
		playPause.classList.remove('play');
		playPause.classList.add('pause');
		if (startButton != null) {
		  return startButton.classList.add('hidden');
		}
	  }
	};
	updateMedia();
	_ref = ['progress', 'timeupdate', 'pause', 'playing', 'seeked', 'ended'];
	for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	  event = _ref[_i];
	  media.addEventListener(event, function(e) {
		if (media.readyState >= 3 || ready) {
		  return updateMedia();
		}
	  }, false);
	}
	if (volume !== null) {
	  volumeIcon = volume.parentElement.querySelector('.res-icon');
	  volumeIcon.addEventListener('click', function(e) {
		e.preventDefault();
		return media.muted = !media.muted;
	  }, false);
	  media.addEventListener('volumechange', function(e) {
		var iconSymbol, _ref1;
		if (media.muted) {
		  volume.parentElement.classList.add('muted');
		  return volumeIcon.textContent = '\uF038';
		} else {
		  volume.parentElement.classList.remove('muted');
		  if (media.volume > 0.66) {
			iconSymbol = '\uF03B';
		  } else if ((0.33 < (_ref1 = media.volume) && _ref1 <= 0.66)) {
			iconSymbol = '\uF03A';
		  } else {
			iconSymbol = '\uF039';
		  }
		  return volumeIcon.textContent = iconSymbol;
		}
	  }, false);
	  adjustingVolume = false;
	  beginAdjustVolume = function(e) {
		e.preventDefault();
		adjustingVolume = true;
		return adjustVolumeProgress(e);
	  };
	  adjustVolumeProgress = function(e) {
		var amount, ex, height, width;
		e.preventDefault();
		if (!adjustingVolume) {
		  return;
		}
		if (isVideo) {
		  height = volume.querySelector('.background').clientHeight;
		  if (e.offsetY != null) {
			amount = (height - e.offsetY) / height;
		  } else {
			amount = (height - e.layerY) / height;
		  }
		  volume.querySelector('.amount').style.height = amount * 100 + '%';
		} else {
		  width = volume.querySelector('.background').clientWidth;
		  if (e.offsetX != null) {
			amount = e.offsetX / width;
		  } else {
			amount = e.layerX / width;
		  }
		  volume.querySelector('.amount').style.width = amount * 100 + '%';
		}
		media.volume = amount;
	  };
	  endAdjustVolume = function(e) {
		e.preventDefault();
		return adjustingVolume = false;
	  };
	  volumeClick = volume.querySelector('.clickable');
	  volumeClick.addEventListener('mousedown', beginAdjustVolume, false);
	  volumeClick.addEventListener('mouseup', endAdjustVolume, false);
	  volumeClick.addEventListener('mousemove', adjustVolumeProgress, false);
	  volumeClick.addEventListener('mouseleave', endAdjustVolume, false);
	}
	if (isVideo) {
	  idleDebounce = false;
	  idleUI = function() {
		idleDebounce = true;
		controls.classList.add('idle');
		brand.classList.add('idle');
		return media.classList.add('idle');
	  };
	  timeout = null;
	  idleEvent = function(e) {
		if (idleDebounce) {
		  idleDebounce = false;
		  return false;
		}
		clearTimeout(timeout);
		controls.classList.remove('idle');
		brand.classList.remove('idle');
		media.classList.remove('idle');
		return true;
	  };
	  media.addEventListener('mousemove', function(e) {
		if (idleEvent(e)) {
		  return timeout = setTimeout(idleUI, 3000);
		}
	  }, false);
	  controls.addEventListener('mousemove', idleEvent, false);
	}
	seeking = false;
	wasPaused = true;
	beginSeek = function(e) {
	  e.preventDefault();
	  seeking = true;
	  wasPaused = media.paused;
	  media.pause();
	  return seekProgress(e);
	};
	seekProgress = function(e) {
	  var amount;
	  e.preventDefault();
	  if (!seeking) {
		return;
	  }
	  if (e.offsetX != null) {
		amount = e.offsetX / seek.clientWidth;
	  } else {
		amount = e.layerX / seek.clientWidth;
	  }
	  return media.currentTime = media.duration * amount;
	};
	endSeek = function(e) {
	  e.preventDefault();
	  if (!seeking) {
		return;
	  }
	  if (!wasPaused) {
		media.play();
	  }
	  return seeking = false;
	};
	seekClick = seek.querySelector('.clickable');
	seekClick.addEventListener('mousedown', beginSeek, false);
	seekClick.addEventListener('mouseup', endSeek, false);
	seekClick.addEventListener('mousemove', seekProgress, false);
	seekClick.addEventListener('mouseleave', endSeek, false);
	if (fullscreen !== null) {
	  debounce = true;
	  _ref1 = ['', 'moz', 'webkit', 'ms'];
	  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
		prefix = _ref1[_j];
		document.addEventListener(prefix + 'fullscreenchange', function(e) {
		  if (debounce) {
			debounce = false;
			return;
		  }
		  debounce = true;
		  if (isFullscreen) {
			return leaveFullscreen();
		  }
		}, false);
	  }
	  fullscreen.addEventListener('click', function(e) {
		e.preventDefault();
		if (!isFullscreen) {
		  isFullscreen = true;
		  fullscreen.classList.add('disabled');
		  if (container.requestFullScreen != null) {
			container.requestFullScreen();
		  }
		  if (container.mozRequestFullScreen != null) {
			container.mozRequestFullScreen();
		  }
		  if (container.webkitRequestFullScreen != null) {
			container.webkitRequestFullScreen();
		  }
		  if (container.msRequestFullscreen != null) {
			container.msRequestFullscreen();
		  }
		  container.classList.add('fullscreen');
		  media.style.width = '100%';
		  media.style.maxWidth = 'none';
		  return timeout = setTimeout(idleUI, 3000);
		} else {
		  return leaveFullscreen();
		}
	  }, false);
	  leaveFullscreen = function() {
		var _;
		isFullscreen = false;
		container.classList.remove('fullscreen');
		fullscreen.classList.remove('disabled');
		document.cancelFullScreen();
		_ = document.querySelector('.media');
		_.style.right = 0;
		return window.setTimeout(function() {
		  return _.style.right = '-50%';
		}, 100);
	  };
	}
	playPause.addEventListener('click', function(e) {
	  e.preventDefault();
	  if (media.paused) {
		return media.play();
	  } else {
		return media.pause();
	  }
	}, false);
	if (startButton != null) {
	  startButton.addEventListener('click', function(e) {
		e.preventDefault();
		return media.play();
	  }, false);
	}
	toggleLoop.addEventListener('click', function(e) {
	  e.preventDefault();
	  if (media.loop) {
		media.loop = false;
		toggleLoop.querySelector('.res-icon').classList.add('disabled');
		return toggleLoop.querySelector('.text').textContent = 'Loop OFF';
	  } else {
		media.loop = true;
		toggleLoop.querySelector('.res-icon').classList.remove('disabled');
		toggleLoop.querySelector('.text').textContent = 'Loop ON';
		if (media.ended) {
		  media.currentTime = 0;
		  return media.play();
		}
	  }
	}, false);
	for (_k = 0, _len2 = rates.length; _k < _len2; _k++) {
	  rate = rates[_k];
	  rate.addEventListener('click', function(e) {
		var speed;
		e.preventDefault();
		speed = parseFloat(e.target.getAttribute('data-speed'));
		container.querySelector('.speeds a.selected').classList.remove('selected');
		e.target.classList.add('selected');
		return media.playbackRate = speed;
	  }, false);
	}
	return window.resizeMedia = function(width, height) {
	  if (!isVideo) {
		return;
	  }
	  media.width = width;
	  return media.height = height - 5;
	};
  };

  window.MediaPlayer = MediaPlayer;
}).call(this);
