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
	konami = new Konami();
	konami.almostThere = false;
	konami.prepattern = konami.pattern.slice(0, -2);

	konami.code = () => {
		const $baconBit = $('<div>', { id: 'baconBit' }).appendTo(document.body);
		Notifications.showNotification({
			header: 'RES Easter Eggies!',
			message: 'Mmm, bacon!',
			moduleID: module.moduleID,
			notificationID: 'konami',
		});
		setTimeout(() => $baconBit.addClass('makeitrain'), 500);
	}

	konami.addEvent(document, "keydown", function (e, ref_obj) {
		if (ref_obj) konami = ref_obj; // IE
		konami.input += e ? e.keyCode : event.keyCode;
		if (konami.input.length > konami.pattern.length)
			konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
		if (konami.input == konami.pattern) {
			konami.code();
			konami.input = '';
			e.preventDefault();
			return false;
		} else if ((konami.input == konami.prepattern) || (konami.input.substr(2, konami.input.length) == konami.prepattern)) {
			konami.almostThere = true;

			setTimeout(() => {
				konami.almostThere = false;
				konami.input = '';
			}, 2000);
		}
	}, konami);
};

export function konamiActive() {
	return konami && konami.almostThere;
}
