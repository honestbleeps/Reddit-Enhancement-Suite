addModule('hover', function(module, moduleID) {
	module.moduleName = 'RES Pop-up Hover';
	module.category = 'Core';
	module.description = 'Customize the behavior of the large informational pop-ups which appear when you hover your mouse over certain elements.';
	module.alwaysEnabled = true;

	module.options = {
		instances: {
			description: 'Manage particular pop-ups',
			type: 'table',
			value: [],
			fields: [{
				name: 'name',
				type: 'text'
			}, {
				name: 'enabled',
				type: 'boolean',
				value: true
			}]
		},
		openDelay: {
			type: 'text',
			value: 500
		},
		fadeDelay: {
			type: 'text',
			value: 500
		},
		fadeSpeed: {
			noconfig: true, // broken
			type: 'text',
			value: 0.7
		},
		width:  {
			type: 'text',
			value: 512
		},
		closeOnMouseOut: {
			type: 'boolean',
			value: true
		},
		updatePositionOnScroll: {
			type: 'boolean',
			value: true
		}
	};
	module.beforeLoad = function() {
		for (var option in module.options) {
			if (!module.options.hasOwnProperty(option)) {
				continue;
			}

			var value = module.options[option].value;
			var defaultValue = module.options[option].default;
			if (typeof defaultValue === 'number') {
				value = RESUtils.firstValid(parseFloat(value), defaultValue);
			}

			Hover.prototype._options[option] = value;
		}
	};

	var instances = {};
	module.instance = function getInstance(type, id, hidden) {
		if (typeof type === 'undefined') {
			type = 'infocard'
		}
		if (typeof id === 'undefined') {
			id = '_default';
		}

		if (!instances[type]) {
			instances[type] = {};
		}

		if (!instances[type][id]) {
			instances[type][id] =
				type === 'dropdownList' ? new HoverDropdownList(id) :
				type === 'infocard' ? new HoverInfoCard(id) :
				new Hover(id);

			instances[type][id].enabled((hidden === module.HIDDEN_FROM_SETTINGS)|| isEnabled(type, id));
		}

		return instances[type][id];
	}

	module.HIDDEN_FROM_SETTINGS = true;

	module.infocard = module.instance.bind(module, 'infocard');
	module.dropdownList = module.instance.bind(module, 'dropdownList');

	var isEnabled = function(type, id) {
		var row = findOrMakeRow(type, id);
		return row[1];
	}

	var findOrMakeRow = function(type, id) {
		var name = type + '.' + id;
		var row;
		module.options.instances.value.some(function(value) {
			if (value[0] === name) {
				row = value;
				return true;
			}
		});

		if (!row) {
			row = [ name, true ];
			module.options.instances.value.push(row);
			RESUtils.options.setOption(moduleID, 'instances', module.options.instances.value);
		}

		return row;
	}

	var _updatePositionOnScroll = function() {
		if (module.options.updatePositionOnScroll.value) {
			var onScroll = RESUtils.debounce.bind(RESUtils, 'scroll.' + moduleID, 350, _onScroll);
			window.addEventListener('scroll', onScroll);
		}
		_updatePositionOnScroll = function() { };
	};
	var _onScroll = function() {
		$.each(instances, function(instances) {
			$.each(function(instance) {
				instance.updatePosition();
			});
		});
	}

	function Hover() {
		if (!(this instanceof Hover)) return new Hover(options);

		// this._construct(); // call from extending classes
	}

	Hover.prototype = {
		_options: { }, // populated in beforeLoad
		templateName: 'RESHoverDefault',
		_construct: function(id) {
			this.instanceID = id;
			this._bindAllMethods();
			this.options({});
		},
		_bindAllMethods: function() {
			for (var key in this) {
				if (this.hasOwnProperty(key)) continue;
				if (typeof this[key] !== 'function') continue;

				this[key] = this[key].bind(this);
			}
		},
		enabled: function(enabled) {
			if (typeof enabled !== 'undefined') {
				this._enabled = enabled;
			}

			return this;
		},
		options: function (options) {
			if (typeof options !== 'undefined') {
				this._options = $.extend(true, {}, this._options, options);
			}

			return this;
		},
		context: function(value) {
			if (typeof value !== 'undefined') {
				this._context = value;
			}

			return this;
		},
		target: function(element) {
			if (typeof element !== 'undefined') {
				this.close(true);
				this._target = element;
			}

			return this;
		},
		populateWith: function(value) {
			if (typeof value === 'function') {
				this._callback = value;
			} else if (value || arguments.length > 1) {
				this._contents = [].concat(Array.prototype.slice.call(arguments));
			}

			return this;
		},
		_container: null,
		getContainer: function(callback) {
			if (!this._container) {
				this._container = this._render();
			}

			if (callback) {
				this._container.done(callback);
			}

			return this._container.done;
		},
		_render: function() {
			var deferred = $.Deferred();

			this._addCSS();

			var container = RESTemplates.load(this.templateName, (function(template) {
				var element = template.html();
				this._addContainerHandlers(element);
				deferred.resolve(element);
			}).bind(this));

			return deferred;
		},
		_addContainerHandlers: function($container) {
			$container
				.appendTo(document.body)
				.on('mouseenter', (function() {
					this.cancelHideTimer();
				}).bind(this))
				.on('mouseleave', (function() {
					this.cancelHideTimer();
					if (this._options.closeOnMouseOut) {
						this.startHideTimer();
					}
				}).bind(this))
				.on('click', '.RESCloseButton', (function() {
					this.close(true);
				}).bind(this));
		},
		_addCSS: function() {
			if (module._css) return;
			module._css = true;
			RESTemplates.load('RESHoverStyle', function(template) {
				var css = template.text();
				module._css = RESUtils.addCSS(css) || true;
			});
		},
		begin: function() {
			if (!this._enabled) return false;
			this.startShowTimer();

			this.addShowListeners();
			_updatePositionOnScroll();
		},
		open: function() {
			if (!this._enabled) return false;

			this.getContainer((function($container) {
				if (this._callback) {
					var def = $.Deferred();
					def.promise()
						.progress(this._populate.bind(this, $container))
						.done(this._populate.bind(this, $container))
						.fail(function() { this.close(); });

					this._callback(def, this._target, this._context);
				} else if (this._contents) {
					this._populate.apply(this, [ $container ].concat(this._contents));
				} else {
					this.close();
				}

				$container.show().css({ opacity: 1 }); // nvm fade in, too much trouble
				modules['styleTweaks'].setSRStyleToggleVisibility(false, moduleID + '.' + this.instanceID);
				this.visible = true;
			}).bind(this));
		},
		_populate: function(container/*,  ...contents*/) {
			if (!this._enabled) return false;

			this._contents = this._contents || [];
			var items = Array.prototype.slice.call(arguments, 1);
			var item, element;
			for (var i = 0, length = items.length; i < length; i++) {
				item = items[i];
				if (!item) continue;
				element = container.find('[data-hover-element="' + i + '"]');
				$(element).children().detach(); // allow re-use of elements with jQuery event handlers
				$(element).empty().append(item);
				this._contents[i] = item;
			}

			this._updatePosition(container);
		},
		updatePosition: function() {
			if (!this._enabled) return false;

			this.getContainer(this._updatePosition);
		},
		_updatePosition: function(container) {
			var XY = RESUtils.getXYpos(this._target);

			$container.css({
				top: XY.y,
				left: XY.x,
				position: 'fixed',
				zIndex: 2147483646
			});
		},

		cancelShow: function() {
			this.close(true);
		},
		addShowListeners: function() {
			$(this._target)
				// .on('click', this.cancelShow)
				.on('mouseleave', this.cancelShow);
		},
		clearShowListeners: function() {
			$(this._target)
				// .off('click', this.cancelShow)
				.off('mouseleave', this.cancelShow);
		},
		startShowTimer: function() {
			this.cancelShowTimer();
			this.showTimer = setTimeout(this.afterShowTimer, this._options.openDelay);
		},
		cancelShowTimer: function() {
			clearTimeout(this.showTimer);
			this.showTimer = null;
		},
		afterShowTimer: function() {
			this.cancelShowTimer();
			this.clearShowListeners();
			this.open();

			$(this._target).on('mouseleave', this.startHideTimer);
		},
		startHideTimer: function() {
			clearTimeout(this.hideTimer);
			this.hideTimer = setTimeout(this.afterHideTimer, this._options.fadeDelay);
		},
		cancelHideTimer: function() {
			$(this._target).off('mouseleave', this.startHideTimer);
			clearTimeout(this.hideTimer);
			this.hideTimer = null;
		},
		afterHideTimer: function() {
			this.cancelHideTimer();
			this.close();
		},
		close: function(fade) {
			if (!this._enabled) return false;

			this.clearShowListeners();
			this.cancelShowTimer();
			this.cancelHideTimer();

			if (!this.visible) return;
			this.visible = false;

			this.getContainer((function($container) {
				var afterHide = (function () {
					$container.css({ 'width': null, 'height': null });
				}).bind(this);

				if (fade) {
					$container.css('width', $container.width());
					$container.css('height', $container.height());
					RESUtils.fadeElementOut($container[0], this._options.fadeSpeed, afterHide);
				} else {
					$container.hide(afterHide);
				}
			}).bind(this));

		}
	};

	function HoverInfoCard(id) {
		if (!(this instanceof HoverInfoCard)) return new HoverInfoCard(options);

		this._construct(id);
	}

	HoverInfoCard.prototype = new Hover();
	HoverInfoCard.prototype.templateName = 'RESHoverInfoCard';
	HoverInfoCard.prototype._updatePosition = function($container) {
		var container = $container[0];
		var XY = RESUtils.getXYpos(this._target);

		var width = $(this._target).width();
		var tooltipWidth = $container.width();
		tooltipWidth = this._options.width;

		var windowWidth = window.innerWidth

		if ((windowWidth - XY.x - width) <= tooltipWidth) {
			if (XY.x - tooltipWidth - 30 < 0) {
				// tooltip would go off left edge - drop it a litte
				$container.addClass('below').removeClass('right');
				$container.css({
					top: XY.y + $(this._target).height() + 10,
					left: 10,
					width: tooltipWidth
				});
			} else {
				// tooltip would go off right edge - reverse it.
				$container.removeClass('below').addClass('right');
				$container.css({
					top: XY.y - 14,
					left: XY.x - tooltipWidth - 30,
					width: tooltipWidth
				});
			}
		} else {
			$container.removeClass('right below');
			$container.css({
				top: XY.y - 14,
				left: XY.x + width + 25,
				width: tooltipWidth
			});
		}
	};


	function HoverDropdownList(id) {
		if (!(this instanceof HoverDropdownList)) return new HoverDropdownList(options);

		this._construct(id);
	}
	HoverDropdownList.prototype = new Hover();
	HoverDropdownList.prototype.templateName = 'RESHoverDropdownList';
	HoverDropdownList.prototype._updatePosition = function($container) {
		var XY = RESUtils.getXYpos(this._target);

		var width = $(this._target).width();
		var height = $(this._target).height();

		var containerWidth = $container.outerWidth();

		var left = XY.x;
		if (left + containerWidth > window.innerWidth) {
			left = window.innerWidth - containerWidth - 10;
		}

		$container.css({
			top: XY.y + (height * 1.1) + 10,
			left: left,
			position: 'fixed',
			zIndex: 2147483646
		});
	};
});
