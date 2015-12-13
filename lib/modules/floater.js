addModule('floater', function(module, moduleID) {
	module.category = ['Productivity'];
	module.moduleName = 'Floating Islands';
	module.description = 'Managing free-floating RES elements';
	module.alwaysEnabled = true;

	var defaultContainer = 'visibleAfterScroll';
	var containers = {
		visibleAfterScroll: {
			renderElement: function() {
				var container = RESUtils.createElement('div', 'NREFloat', 'res-floater-visibleAfterScroll');
				container.appendChild(document.createElement('ul'));
				return container;
			},
			css: function() {
				RESTemplates.load('floater-visibleAfterScroll-CSS', (function(template) {
					RESUtils.addCSS(template.text({
						offset: this.getOffset()
					}));
				}).bind(this));
			},
			go: function() {
				window.addEventListener('scroll', RESUtils.debounce.bind(RESUtils, 'scroll.floater', 300, this.onScroll.bind(this)));
				setTimeout(this.onScroll.bind(this), 500);
			},
			add: function(element, options) {
				if (options && options.separate) {
					$(this.element).append(element);
				} else {
					var container = $('<li />');
					container.append(element);
					$(this.element).find('> ul').append(container);
				}
			},
			getOffset: function() {
				if (typeof this._offset !== 'number') {
					this._offset = 5 + RESUtils.getHeaderOffset() + $(RESUtils.getHeaderMenuList()).height();
				}

				return this._offset;
			},
			onScroll: function() {
				var show = $(window).scrollTop() > this.getOffset();
				$(this.element).toggle(show);
			}
		}
	};

	module.beforeLoad = function() {
		$.each(containers, function(name, container) {
			if (!container.element && typeof container.renderElement === 'function') {
				container.element = container.renderElement();
			}
		});
	};

	module.go = function() {
		var elements = $.map(containers, function(container) {
			return container.element;
		});
		$(document.body).append(elements);

		var css = $.map(containers, function(container) {
			var currentCss;
			if (typeof container.css === 'function') {
				currentCss = container.css();
			} else if (typeof container.css !== 'undefined') {
				currentCss = container.css;
			}

			return currentCss;
		}).filter(function(css) {
			return !!css;
		});
		css.forEach(function(css) {
			RESUtils.addCSS(css);
		});

		$.each(containers, function(name, container) {
			if (typeof container.go === 'function') {
				container.go();
			}
		});
	};

	module.addElement = function(element, options) {
		var container = containers[options && options.container] || containers[defaultContainer];
		if (typeof container.add === 'function') {
			container.add(element, options);
		} else {
			$(container.element).append(element);
		}
	};

});
