/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { ajax } from '../environment';
import { watchForThings, isPageType, regexes, keyedMutex } from '../utils';

export const module: Module<*> = new Module('sourceSnudown');

module.moduleName = 'sourceSnudownName';
module.description = 'sourceSnudownDesc';
module.category = 'commentsCategory';

module.beforeLoad = () => {
	watchForThings(['post', 'comment', 'message'], attachViewSourceButton);
};

const addSourceButtonListener = _.once(() => {
	$(document.body)
		.on('click', 'li.viewSource a', function(e: Event) {
			e.preventDefault();
			viewSource(this);
		})
		.on('click', '.usertext-edit.viewSource .cancel', function() {
			$(this).parents('.usertext-edit.viewSource').hide();
		});
});

function attachViewSourceButton(thing) {
	// Link posts don't have any source
	if (thing.isLinkPost()) return;

	addSourceButtonListener();

	$(thing.entry)
		.find(isPageType('inbox') ? '.flat-list a.bylink:first' : '.flat-list.buttons li.first:first')
		.closest('li')
		.after('<li class="viewSource"><a class="noCtrlF" href="javascript:void 0" data-text="source"></a></li>');
}

const viewSource = keyedMutex(async button => {
	const $button = $(button);
	const $buttonList = $button.closest('ul');
	if ($button.data('source-open')) {
		$button
			.closest('.thing')
			.find('.usertext-edit.viewSource:first')
			.toggle();
	} else {
		const path = ($buttonList.find('a.bylink, .first a').get(0): any).pathname;

		const response = await ajax({
			url: `${path}.json`,
			data: { raw_json: 1 },
			type: 'json',
		});

		const $userTextForm = $('<div class="usertext-edit viewSource"><div><textarea rows="1" cols="1" name="text" readonly></textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div></div>');
		$userTextForm.find('textarea').one('dblclick', () => $userTextForm.removeAttr('readonly'));

		let sourceText;

		if (regexes.commentPermalink.test(path)) {
			sourceText = response[1].data.children[0].data.body;
		} else if (regexes.comments.test(path)) {
			sourceText = response[0].data.children[0].data.selftext;
		} else {
			const postId = (/\/(\w*)\/?$/).exec(path)[1];
			const data = response.data.children[0].data;
			if (data.id === postId) {
				sourceText = data.body;
			} else {
				// The message we want is a reply to a PM/modmail, but reddit returns the whole thread.
				// So, we have to dig into the replies to find the message we want.
				sourceText = data.replies.data.children.find(({ data: { id } }) => id === postId).data.body;
			}
		}

		$userTextForm.find('textarea[name=text]').text(sourceText);
		$buttonList.before($userTextForm);
		$(button).data('source-open', true);
	}
});
