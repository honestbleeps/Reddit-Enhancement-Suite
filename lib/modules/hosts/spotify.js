export default {
	moduleID: 'spotify',
	name: 'spotify',
	domains: ['spotify.com'],
	logo: '//spotify.com/favicon.ico',
	/*
	* Match the following:
	* https://open.spotify.com/track/id
	* https://play.spotify.com/artist/id
	* https://play.spotify.com/album/id
	* https://open.spotify.com/user/someUser/playlist/id
	* TODO: Check username restrictions, match with something better than \w+
	*/
	detect: ({ href }) => (/^https:\/\/(?:open|play)\.spotify\.com\/((?:track|artist|album|user\/\w+\/playlist)\/[a-zA-z0-9]+)$/i).exec(href),
	handleLink(href, [, uri]) {
		return {
			type: 'IFRAME',
			embed: `//embed.spotify.com/?uri=spotify:${uri.replace(/\//g, ':')}`,
		};
	},
};
