addLibrary('mediaHosts', 'pastebin', {
	domains: ['pastebin.com'],
	attribution: false,
	options: {
		width: {
			description: 'The maximum width of pastebin expandos. (any valid CSS width, default 80em)',
			value: '80em',
			type: 'text'
		}
	},
	detect: function(href, elem) {
		return href.indexOf('pastebin.com/') !== -1;
	},
	handleLink: function(elem) {
		var def = $.Deferred(),
			groups = (/^https?:\/\/(?:www\.)?pastebin\.com\/(?:raw\.php\?i=|index\/)?([a-z0-9]{8})/i).exec(elem.href);
		if (groups) {
			def.resolve(elem, '//pastebin.com/embed_iframe.php?i=' + groups[1]);
		} else {
			def.reject();
		}
		return def.promise();
	},
	handleInfo: function(elem, info) {
		var generate = function(options) {
			var element = document.createElement('iframe');
			element.src = info;
			element.style.width = modules['showImages'].siteModules['pastebin'].options.width.value;
			element.style.maxWidth = 'calc(100% - 2px)';
			element.style.height = '500px';
			element.style.border = '1px solid #CCC';
			return element;
		};
		elem.type = 'GENERIC_EXPANDO';
		elem.expandoClass = ' selftext';
		elem.expandoOptions = {
			generate: generate,
			media: info
		};
		return $.Deferred().resolve(elem).promise();
	}
});
