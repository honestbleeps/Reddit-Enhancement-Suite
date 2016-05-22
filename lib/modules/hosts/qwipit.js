import { $ } from '../../vendor';

export default {
	moduleID: 'qwipit',
	name: 'qwipit',
	domains: ['qwip.it'],
	attribution: false,
	detect(href, elem) {
		// don't override reddit's expando
		return $(elem).closest('.entry').find('.expando-button.video:not(.commentImg)').length === 0 &&
			(/^https?:\/\/?qwip\.it\/[\w]+\/([\w]+)/i).exec(href);
	},
	handleLink(elem, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `//qwip.it/reddit/${hash}`,
			height: '375px',
			width: '485px',
		};
	},
};
