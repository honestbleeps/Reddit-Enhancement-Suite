import Konami from 'konami';
import * as Notifications from './notifications';
import { $ } from '../vendor';

export const module = {};

module.moduleID = 'easterEgg';
module.hidden = true;

let konami;

module.go = function() {
	konami = new Konami();
	konami.code = function() {
		const $baconBit = $('<div>', { id: 'baconBit' }).appendTo(document.body);
		Notifications.showNotification({
			header: 'RES Easter Eggies!',
			message: 'Mmm, bacon!'
		});
		setTimeout(() => $baconBit.addClass('makeitrain'), 500);
	};
	konami.iphone.load = () => {}; // nix touch support; occasional false positives on touchscreen laptops
	konami.load();
};

export function konamiActive() {
	return konami && konami.almostThere;
}
