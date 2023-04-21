/* @flow */
import $ from 'jquery';
import { Module } from '../core/module';
import { checkKeysForEvent, click } from '../utils';

export const module: Module<*> = new Module('submissionShortcuts');

module.moduleName = 'submissionShortcutsName';
module.category = 'submissionsCategory';
module.description = 'submissionShurtcutsDesc';
module.options = {
	markSpammed: {
		type: 'keycode',
		value: [70, true, false, false, false], // alt-f
		description: 'submissionShortcutsMarkSpammedDesc',
		title: 'submissionShortcutsMarkSpammedTitle',
		mustBeLoggedIn: true,
		buttonSelector: '.icon-spam',
	},
	remove: {
		type: 'keycode',
		value: [68, true, false, false, false], // alt-d
		description: 'submissionShortcutsRemoveDesc',
		title: 'submissionShortcutsRemoveTitle',
		mustBeLoggedIn: true,
		buttonSelector: '.icon-remove',
	},
	markApproved: {
		type: 'keycode',
		value: [63, true, false, false, false], // alt-s
		description: 'submissionShortcutsMarkApprovedDesc',
		title: 'submissionShortcutsMarkApprovedTitle',
		mustBeLoggedIn: true,
		buttonSelector: '.icon-approve',
	},

};

module.contentStart = () => {
	const optionValues = Object.values(module.options);

	$(document.body).on('keydown', (e: KeyboardEvent) => {
		optionValues.forEach(shortcut => {
			if (checkKeysForEvent(e, shortcut.value)) {
				const iconElement = document.querySelector(`:focus ${shortcut.buttonSelector}`);

				if (iconElement) {
					click(iconElement.parentNode);
				}
			}
		});
	});
};
