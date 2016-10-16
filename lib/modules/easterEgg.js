import { $, Konami } from '../vendor';
import * as Notifications from './notifications';

export const module = {};

module.moduleID = 'easterEgg';
module.moduleName = 'Easter Egg';
module.category = 'Core';
module.description = '↑ ↑ ↓ ↓ ← → ← → B A';
module.hidden = true;

let konami;

module.go = () => {
	konami = new Konami(() => {
		const $baconBit = $('<div>', { id: 'baconBit' }).appendTo(document.body);
		Notifications.showNotification({
			header: 'RES Easter Eggies!',
			message: 'Mmm, bacon!',
			moduleID: module.moduleID,
			notificationID: 'konami',
		});
		setTimeout(() => $baconBit.addClass('makeitrain'), 500);
	});
	konami.iphone.load = () => {}; // nix touch support; occasional false positives on touchscreen laptops
};

export function konamiActive() {
	return konami && konami.almostThere;
}
