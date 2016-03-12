addModule('pageNavigator', (module, moduleID) => {
	module.moduleName = 'Page Navigator';
	module.category = 'Browsing';
	module.description = 'Adds an icon to every page that takes you to the top when clicked.';
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			addElements();
		}
	};

	function addElements() {
		const $backToTop = $('<a class="pageNavigator res-icon" data-id="top" href="#header" alt="back to top">&#xF148;</a>');
		$backToTop.on('click', '[data-id="top"]', e => {
			e.preventDefault();
			RESUtils.scrollTo(0, 0);
		});
		modules['floater'].addElement($backToTop);
	}
});
