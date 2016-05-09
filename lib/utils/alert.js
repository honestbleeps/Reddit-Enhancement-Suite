import { $ } from '../vendor';

let container = false;
let overlay = false;
let isOpen = false;

function populateContainer(callback) {
	if (container !== false) {
		container.innerHTML = '';
	} else {
		container = $('<div>', { id: 'alert_message' }).get(0);
	}

	// Add text area
	container.appendChild(document.createElement('div'));

	let closeButton;
	if (typeof callback === 'function') {
		const okButton = makeButton('confirm', 'button-right');
		okButton.addEventListener('click', callback, false);
		okButton.addEventListener('click', close, false);

		closeButton = makeButton('cancel', 'button-right');
		closeButton.addEventListener('click', close, false);

		container.appendChild(okButton);
		container.appendChild(closeButton);
	} else {
		closeButton = makeButton('Ok');
		closeButton.addEventListener('click', close, false);

		container.appendChild(closeButton);
	}
	document.body.appendChild(container);

	// Focus on cancel/okay button, so user can click enter to close
	setTimeout(() => closeButton.focus(), 0);
}

export function open(text, callback) {
	if (isOpen) {
		return;
	}
	$('body').on('keyup', listenForEscape);

	isOpen = true;
	populateContainer(callback);

	// Set message
	$(container.getElementsByTagName('div')[0]).html(text);
	container.getElementsByTagName('input')[0].focus();

	// create site overlay
	if (overlay === false) {
		overlay = $('<div>', { id: 'alert_message_background' }).get(0);
		document.body.appendChild(overlay);
	}

	$(overlay).show();
	$(container).show();
}

function listenForEscape(e) {
	if (e.keyCode === 27) {
		close();
	}
}

function close() {
	$('body').off('keyup', listenForEscape);
	isOpen = false;

	$(container).hide();
	$(overlay).hide();
}

export function makeButton(text, cls) {
	const btn = document.createElement('input');
	btn.setAttribute('type', 'button');
	btn.setAttribute('value', text);
	if (typeof cls !== 'undefined') {
		btn.classList.add(cls);
	}
	return btn;
}
