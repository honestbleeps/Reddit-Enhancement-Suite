import Konami from 'konami';
import { $ } from '../vendor';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'easterEgg';
	module.hidden = true;

	let konami;

	module.go = function() {
		konami = new Konami();
		konami.code = function() {
			const $baconBit = $('<div>', { id: 'baconBit' }).appendTo(document.body);
			modules['notifications'].showNotification({
				header: 'RES Easter Eggies!',
				message: 'Mmm, bacon!'
			});
			setTimeout(() => $baconBit.addClass('makeitrain'), 500);
		};
		konami.iphone.load = () => {}; // nix touch support; occasional false positives on touchscreen laptops
		konami.load();
	};

	module.konamiActive = function() {
		return konami && konami.almostThere;
	};
}
