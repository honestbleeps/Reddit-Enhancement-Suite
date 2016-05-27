export default {
	moduleID: 'strawpoll',
	name: 'strawpoll',
	domains: ['strawpoll.me'],
	attribution: false,
	detect: ({ href }) => (/^https?:\/\/(?:www\.)?strawpoll\.me\/(?:embed_[0-9]\/)?([0-9]*)/i).exec(href),
	handleLink(href, [, uid]) {
		return {
			type: 'IFRAME',
			expandoClass: 'selftext',
			muted: true,
			embed: `//strawpoll.me/embed_1/${uid}`,
			height: '500px',
			width: '95%',
			maxwidth: '700px',
		};
	},
};
