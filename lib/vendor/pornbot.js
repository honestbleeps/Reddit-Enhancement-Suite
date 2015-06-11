//Borrowed heavily from imgurgifv.js
(function () {
	var pornbotObject;

	pornbotObject = function (element, url, fallback) {
		var vid;
		var mp4src;
		var webmsrc;
		var pauseEvent; // for future use?

		vid = element.querySelector('.pornbotVid');
		mp4src = element.querySelector('.pbRmp4src');
		webmsrc = element.querySelector('.pbRwebmsrc');
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
	window.pornbotObject = pornbotObject;
}).call(this);
