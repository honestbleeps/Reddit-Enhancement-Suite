(function () {
    var gfyObject;

    gfyObject = function (element, url, gfyFrameRate) {
        var ctrlPausePlay;
        var ctrlSlower;
        var ctrlFaster;
        var ctrlReverse;
        var vid;
        var mp4src;
        var webmsrc;
        var isReverse = false;
        var ctrlBox;
        var isOverVid = false;
        var isOverCtrl = false;

        ctrlBox = element.querySelector('.ctrlBox');
        vid = element.querySelector('.gfyRVid');
        ctrlReverse = element.querySelector('.gfyRCtrlReverse');
        ctrlPausePlay = element.querySelector('.gfyRCtrlPause');
        ctrlSlower = element.querySelector('.gfyRCtrlSlower');
        ctrlFaster = element.querySelector('.gfyRCtrlFaster');
        mp4src = element.querySelector('.gfyRmp4src');
        webmsrc = element.querySelector('.gfyRwebmsrc');
        ctrlSlower.onclick = slower;
        ctrlFaster.onclick = faster;
        ctrlPausePlay.onclick = pauseClick;
        ctrlReverse.onclick = reverse;
        element.onmouseover = ctrlOnMouseOver;
        element.onmouseout = ctrlOnMouseOut;
        var speed = getURLParameters('speed', url);
        var direction = getURLParameters('direction', url);
        var frameNum = getURLParameters('frameNum', url);

        if (speed) {
            vid.playbackRate = speed;
        }

        if (direction && direction == 'reverse') {
            if (!isReverse) {
                reverse();
            }
        }

        if (frameNum) {
            vid.pause();
            vid.currentTime = (frameNum / gfyFrameRate);
        }

        function stepForward() {
            vid.currentTime += (1 / gfyFrameRate);
        }

        function ctrlOnMouseOver() {
            ctrlBox.style.display = "block";
        }

        function ctrlOnMouseOut() {
            ctrlBox.style.display = "none";
        }

        function stepBackward() {
            vid.currentTime -= (1 / gfyFrameRate);
        }

        function getURLParameters(paramName, s_url) {
            if (s_url.indexOf("?") > 0) {
                var s_query = s_url.split("?");
                var params = s_query[1].split("&");
                var paramNames = new Array(params.length);
                var paramValues = new Array(params.length);
                var i = 0;
                for (i = 0; i < params.length; i++) {
                    var thisParam = params[i].split("=");
                    paramNames[i] = thisParam[0];
                    if (thisParam[1] != "")
                        paramValues[i] = unescape(thisParam[1]);
                    else
                        paramValues[i] = "No Value";
                }

                for (i = 0; i < params.length; i++) {
                    if (paramNames[i] == paramName) {
                        return paramValues[i];
                    }
                }
                return 0;
            }
        }

        function pauseClick() {
            if (vid.paused) {
                vid.play();
                ctrlPausePlay.style.backgroundPosition = '-95px 0';
                ctrlSlower.style.backgroundPosition = '-165px 0';
                ctrlFaster.style.backgroundPosition = '-20px 0';
                ctrlFaster.style.width = "14px";
                ctrlSlower.style.marginLeft = "0px";
                ctrlSlower.onclick = slower;
                ctrlFaster.onclick = faster;
            } else {
                vid.pause();
                ctrlPausePlay.style.backgroundPosition = '-71px 0';
                ctrlSlower.style.backgroundPosition = '0 0';
                ctrlSlower.style.marginLeft = "6px";
                ctrlFaster.style.backgroundPosition = '-192px 0';
                ctrlFaster.style.width = "8px";
                ctrlSlower.onclick = stepBackward;
                ctrlFaster.onclick = stepForward;
            }
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

        function reverse() {
            if (isReverse) {
                mp4src.src = mp4src.src.replace(/-reverse\.mp4/g, ".mp4");
                webmsrc.src = webmsrc.src.replace(/-reverse\.webm/g, ".webm");
                ctrlReverse.style.backgroundPosition = '-46px 0';
                isReverse = false;
            } else {
                mp4src.src = mp4src.src.replace(/\.mp4/g, "-reverse.mp4");
                webmsrc.src = webmsrc.src.replace(/\.webm/g, "-reverse.webm");
                ctrlReverse.style.backgroundPosition = '-141px 0';
                isReverse = true;
            }
            vid.load();
            vid.pause();
            pauseClick();
        }
    }
    window.gfyObject = gfyObject;
}).call(this);
