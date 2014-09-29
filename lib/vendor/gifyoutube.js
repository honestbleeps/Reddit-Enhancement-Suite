// gifyoutube.js borrows extremely heavily from gfycat.js, with some removals
// and adjustments to fit gifyoutube's own UI
(function () {
	var gifyoutubeObject;

	gifyoutubeObject = function (element, url) {
		var ctrlPausePlay;
		var ctrlSlower;
		var ctrlFaster;
		var vid;
		var mp4src;
		var webmsrc;
		var frameRate = 30;

		vid = element.querySelector('.gifyoutubeVid');
		ctrlPausePlay = element.querySelector('.gifyoutubeCtrlPause');
		ctrlSlower = element.querySelector('.gifyoutubeCtrlSlower');
		ctrlFaster = element.querySelector('.gifyoutubeCtrlFaster');
		mp4src = element.querySelector('.gifyoutubemp4src');
		webmsrc = element.querySelector('.gifyoutubewebmsrc');
		ctrlSlower.onclick = slower;
		ctrlFaster.onclick = faster;
		ctrlPausePlay.onclick = pauseClick;
		vid.onpause = vid.onplay = pauseEvent;
		var speed = getURLParameters('speed', url);
		var frameNum = getURLParameters('frameNum', url);

		if (speed) {
			vid.playbackRate = speed;
		}

		if (frameNum) {
			vid.addEventListener('loadeddata', function() {
				vid.pause();
			}, false);
		}

		function stepForward() {
			vid.currentTime += (1 / frameRate);
		}

		function stepBackward() {
			vid.currentTime -= (1 / frameRate);
		}

		function getURLParameters(paramName, s_url) {
			if (s_url && s_url.indexOf("?") > 0) {
				var s_query = s_url.split("?");
				var params = s_query[1].split("&");
				var paramNames = new Array(params.length);
				var paramValues = new Array(params.length);
				var i = 0;
				for (i = 0; i < params.length; i++) {
					var thisParam = params[i].split("=");
					paramNames[i] = thisParam[0];
					if (thisParam[1] !== "")
						paramValues[i] = unescape(thisParam[1]);
					else
						paramValues[i] = "No Value";
				}

				for (i = 0; i < params.length; i++) {
					if (paramNames[i] === paramName) {
						return paramValues[i];
					}
				}
				return 0;
			}
		}

	function pauseEvent() {
	if (vid.paused) {
		ctrlPausePlay.innerHTML="&#xf16b;";
		ctrlSlower.innerHTML="&#xf169;";
		ctrlFaster.innerHTML="&#xf16d;"
		ctrlSlower.onclick = stepBackward;
		ctrlFaster.onclick = stepForward;
	} else {
		ctrlPausePlay.innerHTML="&#xf16c;";
		ctrlSlower.innerHTML="&#xf169;";
		ctrlFaster.innerHTML="&#xf16d;"
		ctrlSlower.onclick = slower;
		ctrlFaster.onclick = faster;
	}
	}

		function pauseClick() {
			if (vid.paused) {
				vid.play();
			} else {
				vid.pause();
			}
			pauseEvent();
		}

		function faster() {
			if (vid.playbackRate <= 1) {
				vid.playbackRate = vid.playbackRate * 2;
			} else {
				vid.playbackRate = parseFloat(vid.playbackRate) + 1;
			}
		}

		function slower() {
			if (vid.playbackRate <= 1)
				vid.playbackRate = vid.playbackRate / 2;
			else
				vid.playbackRate--;
		}
	}
	window.gifyoutubeObject = gifyoutubeObject;
}).call(this);
