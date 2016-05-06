import { $ } from '../../vendor';

export default {
	moduleID: 'defaultAudio',
	name: 'defaultAudio',
	domains: [],
	audioDetect: document.createElement('AUDIO'),
	detect(href) {
		const acceptRegex = /^[^#]+?\.(opus|weba|ogg|wav|mp3|flac)(?:[?&#_].*|$)/i;
		const rejectRegex = /(?:onedrive\.live\.com)/i;

		// important that acceptRegex is last (the returned value)
		return !rejectRegex.test(href) && acceptRegex.exec(href);
	},
	handleLink(elem, [, extension]) {
		// Change weba and opus to their correct containers.
		if (extension === 'weba') extension = 'webm';
		if (extension === 'opus') extension = 'ogg';

		const format = `audio/${extension}`;

		// Only add the inline audio player if the users browser
		// 'probably' or 'maybe' supports the linked audio format.
		// This should cover most aduio problems. You can never be
		// sure if the client supports the codecs used in the container.
		if (this.audioDetect.canPlayType(format) === '') {
			throw new Error(`Format ${format} unsupported.`);
		}

		elem.type = 'AUDIO';

		elem.expandoOptions = {
			autoplay: true,
			loop: false,
		};

		$(elem).data('sources', [{
			file: elem.href,
			type: format,
		}]);
	},
};
