/* @flow */

import { Module } from '../core/module';
import { ajax } from '../environment';
import { watchForThings, regexes, keyedMutex, preventCloning, string } from '../utils';
import _ from 'lodash';
import $ from 'jquery';

export const module: Module<*> = new Module('sourceSnudown');

module.moduleName = 'sourceSnudownName';
module.description = 'sourceSnudownDesc';
module.category = 'commentsCategory';

module.beforeLoad = () => {
	watchForThings(['post', 'comment', 'message'], attachViewSourceButton);
};

const sourceButton = (e => () => preventCloning(e().cloneNode(true)))(_.once(() => {
	$(document.body)
		.on('click', 'li.viewSource a', function(e: Event) {
			e.preventDefault();
			viewSource(this);
		})
		.on('click', '.usertext-edit.viewSource .cancel', function() {
			$(this).parents('.usertext-edit.viewSource').hide();
		});

	return string.html`
		<li class="viewSource">
			<a class="noCtrlF" href="javascript:void 0" data-text="source"></a>
		</li>
	`;
}));

function attachViewSourceButton(thing) {
	// Link posts don't have any source
	if (thing.isLinkPost()) return;

	const buttons =
		// .first is the first button after NSFW/spoiler stamps
		thing.entry.querySelector('.flat-list.buttons > li.first') ||
		// but some pages (inbox) don't have the .first class
		thing.entry.querySelector('.flat-list.buttons > li');
	if (buttons) buttons.after(sourceButton());
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
			query: { raw_json: 1 },
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
			const postId: string = ((/\/(\w*)\/?$/).exec(path): any)[1];
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
