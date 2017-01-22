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
	const $body = $('body');

	if (module.options.placeholderDraftOnBlur.value) {
		$body.on({
			focus: onFocus,
			blur: onBlur
		}, '.usertext .usertext-edit textarea');
	}
};

function onFocus(e) {
	const $textarea = $(e.currentTarget);
	$textarea.val($textarea.attr('placeholder'));
}

function onBlur(e) {
	const $textarea = $(e.currentTarget);
	$textarea.attr('placeholder', $textarea.val());
	$textarea.val('');
}
