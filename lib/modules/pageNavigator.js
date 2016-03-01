addModule('pageNavigator', function(module, moduleID) {
	module.moduleName = 'Page Navigator';
	module.category = 'Browsing';
	module.description = 'Adds an icon to every page that takes you to the top when clicked.';
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			addElements();
		}
	};

	function addElements() {
		var backToTop = $('<a class="pageNavigator res-icon" data-id="top" href="#header" title="back to top">&#xF148;</a>');
		backToTop.on('click', '[data-id="top"]', function(e) {
			e.preventDefault();
			RESUtils.scrollTo(0, 0);
		});
		modules['floater'].addElement(backToTop);
	}
});
