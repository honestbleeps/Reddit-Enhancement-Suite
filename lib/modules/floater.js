/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import * as Modules from '../core/modules';
import { Module } from '../core/module';
import { getHeaderOffset, matchesPageLocation } from '../utils';

export const module: Module<*> = new Module('floater');

module.category = 'productivityCategory';
module.moduleName = 'floaterName';
module.description = 'floaterDesc';
module.alwaysEnabled = true;
module.hidden = true;

const defaultContainer = 'visibleAfterScroll';
const containers = {
	visibleAfterScroll: {
		exclude: ['d2x'],

		$element: _.once(() =>
			$('<div>', { id: 'NREFloat', class: 'res-floater-visibleAfterScroll' })
				.append('<ul>')
		),
		go() {
			this.$element().css('top', 8 + getHeaderOffset(true));

			if (!document.querySelector('#RESPinnedHeaderSpacer')) { // No need to hide the floater if whole header is pinned
				// $FlowIssue TODO
				new IntersectionObserver(entries => {
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

function isRunning(container: string): ?boolean {
	const c = containers[container];
	if (c) {
		return matchesPageLocation(c.include || [], c.exclude || []);
	}
}

module.afterLoad = () => {
	for (const c of Object.keys(containers)) {
		if (!isRunning(c)) {
			continue;
		}
		const container = containers[c];
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
	if (!isRunning(container)) {
		return;
	}

	containers[container].add(element, { separate, order });
}
