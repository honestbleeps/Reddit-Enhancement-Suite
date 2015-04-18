addModule('postNavigator', function(module, moduleID) { $.extend(true, module, {
	moduleName: 'Post Navigator',
	category: 'Posts',
	description: 'Provides a post navigation tool to get you up and down the page',
	options: {
		alwaysShow: {
			type: 'boolean',
			value: true,
			description: 'Show this every time you load the page'
		},
	},
	include: [
		'linklist'
	],
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESModules.load('postNavigatorCSS', function(template) {
				RESUtils.addCSS(template.text());
			});

			RESModules.load('postNavigator', (function(template) {
				var $container = template.html();

				modules['floater'].addElement($container);
			}).bind(this);
		}
	}
}); });
