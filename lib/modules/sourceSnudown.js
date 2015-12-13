addModule('sourceSnudown', function(module, moduleID) {
	module.moduleName = 'Show Snudown Source';
	module.description = 'Add tool to show the original text on posts and comments, before reddit formats the text.';
	module.category = ['Comments', 'Submissions'];
	module.include = [
		'comments',
		'inbox',
		'profile'
	];

	module.beforeLoad = function() {
		if (module.isMatchURL() && module.isEnabled()) {
			RESUtils.addCSS('.viewSource>.bottom-area:before{ display:none; }');
			RESUtils.addCSS('.viewSource textarea{ background:repeating-linear-gradient(-225deg, transparent, transparent 40px, rgba(166,166,166,.05) 40px, rgba(166,166,166,.05) 80px), white; }');
			RESUtils.addCSS('.viewSource textarea[readonly]{ background:repeating-linear-gradient(-225deg, transparent, transparent 40px, rgba(166,166,166,.1) 40px, rgba(166,166,166,.1) 80px), white; }');
		}
	};

	module.go = function() {
		if (module.isMatchURL() && module.isEnabled()) {
			$(document.body).on('click', 'li.viewSource a', function(e) {
				e.preventDefault();
				viewSource(this);
			}).on('click', '.usertext-edit.viewSource .cancel', function() {
				$(this).parents('.usertext-edit.viewSource').hide();
			});


			attachViewSourceButtons();
			RESUtils.watchForElement('newComments', attachViewSourceButtons);
		}
	};

	var gettingSource = {};

	function attachViewSourceButtons(entry) {
		if (RESUtils.pageType() === 'comments' || RESUtils.pageType() === 'inbox') {
			var menus;

			if (RESUtils.pageType() === 'comments') {
				if (entry) {
					menus = $(entry).find('.flat-list.buttons li.first');
				} else {
					menus = $('.flat-list.buttons li.first');
				}
			} else {
				menus = $('.flat-list.buttons a.bylink');
			}
			RESUtils.forEachChunked(menus, 30, 500, function(item, i, array) {
				$(item).closest('li').after('<li class="viewSource"><a class="noCtrlF" href="javascript:void 0" data-text="source"></a></li>');
			});
		}
	}
	function viewSource(button) {
		var $buttonList = $(button).closest('ul');
		if ($(button).data('source-open')) {
			var $sourceDiv = $(button).closest('.thing').find('.usertext-edit.viewSource:first');
			$sourceDiv.toggle();
		} else {
			var $permaLink = $buttonList.find('a.bylink, .first a');
			var jsonURL = $permaLink.attr('href');
			var urlSplit = jsonURL.split('/');
			var postID = urlSplit[urlSplit.length - 1];

			var isSelfText = $permaLink.is('.comments');
			if (jsonURL.indexOf('?context') !== -1) {
				jsonURL = jsonURL.replace('?context=3', '.json?');
			} else {
				jsonURL += '/.json';
			}

			jsonURL = RESUtils.insertParam(jsonURL, 'raw_json', '1');

			if (gettingSource[postID]) {
				return;
			}
			gettingSource[postID] = true;

			RESEnvironment.ajax({
				method: 'GET',
				url: jsonURL,
				onload: function(response) {
					var thisResponse = JSON.parse(response.responseText),
						sourceText = null,
						$userTextForm = $('<div class="usertext-edit viewSource"><div><textarea rows="1" cols="1" name="text" readonly></textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div></div>');
					$userTextForm.find('textarea').bind('dblclick', function() {
						$(this).unbind('dblclick');
						$(this).removeAttr('readonly');
					});
					if (!isSelfText) {
						if (typeof thisResponse[1] !== 'undefined') {
							sourceText = thisResponse[1].data.children[0].data.body;
						} else {
							var thisData = thisResponse.data.children[0].data;
							if (thisData.id === postID) {
								sourceText = thisData.body;
							} else {
								// The message we want is a reply to a PM/modmail, but reddit returns the whole thread.
								// So, we have to dig into the replies to find the message we want.
								for (var i = 0, len = thisData.replies.data.children.length; i < len; i++) {
									var replyData = thisData.replies.data.children[i].data;
									if (replyData.id === postID) {
										sourceText = replyData.body;
										break;
									}
								}
							}
						}
					} else {
						sourceText = thisResponse[0].data.children[0].data.selftext;
					}
					$userTextForm.find('textarea[name=text]').text(sourceText);
					$buttonList.before($userTextForm);
					$(button).data('source-open',true);
				}
			});
		}
	}

});
