addModule('floater', function(module, moduleID) {
	module.category = 'About RES';
	module.moduleName = 'Floating Islands';
	module.description = 'Managing free-floating RES elements';
	module.alwaysEnabled = true;

	var defaultContainer = 'visibleAfterScroll';
	var containers = {
		visibleAfterScroll: {
			renderElement: function() {
				return RESUtils.createElement('div', 'NREFloat');
			},
			css: function() {
				var offset = this.getOffset();
				var css = '#NREFloat { position: fixed; top: ' + offset + 'px; right: 8px; display: none; }';
				return css;
			},
			go: function() {
				window.addEventListener('scroll', RESUtils.debounce.bind(RESUtils, 'scroll.floater', 300, this.onScroll.bind(this)));
				setTimeout(this.onScroll.bind(this), 500);
			},
			getOffset: function() {
				if (typeof this._offset !== 'number') {
					this._offset = 5 + RESUtils.getHeaderOffset();
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
	}

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
	}

	module.addElement = function(element, containerName) {
		var container = containers[containerName] || containers[defaultContainer];
		$(container.element).append(element);
	};

});
