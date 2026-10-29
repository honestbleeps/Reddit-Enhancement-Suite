/* @flow */

import { memoize } from 'lodash-es';
import { getD2xBodyOffset, getHeaderOffset } from './dom';
import * as PagePhases from './pagePhases';
import { frameThrottle } from './async';
import { isAppType } from './currentLocation';
import { html } from './string';

type ContainerName = 'inNavbar' | 'userMenu' | 'belowFixedNavbar' | 'visibleAfterScroll' | 'tabMenu' | 'inert';

class Container {
	static isAvailable(): boolean { return true; }
	static fallback: ?ContainerName;
	static phase: Promise<any> = PagePhases.loadComplete;
	static useList: boolean = true;

	element: HTMLElement = document.createElement('div');
	list: HTMLElement = html`<ul class="res-floater-list"></ul>`;

	constructor() {
		if (this.constructor.useList) this.element.append(this.list);
		this.constructor.phase.then(() => this.go());
	}

	go() {}

	add(element: HTMLElement, { separate, order }: { separate: boolean, order: number }) {
		if (separate || !this.constructor.useList) {
			element.style.order = String(order);
			this.element.append(element);
		} else {
			if (element instanceof HTMLLIElement) {
				this.list.append(element);
			} else {
				const li = html`<li style="order: ${order}"></li>`;
				li.append(element);
				this.list.append(li);
			}
		}
	}
}

const containers = {
	inNavbar: class extends Container {
		static isAvailable(): boolean { return isAppType('d2x') && !!document.querySelector('.header-user-dropdown'); }
		static fallback: ?ContainerName = 'userMenu';
		static phase: Promise<any> = PagePhases.contentStart;

		go() {
			this.element.classList.add('res-floater-inNavbar');
			document.body.append(this.element);
			this.updateHeaderWidth();
		}

		add(element: any, opts: any) {
			super.add(element, opts);
			this.updateHeaderWidth();
		}

		updateHeaderWidth: (...args: any) => Promise<void> = frameThrottle(() => {
			const { width } = this.element.getBoundingClientRect();
			const headerButton = document.querySelector('.header-user-dropdown');
			headerButton.style.marginRight = `${width}px`;
		});
	},

	userMenu: class extends Container {
		static isAvailable(): boolean { return isAppType('r2'); }
		static phase: Promise<any> = PagePhases.contentStart;
		static useList = false;

		go() {
			const element = document.body.querySelector('#header-bottom-right ul');
			// Items may have been added already
			element.append(...this.element.children);
			this.element = element;
		}

		add(element: HTMLElement) {
			this.element.append(html`<span class="separator">|</span>`, element);
		}
	},

	belowFixedNavbar: class extends Container {
		static isAvailable(): boolean { return isAppType('d2x'); }

		go() {
			this.element.classList.add('res-floater-belowNavbar');
			this.element.style.top = `${5 + getD2xBodyOffset()}px`;
			document.body.append(this.element);
		}
	},

	visibleAfterScroll: class extends Container {
		static isAvailable(): boolean { return !isAppType('d2x'); }
		static fallback: ?ContainerName = 'belowFixedNavbar';

		go() {
			this.element.classList.add('res-floater-visibleAfterScroll');
			document.body.append(this.element);
			this.element.style.top = `${8 + getHeaderOffset(true)}px`;

			if (!document.querySelector('#RESPinnedHeaderSpacer')) { // No need to hide the floater if whole header is pinned
				this.element.hidden = true;
				new IntersectionObserver(entries => {
					this.element.hidden = entries[0].isIntersecting;
				}).observe(document.querySelector('#header'));
			}
		}
	},

	tabMenu: class extends Container {
		static isAvailable(): boolean { return isAppType('r2'); }
		static fallback: ?ContainerName = 'belowFixedNavbar';
		static phase: Promise<any> = PagePhases.contentStart;
		static useList = false;

		go() {
			let menu = document.querySelector('#header-bottom-left ul.tabmenu');
			if (menu) {
				/* no-op */
			} else if (document.querySelector('#header-bottom-left')) {
				menu = html`<ul class="tabmenu" />`;
				document.querySelector('#header-bottom-left').append(menu);
			} else {
				if (process.env.NODE_ENV === 'development') {
					console.warn('Could not find tab menu');
				}

				return;
			}

			// Items may have been added already
			menu.append(...this.element.children);
			this.element = menu;
		}
	},

	inert: Container,
};

const getContainer: any => Container = memoize((name: keyof typeof containers) => {
	let container;
	if (containers[name].isAvailable()) {
		container = new containers[name]();
	} else if (containers[name].fallback) {
		container = getContainer(containers[name].fallback);
		// If a stack trace overflow gets thrown from here, check
		// container[name].fallback for circular dependencies.
	}

	if (container) {
		return container;
	} else {
		const InertContainer = containers.inert;
		return new InertContainer();
	}
});

export function addFloater(
	element: HTMLElement,
	{
		container: containerName = (['inNavbar', 'belowFixedNavbar', 'visibleAfterScroll'] as Array<ContainerName>).find(name => containers[name].isAvailable()) || 'inert',
		separate = false,
		order = 0,
	}: {
		container?: keyof typeof containers,
		separate?: boolean,
		order?: number,
	} = {},
) {
	getContainer(containerName).add(element, { separate, order });
}
