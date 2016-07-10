export default {
	moduleID: 'bime',
	name: 'Bime Analytics Dashboards',
	domains: ['bime.io'],
	logo: '//a.bime.io/assets/favicons/favicon.ico',
	detect: ({ href }) => (/https?:\/\/([^.]+)\.bime\.io(?:\/([a-z0-9_-]+))+/i).exec(href),
	handleLink: (href, [, user, dashboardId]) => ({
		type: 'IFRAME',
		embed: `//${user}.bime.io/dashboard/${dashboardId}`,
		expandoClass: 'selftext',
		width: '960px',
		height: '540px',
	}),
};
