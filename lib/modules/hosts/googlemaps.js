/* @flow */

import { Host } from '../../core/host';

export default new Host('googlemaps', {
	domains: ['maps.google.ca', 'maps.google.com', 'google.co.uk', 'google.com', 'google.ca'],
	logo: 'https://maps.google.com/favicon.ico',
	name: 'Google Maps',
	detect: ({ host, searchParams, pathname }) => {
		// Only valid if we can find some coords to display
		if (host.startsWith('maps.') || pathname.startsWith('/maps')) {
			if (searchParams.has('ll') || searchParams.get('q')) {
				// Handle old style maps.google urls
				return [
					searchParams.has('ll') ? searchParams.get('ll') : searchParams.get('q'),
					searchParams.get('z'),
					searchParams.has('maptype') ? searchParams.get('maptype') : 'roadmap',
				];
			} else {
				// Parse new style google map urls
				const location = pathname.split('/').find(part => part.startsWith('@'));
				if (location) {
					const [long, lat, zoom] = location.substring(1).split(',');

					return [
						`${long},${lat}`,
						zoom.endsWith('z') ? zoom : 16, // passing a meter zoom level to maps does not make it happy
						zoom.endsWith('z') ? 'roadmap' : 'satellite',
					];
				}
			}
		}
	},
	handleLink(href, [coords, zoom, mapType]) {
		let embed = `https://www.google.com/maps/embed/v1/view?center=${coords}&key=AIzaSyCtnLZP1XwkgIK53Asx_5qtZa2k9eZcdDc`;
		if (zoom) embed += `&zoom=${zoom}`;
		if (mapType) embed += `&maptype=${mapType}`;

		return {
			type: 'IFRAME',
			embed,
			muted: true,
		};
	},
});
