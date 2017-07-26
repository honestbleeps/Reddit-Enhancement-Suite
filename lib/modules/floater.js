/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import * as Modules from '../core/modules';
import { Module } from '../core/module';
import { getHeaderOffset } from '../utils';

export const module: Module<*> = new Module('floater');

module.category = 'productivityCategory';
module.moduleName = 'floaterName';
module.description = 'floaterDesc';
module.alwaysEnabled = true;
module.hidden = true;
module.exclude = [
	'd2x',
];

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
				new IntersectionObserver((entries: Array<any>) => {
					this.$element().get(0).hidden = entries[0].isIntersecting;
				}).observe(document.querySelector('#header'));
			}
		},
		add(element: *, { separate, order }: {| separate: boolean, order: number |}) {
			if (separate) {
				this.$element().append(element);
			} else {
				const $container = $('<li />');
				$container.css('order', order);
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

export function addElement(
	element: HTMLElement | JQuery,
	{ container = defaultContainer, separate = false, order = 0 }: {| container?: $Keys<typeof containers>, separate?: boolean, order?: number |} = {}
) {
	if (!Modules.isRunning(module)) {
		return;
	}
	containers[container].add(element, { separate, order });
}
