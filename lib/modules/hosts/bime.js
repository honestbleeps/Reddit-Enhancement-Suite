/* @flow */

import { Host } from '../../core/host';

type Detect = RegExp$matchResult;

export default new Host<Detect, {}>('bime', {
	name: 'Bime Analytics Dashboards',
	domains: ['bime.io'],
	logo: 'https://a.bime.io/assets/favicons/favicon.ico',
	detect: ({ href }) => (/https?:\/\/([^.]+)\.bime\.io(?:\/([a-z0-9_-]+))+/i).exec(href),
	handleLink: (href, detect) => {
		if (Array.isArray(detect)) {
			const [, user, dashboardId] = detect;

			return ({
				type: 'IFRAME',
				embed: `https://${user}.bime.io/dashboard/${dashboardId}`,
				expandoClass: 'selftext',
				width: '960px',
				height: '540px',
			});
		}
		return Promise.reject(new Error('path not detected'));
	},
});
