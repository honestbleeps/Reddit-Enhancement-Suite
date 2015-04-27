addModule('easterEgg', function(module, moduleID) {
	module.hidden = true;

	module.go = function() {
		loadKonami();
	}

	function loadKonami() {
		var konami = new Konami();
		konami.code = function() {
			var baconBit = RESUtils.createElement('div', 'baconBit');
			document.body.appendChild(baconBit);
			modules['notifications'].showNotification({
				moduleID: 'easterEgg',
				notificationID: 'bakonami',
				header: 'RES Easter Eggies!',
				message: 'Mmm, bacon!'
			});
			setTimeout(function() {
				baconBit.classList.add('makeitrain');
			}, 500);
		};
		konami.iphone.load = function() { }; // nix touch support; occasional false positives on touchscreen laptops
		konami.load();
	}
});
