import hoverDefaultTemplate from '../templates/hoverDefault.hbs';
import hoverDropdownTemplate from '../templates/hoverDropdownList.hbs';
import hoverInfoCardTemplate from '../templates/hoverInfoCard.hbs';
import { $ } from '../vendor';
import { fadeElementOut } from '../utils';
import { setOption } from '../core';

addModule('hover', (module, moduleID) => {
	module.moduleName = 'RES Pop-up Hover';
	module.category = ['Core'];
	module.description = 'Customize the behavior of the large informational pop-ups which appear when you hover your mouse over certain elements.';
	module.alwaysEnabled = true;

	module.pin = {
		bottom: 'bottom',
		right: 'right'
	};

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
		for (const option in module.options) {
			if (!module.options.hasOwnProperty(option)) {
				continue;
			}

			let value = module.options[option].value;
			const defaultValue = module.options[option].default;
			if (typeof defaultValue === 'number') {
				value = RESUtils.firstValid(parseFloat(value), defaultValue);
			}

			Hover._defaultOptions[option] = value;
		}
	};

	const instances = {};
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

	module.infocard = (id, hidden) => module.instance('infocard', id, hidden);
	module.dropdownList = (id, hidden) => module.instance('dropdownList', id, hidden);

	function isEnabled(type, id) {
		const row = findOrMakeRow(type, id);
		return row[1];
	}

	function findOrMakeRow(type, id) {
		const name = `${type}.${id}`;
		let row = module.options.instances.value.find(value => value[0] === name);

		if (!row) {
			row = [name, true];
			module.options.instances.value.push(row);
			setOption(moduleID, 'instances', module.options.instances.value);
		}

		return row;
	}

	class Hover {
		static _defaultOptions = {};

		template = hoverDefaultTemplate;
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

		_render() {
			const $element = $(this.template());
			this._addContainerHandlers($element);
			return $element;
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

		open() {
			if (!this._enabled) return false;

			const $container = this.getContainer();

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
			const { top, left } = $(this._target).offset();
			$container.css({
				top,
				left,
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

		close(fade) {
			if (!this._enabled) return false;

			this._clearShowListeners();
			this._cancelShowTimer();
			this._cancelHideTimer();

			if (!this.visible) return false;

			const $container = this.getContainer();

			if (fade) {
				fadeElementOut($container[0], this._options.fadeSpeed);
			} else {
				$container.hide();
			}
		}
	}

	class HoverInfoCard extends Hover {
		template = hoverInfoCardTemplate;

		_updatePosition($container) {
			const { top, left } = $(this._target).offset();
			const width = $(this._target).width();
			const tooltipWidth = this._options.width;
			const windowWidth = window.innerWidth;

			if ((windowWidth - left - width) <= tooltipWidth) {
				if (left - tooltipWidth - 30 < 0) {
					// tooltip would go off left edge - drop it a litte
					$container.addClass('below').removeClass('right');
					$container.css({
						top: top + $(this._target).height() + 10,
						left: 10,
						width: tooltipWidth
					});
				} else {
					// tooltip would go off right edge - reverse it.
					$container.removeClass('below').addClass('right');
					$container.css({
						top: top - 14,
						left: left - tooltipWidth - 30,
						width: tooltipWidth
					});
				}
			} else {
				$container.removeClass('right below');
				$container.css({
					top: top - 14,
					left: left + width + 25,
					width: tooltipWidth
				});
			}
		}
	}

	class HoverDropdownList extends Hover {
		template = hoverDropdownTemplate;

		_options = {
			...Hover._defaultOptions,
			pin: module.pin.bottom,
			offsetWidth: 0,
			offsetHeight: 2,
			bottomPadding: 10
		};

		_updatePosition($container) {
			const trigger = $(this._target)[0];
			const menu = $container[0];
			const { top: y, left: x } = $(trigger).offset();

			menu.style.zIndex = 2147483646;

			switch (this._options.pin) {
				case module.pin.right:
					const viewportBottom = document.documentElement.clientHeight + window.scrollY;
					const top = y + this._options.offsetHeight;
					const height = $(menu).height();
					const bottomAlign = top + height + this._options.bottomPadding > viewportBottom;
					menu.style.left = `${x + trigger.offsetWidth + this._options.offsetWidth}px`;
					menu.style.right = 'auto';
					if (bottomAlign) {
						menu.style.position = 'fixed';
						menu.style.top = 'auto';
						menu.style.bottom = `${this._options.bottomPadding}px`;
					} else {
						menu.style.position = 'absolute';
						menu.style.top = `${top}px`;
						menu.style.bottom = 'auto';
					}
					break;
				case module.pin.bottom:
					// falls through
				default:
					const leftAlign = x + $(menu).outerWidth() < document.body.scrollWidth;
					menu.style.right = leftAlign ? 'auto' : `${document.body.scrollWidth - x - trigger.offsetWidth + this._options.offsetWidth}px`;
					menu.style.left = leftAlign ? `${x}px` : 'auto';
					menu.style.top = `${y + trigger.offsetHeight + this._options.offsetHeight}px`;
					break;
			}
		}
	}
});
