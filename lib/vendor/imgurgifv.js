// imgurgifv.js borrows extremely heavily from gfycat.js, with some removals
// and adjustments to fit imgurgifv's own UI
(function () {
	var imgurgifvObject;

	imgurgifvObject = function (element, url, fallback) {
		var vid;
		var mp4src;
		var webmsrc;
		var pauseEvent; // for future use?

		vid = element.querySelector('.imgurgifvVid');
		mp4src = element.querySelector('.imgurgifvmp4src');
		webmsrc = element.querySelector('.imgurgifvwebmsrc');
		vid.onpause = vid.onplay = pauseEvent;

		var sources = vid.querySelectorAll('source');
		var lastSource = sources[sources.length-1];
		lastSource.addEventListener('error', function(e) {
			var fallbackLink = document.createElement('a'),
				fallbackImg = document.createElement('img'),
				vid = e.target.parentNode,
				player = vid.parentNode;

			fallbackImg.src = fallback;
			fallbackImg.className = 'RESImage';
			fallbackLink.href = url;
			fallbackLink.target = '_blank';
			fallbackLink.appendChild(fallbackImg);

			player.parentNode.replaceChild(fallbackLink, player);
			modules['showImages'].makeMediaZoomable(fallbackImg);
			modules['showImages'].makeMediaMovable(fallbackImg);
		}, false);

	}
	window.imgurgifvObject = imgurgifvObject;
}).call(this);
