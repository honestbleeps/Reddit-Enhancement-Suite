addModule('context', function(module, moduleID) {
	module.moduleName = 'Context';
	module.category = 'Comments';
	module.description = 'Adds a link to the yellow infobar to view deeply linked comments in their full context.';
	module.options = {
		viewFullContext: {
			type: 'boolean',
			value: true,
			description: 'Add a "View the Full Context" link when on a comment link'
		},
		defaultContext: {
			type: 'text',
			value: '3',
			description: 'Change the default context value on context link'
		}
	};
	module.include = [
		'comments',
		'inbox',
		'profile'
	];
	module.go = function() {
		if (this.isEnabled() && this.isMatchURL()) {
			if (RESUtils.isPageType('comments') && this.options.viewFullContext.value) {
				addViewFullContext();
			}
			if (RESUtils.isPageType('inbox', 'profile') && !isNaN(this.options.defaultContext.value) && this.options.defaultContext.value >= 0) {
				setDefaultContext();
				RESUtils.watchForElement('siteTable', setDefaultContext);
			}
		}
	};

	function addViewFullContext() {
		if (location.search !== '?context=10000') {
			var pInfobar = document.querySelector('.infobar:not(#searchexpando) p');
			if (pInfobar) {
				// check if there is a Parent button; if not, it's a top comment so don't show full context link
				if ($('.sitetable:eq(1) .buttons:first .bylink').length > 1) { // Permalink and Parent have bylink class
					pInfobar.innerHTML += '&nbsp;<a href="?context=10000">view the full context</a>&nbsp;→';
				}
			}
		}
	}

	function setDefaultContext(ele) {
		ele = ele || document;
		$(ele).find('.bylink').each(function() {
			this.setAttribute('href', this.getAttribute('href').replace(/\?context=[0-9]+$/, '?context=' + module.options.defaultContext.value));
		});
	}
});
