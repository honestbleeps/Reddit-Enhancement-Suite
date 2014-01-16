// Create a nice alert function...
var gdAlert = {
	container: false,
	overlay: "",

	init: function(callback) {
		//init
		var alertCSS = '#alert_message { ' +
			'display: none;' +
			'opacity: 0.0;' +
			'background-color: #EFEFEF;' +
			'border: 1px solid black;' +
			'color: black;' +
			'font-size: 10px;' +
			'padding: 20px;' +
			'padding-left: 60px;' +
			'padding-right: 60px;' +
			'position: fixed!important;' +
			'position: absolute;' +
			'width: 400px;' +
			'float: left;' +
			'z-index: 1000000201;' +
			'text-align: left;' +
			'left: auto;' +
			'top: auto;' +
			'}' +
			'#alert_message .button {' +
			'border: 1px solid black;' +
			'font-weight: bold;' +
			'font-size: 10px;' +
			'padding: 4px;' +
			'padding-left: 7px;' +
			'padding-right: 7px;' +
			'float: left;' +
			'background-color: #DFDFDF;' +
			'cursor: pointer;' +
			'}' +
			'#alert_message span {' +
			'display: block;' +
			'margin-bottom: 15px;	' +
			'}' +
			'#alert_message_background {' +
			'position: fixed; top: 0; left: 0; bottom: 0; right: 0;' +
			'background-color: #333333; z-index: 100000200;' +
			'}';

		RESUtils.addStyle(alertCSS);

		gdAlert.populateContainer(callback);
	},

	populateContainer: function(callback) {
		gdAlert.container = createElementWithID('div', 'alert_message');
		gdAlert.container.appendChild(document.createElement('span'));

		var closeButton;
		if (typeof callback === 'function') {
			this.okButton = document.createElement('input');
			this.okButton.setAttribute('type', 'button');
			this.okButton.setAttribute('value', 'confirm');
			this.okButton.addEventListener('click', callback, false);
			this.okButton.addEventListener('click', gdAlert.close, false);

			closeButton = document.createElement('input');
			closeButton.setAttribute('type', 'button');
			closeButton.setAttribute('value', 'cancel');
			closeButton.addEventListener('click', gdAlert.close, false);

			gdAlert.container.appendChild(this.okButton);
			gdAlert.container.appendChild(closeButton);
		} else {
			/* if (this.okButton) {
				gdAlert.container.removeChild(this.okButton);
				delete this.okButton;
			} */
			closeButton = document.createElement('input');
			closeButton.setAttribute('type', 'button');
			closeButton.setAttribute('value', 'ok');
			closeButton.addEventListener('click', gdAlert.close, false);

			gdAlert.container.appendChild(closeButton);
		}
		var br = document.createElement('br');
		br.setAttribute('style', 'clear: both');
		gdAlert.container.appendChild(br);
		document.body.appendChild(gdAlert.container);
	},
	open: function(text, callback) {
		if (gdAlert.isOpen) {
			return;
		}
		gdAlert.isOpen = true;
		gdAlert.populateContainer(callback);

		//set message
		// gdAlert.container.getElementsByTagName("SPAN")[0].innerHTML = text;
		$(gdAlert.container.getElementsByTagName("SPAN")[0]).html(text);
		gdAlert.container.getElementsByTagName("INPUT")[0].focus();
		gdAlert.container.getElementsByTagName("INPUT")[0].focus();

		//create site overlay
		gdAlert.overlay = createElementWithID("div", "alert_message_background");
		document.body.appendChild(gdAlert.overlay);

		// center messagebox (requires prototype functions we don't have, so we'll redefine...)
		// var arrayPageScroll = document.viewport.getScrollOffsets();
		// var winH = arrayPageScroll[1] + (document.viewport.getHeight());
		// var lightboxLeft = arrayPageScroll[0];
		var arrayPageScroll = [document.documentElement.scrollLeft, document.documentElement.scrollTop];
		var winH = arrayPageScroll[1] + (window.innerHeight);
		var lightboxLeft = arrayPageScroll[0];

		gdAlert.container.style.top = ((winH / 2) - 90) + "px";
		gdAlert.container.style.left = ((gdAlert.getPageSize()[0] / 2) - 155) + "px";

		/*
		new Effect.Appear(gdAlert.container, {duration: 0.2});
		new Effect.Opacity(gdAlert.overlay, {duration: 0.2, to: 0.8});
		*/
		RESUtils.fadeElementIn(gdAlert.container, 0.3);
		RESUtils.fadeElementIn(gdAlert.overlay, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'gdAlert');
	},

	close: function() {
		gdAlert.isOpen = false;
		/*
		new Effect.Fade(gdAlert.container, {duration: 0.3});
		new Effect.Fade(gdAlert.overlay, {duration: 0.3, afterFinish: function() {
			document.body.removeChild(gdAlert.overlay);
		}});	
		*/
		RESUtils.fadeElementOut(gdAlert.container, 0.3);
		RESUtils.fadeElementOut(gdAlert.overlay, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'gdAlert');
	},

	getPageSize: function() {
		var xScroll, yScroll;
		if (window.innerHeight && window.scrollMaxY) {
			xScroll = window.innerWidth + window.scrollMaxX;
			yScroll = window.innerHeight + window.scrollMaxY;
		} else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
			xScroll = document.body.scrollWidth;
			yScroll = document.body.scrollHeight;
		} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
			xScroll = document.body.offsetWidth;
			yScroll = document.body.offsetHeight;
		}

		var windowWidth, windowHeight;

		if (self.innerHeight) { // all except Explorer
			if (document.documentElement.clientWidth) {
				windowWidth = document.documentElement.clientWidth;
			} else {
				windowWidth = self.innerWidth;
			}
			windowHeight = self.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
			windowWidth = document.documentElement.clientWidth;
			windowHeight = document.documentElement.clientHeight;
		} else if (document.body) { // other Explorers
			windowWidth = document.body.clientWidth;
			windowHeight = document.body.clientHeight;
		}

		// for small pages with total height less then height of the viewport
		if (yScroll < windowHeight) {
			pageHeight = windowHeight;
		} else {
			pageHeight = yScroll;
		}

		// for small pages with total width less then width of the viewport
		if (xScroll < windowWidth) {
			pageWidth = xScroll;
		} else {
			pageWidth = windowWidth;
		}
		return [pageWidth, pageHeight];
	}
};

//overwrite the alert function
var alert = function(text, callback) {
	if (gdAlert.container === false) {
		gdAlert.init(callback);
	}
	gdAlert.open(text, callback);
};

