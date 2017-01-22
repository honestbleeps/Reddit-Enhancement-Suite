import _ from 'lodash';
import { $ } from '../vendor';
import {
	Alert,
	Thing,
	checkKeysForEvent,

} from '../utils';

export const module = {};

module.moduleID = 'draft';
module.moduleName = 'draftName';
module.category = ['Comments'];
module.description = 'draftDescription',
module.options = {
	promptOnLeave: {
		title: 'draftPromptOnLeaveTitle'
		type: 'boolean',
		value: true,
		description: 'draftPromptOnLeaveDescription'
	}
};

module.include = [
	'comments',
	'inbox',
];


module.go = function() {
	$(document.body).on({
		focus: onFocus,
		blur: onBlur
	}, '.usertext-edit textarea');
};

function onFocus(e: Event) {
	const $textarea = $(e.currentTarget);
	if (!module.options.promptOnLeave.value) {
		$textarea.val($textarea.attr('placeholder'));
	}
}

function onBlur(e: Event) {
	const $textarea = $(e.currentTarget);
	if (!module.options.promptOnLeave.value) {
		$textarea.attr('placeholder', $textarea.val());
		$textarea.val($textarea[0].defaultValue);
	}
}
