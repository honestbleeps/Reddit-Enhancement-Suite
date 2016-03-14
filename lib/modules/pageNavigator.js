addModule('pageNavigator', {
	moduleName: 'Post Navigator',
	category: 'Browsing',
	description: 'Provides a post navigation tool to get you up and down the page',
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESTemplates.load('pageNavigator-CSS', function(template) {
				RESUtils.addCSS(template.text());
			});


			RESUtils.init.await.beforeLoad('floater').done(this._addElements.bind(this));
		}
	},
	_addElements: function () {
		var backToTop = $('<a class="pageNavigator res-icon" data-id="top" href="#header" alt="back to top">&#xF148;</a>');
		backToTop.on('click', '[data-id="top"]', function(e) {
			e.preventDefault();
			RESUtils.scrollTo(0, 0);
		});
		modules['floater'].addElement(backToTop);
	}
});
