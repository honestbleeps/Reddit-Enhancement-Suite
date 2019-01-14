/* @flow */

import { Module } from '../core/module';
import * as Init from '../core/init';
import { downcast, watchForChildren } from '../utils';

export const module: Module<*> = new Module('disableChat');

module.moduleName = 'disableChatName';
module.category = 'productivityCategory';
module.description = 'disableChatDesc';
module.disabledByDefault = true;

module.beforeLoad = () => {
	Init.bodyStart.then(() => {
		watchForChildren(document.body, 'script', ele => {
			const script = downcast(ele, HTMLScriptElement);
			if ((/^\/_chat/).test(new URL(script.src, location.origin).pathname)) script.remove();
		});
	});
};
