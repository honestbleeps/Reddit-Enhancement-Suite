/* mediacrush.js, modified for use in RES */
window.MediaCrush = (function() {
	var self = this;
	self.version = 1;
	self.domain = 'https://mediacru.sh';
	self.maxMediaWidth = 700;
	self.maxMediaHeight = -1;
	self.preserveAspectRatio = true;
	self.logo = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iTGF5ZXJfMSIKICAgeD0iMHB4IgogICB5PSIwcHgiCiAgIHdpZHRoPSI0MjQuMDk5IgogICBoZWlnaHQ9IjQyMS40NjkwOSIKICAgdmlld0JveD0iMCAwIDQyNC4wOTkgNDIxLjQ2OTA5IgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIgogICB4bWw6c3BhY2U9InByZXNlcnZlIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjQ4LjMuMSByOTg4NiIKICAgc29kaXBvZGk6ZG9jbmFtZT0ibWVkaWFjcnVzaF9sb2dvLnN2ZyIKICAgaW5rc2NhcGU6ZXhwb3J0LWZpbGVuYW1lPSIvaG9tZS9zaXJjbXB3bi9zb3VyY2VzL01lZGlhQ3J1c2gvc3RhdGljL2xvZ28tYmcucG5nIgogICBpbmtzY2FwZTpleHBvcnQteGRwaT0iMTMuNTgiCiAgIGlua3NjYXBlOmV4cG9ydC15ZHBpPSIxMy41OCI+PG1ldGFkYXRhCiAgIGlkPSJtZXRhZGF0YTExIj48cmRmOlJERj48Y2M6V29yawogICAgICAgcmRmOmFib3V0PSIiPjxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlCiAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+PC9jYzpXb3JrPjwvcmRmOlJERj48L21ldGFkYXRhPjxkZWZzCiAgIGlkPSJkZWZzOSIgLz48c29kaXBvZGk6bmFtZWR2aWV3CiAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgIG9iamVjdHRvbGVyYW5jZT0iMTAiCiAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIgogICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjEzNjYiCiAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjcxOCIKICAgaWQ9Im5hbWVkdmlldzciCiAgIHNob3dncmlkPSJmYWxzZSIKICAgaW5rc2NhcGU6em9vbT0iMC45MjE4NzUiCiAgIGlua3NjYXBlOmN4PSIzNDguNzgwMzIiCiAgIGlua3NjYXBlOmN5PSIyMTkuNTk4OTUiCiAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICBpbmtzY2FwZTp3aW5kb3cteT0iMCIKICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIKICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iTGF5ZXJfMSIKICAgZml0LW1hcmdpbi10b3A9IjE1IgogICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgIGZpdC1tYXJnaW4tcmlnaHQ9IjAiCiAgIGZpdC1tYXJnaW4tYm90dG9tPSIxNSIgLz4KPHBhdGgKICAgZD0ibSA1Ny4wNjEsNDA2LjEzMDggYyAwLDAgLTU3LjA2MSwtNzcuMzcxIC01Ny4wNjEsLTE5Ni4wMzUgMCwtMTE4LjY2NyA1Ny4wNjYsLTE5NC45ODkgNTcuMDY2LC0xOTQuOTg5IDAsMCA5NC4zMiwtNC44MzYgMjAyLjMwMiw1MC41NzYgMTA3Ljk4Niw1NS40MTIgMTY0LjczMSwxNDMuODkgMTY0LjczMSwxNDMuODkgMCwwIC02My43OTIsOTYuMjIgLTE3MC4zODYsMTUwLjA2NiAtMTA2LjU5NCw1My44NDQgLTE5Ni42NTIsNDYuNDkyIC0xOTYuNjUyLDQ2LjQ5MiB6IgogICBpZD0icGF0aDMiCiAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgIHN0eWxlPSJmaWxsOiMwMDU1ODAiIC8+CjxwYXRoCiAgIGQ9Im0gNjkuNDY3LDI4OS4xOTc4IGggNDAuMjQ1IGwgMTYuNjUzLC0xMDYuMjQ5IDAuMjM2LC0xLjUwOCBjIDAuMjkzLC0wLjU5OSAwLjQ1NSwtMS4wMDEgMC40ODgsLTEuMjA1IDIuMzY2LC02LjIzNyA2LjUyOSwtOS4zNTcgMTIuNDkzLC05LjM1NyBoIDE5LjA3IGMgNS4zMzksMS40MDggNy41ODIsNC44MzEgNi43MywxMC4yNiBsIC0xNi45MzcsMTA4LjA1OSBoIDQwLjI0NyBsIDE2LjkzOCwtMTA4LjA1OSBjIDAuNzI1LC00LjYyNCAzLjMxMiwtNy43NDUgNy43NzIsLTkuMzUzIDEuNjkyLC0wLjYwNSAzLjA0MSwtMC45MDcgNC4wNDMsLTAuOTA3IGggMTcuNzE3IGMgNy40MDMsMCAxMC40NzksNC4wMjIgOS4yMiwxMi4wNyBsIC0xNi42NTYsMTA2LjI0OSBoIDQwLjI0NyBsIDE4LjkyNiwtMTIwLjczOSBjIDEuMzU5LC04LjY3MiAwLjY2NiwtMTUuODM2IC0yLjA2OSwtMjEuNDg2IC01LjUxNSwtMTEuMDkyIC0xNS4yMjMsLTE2LjY0MyAtMjkuMTE5LC0xNi42NDMgaCAtMzAuODE4IGMgLTE1LjUxMiwwIC0yNi43MjksNC43NDIgLTMzLjY1LDE0LjIyMyAtMy45NTMsLTkuNDgxIC0xMy42ODYsLTE0LjIyMyAtMjkuMTk2LC0xNC4yMjMgaCAtMzAuODIxIGMgLTEzLjksMCAtMjUuMzQyLDUuNTUgLTM0LjMzMywxNi42NDMgLTQuMjQ4LDUuMjQ4IC03LjA4MSwxMi40MDggLTguNTA0LDIxLjQ4NiBsIC0xOC45MjIsMTIwLjczOSB6IgogICBpZD0icGF0aDUiCiAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+Cjwvc3ZnPg==';

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
		blob.url = self.domain + '/' + blob.hash;
		return blob;
	};

	var renderAlbum = function(target, media, options) {
		var album = document.createElement('div');
		album.className = 'mediacrush-album';
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
		brand.className = 'mediacrush-brand';
		var image = document.createElement('img');
		image.src = self.logo;
		image.width = 16; image.height = 16;
		brand.appendChild(image);
		var span = document.createElement('span');
		span.textContent = 'MediaCrush';
		brand.appendChild(span);
		album.appendChild(brand);

		album.index = 0;
		var mediaDiv;
		function renderPage() {
			if (mediaDiv)
				mediaDiv.parentElement.removeChild(mediaDiv);
			mediaDiv = document.createElement('div');
			mediaDiv.className = 'mediacrush';
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
		var image = document.createElement('img');
		image.style.maxWidth = modules['showImages'].options.maxWidth.value + 'px';
		image.style.maxHeight = modules['showImages'].options.maxHeight.value + 'px';

		image.src = media.files[0].url;
		modules['showImages'].makeImageZoomable(image);
		link.appendChild(image);
		target.appendChild(link);
	}

	var renderMedia = function(target, media, options, callback) {
		if (media.blob_type === "video") {
			RESTemplates.load('VideoUI', function(template) {
				var video = {
					loop: media.type === 'image/gif',
					autoplay: media.type === 'image/gif',
					muted: media.type === 'image/gif',
					download: 'https://mediacru.sh/download/' + media.original,
					brand: {
					  'url': 'https://mediacru.sh/' + media.hash,
					  'img': self.logo,
					  'name': 'MediaCrush'
					}
				};
				if (media.flags) {
					if (media.flags.loop) video.loop = media.flags.loop;
					if (media.flags.autoplay) video.autoplay = media.flags.autoplay;
					if (media.flags.mute) video.muted = media.flags.mute;
				}
				video.sources = [];
				for (var i = 0; i < media.files.length; i++) {
					if (media.files[i].type.indexOf('video/') != 0) {
						continue;
					}
					video.sources.push({ source: media.files[i].url });
				}
				var jElement = template.html(video);
				$(target).append(jElement);
				var element = jElement.get()[0];
				new MediaPlayer(element);
				modules['showImages'].makeImageZoomable(element.querySelector('video'));
			});
		} else if (media.blob_type === "audio") {
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
						if (blob.length != 12)
							continue;
						result[blob].hash = blob;
						if (result[blob] == null) {
							array.push(result[blob]);
							dictionary[blob] = result[blob];
						} else {
							var media = createMediaObject(result[blob]);
							media.hash = blob;
							array.push(media);
							dictionary[blob] = media;
						}
					}
					if (callback)
						callback(array, dictionary);
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
	 * Translates a .mediacrush div into an embedded MediaCrush object.
	 */
	self.render = function(element, callback) {
		var hash = element.getAttribute('data-media');
		var options = '';
		if (hash.indexOf('#') == 12) {
			options = hash.split('#')[1];
			hash = hash.split('#')[0];
		}
		self.get(hash, function(media) {
			if (media.type.indexOf('image/') == 0 && media.type != 'image/gif') {
				renderImage(element, media, callback);
			} else {
				renderMedia(element, media, options, callback);
			}
		});
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
    $(media).closest(".md").css("max-width", "none");
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
