addLibrary('mediaHosts', 'coub', {
	domains: [ 'coub.com' ],
	logo: '//coub.com/favicon.ico',

	name: 'Coub',

	detect: function(href, elem) {
		return href.indexOf('coub.com/view') !== -1 || href.indexOf('coub.com/embed') !== -1;
	},

	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/coub\.com\/(view|embed)\/([\w]+)(\.gifv)?/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			if (groups[3]) {
				def.resolve(elem, '//coub.com/view/' + groups[2] + '.gifv?res=true' );
			} else {
				def.resolve(elem, '//coub.com/embed/' + groups[2] + '?autoplay=true&res=true');
			}
		} else {
			def.reject();
		}
		return def.promise();
	},

	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-pause', 'stop');
		elem.setAttribute('data-play', 'play');
		return $.Deferred().resolve(elem).promise();
	}
});
