/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import * as Modules from '../core/modules';
import { Module } from '../core/module';
import {
	getD2xBodyOffset,
	getHeaderOffset,
	isAppType,
	string,
} from '../utils';

export const module: Module<*> = new Module('floater');

module.category = 'productivityCategory';
module.moduleName = 'floaterName';
module.description = 'floaterDesc';
module.alwaysEnabled = true;
module.hidden = true;

class Container {
	static isAvailable() { return true; }

	element: HTMLElement = document.createElement('div');
	list: HTMLElement = string.html`<ul class="res-floater-list"></ul>`;

	constructor() {
		this.element.append(this.list);
		if (this.go) this.go();
	}

	go() {}

	add(element: JQuery | HTMLElement, { separate, order }: {| separate: boolean, order: number |}) {
		if (separate) {
			$(this.element).append(element);
		} else {
			const li = string.html`<li style="order: ${order}"></li>`;
			$(li).append(element);
			this.list.append(li);
		}
	}
}

const containers = {
	belowFixedNavbar: class extends Container {
		static isAvailable() { return isAppType('d2x'); }

		go() {
			this.element.classList.add('res-floater-belowNavbar');
			this.element.style.top = `${5 + getD2xBodyOffset()}px`;
			document.body.append(this.element);
		}
	},

	visibleAfterScroll: class extends Container {
		static isAvailable() { return !isAppType('d2x'); }

		go() {
			this.element.classList.add('res-floater-visibleAfterScroll');
			document.body.append(this.element);
			this.element.style.top = `${8 + getHeaderOffset(true)}px`;

			if (!document.querySelector('#RESPinnedHeaderSpacer')) { // No need to hide the floater if whole header is pinned
				this.element.hidden = true;
				// $FlowIssue https://github.com/facebook/flow/pull/4664
				new IntersectionObserver(entries => {
					this.element.hidden = entries[0].isIntersecting;
				}).observe(document.querySelector('#header'));
			}
		}
	},

	inert: Container,
};

const getContainer: * => Container = _.memoize(name => new (containers[name].isAvailable() ? containers[name] : containers.inert)());

export function addElement(
	element: HTMLElement | JQuery,
	{
		container: containerName = ['belowFixedNavbar', 'visibleAfterScroll'].find(name => containers[name].isAvailable()) || 'inert',
		separate = false,
		order = 0,
	}: {|
		container?: $Keys<typeof containers>,
		separate?: boolean,
		order?: number,
	|} = {}
) {
	if (!Modules.isRunning(module)) return;

	getContainer(containerName).add(element, { separate, order });
}
