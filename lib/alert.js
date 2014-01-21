// Create a nice alert function...
var gdAlert = {
	container: false,
	overlay: false,

	populateContainer: function(callback) {
		if (gdAlert.container !== false) {
			gdAlert.container.innerHTML = '';
		} else {
			gdAlert.container = RESUtils.createElementWithID('div', 'alert_message');
		}

		// Add text area
		gdAlert.container.appendChild(document.createElement('div'));

		var closeButton;
		if (typeof callback === 'function') {
			this.okButton = gdAlert.makeButton("confirm");
			this.okButton.addEventListener('click', callback, false);
			this.okButton.addEventListener('click', gdAlert.close, false);

			closeButton = gdAlert.makeButton("cancel");
			closeButton.addEventListener('click', gdAlert.close, false);

			gdAlert.container.appendChild(this.okButton);
			gdAlert.container.appendChild(closeButton);
		} else {
			closeButton = gdAlert.makeButton("Ok");
			closeButton.addEventListener('click', gdAlert.close, false);

			gdAlert.container.appendChild(closeButton);
		}
		document.body.appendChild(gdAlert.container);
	},
	open: function(text, callback) {
		if (gdAlert.isOpen) {
			return;
		}
		gdAlert.isOpen = true;
		gdAlert.populateContainer(callback);

		// Set message
		$(gdAlert.container.getElementsByTagName("div")[0]).html(text);
		gdAlert.container.getElementsByTagName("input")[0].focus();

		// create site overlay
		if (gdAlert.overlay === false) {
			gdAlert.overlay = RESUtils.createElementWithID("div", "alert_message_background");
			document.body.appendChild(gdAlert.overlay);
		}

		gdAlert.container.style.top = Math.max(0, (($(window).height() - $(gdAlert.container).outerHeight()) / 2) ) + "px";
    	gdAlert.container.style.left = Math.max(0, (($(window).width() - $(gdAlert.container).outerWidth()) / 2) ) + "px";

		RESUtils.fadeElementIn(gdAlert.container, 0.3);
		RESUtils.fadeElementIn(gdAlert.overlay, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'gdAlert');
	},

	close: function() {
		gdAlert.isOpen = false;

		RESUtils.fadeElementOut(gdAlert.container, 0.3);
		RESUtils.fadeElementOut(gdAlert.overlay, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'gdAlert');
	},
	makeButton: function(text){
		var btn = document.createElement('input');
		btn.setAttribute('type', 'button');
		btn.setAttribute('value', text);
		return btn;
	}
};

// overwrite the alert function
var alert = function(text, callback) {
	gdAlert.open(text, callback);
};

