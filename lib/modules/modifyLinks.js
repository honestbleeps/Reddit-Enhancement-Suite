addModule('modifyLinks', function(module, moduleID) {
	module.moduleName = 'Modify Links';
	module.category = 'Browsing';
	module.description = 'This module modifies links';
	module.options = {
		domains: [
			{
				domain: 'wikipedia.org',
				match: /(\b.m.wikipedia.)\w+/,
				find: '.m.',
				replace: '.'
			},
		],
	};

	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			var links = document.getElementsByTagName('a');
			for (var i = 0; i < this.options.domains.length; i++) {
				var domain = this.options.domains[i];
				for (var j = 0; j < links.length; j++) {
					if (domain.match.test(links[j].hostname)) {
						links[j].hostname = links[j].hostname.replace(domain.find, domain.replace);
					}
				}
			}
		}
	};
});
