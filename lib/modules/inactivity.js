/* @flow */

import { Module } from '../core/module';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('inactivity');

module.moduleName = 'inactivityName';
module.category = 'productivityCategory';
module.description = 'inactivityDesc';
module.disabledByDefault = true;
module.options = {
	timeout: {
		type: 'text',
		value: '300',
		description: 'inactivityTimeoutDesc',
		title: 'inactivityTimeoutTitle',
	},
};

module.beforeLoad = () => {
	inactivity();
};

function inactivity() {
	let time;
	window.onload = resetTimer;
	/* $FlowIgnore[1] */
	document.onmousemove = resetTimer;
	/* $FlowIgnore[1] */
	document.onkeydown = resetTimer;

	function notify() {
		Notifications.showNotification({
			header: 'Inactivity',
			message: 'You\'ve gone inactive!',
			moduleID: module.moduleID,
			notificationID: 'inactivity',
			closeDelay: Infinity,
		});

		if (!document.getElementsByClassName('res-inactive').length) {
			const div = document.createElement('div');
			div.setAttribute('class', 'res-inactive');
			div.setAttribute('style', 'background-color: rgba(0,0,0,0.5); width: auto; height: auto; top: 0; right: 0; bottom: 0; left: 0; padding: 1em; z-index: 101; position: fixed; overflow: hidden;');
			div.addEventListener('click', (e: Event) => {
				e.preventDefault();
				/* $FlowIgnore[1] */
				div.parentNode.removeChild(div);
			});
			document.body.appendChild(div);
		}
	}

	function resetTimer() {
		clearTimeout(time);
		time = setTimeout(() => {
			notify();
		}, parseInt(module.options.timeout.value, 10) / 1000);
	}
}
