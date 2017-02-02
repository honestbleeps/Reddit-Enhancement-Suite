/* @flow */

import { Host } from '../../core/host';
import { DAY, string, Thing, getPostMetadata } from '../../utils';
import { ajax } from '../../environment';

export default new Host('ireddit', {
	name: 'ireddit',
	domains: ['i.redd.it'],
	options: {
		useiReddit: {
			title: 'iredditUseIReddItTitle',
			description: 'iredditUseIReddItDesc',
			value: false,
			type: 'boolean',
		},
	},
	detect: (url, thing) => thing && thing.isPost() && thing.id(),
	async handleLink(href, id) {
		let postMetadata = await getPostMetadata({ id: id.replace('t3_', '') });
		newhref = postMetadata.preview.images[0].source.url; //got the url!
		return {
			type: 'IMAGE',
			src: newhref,
		};
	},
});
