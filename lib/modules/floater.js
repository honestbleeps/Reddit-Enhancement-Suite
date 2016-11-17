/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { getHeaderOffset, frameThrottle } from '../utils';

export const module: Module<*> = new Module('floater');

module.category = 'productivityCategory';
module.moduleName = 'floaterName';
module.description = 'floaterDesc';
module.alwaysEnabled = true;
module.hidden = true;

const defaultContainer = 'visibleAfterScroll';
const containers = {
	visibleAfterScroll: {
		$element: _.once(() =>
			$('<div>', { id: 'NREFloat', class: 'res-floater-visibleAfterScroll' })
				.append('<ul>')
		),
		go() {
			this.$element().css('top', 8 + getHeaderOffset(true));
			window.addEventListener('scroll', frameThrottle(() => this.onScroll()));
			this.onScroll();
		},
		add(element: HTMLElement | JQuery, options?: { separate?: boolean }) {
			if (options && options.separate) {
				this.$element().append(element);
			} else {
				const $container = $('<li />');
				$container.append(element);
				this.$element().find('> ul').append($container);
			}
		},
		getOffset: _.once(() => document.querySelector('#header').getBoundingClientRect().height - getHeaderOffset(true)),
		onScroll() {
			const show = window.scrollY > this.getOffset();
			this.$element().toggle(show);
		},
	},
};

module.afterLoad = () => {
	for (const container of Object.values(containers)) {
		$(document.body).append(container.$element());
		if (typeof container.go === 'function') {
			container.go();
		}
	}
};

export function addElement(element: HTMLElement | JQuery, options?: { container?: $Keys<typeof containers>, separate?: boolean }) {
	const container = options && options.container && containers[options.container] || containers[defaultContainer];
	container.add(element, options);
}
