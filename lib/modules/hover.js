/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Options from '../core/options';
import { getViewportSize } from '../utils';

export const module: Module<*> = new Module('hover');

module.moduleName = 'hoverName';
module.category = 'coreCategory';
module.description = 'hoverDesc';
module.alwaysEnabled = true;

module.options = {
	instances: {
		description: 'hoverInstancesDesc',
		title: 'hoverInstancesTitle',
		type: 'table',
		value: ([]: Array<[string, boolean]>),
		fields: [{
			key: 'name',
			name: 'hoverInstancesName',
			type: 'text',
		}, {
			key: 'enabled',
			name: 'hoverInstancesEnabled',
			type: 'boolean',
			value: true,
		}],
	},
	openDelay: {
		type: 'text',
		value: '500',
		description: 'hoverOpenDelayDesc',
		title: 'hoverOpenDelayTitle',
	},
	fadeDelay: {
		type: 'text',
		value: '500',
		description: 'hoverFadeDelayDesc',
		title: 'hoverFadeDelayTitle',
	},
	fadeSpeed: {
		noconfig: true, // broken
		type: 'text',
		value: '0.7',
		description: 'hoverFadeSpeedDesc',
		title: 'hoverFadeSpeedTitle',
	},
	width: {
		type: 'text',
		value: '512',
		description: 'hoverWidthDesc',
		title: 'hoverWidthTitle',
	},
	closeOnMouseOut: {
		type: 'boolean',
		value: true,
		description: 'hoverCloseOnMouseOutDesc',
		title: 'hoverCloseOnMouseOutTitle',
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

type HoverContents = HTMLElement | string | null;
type HoverCallback = (self: Hover) => Promise<HoverContents[]> | HoverContents[];

class Hover {
	static _defaultOptions = {};

	template: string = `
		<div class="RESHover">
			<div data-hover-element="0" />
			<div data-hover-element="1" />
			<div data-hover-element="2" />
			<div data-hover-element="3" />
		</div>
	`;

	_options: { [key: string]: any } = Hover._defaultOptions;
	_enabled: boolean = true;
	instanceID: string;

	visible: boolean = false;
	hideTimer: number | void;
	showTimer: number | void;
	_target: HTMLElement | void;
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

	target(element: HTMLElement) {
		if (this._target !== element) {
			this.close();
			this._target = element;
		}

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
		const ele = $(this.template).get(0);
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
					this.populate(await callback(this));
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

	populate(items: HoverContents[]) {
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
		if (!this._target || !this._target.offsetParent) throw new Error('Target is no longer available');
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
		$(this._target).on('mouseleave.RESHover', () => {
			if (!this.visible) this._cancelShow();
		});
	}

	_clearShowListeners() {
		$(this._target).off('mouseleave.RESHover');
	}

	_startShowTimer() {
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
		$(this._target).on('mouseenter', () => this._cancelHideTimer());
	}

	_startHideTimer() {
		clearTimeout(this.hideTimer);
		this.hideTimer = setTimeout(() => this._afterHideTimer(), this._options.fadeDelay);
	}

	_cancelHideTimer() {
		clearTimeout(this.hideTimer);
	}

	_afterHideTimer() {
		// Don't let the hover be hidden if it is active, e.g. a input field is focused
		if (this.getContainer().contains(document.activeElement)) {
			this._startHideTimer();
			return;
		}
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
	template = `
		<div class="RESHover RESHoverInfoCard RESDialogSmall">
			<h3 class="RESHoverTitle" data-hover-element="0"></h3>
			<div class="RESCloseButton">x</div>
			<div class="RESHoverBody RESDialogContents" data-hover-element="1"></div>
		</div>
	`;
	_loadIndicator = '<div class="RESCenteredLoadIndicator"><span class="RESLoadingSpinner"></span></div>';

	_displayLoadIndicator() {
		this.populate([null, this._loadIndicator]);
	}

	_updatePosition() {
		if (!this._target || !this._target.offsetParent) throw new Error('Target is no longer available');
		const { top, left, bottom, right } = $(this._target).get(0).getBoundingClientRect();
		const $container = $(this.getContainer()).removeClass('right below');

		const tooltipWidth = this._options.width;
		let tooltipLeft, tooltipTop;

		if (!this._options.pin && right + tooltipWidth + 25 < getViewportSize().width) {
			tooltipTop = top - 14;
			tooltipLeft = right + 25;
		} else if (this._options.pin === pin.bottom || left - tooltipWidth - 30 < 0) {
			$container.addClass('below');
			tooltipTop = bottom + 10;
			tooltipLeft = Math.min(Math.max(getViewportSize().width - tooltipWidth, 0), left);
		} else {
			$container.addClass('right');
			tooltipTop = top - 14;
			tooltipLeft = left - tooltipWidth - 30;
		}

		$container.css({
			top: tooltipTop + window.scrollY,
			left: tooltipLeft + window.scrollX,
			width: tooltipWidth,
		});
	}
}

class HoverDropdownList extends Hover {
	template = `
		<div class="RESHover RESHoverDropdownList RESDropdownList">
			<ul class="RESDropdownOptions" data-hover-element="0"></ul>
		</div>
	`;

	_options = {
		...Hover._defaultOptions,
		pin: pin.bottom,
		offsetWidth: 0,
		offsetHeight: 2,
		bottomPadding: 10,
	};

	_updatePosition() {
		if (!this._target || !this._target.offsetParent) throw new Error('Target is no longer available');
		const trigger = $(this._target)[0];
		const menu = this.getContainer();
		const { top: y, left: x } = $(trigger).offset();

		menu.style.zIndex = '2147483646';

		switch (this._options.pin) {
			case pin.right:
				const viewportBottom = getViewportSize().height;
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
