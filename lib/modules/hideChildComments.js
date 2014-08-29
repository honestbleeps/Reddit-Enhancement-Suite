modules['hideChildComments'] = {
	moduleID: 'hideChildComments',
	moduleName: 'Hide Child Comments',
	category: 'Comments',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		automatic: {
			type: 'boolean',
			value: false,
			description: 'Automatically hide all but parent comments, or provide a link to hide them all?'
		},
		interactiveChilds: {
			type: 'boolean',
			value: false,
			description: 'Add a link to navigate between childs comments by hovering parents.'
		}
		automaticInteractive: {
			type: 'boolean',
			value: false,
			description: 'Automatically active the interactive mode.'
			dependsOn: 'interactiveChilds'
		}
	},
	description: 'Allows you to hide all comments except for replies to the OP for easier reading.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'comments'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var toggleButton = document.createElement('li');
			this.toggleAllLink = document.createElement('a');
			this.toggleAllLink.textContent = 'hide all child comments';
			this.toggleAllLink.setAttribute('action', 'hide');
			this.toggleAllLink.setAttribute('href', 'javascript:void(0);');
			this.toggleAllLink.setAttribute('title', 'Show only replies to original poster.');
			this.toggleAllLink.addEventListener('click', function() {
				modules['hideChildComments'].toggleComments(this.getAttribute('action'));
				if (this.getAttribute('action') === 'hide') {
					this.setAttribute('action', 'show');
					this.setAttribute('title', 'Show all comments.');
					this.textContent = 'show all child comments';
				} else {
					this.setAttribute('action', 'hide');
					this.setAttribute('title', 'Show only replies to original poster.');
					this.textContent = 'hide all child comments';
				}
			}, true);
			toggleButton.appendChild(this.toggleAllLink);
			
			if (this.options.interactiveChilds.value) {
				var toggleInteractiveButton = document.createElement('li');
				this.toggleInteractive = document.createElement('a');
				this.toggleInteractive.textContent = 'enable interactive childs';
				this.toggleInteractive.setAttribute('action', 'enable');
				this.toggleInteractive.setAttribute('href', 'javascript:void(0);');
				this.toggleInteractive.setAttribute('title', 'Show childs only when overing parents.');
				this.toggleInteractive.addEventListener('click', function() {
					if (this.getAttribute('action') === 'enable') {
						this.setAttribute('action', 'disable');
						this.textContent = 'disable interactive childs';
						modules['hideChildComments'].interactiveCSS = RESUtils.addCSS('.commentarea .thing { display: none; } .commentarea > div > .thing { display: block; } .commentarea .thing:hover > .child > div > .thing { display: block;}');
					} else {
						this.setAttribute('action', 'enable');
						this.textContent = 'enable interactive childs';
						modules['hideChildComments'].interactiveCSS.remove();
					}
				}, true);
				toggleInteractiveButton.appendChild(this.toggleInteractive);
			}
			
			var commentMenu = document.querySelector('ul.buttons');
			if (commentMenu) {
				commentMenu.appendChild(toggleButton);
				if (toggleInteractiveButton) {
					commentMenu.appendChild(toggleInteractiveButton);
				}
				var rootComments = document.querySelectorAll('div.commentarea > div.sitetable > div.thing > div.child > div.listing');
				for (var i = 0, len = rootComments.length; i < len; i++) {
					var toggleButton = document.createElement('li');
					var toggleLink = document.createElement('a');
					toggleLink.setAttribute('data-text','hide child comments');
					toggleLink.setAttribute('action', 'hide');
					toggleLink.setAttribute('href', 'javascript:void(0);');
					toggleLink.setAttribute('class', 'toggleChildren noCtrlF');
					// toggleLink.setAttribute('title','Hide child comments.');
					toggleLink.addEventListener('click', function(e) {
						modules['hideChildComments'].toggleComments(this.getAttribute('action'), this);
						if (this.getAttribute('action') === 'hide') {
							this.setAttribute('action', 'show');
							// this.setAttribute('title','show child comments.');
							this.setAttribute('data-text', 'show child comments');
						} else {
							this.setAttribute('action', 'hide');
							// this.setAttribute('title','hide child comments.');
							this.setAttribute('data-text','hide child comments');
						}
					}, true);
					toggleButton.appendChild(toggleLink);
					var sib = rootComments[i].parentNode.previousSibling;
					if (typeof sib !== 'undefined') {
						var sibMenu = sib.querySelector('ul.buttons');
						if (sibMenu) sibMenu.appendChild(toggleButton);
					}
				}
				if (this.options.automatic.value) {
					// ensure we're not in a permalinked post..
					var linkRE = /\/comments\/(?:\w+)\/(?:\w+)\/(\w+)/;
					if (! location.pathname.match(linkRE)) {
						RESUtils.click(this.toggleAllLink);
					}
				}
				if (this.options.automaticInteractive.value) {
					// ensure we're not in a permalinked post..
					var linkRE = /\/comments\/(?:\w+)\/(?:\w+)\/(\w+)/;
					if (! location.pathname.match(linkRE)) {
						RESUtils.click(this.toggleInteractive);
					}
				}
			}
		}
	},
	toggleComments: function(action, obj) {
		if (obj) {
			var thisChildren = $(obj).closest('.thing').children('.child').children('.sitetable')[0];
			thisChildren.style.display = (action === 'hide') ? 'none' : 'block';
		} else {
			// toggle all comments
			var commentContainers = document.querySelectorAll('div.commentarea > div.sitetable > div.thing');
			for (var i = 0, len = commentContainers.length; i < len; i++) {
				var thisChildren = commentContainers[i].querySelector('div.child > div.sitetable');
				var thisToggleLink = commentContainers[i].querySelector('a.toggleChildren');
				if (thisToggleLink !== null) {
					if (action === 'hide') {
						if (thisChildren !== null) {
							thisChildren.style.display = 'none';
						}
						thisToggleLink.setAttribute('data-text','show child comments');
						thisToggleLink.setAttribute('action', 'show');
					} else {
						if (thisChildren !== null) {
							thisChildren.style.display = 'block';
						}
						thisToggleLink.setAttribute('data-text','hide child comments');
						thisToggleLink.setAttribute('action', 'hide');
					}
				}
			}
		}
	}
};
