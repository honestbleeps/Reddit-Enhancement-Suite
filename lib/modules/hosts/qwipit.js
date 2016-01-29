addLibrary('mediaHosts', 'qwipit', {
	domains: ['qwip.it'],
	attribution: false,
	detect: function(href, elem) {
		return $(elem).closest('.entry').find('.expando-button.video:not(.commentImg)').length === 0;
	},
	handleLink: function(elem) {
		var def = $.Deferred();
		var hashRe = /^https?:\/\/?qwip\.it\/([\w]+)\/([\w]+)/i;
		var groups = hashRe.exec(elem.href);
		if (groups) {
			def.resolve(elem, '//qwip.it/reddit/' + groups[2] );
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', info);
		elem.setAttribute('data-height', '375px');
		elem.setAttribute('data-width', '485px');
		return $.Deferred().resolve(elem).promise();
	}
});
