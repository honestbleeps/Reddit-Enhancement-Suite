/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('easterEgg');

module.moduleName = 'easterEggName';
module.category = 'coreCategory';
module.description = 'easterEggDesc';
module.hidden = true;

let konami;

module.go = () => {
	konami = createKonami(() => {
		const $baconBit = $('<div>', { id: 'baconBit' }).appendTo(document.body);
		Notifications.showNotification({
			header: 'RES Easter Eggies!',
			message: 'Mmm, bacon!',
			moduleID: module.moduleID,
			notificationID: 'konami',
		});
		setTimeout(() => $baconBit.addClass('makeitrain'), 500);
	});
};

export function konamiActive(): boolean {
	return !!konami && konami.almostThere;
}

/*
 * Konami-JS ~
 * :: Now with support for touch events and multiple instances for
 * :: those situations that call for multiple easter eggs!
 * Code: https://github.com/snaptortoise/konami-js
 * Examples: http://www.snaptortoise.com/konami-js
 * Copyright (c) 2009 George Mandis (georgemandis.com, snaptortoise.com)
 * Version: 1.4.6 (3/2/2016)
 * Licensed under the MIT License (http://opensource.org/licenses/MIT)
 * Tested in: Safari 4+, Google Chrome 4+, Firefox 3+, IE7+, Mobile Safari 2.2.1 and Dolphin Browser
 */
function createKonami(callback) {
	const konami = {
		input: '',
		pattern: '38384040373937396665',
		almostThere: false,
		prepattern: '383840403739373966',
		load: () => {
			document.addEventListener('keydown', (event: KeyboardEvent) => {
				konami.input += event.keyCode;

				if (konami.input.length > konami.pattern.length) {
					konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
				}

				if (konami.input === konami.pattern) {
					konami.code();
					konami.input = '';
					event.preventDefault();
				} else if ((konami.input === konami.prepattern) || (konami.input.substr(2, konami.input.length) === konami.prepattern)) {
					konami.almostThere = true;

					setTimeout(() => {
						konami.almostThere = false;
						konami.input = '';
					}, 2000);
				}
			}, false);
		},
		code: () => {},
	};

	if (typeof callback === 'function') {
		konami.code = callback;
		konami.load();
	}

	return konami;
}
