modules['context'] = {
	moduleID: 'context',
	moduleName: 'Context',
	category: 'Comments',
	options: {
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
	},
	description: 'Adds a link to the yellow infobar to view deeply linked comments in their full context.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: [
		'comments',
		'inbox'
	],
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if ((RESUtils.pageType() === 'comments') && (this.options.viewFullContext.value)) {
				this.addViewFullContext();
			}
			if ((RESUtils.pageType() === 'inbox') && !isNaN(this.options.defaultContext.value) && this.options.defaultContext.value >= 0) {
				this.setDefaultContext();
				RESUtils.watchForElement('siteTable', modules['context'].setDefaultContext);
			}
		}
	},
	addViewFullContext: function() {
		if (location.search !== '?context=10000') {
			var pInfobar = document.querySelector('.infobar:not(#searchexpando) p');
			if(pInfobar) {
				// check if there is a Parent button, if not it's a top comment so don't show full context link
				if($('.sitetable:eq(1) .buttons:first .bylink').length > 1) { // Permalink and Parent have bylink class
					pInfobar.innerHTML += '&nbsp;<a href="?context=10000">view the full context</a>&nbsp;→';
				}
			}
		}
	},
	setDefaultContext: function(ele) {
		var ele = ele || document;
		$(ele).find('.bylink').each(function() {
			this.setAttribute('href',this.getAttribute('href').replace(/\?context=[0-9]+$/,'?context=' + modules['context'].options.defaultContext.value));
		});
	}
};
