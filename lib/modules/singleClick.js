/* @flow */

import { Module } from '../core/module';
import { watchForThings, string } from '../utils';
import { openNewTabs } from '../environment';

export const module: Module<*> = new Module('singleClick');

module.moduleName = 'singleClickName';
module.category = 'browsingCategory';
module.description = 'singleClickDesc';
module.options = {
	openOrder: {
		title: 'singleClickOpenOrderTitle',
		type: 'enum',
		values: [{
			name: 'open comments then link',
			value: 'commentsfirst',
		}, {
			name: 'open link then comments',
			value: 'linkfirst',
		}],
		value: 'commentsfirst',
		description: 'singleClickOpenOrderDesc',
	},
	hideLEC: {
		title: 'singleClickHideLECTitle',
		type: 'boolean',
		value: true,
		description: 'singleClickHideLECDesc',
		advanced: true,
	},
	openFrontpage: {
		title: 'singleClickOpenFrontpageTitle',
		type: 'boolean',
		value: false,
		description: 'singleClickOpenFrontpageDesc',
		dependsOn: options => !options.hideLEC.value,
	},
	openBackground: {
		title: 'singleClickOpenBackgroundTitle',
		type: 'boolean',
		value: false,
		description: 'singleClickOpenBackgroundDesc',
	},
};
module.exclude = [
	'comments',
];

export const invokeOnPostMap: WeakMap<*, *> = new WeakMap();

module.beforeLoad = () => {
	watchForThings(['post'], thing => {
		const urls = new Set([thing.getPostUrl()]);

		if (thing.isLinkPost()) {
			const a = thing.getCommentsLink();
			if (a) urls.add(a.href);
		} else if (module.options.openFrontpage.value) {
			const frontpageLink = thing.getSubredditLink();
			if (frontpageLink) urls.add(frontpageLink.href);
		}

		const ordered = (module.options.openOrder.value === 'commentsfirst' ? [...urls].reverse() : [...urls]).filter(Boolean);

		const open = (focused: boolean) => { openNewTabs(focused, ...ordered); };

		// This might be invoked via keyboardNav, regardless of `hideLEC`'s value
		invokeOnPostMap.set(thing, open);

		if (!ordered.length || (module.options.hideLEC.value && ordered.length === 1)) return;

		const text = ordered.length === 1 ? '[l=c]' : '[l+c]';
		const ele = string.html`<li><a href="javascript:void(0)" class="noCtrlF" data-text="${text}"></a></li>`;

		// Prevent empty tab opening on middle click
		(ele.firstElementChild: any).addEventListener('auxclick', e => { e.preventDefault(); });

		(ele.firstElementChild: any).addEventListener('mouseup', (e: MouseEvent) => {
			if (e.button !== 0 && e.button !== 1) return; // Only left and middle click registers
			const focused = !e.button && !e.ctrlKey && !module.options.openBackground.value;
			open(focused);
		});

		thing.getButtons().append(ele);
	});
};
