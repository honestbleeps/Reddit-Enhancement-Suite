/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Options from '../core/options';
import { getViewportSize, waitForEvent } from '../utils';

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
	Hover._defaultOptions = {
		openDelay: parseFloat(module.options.openDelay.value),
		fadeDelay: parseFloat(module.options.fadeDelay.value),
		fadeSpeed: parseFloat(module.options.fadeSpeed.value),
		width: parseFloat(module.options.width.value),
		closeOnMouseOut: module.options.closeOnMouseOut.value,
	};
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

function getFixedParent(e: Element): ?Element {
	const p = e.parentElement;
	return p && (window.getComputedStyle(p).position === 'fixed' && e || getFixedParent(p));
}

export const pin = {
	bottom: 'bottom',
	right: 'right',
};

type HoverContents = JQuery | HTMLElement | string | null;
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

	_options: { [string]: any } = Hover._defaultOptions;
	_enabled: boolean = true;
	instanceID: string;

	visible: boolean = false;
	hideTimer: TimeoutID | null = null;
	showTimer: TimeoutID | null = null;
	_target: HTMLElement | void;
	_callback: HoverCallback | void;
	_container: HTMLElement | void;

	_fixedPosition: boolean = false;

	constructor(id: string) {
		this.instanceID = id;
	}

	enabled(enabled: boolean) {
		this._enabled = enabled;

		return this;
	}

	options(options: { [string]: mixed }) {
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

	getCheckedTarget(): HTMLElement {
		if (!this._target || !this._target.offsetParent) {
			this.close();
			throw new Error('Cannot show hover without target; closing hover.');
		}
		return this._target;
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
		if (this._options.className) ele.classList.add(this._options.className);
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
			.on('click', '.RESCloseButton', () => this.close(true))
			// Close on escape when inner element is focused
			.on('keyup', ({ which }: KeyboardEvent) => { if (which === 27) this.close(true); });
	}

	begin() {
		if (!this._enabled) return false;
		this._startShowTimer();
		this._addShowListeners();
	}

	open() {
		if (!this._enabled) return false;

		const callback = this._callback;
		if (callback) {
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

		const fixedParent = getFixedParent(this.getCheckedTarget());
		if (fixedParent) {
			this._fixedPosition = true;

			// If the fixed parent scrolls (e.g. if it has a scrollbar, like in lightboxes), then the container loses
			// position sync with the target.
			// I am not able to figure out a way to keep them together without requiring CSS recalc on each `scroll`
			const onScroll = () => {
				this.close(false);
				fixedParent.removeEventListener('scroll', onScroll, true);
			};
			fixedParent.addEventListener('scroll', onScroll, true);
		}

		this._updatePosition();
	}

	_positionContainer({ top = 'auto', right = 'auto', bottom = 'auto', left = 'auto' }: { top?: *, right?: *, bottom?: *, left?: * }) {
		$(this.getContainer()).css({
			zIndex: '2147483646',
			position: this._fixedPosition ? 'fixed' : 'absolute',
			top: top !== 'auto' ? top + (this._fixedPosition ? 0 : window.scrollY) : 'auto',
			right: right !== 'auto' ? right + (this._fixedPosition ? 0 : window.scrollX) : 'auto',
			bottom: bottom !== 'auto' ? bottom + (this._fixedPosition ? 0 : window.scrollY) : 'auto',
			left: left !== 'auto' ? left + (this._fixedPosition ? 0 : window.scrollX) : 'auto',
		});
	}

	_updatePosition() {
		const target = this.getCheckedTarget();
		const { top, left } = target.getBoundingClientRect();
		this._positionContainer({ top, left });
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
		if (this.showTimer !== null) this._cancelShowTimer();
		this.showTimer = setTimeout(() => this._afterShowTimer(), this._options.openDelay);
	}

	_cancelShowTimer() {
		if (this.showTimer !== null) clearTimeout(this.showTimer);
		this.showTimer = null;
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
		if (this.hideTimer !== null) clearTimeout(this.hideTimer);
		this.hideTimer = setTimeout(() => this._afterHideTimer(), this._options.fadeDelay);
	}

	_cancelHideTimer() {
		if (this.hideTimer !== null) clearTimeout(this.hideTimer);
		this.hideTimer = null;
	}

	async _afterHideTimer() {
		this._cancelHideTimer();

		// Don't let the hover be hidden if it is active, e.g. a input field is focused
		if (this.getContainer().contains(document.activeElement)) {
			await waitForEvent(this.getContainer(), 'blur');
			if (this.hideTimer !== null) return; // Some other timer has started
		}

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
		const target = this.getCheckedTarget();
		const { top, left, bottom, right } = target.getBoundingClientRect();
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

		$container.get(0).style.width = `${tooltipWidth}px`;
		this._positionContainer({ left: tooltipLeft, top: tooltipTop });
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
		const target = this.getCheckedTarget();
		const { top, left, height, width } = target.getBoundingClientRect();
		const $container = $(this.getContainer());

		switch (this._options.pin) {
			case pin.right:
				const bottomAlign = top + $container.height() + this._options.bottomPadding > getViewportSize().height;
				if (bottomAlign) {
					this._positionContainer({ left: left + width, bottom: this._options.bottomPadding });
				} else {
					this._positionContainer({ left: left + width, top: top + this._options.offsetHeight });
				}
				break;
			case pin.bottom:
				// falls through
			default:
				const leftAlign = left + $container.outerWidth() < getViewportSize().width;
				if (leftAlign) {
					this._positionContainer({ left, top: top + height + this._options.offsetHeight });
				} else {
					this._positionContainer({ right: getViewportSize().width - left - width + this._options.offsetWidth, top: top + height + this._options.offsetHeight });
				}
				break;
		}
	}
}
