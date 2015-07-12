addModule('easterEgg', function(module, moduleID) {
	module.hidden = true;

	var konami;

	module.go = function() {
		konami = new Konami();
		konami.code = function() {
			var baconBit = RESUtils.createElement('div', 'baconBit');
			document.body.appendChild(baconBit);
			modules['notifications'].showNotification({
				header: 'RES Easter Eggies!',
				message: 'Mmm, bacon!'
			});
			setTimeout(function() {
				baconBit.classList.add('makeitrain');
			}, 500);
		};
		konami.iphone.load = function() { }; // nix touch support; occasional false positives on touchscreen laptops
		konami.load();
	};

	module.konamiActive = function() {
		return (typeof konami !== 'undefined') && (konami.almostThere);
	};
});
