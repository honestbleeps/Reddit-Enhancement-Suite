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

			if (!document.querySelector('#RESPinnedHeaderSpacer')) { // No need to hide the floater if whole header is pinned
				// $FlowIssue TODO
				new IntersectionObserver(frameThrottle((entries: Array<any>) => {
					const show = entries[0].intersectionRatio === 0;
					this.$element().get(0).hidden = !show;
				})).observe(document.querySelector('#header'));
			}
		},
		add(element: HTMLElement | JQuery, options: { separate?: boolean, order?: number } = {}) {
			if (options.separate) {
				this.$element().append(element);
			} else {
				const $container = $('<li />');
				$container.css('order', options.order || 0);
				$container.append(element);
				this.$element().find('> ul').append($container);
			}
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

export function addElement(element: HTMLElement | JQuery, options?: { container?: $Keys<typeof containers>, separate?: boolean, order?: number }) {
	const container = options && options.container && containers[options.container] || containers[defaultContainer];
	container.add(element, options);
}
