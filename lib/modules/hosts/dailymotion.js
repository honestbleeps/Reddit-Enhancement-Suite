import { $ } from '../../vendor';

export default {
	moduleID: 'dailymotion',
	name: 'dailymotion',
	domains: ['dailymotion.com'],
	logo: 'https://static1.dmcdn.net/images/favicons/favicon-32x32.png.vb5b47df6329123929',
	detect: href => (/^https?:\/\/(?:(?:www|touch)\.)?dailymotion.com[\w\-\/:#]+video[\/=]([a-z0-9]+)/i).exec(href),
	handleLink(elem, [, hash]) {
		const autoplay = modules['showImages'].options.autoplayVideo.value && $(elem).closest('.md').find('.expando-button.video').length === 0;

		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `//www.dailymotion.com/embed/video/${hash}?api=postMessage&html=1&autoplay=${autoplay ? 1 : 0}`);
		elem.setAttribute('data-pause', 'pause');
		elem.setAttribute('data-play', 'play');
	}
};
