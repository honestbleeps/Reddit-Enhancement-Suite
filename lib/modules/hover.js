/* @flow */

import hoverDefaultTemplate from '../templates/hoverDefault.mustache';
import hoverDropdownTemplate from '../templates/hoverDropdownList.mustache';
import hoverInfoCardTemplate from '../templates/hoverInfoCard.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Options from '../core/options';

export const module: Module<*> = new Module('hover');

module.moduleName = 'hoverName';
module.category = 'coreCategory';
module.description = 'hoverDesc';
module.alwaysEnabled = true;

module.options = {
	instances: {
		description: 'hoverInstancesDesc',
		type: 'table',
		value: ([]: Array<[string, boolean]>),
		fields: [{
			name: 'name',
			type: 'text',
		}, {
			name: 'enabled',
			type: 'boolean',
			value: true,
		}],
	},
	openDelay: {
		type: 'text',
		value: '500',
		description: 'hoverOpenDelayDesc',
	},
	fadeDelay: {
		type: 'text',
		value: '500',
		description: 'hoverFadeDelayDesc',
	},
	fadeSpeed: {
		noconfig: true, // broken
		type: 'text',
		value: '0.7',
		description: 'hoverFadeSpeedDesc',
	},
	width: {
		type: 'text',
		value: '512',
		description: 'hoverWidthDesc',
	},
	closeOnMouseOut: {
		type: 'boolean',
		value: true,
		description: 'hoverCloseOnMouseOutDesc',
	},
};

module.beforeLoad = () => {
	for (const [optionKey, { value }] of Object.entries(module.options)) {
		const parsedValue = typeof value === 'number' ? parseFloat(value) : value;
		Hover._defaultOptions[optionKey] = parsedValue;
	}
};

const instances = {};
function getInstance(type = 'infocard', id = '_default', hidden) {
	if (!instances[type]) {
		instances[type] = {};
	}

	if (!instances[type][id]) {
		instances[type][id] =
			type === 'dropdownList' ? new HoverDropdownList(id) :
			type === 'infocard' ? new HoverInfoCard(id) :
			new Hover(id);

		instances[type][id].enabled((hidden === HIDDEN_FROM_SETTINGS) || isEnabled(type, id));
	}

	return instances[type][id];
}

export const HIDDEN_FROM_SETTINGS = true;

export const infocard = (id: string, hidden?: boolean) => getInstance('infocard', id, hidden);
export const dropdownList = (id: string, hidden?: boolean) => getInstance('dropdownList', id, hidden);

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
		Options.set(module, 'instances', module.options.instances.value);
	}

	return row;
}

export const pin = {
	bottom: 'bottom',
	right: 'right',
};

type HoverContents = JQuery | HTMLElement | string | null;
type HoverCallback = (target: JQuery | HTMLElement, update: (...items: HoverContents[]) => void) => Promise<HoverContents[]> | HoverContents[];

class Hover {
	static _defaultOptions = {};

	template: () => string = hoverDefaultTemplate;
	_options: { [key: string]: any } = Hover._defaultOptions;
	_enabled: boolean = true;
	instanceID: string;

	visible: boolean = false;
	hideTimer: number | void;
	showTimer: number | void;
	_target: JQuery | HTMLElement | void;
	_callback: HoverCallback | void;
	_container: HTMLElement | void;

	constructor(id: string) {
		this.instanceID = id;
	}

	enabled(enabled: boolean) {
		this._enabled = enabled;

		return this;
	}

	options(options: { [key: string]: mixed } = {}) {
		this._options = {
			...this._options,
			...options,
		};

		return this;
	}

	target(element: JQuery | HTMLElement) {
		this.close();
		this._target = element;

		return this;
	}

	populateWith(callback: HoverCallback) {
		this._callback = callback;

		return this;
	}

	getContainer() {
		if (!this._container) {
			this._container = this._render();
		}

		return this._container;
	}

	_render() {
		const ele = $(this.template()).get(0);
		this._addContainerHandlers(ele);
		return ele;
	}

	_addContainerHandlers(ele: HTMLElement) {
		$(ele)
			.appendTo(document.body)
			.on('mouseenter', () => this._cancelHideTimer())
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

		const callback = this._callback;
		const target = this._target;

		if (callback) {
			if (!target) throw new Error('Cannot show hover without target.');
			this._displayLoadIndicator();
			(async () => {
				try {
					const update = (...items) => { this._populate(items); };
					update(...(await callback(target, update)));
				} catch (e) {
					this.close();
					throw e;
				}
			})();
		} else {
			this.close();
		}

		$(this.getContainer()).show().css({ opacity: 1 }); // nvm fade in, too much trouble
	}

	_displayLoadIndicator() {}

	_populate(items: HoverContents[]) {
		if (!this._enabled) return false;

		const container = this.getContainer();

		items.forEach((item, i) => {
			if (!item) return;
			const $element = $(container).find(`[data-hover-element="${i}"]`);
			$element.children().detach(); // allow re-use of elements with jQuery event handlers
			$element.empty().append(item);
		});

		this._updatePosition();
	}

	_updatePosition() {
		const { top, left } = $(this._target).offset();
		$(this.getContainer()).css({
			top,
			left,
			zIndex: 2147483646,
		});
	}

	_cancelShow(fade: boolean = false) {
		this.close(fade);
	}

	_addShowListeners() {
		$(this._target).on('mouseleave.RESHover', () => this._cancelShow());
	}

	_clearShowListeners() {
		$(this._target).off('mouseleave.RESHover');
	}

	_startShowTimer() {
		if (this.visible) {
			// Close and reopen container.
			this._cancelShow();
		}
		this._cancelShowTimer();
		this.showTimer = setTimeout(() => this._afterShowTimer(), this._options.openDelay);
	}

	_cancelShowTimer() {
		clearTimeout(this.showTimer);
	}

	_afterShowTimer() {
		this._cancelShowTimer();
		this._clearShowListeners();
		this.open();
		this.visible = true;

		$(this._target).on('mouseleave', () => this._startHideTimer());
	}

	_startHideTimer() {
		clearTimeout(this.hideTimer);
		this.hideTimer = setTimeout(() => this._afterHideTimer(), this._options.fadeDelay);
	}

	_cancelHideTimer() {
		clearTimeout(this.hideTimer);
	}

	_afterHideTimer() {
		this._cancelHideTimer();
		this.close(true);
		this.visible = false;
	}

	close(fade: boolean = false) {
		if (!this._enabled) return false;

		this._clearShowListeners();
		this._cancelShowTimer();
		this._cancelHideTimer();

		if (!this.visible) return false;

		$(this.getContainer()).fadeOut(fade ? this._options.fadeSpeed * 1000 : 0);
	}
}

class HoverInfoCard extends Hover {
	template = hoverInfoCardTemplate;
	_loadIndicator = '<div class="RESCenteredLoadIndicator"><span class="RESLoadingSpinner"></span></div>';

	_displayLoadIndicator() {
		this._populate([null, this._loadIndicator]);
	}

	_updatePosition() {
		const { top, left } = $(this._target).offset();
		const $container = $(this.getContainer());
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
					width: tooltipWidth,
				});
			} else {
				// tooltip would go off right edge - reverse it.
				$container.removeClass('below').addClass('right');
				$container.css({
					top: top - 14,
					left: left - tooltipWidth - 30,
					width: tooltipWidth,
				});
			}
		} else {
			$container.removeClass('right below');
			$container.css({
				top: top - 14,
				left: left + width + 25,
				width: tooltipWidth,
			});
		}
	}
}

class HoverDropdownList extends Hover {
	template = hoverDropdownTemplate;

	_options = {
		...Hover._defaultOptions,
		pin: pin.bottom,
		offsetWidth: 0,
		offsetHeight: 2,
		bottomPadding: 10,
	};

	_updatePosition() {
		const trigger = $(this._target)[0];
		const menu = this.getContainer();
		const { top: y, left: x } = $(trigger).offset();

		menu.style.zIndex = '2147483646';

		switch (this._options.pin) {
			case pin.right:
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
			case pin.bottom:
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
