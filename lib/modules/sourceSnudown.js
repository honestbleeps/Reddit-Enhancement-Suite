addModule('sourceSnudown', function(module, moduleID) {
	module.moduleName = 'Show Snudown Source';
	module.description = 'Add tool to show the original text on posts and comments, before reddit formats the text.';
	module.category = ['Comments'];
	module.include = [
		'comments',
		'inbox',
		'profile'
	];

	module.go = function() {
		if (module.isMatchURL() && module.isEnabled()) {
			$(document.body)
				.on('click', 'li.viewSource a', function(e) {
					e.preventDefault();
					viewSource(this);
				})
				.on('click', '.usertext-edit.viewSource .cancel', function() {
					$(this).parents('.usertext-edit.viewSource').hide();
				});

			attachViewSourceButtons();
			RESUtils.watchForElement('newComments', attachViewSourceButtons);
		}
	};

	function attachViewSourceButtons(entry) {
		if (RESUtils.pageType() === 'comments' || RESUtils.pageType() === 'inbox') {
			let $menus;

			if (RESUtils.pageType() === 'comments') {
				// entry may be undefined, as intended: undefined context => normal (global) selector
				$menus = $('.flat-list.buttons li.first', entry);
			} else {
				$menus = $('.flat-list.buttons a.bylink');
			}

			RESUtils.forEachChunked($menus, 30, 500, item => {
				$(item).closest('li').after('<li class="viewSource"><a class="noCtrlF" href="javascript:void 0" data-text="source"></a></li>');
			});
		}
	}

	const gettingSource = new Set();

	async function viewSource(button) {
		const $button = $(button);
		const $buttonList = $button.closest('ul');
		if ($button.data('source-open')) {
			$button
				.closest('.thing')
				.find('.usertext-edit.viewSource:first')
				.toggle();
		} else {
			const $permalink = $buttonList.find('a.bylink, .first a');
			const isSelfText = $permalink.is('.comments');
			const path = $permalink[0].pathname;
			const postID = (/\/(\w*)$/i).exec(path)[1];

			if (gettingSource.has(postID)) {
				return;
			}
			gettingSource.add(postID);

			const response = await RESEnvironment.ajax({
				url: `${path}.json`,
				data: { raw_json: 1 },
				type: 'json'
			});

			const $userTextForm = $('<div class="usertext-edit viewSource"><div><textarea rows="1" cols="1" name="text" readonly></textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div></div>');
			$userTextForm.find('textarea').bind('dblclick', function() {
				$(this).unbind('dblclick').removeAttr('readonly');
			});

			let sourceText;

			if (isSelfText) {
				sourceText = response[0].data.children[0].data.selftext;
			} else {
				if (response[1]) {
					sourceText = response[1].data.children[0].data.body;
				} else {
					const data = response.data.children[0].data;
					if (data.id === postID) {
						sourceText = data.body;
					} else {
						// The message we want is a reply to a PM/modmail, but reddit returns the whole thread.
						// So, we have to dig into the replies to find the message we want.
						data.replies.data.children.some(({ data: { id, body } }) => {
							if (id === postID) {
								sourceText = body;
								return true;
							}
						});
					}
				}
			}

			$userTextForm.find('textarea[name=text]').text(sourceText);
			$buttonList.before($userTextForm);
			$(button).data('source-open', true);
		}
	}
});
