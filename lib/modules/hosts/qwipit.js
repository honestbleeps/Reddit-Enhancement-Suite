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
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `//qwip.it/reddit/${hash}`);
		elem.setAttribute('data-height', '375px');
		elem.setAttribute('data-width', '485px');
	},
};
