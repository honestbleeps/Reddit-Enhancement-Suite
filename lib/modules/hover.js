addModule('hover', function(module, moduleID) {
	module.moduleName = 'RES Pop-up Hover';
	module.category = ['Core'];
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
		width: {
			type: 'text',
			value: 512
		},
		closeOnMouseOut: {
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

			Hover._defaultOptions[option] = value;
		}
	};

	var instances = {};
	module.instance = function getInstance(type, id, hidden) {
		if (typeof type === 'undefined') {
			type = 'infocard';
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

			instances[type][id].enabled((hidden === module.HIDDEN_FROM_SETTINGS) || isEnabled(type, id));
		}

		return instances[type][id];
	};

	module.HIDDEN_FROM_SETTINGS = true;

	module.infocard = module.instance.bind(module, 'infocard');
	module.dropdownList = module.instance.bind(module, 'dropdownList');

	function isEnabled(type, id) {
		var row = findOrMakeRow(type, id);
		return row[1];
	}

	function findOrMakeRow(type, id) {
		var name = type + '.' + id;
		var row = module.options.instances.value.find(function(value) {
			return value[0] === name;
		});

		if (!row) {
			row = [name, true];
			module.options.instances.value.push(row);
			RESUtils.options.setOption(moduleID, 'instances', module.options.instances.value);
		}

		return row;
	}

	class Hover {
		static _defaultOptions = {};

		templateName = 'RESHoverDefault';
		_options = Hover._defaultOptions;
		_enabled = true;

		constructor(id) {
			this.instanceID = id;
		}

		enabled(enabled) {
			if (typeof enabled !== 'undefined') {
				this._enabled = enabled;
			}

			return this;
		}

		options(options = {}) {
			this._options = $.extend(true, {}, this._options, options);

			return this;
		}

		context(value) {
			if (typeof value !== 'undefined') {
				this._context = value;
			}

			return this;
		}

		target(element) {
			if (typeof element !== 'undefined') {
				this.close();
				this._target = element;
			}

			return this;
		}

		populateWith(...contents) {
			if (typeof contents[0] === 'function') {
				this._callback = contents[0];
			} else if (contents.length) {
				this._contents = contents;
			}

			return this;
		}

		getContainer() {
			if (!this._container) {
				this._container = this._render();
			}

			return this._container;
		}

		async _render() {
			const element = (await RESTemplates.load(this.templateName)).html();
			this._addContainerHandlers(element);
			return element;
		}

		_addContainerHandlers($container) {
			$container
				.appendTo(document.body)
				.on('mouseenter', ::this._cancelHideTimer)
				.on('mouseleave', () => {
					this._cancelHideTimer();
					if (this._options.closeOnMouseOut) {
						this._startHideTimer();
					}
				})
				.on('click', '.RESCloseButton', () => this.close(true));
		}

		begin() {
			if (!this._enabled) return false;
			this._startShowTimer();
			this._addShowListeners();
		}

		async open() {
			if (!this._enabled) return false;

			const $container = await this.getContainer();

			if (this._callback) {
				(async () => {
					try {
						const update = (...items) => this._populate($container, ...items);
						update(...(await this._callback(this._target, this._context, update)));
					} catch (e) {
						this.close();
						throw e;
					}
				})();
			} else if (this._contents) {
				this._populate($container, ...this._contents);
			} else {
				this.close();
			}

			$container.show().css({ opacity: 1 }); // nvm fade in, too much trouble
			modules['styleTweaks'].setSRStyleToggleVisibility(false, moduleID + '.' + this.instanceID);
		}

		_populate($container, ...items) {
			if (!this._enabled) return false;

			this._contents = this._contents || [];

			items.forEach((item, i) => {
				if (!item) return;
				const $element = $container.find(`[data-hover-element="${i}"]`);
				$element.children().detach(); // allow re-use of elements with jQuery event handlers
				$element.empty().append(item);
				this._contents[i] = item;
			});

			this._updatePosition($container);
		}

		_updatePosition($container) {
			const { x, y } = RESUtils.getXYpos(this._target);
			$container.css({
				top: y,
				left: x,
				zIndex: 2147483646
			});
		}

		_cancelShow(fade = false) {
			this.close(fade);
		}

		_addShowListeners() {
			$(this._target).on('mouseleave.RESHover', () => this._cancelShow());
		}

		_clearShowListeners() {
			$(this._target).off('mouseleave.RESHover');
		}

		_startShowTimer() {
			this.mouseEvent = 'enter';

			if (this.visible && this.mouseEvent === 'enter') {
				// Close and reopen container.
				this._cancelShow();
			}
			this._cancelShowTimer();
			this.showTimer = setTimeout(::this._afterShowTimer, this._options.openDelay);
		}

		_cancelShowTimer() {
			clearTimeout(this.showTimer);
		}

		_afterShowTimer() {
			this._cancelShowTimer();
			this._clearShowListeners();
			this.open();
			this.visible = true;

			$(this._target).on('mouseleave', ::this._startHideTimer);
		}

		_startHideTimer() {
			this.mouseEvent = 'leave';
			clearTimeout(this.hideTimer);
			this.hideTimer = setTimeout(::this._afterHideTimer, this._options.fadeDelay);
		}

		_cancelHideTimer() {
			clearTimeout(this.hideTimer);
		}

		_afterHideTimer() {
			this._cancelHideTimer();
			this.close(true);
			this.visible = false;
		}

		async close(fade) {
			if (!this._enabled) return false;

			this._clearShowListeners();
			this._cancelShowTimer();
			this._cancelHideTimer();

			if (!this.visible) return;

			const $container = await this.getContainer();

			if (fade) {
				RESUtils.fadeElementOut($container[0], this._options.fadeSpeed);
			} else {
				$container.hide();
			}
		}
	}

	class HoverInfoCard extends Hover {
		templateName = 'RESHoverInfoCard';

		_updatePosition($container) {
			const { x, y } = RESUtils.getXYpos(this._target);
			const width = $(this._target).width();
			const tooltipWidth = this._options.width;
			const windowWidth = window.innerWidth;

			if ((windowWidth - x - width) <= tooltipWidth) {
				if (x - tooltipWidth - 30 < 0) {
					// tooltip would go off left edge - drop it a litte
					$container.addClass('below').removeClass('right');
					$container.css({
						top: y + $(this._target).height() + 10,
						left: 10,
						width: tooltipWidth
					});
				} else {
					// tooltip would go off right edge - reverse it.
					$container.removeClass('below').addClass('right');
					$container.css({
						top: y - 14,
						left: x - tooltipWidth - 30,
						width: tooltipWidth
					});
				}
			} else {
				$container.removeClass('right below');
				$container.css({
					top: y - 14,
					left: x + width + 25,
					width: tooltipWidth
				});
			}
		}
	}

	class HoverDropdownList extends Hover {
		templateName = 'RESHoverDropdownList';

		_updatePosition($container) {
			const trigger = $(this._target)[0];
			const menu = $container[0];
			const { x, y } = RESUtils.getXYpos(trigger);
			const leftAlign = x + $(menu).outerWidth() < document.body.scrollWidth;

			menu.style.right = leftAlign ? 'auto' : `${document.body.scrollWidth - x - trigger.offsetWidth}px`;
			menu.style.left = leftAlign ? `${x}px` : 'auto';
			menu.style.zIndex = 2147483646;
			menu.style.top = `${y + trigger.offsetHeight + 2}px`;
		}
	}
});
