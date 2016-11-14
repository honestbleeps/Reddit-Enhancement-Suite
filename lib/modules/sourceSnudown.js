import { $ } from '../vendor';
import { ajax } from '../environment';
import { forEachChunked, isPageType, watchForElement, regexes, keyedMutex } from '../utils';

export const module = {};

module.moduleID = 'sourceSnudown';
module.moduleName = 'sourceSnoodownName';
module.description = 'sourceSnoodownDesc';
module.category = 'commentsCategory';
module.include = [
	'comments',
	'commentsLinklist',
	'inbox',
	'profile',
];

module.go = () => {
	$(document.body)
		.on('click', 'li.viewSource a', function(e) {
			e.preventDefault();
			viewSource(this);
		})
		.on('click', '.usertext-edit.viewSource .cancel', function() {
			$(this).parents('.usertext-edit.viewSource').hide();
		});

	attachViewSourceButtons();
	watchForElement('newComments', attachViewSourceButtons);
};

function attachViewSourceButtons(entry) {
	if (isPageType('comments', 'commentsLinklist', 'inbox')) {
		let $menus;

		if (isPageType('comments', 'commentsLinklist')) {
			// entry may be undefined, as intended: undefined context => normal (global) selector
			$menus = $('.flat-list.buttons li.first', entry);
		} else {
			$menus = $('.flat-list.buttons a.bylink');
		}

		$menus::forEachChunked(item => {
			const $item = $(item).closest('li');
			if ($item.siblings('li.viewSource').length) return; // guard against adding "source" button multiple times for whatever buggy reason
			$item.after('<li class="viewSource"><a class="noCtrlF" href="javascript:void 0" data-text="source"></a></li>');
		});
	}
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
		const path = $buttonList.find('a.bylink, .first a').get(0).pathname;

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
