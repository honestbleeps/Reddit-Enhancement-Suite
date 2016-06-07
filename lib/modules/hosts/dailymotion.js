export default {
	moduleID: 'dailymotion',
	name: 'dailymotion',
	domains: ['dailymotion.com'],
	logo: 'https://static1.dmcdn.net/images/favicons/favicon-32x32.png.vb5b47df6329123929',
	detect: ({ href }) => (/^https?:\/\/(?:(?:www|touch)\.)?dailymotion.com[\w\-\/:#]+video[\/=]([a-z0-9]+)/i).exec(href),
	handleLink(href, [, hash]) {
		const embed = `//www.dailymotion.com/embed/video/${hash}?api=postMessage`;

		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}&autoplay=1`,
			pause: 'pause',
			play: 'play',
		};
	},
};
