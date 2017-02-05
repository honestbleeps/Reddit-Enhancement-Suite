/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { mutex } from '../utils';

const $container = _.once(() => $('<div>', { id: 'alert_message' }).appendTo(document.body));
const $overlay = _.once(() => $('<div>', { id: 'alert_message_background' }).appendTo(document.body));

export const open = mutex((text: string, { cancelable = false }: { cancelable?: boolean } = {}): Promise<void> => new Promise((resolve, reject) => {
	function confirm() {
		resolve();
		close();
	}

	function cancel() {
		reject(new Error('User cancelled alert.'));
		close();
	}

	function close() {
		$(document.body).off('keyup', listenForEscape);
		$container().hide();
		$overlay().hide();
	}

	function listenForEscape(e: KeyboardEvent) {
		if (e.keyCode === 27) {
			if (cancelable) cancel();
			else confirm();
		}
	}

	$(document.body).on('keyup', listenForEscape);

	$overlay().show();

	$container()
		.empty()
		.append($('<div>', { html: text }))
		.show();

	if (cancelable) {
		$(makeButton('confirm', 'button-right'))
			.click(confirm)
			.appendTo($container());

		$(makeButton('cancel', 'button-right'))
			.click(cancel)
			.appendTo($container())
			.focus();
	} else {
		$(makeButton('ok'))
			.click(confirm)
			.appendTo($container())
			.focus();
	}
}));

export function makeButton(text: string, cls?: string) {
	const btn = document.createElement('input');
	btn.setAttribute('type', 'button');
	btn.setAttribute('value', text);
	if (cls) {
		btn.classList.add(cls);
	}
	return btn;
}
