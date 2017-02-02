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
	detect: function(mediaurl, element) { //not entirely sure what I'm supposed to return :p
		const { pathname } = element, thing = Thing.from(element);
		if (!thing.isPost()) return; 
		let id = thing.$thing.data('fullname').replace('t3_',''); //To replace with thing.id()
		let postMetadata = getPostMetadata({ id });
		postMetadata.then(function (data) {
			let newmediaurl = data.preview.images[0].source.url; //got the url!
			console.log(newmediaurl); //this also prints
			return true; //this does nothing
		});
	},
	async handleLink(href) {
		console.log(href); //doesn't get logged
		return {
			type: 'IMAGE',
			src: href,
		};
	},
});
