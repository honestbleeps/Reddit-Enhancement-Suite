/* @flow */

import { Module } from '../core/module';
import { stopPageContextScript } from '../utils';

export const module: Module<*> = new Module('disableChat');

module.moduleName = 'disableChatName';
module.category = 'productivityCategory';
module.description = 'disableChatDesc';
module.disabledByDefault = true;

module.beforeLoad = () => {
	stopPageContextScript(script => (/^\/_chat/).test(new URL(script.src, location.origin).pathname), 'body');
};

module.contentStart = () => {
	const icon = document.body.querySelector('#chat');
	if (icon) {
		if (icon.nextElementSibling) icon.nextElementSibling.remove(); // Remove seperator
		icon.remove();
	}
};
