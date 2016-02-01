addLibrary('mediaHosts', 'giphy', {
	domains: ['giphy.com'],

	// URL examples with each regex

	// https://giphy.com/gifs/6b9QApjUesyOs
	mainSiteRe: /^https?:\/\/(?:www\.)?giphy\.com\/gifs\/(\w+)/i,
	// https://giphy.com/gifs/convert-printable-gifprint-6b9QApjUesyOs
	longMainSiteRe: /^https?:\/\/(?:www\.)?giphy\.com\/gifs\/(?:[a-z0-9-]+)-(\w+)/i,
	// https://media.giphy.com/media/6b9QApjUesyOs/giphy.gif
	// https://media0.giphy.com/media/6b9QApjUesyOs/giphy.gif
	longDirectRe: /^https?:\/\/media[0-9]*\.?giphy\.com\/media\/(\w+)/i,
	// https://i.giphy.com/6b9QApjUesyOs.gif
	shortDirectRe: /^https?:\/\/i\.giphy\.com\/(\w+)/i,

	detect: (href, elem) => href.indexOf('giphy.com') !== -1,

	handleLink(elem) {
		const def = $.Deferred();
		const siteMod = modules['showImages'].siteModules['giphy'];
		const groups =  siteMod.longMainSiteRe.exec(elem.href) || siteMod.mainSiteRe.exec(elem.href) ||
						siteMod.longDirectRe.exec(elem.href) || siteMod.shortDirectRe.exec(elem.href);

		if (!groups) return def.reject();

		const giphyUrl = location.protocol + '//giphy.com/gifs/' + groups[1];
		const mp4Url = location.protocol + '//media.giphy.com/media/' + groups[1] + '/giphy.mp4';
		const gifUrl = location.protocol + '//media.giphy.com/media/' + groups[1] + '/giphy.gif';

		def.resolve(elem, { giphyUrl, mp4Url, gifUrl });

		return def.promise();
	},

	handleInfo(elem, info) {
		let def = modules['showImages'].siteModules['giphy']._handleGifv(elem, info);

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

	// Based off imgur.js' gifv functions
	_handleGifv(elem, info) {
		var siteMod = modules['showImages'].siteModules['giphy'],
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

	_generateGifv(elem, info) {
		var template = RESTemplates.getSync('imgurgifvUI');
		var video = {
			siteName: 'giphy',
			siteIcon: '//giphy.com/favicon.ico',
			siteUrl: info.giphyUrl,
			loop: true,
			autoplay: true, // imgurgifv will always be muted, so autoplay is OK
			muted: true,
			directurl: elem.href,
		};
		video.sources = [
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
	},
});
