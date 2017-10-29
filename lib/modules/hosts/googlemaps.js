/* @flow */

import { Host } from '../../core/host';
// Formats
// https://www.reddit.com/r/canada/comments/75r279/til_ontarios_only_land_border_with_the_united/
// https://www.reddit.com/r/FoundOnGoogleMaps/
// https://www.reddit.com/r/FoundOnGoogleMaps/comments/22gx79/didnt_realize_there_was_a_limit_instead_im_just/
export default new Host('googlemaps', {
	domains: ['maps.google.ca', 'maps.google.com'],
	logo: 'https://maps.google.com/favicon.ico',
	name: 'Google Maps',
	detect: ({searchParams}) => {
		return searchParams;
	},
	handleLink(href, searchParams) {
		let coords, zoom;

		console.log(searchParams.toString());


		if(searchParams.has('ll')){
			coords = searchParams.get('ll');
			zoom = searchParams.get('z');
		}

		// h@48.0549526,-91.4592687,14z

		const embed = `https://www.google.com/maps/embed/v1/place?center=${coords}&zoom=${zoom}&q=${coords}`; //maptype=satellite

		return {
			type: 'IFRAME',
			embed,
		};
	},
});
